import { describe, it, expect } from 'vitest';
import { getFormatText } from './format-utils';

describe('getFormatText', () => {
  // Inline wraps — with selection
  it('bold with selection', () => {
    expect(getFormatText('bold', 'hello')).toBe('**hello**');
  });
  it('bold without selection', () => {
    expect(getFormatText('bold', '')).toBe('**טקסט מודגש**');
  });
  it('italic with selection', () => {
    expect(getFormatText('italic', 'world')).toBe('*world*');
  });
  it('italic without selection', () => {
    expect(getFormatText('italic', '')).toBe('*טקסט נטוי*');
  });
  it('strikethrough with selection', () => {
    expect(getFormatText('strikethrough', 'foo')).toBe('~~foo~~');
  });
  it('strikethrough without selection', () => {
    expect(getFormatText('strikethrough', '')).toBe('~~טקסט חצוי~~');
  });
  it('code-inline with selection', () => {
    expect(getFormatText('code-inline', 'const x')).toBe('`const x`');
  });
  it('code-inline without selection', () => {
    expect(getFormatText('code-inline', '')).toBe('`קוד`');
  });

  // Headings — with and without selection
  it('h1 with selection', () => {
    expect(getFormatText('h1', 'Title')).toBe('# Title\n');
  });
  it('h1 without selection', () => {
    expect(getFormatText('h1', '')).toBe('# כותרת ראשית\n');
  });
  it('h2 without selection', () => {
    expect(getFormatText('h2', '')).toBe('## כותרת משנית\n');
  });
  it('h3 without selection', () => {
    expect(getFormatText('h3', '')).toBe('### כותרת שלישית\n');
  });
  it('h4 without selection', () => {
    expect(getFormatText('h4', '')).toBe('#### כותרת רביעית\n');
  });
  it('h5 without selection', () => {
    expect(getFormatText('h5', '')).toBe('##### כותרת חמישית\n');
  });
  it('h6 without selection', () => {
    expect(getFormatText('h6', '')).toBe('###### כותרת שישית\n');
  });

  // Lists
  it('ul with selection', () => {
    expect(getFormatText('ul', 'item')).toBe('- item\n');
  });
  it('ul without selection', () => {
    expect(getFormatText('ul', '')).toBe('- פריט רשימה\n');
  });
  it('ol with selection', () => {
    expect(getFormatText('ol', 'item')).toBe('1. item\n');
  });
  it('ol without selection', () => {
    expect(getFormatText('ol', '')).toBe('1. פריט רשימה\n');
  });
  it('task with selection', () => {
    expect(getFormatText('task', 'do this')).toBe('- [ ] do this\n');
  });
  it('task without selection', () => {
    expect(getFormatText('task', '')).toBe('- [ ] משימה\n');
  });

  // Insert types
  it('link with selection', () => {
    expect(getFormatText('link', 'click here')).toBe('[click here](url)');
  });
  it('link without selection', () => {
    expect(getFormatText('link', '')).toBe('[טקסט הקישור](url)');
  });
  it('image with selection', () => {
    expect(getFormatText('image', 'photo')).toBe('![photo](url)');
  });
  it('image without selection', () => {
    expect(getFormatText('image', '')).toBe('![תיאור תמונה](url)');
  });
  it('hr', () => {
    expect(getFormatText('hr', '')).toBe('\n---\n');
  });
  it('table', () => {
    expect(getFormatText('table', '')).toBe(
      '\n| כותרת א | כותרת ב | כותרת ג |\n| --- | --- | --- |\n| תא 1 | תא 2 | תא 3 |\n'
    );
  });

  // Code block
  it('code-block with selection', () => {
    expect(getFormatText('code-block', 'const x = 1')).toBe('```\nconst x = 1\n```\n');
  });
  it('code-block without selection', () => {
    expect(getFormatText('code-block', '')).toBe('```\nקוד כאן\n```\n');
  });

  // Trim whitespace in selection
  it('bold trims whitespace in selection', () => {
    expect(getFormatText('bold', '  hello  ')).toBe('**hello**');
  });
});
