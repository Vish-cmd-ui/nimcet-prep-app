'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Play } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import DoubtWidget from '@/components/DoubtWidget';

export default function PracticePage() {
  const [topic, setTopic] = useState('Mathematics - Calculus');
  const [difficulty, setDifficulty] = useState('Level 1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [dbTopics, setDbTopics] = useState<any[]>([]);

  useEffect(() => {
    async function loadTopics() {
      const supabase = createClient();
      const { data } = await supabase.from('topics').select('id, subject, chapter, subtopic');
      if (data) {
        setDbTopics(data);
        if (data.length > 0) {
          setTopic(data[0].id);
        }
      }
    }
    loadTopics();
  }, []);

  // Group topics by Subject - Chapter
  const groupedTopics = dbTopics.reduce((acc: any, curr: any) => {
    const groupName = `${curr.subject} - ${curr.chapter}`;
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push({ id: curr.id, subtopic: curr.subtopic });
    return acc;
  }, {});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setQuestion(null);
    setSelectedOption(null);

    try {
      // Find the topic name for the UI display later
      const selectedTopicObj = dbTopics.find(t => t.id === topic);
      const topicName = selectedTopicObj ? `${selectedTopicObj.subject} - ${selectedTopicObj.chapter} - ${selectedTopicObj.subtopic}` : 'Unknown Topic';

      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topic, topic_name: topicName, difficulty })
      });
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate question. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          Instant AI Practice
        </h1>
        <p className="text-slate-400 mb-8">
          Select a topic and let Gemini instantly generate a fresh NIMCET-level question for you.
        </p>

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg mb-8 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">Topic</label>
            <select 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              {Object.entries(groupedTopics).map(([groupName, items]: [string, any]) => (
                <optgroup key={groupName} label={groupName}>
                  {items.map((item: any) => {
                    return (
                      <option key={item.id} value={item.id}>
                        {item.subtopic.length > 50 ? item.subtopic.substring(0, 50) + '...' : item.subtopic}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="Level 1">Level 1 (Easy)</option>
              <option value="Level 2">Level 2 (Medium)</option>
              <option value="Level 3">Level 3 (Hard)</option>
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate
          </button>
        </div>

        {/* Question Display */}
        {isGenerating && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <Sparkles className="w-8 h-8 mb-4 animate-pulse text-emerald-500" />
            <p>Gemini is writing a question...</p>
          </div>
        )}

        {question && !isGenerating && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-lg shadow-emerald-900/10 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                {difficulty}
              </span>
            </div>

            <p className="text-xl text-slate-100 font-medium mb-8 leading-relaxed">
              {question.question_text}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {Array.isArray(question.options) ? question.options.map((opt: string, idx: number) => {
                const isCorrect = opt.startsWith(question.correct_option);
                const isSelected = selectedOption === opt;
                
                let btnClass = "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700";
                
                if (selectedOption) {
                  if (isCorrect) {
                    btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  } else if (isSelected) {
                    btnClass = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                  } else {
                    btnClass = "border-slate-800 bg-slate-950/50 text-slate-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={opt || idx}
                    onClick={() => !selectedOption && setSelectedOption(opt)}
                    disabled={!!selectedOption}
                    className={`p-4 rounded-xl border text-left transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              }) : (
                <p className="text-rose-400 p-4 col-span-2 border border-rose-500/30 bg-rose-500/10 rounded-xl">
                  AI failed to format options correctly. Please try generating again.
                </p>
              )}
            </div>

            {selectedOption && (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl animate-in fade-in">
                <h3 className="text-lg font-medium text-slate-200 mb-2">Explanation</h3>
                <p className="text-slate-400 leading-relaxed">{question.explanation}</p>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show Doubt Widget only when a question is active and an option has been selected (review mode) */}
      {question && selectedOption && (
        <DoubtWidget questionContext={question} />
      )}
    </div>
  );
}
