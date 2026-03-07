import { isRtlChar, isLtrChar, type TextDirection } from './unicode-ranges';

export function detectSentenceDirection(text: string): TextDirection {
  const stripped = text.replace(/<[^>]*>/g, '');
  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of [...stripped]) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      if (isRtlChar(cp)) rtlCount++;
      else if (isLtrChar(cp)) ltrCount++;
    }
  }

  if (rtlCount + ltrCount === 0) return 'ltr';
  return rtlCount >= ltrCount ? 'rtl' : 'ltr';
}

export function analyzeDocument(sentences: string[]): TextDirection[] {
  return sentences.map(detectSentenceDirection);
}
