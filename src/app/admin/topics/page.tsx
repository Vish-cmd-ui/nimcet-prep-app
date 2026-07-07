import { createClient } from '@/utils/supabase/server';
import { Topic } from '@/types/database';

export default async function AdminTopicsPage() {
  const supabase = await createClient();
  const { data: topics, error } = await supabase.from('topics').select('*').order('weight_hint', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading topics: {error.message}
      </div>
    );
  }

  // Group by Subject -> Chapter
  const grouped: Record<string, Record<string, Topic[]>> = {};
  topics?.forEach((t: Topic) => {
    if (!grouped[t.subject]) grouped[t.subject] = {};
    if (!grouped[t.subject][t.chapter]) grouped[t.subject][t.chapter] = [];
    grouped[t.subject][t.chapter].push(t);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Syllabus Taxonomy</h1>
        <p className="text-slate-400 mb-8">
          This is the master list of all topics in the NIMCET 2026 revised syllabus. These topics are used for the Roadmap Generator and the AI tagging engine.
        </p>

        <div className="space-y-12">
          {Object.entries(grouped).map(([subject, chapters]) => (
            <div key={subject} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 border-b border-slate-700 pb-3">{subject}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(chapters).map(([chapter, subtopics]) => (
                  <div key={chapter} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-lg font-medium text-emerald-400 mb-3">{chapter}</h3>
                    <ul className="space-y-2">
                      {subtopics.map((t) => (
                        <li key={t.id} className="text-sm text-slate-300 flex justify-between items-start gap-2 border-b border-slate-700/30 pb-2 last:border-0">
                          <span>{t.subtopic}</span>
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                            Wt: {t.weight_hint}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
