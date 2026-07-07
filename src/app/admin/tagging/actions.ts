'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateQuestionTopic(questionId: string, topicId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('questions')
    .update({ topic_id: topicId })
    .eq('id', questionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/tagging');
}
