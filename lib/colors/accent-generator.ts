import { hslToHex } from './color-utils';
import type { ColorTheme } from '@/types/colors';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Generate a full 17-property ColorTheme from a single HSL accent color.
 * The accent hue is used as the base; saturation and lightness are varied
 * to produce text, heading, background, and accent colours.
 *
 * Lightness (l) acts as a relative modifier around a neutral point of 50:
 * - l > 50 → lighter backgrounds, slightly lighter text/headings
 * - l < 50 → darker text/headings, slightly darker backgrounds
 * The offset is moderate to keep WCAG contrast safe.
 */
export function generateThemeFromAccent(accent: {
  h: number;
  s: number;
  l: number;
}): ColorTheme {
  const { h, s, l } = accent;
  // Offset: 0 at l=50, ranges roughly -10..+10
  const lOff = (l - 50) / 5;

  return {
    // Text — near-black with subtle hue tint
    primaryText: hslToHex(h, Math.min(s, 10), clamp(15 - lOff * 0.5, 8, 22)),
    secondaryText: hslToHex(h, Math.min(s, 8), clamp(40 - lOff * 0.3, 32, 48)),
    link: hslToHex(h, Math.max(s, 60), clamp(40 + lOff * 0.3, 32, 48)),
    code: hslToHex((h + 300) % 360, 50, clamp(45 + lOff * 0.3, 38, 52)),

    // Headings — accent at varying lightness
    h1: hslToHex(h, Math.max(s, 50), clamp(25 + lOff * 0.4, 18, 35)),
    h1Border: hslToHex(h, Math.max(s, 60), clamp(45 + lOff * 0.4, 38, 55)),
    h2: hslToHex(h, Math.max(s, 45), clamp(32 + lOff * 0.4, 24, 42)),
    h2Border: hslToHex(h, Math.max(s, 50), clamp(55 + lOff * 0.4, 48, 65)),
    h3: hslToHex(h, Math.max(s, 40), clamp(38 + lOff * 0.4, 30, 48)),

    // Backgrounds — very light tints of accent hue
    previewBg: hslToHex(h, Math.min(s, 20), clamp(98 + lOff * 0.15, 95, 100)),
    codeBg: hslToHex(h, Math.min(s, 10), clamp(96 + lOff * 0.15, 93, 99)),
    blockquoteBg: hslToHex(h, Math.min(s, 25), clamp(96 + lOff * 0.15, 93, 99)),
    tableHeader: hslToHex(h, Math.min(s, 20), clamp(97 + lOff * 0.15, 94, 100)),
    tableAlt: hslToHex(h, Math.min(s, 15), clamp(98 + lOff * 0.15, 95, 100)),

    // Accents — mid-tone accent variants
    blockquoteBorder: hslToHex(h, Math.max(s, 60), clamp(45 + lOff * 0.4, 38, 55)),
    hr: hslToHex(h, Math.min(s, 15), clamp(80 + lOff * 0.3, 72, 88)),
    tableBorder: hslToHex(h, Math.min(s, 15), clamp(80 + lOff * 0.3, 72, 88)),
  };
}
