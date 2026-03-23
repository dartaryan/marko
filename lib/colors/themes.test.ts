import { describe, it, expect } from 'vitest';
import { CURATED_THEMES, CURATED_THEME_MAP, DEFAULT_THEME_ID, canApplyTheme } from './themes';
import type { ColorTheme } from '@/types/colors';

const COLOR_THEME_KEYS: (keyof ColorTheme)[] = [
  'primaryText', 'secondaryText', 'link', 'code',
  'h1', 'h1Border', 'h2', 'h2Border', 'h3',
  'previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt',
  'blockquoteBorder', 'hr', 'tableBorder',
];

describe('Theme data model', () => {
  it('exports exactly 8 curated themes', () => {
    expect(CURATED_THEMES).toHaveLength(8);
  });

  it('every theme has a unique kebab-case ID', () => {
    const ids = CURATED_THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(8);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z0-9-]+$/);
    }
  });

  it('every theme has non-empty name and hebrewName', () => {
    for (const theme of CURATED_THEMES) {
      expect(theme.name.length).toBeGreaterThan(0);
      expect(theme.hebrewName.length).toBeGreaterThan(0);
    }
  });

  it('every theme has a valid tier (free or premium)', () => {
    for (const theme of CURATED_THEMES) {
      expect(['free', 'premium']).toContain(theme.tier);
    }
  });

  it('has 3 free themes and 5 premium themes', () => {
    const free = CURATED_THEMES.filter((t) => t.tier === 'free');
    const premium = CURATED_THEMES.filter((t) => t.tier === 'premium');
    expect(free).toHaveLength(3);
    expect(premium).toHaveLength(5);
  });

  it('every theme has a valid 17-property ColorTheme (no missing/undefined)', () => {
    for (const theme of CURATED_THEMES) {
      expect(Object.keys(theme.colors)).toHaveLength(17);
      for (const key of COLOR_THEME_KEYS) {
        const value = theme.colors[key];
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it('every color value is a valid hex color', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const theme of CURATED_THEMES) {
      for (const key of COLOR_THEME_KEYS) {
        expect(theme.colors[key]).toMatch(hexRegex);
      }
    }
  });

  it('CURATED_THEME_MAP maps every theme ID to its theme', () => {
    for (const theme of CURATED_THEMES) {
      expect(CURATED_THEME_MAP[theme.id]).toBe(theme);
    }
  });

  it('DEFAULT_THEME_ID is "green-meadow"', () => {
    expect(DEFAULT_THEME_ID).toBe('green-meadow');
  });

  it('Green Meadow is the first theme and is free', () => {
    expect(CURATED_THEMES[0].id).toBe('green-meadow');
    expect(CURATED_THEMES[0].tier).toBe('free');
  });

  it('themes have the exact expected names and tiers', () => {
    const expected = [
      { id: 'green-meadow', tier: 'free' },
      { id: 'sea-of-galilee', tier: 'free' },
      { id: 'minimal-gray', tier: 'free' },
      { id: 'old-parchment', tier: 'premium' },
      { id: 'negev-night', tier: 'premium' },
      { id: 'soft-rose', tier: 'premium' },
      { id: 'lavender-dream', tier: 'premium' },
      { id: 'ocean-deep', tier: 'premium' },
    ];
    for (let i = 0; i < expected.length; i++) {
      expect(CURATED_THEMES[i].id).toBe(expected[i].id);
      expect(CURATED_THEMES[i].tier).toBe(expected[i].tier);
    }
  });

  it('Green Meadow has the specified base colors (background, headings, accent)', () => {
    const gm = CURATED_THEMES[0];
    expect(gm.colors.previewBg).toBe('#FAFAF5');
    expect(gm.colors.h1).toBe('#064E3B');
    expect(gm.colors.link).toBe('#10B981');
  });

  it('Negev Night is a dark theme (dark previewBg)', () => {
    const nn = CURATED_THEMES.find((t) => t.id === 'negev-night')!;
    // Dark theme should have a low-luminance background
    const bg = nn.colors.previewBg;
    const r = parseInt(bg.slice(1, 3), 16);
    const g = parseInt(bg.slice(3, 5), 16);
    const b = parseInt(bg.slice(5, 7), 16);
    const luminance = (r + g + b) / 3;
    expect(luminance).toBeLessThan(80);
  });
});

describe('canApplyTheme', () => {
  const freeTheme = CURATED_THEMES.find((t) => t.tier === 'free')!;
  const premiumTheme = CURATED_THEMES.find((t) => t.tier === 'premium')!;

  it('allows free themes for anonymous users', () => {
    expect(canApplyTheme(freeTheme, 'anonymous')).toBe(true);
  });

  it('allows free themes for free-tier users', () => {
    expect(canApplyTheme(freeTheme, 'free')).toBe(true);
  });

  it('allows free themes for paid-tier users', () => {
    expect(canApplyTheme(freeTheme, 'paid')).toBe(true);
  });

  it('blocks premium themes for anonymous users', () => {
    expect(canApplyTheme(premiumTheme, 'anonymous')).toBe(false);
  });

  it('blocks premium themes for free-tier users', () => {
    expect(canApplyTheme(premiumTheme, 'free')).toBe(false);
  });

  it('allows premium themes for paid-tier users', () => {
    expect(canApplyTheme(premiumTheme, 'paid')).toBe(true);
  });

  it('allows premium themes during loading state (permissive while auth resolves)', () => {
    expect(canApplyTheme(premiumTheme, 'loading')).toBe(true);
  });

  it('allows free themes during loading state', () => {
    expect(canApplyTheme(freeTheme, 'loading')).toBe(true);
  });
});
