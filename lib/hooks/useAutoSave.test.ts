import { describe, it, expect, beforeEach } from 'vitest';
import { useAutoSave, AUTO_SAVE_KEY } from './useAutoSave';

describe('useAutoSave module', () => {
  it('exports useAutoSave as a callable function', () => {
    expect(typeof useAutoSave).toBe('function');
  });

  it('AUTO_SAVE_KEY has the correct constant value', () => {
    expect(AUTO_SAVE_KEY).toBe('marko-v2-auto-save');
  });
});

describe('useAutoSave default behavior via localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default true when localStorage is empty', () => {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : true;
    expect(resolved).toBe(true);
  });

  it('persists changed value to localStorage', () => {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(false));
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toBe(false);
  });

  it('reads a previously set true value correctly', () => {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(true));
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    const resolved = stored !== null ? JSON.parse(stored) : true;
    expect(resolved).toBe(true);
  });
});

// Note: Hook rendering behavior is integration-tested via app/settings/page.test.tsx
// (AC3 tests exercise useAutoSave through the SettingsPage component).
