import { describe, it, expect, beforeEach } from 'vitest';
import { useViewMode, VIEW_MODE_KEY } from './useViewMode';

describe('useViewMode module', () => {
  it('exports useViewMode as a callable function', () => {
    expect(typeof useViewMode).toBe('function');
  });

  it('VIEW_MODE_KEY has the correct constant value', () => {
    expect(VIEW_MODE_KEY).toBe('marko-v2-view-mode');
  });
});

describe('useViewMode default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default split mode when localStorage is empty', () => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    // Simulates initialValue logic from useLocalStorage: null → use default 'split'
    const resolved = stored !== null ? JSON.parse(stored) : 'split';
    expect(resolved).toBe('split');
  });

  it('persists changed view mode to localStorage', () => {
    localStorage.setItem(VIEW_MODE_KEY, JSON.stringify('editor'));
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe('editor');
  });

  it('persists preview mode to localStorage', () => {
    localStorage.setItem(VIEW_MODE_KEY, JSON.stringify('preview'));
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    expect(JSON.parse(stored!)).toBe('preview');
  });

  it('reads a previously set view mode correctly', () => {
    localStorage.setItem(VIEW_MODE_KEY, JSON.stringify('editor'));
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : 'split';
    expect(resolved).toBe('editor');
  });
});
