'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { UI_MODE_KEY } from './useTheme';

export type DarkLightModePref = 'system' | 'light' | 'dark';
export const DARK_LIGHT_MODE_PREF_KEY = 'marko-v2-ui-mode-pref';

export function useDarkLightModePref(): [DarkLightModePref, (pref: DarkLightModePref) => void] {
  const [pref, setPref] = useLocalStorage<DarkLightModePref>(DARK_LIGHT_MODE_PREF_KEY, 'system');

  useEffect(() => {
    let isDark: boolean;
    if (pref === 'dark') {
      isDark = true;
    } else if (pref === 'light') {
      isDark = false;
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(UI_MODE_KEY, JSON.stringify(isDark));
    } catch {
      // Silently fail
    }
  }, [pref]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (pref !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
      try {
        window.localStorage.setItem(UI_MODE_KEY, JSON.stringify(e.matches));
      } catch {
        // Silently fail
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [pref]);

  return [pref, setPref];
}
