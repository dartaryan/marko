import { describe, it, expect } from 'vitest';
import { generateThemeFromAccent } from './accent-generator';
import { getContrastRatio } from './contrast';

describe('generateThemeFromAccent', () => {
  it('returns all 17 ColorTheme properties', () => {
    const theme = generateThemeFromAccent({ h: 160, s: 70, l: 50 });
    const keys = Object.keys(theme);
    expect(keys).toHaveLength(17);
    expect(keys).toContain('primaryText');
    expect(keys).toContain('previewBg');
    expect(keys).toContain('h1');
    expect(keys).toContain('blockquoteBorder');
    expect(keys).toContain('tableBorder');
  });

  it('all values are valid hex strings', () => {
    const theme = generateThemeFromAccent({ h: 220, s: 80, l: 50 });
    for (const value of Object.values(theme)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('primaryText on previewBg meets WCAG AA (>= 4.5:1) for green accent', () => {
    const theme = generateThemeFromAccent({ h: 160, s: 70, l: 50 });
    const ratio = getContrastRatio(theme.primaryText, theme.previewBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('primaryText on previewBg meets WCAG AA for blue accent', () => {
    const theme = generateThemeFromAccent({ h: 220, s: 80, l: 50 });
    const ratio = getContrastRatio(theme.primaryText, theme.previewBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('primaryText on previewBg meets WCAG AA for red accent', () => {
    const theme = generateThemeFromAccent({ h: 0, s: 90, l: 50 });
    const ratio = getContrastRatio(theme.primaryText, theme.previewBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('primaryText on previewBg meets WCAG AA for low saturation accent', () => {
    const theme = generateThemeFromAccent({ h: 30, s: 10, l: 50 });
    const ratio = getContrastRatio(theme.primaryText, theme.previewBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('produces different themes for different hues', () => {
    const green = generateThemeFromAccent({ h: 120, s: 70, l: 50 });
    const blue = generateThemeFromAccent({ h: 240, s: 70, l: 50 });
    expect(green.h1).not.toBe(blue.h1);
    expect(green.link).not.toBe(blue.link);
    expect(green.previewBg).not.toBe(blue.previewBg);
  });

  it('backgrounds are very light (high lightness)', () => {
    const theme = generateThemeFromAccent({ h: 160, s: 70, l: 50 });
    // previewBg should be near-white
    const r = parseInt(theme.previewBg.slice(1, 3), 16);
    const g = parseInt(theme.previewBg.slice(3, 5), 16);
    const b = parseInt(theme.previewBg.slice(5, 7), 16);
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);
  });

  it('different lightness values produce different themes (BS-1 fix)', () => {
    const light = generateThemeFromAccent({ h: 160, s: 70, l: 80 });
    const dark = generateThemeFromAccent({ h: 160, s: 70, l: 20 });
    expect(light.h1).not.toBe(dark.h1);
    expect(light.primaryText).not.toBe(dark.primaryText);
    expect(light.previewBg).not.toBe(dark.previewBg);
  });

  it('WCAG AA still passes at extreme lightness values', () => {
    for (const l of [10, 30, 50, 70, 90]) {
      const theme = generateThemeFromAccent({ h: 160, s: 70, l });
      const ratio = getContrastRatio(theme.primaryText, theme.previewBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
