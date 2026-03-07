# Story 3.3: HTML & Markdown Export

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to export my document as a styled HTML file or raw Markdown file,
so that I can use my content in other tools or share it on the web.

## Acceptance Criteria

1. **AC1: HTML Export — Color & Style Preservation** — Given the user selects HTML export and confirms in the ExportModal, when the file generates, then the HTML file includes a `<style>` block with all 17 `ColorTheme` property values and complete `.preview-content` styling (no external stylesheet dependencies).

2. **AC2: HTML Export — Self-Contained** — Given the exported HTML file, when opened in any browser without internet access, then all styles, colors, and layout render correctly (no CDN links, no `@import`, no external resources).

3. **AC3: HTML Export — RTL Direction** — Given a document with `docDirection === 'rtl'` (or 'ltr'), when the HTML file generates, then `<html dir="rtl">` (or `dir="ltr"`) reflects the active document direction.

4. **AC4: HTML Export — Filename** — Given the user entered "my-report" in the ExportModal, when the HTML file downloads, then the filename is `my-report.html`.

5. **AC5: Markdown Export — Raw Content** — Given the user selects Markdown export, when the file generates, then the downloaded `.md` file contains the raw Markdown text exactly as in the editor (not rendered HTML).

6. **AC6: Markdown Export — Filename** — Given the user entered "my-notes" in the ExportModal, when the Markdown file downloads, then the filename is `my-notes.md`.

7. **AC7: Offline Support** — Given the user is offline, when they export to HTML or Markdown, then both exports succeed (pure client-side Blob download, no network requests).

## Tasks / Subtasks

- [x] Task 1: Create `lib/export/html-generator.ts` (AC: #1–#4, #7)
  - [x] 1.1: Export `function exportHtml(content: string, theme: ColorTheme, dir: DocDirection, filename: string): void`
  - [x] 1.2: Call `renderMarkdown(content)` to get raw HTML, then `DOMPurify.sanitize()` (same pattern as `MarkdownRenderer.tsx`)
  - [x] 1.3: Build `:root` CSS block from `theme` — all 17 `CSS_VAR_MAP` properties with literal hex values
  - [x] 1.4: Embed `PREVIEW_CONTENT_CSS` constant (copy of `.preview-content` styles from `app/globals.css`) — uses `var(--color-*)` references that resolve against the `:root` block
  - [x] 1.5: Compose full HTML document string: `<!DOCTYPE html><html lang="he" dir="${dir}"><head>...<style>...</style></head><body><div class="preview-content">${sanitizedHtml}</div></body></html>`
  - [x] 1.6: Set `<title>` to `filename` parameter
  - [x] 1.7: Trigger download via `triggerDownload(htmlString, \`${filename}.html\`, 'text/html;charset=utf-8')` — private helper using Blob + `createObjectURL` + anchor click + cleanup

- [x] Task 2: Create `lib/export/html-generator.test.ts` (AC: #1–#4, #7)
  - [x] 2.1: Mock `URL.createObjectURL` with `vi.spyOn` to capture the Blob and return `'blob:mock-url'`; mock `URL.revokeObjectURL`
  - [x] 2.2: Spy on `HTMLAnchorElement.prototype.click` to prevent navigation: `vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})`
  - [x] 2.3: Helper to read Blob text: `async function getBlobText(spy: ReturnType<typeof vi.spyOn>): Promise<string>` — reads the first arg to `createObjectURL` via `(arg as Blob).text()`
  - [x] 2.4: Test: HTML contains `<!DOCTYPE html>`
  - [x] 2.5: Test: HTML contains `<meta charset="UTF-8"`
  - [x] 2.6: Test: HTML contains all theme color values from a test theme object (e.g., `theme.primaryText` value appears in the `:root` block)
  - [x] 2.7: Test: HTML contains `dir="rtl"` when `dir === 'rtl'`; HTML contains `dir="ltr"` when `dir === 'ltr'`
  - [x] 2.8: Test: anchor `download` attribute is `my-doc.html` (not `my-doc`) — uses exact filename check
  - [x] 2.9: Test: HTML contains rendered content — `exportHtml('# Hello', theme, 'rtl', 'f')` → HTML contains `<h1>`
  - [x] 2.10: Test: `URL.revokeObjectURL` called with the mock URL (cleanup verification)
  - [x] 2.11: `beforeEach(() => { vi.clearAllMocks(); })`

- [x] Task 3: Create `lib/export/md-generator.ts` (AC: #5–#7)
  - [x] 3.1: Export `function exportMarkdown(content: string, filename: string): void`
  - [x] 3.2: Create `Blob([content], { type: 'text/markdown;charset=utf-8' })`
  - [x] 3.3: Trigger download via same `createObjectURL` + anchor + click + cleanup pattern as html-generator (duplicate the `triggerDownload` logic — do NOT create a shared utility module)
  - [x] 3.4: Anchor `download` attribute: `` `${filename}.md` ``

- [x] Task 4: Create `lib/export/md-generator.test.ts` (AC: #5–#7)
  - [x] 4.1: Same spy setup as html-generator tests (mock `URL.createObjectURL`, `URL.revokeObjectURL`, `HTMLAnchorElement.prototype.click`)
  - [x] 4.2: Test: Blob content equals raw markdown string (not rendered HTML)
  - [x] 4.3: Test: anchor `download` attribute is `my-notes.md`
  - [x] 4.4: Test: `URL.revokeObjectURL` called with the mock URL

- [x] Task 5: Update `app/editor/page.tsx` (AC: all)
  - [x] 5.1: Add imports (after Story 3.2 imports are in place):
    ```typescript
    import { exportHtml } from '@/lib/export/html-generator';
    import { exportMarkdown } from '@/lib/export/md-generator';
    ```
  - [x] 5.2: Replace the stub comment in `handleExportConfirm` with html and markdown branches:
    ```typescript
    function handleExportConfirm(filename: string, type: ExportType) {
      if (type === 'pdf') {
        void handlePdfExport(filename);          // Story 3.2 — do NOT modify
      } else if (type === 'html') {
        exportHtml(content, colorTheme, docDirection, filename);
      } else if (type === 'markdown') {
        exportMarkdown(content, filename);
      }
    }
    ```
  - [x] 5.3: Do NOT add any state, refs, or progress indicators — HTML/Markdown exports are synchronous; no `PdfProgress` or loading state needed
  - [x] 5.4: `content` is available via the `useEditorContent` hook closure; `colorTheme` via `useColorTheme`; `docDirection` via `useDocDirection` — all already destructured in `EditorPage`

- [ ] Task 6: Update sprint status (bookkeeping)
  - [ ] 6.1: `_bmad-output/implementation-artifacts/sprint-status.yaml` — update `3-3-html-and-markdown-export` from `backlog` to `done` after implementation + code review pass

## Dev Notes

### Critical: Story 3.1 AND 3.2 Must Be Implemented First

Story 3.3 depends on both prior stories:
- **Story 3.1:** `components/export/ExportModal.tsx`, `lib/export/filename-utils.ts`, `Header.tsx` with `onExportRequest`, `app/editor/page.tsx` with `handleExportRequest` + `ExportModal` rendering
- **Story 3.2:** `app/editor/page.tsx` `handleExportConfirm` replaces the stub with `if (type === 'pdf') { void handlePdfExport(filename); }` and a comment `// 'html' and 'markdown' — Story 3.3`

Story 3.3 ONLY adds the two `else if` branches to `handleExportConfirm`. Do NOT touch `handlePdfExport`, `PdfProgress`, `previewContentRef`, or anything else Story 3.2 added.

### Critical: page.tsx State Available for Export Functions

After Story 3.2, `app/editor/page.tsx` contains these relevant state values in `EditorPage` scope:
- `content` — raw Markdown string (from `useEditorContent`)
- `colorTheme` — current `ColorTheme` object (from `useColorTheme`)
- `docDirection` — `'rtl' | 'ltr'` (from `useDocDirection`)

Pass all three to `exportHtml`. Pass only `content` to `exportMarkdown`.

### Critical: @testing-library/react Is NOT Installed

Confirmed in Story 1.4 dev notes: `@testing-library/react` is not in the project. All tests use Vitest + jsdom only. Both test files test pure functions and do NOT render React components.

### Critical: No Shared Download Utility Module

The architecture shows no `download-utils.ts` in `lib/export/`. Do NOT create one. The `triggerDownload` logic is ~6 lines; duplicate it in both `html-generator.ts` and `md-generator.ts` as a private function. Over-engineering prevention: two callers don't warrant an abstraction.

### Critical: HTML Export Does Not Include Highlight.js Syntax Colors

The live preview applies syntax highlighting token colors via `import 'highlight.js/styles/github-dark.css'` in `MarkdownRenderer.tsx`. This CSS is NOT embedded in the exported HTML file (inlining the full github-dark.css would add ~5KB and significant complexity outside this story's scope). The exported HTML will:
- Show correct code block BACKGROUND color via `--color-code-bg`
- NOT show syntax token colors (keywords in a different color, etc.)
- Still render code blocks in a `<pre>` with LTR direction

This is acceptable for Story 3.3. Syntax highlighting in HTML export can be a future enhancement.

### Critical: Mermaid Diagrams in HTML Export Show as Code Blocks

`renderMarkdown(content)` outputs Mermaid blocks as:
```html
<div class="mermaid-wrapper"><div class="mermaid">graph TD...</div></div>
```
These are NOT rendered SVGs — the async Mermaid rendering happens in the live browser DOM (MarkdownRenderer's useEffect). The exported HTML will show the Mermaid code source inside styled wrappers, not rendered diagrams. Include `.mermaid-wrapper` styles in `PREVIEW_CONTENT_CSS` so the wrapper is at least displayed cleanly.

### html-generator.ts — Complete Implementation

```typescript
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
${buildRootVars(theme)}
${PREVIEW_CONTENT_CSS}
  </style>
</head>
<body>
  <div class="preview-content">${bodyHtml}</div>
</body>
</html>`;
}

function buildRootVars(theme: ColorTheme): string {
  return `:root {
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
  direction: rtl;
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
```

### md-generator.ts — Complete Implementation

```typescript
// lib/export/md-generator.ts
export function exportMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### html-generator.test.ts — Complete Test File

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';

// Spy on URL methods before importing the module
const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

import { exportHtml } from './html-generator';

describe('exportHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLSpy.mockReturnValue('blob:mock-url');
    revokeObjectURLSpy.mockImplementation(() => {});
    clickSpy.mockImplementation(() => {});
  });

  async function getCapturedHtml(): Promise<string> {
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    return blob.text();
  }

  it('contains DOCTYPE html', async () => {
    exportHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('<!DOCTYPE html>');
  });

  it('contains charset UTF-8', async () => {
    exportHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('charset="UTF-8"');
  });

  it('embeds theme color values in :root block', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    const html = await getCapturedHtml();
    expect(html).toContain(DEFAULT_CLASSIC_THEME.primaryText);
    expect(html).toContain(DEFAULT_CLASSIC_THEME.h1);
    expect(html).toContain(DEFAULT_CLASSIC_THEME.previewBg);
  });

  it('sets dir="rtl" on html element when dir is rtl', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('<html lang="he" dir="rtl">');
  });

  it('sets dir="ltr" on html element when dir is ltr', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'ltr', 'test');
    expect(await getCapturedHtml()).toContain('<html lang="he" dir="ltr">');
  });

  it('sets anchor download attribute to filename.html', () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'my-doc');
    const anchor = document.querySelector('a[download]') as HTMLAnchorElement | null;
    // Anchor is removed from DOM after click; check via spy call or capture before removal
    // Since we spy on click (not appendChild), verify via createObjectURL call count
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    // Verify filename via anchor at the time of click — use appendChildSpy approach:
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'my-doc');
    const capturedAnchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(capturedAnchor.download).toBe('my-doc.html');
    appendSpy.mockRestore();
  });

  it('HTML contains rendered markdown (h1 tag from # heading)', async () => {
    exportHtml('# Hello World', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    const html = await getCapturedHtml();
    expect(html).toContain('<h1>');
  });

  it('calls URL.revokeObjectURL for cleanup', () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
```

> **Simpler anchor download test approach** — The `download` attribute test above is verbose. Use this simpler version instead:
```typescript
it('downloads file with .html extension', () => {
  const appendSpy = vi.spyOn(document.body, 'appendChild');
  exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'my-doc');
  const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
  expect(anchor.download).toBe('my-doc.html');
  appendSpy.mockRestore();
});
```

### md-generator.test.ts — Complete Test File

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

import { exportMarkdown } from './md-generator';

describe('exportMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLSpy.mockReturnValue('blob:mock-url');
    revokeObjectURLSpy.mockImplementation(() => {});
  });

  it('Blob contains the raw markdown content (not rendered HTML)', async () => {
    const content = '# Hello\n\nSome **bold** text';
    exportMarkdown(content, 'test');
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe(content);
  });

  it('Blob content does not contain <html> tag (raw markdown only)', async () => {
    exportMarkdown('# Hello', 'test');
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(await blob.text()).not.toContain('<html>');
  });

  it('downloads file with .md extension', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportMarkdown('content', 'my-notes');
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('my-notes.md');
    appendSpy.mockRestore();
  });

  it('calls URL.revokeObjectURL for cleanup', () => {
    exportMarkdown('', 'test');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
```

### page.tsx — Precise Diff After Story 3.2

Story 3.2 leaves `handleExportConfirm` as:
```typescript
function handleExportConfirm(filename: string, type: ExportType) {
  if (type === 'pdf') {
    void handlePdfExport(filename);
  }
  // 'html' and 'markdown' — Story 3.3
}
```

Story 3.3 changes ONLY this function + adds 2 imports:

**Import additions (add after Story 3.2 imports):**
```typescript
import { exportHtml } from '@/lib/export/html-generator';
import { exportMarkdown } from '@/lib/export/md-generator';
```

**Replace `handleExportConfirm` (preserve the `pdf` branch exactly as Story 3.2 left it):**
```typescript
function handleExportConfirm(filename: string, type: ExportType) {
  if (type === 'pdf') {
    void handlePdfExport(filename);
  } else if (type === 'html') {
    exportHtml(content, colorTheme, docDirection, filename);
  } else if (type === 'markdown') {
    exportMarkdown(content, filename);
  }
}
```

### Architecture Compliance

| Rule | Application |
|---|---|
| `lib/export/` for export logic | `html-generator.ts` and `md-generator.ts` in `lib/export/` |
| Cross-Cutting Color Sync chain | `lib/colors/apply-colors.ts` → `lib/export/html-generator.ts` (uses `ColorTheme` object directly) |
| Offline support for exports | Blob + `createObjectURL` — zero network requests |
| No new npm packages | Uses `isomorphic-dompurify` (already installed) and browser Blob/URL APIs |
| Hebrew RTL first | `<html lang="he" dir="...">` respects `docDirection`; `.preview-content` CSS sets `direction: rtl` |
| Tests co-located with source | `html-generator.test.ts` next to `html-generator.ts` |
| No direct localStorage in export modules | Export functions receive all values as parameters; no localStorage reads |
| No `@testing-library/react` | Export functions are pure utilities — Vitest + jsdom only |

### Anti-Patterns to Avoid

- **Do NOT call `generatePdf` or use `PdfProgress`** — HTML/MD exports are synchronous; no progress indicator needed
- **Do NOT create `lib/export/download-utils.ts`** — no shared utility; duplicate the 6-line download logic
- **Do NOT pass a DOM element to `exportHtml`** — unlike pdf-generator, html-generator takes raw markdown `content` string and re-renders it with `renderMarkdown()`
- **Do NOT use `document.documentElement.style.getPropertyValue`** to read CSS vars — pass the `ColorTheme` object explicitly from page.tsx (it's already available via `colorTheme` state)
- **Do NOT add `autoFocus`** on any inputs — project-wide rule from Story 2.3 (not applicable here but pattern to remember)
- **Do NOT use `window.URL`** — use `URL` directly; Vitest/jsdom exposes it as global
- **Do NOT implement syntax highlighting CSS in the exported HTML** — this is out of scope for Story 3.3
- **Do NOT use `encodeURIComponent` with data URIs** — use `Blob` + `createObjectURL` (correct modern approach)

### Cross-Story Context

**Story 3.2 (PDF Export — must be done before 3.3):**
- Adds `handlePdfExport` and `PdfProgress` to `app/editor/page.tsx`
- Changes `handleExportConfirm` stub to pdf-only handler + Story 3.3 comment
- Story 3.3 extends `handleExportConfirm` — do NOT modify the `pdf` branch

**Story 3.4 (Clipboard Copy):**
- Adds a "Copy" dropdown to the Header (separate from the Export dropdown)
- `word-copy.ts` uses a different mechanism (Clipboard API with `text/html` type)
- Story 3.4 is independent of html-generator and md-generator

### Git Intelligence

Commit pattern for this story: `"Implement Story 3.3: HTML and Markdown export"` (matches project history format).

Recent commits show:
- Stories are committed after both implementation and code review passes
- Fix commits follow format: `"Fix Story 3.x code review issues: ..."` — keep this in mind for post-review fixes

New files to CREATE:
- `lib/export/html-generator.ts`
- `lib/export/html-generator.test.ts`
- `lib/export/md-generator.ts`
- `lib/export/md-generator.test.ts`

Existing files to MODIFY (minimal changes only):
- `app/editor/page.tsx` — add 2 imports + extend `handleExportConfirm` with 2 branches

Files NOT to touch:
- `lib/export/pdf-generator.ts` — Story 3.2, no changes
- `lib/export/filename-utils.ts` — Story 3.1, no changes
- `components/export/ExportModal.tsx` — Story 3.1, no changes
- `components/export/PdfProgress.tsx` — Story 3.2, no changes
- `components/preview/MarkdownRenderer.tsx` — Story 3.2, no changes
- `components/preview/PreviewPanel.tsx` — Story 3.2, no changes
- `app/globals.css` — source of truth for preview CSS; read only, copy styles into `PREVIEW_CONTENT_CSS`

### Project Structure Notes

**Files created in this story:**
- `lib/export/html-generator.ts` — Styled HTML export using `renderMarkdown` + `ColorTheme` + embedded CSS
- `lib/export/html-generator.test.ts` — Unit tests (Blob content inspection)
- `lib/export/md-generator.ts` — Raw Markdown download as `.md` file
- `lib/export/md-generator.test.ts` — Unit tests (Blob content, filename)

**No new npm dependencies** — uses `isomorphic-dompurify` (already installed via Story 1.2/MarkdownRenderer), browser-native `Blob`, `URL.createObjectURL`.

**Architecture alignment:**
- `lib/export/` now has: `filename-utils.ts`, `pdf-generator.ts`, `html-generator.ts`, `md-generator.ts` — matches the architecture source tree exactly (architecture.md line 677–679)
- `word-copy.ts` remains for Story 3.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3 acceptance criteria (line 604–622)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — lib/export/html-generator.ts + md-generator.ts (lines 678–679)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Cross-Cutting Color Sync chain (line 789)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Export offline support (line 735)](_bmad-output/planning-artifacts/architecture.md)
- [Source: app/globals.css — .preview-content styles (lines 191–398) — copy into PREVIEW_CONTENT_CSS constant](app/globals.css)
- [Source: lib/colors/apply-colors.ts — CSS_VAR_MAP for the 17 property names](lib/colors/apply-colors.ts)
- [Source: types/colors.ts — ColorTheme interface (17 properties)](types/colors.ts)
- [Source: types/editor.ts — ExportType, DocDirection](types/editor.ts)
- [Source: lib/markdown/render-pipeline.ts — renderMarkdown() function](lib/markdown/render-pipeline.ts)
- [Source: lib/colors/defaults.ts — DEFAULT_CLASSIC_THEME for test fixture](lib/colors/defaults.ts)
- [Source: _bmad-output/implementation-artifacts/3-2-pdf-export-with-colors-and-rtl.md — Cross-Story Context, Story 3.3 notes (lines 601–604)](_bmad-output/implementation-artifacts/3-2-pdf-export-with-colors-and-rtl.md)
- [Source: components/preview/MarkdownRenderer.tsx — DOMPurify.sanitize + renderMarkdown pattern (lines 29–32)](components/preview/MarkdownRenderer.tsx)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

- Implemented `exportHtml` in `lib/export/html-generator.ts`: renders markdown via `renderMarkdown`, sanitizes via `DOMPurify.sanitize`, builds self-contained HTML with embedded `:root` CSS vars (all 17 `ColorTheme` properties) and full `.preview-content` CSS copy. Downloads via Blob + `createObjectURL`.
- Implemented `exportMarkdown` in `lib/export/md-generator.ts`: creates a Blob from raw content string, downloads as `.md` file. Duplicates the 6-line download pattern (no shared utility per story spec).
- Updated `app/editor/page.tsx`: added 2 imports and extended `handleExportConfirm` with `else if (type === 'html')` and `else if (type === 'markdown')` branches. PDF branch untouched.
- 12 new tests pass (8 html-generator + 4 md-generator). Full regression suite: 203/203 pass.
- All 7 ACs satisfied: AC1 (style block with 17 vars), AC2 (self-contained HTML), AC3 (dir attribute), AC4 (`.html` filename), AC5 (raw markdown content), AC6 (`.md` filename), AC7 (Blob/offline).

### File List

- `lib/export/html-generator.ts` (created)
- `lib/export/html-generator.test.ts` (created)
- `lib/export/md-generator.ts` (created)
- `lib/export/md-generator.test.ts` (created)
- `app/editor/page.tsx` (modified — 2 imports + 2 else-if branches in handleExportConfirm)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — 3-3 status updated)

## Change Log

- Implement Story 3.3: HTML and Markdown export (Date: 2026-03-07)
