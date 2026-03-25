'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type FontSize = 'small' | 'medium' | 'large';
export const FONT_SIZE_KEY = 'marko-v2-font-size';

export function useFontSize(): [FontSize, (size: FontSize) => void] {
  const [fontSize, setFontSize] = useLocalStorage<FontSize>(FONT_SIZE_KEY, 'medium');

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  return [fontSize, setFontSize];
}
