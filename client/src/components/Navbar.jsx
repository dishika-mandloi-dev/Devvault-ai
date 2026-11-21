import React from 'react';
import { 
  Code2, 
  Plus, 
  Search, 
  Sparkles, 
  X,
  Database,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  searchTerm, 
  onSearchChange, 
  onNewSnippetClick, 
  totalCount = 0,
  isMongo = false 
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* App Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DevVault<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-2.5 h-2.5 mr-1 text-cyan-400" />
                Llama 3.3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI-Powered Snippet & Bug Tracker</p>
          </div>
        </div>

        {/* Debounced Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title, code, tags, language... (300ms debounced)"
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-0.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & + New Entry Button */}
        <div className="flex items-center gap-2.5">
          {/* Quick Database Badge */}
          <div 
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
              isMongo 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
                : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
            }`}
            title={isMongo ? 'Connected to MongoDB database' : 'Running in Resilient Store mode'}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isMongo ? 'MongoDB' : 'Store'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* + New Entry Button */}
          <button
            onClick={onNewSnippetClick}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">New Entry</span>
          </button>
        </div>

      </div>
    </header>
  );
}
