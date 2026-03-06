'use client';
import { useLocalStorage } from './useLocalStorage';

// IMPORTANT: This key is separate from v1 keys (mdEditorContent).
// The v1 → v2 migration (Story 1.7) will read v1 keys and populate this key.
export const EDITOR_CONTENT_KEY = 'marko-v2-editor-content';

export function useEditorContent(): [string, (content: string) => void] {
  const [content, setContent] = useLocalStorage<string>(EDITOR_CONTENT_KEY, '');
  return [content, setContent];
}
