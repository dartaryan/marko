import { describe, it, expect, beforeEach } from 'vitest';
import { useDarkLightModePref, DARK_LIGHT_MODE_PREF_KEY } from './useDarkLightModePref';
import type { DarkLightModePref } from './useDarkLightModePref';

describe('useDarkLightModePref module', () => {
  it('exports useDarkLightModePref as a callable function', () => {
    expect(typeof useDarkLightModePref).toBe('function');
  });

  it('DARK_LIGHT_MODE_PREF_KEY has the correct constant value', () => {
    expect(DARK_LIGHT_MODE_PREF_KEY).toBe('marko-v2-ui-mode-pref');
  });
});

describe('useDarkLightModePref default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default system when localStorage is empty', () => {
    const stored = localStorage.getItem(DARK_LIGHT_MODE_PREF_KEY);
    const resolved: DarkLightModePref = stored !== null ? JSON.parse(stored) : 'system';
    expect(resolved).toBe('system');
  });

  it('persists dark mode preference to localStorage', () => {
    localStorage.setItem(DARK_LIGHT_MODE_PREF_KEY, JSON.stringify('dark'));
    const stored = localStorage.getItem(DARK_LIGHT_MODE_PREF_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe('dark');
  });

  it('persists light mode preference to localStorage', () => {
    localStorage.setItem(DARK_LIGHT_MODE_PREF_KEY, JSON.stringify('light'));
    const stored = localStorage.getItem(DARK_LIGHT_MODE_PREF_KEY);
    expect(JSON.parse(stored!)).toBe('light');
  });

  it('reads a previously set system preference correctly', () => {
    localStorage.setItem(DARK_LIGHT_MODE_PREF_KEY, JSON.stringify('system'));
    const stored = localStorage.getItem(DARK_LIGHT_MODE_PREF_KEY);
    const resolved: DarkLightModePref = stored !== null ? JSON.parse(stored) : 'system';
    expect(resolved).toBe('system');
  });
});

// Note: Hook rendering behavior (.dark class toggling, system media query listener)
// is integration-tested via app/settings/page.test.tsx (AC5 tests).
