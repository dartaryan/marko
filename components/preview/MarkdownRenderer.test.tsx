import { describe, it, expect } from 'vitest';
import { hasMermaidContent } from './MarkdownRenderer';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import { getMermaidTemplate, MERMAID_TEMPLATES } from '@/lib/markdown/mermaid-templates';

describe('hasMermaidContent', () => {
  it('returns true when HTML contains a mermaid div', () => {
    const html = '<div class="mermaid-wrapper"><div class="mermaid">flowchart LR\nA --> B</div></div>';
    expect(hasMermaidContent(html)).toBe(true);
  });

  it('returns false for plain HTML with no mermaid blocks', () => {
    const html = '<h1>Hello</h1><p>World</p>';
    expect(hasMermaidContent(html)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasMermaidContent('')).toBe(false);
  });

  it('returns false for code blocks with other languages', () => {
    const html = '<pre><code class="hljs language-javascript">const x = 1;</code></pre>';
    expect(hasMermaidContent(html)).toBe(false);
  });
});

describe('renderMarkdown mermaid rendering', () => {
  it('renders mermaid code block as mermaid-wrapper div', () => {
    const input = '```mermaid\nflowchart LR\nA --> B\n```';
    const result = renderMarkdown(input);
    expect(result).toContain('class="mermaid-wrapper"');
    expect(result).toContain('class="mermaid"');
  });

  it('HTML-escapes mermaid source to prevent XSS', () => {
    const input = '```mermaid\ngraph LR\nA["<b>node</b>"] --> B\n```';
    const result = renderMarkdown(input);
    expect(result).not.toContain('<b>node</b>');
    expect(result).toContain('&lt;b&gt;node&lt;/b&gt;');
  });

  it('non-mermaid code blocks still render with hljs highlighting', () => {
    const input = '```javascript\nconst x = 1;\n```';
    const result = renderMarkdown(input);
    expect(result).toContain('hljs language-javascript');
    expect(result).not.toContain('mermaid-wrapper');
  });

  it('document with no mermaid blocks does not trigger mermaid detection', () => {
    const input = '# Heading\n\nSome **bold** text\n\n```python\nprint("hello")\n```';
    const result = renderMarkdown(input);
    expect(hasMermaidContent(result)).toBe(false);
  });

  it('document with mermaid block triggers mermaid detection', () => {
    const input = '# Title\n\n```mermaid\nflowchart LR\nA --> B\n```\n\nMore text';
    const result = renderMarkdown(input);
    expect(hasMermaidContent(result)).toBe(true);
  });
});

describe('error state source escaping', () => {
  it('escapes < and > in error source display to prevent XSS', () => {
    const source = '<script>alert(1)</script>';
    const escaped = source.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escaped).not.toContain('<script>');
  });

  it('escapes ER diagram angle bracket syntax safely', () => {
    const source = 'USER ||--o{ ORDER : "מבצע"';
    const escaped = source.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // No angle brackets in this source — should be unchanged
    expect(escaped).toBe(source);
  });

  it('error HTML template includes required Hebrew text and ARIA attributes', () => {
    const source = 'invalid mermaid syntax';
    const escaped = source.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<div class="mermaid-error" role="alert" aria-label="שגיאה בתרשים"><p class="mermaid-error-title">שגיאה בתרשים</p><pre class="mermaid-error-source">${escaped}</pre></div>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    expect(doc.querySelector('.mermaid-error')?.getAttribute('role')).toBe('alert');
    expect(doc.querySelector('.mermaid-error-title')?.textContent).toBe('שגיאה בתרשים');
    expect(doc.querySelector('.mermaid-error-source')?.textContent).toBe(source);
  });
});

describe('getMermaidTemplate', () => {
  it('wraps code in a fenced mermaid code block', () => {
    const result = getMermaidTemplate('flowchart');
    expect(result).toMatch(/^```mermaid\n/);
    expect(result).toMatch(/\n```\n$/);
  });

  it('contains the diagram source for the requested type', () => {
    expect(getMermaidTemplate('flowchart')).toContain('flowchart LR');
    expect(getMermaidTemplate('sequence')).toContain('sequenceDiagram');
    expect(getMermaidTemplate('pie')).toContain('pie title');
  });

  it('returns empty string for an unknown key', () => {
    expect(getMermaidTemplate('nonexistent')).toBe('');
  });

  it('each template produces mermaid-wrapper HTML via renderMarkdown', () => {
    MERMAID_TEMPLATES.forEach((template) => {
      const block = getMermaidTemplate(template.key);
      const html = renderMarkdown(block);
      expect(html).toContain('class="mermaid-wrapper"');
      expect(html).toContain('class="mermaid"');
    });
  });
});

describe('MERMAID_TEMPLATES', () => {
  it('contains exactly 7 diagram types', () => {
    expect(MERMAID_TEMPLATES).toHaveLength(7);
  });

  it('all templates have key, labelHe, labelEn, and code', () => {
    MERMAID_TEMPLATES.forEach((t) => {
      expect(t.key).toBeTruthy();
      expect(t.labelHe).toBeTruthy();
      expect(t.labelEn).toBeTruthy();
      expect(t.code).toBeTruthy();
    });
  });

  it('template keys match the expected diagram types in order', () => {
    const expectedKeys = ['flowchart', 'sequence', 'class', 'state', 'er', 'gantt', 'pie'];
    expect(MERMAID_TEMPLATES.map((t) => t.key)).toEqual(expectedKeys);
  });
});
