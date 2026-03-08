'use client';
import { useEffect, useLayoutEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const UI_MODE_KEY = 'marko-v2-ui-mode';

export function useTheme(): [isDark: boolean, toggleTheme: () => void] {
  // Always start with false to match SSR. The FOUC script in layout.tsx
  // already sets .dark on <html> before React hydrates, so there's no flash.
  // useLocalStorage's useLayoutEffect reads the stored value before paint.
  const [isDark, setIsDark] = useLocalStorage<boolean>(UI_MODE_KEY, false);

  // For first-time visitors (no stored preference): detect system preference
  // and persist it. useLayoutEffect ensures this runs before paint.
  useLayoutEffect(() => {
    const saved = window.localStorage.getItem(UI_MODE_KEY);
    if (saved === null) {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync .dark class on <html> whenever isDark changes.
  // FOUC script handles initial page load; this handles runtime toggles.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return [isDark, () => setIsDark((v) => !v)];
}
