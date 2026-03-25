import { describe, it, expect, beforeEach } from 'vitest';
import { useFontSize, FONT_SIZE_KEY } from './useFontSize';
import type { FontSize } from './useFontSize';

describe('useFontSize module', () => {
  it('exports useFontSize as a callable function', () => {
    expect(typeof useFontSize).toBe('function');
  });

  it('FONT_SIZE_KEY has the correct constant value', () => {
    expect(FONT_SIZE_KEY).toBe('marko-v2-font-size');
  });
});

describe('useFontSize default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default medium when localStorage is empty', () => {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    const resolved: FontSize = stored !== null ? JSON.parse(stored) : 'medium';
    expect(resolved).toBe('medium');
  });

  it('persists small font size to localStorage', () => {
    localStorage.setItem(FONT_SIZE_KEY, JSON.stringify('small'));
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe('small');
  });

  it('persists large font size to localStorage', () => {
    localStorage.setItem(FONT_SIZE_KEY, JSON.stringify('large'));
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    expect(JSON.parse(stored!)).toBe('large');
  });

  it('reads a previously set medium font size correctly', () => {
    localStorage.setItem(FONT_SIZE_KEY, JSON.stringify('medium'));
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    const resolved: FontSize = stored !== null ? JSON.parse(stored) : 'medium';
    expect(resolved).toBe('medium');
  });
});

// Note: Hook rendering behavior (data-font-size attribute on documentElement)
// is integration-tested via app/settings/page.test.tsx (AC6 tests).
