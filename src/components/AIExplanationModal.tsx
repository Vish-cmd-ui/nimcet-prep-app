'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
}

export default function AIExplanationModal({ isOpen, onClose, question }: AIExplanationModalProps) {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && question) {
      setExplanation('');
      fetchExplanation();
    }
  }, [isOpen, question]);

  const fetchExplanation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/explain-mistake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: question.question_text,
          options: question.options,
          user_answered: question.user_answered,
          correct_option: question.correct_option
        })
      });

      if (!res.ok || !res.body) throw new Error('Failed to fetch');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setExplanation((prev) => prev + chunkValue);
      }
    } catch (error) {
      console.error(error);
      setExplanation("Failed to generate explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">AI Tutor Explanation</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-slate-300 text-sm font-medium mb-2">Question:</p>
            <p className="text-slate-100">{question.question_text}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Step-by-Step Breakdown</h3>
            {isLoading && !explanation && (
              <div className="flex gap-2 items-center text-indigo-400 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            {explanation && (
              <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border border-slate-800">
                {explanation.split('\n').map((line, i) => (
                  <p key={i} className="text-slate-300 whitespace-pre-wrap">{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
