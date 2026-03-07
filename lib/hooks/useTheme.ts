'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const UI_MODE_KEY = 'marko-v2-ui-mode';

export function useTheme(): [isDark: boolean, toggleTheme: () => void] {
  // Compute system default before useState so first render uses the correct value.
  // This prevents FOUC for first-time visitors whose system prefers dark: the FOUC
  // script sets .dark on <html>, but without this, Effect #2 (DOM sync) would fire
  // with isDark=false and remove it before Effect #1 could call setIsDark(true).
  // On server (SSR): typeof window === 'undefined' → false (light default).
  const systemDefault =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

  const [isDark, setIsDark] = useLocalStorage<boolean>(UI_MODE_KEY, systemDefault);

  // On first mount: persist system preference to localStorage if no saved preference.
  // With systemDefault above, isDark is already correct — this just ensures persistence.
  useEffect(() => {
    const saved = window.localStorage.getItem(UI_MODE_KEY);
    if (saved === null) {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync .dark class on <html> whenever isDark changes.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return [isDark, () => setIsDark((v) => !v)];
}
