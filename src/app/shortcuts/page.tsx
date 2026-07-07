'use client';

import { useState } from 'react';
import { Target, Search, Plus, BookOpen, Star, Calculator } from 'lucide-react';

export default function ShortcutVaultPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for MVP
  const shortcuts = [
    {
      id: 1,
      title: "Distance between Parallel Lines",
      topic: "Coordinate Geometry",
      formula: "d = |c1 - c2| / √(a² + b²)",
      description: "Use this instantly when lines are given in ax + by + c = 0 format. Ensure coefficients 'a' and 'b' are identical in both equations first."
    },
    {
      id: 2,
      title: "Roots of Quadratic (Shortcut)",
      topic: "Algebra",
      formula: "If a+b+c = 0, roots are 1 and c/a",
      description: "Extremely common in NIMCET. Saves calculating the discriminant."
    },
    {
      id: 3,
      title: "Area of Triangle (Determinant)",
      topic: "Matrices & Determinants",
      formula: "Area = 1/2 | x1(y2-y3) + x2(y3-y1) + x3(y1-y2) |",
      description: "Faster than standard distance formulas when coordinates are given."
    }
  ];

  return (
    <div className="p-8 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
              Math Shortcut Vault
            </h1>
            <p className="text-slate-400 max-w-xl">
              NIMCET is a game of speed. 600 marks are locked in Mathematics. Build your repository of shortcuts and formulas here.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Shortcut
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search shortcuts..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500">
            <option>All Topics</option>
            <option>Algebra</option>
            <option>Coordinate Geometry</option>
            <option>Calculus</option>
          </select>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortcuts.map(shortcut => (
            <div key={shortcut.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-300 rounded">
                  {shortcut.topic}
                </span>
                <button className="text-slate-500 hover:text-yellow-400 transition-colors">
                  <Star className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-slate-100 mb-4">{shortcut.title}</h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 flex items-center justify-center">
                <code className="text-indigo-400 font-mono text-center">
                  {shortcut.formula}
                </code>
              </div>

              <p className="text-sm text-slate-400 line-clamp-3">
                {shortcut.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
