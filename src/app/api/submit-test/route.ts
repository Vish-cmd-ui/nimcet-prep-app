import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { testId, answers, timeSpent } = await req.json();
    
    if (!testId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch test and its questions
    const { data: test, error: testErr } = await supabase
      .from('tests')
      .select('question_ids, max_score, type')
      .eq('id', testId)
      .single();

    if (testErr || !test) throw new Error('Test not found');

    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('id, correct_option, topic_id')
      .in('id', test.question_ids);

    if (qErr || !questions) throw new Error('Questions not found');

    // 2. Grade answers and log attempts & mistakes
    let score = 0;
    const attempts = [];
    const mistakes = [];
    const today = new Date().toISOString().split('T')[0];

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer && userAnswer.startsWith(q.correct_option);
      
      if (isCorrect) {
        score += 12; // Standard NIMCET marking (varies by subject, simplifying here)
      } else if (userAnswer) {
        score -= 3; // Negative marking
        
        // Log mistake for spaced repetition
        mistakes.push({
          user_id: user.id,
          question_id: q.id,
          topic_id: q.topic_id,
          next_review_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
        });
      }

      attempts.push({
        user_id: user.id,
        question_id: q.id,
        test_id: testId,
        is_correct: isCorrect || false,
        time_taken_seconds: Math.floor(timeSpent / questions.length)
      });
    }

    // 3. Update test score
    await supabase
      .from('tests')
      .update({ score })
      .eq('id', testId);

    // 4. Insert attempts and mistakes
    if (attempts.length > 0) {
      await supabase.from('attempts').insert(attempts);
    }
    if (mistakes.length > 0) {
      await supabase.from('mistake_log').insert(mistakes);
    }

    // 5. Log Attendance for DPPs
    if (test.type === 'dpp') {
      const { error: attErr } = await supabase
        .from('daily_attendance')
        .insert({
          user_id: user.id,
          date: today,
          test_id: testId,
          score: score,
          max_score: test.max_score
        });
      // Ignore unique constraint errors if they already took it today
      if (attErr && attErr.code !== '23505') {
        console.error('Failed to log attendance:', attErr);
      }
    }

    return NextResponse.json({ success: true, score });
  } catch (err: any) {
    console.error('Submit test error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
