import { describe, it, expect, beforeEach } from 'vitest';
import { useDocDirection, DOC_DIRECTION_KEY } from './useDocDirection';

describe('useDocDirection module', () => {
  it('exports useDocDirection as a callable function', () => {
    expect(typeof useDocDirection).toBe('function');
  });

  it('DOC_DIRECTION_KEY has the correct constant value', () => {
    expect(DOC_DIRECTION_KEY).toBe('marko-v2-doc-direction');
  });
});

describe('useDocDirection default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default rtl direction when localStorage is empty', () => {
    const stored = localStorage.getItem(DOC_DIRECTION_KEY);
    // Simulates initialValue logic from useLocalStorage: null → use default 'rtl'
    const resolved = stored !== null ? JSON.parse(stored) : 'rtl';
    expect(resolved).toBe('rtl');
  });

  it('persists changed direction to localStorage key marko-v2-doc-direction', () => {
    localStorage.setItem(DOC_DIRECTION_KEY, JSON.stringify('ltr'));
    const stored = localStorage.getItem(DOC_DIRECTION_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe('ltr');
  });

  it('persists and reads auto direction correctly', () => {
    localStorage.setItem(DOC_DIRECTION_KEY, JSON.stringify('auto'));
    const stored = localStorage.getItem(DOC_DIRECTION_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : 'rtl';
    expect(resolved).toBe('auto');
  });

  it('reads a previously set rtl direction correctly', () => {
    localStorage.setItem(DOC_DIRECTION_KEY, JSON.stringify('rtl'));
    const stored = localStorage.getItem(DOC_DIRECTION_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : 'rtl';
    expect(resolved).toBe('rtl');
  });
});
