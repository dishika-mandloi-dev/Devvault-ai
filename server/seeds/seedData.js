const seedSnippets = [
  {
    title: 'useDebounce Hook with Memory Leak Cleanup',
    language: 'React',
    category: 'Snippet',
    isPinned: true,
    tags: ['Hooks', 'Performance', 'Debounce', 'React 18'],
    code: `import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (e.g. search inputs)
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce duration in milliseconds
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Schedule state update after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timer on value change or component unmount to prevent memory leaks
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    aiInsights: {
      summary: 'A reusable React custom hook that debounces fast-changing state values (like search keystrokes) to prevent excessive renders and API calls.',
      bugCheck: 'Proper cleanup function ensures previous timers are cleared before creating a new one, avoiding race conditions and memory leaks on unmount.',
      complexity: 'Time Complexity: O(1) per update | Space Complexity: O(1) for timer reference.',
    },
    createdAt: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
  },
  {
    title: 'Fix: Async Race Condition & Memory Leak in Fetch',
    language: 'JavaScript',
    category: 'Bug Fix',
    isPinned: false,
    tags: ['Async', 'BugFix', 'AbortController', 'Network'],
    code: `// BUG FIX: Previous version caused memory leaks & race conditions
// when previous network requests resolved AFTER a newer request.

async function fetchUserData(userId, { signal } = {}) {
  // Use AbortController signal to cancel stale requests
  try {
    const response = await fetch(\`/api/users/\${userId}\`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal, // Cancel pending request if superseded
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      // Ignored: Request was safely cancelled by caller
      return { success: false, aborted: true };
    }
    console.error('Failed to fetch user:', error.message);
    return { success: false, error: error.message };
  }
}`,
    aiInsights: {
      summary: 'Production-ready async fetch wrapper utilizing standard AbortController signals to safely abort out-of-order network responses.',
      bugCheck: 'Fixes unhandled promise rejections on unmounted components and eliminates out-of-order state updates when fast query changes occur.',
      complexity: 'Time Complexity: O(1) dispatch + Network latency | Space Complexity: O(1).',
    },
    createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
  },
  {
    title: 'Micro Store: Minimalist React State Pub/Sub',
    language: 'React',
    category: 'Snippet',
    isPinned: false,
    tags: ['State Management', 'PubSub', 'TypeScript Ready', 'Zustand-lite'],
    code: `import { useSyncExternalStore } from 'react';

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;

  const setState = (next) => {
    const nextState = typeof next === 'function' ? next(state) : next;
    if (Object.is(state, nextState)) return;
    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = (selector = (s) => s) => {
    return useSyncExternalStore(
      subscribe,
      () => selector(getState()),
      () => selector(initialState) // SSR fallback
    );
  };

  return { getState, setState, subscribe, useStore };
}`,
    aiInsights: {
      summary: 'Ultra-lightweight (<50 LOC) global state store powered by React 18 useSyncExternalStore, guaranteeing tear-free concurrent rendering.',
      bugCheck: 'Uses Object.is shallow comparison to avoid redundant re-renders and returns an unsubscribe cleanup function.',
      complexity: 'Time Complexity: O(L) where L is listener count | Space Complexity: O(L) for subscriber Set.',
    },
    createdAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
  },
];

module.exports = seedSnippets;
