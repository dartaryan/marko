# Story 3.4: Clipboard Copy (Word & HTML/Text)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to copy my formatted content to the clipboard for pasting into Word or other applications,
so that I can use my styled document content in other tools without exporting files.

## Acceptance Criteria

1. **AC1: Copy for Word — Inline Hex Colors + RTL** — Given the user selects "Word" from the "העתק" (Copy) dropdown, when the copy executes, then `navigator.clipboard.write()` is called with a `ClipboardItem` whose `'text/html'` blob contains **literal hex color values** (no `var(--color-*)` references) and `dir="[active direction]"` on the HTML element, so the content pastes into Microsoft Word with correct RTL direction, colors, and formatting.

2. **AC2: Copy HTML** — Given the user selects "HTML" from the copy dropdown, when the copy executes, then `navigator.clipboard.write()` is called with a `ClipboardItem` whose `'text/html'` blob contains a complete HTML document with CSS `var()` references resolved against a `:root` block (same as `html-generator.ts` pattern) and `dir` matching active document direction.

3. **AC3: Copy Text (Raw Markdown)** — Given the user selects "טקסט" from the copy dropdown, when the copy executes, then `navigator.clipboard.writeText()` is called with the raw Markdown string exactly as stored in the editor (not rendered HTML).

4. **AC4: Hebrew Toast — Success** — Given any copy action completes successfully, when the clipboard write resolves, then a Sonner toast appears with Hebrew text `"!הועתק ללוח"` and auto-dismisses after ~3 seconds.

5. **AC5: Hebrew Toast — Error** — Given the clipboard API throws (e.g., permission denied), when the write rejects, then a Sonner toast error appears with Hebrew text `"שגיאה בהעתקה. נסה שוב."`.

6. **AC6: Copy Dropdown in Header** — Given the user views the header, then a `"העתק"` dropdown appears next to the `"ייצא"` dropdown with three items: Word, HTML, טקסט.

7. **AC7: Offline Support** — Given the user is offline, when they use any copy action, then all three copy types succeed (pure client-side Clipboard API, no network requests).

## Tasks / Subtasks

- [x] Task 1: Install Sonner and create Toaster component (AC: #4, #5)
  - [x] 1.1: Run `pnpm add sonner` to add the Sonner library
  - [x] 1.2: Create `components/ui/sonner.tsx` — simple wrapper WITHOUT `next-themes` (not installed):
    ```typescript
    'use client';
    import { Toaster as Sonner, type ToasterProps } from 'sonner';
    export function Toaster(props: ToasterProps) {
      return <Sonner {...props} />;
    }
    ```
  - [x] 1.3: In `app/layout.tsx`, add import and render `<Toaster>` inside `<body>`, AFTER `<ConvexClientProvider>{children}</ConvexClientProvider>`:
    ```tsx
    import { Toaster } from '@/components/ui/sonner';
    // ...
    <body ...>
      <ConvexClientProvider>{children}</ConvexClientProvider>
      <Toaster dir="rtl" position="bottom-center" />
    </body>
    ```

- [x] Task 2: Add `CopyType` to `types/editor.ts` (AC: #1–#3, #6)
  - [x] 2.1: Add after the existing `DocDirection` declaration:
    ```typescript
    /** Clipboard copy format for Story 3.4 */
    export type CopyType = 'word' | 'html' | 'text';
    ```

- [x] Task 3: Create `lib/export/word-copy.ts` (AC: #1–#3, #7)
  - [x] 3.1: Export three async functions: `copyForWord`, `copyHtml`, `copyText`
  - [x] 3.2: `copyForWord(content, theme, dir)` — renders markdown → DOMPurify.sanitize → `buildWordHtml` (LITERAL hex values, no `var()`) → `writeHtmlToClipboard`
  - [x] 3.3: `copyHtml(content, theme, dir)` — same pipeline but `buildCssVarHtml` (`:root { --color-* }` block) → `writeHtmlToClipboard`
  - [x] 3.4: `copyText(content)` — calls `navigator.clipboard.writeText(content)` directly
  - [x] 3.5: Private `writeHtmlToClipboard(html)` — `new Blob([html], { type: 'text/html' })` → `new ClipboardItem({ 'text/html': blob })` → `navigator.clipboard.write([item])`
  - [x] 3.6: `buildWordHtml` must use **literal hex values** from `ColorTheme` properties directly in CSS (e.g., `color: ${theme.primaryText}`) — Word does NOT process CSS custom properties
  - [x] 3.7: `buildCssVarHtml` uses `:root { --color-*: hex }` + `var(--color-*)` in CSS rules — same pattern as `buildRootVars` + `PREVIEW_CONTENT_CSS` in `html-generator.ts` (duplicate, do NOT import)
  - [x] 3.8: See "word-copy.ts — Complete Implementation" in Dev Notes for the full code

- [x] Task 4: Create `lib/export/word-copy.test.ts` (AC: #1–#3, #7)
  - [x] 4.1: Set up clipboard mocks and ClipboardItem stub BEFORE imports (top-level module scope):
    ```typescript
    const clipboardWriteSpy = vi.fn().mockResolvedValue(undefined);
    const clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, 'clipboard', {
      value: { write: clipboardWriteSpy, writeText: clipboardWriteTextSpy },
      writable: true,
    });
    global.ClipboardItem = class MockClipboardItem {
      constructor(public data: Record<string, Blob>) {}
    } as unknown as typeof ClipboardItem;

    import { copyForWord, copyHtml, copyText } from './word-copy';
    ```
  - [x] 4.2: Test `copyForWord`: `clipboardWriteSpy` called once; first arg is array containing a MockClipboardItem with `'text/html'` key
  - [x] 4.3: Test `copyForWord` — blob text contains literal hex value (e.g., `DEFAULT_CLASSIC_THEME.primaryText`) NOT as `var(` prefix
  - [x] 4.4: Test `copyForWord` — HTML does NOT contain `var(--color-` (Word incompatibility guard)
  - [x] 4.5: Test `copyForWord` with `dir='rtl'` — blob text contains `dir="rtl"`
  - [x] 4.6: Test `copyForWord` with `dir='ltr'` — blob text contains `dir="ltr"`
  - [x] 4.7: Test `copyHtml`: `clipboardWriteSpy` called once; blob text contains `var(--color-` (CSS vars present for browser consumers)
  - [x] 4.8: Test `copyHtml` RTL: blob text contains `dir="rtl"` when dir is `'rtl'`
  - [x] 4.9: Test `copyText`: `clipboardWriteTextSpy` called with exact raw content string; `clipboardWriteSpy` NOT called
  - [x] 4.10: `beforeEach(() => { vi.clearAllMocks(); })`
  - [x] 4.11: Use `DEFAULT_CLASSIC_THEME` from `@/lib/colors/defaults` as the theme fixture

- [x] Task 5: Update `components/layout/Header.tsx` (AC: #6)
  - [x] 5.1: Add `CopyType` to the type import: `import type { ViewMode, DocDirection, ExportType, CopyType } from '@/types/editor'`
  - [x] 5.2: Add to `HeaderProps` interface: `onCopyRequest: (type: CopyType) => void`
  - [x] 5.3: Destructure `onCopyRequest` from props
  - [x] 5.4: Add copy items array (module-level, next to `exportItems`):
    ```typescript
    const copyItems = [
      { label: 'Word', value: 'word' },
      { label: 'HTML', value: 'html' },
      { label: 'טקסט', value: 'text' },
    ];
    ```
  - [x] 5.5: Add copy `ToolbarDropdown` in JSX, BEFORE the existing export `ToolbarDropdown`:
    ```tsx
    <ToolbarDropdown
      triggerLabel="העתק"
      triggerAriaLabel="העתק תוכן ללוח"
      items={copyItems}
      onSelect={(val) => onCopyRequest(val as CopyType)}
    />
    ```
  - [x] 5.6: Do NOT modify the existing export dropdown, other props, or any existing Header logic

- [x] Task 6: Update `app/editor/page.tsx` (AC: #1–#5)
  - [x] 6.1: Add imports (after existing export imports):
    ```typescript
    import { toast } from 'sonner';
    import { copyForWord, copyHtml, copyText } from '@/lib/export/word-copy';
    import type { CopyType } from '@/types/editor';
    ```
  - [x] 6.2: Add `handleCopyRequest` async function inside `EditorPage` (after `handlePdfExport`):
    ```typescript
    async function handleCopyRequest(type: CopyType) {
      try {
        if (type === 'word') {
          await copyForWord(content, colorTheme, docDirection);
        } else if (type === 'html') {
          await copyHtml(content, colorTheme, docDirection);
        } else if (type === 'text') {
          await copyText(content);
        }
        toast.success('!הועתק ללוח');
      } catch {
        toast.error('שגיאה בהעתקה. נסה שוב.');
      }
    }
    ```
  - [x] 6.3: Pass `onCopyRequest={handleCopyRequest}` to `<Header>` in JSX
  - [x] 6.4: `content` (from `useEditorContent`), `colorTheme` (from `useColorTheme`), `docDirection` (from `useDocDirection`) are already destructured — do NOT add new state

- [x] Task 7: Update sprint status (bookkeeping)
  - [x] 7.1: `_bmad-output/implementation-artifacts/sprint-status.yaml` — update `3-4-clipboard-copy-word-and-html-text` from `backlog` to `done` after implementation + code review pass

## Dev Notes

### Critical: No ExportModal — Copy is Immediate

Copy actions need **no filename and no modal**. The user selects Word/HTML/טקסט from the "העתק" dropdown and the clipboard write executes immediately. Do NOT use, adapt, or reference `ExportModal.tsx` for copy. This is the fundamental difference: exports need a filename dialog, copies do not.

### Critical: Sonner — No next-themes

The standard `npx shadcn@latest add sonner` creates a wrapper that uses `next-themes`. This project does **NOT** have `next-themes` installed — dark/light mode is handled via the custom `ThemeToggle` (Story 2.5). Create `components/ui/sonner.tsx` manually as the simple wrapper shown in Task 1.2 (no `useTheme` hook). Sonner works fine without the theme prop.

### Critical: Word Copy — Literal Hex Colors, No CSS vars

Word does NOT process CSS custom properties. For `copyForWord`, the CSS must use **literal hex values** taken directly from the `ColorTheme` object properties:

```css
/* CORRECT for Word */
.preview-content { color: #333333; background-color: #fafafa; }

/* WRONG for Word — Word ignores this */
.preview-content { color: var(--color-primary-text); }
```

Use `theme.primaryText`, `theme.h1`, `theme.previewBg`, etc. directly as string values in the CSS template literal.

### Critical: ClipboardItem and navigator.clipboard Not in jsdom

jsdom does not implement `ClipboardItem` or expose `navigator.clipboard`. Both must be mocked at module scope (before imports) in the test file. The mock setup in Task 4.1 is required — without it, the module will fail to load in the test environment.

### Critical: Async handleCopyRequest Assigned to `(type: CopyType) => void`

`Header.tsx` declares `onCopyRequest: (type: CopyType) => void`. The `handleCopyRequest` in `page.tsx` is `async` and returns `Promise<void>`. TypeScript allows this: a function returning `Promise<void>` satisfies a callback typed as `() => void` because the return value is discarded. No `void` wrapper or type cast is needed. This is the same pattern as the existing `onClick` handlers in `Header.tsx`.

### word-copy.ts — Complete Implementation

```typescript
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
  return `<!DOCTYPE html>
<html lang="he" dir="${dir}">
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
.preview-content blockquote { background-color: ${theme.blockquoteBg}; border-inline-start: 4px solid ${theme.blockquoteBorder}; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 0.25rem 0.25rem 0; }
.preview-content ul, .preview-content ol { padding-inline-start: 1.5rem; margin-bottom: 1rem; }
.preview-content li { margin-bottom: 0.25rem; }
.preview-content table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.preview-content thead { background-color: ${theme.tableHeader}; }
.preview-content th, .preview-content td { border: 1px solid ${theme.tableBorder}; padding: 0.5rem 0.75rem; text-align: start; }
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
  return `<!DOCTYPE html>
<html lang="he" dir="${dir}">
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
```

### word-copy.test.ts — Complete Test File

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';

// Must be set up before importing the module under test
const clipboardWriteSpy = vi.fn().mockResolvedValue(undefined);
const clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(global.navigator, 'clipboard', {
  value: { write: clipboardWriteSpy, writeText: clipboardWriteTextSpy },
  writable: true,
});
global.ClipboardItem = class MockClipboardItem {
  constructor(public data: Record<string, Blob>) {}
} as unknown as typeof ClipboardItem;

import { copyForWord, copyHtml, copyText } from './word-copy';

async function getBlobText(spy: typeof clipboardWriteSpy): Promise<string> {
  const clipboardItem = spy.mock.calls[0][0][0] as { data: Record<string, Blob> };
  const blob = clipboardItem.data['text/html'];
  return blob.text();
}

describe('copyForWord', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.write once', async () => {
    await copyForWord('# Hello', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(clipboardWriteSpy).toHaveBeenCalledTimes(1);
  });

  it('passes a ClipboardItem with text/html key', async () => {
    await copyForWord('hello', DEFAULT_CLASSIC_THEME, 'rtl');
    const item = clipboardWriteSpy.mock.calls[0][0][0] as { data: Record<string, Blob> };
    expect(item.data['text/html']).toBeInstanceOf(Blob);
  });

  it('blob contains literal hex value from theme (no var reference)', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'rtl');
    const html = await getBlobText(clipboardWriteSpy);
    expect(html).toContain(DEFAULT_CLASSIC_THEME.primaryText);
    expect(html).not.toContain('var(--color-');
  });

  it('blob contains dir="rtl" when dir is rtl', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="rtl"');
  });

  it('blob contains dir="ltr" when dir is ltr', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'ltr');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="ltr"');
  });
});

describe('copyHtml', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.write once', async () => {
    await copyHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(clipboardWriteSpy).toHaveBeenCalledTimes(1);
  });

  it('blob contains CSS var references (browser-compatible)', async () => {
    await copyHtml('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('var(--color-');
  });

  it('blob contains dir="rtl" when dir is rtl', async () => {
    await copyHtml('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="rtl"');
  });
});

describe('copyText', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.writeText with raw content', async () => {
    const content = '# Hello\n\nSome **bold** text';
    await copyText(content);
    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(content);
  });

  it('does NOT call navigator.clipboard.write (no ClipboardItem)', async () => {
    await copyText('test');
    expect(clipboardWriteSpy).not.toHaveBeenCalled();
  });
});
```

### Architecture Compliance

| Rule | Application |
|---|---|
| `lib/export/` for copy logic | `word-copy.ts` in `lib/export/` |
| Cross-Cutting Color Sync (5 targets) | `lib/colors/apply-colors.ts` → preview, `pdf-generator.ts`, `html-generator.ts`, **`word-copy.ts`**, `mermaid-setup.ts` — all 5 targets now covered |
| Offline support | `ClipboardItem` + `navigator.clipboard.write()` — zero network requests |
| No new npm packages (except Sonner) | Uses `isomorphic-dompurify` (already installed), browser native Clipboard API |
| Hebrew RTL first | `dir` attribute on `<html>` and `<body>`; `.preview-content` CSS sets `direction` |
| Tests co-located with source | `word-copy.test.ts` next to `word-copy.ts` |
| All UI text in Hebrew | Toast messages in Hebrew; "Word" and "HTML" stay English as proper nouns/tech terms; "טקסט" is Hebrew |
| Logical Tailwind properties | No new Tailwind in word-copy.ts; Header additions use existing className patterns only |

### Anti-Patterns to Avoid

- **Do NOT use ExportModal** — clipboard copy needs no filename; it is triggered immediately from the dropdown
- **Do NOT create a shared HTML-building utility** with `html-generator.ts` — two callers do not warrant abstraction (same rationale as Story 3.3's no shared `triggerDownload`)
- **Do NOT use `document.documentElement.style.getPropertyValue`** to read CSS vars — pass `ColorTheme` from `page.tsx` state directly as a function argument
- **Do NOT use `window.URL`, `createObjectURL`, or Blob download** — this is clipboard, not file download
- **Do NOT add `next-themes`** or `useTheme` in `components/ui/sonner.tsx` — project uses custom ThemeToggle
- **Do NOT add loading/progress state for clipboard copy** — it completes in milliseconds; Sonner `toast.success` on resolve is sufficient
- **Do NOT use `var(--color-*)` in `buildWordHtml`** — Word ignores CSS custom properties
- **Do NOT add `autoFocus`** on any elements — project-wide rule (Story 2.3)
- **Do NOT modify ExportModal, PdfProgress, pdf-generator, html-generator, or md-generator** — Story 3.4 is additive only

### Cross-Story Context

**Story 3.1 (Export Modal & Filename):**
- `ExportModal.tsx` exists for file exports that need a filename picker
- Copy actions are NOT file exports — do not use or modify ExportModal

**Story 3.2 (PDF Export):**
- `PdfProgress.tsx` is a state-machine progress overlay for async PDF generation
- Clipboard copy is near-instantaneous — use `toast.success/error` from Sonner instead
- Do NOT copy the `pdfState` machine pattern

**Story 3.3 (HTML & Markdown Export):**
- `html-generator.ts` builds the same CSS-var HTML document for file download
- `copyHtml` in `word-copy.ts` builds the same HTML but copies to clipboard instead of downloading
- Do NOT import `html-generator.ts` in `word-copy.ts` — duplicate the CSS-var HTML logic (~25 lines)
- The "no shared utility" principle from Story 3.3 applies here too

**Story 4.2 (BiDi — future):**
- Architecture AC: "export outputs (PDF, HTML, Word copy) preserve the per-sentence direction attributes"
- When Story 4.2 is implemented, `renderMarkdown()` will apply per-sentence `dir` attributes
- `word-copy.ts` uses `renderMarkdown()` — BiDi support will be inherited automatically

### Git Intelligence

Commit pattern: `"Implement Story 3.4: Clipboard copy (Word, HTML, text)"` (matches project format).

New files to CREATE:
- `lib/export/word-copy.ts`
- `lib/export/word-copy.test.ts`
- `components/ui/sonner.tsx`

Files to MODIFY (targeted, minimal):
- `types/editor.ts` — add `CopyType` (2 lines)
- `components/layout/Header.tsx` — add `copyItems` array + `ToolbarDropdown` JSX + `onCopyRequest` prop (minimal additions)
- `app/editor/page.tsx` — add 3 imports + `handleCopyRequest` function + `onCopyRequest` prop on `<Header>`
- `app/layout.tsx` — add `Toaster` import + `<Toaster>` element (2 lines)
- `package.json` + `pnpm-lock.yaml` — updated by `pnpm add sonner`

Files NOT to touch:
- `lib/export/pdf-generator.ts` — Story 3.2
- `lib/export/html-generator.ts` — Story 3.3
- `lib/export/md-generator.ts` — Story 3.3
- `lib/export/filename-utils.ts` — Story 3.1
- `components/export/ExportModal.tsx` — Story 3.1
- `components/export/PdfProgress.tsx` — Story 3.2
- `components/preview/MarkdownRenderer.tsx` — Story 3.2
- `components/preview/PreviewPanel.tsx` — Story 3.2

### Project Structure Notes

**Files created in this story:**
- `lib/export/word-copy.ts` — Three async clipboard copy functions (Word with literal hex, HTML with CSS vars, raw text)
- `lib/export/word-copy.test.ts` — Unit tests with mocked Clipboard API and ClipboardItem
- `components/ui/sonner.tsx` — Lightweight Toaster wrapper for Sonner (no next-themes)

**New npm dependency:** `sonner` — installed via `pnpm add sonner`. Used by the UX spec as the standard toast library in the shadcn ecosystem.

**Architecture alignment:**
- `lib/export/` now has all 5 expected files: `filename-utils.ts`, `pdf-generator.ts`, `html-generator.ts`, `md-generator.ts`, `word-copy.ts` — matches architecture.md source tree (line 676–680) exactly
- Color Sync chain now complete: all 5 targets from architecture.md line 789 are covered

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.4 ACs (lines 624–641)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/prd.md — FR14 (Word clipboard copy), FR15 (HTML/text clipboard copy)](_bmad-output/planning-artifacts/prd.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — lib/export/word-copy.ts (line 680)](planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Cross-Cutting Color Sync chain, 5 targets (line 789)](planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — components/ui/ source tree + shared/Toast.tsx (lines 610–657)](planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Sonner toast, export/copy dropdowns, Hebrew toast rules](ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — User journey: H →|Word| L[Click Copy → Word] (line 789)](ux-design-specification.md)
- [Source: types/colors.ts — ColorTheme interface (17 properties)](types/colors.ts)
- [Source: types/editor.ts — DocDirection, ExportType (adding CopyType after)](types/editor.ts)
- [Source: lib/markdown/render-pipeline.ts — renderMarkdown() used in copyForWord and copyHtml](lib/markdown/render-pipeline.ts)
- [Source: lib/colors/defaults.ts — DEFAULT_CLASSIC_THEME for test fixture](lib/colors/defaults.ts)
- [Source: components/layout/Header.tsx — existing structure, ToolbarDropdown usage pattern](components/layout/Header.tsx)
- [Source: components/editor/ToolbarDropdown.tsx — DropdownItem interface](components/editor/ToolbarDropdown.tsx)
- [Source: _bmad-output/implementation-artifacts/3-3-html-and-markdown-export.md — No shared utility rationale, DOMPurify+renderMarkdown pattern, test mock patterns](implementation-artifacts/3-3-html-and-markdown-export.md)
- [Source: app/layout.tsx — Where to add Toaster (inside body, after ConvexClientProvider)](app/layout.tsx)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

- Installed `sonner@2.0.7` via pnpm; created lightweight `components/ui/sonner.tsx` wrapper without `next-themes`.
- Created `lib/export/word-copy.ts` with three async clipboard functions: `copyForWord` (literal hex CSS, Word-compatible), `copyHtml` (CSS vars, browser-compatible), `copyText` (raw markdown via `writeText`).
- Created `lib/export/word-copy.test.ts` with 10 unit tests covering all AC branches; clipboard API and `ClipboardItem` mocked at module scope before imports.
- Added `CopyType = 'word' | 'html' | 'text'` to `types/editor.ts`.
- Added `"העתק"` `ToolbarDropdown` to `Header.tsx` before the export dropdown; wired `onCopyRequest` prop throughout.
- Added `handleCopyRequest` in `app/editor/page.tsx` with Hebrew `toast.success/error` messages; passes existing `content`, `colorTheme`, `docDirection` state — no new state added.
- All 215 tests pass (10 new + 205 pre-existing); no regressions.

### File List

- `lib/export/word-copy.ts` (created)
- `lib/export/word-copy.test.ts` (created)
- `components/ui/sonner.tsx` (created)
- `types/editor.ts` (modified — added `CopyType`)
- `components/layout/Header.tsx` (modified — added `copyItems`, `onCopyRequest` prop, copy `ToolbarDropdown`)
- `app/editor/page.tsx` (modified — added imports, `handleCopyRequest`, `onCopyRequest` prop on `<Header>`)
- `app/layout.tsx` (modified — added `Toaster` import and `<Toaster dir="rtl" position="bottom-center" />`)
- `package.json` (modified — added `sonner` dependency)
- `pnpm-lock.yaml` (modified — updated by pnpm)

### Change Log

- 2026-03-07: Implement Story 3.4 — Clipboard copy (Word with literal hex, HTML with CSS vars, raw text); Sonner toast feedback; "העתק" dropdown in header.
- 2026-03-07: Code review — Fixed: logical CSS props in buildWordHtml (border-inline-start→physical, padding-inline-start→physical, text-align:start→physical); hardcoded lang="he" in both builders; added copyHtml LTR test + Word-compat regression test; updated misleading Vitest comment; toast duration 4s→3s; console.error on copy failure.