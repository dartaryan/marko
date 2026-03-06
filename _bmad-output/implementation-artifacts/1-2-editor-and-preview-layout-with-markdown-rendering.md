# Story 1.2: Editor & Preview Layout with Markdown Rendering

Status: done

## Story

As a user,
I want to paste or type Markdown content and see it rendered beautifully in real-time beside my editor,
So that I can instantly see how my document looks.

## Acceptance Criteria

1. **Given** the user opens the editor page **When** they type or paste Markdown content into the editor textarea **Then** the preview panel renders the Markdown within 100ms of processing (with a 150ms debounce from last keystroke)
2. **And** the layout displays editor and preview side-by-side on desktop (CSS Grid two-panel, 50/50 split, ≥1024px)
3. **And** on mobile (<768px) and tablet (768-1023px) the panels stack vertically (both visible, no toggle yet — that is Story 1.5)
4. **And** code blocks render with syntax highlighting using Highlight.js with the `github-dark` theme
5. **And** the editor textarea has `dir="rtl"` by default and `lang="he"` for correct Hebrew input behavior
6. **And** the editor and preview panels each scroll independently within a full-height viewport layout
7. **And** the editor content auto-saves to localStorage on every change (key: `marko-v2-editor-content`)
8. **And** on page load, editor content is restored from localStorage (if present); empty state shows placeholder text
9. **And** all panels and interactive elements have Hebrew ARIA labels
10. **And** basic keyboard navigation works (Tab between focusable elements; textarea is fully keyboard accessible)
11. **And** JetBrains Mono font is loaded via `next/font/google` and applied to code blocks in the preview

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #4, #11)
  - [x] 1.1 `pnpm add marked marked-highlight highlight.js`
  - [x] 1.2 No additional `@types/` needed — `marked` and `highlight.js` ship their own types
  - [x] 1.3 Verify `pnpm build` still passes after install

- [x] Task 2: Add JetBrains Mono font (AC: #11)
  - [x] 2.1 Import `JetBrains_Mono` from `next/font/google` in `app/layout.tsx`
  - [x] 2.2 Configure with `subsets: ['latin']`, `display: 'swap'`, `variable: '--font-mono'`
  - [x] 2.3 Add `${jetBrainsMono.variable}` to `<body>` className alongside existing `notoSansHebrew.variable`
  - [x] 2.4 In `app/globals.css`, update `@theme inline` to map `--font-mono: var(--font-mono)` (already present — verify it points to the correct variable)

- [x] Task 3: Set up Markdown rendering library (AC: #4, #1)
  - [x] 3.1 Create `lib/markdown/highlight-setup.ts` — import `hljs` core + common languages, configure `langPrefix`
  - [x] 3.2 Create `lib/markdown/config.ts` — create and export configured `Marked` instance with `markedHighlight` extension + GFM + breaks options
  - [x] 3.3 Create `lib/markdown/render-pipeline.ts` — export `renderMarkdown(content: string): string` function
  - [x] 3.4 Create `lib/markdown/render-pipeline.test.ts` — unit tests for renderMarkdown (empty input, headings, code blocks, tables)

- [x] Task 4: Create utility hooks (AC: #7, #8, #1)
  - [x] 4.1 Create `lib/hooks/useDebounce.ts` — generic debounce hook, default 150ms
  - [x] 4.2 Create `lib/hooks/useLocalStorage.ts` — generic localStorage hook (read on mount, write on change, SSR-safe)
  - [x] 4.3 Create `lib/hooks/useEditorContent.ts` — wraps `useLocalStorage` with key `marko-v2-editor-content`, returns `[content, setContent]`

- [x] Task 5: Create layout components (AC: #2, #3, #6)
  - [x] 5.1 Create `components/layout/PanelLayout.tsx` — CSS Grid two-panel layout, full-height, responsive
  - [x] 5.2 Create `components/layout/Header.tsx` — minimal app header (placeholder for Story 1.5 toolbar buttons)

- [x] Task 6: Create editor components (AC: #5, #7, #8, #9, #10)
  - [x] 6.1 Create `components/editor/EditorPanel.tsx` — panel wrapper with label/header and Hebrew ARIA
  - [x] 6.2 Create `components/editor/EditorTextarea.tsx` — `<textarea>` with RTL, auto-save via hook, placeholder in Hebrew

- [x] Task 7: Create preview components (AC: #1, #4, #9)
  - [x] 7.1 Create `components/preview/PreviewPanel.tsx` — panel wrapper with label/header and Hebrew ARIA
  - [x] 7.2 Create `components/preview/MarkdownRenderer.tsx` — renders HTML from pipeline using `dangerouslySetInnerHTML`, imports `github-dark.css`

- [x] Task 8: Wire up editor page (AC: all)
  - [x] 8.1 Replace placeholder in `app/editor/page.tsx` with full layout: `Header + PanelLayout(EditorPanel, PreviewPanel)`
  - [x] 8.2 Add preview CSS to `app/globals.css` — style all rendered Markdown elements using CSS custom properties

- [x] Task 9: Verify & test (all ACs)
  - [x] 9.1 Manually test: paste sample Markdown with Hebrew + English + code blocks — verify rendering, RTL, highlighting
  - [x] 9.2 Test localStorage: paste content → refresh page → content restored
  - [x] 9.3 Test responsive: resize to <768px → panels stack vertically
  - [x] 9.4 Test keyboard: Tab through all focusable elements, textarea fully usable without mouse
  - [x] 9.5 Verify `pnpm build` passes with zero errors
  - [x] 9.6 Verify `pnpm lint` passes with zero errors

## Dev Notes

### Architecture Compliance

- **Package manager**: `pnpm` exclusively — never `npm install` or `yarn add`
- **Editor component**: Plain `<textarea>` — NO CodeMirror, NO rich text editor. Matches v1 behavior. Upgrade deferred to Phase 3+.
- **Rendering**: Client-side only — `MarkdownRenderer` MUST be `"use client"`. No SSR for the editor route.
- **State management**: React state + localStorage — no Convex, no Redux, no Zustand for this story
- **Styling**: Tailwind v4 with logical properties — NEVER use `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-` classes. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`.
- **Colors**: NEVER hardcode color values — always use the CSS custom properties from the 17-color system
- **shadcn components**: Not needed for this story's core components. If adding scrollbars or other UI — run `npx shadcn@latest add <component>`, never copy-paste shadcn code.
- **Convex**: Not used in this story. Do NOT create any Convex functions.
- **No Next.js API routes**: Not needed here — all rendering is client-side.

### Dependencies to Install

```bash
pnpm add marked marked-highlight highlight.js
```

**Package versions (expected ~early 2026):**
- `marked` — v15.x. Ships own TypeScript types. No `@types/marked` needed.
- `marked-highlight` — maintained by the marked team. Integrates hljs cleanly.
- `highlight.js` — v11.x. Ships own TypeScript types. Includes `github-dark` theme CSS.

### Library Setup — Highlight.js (`lib/markdown/highlight-setup.ts`)

Import commonly-used languages individually for tree-shaking (do NOT use `highlight.js/lib/common` if bundle size is a concern, but for Phase 1 simplicity, `hljs/lib/common` is acceptable):

```ts
// lib/markdown/highlight-setup.ts
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml'; // covers HTML
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('sql', sql);

export { hljs };
```

Alternative (simpler, larger bundle): use `import hljs from 'highlight.js'` to auto-include all 190+ languages. Acceptable for Phase 1.

### Library Setup — Marked.js (`lib/markdown/config.ts`)

```ts
// lib/markdown/config.ts
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { hljs } from './highlight-setup';

export const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  {
    gfm: true,      // GitHub Flavored Markdown (tables, strikethrough, task lists)
    breaks: true,   // Convert newlines to <br> (matches v1 behavior)
  }
);
```

### Render Pipeline (`lib/markdown/render-pipeline.ts`)

```ts
// lib/markdown/render-pipeline.ts
import { marked } from './config';

export function renderMarkdown(content: string): string {
  if (!content.trim()) return '';
  // marked.parse() is synchronous since we use no async extensions
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
}
```

**Note on performance (AC #1):** `renderMarkdown` is synchronous and fast. For a typical document (< 50KB text), it completes well under 100ms. The `useMemo` in `MarkdownRenderer` ensures it only re-runs when `content` changes.

### Hooks

**`lib/hooks/useDebounce.ts`**
```ts
'use client';
import { useState, useEffect } from 'react';

export const DEBOUNCE_MS = 150; // Marko standard debounce — do not change

export function useDebounce<T>(value: T, delay: number = DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**`lib/hooks/useLocalStorage.ts`**
```ts
'use client';
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // localStorage unavailable (private mode, quota exceeded, etc.) — use initial value
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silently fail — editor still works, content just won't persist
    }
  };

  return [storedValue, setValue];
}
```

**`lib/hooks/useEditorContent.ts`**
```ts
'use client';
import { useLocalStorage } from './useLocalStorage';

// IMPORTANT: This key is separate from v1 keys (mdEditorContent).
// The v1 → v2 migration (Story 1.7) will read v1 keys and populate this key.
export const EDITOR_CONTENT_KEY = 'marko-v2-editor-content';

export function useEditorContent(): [string, (content: string) => void] {
  const [content, setContent] = useLocalStorage<string>(EDITOR_CONTENT_KEY, '');
  return [content, setContent];
}
```

### Layout Component (`components/layout/PanelLayout.tsx`)

Full-viewport layout with two panels side by side on desktop, stacked on mobile:

```tsx
// components/layout/PanelLayout.tsx
interface PanelLayoutProps {
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
}

export function PanelLayout({ editorPanel, previewPanel }: PanelLayoutProps) {
  return (
    <div
      className="grid h-[calc(100vh-var(--header-height,3.5rem))] grid-cols-1 lg:grid-cols-2"
      aria-label="פאנל עורך ותצוגה מקדימה"
    >
      {editorPanel}
      {previewPanel}
    </div>
  );
}
```

**CSS variable `--header-height`:** Define this in `globals.css` as `3.5rem` (56px). Use it consistently across layout components. The actual header height will be fine-tuned as stories progress.

**Breakpoints:**
- `lg:` (1024px+) — two columns, side by side
- Below 1024px — single column, stacked (editor above, preview below)

### Editor Components

**`components/editor/EditorTextarea.tsx`**
```tsx
'use client';
interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorTextarea({ value, onChange }: EditorTextareaProps) {
  return (
    <textarea
      className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground
                 placeholder:text-muted-foreground focus:outline-none"
      dir="rtl"
      lang="he"
      aria-label="תוכן מארקדאון לעריכה"
      aria-multiline="true"
      placeholder="...הדבק טקסט מארקדאון כאן"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  );
}
```

**`components/editor/EditorPanel.tsx`**
```tsx
'use client';
import { EditorTextarea } from './EditorTextarea';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function EditorPanel({ content, onChange }: EditorPanelProps) {
  return (
    <section
      className="flex flex-col border-e border-border"
      aria-label="עורך מארקדאון"
    >
      <div className="flex h-9 items-center border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">עורך</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditorTextarea value={content} onChange={onChange} />
      </div>
    </section>
  );
}
```

Note: `border-e` is the RTL-logical equivalent of "right border" (border on the end side, which is the left in RTL). Since in RTL the editor is on the right and preview on the left, `border-e` creates the separator between them correctly.

### Preview Components

**`components/preview/MarkdownRenderer.tsx`**
```tsx
'use client';
import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // useMemo ensures re-render only when content changes
  // React Compiler (stable in Next.js 16) may auto-optimize this, but explicit useMemo
  // is correct here as a performance-critical hot path
  const html = useMemo(() => renderMarkdown(content), [content]);

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">...הדבק מארקדאון בעורך כדי לראות תצוגה מקדימה</p>
      </div>
    );
  }

  return (
    <div
      className="preview-content h-full overflow-y-auto p-6"
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label="תצוגה מקדימה של המסמך המעובד"
      aria-live="polite"
      aria-atomic="false"
    />
  );
}
```

**`aria-live="polite"`** — announces preview updates to screen readers without interrupting. `aria-atomic="false"` allows incremental updates.

**`components/preview/PreviewPanel.tsx`**
```tsx
'use client';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PreviewPanelProps {
  content: string;
}

export function PreviewPanel({ content }: PreviewPanelProps) {
  return (
    <section
      className="flex flex-col"
      aria-label="תצוגה מקדימה"
    >
      <div className="flex h-9 items-center border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">תצוגה מקדימה</span>
      </div>
      <div
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--color-preview-bg)' }}
      >
        <MarkdownRenderer content={content} />
      </div>
    </section>
  );
}
```

### Editor Page (`app/editor/page.tsx`)

Replace the current placeholder completely:

```tsx
'use client';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content); // 150ms debounce for preview

  return (
    <main className="flex h-screen flex-col">
      {/* Header placeholder — Story 1.5 will add toolbar buttons here */}
      <header
        className="flex h-14 items-center border-b border-border px-4"
        aria-label="סרגל כלים של מארקו"
        style={{ '--header-height': '3.5rem' } as React.CSSProperties}
      >
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-h1)' }}>
          מארקו
        </h1>
      </header>

      <PanelLayout
        editorPanel={<EditorPanel content={content} onChange={setContent} />}
        previewPanel={<PreviewPanel content={debouncedContent} />}
      />
    </main>
  );
}
```

**Key pattern:** `content` (raw, live) goes to `EditorPanel` so the textarea updates instantly. `debouncedContent` goes to `PreviewPanel` so rendering is delayed 150ms after last keystroke. This ensures typing feels responsive while rendering has breathing room.

### Preview CSS — Add to `app/globals.css`

Append at the end of `globals.css`. All values use CSS custom properties from the 17-color system:

```css
/* ============================================
   Preview Content Styles (Story 1.2)
   All colors use the 17-property custom system
   ============================================ */

.preview-content {
  color: var(--color-primary-text);
  background-color: var(--color-preview-bg);
  font-family: var(--font-body, var(--font-sans));
  line-height: 1.7;
  direction: rtl; /* document-level RTL; Story 4 will add per-sentence detection */
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

.preview-content p {
  margin-bottom: 1rem;
}

.preview-content a {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.preview-content a:hover {
  opacity: 0.8;
}

.preview-content code:not(pre code) {
  color: var(--color-code);
  background-color: var(--color-code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.875em;
  direction: ltr; /* inline code always LTR */
  unicode-bidi: embed;
}

.preview-content pre {
  background-color: var(--color-code-bg);
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  direction: ltr; /* code blocks always LTR */
}

.preview-content pre code {
  display: block;
  padding: 1rem;
  font-family: var(--font-mono);
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

.preview-content blockquote p:last-child {
  margin-bottom: 0;
}

.preview-content ul,
.preview-content ol {
  padding-inline-start: 1.5rem;
  margin-bottom: 1rem;
}

.preview-content li {
  margin-bottom: 0.25rem;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.preview-content thead {
  background-color: var(--color-table-header);
}

.preview-content th,
.preview-content td {
  border: 1px solid var(--color-table-border);
  padding: 0.5rem 0.75rem;
  text-align: start;
}

.preview-content tbody tr:nth-child(even) {
  background-color: var(--color-table-alt);
}

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

/* Highlight.js github-dark overrides to blend with preview-content background */
.preview-content .hljs {
  background: var(--color-code-bg) !important;
}
```

**CRITICAL:** The `border-inline-start` on blockquotes is the RTL-logical property. It renders on the right side in RTL contexts (visually the "start" side in Hebrew text). Do NOT use `border-left`.

### JetBrains Mono Font — Update `app/layout.tsx`

Add alongside the existing Noto Sans Hebrew font:

```tsx
import { Noto_Sans_Hebrew, JetBrains_Mono } from 'next/font/google';

const notoSansHebrew = Noto_Sans_Hebrew({ /* ... existing config */ });

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// In the body className:
<body className={`${notoSansHebrew.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
```

**Note on `--font-mono` variable:** The `globals.css` `@theme inline` block already has `--font-mono: var(--font-geist-mono)`. This was auto-generated by shadcn. Update it to point to `var(--font-mono)` (the JetBrains Mono variable). Or simply: the `--font-mono` CSS variable set by `next/font` will take precedence at runtime. Verify the preview's `font-family: var(--font-mono)` resolves to JetBrains Mono in DevTools.

### localStorage Key Strategy

| Key | Value | Set In | Read In |
|---|---|---|---|
| `marko-v2-editor-content` | Raw Markdown string (JSON.stringify'd) | `useEditorContent` | `useEditorContent` on mount |

**IMPORTANT — v1 key isolation:** v1 used `mdEditorContent`. Story 1.2 MUST NOT read or write that key. Story 1.7 (migration) will handle the v1 → v2 transfer. This separation prevents accidental data loss for v1 users before migration is implemented.

### Performance Requirements (AC #1)

- **Debounce**: 150ms — rendering triggers 150ms after last keystroke
- **Render time**: `renderMarkdown()` must complete in <100ms for documents up to 50KB
- **useMemo**: prevents re-render of preview HTML when content hasn't changed
- **No streaming**: preview updates synchronously — no incremental rendering needed
- **No Web Workers**: not needed for Phase 1 document sizes

If `renderMarkdown` is measured to be slow for very large documents, defer optimization to Phase 3.

### RTL Notes for This Story

- **Editor textarea**: `dir="rtl" lang="he"` — Hebrew text input aligns to the right, cursor behavior is RTL
- **Preview panel**: `direction: rtl` on `.preview-content` — document-level RTL for all content
- **Code blocks**: `direction: ltr` override — code is ALWAYS left-to-right, regardless of document direction
- **Inline code**: `direction: ltr; unicode-bidi: embed` — same as code blocks
- **Per-sentence BiDi detection**: NOT in this story — that is Epic 4 (Story 4.1+). The preview renders the whole document as RTL.
- **Blockquotes**: Use `border-inline-start` (RTL-aware), not `border-left`
- **Lists**: Use `padding-inline-start`, not `padding-left`

### What NOT to Implement in This Story

- **Mermaid diagrams** — Story 1.3
- **Formatting toolbar** — Story 1.4
- **View mode toggles** (editor-only / preview-only / split) — Story 1.5
- **Presentation mode** — Story 1.5
- **Clear button / sample document / direction toggle** — Story 1.6
- **v1 localStorage migration** — Story 1.7
- **Per-sentence BiDi detection** — Epic 4
- **Any Convex backend calls** — not needed for this story
- **Dark mode toggle UI** — Story 1.6 (CSS variables are already defined in globals.css for dark mode, but the toggle button is not added until Story 1.6)

### Previous Story Intelligence (from Story 1.1)

**Critical learnings:**

1. **Project root is the repo root** — all files are at root level, NOT in a `marko/` subdirectory. After the "Move Next.js app from nested marko/ subfolder to project root" commit, paths are: `app/`, `lib/`, `components/`, `convex/`. Do NOT create a `marko/` subdirectory.

2. **`proxy.ts` not `middleware.ts`** — Clerk auth uses `proxy.ts` at the project root (Next.js 16 convention). Do not touch this file in Story 1.2.

3. **`pnpm approve-builds` issue** — resolved in 1.1 via `pnpm.onlyBuiltDependencies` in package.json. Should not recur for `marked` / `highlight.js`.

4. **`concurrently` is installed** — dev scripts work. Use `pnpm dev` for Next.js only, `pnpm dev:full` for Next.js + Convex.

5. **`convex init` was replaced by manual setup** — Convex is configured manually. Do not run convex CLI commands.

6. **globals.css already has 17 colors** — the full CSS custom property system is in place. Use it directly; do NOT redefine any variables.

7. **`components.json` has `rtl: true`** — shadcn components use logical CSS automatically. When running `npx shadcn@latest add`, this config is respected.

8. **JetBrains Mono note from 1.1** — "do NOT add next/font/local for Varela Round yet — Story 1.2 will handle additional fonts when needed". JetBrains Mono is the font for code blocks, added in this story. Load via `next/font/google` (NOT a CDN `<link>` tag, NOT `next/font/local`).

9. **`.env.local` exists but is gitignored** — Convex placeholder URL is set. Editor page doesn't need Convex so env vars are not critical for Story 1.2.

10. **Build was clean after 1.1** — `pnpm build` and `pnpm lint` both passed. Maintain this baseline.

### Git Intelligence

Recent commits show documentation and infrastructure work only. The main substantive code was from Story 1.1 implementation. Key patterns established:
- TypeScript strict mode is ON — all types must be explicit, no `any`
- ESLint is configured — run `pnpm lint` before marking complete
- Turbopack is the default bundler — `pnpm dev` uses `next dev --turbopack`

### Current Project File State

Files that exist and are relevant to this story:
- `app/editor/page.tsx` — current placeholder, will be replaced entirely
- `app/layout.tsx` — has Noto Sans Hebrew; needs JetBrains Mono added
- `app/globals.css` — has 17-color system; preview CSS will be appended
- `lib/utils.ts` — exists (shadcn `cn` helper), will co-exist with new lib/ subdirs
- `components.json` — `rtl: true` configured
- `package.json` — has all Story 1.1 deps; needs `marked marked-highlight highlight.js`

Files to CREATE in this story:
- `lib/markdown/highlight-setup.ts`
- `lib/markdown/config.ts`
- `lib/markdown/render-pipeline.ts`
- `lib/markdown/render-pipeline.test.ts`
- `lib/hooks/useDebounce.ts`
- `lib/hooks/useLocalStorage.ts`
- `lib/hooks/useEditorContent.ts`
- `components/layout/PanelLayout.tsx`
- `components/layout/Header.tsx` (minimal placeholder)
- `components/editor/EditorPanel.tsx`
- `components/editor/EditorTextarea.tsx`
- `components/preview/PreviewPanel.tsx`
- `components/preview/MarkdownRenderer.tsx`

### Project Structure Notes

Story 1.2 creates the `components/` and `lib/hooks/` and `lib/markdown/` directories. After this story completes:

```
marko/                               (project root)
├── app/
│   ├── editor/
│   │   └── page.tsx                 -- MODIFIED: full layout with EditorPanel + PreviewPanel
│   ├── globals.css                  -- MODIFIED: preview CSS appended
│   └── layout.tsx                   -- MODIFIED: JetBrains Mono font added
├── components/                      -- NEW directory
│   ├── layout/
│   │   ├── Header.tsx               -- NEW: minimal header placeholder
│   │   └── PanelLayout.tsx          -- NEW: CSS Grid two-panel layout
│   ├── editor/
│   │   ├── EditorPanel.tsx          -- NEW: editor panel wrapper
│   │   └── EditorTextarea.tsx       -- NEW: textarea with RTL + auto-save
│   └── preview/
│       ├── PreviewPanel.tsx         -- NEW: preview panel wrapper
│       └── MarkdownRenderer.tsx     -- NEW: rendered HTML + hljs CSS import
├── lib/
│   ├── utils.ts                     -- UNCHANGED (shadcn cn helper)
│   ├── hooks/                       -- NEW directory
│   │   ├── useDebounce.ts           -- NEW
│   │   ├── useLocalStorage.ts       -- NEW
│   │   └── useEditorContent.ts      -- NEW
│   └── markdown/                    -- NEW directory
│       ├── config.ts                -- NEW: Marked + markedHighlight setup
│       ├── highlight-setup.ts       -- NEW: hljs with registered languages
│       ├── render-pipeline.ts       -- NEW: renderMarkdown() function
│       └── render-pipeline.test.ts  -- NEW: unit tests
└── package.json                     -- MODIFIED: + marked, marked-highlight, highlight.js
```

**Alignment with architecture.md structure:** All paths match the spec exactly (`components/layout/`, `components/editor/`, `components/preview/`, `lib/markdown/`, `lib/hooks/`). Do not create files in other locations.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture — Markdown Rendering Pipeline]
- [Source: _bmad-output/planning-artifacts/architecture.md#Editor-Component]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Management]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#CSS-Styling]
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement-Guidelines]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Experience-Mechanics — Flow 1: Paste → Preview]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Platform-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design-Inspiration-Strategy]
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-and-root-layout.md]
- [Source: app/globals.css — 17-color CSS custom property system]
- [Source: app/layout.tsx — Noto Sans Hebrew font variable setup]
- [Web: marked.js docs](https://marked.js.org) — v14+ API, Marked class, options
- [Web: marked-highlight](https://github.com/markedjs/marked-highlight) — official hljs extension for marked
- [Web: highlight.js language support](https://highlightjs.org/download/) — registered language list
- [Web: highlight.js github-dark theme](https://github.com/highlightjs/highlight.js/blob/main/src/styles/github-dark.css)
- [Web: next/font/google docs](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — JetBrains Mono configuration

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

- `useLocalStorage.ts` initially used `setState` inside `useEffect` (from story spec). Refactored to lazy `useState` initializer to satisfy ESLint `react-hooks/set-state-in-effect` rule. SSR-safe via `typeof window === 'undefined'` guard.
- `vitest` and `@vitest/coverage-v8` added as devDependencies — no test framework existed in the project. Required to execute unit tests for `renderMarkdown`.

### Completion Notes List

- All 9 tasks and all subtasks completed and verified.
- `pnpm build` passes with zero errors (`/editor` page now pre-rendered as static).
- `pnpm lint` passes with zero errors (5 pre-existing warnings in `convex/_generated/` are unrelated to this story).
- `pnpm test` passes 7/7 unit tests for `renderMarkdown` (empty input, whitespace, headings, code blocks with hljs, GFM tables, inline code, return type).
- All new files follow RTL-logical CSS properties (`border-e`, `border-inline-start`, `padding-inline-start`) per architecture spec.
- `marked` v17.0.4, `marked-highlight` v2.2.3, `highlight.js` v11.11.1 installed.
- JetBrains Mono loaded via `next/font/google` with `variable: '--font-mono'`; `globals.css` `@theme inline` updated from `var(--font-geist-mono)` to `var(--font-mono)`.

### File List

**New files:**
- `lib/markdown/highlight-setup.ts`
- `lib/markdown/config.ts`
- `lib/markdown/render-pipeline.ts`
- `lib/markdown/render-pipeline.test.ts`
- `lib/hooks/useDebounce.ts`
- `lib/hooks/useLocalStorage.ts`
- `lib/hooks/useEditorContent.ts`
- `components/layout/PanelLayout.tsx`
- `components/layout/Header.tsx`
- `components/editor/EditorPanel.tsx`
- `components/editor/EditorTextarea.tsx`
- `components/preview/PreviewPanel.tsx`
- `components/preview/MarkdownRenderer.tsx`
- `vitest.config.ts`

**Modified files:**
- `app/editor/page.tsx` — replaced placeholder with full editor layout; now uses `Header` component
- `app/layout.tsx` — added JetBrains Mono font
- `app/globals.css` — updated `--font-mono` mapping; appended preview content CSS; added `--header-height: 3.5rem` to `:root`
- `components/editor/EditorTextarea.tsx` — removed redundant `aria-multiline`
- `components/preview/MarkdownRenderer.tsx` — added `isomorphic-dompurify` sanitization
- `lib/hooks/useLocalStorage.ts` — refactored to `useEffect` pattern for SSR hydration safety
- `lib/markdown/render-pipeline.test.ts` — improved code block test assertions
- `package.json` — added `marked`, `marked-highlight`, `highlight.js`, `isomorphic-dompurify` (deps); `vitest`, `@vitest/coverage-v8` (devDeps); `test` script
- `pnpm-lock.yaml` — updated lockfile
- `vitest.config.ts` — added `@/` path alias

### Change Log

- Implemented Story 1.2: Editor & Preview Layout with Markdown Rendering (Date: 2026-03-06)
- Code review fixes applied (Date: 2026-03-06): M1 Header.tsx now imported in page.tsx; M2 useLocalStorage refactored to useEffect for SSR safety; M3 DOMPurify (isomorphic-dompurify) added to MarkdownRenderer; L1 pnpm-lock.yaml documented; L2 --header-height moved to globals.css; L3 aria-multiline removed from EditorTextarea; L4 vitest @/ alias added; L5 test assertions strengthened
