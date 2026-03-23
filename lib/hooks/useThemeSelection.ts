'use client';
import { useLocalStorage } from './useLocalStorage';
import { CURATED_THEME_MAP } from '@/lib/colors/themes';

export const ACTIVE_THEME_KEY = 'marko-v2-active-theme';

export function useThemeSelection() {
  const [activeThemeId, setActiveThemeId] = useLocalStorage<string>(
    ACTIVE_THEME_KEY,
    ''
  );

  const activeTheme = activeThemeId ? CURATED_THEME_MAP[activeThemeId] ?? null : null;

  return {
    activeThemeId,
    activeTheme,
    setActiveThemeId,
  };
}
