import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { hljs } from './highlight-setup';

// HTML-escape helper to safely embed Mermaid source in HTML (prevents XSS)
function escapeMermaidSource(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (!lang || !hljs.getLanguage(lang)) return code;
      return hljs.highlight(code, { language: lang }).value;
    },
  }),
  {
    gfm: true,
    breaks: true,
    renderer: {
      code({ text, lang }) {
        if (lang === 'mermaid') {
          return `<div class="mermaid-wrapper"><div class="mermaid">${escapeMermaidSource(text)}</div></div>\n`;
        }
        return false;
      },
    },
  }
);
