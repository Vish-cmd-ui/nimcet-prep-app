import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { question_text, options, user_answered, correct_option } = await req.json();

    const prompt = `
Explain the solution to the following NIMCET question.
Question: ${question_text}
Options: ${JSON.stringify(options)}

The user answered: ${user_answered}
The correct answer is: ${correct_option}

First, explain how to correctly solve the problem step-by-step.
Then, gently explain why the user's answer might have been wrong (e.g. point out a common conceptual gap, calculation error, or trap).
Use clean text. No markdown blocks wrapping the entire response. Use standard math notation.
    `.trim();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              systemInstruction: "You are an empathetic, expert NIMCET tutor. Explain math and logic questions clearly."
            }
          });
          
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Explanation stream error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate explanation" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
