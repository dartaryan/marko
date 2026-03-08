import { detectSentenceDirection } from './detect-direction';

export function applyBidiToHtml(html: string): string {
  // Pass 1: <p> elements (includes paragraphs inside blockquotes and loose list items)
  let result = html.replace(/<p>([\s\S]*?)<\/p>/g, (_, content) => {
    const dir = detectSentenceDirection(content);
    return `<p dir="${dir}">${content}</p>`;
  });

  // Pass 2: headings h1-h6
  result = result.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_, tag, content) => {
    const dir = detectSentenceDirection(content);
    return `<${tag} dir="${dir}">${content}</${tag}>`;
  });

  // Pass 3: tight list items only (inline content, no block-level children)
  // Matches <li> content that does NOT contain <p>, <ul>, <ol>, <li>, or <div> opening tags
  // This targets tight lists; loose lists already have inner <p> with dir
  result = result.replace(
    /<li>([^<]*(?:<(?!\/?(li|p|ul|ol|div)\b)[^>]*>[^<]*)*)<\/li>/g,
    (_, content) => {
      const dir = detectSentenceDirection(content);
      return `<li dir="${dir}">${content}</li>`;
    }
  );

  // Pass 4: table cells (td and th), with optional existing attributes
  // Note: non-greedy [\s\S]*? matches the nearest </td>|</th>, so nested tables
  // (not produced by marked GFM) could match incorrectly.
  result = result.replace(
    /<(td|th)((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g,
    (_, tag, attrs, content) => {
      const dir = detectSentenceDirection(content);
      return `<${tag}${attrs} dir="${dir}">${content}</${tag}>`;
    }
  );

  return result;
}
