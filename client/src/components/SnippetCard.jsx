import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Pin, 
  Code, 
  Bug, 
  Sparkles, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Cpu,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { getLanguageStyle } from '../utils/constants';

export default function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onTogglePin,
  onOpenAiInsights,
  onAnalyze,
  isAnalyzing = false,
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const {
    _id,
    title,
    code,
    language = 'JavaScript',
    category = 'Snippet',
    tags = [],
    aiInsights = {},
    isPinned = false,
    createdAt,
  } = snippet;

  const langStyle = getLanguageStyle(language);
  const isBugFix = category === 'Bug Fix';
  const hasInsights = Boolean(
    aiInsights?.summary || aiInsights?.bugCheck || aiInsights?.complexity
  );

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Truncate code to 6 lines if not expanded
  const codeLines = (code || '').split('\n');
  const shouldTruncate = codeLines.length > 7;
  const displayedCode = !expanded && shouldTruncate 
    ? codeLines.slice(0, 7).join('\n') 
    : code;

  // Format date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div 
      className={`group relative flex flex-col justify-between bg-slate-900/80 rounded-2xl border transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/10 ${
        isPinned
          ? 'border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      
      {/* Pinned Glowing Corner Ribbon / Indicator */}
      {isPinned && (
        <div className="absolute -top-2.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/30 z-10">
          <Pin className="w-2.5 h-2.5 fill-current" />
          Pinned
        </div>
      )}

      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        
        {/* Top Badges & Pin Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                isBugFix
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {isBugFix ? <Bug className="w-3 h-3 text-rose-400" /> : <Code className="w-3 h-3 text-indigo-400" />}
              {category}
            </span>

            {/* Language Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border ${langStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${langStyle.dot}`}></span>
              {language}
            </span>
          </div>

          {/* Pin Button */}
          <button
            onClick={() => onTogglePin(_id)}
            className={`p-1.5 rounded-lg border transition-all ${
              isPinned
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={isPinned ? 'Unpin snippet' : 'Pin to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Snippet Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition line-clamp-1 mb-2 tracking-tight">
          {title}
        </h3>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Code Preview Container */}
        <div className="relative mt-2 rounded-xl bg-slate-950/90 border border-slate-800/90 overflow-hidden">
          
          {/* Code Window Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
              <span className="ml-2 text-slate-400 text-[10px]">{language.toLowerCase()}</span>
            </div>

            {/* Quick Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Monospace Code Preview */}
          <div className="p-3 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-56 scrollbar-thin">
            <pre className="code-preview whitespace-pre">
              <code>{displayedCode}</code>
            </pre>
          </div>

          {/* Expand/Collapse Toggle if Truncated */}
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-1 bg-slate-900/90 hover:bg-slate-850 border-t border-slate-800/80 text-[11px] font-medium text-indigo-300 flex items-center justify-center gap-1 transition"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show More ({codeLines.length} lines)
                </>
              )}
            </button>
          )}

        </div>

        {/* AI Insight Teaser Pill (if analyzed) */}
        {hasInsights && (
          <div 
            onClick={() => onOpenAiInsights(snippet)}
            className="mt-3 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition group/ai"
          >
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                DevVault AI Insights
              </span>
              <span className="text-[10px] text-indigo-400 group-hover/ai:translate-x-0.5 transition-transform">
                View &rarr;
              </span>
            </div>
            {aiInsights.summary && (
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                {aiInsights.summary}
              </p>
            )}
            {aiInsights.complexity && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                <Cpu className="w-2.5 h-2.5" />
                <span className="truncate max-w-[220px]">{aiInsights.complexity}</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 py-3 bg-slate-950/50 border-t border-slate-800/80 rounded-b-2xl flex items-center justify-between gap-2 mt-auto">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </span>

        <div className="flex items-center gap-1.5">
          {/* AI Analyze Button */}
          <button
            onClick={() => (hasInsights ? onOpenAiInsights(snippet) : onAnalyze(snippet))}
            disabled={isAnalyzing}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              hasInsights
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                : 'bg-gradient-to-r from-indigo-600/80 to-cyan-600/80 border-indigo-400/30 text-white hover:from-indigo-500 hover:to-cyan-500 shadow-sm'
            }`}
            title="Analyze with DevVault AI (Groq llama-3.3-70b)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-cyan-300' : 'text-cyan-400'}`} />
            <span>{isAnalyzing ? 'Analyzing...' : hasInsights ? 'Insights' : 'AI Analyze'}</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(snippet)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            title="Edit snippet"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(snippet)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
            title="Delete snippet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
