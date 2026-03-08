import { describe, it, expect } from 'vitest';
import { applyBidiToHtml } from './apply-bidi';

describe('applyBidiToHtml', () => {
  it('adds dir="rtl" to <p> with Hebrew text', () => {
    const result = applyBidiToHtml('<p>שלום עולם</p>');
    expect(result).toBe('<p dir="rtl">שלום עולם</p>');
  });

  it('adds dir="ltr" to <p> with English text', () => {
    const result = applyBidiToHtml('<p>Hello world</p>');
    expect(result).toBe('<p dir="ltr">Hello world</p>');
  });

  it('adds dir="rtl" to <p> with mixed content (Hebrew dominant)', () => {
    const result = applyBidiToHtml('<p>שלום Hello עולם</p>');
    expect(result).toBe('<p dir="rtl">שלום Hello עולם</p>');
  });

  it('adds dir="rtl" to <h1> with Hebrew text', () => {
    const result = applyBidiToHtml('<h1>כותרת ראשית</h1>');
    expect(result).toBe('<h1 dir="rtl">כותרת ראשית</h1>');
  });

  it('adds dir="ltr" to <h2> with English text', () => {
    const result = applyBidiToHtml('<h2>English Heading</h2>');
    expect(result).toBe('<h2 dir="ltr">English Heading</h2>');
  });

  it('adds dir="rtl" to tight <li> with Hebrew text', () => {
    const result = applyBidiToHtml('<ul>\n<li>פריט ראשון</li>\n</ul>');
    expect(result).toContain('<li dir="rtl">פריט ראשון</li>');
  });

  it('does not modify loose <li> (contains <p>); inner <p> gets dir', () => {
    const input = '<ul>\n<li><p>פריט רופף</p>\n</li>\n</ul>';
    const result = applyBidiToHtml(input);
    // The <li> itself should NOT have dir (it contains <p>)
    expect(result).toContain('<li><p dir="rtl">פריט רופף</p>\n</li>');
  });

  it('adds dir="rtl" to <td> with Hebrew text', () => {
    const result = applyBidiToHtml('<table><tr><td>שלום</td></tr></table>');
    expect(result).toContain('<td dir="rtl">שלום</td>');
  });

  it('preserves existing attrs on <th> and appends dir', () => {
    const result = applyBidiToHtml('<table><tr><th align="center">Name</th></tr></table>');
    expect(result).toContain('<th align="center" dir="ltr">Name</th>');
  });

  it('does not modify code blocks (<pre><code>)', () => {
    const input = '<pre><code class="hljs language-javascript">const x = 1;</code></pre>';
    const result = applyBidiToHtml(input);
    expect(result).toBe(input);
  });

  it('does not modify Mermaid wrappers', () => {
    const input = '<div class="mermaid-wrapper"><div class="mermaid">graph TD\nA-->B</div></div>';
    const result = applyBidiToHtml(input);
    expect(result).toBe(input);
  });

  it('correctly detects direction when <p> contains inline HTML tags', () => {
    const result = applyBidiToHtml('<p><strong>שלום עולם</strong> hi</p>');
    expect(result).toBe('<p dir="rtl"><strong>שלום עולם</strong> hi</p>');
  });

  it('handles mixed document with multiple elements of different directions', () => {
    const input = [
      '<h1>כותרת</h1>',
      '<p>This is English text</p>',
      '<p>זה טקסט בעברית</p>',
      '<ul>\n<li>English item</li>\n<li>פריט עברי</li>\n</ul>',
      '<table><tr><td>Hello</td><td>שלום</td></tr></table>',
      '<pre><code>const x = 1;</code></pre>',
    ].join('\n');

    const result = applyBidiToHtml(input);

    expect(result).toContain('<h1 dir="rtl">כותרת</h1>');
    expect(result).toContain('<p dir="ltr">This is English text</p>');
    expect(result).toContain('<p dir="rtl">זה טקסט בעברית</p>');
    expect(result).toContain('<li dir="ltr">English item</li>');
    expect(result).toContain('<li dir="rtl">פריט עברי</li>');
    expect(result).toContain('<td dir="ltr">Hello</td>');
    expect(result).toContain('<td dir="rtl">שלום</td>');
    expect(result).toContain('<pre><code>const x = 1;</code></pre>');
  });
});
