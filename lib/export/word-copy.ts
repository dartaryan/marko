// lib/export/word-copy.ts
import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import type { ColorTheme } from '@/types/colors';
import type { DocDirection } from '@/types/editor';

export async function copyForWord(
  content: string,
  theme: ColorTheme,
  dir: DocDirection
): Promise<void> {
  const rawHtml = renderMarkdown(content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildWordHtml(sanitizedHtml, theme, dir);
  await writeHtmlToClipboard(html);
}

export async function copyHtml(
  content: string,
  theme: ColorTheme,
  dir: DocDirection
): Promise<void> {
  const rawHtml = renderMarkdown(content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildCssVarHtml(sanitizedHtml, theme, dir);
  await writeHtmlToClipboard(html);
}

export async function copyText(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}

async function writeHtmlToClipboard(html: string): Promise<void> {
  const blob = new Blob([html], { type: 'text/html' });
  const item = new ClipboardItem({ 'text/html': blob });
  await navigator.clipboard.write([item]);
}

// Word-compatible HTML: literal hex values, no CSS custom properties.
// Word does not process var(--color-*) references.
function buildWordHtml(bodyHtml: string, theme: ColorTheme, dir: DocDirection): string {
  const lang = dir === 'rtl' ? 'he' : 'en';
  const blockStart = dir === 'rtl' ? 'right' : 'left';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <style>
body {
  direction: ${dir};
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background-color: ${theme.previewBg};
  margin: 0;
  padding: 1rem;
}
.preview-content {
  color: ${theme.primaryText};
  line-height: 1.7;
  direction: ${dir};
}
.preview-content h1 { color: ${theme.h1}; border-bottom: 2px solid ${theme.h1Border}; padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.875rem; font-weight: 700; }
.preview-content h2 { color: ${theme.h2}; border-bottom: 1px solid ${theme.h2Border}; padding-bottom: 0.125rem; margin-top: 1.25rem; margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 600; }
.preview-content h3 { color: ${theme.h3}; margin-top: 1rem; margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 600; }
.preview-content h4, .preview-content h5, .preview-content h6 { color: ${theme.primaryText}; font-weight: 600; }
.preview-content p { margin-bottom: 1rem; }
.preview-content a { color: ${theme.link}; text-decoration: underline; }
.preview-content code:not(pre code) { color: ${theme.code}; background-color: ${theme.codeBg}; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; direction: ltr; unicode-bidi: embed; }
.preview-content pre { background-color: ${theme.codeBg}; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; direction: ltr; }
.preview-content pre code { display: block; padding: 1rem; font-size: 0.875rem; line-height: 1.6; direction: ltr; }
.preview-content blockquote { background-color: ${theme.blockquoteBg}; border-${blockStart}: 4px solid ${theme.blockquoteBorder}; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 0.25rem 0.25rem 0; }
.preview-content ul, .preview-content ol { padding-${blockStart}: 1.5rem; margin-bottom: 1rem; }
.preview-content li { margin-bottom: 0.25rem; }
.preview-content table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.preview-content thead { background-color: ${theme.tableHeader}; }
.preview-content th, .preview-content td { border: 1px solid ${theme.tableBorder}; padding: 0.5rem 0.75rem; text-align: ${blockStart}; }
.preview-content tbody tr:nth-child(even) { background-color: ${theme.tableAlt}; }
.preview-content hr { border: none; border-top: 1px solid ${theme.hr}; margin: 1.5rem 0; }
.preview-content img { max-width: 100%; height: auto; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <div class="preview-content">${bodyHtml}</div>
</body>
</html>`;
}

// Browser-compatible HTML: CSS custom properties via :root block.
// Same pattern as html-generator.ts buildRootVars + PREVIEW_CONTENT_CSS.
function buildCssVarHtml(bodyHtml: string, theme: ColorTheme, dir: DocDirection): string {
  const lang = dir === 'rtl' ? 'he' : 'en';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <style>
:root {
  --color-primary-text: ${theme.primaryText};
  --color-secondary-text: ${theme.secondaryText};
  --color-link: ${theme.link};
  --color-code: ${theme.code};
  --color-h1: ${theme.h1};
  --color-h1-border: ${theme.h1Border};
  --color-h2: ${theme.h2};
  --color-h2-border: ${theme.h2Border};
  --color-h3: ${theme.h3};
  --color-preview-bg: ${theme.previewBg};
  --color-code-bg: ${theme.codeBg};
  --color-blockquote-bg: ${theme.blockquoteBg};
  --color-table-header: ${theme.tableHeader};
  --color-table-alt: ${theme.tableAlt};
  --color-blockquote-border: ${theme.blockquoteBorder};
  --color-hr: ${theme.hr};
  --color-table-border: ${theme.tableBorder};
}
body { direction: ${dir}; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background-color: var(--color-preview-bg); margin: 0; padding: 1rem; }
.preview-content { color: var(--color-primary-text); line-height: 1.7; direction: ${dir}; }
.preview-content h1 { color: var(--color-h1); border-bottom: 2px solid var(--color-h1-border); padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.875rem; font-weight: 700; }
.preview-content h2 { color: var(--color-h2); border-bottom: 1px solid var(--color-h2-border); padding-bottom: 0.125rem; margin-top: 1.25rem; margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 600; }
.preview-content h3 { color: var(--color-h3); margin-top: 1rem; margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 600; }
.preview-content h4, .preview-content h5, .preview-content h6 { color: var(--color-primary-text); font-weight: 600; }
.preview-content p { margin-bottom: 1rem; }
.preview-content a { color: var(--color-link); text-decoration: underline; }
.preview-content code:not(pre code) { color: var(--color-code); background-color: var(--color-code-bg); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; direction: ltr; unicode-bidi: embed; }
.preview-content pre { background-color: var(--color-code-bg); border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; direction: ltr; }
.preview-content pre code { display: block; padding: 1rem; font-size: 0.875rem; line-height: 1.6; direction: ltr; }
.preview-content blockquote { background-color: var(--color-blockquote-bg); border-inline-start: 4px solid var(--color-blockquote-border); padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 0.25rem 0.25rem 0; }
.preview-content ul, .preview-content ol { padding-inline-start: 1.5rem; margin-bottom: 1rem; }
.preview-content li { margin-bottom: 0.25rem; }
.preview-content table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.preview-content thead { background-color: var(--color-table-header); }
.preview-content th, .preview-content td { border: 1px solid var(--color-table-border); padding: 0.5rem 0.75rem; text-align: start; }
.preview-content tbody tr:nth-child(even) { background-color: var(--color-table-alt); }
.preview-content hr { border: none; border-top: 1px solid var(--color-hr); margin: 1.5rem 0; }
.preview-content img { max-width: 100%; height: auto; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <div class="preview-content">${bodyHtml}</div>
</body>
</html>`;
}
