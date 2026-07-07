'use client';
import { useState } from 'react';

export default function ImportPage() {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setStatus('Parsing and importing...');

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`Success! Imported ${data.count} questions.`);
        setInputText('');
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Import PYQs</h1>
        <p className="text-slate-400 mb-8">
          Paste raw text or structured JSON of Previous Year Questions here. The system will parse it and store it in the question bank. (Auto-tagging by AI happens in the next phase).
        </p>

        <form onSubmit={handleImport} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Raw Question Text / JSON
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Example:
1. What is the derivative of x^2?
A. x
B. 2x
C. x^3
D. 2
Answer: B"
              className="w-full h-96 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm ${status.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {status}
            </span>
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-xl font-medium transition-colors shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : 'Import Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
