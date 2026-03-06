import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './render-pipeline';

describe('renderMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(renderMarkdown('   \n  ')).toBe('');
  });

  it('renders a heading', () => {
    const result = renderMarkdown('# Hello');
    expect(result).toContain('<h1>');
    expect(result).toContain('Hello');
  });

  it('renders a code block with syntax highlighting', () => {
    const result = renderMarkdown('```javascript\nconst x = 1;\n```');
    expect(result).toContain('class="hljs language-javascript"');
    expect(result).toContain('hljs-keyword');
  });

  it('renders a GFM table', () => {
    const input = '| Name | Age |\n|------|-----|\n| Alice | 30 |\n';
    const result = renderMarkdown(input);
    expect(result).toContain('<table>');
    expect(result).toContain('<th>');
    expect(result).toContain('Alice');
  });

  it('renders inline code', () => {
    const result = renderMarkdown('Use `console.log()` for debugging');
    expect(result).toContain('<code>');
  });

  it('returns a string (not a Promise)', () => {
    const result = renderMarkdown('# Test');
    expect(typeof result).toBe('string');
  });
});
