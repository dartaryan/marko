'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { applyColorTheme } from '@/lib/colors/apply-colors';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import type { ColorTheme } from '@/types/colors';

// MUST match V2_KEYS.colorTheme in lib/migration/v1-migration.ts (Story 1.7)
export const COLOR_THEME_KEY = 'marko-v2-color-theme';

export function useColorTheme(): [ColorTheme, (theme: ColorTheme) => void] {
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>(
    COLOR_THEME_KEY,
    DEFAULT_CLASSIC_THEME
  );

  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  return [colorTheme, setColorTheme];
}
