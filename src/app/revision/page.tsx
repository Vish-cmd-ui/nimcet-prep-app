'use client';

import { useState } from 'react';
import { Target, TrendingUp, Clock, AlertTriangle, HelpCircle, CheckCircle2, Sparkles, Map, Loader2 } from 'lucide-react';
import AIExplanationModal from '@/components/AIExplanationModal';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function RevisionPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);

  const generateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const res = await fetch('/api/ai/analyze-mistakes');
      const data = await res.json();
      setRoadmap(data.roadmap || data.error);
    } catch (err) {
      setRoadmap('Failed to generate roadmap. Please try again.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Mock data for MVP UI
  const mockMistake = {
    id: '123',
    question_text: "If f(x) = x^2 + 2x + 1, what is f'(2)?",
    options: ["A. 4", "B. 6", "C. 8", "D. 2"],
    correct_option: "B",
    user_answered: "A",
    difficulty: "Level 1",
    topic: "Mathematics - Derivatives"
  };

  const reasons = [
    { id: 'Conceptual Gap', icon: HelpCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 'Calculation Error', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'Time Pressure', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'Silly Mistake', icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/10' }
  ];

  const handleResolve = () => {
    if (!selectedReason) return;
    alert(`Logged mistake as: ${selectedReason}. In production, this saves to DB and schedules the next review date.`);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-2">
          Mistake Notebook
        </h1>
        <p className="text-slate-400 mb-8">
          Toppers don't just solve questions; they analyze mistakes. Categorize your errors to improve.
        </p>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-800 mb-8 pb-2">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`font-medium px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'pending' ? 'text-white border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Needs Categorization (1)
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`font-medium px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'review' ? 'text-white border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Spaced Repetition Due (0)
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`font-medium px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'roadmap' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-emerald-400'}`}
          >
            <Sparkles className="w-4 h-4" /> AI Roadmap
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded mr-2">{mockMistake.topic}</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">{mockMistake.difficulty}</span>
              </div>
              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Explain with AI
              </button>
            </div>

            <div className="mb-8">
              <p className="text-lg text-slate-200 font-medium mb-4">{mockMistake.question_text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockMistake.options.map(opt => (
                  <div key={opt} className={`p-3 rounded-xl border text-sm ${
                    opt.startsWith(mockMistake.correct_option) 
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : opt.startsWith(mockMistake.user_answered)
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}>
                    {opt}
                    {opt.startsWith(mockMistake.correct_option) && <span className="float-right text-emerald-500">Correct Answer</span>}
                    {opt.startsWith(mockMistake.user_answered) && <span className="float-right text-rose-500">Your Answer</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-100">Why did you get this wrong?</h3>
              <p className="text-sm text-slate-400 mb-6">You must select a reason before you can continue your study session.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {reasons.map(reason => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedReason === reason.id
                        ? `border-${reason.color.split('-')[1]}-500 bg-${reason.bg.split(' ')[0]}`
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${reason.bg} ${reason.color}`}>
                      <reason.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">{reason.id}</span>
                    {selectedReason === reason.id && <CheckCircle2 className={`w-5 h-5 ml-auto ${reason.color}`} />}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleResolve}
                disabled={!selectedReason}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 rounded-xl font-medium transition-colors"
              >
                Log Mistake & Schedule Review
              </button>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-lg shadow-emerald-900/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <Map className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">AI Study Strategist</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Gemini will analyze your entire mistake history, identify your weakest topics, and generate a hyper-personalized 3-day recovery roadmap.
              </p>
              
              {!roadmap && (
                <button 
                  onClick={generateRoadmap}
                  disabled={isGeneratingRoadmap}
                  className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
                >
                  {isGeneratingRoadmap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGeneratingRoadmap ? 'Analyzing Mistakes...' : 'Generate Custom Roadmap'}
                </button>
              )}
            </div>

            {roadmap && (
              <div className="border-t border-slate-800 pt-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="prose-math prose-emerald max-w-none text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {roadmap}
                  </ReactMarkdown>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={generateRoadmap}
                    disabled={isGeneratingRoadmap}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate Roadmap
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AIExplanationModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        question={mockMistake} 
      />
    </div>
  );
}
