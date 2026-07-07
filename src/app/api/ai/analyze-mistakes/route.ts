import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const NEMOTRON_API_KEY = process.env.NEMOTRON_API_KEY || process.env.GLM_API_KEY;

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's incorrect attempts (or mistake_log if populated)
    // We will use 'attempts' where is_correct = false, joined with topics
    const { data: mistakes, error } = await supabase
      .from('attempts')
      .select('question_id, questions(topics(name))')
      .eq('user_id', user.id)
      .eq('is_correct', false);

    if (error) throw error;

    if (!mistakes || mistakes.length === 0) {
      return NextResponse.json({ roadmap: "You haven't made any mistakes yet! Keep practicing to get a personalized roadmap." });
    }

    // Aggregate mistakes by topic
    const topicCounts: Record<string, number> = {};
    mistakes.forEach((m: any) => {
      const topicName = m.questions?.topics?.name || 'General';
      topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
    });

    const mistakeSummary = Object.entries(topicCounts)
      .map(([topic, count]) => `- ${topic}: ${count} mistakes`)
      .join('\n');

    const systemInstruction = `
You are an expert NIMCET exam strategist and tutor.
Based on the student's mistake log, generate a personalized, actionable 3-day study roadmap.
Be encouraging but strict. Focus heavily on their weakest areas.
Use beautiful Markdown formatting (headings, bullet points, bold text).

Here are the topics they got wrong recently:
${mistakeSummary}
`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEMOTRON_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: 'Please generate my personalized AI study roadmap based on my mistakes.' }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${await response.text()}`);
    }

    const data = await response.json();
    return NextResponse.json({ roadmap: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Roadmap API Error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
