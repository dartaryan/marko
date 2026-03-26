import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDocumentTitle, getDocumentSnippet } from '@/lib/documents/utils';

// Unit-test the pure logic used by useDocuments — the hook itself relies on
// IndexedDB which is hard to unit test without fake-indexeddb.  We verify
// the supporting utilities and the sorting logic directly.

describe('useDocuments supporting logic', () => {
  describe('makeDocument-equivalent logic', () => {
    it('generates title and snippet from content', () => {
      const content = '# My Document\nSome body text here';
      expect(getDocumentTitle(content)).toBe('My Document');
      expect(getDocumentSnippet(content)).toBe('Some body text here');
    });

    it('handles empty content', () => {
      expect(getDocumentTitle('')).toBe('מסמך חדש');
      expect(getDocumentSnippet('')).toBe('');
    });
  });

  describe('sortDocuments', () => {
    // Extract sort logic inline for testing
    function sortDocuments<T extends { isPinned: boolean; updatedAt: number }>(docs: T[]): T[] {
      return [...docs].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
    }

    it('puts pinned documents first', () => {
      const docs = [
        { isPinned: false, updatedAt: 3000, id: 'a' },
        { isPinned: true, updatedAt: 1000, id: 'b' },
        { isPinned: false, updatedAt: 2000, id: 'c' },
      ];
      const sorted = sortDocuments(docs);
      expect(sorted.map((d) => d.id)).toEqual(['b', 'a', 'c']);
    });

    it('sorts by updatedAt descending within same pin group', () => {
      const docs = [
        { isPinned: false, updatedAt: 1000, id: 'a' },
        { isPinned: false, updatedAt: 3000, id: 'b' },
        { isPinned: false, updatedAt: 2000, id: 'c' },
      ];
      const sorted = sortDocuments(docs);
      expect(sorted.map((d) => d.id)).toEqual(['b', 'c', 'a']);
    });

    it('handles empty array', () => {
      expect(sortDocuments([])).toEqual([]);
    });

    it('multiple pinned documents sorted by date', () => {
      const docs = [
        { isPinned: true, updatedAt: 1000, id: 'a' },
        { isPinned: true, updatedAt: 3000, id: 'b' },
        { isPinned: false, updatedAt: 5000, id: 'c' },
      ];
      const sorted = sortDocuments(docs);
      expect(sorted.map((d) => d.id)).toEqual(['b', 'a', 'c']);
    });
  });

  describe('active document localStorage key', () => {
    const ACTIVE_DOC_KEY = 'marko-v2-active-document-id';

    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('stores and retrieves active document ID', () => {
      const id = 'test-doc-id';
      localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(id));
      const stored = JSON.parse(localStorage.getItem(ACTIVE_DOC_KEY)!) as string;
      expect(stored).toBe(id);
    });

    it('returns null when no active document', () => {
      expect(localStorage.getItem(ACTIVE_DOC_KEY)).toBeNull();
    });
  });
});
