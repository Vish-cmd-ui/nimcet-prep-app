const fs = require('fs');

const csv = fs.readFileSync('../maths - Sheet1.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim().length > 0).slice(1);

const mappings = {
  "Sets, Relations & Functions": "Functions and Relations",
  "Quadratic Equations": "Quadratic equations, roots & coefficients",
  "Sequence & Series (A.P., G.P.)": "Progressions (arithmetic, geometric, harmonic)",
  "Matrices & Determinants": "Matrices & determinants, linear equations",
  "Permutations & Combinations": "Permutations & Combinations, Binomial Theorem",
  "Binomial Theorem": "Permutations & Combinations, Binomial Theorem",
  "Logarithms": "Indices, logarithms, exponentials",
  "Straight Lines": "Cartesian coordinates, lines, intersection",
  "Limits & Continuity": "Limits, continuity, intermediate value theorem",
  "Indefinite Integration": "Integration (parts, substitution, partial fraction)",
  "Definite Integration": "Definite integrals, area computations",
  "Probability": "Probability theory, Bayes Theorem"
};

let sql = '\n-- Update topics with YouTube Videos\n';

for (const line of lines) {
  // Regex to match fields correctly accounting for quotes
  const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
  if (matches && matches.length >= 4) {
    const clean = str => {
      let s = str.replace(/^,/, '');
      if (s.startsWith('"') && s.endsWith('"')) {
        s = s.substring(1, s.length - 1);
      }
      return s;
    };
    
    let chapter = clean(matches[1]);
    let channel = clean(matches[2]);
    let url = clean(matches[3]);
    
    let dbSubtopic = mappings[chapter];
    
    if (dbSubtopic) {
      sql += `UPDATE topics SET video_url = '${url}', video_channel = '${channel.replace("'", "''")}' WHERE subtopic = '${dbSubtopic}';\n`;
    }
  }
}

fs.appendFileSync('schema_phase6_videos.sql', sql);
console.log('Appended SQL to schema_phase6_videos.sql');
