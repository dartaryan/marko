import { describe, it, expect } from 'vitest';
import { getContrastRatio, meetsWCAG_AA } from './contrast';

describe('getContrastRatio', () => {
  it('returns 21:1 for black on white', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1:1 for identical colors', () => {
    expect(getContrastRatio('#FF0000', '#FF0000')).toBeCloseTo(1, 1);
  });

  it('is symmetric — order of arguments does not matter', () => {
    const ab = getContrastRatio('#333333', '#FAFAF5');
    const ba = getContrastRatio('#FAFAF5', '#333333');
    expect(ab).toBeCloseTo(ba, 5);
  });

  it('returns correct ratio for Green Meadow primaryText on previewBg', () => {
    // #333333 on #FAFAF5 — should be well above 4.5
    const ratio = getContrastRatio('#333333', '#FAFAF5');
    expect(ratio).toBeGreaterThan(10);
  });
});

describe('meetsWCAG_AA', () => {
  it('returns true for black on white', () => {
    expect(meetsWCAG_AA('#000000', '#FFFFFF')).toBe(true);
  });

  it('returns false for light gray on white', () => {
    expect(meetsWCAG_AA('#CCCCCC', '#FFFFFF')).toBe(false);
  });

  it('returns true for dark text on light bg (4.5:1 threshold)', () => {
    // #595959 on #FFFFFF has ratio ~5.9
    expect(meetsWCAG_AA('#595959', '#FFFFFF')).toBe(true);
  });

  it('returns false for colors just below 4.5:1', () => {
    // #767676 on #FFFFFF has ratio ~4.54 — borderline
    // #777777 on #FFFFFF has ratio ~4.48 — just below
    expect(meetsWCAG_AA('#787878', '#FFFFFF')).toBe(false);
  });
});
