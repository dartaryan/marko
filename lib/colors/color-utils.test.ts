import { describe, it, expect } from 'vitest';
import { hslToHex, hslToRgb, hexToHsl, normalizeHex } from './color-utils';

describe('hslToHex', () => {
  it('converts pure red (0, 100, 50) to #FF0000', () => {
    expect(hslToHex(0, 100, 50)).toBe('#FF0000');
  });

  it('converts pure green (120, 100, 50) to #00FF00', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00FF00');
  });

  it('converts pure blue (240, 100, 50) to #0000FF', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000FF');
  });

  it('converts black (0, 0, 0) to #000000', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });

  it('converts white (0, 0, 100) to #FFFFFF', () => {
    expect(hslToHex(0, 0, 100)).toBe('#FFFFFF');
  });

  it('converts mid-gray (0, 0, 50) to #808080', () => {
    expect(hslToHex(0, 0, 50)).toBe('#808080');
  });

  it('converts cyan (180, 100, 50) to #00FFFF', () => {
    expect(hslToHex(180, 100, 50)).toBe('#00FFFF');
  });

  it('converts a desaturated tint correctly', () => {
    const hex = hslToHex(160, 20, 98);
    // Should be a near-white with slight green tint
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    // R, G, B should all be very high (near 255)
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);
  });

  it('normalizes negative hue (-30 → same as 330)', () => {
    expect(hslToHex(-30, 100, 50)).toBe(hslToHex(330, 100, 50));
  });

  it('normalizes hue >= 360 (420 → same as 60)', () => {
    expect(hslToHex(420, 100, 50)).toBe(hslToHex(60, 100, 50));
  });
});

describe('hslToRgb', () => {
  it('converts pure red to [255, 0, 0]', () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
  });

  it('converts white to [255, 255, 255]', () => {
    expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
  });

  it('converts black to [0, 0, 0]', () => {
    expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
  });

  it('matches hslToHex output', () => {
    const [r, g, b] = hslToRgb(160, 70, 50);
    const hex = hslToHex(160, 70, 50);
    expect(r).toBe(parseInt(hex.slice(1, 3), 16));
    expect(g).toBe(parseInt(hex.slice(3, 5), 16));
    expect(b).toBe(parseInt(hex.slice(5, 7), 16));
  });
});

describe('normalizeHex', () => {
  it('passes through valid 6-digit hex', () => {
    expect(normalizeHex('#FF0000')).toBe('#FF0000');
  });

  it('expands 3-digit shorthand', () => {
    expect(normalizeHex('#F00')).toBe('#FF0000');
  });

  it('adds missing # prefix', () => {
    expect(normalizeHex('FF0000')).toBe('#FF0000');
  });

  it('throws on invalid hex', () => {
    expect(() => normalizeHex('#GGG')).toThrow('Invalid hex color');
    expect(() => normalizeHex('xyz')).toThrow('Invalid hex color');
  });
});

describe('hexToHsl', () => {
  it('converts #FF0000 to hue=0, sat=100, light=50', () => {
    const { h, s, l } = hexToHsl('#FF0000');
    expect(h).toBe(0);
    expect(s).toBe(100);
    expect(l).toBe(50);
  });

  it('converts #00FF00 to hue=120', () => {
    const { h } = hexToHsl('#00FF00');
    expect(h).toBe(120);
  });

  it('converts #0000FF to hue=240', () => {
    const { h } = hexToHsl('#0000FF');
    expect(h).toBe(240);
  });

  it('converts #000000 to lightness=0', () => {
    const { l } = hexToHsl('#000000');
    expect(l).toBe(0);
  });

  it('converts #FFFFFF to lightness=100', () => {
    const { l } = hexToHsl('#FFFFFF');
    expect(l).toBe(100);
  });

  it('converts #808080 to saturation=0', () => {
    const { s } = hexToHsl('#808080');
    expect(s).toBe(0);
  });

  it('round-trips: hexToHsl(hslToHex(h, s, l)) ≈ {h, s, l}', () => {
    const testCases = [
      { h: 0, s: 100, l: 50 },
      { h: 120, s: 80, l: 40 },
      { h: 240, s: 60, l: 70 },
      { h: 30, s: 50, l: 50 },
    ];
    for (const tc of testCases) {
      const hex = hslToHex(tc.h, tc.s, tc.l);
      const result = hexToHsl(hex);
      expect(result.h).toBeCloseTo(tc.h, -1); // within ~5 degrees (rounding)
      expect(result.s).toBeCloseTo(tc.s, -1);
      expect(result.l).toBeCloseTo(tc.l, -1);
    }
  });
});
