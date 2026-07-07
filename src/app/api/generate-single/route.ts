import { createClient } from '@supabase/supabase-js';

const NEMOTRON_API_KEY = process.env.NEMOTRON_API_KEY || process.env.GLM_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { topic_id, topic_name, difficulty } = await req.json();

    // RAG: Fetch up to 3 real PYQs for this topic to use as few-shot examples
    let examplesText = "";
    if (topic_id) {
      const { data: pyqs } = await supabase
        .from('questions')
        .select('question_text, options, correct_option')
        .eq('topic_id', topic_id)
        .limit(3);

      if (pyqs && pyqs.length > 0) {
        examplesText = "\n\nHere are some authentic Previous Year Questions (PYQs) for this topic to analyze for style, length, and formatting:\n" +
          pyqs.map((q, i) => `Example ${i + 1}:\nQuestion: ${q.question_text}\nOptions: ${JSON.stringify(q.options)}\nCorrect: ${q.correct_option}`).join('\n\n');
      }
    }

    const prompt = `
Generate a single multiple-choice question for the NIMCET MCA entrance exam.
Topic: ${topic_name}
Difficulty: ${difficulty} (Level 1 = Easy, Level 2 = Medium, Level 3 = Hard)
${examplesText}

Instructions:
1. Analyze the Example PYQs provided (if any) to deeply understand the style, trickiness, and typical patterns of NIMCET.
2. Generate a BRAND NEW, completely original question that closely mimics this style and difficulty. DO NOT just copy an example.
3. Output the response STRICTLY as a valid JSON object following this exact schema:
{
  "question_text": "The question string",
  "options": ["A. first", "B. second", "C. third", "D. fourth"],
  "correct_option": "A",
  "explanation": "A brief explanation of why it is correct"
}
    `.trim();

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEMOTRON_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${await response.text()}`);
    }

    const data = await response.json();
    let jsonText = data.choices[0].message.content || "{}";
    
    // Sometimes Gemini still includes markdown backticks even with responseMimeType
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    console.log("Gemini Output:", jsonText);

    let question = {};
    try {
      question = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", jsonText);
      throw new Error("Invalid JSON from Gemini");
    }

    return new Response(JSON.stringify(question), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate question", details: error.message, stack: error.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
