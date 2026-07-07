import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const NEMOTRON_API_KEY = process.env.NEMOTRON_API_KEY || process.env.GLM_API_KEY;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, history, message } = await req.json();

    if (!question || !message) {
      return NextResponse.json({ error: 'Missing question or message' }, { status: 400 });
    }

    // Build the prompt context
    const systemInstruction = `
You are an expert NIMCET exam tutor. Your job is to help a student understand a specific question they are stuck on.
Do NOT simply give them the final answer immediately unless they explicitly ask for the final solution. Instead, give them hints, explain the concepts, or break down the math step-by-step.
Use Markdown and LaTeX for math (wrapped in $ or $$).

Here is the question they are working on:
Question: ${question.question_text || question.text}
Options:
A) ${question.options?.[0]}
B) ${question.options?.[1]}
C) ${question.options?.[2]}
D) ${question.options?.[3]}
Correct Answer Option: ${question.correct_option !== undefined ? String.fromCharCode(65 + question.correct_option) : 'Unknown'}
Explanation: ${question.explanation || 'None provided'}
`;

    // Convert history to OpenAI format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Generate response using NVIDIA Llama 3.1
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
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${await response.text()}`);
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Doubt API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
