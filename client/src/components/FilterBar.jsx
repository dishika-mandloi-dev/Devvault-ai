import React from 'react';
import { 
  Code, 
  Bug, 
  Filter, 
  RotateCcw, 
  Check, 
  Pin,
  Sparkles
} from 'lucide-react';
import { CATEGORIES, LANGUAGES, getLanguageStyle } from '../utils/constants';

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  selectedLanguage,
  onSelectLanguage,
  pinnedOnly,
  onTogglePinnedOnly,
  onResetFilters,
  categoryCounts = { All: 0, Snippet: 0, 'Bug Fix': 0 },
  activeLanguageList = [],
}) {
  const isFiltered = selectedCategory !== 'All' || selectedLanguage !== 'All' || pinnedOnly;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 mb-6 backdrop-blur-sm shadow-xl space-y-3.5">
      
      {/* Top Row: Categories and Quick Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Category Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-600/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {cat.id === 'Snippet' && <Code className="w-3.5 h-3.5 text-cyan-300" />}
                {cat.id === 'Bug Fix' && <Bug className="w-3.5 h-3.5 text-rose-400" />}
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-indigo-900/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Pinned filter & Reset */}
        <div className="flex items-center gap-2">
          {/* Pinned filter toggle */}
          <button
            onClick={onTogglePinnedOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              pinnedOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
            title="Filter only pinned snippets"
          >
            <Pin className={`w-3.5 h-3.5 ${pinnedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Pinned Only</span>
          </button>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Language Pills */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3 text-slate-500" />
          Languages:
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          {LANGUAGES.map((lang) => {
            const isActive = selectedLanguage === lang;
            const style = getLanguageStyle(lang);

            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold ring-1 ring-indigo-400 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                {lang !== 'All' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                )}
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
