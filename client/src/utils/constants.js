export const LANGUAGES = [
  'All',
  'JavaScript',
  'React',
  'TypeScript',
  'Python',
  'CSS',
  'HTML',
  'Node.js',
  'SQL',
  'Go',
  'Rust',
];

export const CATEGORIES = [
  { id: 'All', label: 'All Entries' },
  { id: 'Snippet', label: 'Snippets' },
  { id: 'Bug Fix', label: 'Bug Fixes' },
];

export const LANGUAGE_STYLES = {
  javascript: {
    bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    border: 'border-amber-500/20',
  },
  react: {
    bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/20',
  },
  typescript: {
    bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    border: 'border-blue-500/20',
  },
  python: {
    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/20',
  },
  css: {
    bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    border: 'border-purple-500/20',
  },
  html: {
    bg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
    border: 'border-orange-500/20',
  },
  'node.js': {
    bg: 'bg-green-500/10 text-green-300 border-green-500/30',
    dot: 'bg-green-400',
    border: 'border-green-500/20',
  },
  sql: {
    bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/20',
  },
  go: {
    bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400',
    border: 'border-sky-500/20',
  },
  rust: {
    bg: 'bg-red-500/10 text-red-300 border-red-500/30',
    dot: 'bg-red-400',
    border: 'border-red-500/20',
  },
  default: {
    bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
  },
};

export function getLanguageStyle(lang = '') {
  const key = (lang || '').toLowerCase().trim();
  return LANGUAGE_STYLES[key] || LANGUAGE_STYLES.default;
}
