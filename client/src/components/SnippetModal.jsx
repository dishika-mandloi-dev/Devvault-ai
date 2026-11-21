import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code, 
  Bug, 
  Sparkles, 
  Pin, 
  Plus, 
  Tag as TagIcon, 
  Check, 
  Cpu, 
  AlertTriangle, 
  FileText,
  Loader2
} from 'lucide-react';
import { LANGUAGES, getLanguageStyle } from '../utils/constants';

export default function SnippetModal({
  isOpen,
  onClose,
  onSave,
  snippet = null, // null for new snippet, object for edit
  onAnalyzeCode,
}) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [category, setCategory] = useState('Snippet');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [aiInsights, setAiInsights] = useState({ summary: '', bugCheck: '', complexity: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title || '');
      setCode(snippet.code || '');
      setLanguage(snippet.language || 'JavaScript');
      setCategory(snippet.category || 'Snippet');
      setTags(Array.isArray(snippet.tags) ? snippet.tags : []);
      setIsPinned(Boolean(snippet.isPinned));
      setAiInsights({
        summary: snippet.aiInsights?.summary || '',
        bugCheck: snippet.aiInsights?.bugCheck || '',
        complexity: snippet.aiInsights?.complexity || '',
      });
    } else {
      // Default clean state for new entry
      setTitle('');
      setCode('');
      setLanguage('JavaScript');
      setCategory('Snippet');
      setTags([]);
      setIsPinned(false);
      setAiInsights({ summary: '', bugCheck: '', complexity: '' });
    }
    setTagInput('');
    setErrors({});
  }, [snippet, isOpen]);

  if (!isOpen) return null;

  // Handle Tag Addition
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Support Tab indentation in code editor
  const handleCodeKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setCode(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Inline AI Analysis
  const handleInlineAnalyze = async () => {
    if (!code.trim()) {
      setErrors((prev) => ({ ...prev, code: 'Please provide code before running AI analysis.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, code: null }));
    setIsAnalyzing(true);
    try {
      const result = await onAnalyzeCode({ code, language });
      if (result) {
        setAiInsights({
          summary: result.summary || '',
          bugCheck: result.bugCheck || '',
          complexity: result.complexity || '',
        });
      }
    } catch (err) {
      console.error('Failed inline analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!code.trim()) newErrors.code = 'Code is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      _id: snippet?._id,
      title: title.trim(),
      code,
      language,
      category,
      tags,
      isPinned,
      aiInsights,
    });
  };

  const isEditMode = Boolean(snippet?._id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {category === 'Bug Fix' ? <Bug className="w-4 h-4 text-rose-400" /> : <Code className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Snippet' : 'Create New Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode ? 'Update code, tags, and AI insights' : 'Store a reusable snippet or bug fix with AI insights'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Row 1: Title and Pin Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Title <span className="text-rose-400">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  isPinned
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isPinned ? 'Pinned to Top' : 'Pin to Top'}</span>
              </button>
            </div>
            
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="e.g. useDebounce Hook with Memory Leak Cleanup"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition ${
                errors.title ? 'border-rose-500/80 ring-1 ring-rose-500/40' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* Row 2: Category and Language Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Snippet')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    category === 'Snippet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  Snippet
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Bug Fix')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    category === 'Bug Fix'
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm shadow-rose-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Bug Fix
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              >
                {LANGUAGES.filter((l) => l !== 'All').map((l) => (
                  <option key={l} value={l} className="bg-slate-900 text-slate-100">
                    {l}
                  </option>
                ))}
                <option value="Other" className="bg-slate-900 text-slate-100">Other (Custom)</option>
              </select>
            </div>

          </div>

          {/* Row 3: Tags Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3 h-3 text-slate-400" />
              Tags (Press Enter or Comma)
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "e.g. Async, React, Performance (press Enter)" : "Add more..."}
                className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none px-1"
              />
            </div>
          </div>

          {/* Row 4: Code Editor with Tab indentation & AI Analyze trigger */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Code Editor <span className="text-rose-400">*</span>
              </label>

              {/* Inline Run AI Analysis Button */}
              <button
                type="button"
                onClick={handleInlineAnalyze}
                disabled={isAnalyzing || !code.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 transition shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/30 transition">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{language.toLowerCase()} code editor (supports Tab indentation)</span>
                <span>{code.split('\n').length} lines</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
                }}
                onKeyDown={handleCodeKeyDown}
                rows={9}
                placeholder={`// Paste or write your ${language} code here...\nfunction example() {\n  return "DevVault AI";\n}`}
                className="w-full p-3.5 bg-transparent font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
              />
            </div>
            {errors.code && <p className="text-xs text-rose-400">{errors.code}</p>}
          </div>

          {/* Row 5: AI Insights Panel / Preview within Modal */}
          {(aiInsights.summary || aiInsights.bugCheck || aiInsights.complexity) && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  DevVault AI Analysis Results
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Generated via Groq Llama 3.3</span>
              </div>

              {aiInsights.summary && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-400" /> Summary:
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    {aiInsights.summary}
                  </p>
                </div>
              )}

              {aiInsights.bugCheck && (
                <div>
                  <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" /> Bug & Edge-Case Check:
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/20">
                    {aiInsights.bugCheck}
                  </p>
                </div>
              )}

              {aiInsights.complexity && (
                <div>
                  <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" /> Complexity:
                  </span>
                  <p className="text-xs text-cyan-200 font-mono mt-0.5 bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
                    {aiInsights.complexity}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Update Entry' : 'Save Snippet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
