import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EditorToolbar } from './EditorToolbar';
import { getFormatText } from '@/lib/editor/format-utils';

function makeRef(value = '', selStart = 0, selEnd = 0): React.RefObject<HTMLTextAreaElement> {
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.selectionStart = selStart;
  ta.selectionEnd = selEnd;
  return { current: ta } as React.RefObject<HTMLTextAreaElement>;
}

// ─── Structure & ARIA ───────────────────────────────────────────────────────

describe('EditorToolbar — structure & ARIA', () => {
  it('renders a toolbar container with role="toolbar"', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('role="toolbar"');
  });

  it('toolbar has Hebrew aria-label "סרגל עיצוב"', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="סרגל עיצוב"');
  });

  it('text group: bold, italic, strikethrough buttons have Hebrew aria-labels', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="מודגש"');
    expect(html).toContain('aria-label="נטוי"');
    expect(html).toContain('aria-label="קו חוצה"');
  });

  it('headings dropdown trigger has aria-label "כותרת" and title tooltip', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="כותרת"');
    expect(html).toContain('title="כותרת"');
  });

  it('list buttons have Hebrew aria-labels', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="רשימה"');
    expect(html).toContain('aria-label="רשימה ממוספרת"');
    expect(html).toContain('aria-label="רשימת משימות"');
  });

  it('insert buttons have Hebrew aria-labels', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="קישור"');
    expect(html).toContain('aria-label="תמונה"');
    expect(html).toContain('aria-label="טבלה"');
    expect(html).toContain('aria-label="קו מפריד"');
  });

  it('code dropdown trigger has aria-label "קוד" and title tooltip', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="קוד"');
    expect(html).toContain('title="קוד"');
  });

  it('mermaid dropdown trigger has correct aria-label and title tooltip', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('aria-label="הוסף תרשים Mermaid"');
    expect(html).toContain('title="הוסף תרשים Mermaid"');
  });

  it('all three dropdown triggers have aria-haspopup="menu"', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    const count = (html.match(/aria-haspopup="menu"/g) ?? []).length;
    expect(count).toBe(3);
  });

  it('six separators render between seven groups', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    // Each separator has aria-hidden="true"; icons in dropdowns may also have it — assert ≥6
    const count = (html.match(/aria-hidden="true"/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(6);
  });

  it('toolbar container has marko-toolbar class', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).toContain('marko-toolbar');
  });

  it('AI button no longer renders in toolbar (moved to header in Story 12.1)', () => {
    const html = renderToStaticMarkup(<EditorToolbar textareaRef={makeRef()} onInsert={vi.fn()} />);
    expect(html).not.toContain('עוזר AI');
  });
});

// ─── Format Utility Integration ─────────────────────────────────────────────

describe('getFormatText — insertion logic used by toolbar buttons', () => {
  it('wraps selection for inline formats', () => {
    expect(getFormatText('bold', 'hello')).toBe('**hello**');
    expect(getFormatText('italic', 'world')).toBe('*world*');
    expect(getFormatText('strikethrough', 'foo')).toBe('~~foo~~');
    expect(getFormatText('code-inline', 'x')).toBe('`x`');
  });

  it('uses Hebrew placeholder when no selection', () => {
    expect(getFormatText('bold', '')).toBe('**טקסט מודגש**');
    expect(getFormatText('italic', '')).toBe('*טקסט נטוי*');
    expect(getFormatText('link', '')).toBe('[טקסט הקישור](url)');
  });

  it('trims whitespace before wrapping', () => {
    expect(getFormatText('bold', '  hello  ')).toBe('**hello**');
  });

  it('heading formats produce correct markdown with newline', () => {
    expect(getFormatText('h1', 'Title')).toBe('# Title\n');
    expect(getFormatText('h6', '')).toBe('###### כותרת שישית\n');
  });

  it('list formats produce correct markdown', () => {
    expect(getFormatText('ul', 'item')).toBe('- item\n');
    expect(getFormatText('ol', 'item')).toBe('1. item\n');
    expect(getFormatText('task', 'do this')).toBe('- [ ] do this\n');
  });

  it('code-block wraps selection in fenced code block', () => {
    expect(getFormatText('code-block', 'const x = 1')).toBe('```\nconst x = 1\n```\n');
    expect(getFormatText('code-block', '')).toBe('```\nקוד כאן\n```\n');
  });

  it('table inserts a 3-column Hebrew template', () => {
    const result = getFormatText('table', '');
    expect(result).toContain('| כותרת א |');
    expect(result).toContain('| --- |');
  });

  it('hr ignores selection and inserts horizontal rule', () => {
    expect(getFormatText('hr', 'ignored')).toBe('\n---\n');
    expect(getFormatText('hr', '')).toBe('\n---\n');
  });
});
