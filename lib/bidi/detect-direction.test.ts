import { describe, it, expect } from 'vitest';
import { detectSentenceDirection, analyzeDocument } from './detect-direction';

describe('detectSentenceDirection', () => {
  it('classifies pure Hebrew as rtl', () => {
    expect(detectSentenceDirection('שלום עולם')).toBe('rtl');
  });

  it('classifies pure English as ltr', () => {
    expect(detectSentenceDirection('Hello world')).toBe('ltr');
  });

  it('classifies Hebrew-dominant mixed text as rtl', () => {
    // 'שלום עולם' = 8 Hebrew chars, 'React' = 5 Latin chars → Hebrew dominant
    expect(detectSentenceDirection('שלום עולם React')).toBe('rtl');
  });

  it('classifies English-dominant mixed text as ltr', () => {
    expect(detectSentenceDirection('Hello world שלום')).toBe('ltr');
  });

  it('classifies numbers only as ltr', () => {
    expect(detectSentenceDirection('12345')).toBe('ltr');
  });

  it('classifies empty string as ltr', () => {
    expect(detectSentenceDirection('')).toBe('ltr');
  });

  it('classifies HTML-wrapped Hebrew as rtl (strips tags)', () => {
    expect(detectSentenceDirection('<p>שלום עולם</p>')).toBe('rtl');
  });

  it('classifies Arabic characters as rtl', () => {
    expect(detectSentenceDirection('مرحبا')).toBe('rtl');
  });

  it('returns rtl when RTL and LTR counts are tied', () => {
    // 'אב' = 2 RTL chars, 'ab' = 2 LTR chars → tie → rtl wins
    expect(detectSentenceDirection('אבab')).toBe('rtl');
  });

  it('handles surrogate pairs without crashing or skewing results', () => {
    // Emoji U+1F600 is above U+FFFF — must not crash or be miscounted
    // 'שלום עולם' = 8 Hebrew, '😀', 'hi' = 2 Latin → Hebrew dominant
    expect(detectSentenceDirection('שלום עולם 😀 hi')).toBe('rtl');
  });
});

describe('analyzeDocument', () => {
  it('analyzes mixed array of sentences', () => {
    expect(analyzeDocument(['שלום', 'Hello', 'world'])).toEqual([
      'rtl',
      'ltr',
      'ltr',
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(analyzeDocument([])).toEqual([]);
  });

  it('handles single-element array', () => {
    expect(analyzeDocument(['שלום'])).toEqual(['rtl']);
  });
});
