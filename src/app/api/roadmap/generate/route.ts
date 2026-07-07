import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch all topics
  const { data: topics, error: topicsError } = await supabase.from('topics').select('*');
  if (topicsError || !topics) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }

  // 2. Clear existing roadmap for this user
  await supabase.from('roadmap').delete().eq('user_id', user.id);

  // Group topics by subject
  const mathTopics = topics.filter(t => t.subject === 'Mathematics');
  const reasoningTopics = topics.filter(t => t.subject.includes('Reasoning'));
  const caTopics = topics.filter(t => t.subject === 'Computer Awareness');
  const englishTopics = topics.filter(t => t.subject === 'General English');

  // Study Plan config (~47 weeks total based on July-June)
  const PHASE_1_WEEKS = 26; // Foundation
  const PHASE_2_WEEKS = 13; // Practice & Strengthening 
  const PHASE_3_WEEKS = 4;  // Mock & Refinement
  const PHASE_4_WEEKS = 4;  // Final Revision
  const TOTAL_WEEKS = PHASE_1_WEEKS + PHASE_2_WEEKS + PHASE_3_WEEKS + PHASE_4_WEEKS;

  const roadmapEntries = [];
  const today = new Date();

  // Simple distribution logic for Phase 1
  const getTopicSlice = (topicsArr: any[], currentWeek: number, totalWeeks: number) => {
    if (topicsArr.length === 0) return [];
    const itemsPerWeek = Math.max(1, Math.ceil(topicsArr.length / totalWeeks));
    const startIdx = (currentWeek - 1) * itemsPerWeek;
    if (startIdx >= topicsArr.length) return [];
    return topicsArr.slice(startIdx, startIdx + itemsPerWeek).map(t => t.id);
  };

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (week - 1) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    let assignedTopicIds: string[] = [];

    // Phase 1 gets new topics assigned
    if (week <= PHASE_1_WEEKS) {
      const wMath = getTopicSlice(mathTopics, week, PHASE_1_WEEKS);
      const wReasoning = getTopicSlice(reasoningTopics, week, PHASE_1_WEEKS);
      const wCA = getTopicSlice(caTopics, week, PHASE_1_WEEKS);
      const wEng = getTopicSlice(englishTopics, week, PHASE_1_WEEKS);
      
      assignedTopicIds = [...wMath, ...wReasoning, ...wCA, ...wEng];
    }
    // Phase 2, 3, 4 don't get new topics assigned in the roadmap table
    // The UI handles them dynamically based on study_log / mistake_log

    roadmapEntries.push({
      user_id: user.id,
      week_number: week,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      topic_ids: assignedTopicIds,
      status: week === 1 ? 'in_progress' : 'pending'
    });
  }

  // Insert to DB
  const { error: insertError } = await supabase.from('roadmap').insert(roadmapEntries);

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save roadmap: ' + insertError.message }, { status: 500 });
  }

  // Redirect back to roadmap page
  return NextResponse.redirect(new URL('/roadmap', 'http://localhost:3000'));
}
