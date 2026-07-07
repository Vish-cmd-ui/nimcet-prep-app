import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

function parseRawText(text: string) {
  // If it's JSON, try parsing it directly
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json.map(q => ({
        question_text: q.question_text || q.question || '',
        options: q.options || [],
        correct_option: q.correct_option || q.answer || '',
        explanation: q.explanation || null,
        difficulty: q.difficulty || null,
        source: 'pyq',
        pyq_year: q.pyq_year || null
      }));
    }
  } catch (e) {
    // Not valid JSON, proceed to raw text parsing
  }

  // Basic regex parser for blocks separated by double newlines or similar
  const questions = [];
  // Split by number followed by dot (e.g., "1. ", "2. ")
  const blocks = text.split(/(?=\n\s*\d+\.\s+)/).filter(b => b.trim());

  for (const block of blocks) {
    let question_text = '';
    let options: string[] = [];
    let correct_option = '';
    let explanation = '';

    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    
    // Extract question text
    const qMatch = lines[0].match(/^\d+\.\s+(.*)/);
    if (qMatch) {
      question_text = qMatch[1];
    } else {
      question_text = lines[0]; // fallback
    }

    let i = 1;
    while (i < lines.length) {
      const line = lines[i];
      if (/^[A-D][\.\)]\s/.test(line)) {
        options.push(line.replace(/^[A-D][\.\)]\s+/, '').trim());
      } else if (line.toLowerCase().startsWith('answer:')) {
        correct_option = line.replace(/answer:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('explanation:')) {
        explanation = line.replace(/explanation:\s*/i, '').trim();
      } else if (options.length === 0 && !correct_option) {
        // Multi-line question text
        question_text += '\n' + line;
      }
      i++;
    }

    if (question_text && options.length > 0) {
      questions.push({
        question_text,
        options,
        correct_option,
        explanation: explanation || null,
        difficulty: null,
        pyq_year: null,
        source: 'pyq'
      });
    }
  }

  return questions;
}

export async function POST(req: Request) {
  try {
    const { rawText } = await req.json();
    if (!rawText) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const parsedQuestions = parseRawText(rawText);

    if (parsedQuestions.length === 0) {
      return NextResponse.json({ error: 'Could not parse any questions' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('questions').insert(parsedQuestions as any[]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: parsedQuestions.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
