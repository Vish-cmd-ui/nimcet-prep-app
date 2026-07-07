import { createClient } from '@/utils/supabase/server';
import { Roadmap, Topic } from '@/types/database';
import Link from 'next/link';

export default async function RoadmapPage() {
  const supabase = await createClient();
  
  const { data: roadmapData, error: roadmapError } = await supabase
    .from('roadmap')
    .select('*')
    .order('week_number', { ascending: true });

  const { data: topicsData } = await supabase.from('topics').select('*');

  if (roadmapError) {
    return <div className="p-8 text-red-500">Error loading roadmap: {roadmapError.message}</div>;
  }

  const hasRoadmap = roadmapData && roadmapData.length > 0;

  // Helper to get topic details from ids
  const getTopicDetails = (topicIds: string[]) => {
    if (!topicsData) return [];
    return topicIds.map(id => {
      const t = topicsData.find((t: any) => t.id === id);
      return t || { subject: 'Unknown Topic', subtopic: '' };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-400 mb-2">4-Phase Study Roadmap</h1>
            <p className="text-slate-400">Your path to mastering the NIMCET 2026 revised syllabus.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
            Back Home
          </Link>
        </div>

        {!hasRoadmap ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">No Roadmap Found</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              You haven't generated your personalized study plan yet. The 4-Phase Roadmap Generator will allocate 100% of the syllabus across your available time.
            </p>
            <form action="/api/roadmap/generate" method="POST">
              <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)]">
                Generate 4-Phase Roadmap
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {roadmapData.map((week: Roadmap) => {
              // Determine phase based on week number roughly
              const totalWeeks = roadmapData.length;
              const isPhase4 = week.week_number > totalWeeks - 4;
              const isPhase3 = week.week_number > totalWeeks - 8 && !isPhase4;
              const isPhase2 = week.week_number > totalWeeks - 20 && !isPhase3 && !isPhase4;
              const isPhase1 = !isPhase4 && !isPhase3 && !isPhase2;

              let phaseBadge = <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">Phase 1: Foundation</span>;
              if (isPhase2) phaseBadge = <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">Phase 2: Practice</span>;
              if (isPhase3) phaseBadge = <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">Phase 3: Mock & Refine</span>;
              if (isPhase4) phaseBadge = <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">Phase 4: Final Revision</span>;

              return (
                <div key={week.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xl text-slate-300">
                        W{week.week_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">Week {week.week_number}</h3>
                          {phaseBadge}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {week.start_date ? new Date(week.start_date).toLocaleDateString() : 'TBD'} - {week.end_date ? new Date(week.end_date).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      week.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      week.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {week.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {isPhase1 && (
                    <div className="pl-16 mb-6">
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Daily Time Allocation (3 Hrs)</h4>
                        <div className="flex gap-2 h-4 rounded-full overflow-hidden mb-2">
                          <div className="bg-blue-500 w-[60%]" title="Maths (60%)"></div>
                          <div className="bg-purple-500 w-[30%]" title="Reasoning (30%)"></div>
                          <div className="bg-emerald-500 w-[10%]" title="Computer/English (10%)"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span className="text-blue-400 font-medium">Maths: ~110m</span>
                          <span className="text-purple-400 font-medium">Reasoning: ~55m</span>
                          <span className="text-emerald-400 font-medium">Comp/Eng: ~15m</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pl-16">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Topics to Cover:</h4>
                    {week.topic_ids && week.topic_ids.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        {getTopicDetails(week.topic_ids).map((topic, i) => (
                          <li key={i} className="text-sm text-slate-300 flex flex-col gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                              <span className="font-medium text-slate-200 line-clamp-2" title={`${topic.subject} - ${topic.subtopic}`}>
                                {topic.subject} - {topic.subtopic}
                              </span>
                            </div>
                            {topic.video_url && (
                              <a 
                                href={topic.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-3 inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 hover:bg-rose-500/20 w-max px-2.5 py-1 rounded-md border border-rose-500/20"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                Watch {topic.video_channel}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No new topics (Revision/Mock phase)</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
