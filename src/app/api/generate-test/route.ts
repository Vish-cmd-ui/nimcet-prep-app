import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { type, appendToTestId, count = 20 } = await req.json();
    if (!['dpp', 'weekly', 'monthly'].includes(type)) {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch 100 random questions from DB to shuffle
    const { data: allQs, error: fetchErr } = await supabase
      .from('questions')
      .select('id')
      .limit(200); // Fetch a pool to shuffle from

    if (fetchErr || !allQs || allQs.length === 0) {
      throw new Error('No questions found in database. Please run the PYQ extractor script first.');
    }

    // Shuffle and pick requested count
    const shuffledIds = allQs.sort(() => 0.5 - Math.random()).map(q => q.id);
    const selectedIds = shuffledIds.slice(0, Math.min(count, shuffledIds.length));

    let finalTestId = null;

    if (appendToTestId) {
      // Append mode: fetch existing test and add these IDs
      const { data: testRecord, error: testErr } = await supabase
        .from('tests')
        .select('question_ids, max_score')
        .eq('id', appendToTestId)
        .single();

      if (testErr || !testRecord) throw new Error('Test not found for appending');

      const updatedIds = [...(testRecord.question_ids || []), ...selectedIds];
      
      const { error: updateErr } = await supabase
        .from('tests')
        .update({
          question_ids: updatedIds,
          max_score: updatedIds.length * 12
        })
        .eq('id', appendToTestId);

      if (updateErr) throw new Error('Failed to update test record');
      
      finalTestId = appendToTestId;
      
    } else {
      // Create new test record
      const { data: savedTest, error: testError } = await supabase
        .from('tests')
        .insert({
          user_id: user.id,
          type: type,
          date: new Date().toISOString().split('T')[0],
          question_ids: selectedIds,
          max_score: selectedIds.length * 12
        })
        .select('id')
        .single();

      if (testError || !savedTest) throw new Error('Failed to create test record');
      finalTestId = savedTest.id;
    }

    // Return the selected IDs as well so the client can fetch the new ones if needed
    return NextResponse.json({ 
      testId: finalTestId, 
      count: selectedIds.length,
      newQuestionIds: selectedIds 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
