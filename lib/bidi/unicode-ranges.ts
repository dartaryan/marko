export type TextDirection = 'rtl' | 'ltr';

export const HEBREW_RANGE = { start: 0x0590, end: 0x05ff } as const;
export const ARABIC_RANGE = { start: 0x0600, end: 0x06ff } as const;
export const LATIN_UPPER_RANGE = { start: 0x0041, end: 0x005a } as const;
export const LATIN_LOWER_RANGE = { start: 0x0061, end: 0x007a } as const;

export function isRtlChar(codePoint: number): boolean {
  return (
    (codePoint >= HEBREW_RANGE.start && codePoint <= HEBREW_RANGE.end) ||
    (codePoint >= ARABIC_RANGE.start && codePoint <= ARABIC_RANGE.end)
  );
}

export function isLtrChar(codePoint: number): boolean {
  return (
    (codePoint >= LATIN_UPPER_RANGE.start && codePoint <= LATIN_UPPER_RANGE.end) ||
    (codePoint >= LATIN_LOWER_RANGE.start && codePoint <= LATIN_LOWER_RANGE.end)
  );
}
