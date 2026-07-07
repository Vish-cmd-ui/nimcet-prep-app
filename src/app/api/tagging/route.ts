import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Fetch taxonomy for the prompt
    const { data: topics, error: topicsError } = await supabase.from('topics').select('id, subject, chapter, subtopic');
    if (topicsError || !topics) throw new Error('Failed to fetch topics');

    // 2. Fetch untagged questions (batch of 5 to avoid timeouts/rate limits)
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, options')
      .is('topic_id', null)
      .limit(5);
    
    if (qError) throw new Error('Failed to fetch untagged questions');
    if (!questions || questions.length === 0) {
      return NextResponse.json({ message: 'No untagged questions found', processed: 0 });
    }

    const taxonomyString = topics.map(t => `ID: ${t.id} | Topic: ${t.subject} > ${t.chapter} > ${t.subtopic}`).join('\n');
    
    let processedCount = 0;

    // Process each question individually through Nemotron
    for (const q of questions) {
      const prompt = `
You are an expert NIMCET exam tutor. Your task is to categorize a multiple-choice question into the exact syllabus topic and estimate its difficulty.

Here is the exact syllabus taxonomy with IDs:
${taxonomyString}

Question:
${q.question_text}
Options: ${JSON.stringify(q.options)}

Determine the SINGLE most appropriate topic ID for this question from the taxonomy provided above.
Determine the difficulty strictly using these categories based on NIMCET skipping strategy: 
- 'Level 1': Basic, direct formula, highly solvable.
- 'Level 2': Medium, tricky, multi-step calculation.
- 'Level 3': Hard, very lengthy, high chance of skipping.

Respond ONLY with valid JSON in this exact format, with no markdown formatting or extra text:
{
  "topic_id": "the-uuid-here",
  "difficulty": "Level 1|Level 2|Level 3"
}
`;

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEMOTRON_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct', // Using a highly capable model on NVIDIA NIM (adjust if you strictly need nemotron-4-340b)
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        console.error('NVIDIA API Error:', await response.text());
        continue;
      }

      const aiData = await response.json();
      const content = aiData.choices[0].message.content.trim();
      
      try {
        // Strip markdown backticks if the model returned them
        const jsonStr = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed.topic_id && parsed.difficulty) {
          // Update database
          await supabase
            .from('questions')
            .update({ topic_id: parsed.topic_id, difficulty: parsed.difficulty })
            .eq('id', q.id);
          
          processedCount++;
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
      }
    }

    return NextResponse.json({ message: 'Success', processed: processedCount, remaining: questions.length - processedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
