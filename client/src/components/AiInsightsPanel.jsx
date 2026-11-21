import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  RotateCw, 
  Copy, 
  Check, 
  Code, 
  Bug,
  ChevronDown,
  ChevronUp,
  Zap,
  Info
} from 'lucide-react';
import { getLanguageStyle } from '../utils/constants';

export default function AiInsightsPanel({
  isOpen,
  onClose,
  snippet,
  onReAnalyze,
  isAnalyzing = false,
}) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [showCode, setShowCode] = useState(false);

  if (!isOpen || !snippet) return null;

  const {
    _id,
    title,
    code,
    language = 'JavaScript',
    category = 'Snippet',
    aiInsights = {},
  } = snippet;

  const langStyle = getLanguageStyle(language);
  const summary = aiInsights?.summary || 'No summary generated yet. Click "Analyze with Groq AI" below to generate.';
  const bugCheck = aiInsights?.bugCheck || 'No bug analysis conducted yet.';
  const complexity = aiInsights?.complexity || 'Complexity not yet evaluated.';

  const copyToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      {/* Backdrop clickable */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Slide-out Drawer Panel */}
      <div 
        className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">DevVault AI Breakdown</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Llama 3.3 70B
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[320px]">{title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${langStyle.bg}`}>
                {language}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                category === 'Bug Fix' 
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}>
                {category}
              </span>
            </div>

            {/* Re-Analyze Button */}
            <button
              onClick={() => onReAnalyze(snippet)}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 transition shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}</span>
            </button>
          </div>

          {/* Section 1: AI Summary */}
          <div className="rounded-2xl bg-slate-950/80 border border-indigo-500/25 p-4 shadow-lg shadow-indigo-500/5 relative group">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs tracking-wider uppercase">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>AI Summary</span>
              </div>
              <button
                onClick={() => copyToClipboard(summary, 'summary')}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1 transition"
                title="Copy summary"
              >
                {copiedSection === 'summary' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Section 2: Bug & Vulnerability Check */}
          <div className="rounded-2xl bg-slate-950/80 border border-rose-500/25 p-4 shadow-lg shadow-rose-500/5 relative group">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs tracking-wider uppercase">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Bug & Edge-Case Check</span>
              </div>
              <button
                onClick={() => copyToClipboard(bugCheck, 'bug')}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1 transition"
                title="Copy bug check"
              >
                {copiedSection === 'bug' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {bugCheck}
            </p>
          </div>

          {/* Section 3: Time & Space Complexity */}
          <div className="rounded-2xl bg-slate-950/80 border border-cyan-500/25 p-4 shadow-lg shadow-cyan-500/5 relative group">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs tracking-wider uppercase">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Time & Space Complexity</span>
              </div>
              <button
                onClick={() => copyToClipboard(complexity, 'complexity')}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1 transition"
                title="Copy complexity"
              >
                {copiedSection === 'complexity' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-sm font-mono text-cyan-200">
              {complexity}
            </div>
          </div>

          {/* Collapsible Source Code Reference */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full px-4 py-2.5 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-slate-900 transition"
            >
              <span className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                Source Code Reference
              </span>
              {showCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCode && (
              <div className="p-4 bg-slate-950 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 border-t border-slate-800">
                <pre><code>{code}</code></pre>
              </div>
            )}
          </div>

          {/* Footer note about Groq llama-3.3-70b */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Analysis produced with strict JSON structured outputs using Groq's high-speed inference engine (Llama-3.3-70B-Versatile).
            </p>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
          >
            Close Panel
          </button>
        </div>

      </div>

    </div>
  );
}
