'use client';

import { useState } from 'react';
import { updateQuestionTopic } from './actions';

export default function TaggingClient({ questions, topics }: { questions: any[], topics: any[] }) {
  const [isTagging, setIsTagging] = useState(false);
  const [status, setStatus] = useState('');

  const untaggedCount = questions.filter(q => !q.topic_id).length;

  const handleAutoTag = async () => {
    setIsTagging(true);
    setStatus('Processing batch...');
    try {
      const res = await fetch('/api/tagging', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`Processed ${data.processed}. Remaining in batch: ${data.remaining}. Refreshing...`);
        window.location.reload(); // Refresh to see updated tags
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsTagging(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Auto Tagger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Batch Auto-Tagging</h2>
          <p className="text-sm text-slate-400">Untagged Questions: <span className="font-bold text-white">{untaggedCount}</span></p>
          {status && <p className="text-xs text-emerald-400 mt-2">{status}</p>}
        </div>
        
        <button
          onClick={handleAutoTag}
          disabled={isTagging || untaggedCount === 0}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-medium transition-colors"
        >
          {isTagging ? 'Processing...' : 'Run Batch Tagging'}
        </button>
      </div>

      {/* Manual Override List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Question Bank ({questions.length})</h2>
        
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200 line-clamp-2">{q.question_text}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {q.difficulty || 'Unrated'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Source: {q.source}</span>
                </div>
              </div>
              
              <div className="w-64 shrink-0">
                <label className="text-xs text-slate-500 block mb-1">Topic</label>
                <select
                  defaultValue={q.topic_id || ''}
                  onChange={(e) => updateQuestionTopic(q.id, e.target.value === '' ? null : e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Untagged --</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.subject.substring(0, 4)}: {t.subtopic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
            <p className="text-slate-500 text-center py-8">No questions found. Import some PYQs first.</p>
          )}
        </div>
      </div>
    </div>
  );
}
