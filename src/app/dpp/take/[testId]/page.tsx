'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function TakeTestPage() {
  const { testId } = useParams();
  const router = useRouter();
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTest() {
      const supabase = createClient();
      const { data: test, error: testErr } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testErr || !test) {
        setError('Test not found.');
        return;
      }
      setTestData(test);

      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .in('id', test.question_ids);

      if (qErr || !qs) {
        setError('Failed to load questions.');
        return;
      }
      setQuestions(qs);
    }
    if (testId) loadTest();
  }, [testId]);

  // Timer logic removed as per requirements

  const handleSelect = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, answers, timeSpent: 0 })
      });
      const data = await res.json();
      if (res.ok) {
        // Route back to DPP dashboard to see score
        router.push('/dpp');
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-rose-400">
      <div className="bg-rose-500/10 p-6 border border-rose-500/20 rounded-xl flex items-center gap-4">
        <AlertCircle /> {error}
      </div>
    </div>;
  }

  if (questions.length === 0) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading test...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-200">Daily Practice Problem</h1>
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
            <span className="font-medium text-sm">Practice Mode (Untimed)</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 space-y-12">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 rounded-full font-semibold">
                {index + 1}
              </span>
              <p className="text-lg text-slate-200 leading-relaxed pt-1">{q.question_text}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-12">
              {q.options.map((opt: string) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-slate-600'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                      </div>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-8 border-t border-slate-800">
          <button
            onClick={async () => {
              setIsLoadingMore(true);
              try {
                const res = await fetch('/api/generate-test', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'dpp', appendToTestId: testId, count: 10 }),
                });
                const data = await res.json();
                if (data.newQuestionIds) {
                  const supabase = createClient();
                  const { data: qs } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', data.newQuestionIds);
                  if (qs) {
                    // Filter out dupes just in case
                    const newQs = qs.filter((q: any) => !questions.find(existing => existing.id === q.id));
                    setQuestions(prev => [...prev, ...newQs]);
                  }
                }
              } catch (e) {
                console.error(e);
              } finally {
                setIsLoadingMore(false);
              }
            }}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl font-medium transition-colors"
          >
            {isLoadingMore ? 'Loading...' : 'Load 10 More Questions'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length === 0}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Practice'}
            <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
