import { createClient } from '@/utils/supabase/server';
import TaggingClient from './TaggingClient';

export default async function TaggingPage() {
  const supabase = await createClient();

  // Fetch all questions
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch taxonomy
  const { data: topics, error: tError } = await supabase
    .from('topics')
    .select('*')
    .order('subject', { ascending: true });

  if (qError || tError) {
    return <div className="p-8 text-red-500">Error loading data.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Question Tagging Pipeline</h1>
        <p className="text-slate-400 mb-8">
          Auto-tag questions using Nemotron AI, or manually override tags below.
        </p>

        <TaggingClient questions={questions || []} topics={topics || []} />
      </div>
    </div>
  );
}
