import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDocumentTitle, getDocumentSnippet, getRelativeDate } from './utils';

describe('getDocumentTitle', () => {
  it('extracts H1 heading', () => {
    expect(getDocumentTitle('# Hello World\nSome content')).toBe('Hello World');
  });

  it('extracts H1 heading with extra whitespace', () => {
    expect(getDocumentTitle('#   Spaced Title  \nBody')).toBe('Spaced Title');
  });

  it('ignores H2 and uses first H1', () => {
    expect(getDocumentTitle('## Sub\n# Main Title')).toBe('Main Title');
  });

  it('falls back to first non-empty line when no H1', () => {
    expect(getDocumentTitle('Hello there\nMore text')).toBe('Hello there');
  });

  it('truncates long first-line fallback to 60 chars', () => {
    const longLine = 'A'.repeat(100);
    expect(getDocumentTitle(longLine)).toBe('A'.repeat(60));
  });

  it('skips empty lines for first-line fallback', () => {
    expect(getDocumentTitle('\n\n  \nActual content')).toBe('Actual content');
  });

  it('returns Hebrew default for empty content', () => {
    expect(getDocumentTitle('')).toBe('מסמך חדש');
  });

  it('returns Hebrew default for whitespace-only content', () => {
    expect(getDocumentTitle('   \n  \n  ')).toBe('מסמך חדש');
  });

  it('handles Hebrew H1 headings', () => {
    expect(getDocumentTitle('# שלום עולם')).toBe('שלום עולם');
  });
});

describe('getDocumentSnippet', () => {
  it('strips headings and returns plain text', () => {
    expect(getDocumentSnippet('# Title\nSome body text')).toBe('Some body text');
  });

  it('strips markdown formatting characters', () => {
    expect(getDocumentSnippet('**bold** and _italic_ and `code`')).toBe('bold and italic and code');
  });

  it('converts links to plain text', () => {
    expect(getDocumentSnippet('Check [this link](https://example.com) out')).toBe('Check this link out');
  });

  it('collapses newlines to spaces', () => {
    expect(getDocumentSnippet('Line one\n\nLine two')).toBe('Line one Line two');
  });

  it('truncates to 60 chars with ellipsis', () => {
    const longText = 'A'.repeat(100);
    const result = getDocumentSnippet(longText);
    expect(result.length).toBe(63); // 60 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not add ellipsis for short text', () => {
    expect(getDocumentSnippet('Short text')).toBe('Short text');
  });

  it('returns empty string for empty content', () => {
    expect(getDocumentSnippet('')).toBe('');
  });

  it('strips blockquote markers', () => {
    expect(getDocumentSnippet('> quoted text')).toBe('quoted text');
  });
});

describe('getRelativeDate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const NOW = 1711500000000; // fixed reference point

  function mockNow() {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
  }

  it('returns "היום" for timestamps from today', () => {
    mockNow();
    expect(getRelativeDate(NOW - 1000)).toBe('היום');
  });

  it('returns "היום" for a timestamp a few hours ago', () => {
    mockNow();
    expect(getRelativeDate(NOW - 3 * 60 * 60 * 1000)).toBe('היום');
  });

  it('returns "אתמול" for timestamps from yesterday', () => {
    mockNow();
    const yesterday = NOW - 1 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(yesterday)).toBe('אתמול');
  });

  it('returns "לפני X ימים" for 2-6 days ago', () => {
    mockNow();
    const threeDaysAgo = NOW - 3 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(threeDaysAgo)).toBe('לפני 3 ימים');
  });

  it('returns singular "שבוע" for exactly 1 week ago', () => {
    mockNow();
    const oneWeekAgo = NOW - 7 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(oneWeekAgo)).toBe('לפני שבוע');
  });

  it('returns "לפני X שבועות" for 14-29 days ago', () => {
    mockNow();
    const twoWeeksAgo = NOW - 14 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(twoWeeksAgo)).toBe('לפני 2 שבועות');
  });

  it('returns singular "חודש" for exactly 1 month ago', () => {
    mockNow();
    const oneMonthAgo = NOW - 30 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(oneMonthAgo)).toBe('לפני חודש');
  });

  it('returns "לפני X חודשים" for 60+ days ago', () => {
    mockNow();
    const twoMonthsAgo = NOW - 60 * 24 * 60 * 60 * 1000;
    expect(getRelativeDate(twoMonthsAgo)).toBe('לפני 2 חודשים');
  });

  it('returns "היום" for future timestamps', () => {
    mockNow();
    expect(getRelativeDate(NOW + 60000)).toBe('היום');
  });
});
