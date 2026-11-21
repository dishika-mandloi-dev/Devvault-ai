import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import SnippetCard from './components/SnippetCard';
import SnippetModal from './components/SnippetModal';
import AiInsightsPanel from './components/AiInsightsPanel';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import { useDebounce } from './hooks/useDebounce';
import { 
  getSnippets, 
  createSnippet, 
  updateSnippet, 
  togglePinSnippet, 
  deleteSnippet, 
  analyzeCode,
  checkBackendHealth,
  resetSeedData
} from './services/api';
import { 
  Code2, 
  Sparkles, 
  Plus, 
  Search, 
  RotateCcw, 
  Layers, 
  Bug, 
  Code, 
  CheckCircle, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  // Snippets & Loading States
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState(null);

  // Search & Filter States
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  // Modal & Drawer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  
  const [insightsSnippet, setInsightsSnippet] = useState(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const [deletingSnippet, setDeletingSnippet] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [analyzingSnippetId, setAnalyzingSnippetId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load backend data
  const loadSnippets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSnippets();
      if (res && res.data) {
        setSnippets(res.data);
      }
    } catch (err) {
      console.error('Failed to load snippets:', err);
      showToast('Error connecting to backend server. Make sure server is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Health check on mount
  useEffect(() => {
    loadSnippets();
    checkBackendHealth().then((health) => {
      if (health) setBackendHealth(health);
    });
  }, [loadSnippets]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return {
      All: snippets.length,
      Snippet: snippets.filter((s) => s.category === 'Snippet').length,
      'Bug Fix': snippets.filter((s) => s.category === 'Bug Fix').length,
    };
  }, [snippets]);

  // Filter snippets based on search, category, language, and pinned
  const filteredSnippets = useMemo(() => {
    return snippets.filter((s) => {
      // Category filter
      if (selectedCategory !== 'All' && s.category !== selectedCategory) {
        return false;
      }
      // Language filter
      if (selectedLanguage !== 'All' && s.language?.toLowerCase() !== selectedLanguage.toLowerCase()) {
        return false;
      }
      // Pinned filter
      if (pinnedOnly && !s.isPinned) {
        return false;
      }
      // Debounced search (300ms)
      if (debouncedSearch && debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const inTitle = (s.title || '').toLowerCase().includes(query);
        const inCode = (s.code || '').toLowerCase().includes(query);
        const inLang = (s.language || '').toLowerCase().includes(query);
        const inTags = Array.isArray(s.tags) && s.tags.some((t) => (t || '').toLowerCase().includes(query));
        if (!inTitle && !inCode && !inLang && !inTags) {
          return false;
        }
      }
      return true;
    });
  }, [snippets, selectedCategory, selectedLanguage, pinnedOnly, debouncedSearch]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setPinnedOnly(false);
    setSearchInput('');
  };

  // Open modal for new entry
  const handleOpenNewModal = () => {
    setEditingSnippet(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  // Save (Create or Update) Snippet
  const handleSaveSnippet = async (snippetData) => {
    try {
      if (snippetData._id) {
        // Update
        const res = await updateSnippet(snippetData._id, snippetData);
        if (res && res.data) {
          setSnippets((prev) =>
            prev.map((s) => (s._id === snippetData._id ? res.data : s))
          );
          showToast(`"${res.data.title}" updated successfully!`);
        }
      } else {
        // Create
        const res = await createSnippet(snippetData);
        if (res && res.data) {
          setSnippets((prev) => [res.data, ...prev]);
          showToast(`"${res.data.title}" saved to DevVault!`);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving snippet:', err);
      showToast(err.message || 'Failed to save snippet.', 'error');
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id) => {
    try {
      const res = await togglePinSnippet(id);
      if (res && res.data) {
        setSnippets((prev) => {
          const updated = prev.map((s) => (s._id === id ? res.data : s));
          // Re-sort pinned first, then date
          return updated.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        });
        showToast(
          res.data.isPinned ? 'Pinned snippet to top' : 'Unpinned snippet'
        );
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
      showToast('Failed to update pin state.', 'error');
    }
  };

  // Delete Snippet
  const handleConfirmDelete = async () => {
    if (!deletingSnippet) return;
    try {
      setIsDeleting(true);
      await deleteSnippet(deletingSnippet._id);
      setSnippets((prev) => prev.filter((s) => s._id !== deletingSnippet._id));
      showToast(`Deleted "${deletingSnippet.title}".`);
      setDeletingSnippet(null);
    } catch (err) {
      console.error('Error deleting snippet:', err);
      showToast(err.message || 'Failed to delete snippet.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger AI Analyze for a snippet
  const handleAnalyzeSnippet = async (snippet) => {
    setAnalyzingSnippetId(snippet._id);
    try {
      const insights = await analyzeCode({
        code: snippet.code,
        language: snippet.language,
      });

      // Update snippet on server with the new AI insights
      const updateRes = await updateSnippet(snippet._id, {
        aiInsights: {
          summary: insights.summary,
          bugCheck: insights.bugCheck,
          complexity: insights.complexity,
        },
      });

      const updated = updateRes.data || { ...snippet, aiInsights: insights };
      setSnippets((prev) => prev.map((s) => (s._id === snippet._id ? updated : s)));
      setInsightsSnippet(updated);
      setIsInsightsOpen(true);
      showToast('AI analysis completed successfully!');
    } catch (err) {
      console.error('Error analyzing snippet:', err);
      showToast(err.message || 'AI analysis failed.', 'error');
    } finally {
      setAnalyzingSnippetId(null);
    }
  };

  // Open AI Insights Drawer
  const handleOpenAiInsights = (snippet) => {
    setInsightsSnippet(snippet);
    setIsInsightsOpen(true);
  };

  // Reset to default 3 seed entries
  const handleResetSeed = async () => {
    try {
      const res = await resetSeedData();
      if (res && res.data) {
        setSnippets(res.data);
        showToast('Restored 3 demo seed entries!');
      }
    } catch (err) {
      console.error('Failed to reset seeds:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        onNewSnippetClick={handleOpenNewModal}
        totalCount={snippets.length}
        isMongo={Boolean(backendHealth?.database?.includes('MongoDB'))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Section / Quick Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Code Snippets & Bug Tracker</span>
              <span className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Store reusable code snippets, track critical bug fixes, and get instant AI complexity & security breakdowns with Groq.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Seed reload button */}
            <button
              onClick={handleResetSeed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 transition"
              title="Reload sample developer seed entries"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Category, Languages, Pinned) */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          pinnedOnly={pinnedOnly}
          onTogglePinnedOnly={() => setPinnedOnly(!pinnedOnly)}
          onResetFilters={handleResetFilters}
          categoryCounts={categoryCounts}
        />

        {/* Grid of Snippet Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-80 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-32 bg-slate-950 rounded-xl"></div>
                </div>
                <div className="h-8 bg-slate-800/60 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onEdit={handleOpenEditModal}
                onDelete={setDeletingSnippet}
                onTogglePin={handleTogglePin}
                onOpenAiInsights={handleOpenAiInsights}
                onAnalyze={handleAnalyzeSnippet}
                isAnalyzing={analyzingSnippetId === snippet._id}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Snippets Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              {searchInput || selectedCategory !== 'All' || selectedLanguage !== 'All' || pinnedOnly
                ? "No entries match your current search or filter criteria. Try adjusting or resetting your filters."
                : "Your vault is empty! Add your first code snippet or bug fix."}
            </p>
            <div className="flex items-center justify-center gap-3">
              {(searchInput || selectedCategory !== 'All' || selectedLanguage !== 'All' || pinnedOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 transition"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleOpenNewModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Snippet</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">DevVault AI</span> &bull; Full-Stack MERN Code Snippet & Bug Tracker
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400">Powered by Groq llama-3.3-70b-versatile</span>
          </div>
        </div>
      </footer>

      {/* Snippet Add/Edit Modal */}
      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSnippet}
        snippet={editingSnippet}
        onAnalyzeCode={analyzeCode}
      />

      {/* AI Insights Slide-out Panel */}
      <AiInsightsPanel
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        snippet={insightsSnippet}
        onReAnalyze={handleAnalyzeSnippet}
        isAnalyzing={analyzingSnippetId === insightsSnippet?._id}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingSnippet)}
        onClose={() => setDeletingSnippet(null)}
        onConfirm={handleConfirmDelete}
        snippetTitle={deletingSnippet?.title}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
