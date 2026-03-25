'use client';
import { useLocalStorage } from './useLocalStorage';

export const AUTO_SAVE_KEY = 'marko-v2-auto-save';

export function useAutoSave(): [boolean, (value: boolean) => void] {
  return useLocalStorage<boolean>(AUTO_SAVE_KEY, true);
}
