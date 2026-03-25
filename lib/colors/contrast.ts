/**
 * WCAG 2.1 contrast ratio utilities.
 */

import { normalizeHex } from './color-utils';

function relativeLuminance(hex: string): number {
  hex = normalizeHex(hex);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns the WCAG 2.1 contrast ratio between two hex colors (always >= 1). */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Returns true if the text/bg pair meets WCAG AA for normal text (>= 4.5:1). */
export function meetsWCAG_AA(textHex: string, bgHex: string): boolean {
  return getContrastRatio(textHex, bgHex) >= 4.5;
}
