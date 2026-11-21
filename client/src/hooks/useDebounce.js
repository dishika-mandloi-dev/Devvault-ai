import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value by delay in ms (default 300ms)
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce duration in milliseconds
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
