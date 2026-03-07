import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  rgbToHex,
  quantizeColors,
  mapExtractedColors,
} from './image-extraction';
import type { RGB } from './image-extraction';

describe('getLuminance', () => {
  it('returns ~255 for white', () => {
    expect(getLuminance([255, 255, 255])).toBeCloseTo(255, 0);
  });
  it('returns 0 for black', () => {
    expect(getLuminance([0, 0, 0])).toBe(0);
  });
  it('applies correct channel weights', () => {
    // pure red: 0.299 * 255 ≈ 76.245
    expect(getLuminance([255, 0, 0])).toBeCloseTo(76.245, 1);
  });
});

describe('rgbToHex', () => {
  it('converts [255,0,0] to #ff0000', () => {
    expect(rgbToHex([255, 0, 0])).toBe('#ff0000');
  });
  it('converts [0,128,255] to #0080ff', () => {
    expect(rgbToHex([0, 128, 255])).toBe('#0080ff');
  });
  it('pads single-hex-digit channels', () => {
    expect(rgbToHex([0, 0, 15])).toBe('#00000f');
  });
});

describe('quantizeColors', () => {
  it('returns 6 fallback colors for empty pixels', () => {
    const result = quantizeColors([], 6);
    expect(result).toHaveLength(6);
    expect(result[0]).toHaveLength(3);
  });

  it('returns k clusters for valid pixel input', () => {
    const pixels: RGB[] = Array.from({ length: 100 }, (_, i) => [i * 2, i, 255 - i]);
    const result = quantizeColors(pixels, 6);
    expect(result).toHaveLength(6);
  });
});

describe('mapExtractedColors', () => {
  const sampleColors: RGB[] = [
    [20, 20, 20],    // very dark
    [60, 60, 60],    // dark
    [120, 120, 120], // medium
    [180, 100, 50],  // vibrant
    [220, 210, 200], // light
    [250, 248, 245], // very light
  ];

  it('returns an object with all 17 ColorTheme keys', () => {
    const result = mapExtractedColors(sampleColors, 0);
    const keys = [
      'primaryText', 'secondaryText', 'link', 'code',
      'h1', 'h1Border', 'h2', 'h2Border', 'h3',
      'previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt',
      'blockquoteBorder', 'hr', 'tableBorder',
    ];
    for (const key of keys) {
      expect(result).toHaveProperty(key);
    }
  });

  it('all values are valid hex strings', () => {
    const result = mapExtractedColors(sampleColors, 0);
    for (const value of Object.values(result)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('shuffleIndex=1 produces different mapping than shuffleIndex=0', () => {
    const r0 = mapExtractedColors(sampleColors, 0);
    const r1 = mapExtractedColors(sampleColors, 1);
    expect(r0.primaryText).not.toBe(r1.primaryText);
  });

  it('shuffleIndex wraps around (length produces same as 0)', () => {
    const r0 = mapExtractedColors(sampleColors, 0);
    const rN = mapExtractedColors(sampleColors, sampleColors.length);
    expect(r0).toEqual(rN);
  });
});
