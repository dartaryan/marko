'use client';
import { useState, useLayoutEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage after mount using useLayoutEffect:
  // - Avoids hydration mismatch (initial render always uses initialValue, matching SSR)
  // - No visual flash (useLayoutEffect fires before browser paint)
  useLayoutEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage unavailable (private mode, quota exceeded, etc.)
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          // Silently fail — app still works, content just won't persist
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
