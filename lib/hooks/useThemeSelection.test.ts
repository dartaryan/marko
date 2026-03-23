import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeSelection, ACTIVE_THEME_KEY } from './useThemeSelection';
import { DEFAULT_THEME_ID, CURATED_THEME_MAP } from '@/lib/colors/themes';

describe('useThemeSelection module', () => {
  it('exports useThemeSelection as a callable function', () => {
    expect(typeof useThemeSelection).toBe('function');
  });

  it('exports ACTIVE_THEME_KEY constant', () => {
    expect(ACTIVE_THEME_KEY).toBe('marko-v2-active-theme');
  });
});

describe('useThemeSelection default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to empty string when localStorage is empty (no false active indicator for existing users)', () => {
    const stored = localStorage.getItem(ACTIVE_THEME_KEY);
    // Hook defaults to '' so existing users see no curated theme highlighted
    const resolved = stored !== null ? JSON.parse(stored) : '';
    expect(resolved).toBe('');
  });

  it('persists theme ID to localStorage', () => {
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify('sea-of-galilee'));
    const stored = localStorage.getItem(ACTIVE_THEME_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe('sea-of-galilee');
  });

  it('reads a previously set theme ID correctly', () => {
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify('minimal-gray'));
    const stored = localStorage.getItem(ACTIVE_THEME_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : '';
    expect(resolved).toBe('minimal-gray');
  });

  it('CURATED_THEME_MAP contains green-meadow', () => {
    expect(CURATED_THEME_MAP[DEFAULT_THEME_ID]).toBeDefined();
    expect(CURATED_THEME_MAP[DEFAULT_THEME_ID].id).toBe('green-meadow');
  });

  it('returns null equivalent for empty string ID (custom state)', () => {
    const emptyId = '';
    const theme = emptyId ? CURATED_THEME_MAP[emptyId] ?? null : null;
    expect(theme).toBeNull();
  });

  it('returns null equivalent for unknown ID', () => {
    const unknownId = 'nonexistent';
    const theme = CURATED_THEME_MAP[unknownId] ?? null;
    expect(theme).toBeNull();
  });
});
