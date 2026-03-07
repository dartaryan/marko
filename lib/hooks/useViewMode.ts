'use client';
import { useLocalStorage } from './useLocalStorage';
import type { ViewMode } from '@/types/editor';

export const VIEW_MODE_KEY = 'marko-v2-view-mode';

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  return useLocalStorage<ViewMode>(VIEW_MODE_KEY, 'split');
}
