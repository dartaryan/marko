// lib/export/html-generator.ts
import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import type { ColorTheme } from '@/types/colors';
import type { DocDirection } from '@/types/editor';

export function exportHtml(
  content: string,
  theme: ColorTheme,
  dir: DocDirection,
  filename: string
): void {
  const rawHtml = renderMarkdown(content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildHtmlDocument(sanitizedHtml, theme, dir, filename);
  triggerDownload(html, `${filename}.html`, 'text/html;charset=utf-8');
}

function buildHtmlDocument(
  bodyHtml: string,
  theme: ColorTheme,
  dir: DocDirection,
  title: string
): string {
  return `<!DOCTYPE html>
<html lang="he" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
${buildRootVars(theme, dir)}
${PREVIEW_CONTENT_CSS}
  </style>
</head>
<body>
  <div class="preview-content">${bodyHtml}</div>
</body>
</html>`;
}

function buildRootVars(theme: ColorTheme, dir: DocDirection): string {
  return `:root {
  --doc-direction: ${dir};
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
}`;
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Complete .preview-content CSS from app/globals.css — self-contained copy.
// Uses var() references that resolve against the :root block above.
// Note: font-family uses system-ui fallback (no Next.js font variables in standalone HTML).
const PREVIEW_CONTENT_CSS = `
body {
  margin: 0;
  padding: 2rem;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background-color: var(--color-preview-bg);
}

.preview-content {
  color: var(--color-primary-text);
  background-color: var(--color-preview-bg);
  line-height: 1.7;
  direction: var(--doc-direction);
}

.preview-content h1 {
  color: var(--color-h1);
  border-bottom: 2px solid var(--color-h1-border);
  padding-bottom: 0.25rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.875rem;
  font-weight: 700;
}

.preview-content h2 {
  color: var(--color-h2);
  border-bottom: 1px solid var(--color-h2-border);
  padding-bottom: 0.125rem;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.preview-content h3 {
  color: var(--color-h3);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.preview-content h4,
.preview-content h5,
.preview-content h6 {
  color: var(--color-primary-text);
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.preview-content p { margin-bottom: 1rem; }

.preview-content a {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.preview-content a:hover { opacity: 0.8; }

.preview-content code:not(pre code) {
  color: var(--color-code);
  background-color: var(--color-code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  direction: ltr;
  unicode-bidi: embed;
}

.preview-content pre {
  background-color: var(--color-code-bg);
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  direction: ltr;
}

.preview-content pre code {
  display: block;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  direction: ltr;
}

.preview-content blockquote {
  background-color: var(--color-blockquote-bg);
  border-inline-start: 4px solid var(--color-blockquote-border);
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  border-radius: 0 0.25rem 0.25rem 0;
}

.preview-content blockquote p:last-child { margin-bottom: 0; }

.preview-content ul,
.preview-content ol {
  padding-inline-start: 1.5rem;
  margin-bottom: 1rem;
}

.preview-content li { margin-bottom: 0.25rem; }

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.preview-content thead { background-color: var(--color-table-header); }

.preview-content th,
.preview-content td {
  border: 1px solid var(--color-table-border);
  padding: 0.5rem 0.75rem;
  text-align: start;
}

.preview-content tbody tr:nth-child(even) { background-color: var(--color-table-alt); }

.preview-content hr {
  border: none;
  border-top: 1px solid var(--color-hr);
  margin: 1.5rem 0;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
}

.mermaid-wrapper {
  margin: 1.25rem 0;
  display: flex;
  justify-content: center;
  direction: ltr;
  overflow-x: auto;
}
`;
