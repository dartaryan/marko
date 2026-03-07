'use client';
import { useLocalStorage } from './useLocalStorage';
import type { DocDirection } from '@/types/editor';

export const DOC_DIRECTION_KEY = 'marko-v2-doc-direction';

export function useDocDirection(): [DocDirection, (dir: DocDirection) => void] {
  return useLocalStorage<DocDirection>(DOC_DIRECTION_KEY, 'rtl');
}
