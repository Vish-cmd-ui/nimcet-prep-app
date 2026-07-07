/**
 * NIMCET PYQ Extractor — NVIDIA Nemotron (Llama 3.1 70B)
 * ========================================================
 * Reads 2020–2023 PDFs from the PYQ folder, splits each into 30 text
 * chunks, and calls NVIDIA API to extract structured MCQ data, then inserts
 * into Supabase.
 *
 * Features:
 *  ✅ Checkpoint / resume  (safe to Ctrl+C and restart)
 *  ✅ Rate-limit handling  (auto-sleep on 429)
 *  ✅ Per-run log file     (scripts/logs/)
 *  ✅ Dry-run mode         (--dry-run flag, no DB writes)
 *
 * Usage:
 *   node scripts/process_nemotron.js              # all years 2020-2023
 *   node scripts/process_nemotron.js 2021         # single year
 *   node scripts/process_nemotron.js --dry-run    # test, no DB writes
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const pdf  = require('pdf-parse');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// ───────────────────────── CONFIG ─────────────────────────────────────────────
const NEMOTRON_API_KEY = process.env.GLM_API_KEY || process.env.NEMOTRON_API_KEY;
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PYQ_DIR          = '/Users/vishwas/Documents/NIMCET APP/PYQ';
const CHECKPOINT_FILE  = path.join(__dirname, 'checkpoint.json');
const LOG_DIR          = path.join(__dirname, 'logs');

const YEARS            = [2020, 2021, 2022, 2023];
const CHUNKS_PER_YEAR  = 30;
const MODEL            = 'meta/llama-3.1-70b-instruct';

// Llama API limits might be tight; wait 3.5s to be safe between calls
const DELAY_MS         = 3500;
const RETRY_DELAY_MS   = 15000;
const MAX_RETRIES      = 4;

const DRY_RUN          = process.argv.includes('--dry-run');
const YEAR_ARG         = process.argv.find(a => /^\d{4}$/.test(a));
const YEARS_TO_RUN     = YEAR_ARG ? [parseInt(YEAR_ARG)] : YEARS;
// ──────────────────────────────────────────────────────────────────────────────

// ── Bootstrap ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const logPath = path.join(LOG_DIR, `run-nemotron-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`);

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logPath, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Checkpoint ────────────────────────────────────────────────────────────────
function loadCp()  { try { return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8')); } catch { return {}; } }
function saveCp(c) { fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(c, null, 2)); }

// ── Supabase ──────────────────────────────────────────────────────────────────
async function fetchTaxonomy() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/topics?select=id,subject,chapter,subtopic&order=subject`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!r.ok) throw new Error(`Taxonomy fetch failed: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows.map(t => `${t.id} | ${t.subject} > ${t.chapter} > ${t.subtopic}`).join('\n');
}

async function insertBatch(questions) {
  if (DRY_RUN) { log(`  [DRY-RUN] Would insert ${questions.length} rows`); return questions.length; }
  let ok = 0;
  for (const q of questions) {
    const row = {
      question_text:  q.question_text,
      options:        q.options,
      correct_option: q.correct_option ?? 'Unknown',
      topic_id:       q.topic_id   || null,
      difficulty:     q.difficulty || 'Level 2',
      source:         'pyq'
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (res.ok) { ok++; }
    else { log(`  ⚠ Insert error: ${(await res.text()).slice(0, 120)}`); }
  }
  return ok;
}

// ── Text splitting ─────────────────────────────────────────────────────────────
function splitIntoChunks(text, n) {
  const size = Math.ceil(text.length / n);
  const chunks = [];
  for (let i = 0; i < n; i++) {
    const slice = text.slice(i * size, (i + 1) * size);
    if (slice.trim()) chunks.push(slice);
  }
  return chunks;
}

// ── Nemotron (NVIDIA Llama) call ───────────────────────────────────────────────
async function extractFromChunk(chunkText, taxonomyString, attempt = 0) {
  const prompt = `You are an expert MCQ extractor for NIMCET (Indian MCA entrance exam).

Extract ALL multiple-choice questions from the text below.
Output a JSON array only — no markdown, no explanation.

Each item MUST have exactly these keys:
  "question_text"  – full question string (preserve math symbols)
  "options"        – array of exactly 4 strings: ["A. ...", "B. ...", "C. ...", "D. ..."]
  "correct_option" – "A", "B", "C", or "D"  (solve it if not stated)
  "topic_id"       – best-match UUID from the taxonomy list below, or null
  "difficulty"     – "Level 1" (easy), "Level 2" (medium), or "Level 3" (hard)

NIMCET TOPIC TAXONOMY (use the UUID exactly):
${taxonomyString}

TEXT TO EXTRACT FROM:
${chunkText}

Return [] if this chunk has no questions. Output ONLY valid JSON array.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEMOTRON_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429 && attempt < MAX_RETRIES) {
        log(`  ⏳ Rate-limited (429) — waiting ${RETRY_DELAY_MS / 1000}s (retry ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY_MS);
        return extractFromChunk(chunkText, taxonomyString, attempt + 1);
      }
      throw new Error(`API Error ${response.status}: ${errText.substring(0, 100)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Strip markdown formatting if any
    const jsonStr = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    if (!jsonStr || jsonStr === '[]') return [];
    return JSON.parse(jsonStr);

  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.message || String(err);

    if (err.name === 'AbortError' && attempt < MAX_RETRIES) {
      log(`  ⏳ Timeout after 90s — waiting 5s (retry ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(5000);
      return extractFromChunk(chunkText, taxonomyString, attempt + 1);
    }

    if (attempt < MAX_RETRIES && !msg.includes('429')) {
      log(`  ⚠ Error "${msg.slice(0, 80)}" — retrying in 5s`);
      await sleep(5000);
      return extractFromChunk(chunkText, taxonomyString, attempt + 1);
    }

    log(`  ❌ Giving up on chunk: ${msg.slice(0, 120)}`);
    return [];
  }
}

// ── Process one year ──────────────────────────────────────────────────────────
async function processYear(year, taxonomyString, cp) {
  const pdfPath = path.join(PYQ_DIR, `${year}.pdf`);
  if (!fs.existsSync(pdfPath)) { log(`⚠ PDF not found: ${pdfPath}`); return; }

  log(`\n${'═'.repeat(58)}`);
  log(`📄  NIMCET ${year}  |  file: ${path.basename(pdfPath)}`);
  log(`${'═'.repeat(58)}`);

  // Parse PDF text
  const buffer  = fs.readFileSync(pdfPath);
  const parsed  = await pdf(buffer);
  const text    = parsed.text;
  log(`   Pages: ${parsed.numpages}  |  Characters: ${text.length.toLocaleString()}`);

  const chunks  = splitIntoChunks(text, CHUNKS_PER_YEAR);
  log(`   Actual chunks: ${chunks.length}`);

  let yearExtracted = 0, yearInserted = 0;

  for (let i = 0; i < chunks.length; i++) {
    const key = `${year}_chunk_${i}`;
    if (cp[key] === 'done') {
      process.stdout.write(`   ✅ Chunk ${String(i + 1).padStart(2)} — already done\n`);
      continue;
    }

    process.stdout.write(`   🔄 Chunk ${String(i + 1).padStart(2)}/${chunks.length} ... `);

    const questions = await extractFromChunk(chunks[i], taxonomyString);
    yearExtracted += questions.length;
    process.stdout.write(`extracted ${questions.length} Qs`);

    if (questions.length > 0) {
      const ins = await insertBatch(questions);
      yearInserted += ins;
      process.stdout.write(` → inserted ${ins}\n`);
    } else {
      process.stdout.write(` → skipped\n`);
    }

    cp[key] = 'done';
    saveCp(cp);

    if (i < chunks.length - 1) await sleep(DELAY_MS);
  }

  log(`\n   ✅ Year ${year} done — Extracted: ${yearExtracted}  Inserted: ${yearInserted}`);
  return { yearExtracted, yearInserted };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════════╗');
  log('║    NIMCET PYQ Processor  ·  NVIDIA (Llama 3.1 70B)  ║');
  log('╚══════════════════════════════════════════════════════╝');
  log(`Years : ${YEARS_TO_RUN.join(', ')}`);
  log(`Model : ${MODEL}`);
  log(`Chunks: ${CHUNKS_PER_YEAR} per year  |  Delay: ${DELAY_MS}ms`);
  log(`Mode  : ${DRY_RUN ? '🟡 DRY RUN (no DB writes)' : '🟢 LIVE'}`);
  log(`Log   : ${logPath}`);

  if (!NEMOTRON_API_KEY) { log('❌  NEMOTRON_API_KEY not set in .env.local'); process.exit(1); }
  if (!SUPABASE_URL)     { log('❌  NEXT_PUBLIC_SUPABASE_URL not set');     process.exit(1); }

  log('\n📡 Fetching topic taxonomy...');
  const taxonomyString = await fetchTaxonomy();
  log(`   Loaded ${taxonomyString.split('\n').length} topics ✅`);

  const cp = loadCp();
  const done = Object.values(cp).filter(v => v === 'done').length;
  if (done > 0) log(`📌 Resuming — ${done} chunks already complete`);

  let totalExtracted = 0, totalInserted = 0;
  const startTime = Date.now();

  for (const year of YEARS_TO_RUN) {
    const result = await processYear(year, taxonomyString, cp);
    if (result) {
      totalExtracted += result.yearExtracted;
      totalInserted  += result.yearInserted;
    }
    if (YEARS_TO_RUN.indexOf(year) < YEARS_TO_RUN.length - 1) {
      log(`\n⏸  Pausing 10s between years...`);
      await sleep(10000);
    }
  }

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  log('\n╔══════════════════════════════════════════════════════╗');
  log(`║  🎉  ALL DONE in ${elapsed} min`);
  log(`║  Total extracted : ${totalExtracted}`);
  log(`║  Total inserted  : ${totalInserted}`);
  log('╚══════════════════════════════════════════════════════╝');
}

main().catch(err => { log(`\n💥  Fatal: ${err.message}`); process.exit(1); });
