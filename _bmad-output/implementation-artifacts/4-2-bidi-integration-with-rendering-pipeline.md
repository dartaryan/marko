# Story 4.2: BiDi Integration with Rendering Pipeline

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my mixed Hebrew/English documents to automatically display each sentence in the correct direction,
so that I never have to manually toggle RTL/LTR within a document.

## Acceptance Criteria

1. **AC1: Per-Element Direction** — Given a document with mixed Hebrew and English paragraphs, when the content renders in the preview, then each `<p>` element displays with the correct `dir` attribute (`rtl` or `ltr`), determined by the BiDi engine from Story 4.1.

2. **AC2: Code Blocks Always LTR** — Given a document with code blocks, when the content renders, then `<pre>` and `<code>` elements are NOT assigned a `dir` attribute by BiDi post-processing (they are already forced `direction: ltr` via CSS in `globals.css` and export CSS).

3. **AC3: Mermaid Diagrams Unaffected** — Given a document with Mermaid diagrams, when the content renders, then `.mermaid-wrapper` and `.mermaid` div elements are NOT assigned `dir` attributes by BiDi post-processing.

4. **AC4: Tables, Lists, Blockquotes** — Given document content with tables, lists, and blockquotes, when the content renders, then: `<td>` and `<th>` elements receive per-cell `dir` attributes; tight `<li>` elements (no block children) receive per-item `dir` attributes; loose `<li>` elements (those containing `<p>`) are skipped — the inner `<p>` already has `dir`; blockquote inner `<p>` elements receive `dir` (blockquote outer element is not targeted).

5. **AC5: Marked.js Post-Processing** — The BiDi detection integrates as a post-processing step inside `renderMarkdown()` in `lib/markdown/render-pipeline.ts`, activated via an `autoBidi` parameter.

6. **AC6: Manual Override Precedence** — Given `docDirection` is `'rtl'` or `'ltr'` (manually set by user via DirectionToggle), when the content renders, then `renderMarkdown` is called without `autoBidi`, so no per-element `dir` attributes are added; the container `dir` attribute controls document-wide direction. Given `docDirection` is `'auto'` (new third option), BiDi post-processing is activated.

7. **AC7: Export Preservation** — Given auto BiDi mode is active, when the user exports as HTML or copies for Word/HTML clipboard, then the exported HTML contains per-element `dir` attributes from BiDi post-processing, and the document-level `dir` is `'rtl'` (Hebrew-first fallback). PDF export inherits BiDi automatically since it captures the already-rendered DOM from `MarkdownRenderer`.

8. **AC8: Test Coverage** — Unit tests in `lib/bidi/apply-bidi.test.ts` cover: pure Hebrew `<p>` → `dir="rtl"`, pure English `<p>` → `dir="ltr"`, mixed `<p>` direction, `<h1>`-`<h6>` direction, tight `<li>` direction, `<td>`/`<th>` direction, code blocks skipped, Mermaid wrappers skipped, loose list items delegating to inner `<p>`. `render-pipeline.test.ts` gains BiDi integration tests.

## Tasks / Subtasks

- [ ] Task 1: Create `lib/bidi/apply-bidi.ts` (AC: #1, #2, #3, #4, #5)
  - [ ] 1.1: Import `{ detectSentenceDirection }` from `'./detect-direction'`
  - [ ] 1.2: Export `applyBidiToHtml(html: string): string` — applies `dir` attributes via 4 regex passes (see Dev Notes for exact regexes)
  - [ ] 1.3: Pass 1 — `<p>` elements: `/<p>([\s\S]*?)<\/p>/g` → add `dir` attribute
  - [ ] 1.4: Pass 2 — `<h1>`–`<h6>` elements: `/<(h[1-6])>([\s\S]*?)<\/\1>/g` → add `dir` attribute
  - [ ] 1.5: Pass 3 — Tight `<li>` elements (no block children): regex that matches `<li>` content with only inline elements (no `<p>`, `<ul>`, `<ol>`, `<li>`, `<div>`) — add `dir` attribute; skip loose list items (they have inner `<p>` with dir already)
  - [ ] 1.6: Pass 4 — `<td>` and `<th>` elements (with optional attributes): `/<(td|th)((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g` → add `dir` attribute after existing attrs
  - [ ] 1.7: No default export — named export only (project convention in lib/)

- [ ] Task 2: Create `lib/bidi/apply-bidi.test.ts` (AC: #8)
  - [ ] 2.1: Import `{ applyBidiToHtml }` from `'./apply-bidi'`
  - [ ] 2.2: Test `<p>` with Hebrew text → `<p dir="rtl">...</p>`
  - [ ] 2.3: Test `<p>` with English text → `<p dir="ltr">...</p>`
  - [ ] 2.4: Test `<p>` with mixed content (Hebrew dominant) → `dir="rtl"`
  - [ ] 2.5: Test `<h1>` with Hebrew text → `<h1 dir="rtl">...</h1>`
  - [ ] 2.6: Test `<h2>` with English text → `<h2 dir="ltr">...</h2>`
  - [ ] 2.7: Test tight `<li>` with Hebrew → `<li dir="rtl">...</li>`
  - [ ] 2.8: Test loose `<li>` (contains `<p>`) → `<li>` unchanged; inner `<p>` gets dir
  - [ ] 2.9: Test `<td>` with Hebrew → `<td dir="rtl">...</td>`
  - [ ] 2.10: Test `<th align="center">` — existing attrs preserved, `dir` appended: `<th align="center" dir="ltr">...</th>`
  - [ ] 2.11: Test code block `<pre><code>...</code></pre>` — NOT modified (no `<p>`, `<h>`, `<li>`, `<td>`, `<th>`)
  - [ ] 2.12: Test Mermaid: `<div class="mermaid-wrapper"><div class="mermaid">...</div></div>` — NOT modified
  - [ ] 2.13: Test mixed document with multiple elements of different directions

- [ ] Task 3: Modify `types/editor.ts` (AC: #6)
  - [ ] 3.1: Change `DocDirection` from `'rtl' | 'ltr'` to `'rtl' | 'ltr' | 'auto'`

- [ ] Task 4: Modify `components/layout/DirectionToggle.tsx` (AC: #6)
  - [ ] 4.1: Add `{ value: 'auto', label: 'BiDi', ariaLabel: 'זיהוי כיוון אוטומטי' }` as FIRST item in `DIRECTIONS` array (before 'rtl', before 'ltr')
  - [ ] 4.2: No other changes needed — `DIRECTIONS.length` in `handleKeyDown` arithmetic automatically handles 3 items

- [ ] Task 5: Modify `lib/markdown/render-pipeline.ts` (AC: #5)
  - [ ] 5.1: Add import: `import { applyBidiToHtml } from '@/lib/bidi/apply-bidi'`
  - [ ] 5.2: Change signature to `renderMarkdown(content: string, autoBidi = false): string`
  - [ ] 5.3: After `marked.parse`, if `autoBidi` is true, pass html through `applyBidiToHtml(html)` before returning

- [ ] Task 6: Modify `lib/markdown/render-pipeline.test.ts` (AC: #8)
  - [ ] 6.1: Add test: `renderMarkdown('שלום עולם')` (no autoBidi) → output does NOT contain `dir=`
  - [ ] 6.2: Add test: `renderMarkdown('שלום עולם', true)` (autoBidi=true) → output contains `<p dir="rtl">`
  - [ ] 6.3: Add test: `renderMarkdown('Hello world', true)` → output contains `<p dir="ltr">`

- [ ] Task 7: Modify `components/preview/MarkdownRenderer.tsx` (AC: #1, #6)
  - [ ] 7.1: Update `useMemo`: call `renderMarkdown(content, dir === 'auto')` instead of `renderMarkdown(content)`
  - [ ] 7.2: Add `dir` to `useMemo` dependency array: `[content, dir]`
  - [ ] 7.3: Update container `dir` attribute: use `dir === 'auto' ? 'rtl' : dir` — when BiDi active, RTL is the Hebrew-first base direction; individual elements already have their specific `dir`

- [ ] Task 8: Modify `lib/export/html-generator.ts` (AC: #7)
  - [ ] 8.1: Define `const autoBidi = dir === 'auto'` and `const effectiveDir = autoBidi ? 'rtl' : dir`
  - [ ] 8.2: Change `renderMarkdown(content)` call to `renderMarkdown(content, autoBidi)`
  - [ ] 8.3: Pass `effectiveDir` (not `dir`) to `buildHtmlDocument()` so `<html dir="...">` and CSS get 'rtl' or 'ltr' (never 'auto', which would conflict with per-element dirs)

- [ ] Task 9: Modify `lib/export/word-copy.ts` (AC: #7)
  - [ ] 9.1: In `copyForWord`: define `const autoBidi = dir === 'auto'` and `const effectiveDir = autoBidi ? 'rtl' : dir`; change `renderMarkdown(content)` to `renderMarkdown(content, autoBidi)`; pass `effectiveDir` to `buildWordHtml()`
  - [ ] 9.2: In `copyHtml`: same pattern — `autoBidi`, `effectiveDir`, updated `renderMarkdown` call, updated `buildCssVarHtml()` call

## Dev Notes

### PREREQUISITE: Story 4.1 Must Be Implemented First

Story 4.2 **imports** from `lib/bidi/detect-direction.ts` (via `apply-bidi.ts`) and `lib/bidi/unicode-ranges.ts`. These files are created in Story 4.1. Do NOT implement Story 4.2 until Story 4.1 is done and tests pass.

After Story 4.1 is implemented, `lib/bidi/` will contain:
- `detect-direction.ts` — exports `detectSentenceDirection(text: string): TextDirection` and `analyzeDocument(sentences: string[]): TextDirection[]`
- `unicode-ranges.ts` — exports `HEBREW_RANGE`, `ARABIC_RANGE`, `LATIN_RANGE`, `isRtlChar`, `isLtrChar`, `TextDirection`

`apply-bidi.ts` imports ONLY `detectSentenceDirection` from `./detect-direction`.

### apply-bidi.ts — Exact Implementation

```typescript
// lib/bidi/apply-bidi.ts
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
  result = result.replace(
    /<(td|th)((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g,
    (_, tag, attrs, content) => {
      const dir = detectSentenceDirection(content);
      return `<${tag}${attrs} dir="${dir}">${content}</${tag}>`;
    }
  );

  return result;
}
```

**Why 4 separate passes instead of one combined regex:**
Each element type has different structural rules. Separate passes are explicit, testable, and avoid complex combined patterns.

**Why mermaid is safe:**
Mermaid content lives in `<div class="mermaid-wrapper"><div class="mermaid">...</div></div>`. None of our regex targets `<div>` — safe without extra checks.

**Why code blocks are safe:**
`<pre><code>...</code></pre>` — not matched by `<p>`, `<h>`, `<li>` (tight), or `<td>`/`<th>` patterns. No extra exclusion logic needed.

**Why blockquote inner `<p>` is handled correctly:**
`<blockquote><p>text</p></blockquote>` — Pass 1 targets ALL `<p>` tags, including those inside blockquotes. Each inner `<p>` gets its own `dir`. The `<blockquote>` element itself is intentionally not targeted (it inherits from the container).

### render-pipeline.ts — Exact Diff

```typescript
// BEFORE
import { marked } from './config';

export function renderMarkdown(content: string): string {
  if (!content.trim()) return '';
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
}

// AFTER
import { marked } from './config';
import { applyBidiToHtml } from '@/lib/bidi/apply-bidi';

export function renderMarkdown(content: string, autoBidi = false): string {
  if (!content.trim()) return '';
  const result = marked.parse(content);
  const html = typeof result === 'string' ? result : '';
  return autoBidi ? applyBidiToHtml(html) : html;
}
```

**Backward compatibility:** All existing callers (`html-generator.ts`, `word-copy.ts`, existing tests) call `renderMarkdown(content)` without the second arg — they default to `autoBidi = false`, no behavioral change.

### MarkdownRenderer.tsx — Exact Diff

```typescript
// BEFORE
const html = useMemo(
  () => DOMPurify.sanitize(renderMarkdown(content)),
  [content]
);

// AFTER
const html = useMemo(
  () => DOMPurify.sanitize(renderMarkdown(content, dir === 'auto')),
  [content, dir]
);
```

And the container div `dir` prop:
```tsx
// BEFORE
dir={dir}

// AFTER
dir={dir === 'auto' ? 'rtl' : dir}
```

**Why `dir='rtl'` when auto:** When BiDi is active, individual elements have their specific `dir`. The container needs a valid HTML `dir` value ('rtl' or 'ltr', not 'auto') to provide a base direction for unmarked elements (e.g., `<hr>`, `<img>`). RTL is the Hebrew-first default for Marko.

**DOMPurify preserves `dir` attributes:** DOMPurify's default allowlist includes `dir` as a safe attribute. The BiDi `dir` attrs will survive sanitization.

### html-generator.ts — Exact Diff

```typescript
// BEFORE
export function exportHtml(content: string, theme: ColorTheme, dir: DocDirection, filename: string): void {
  const rawHtml = renderMarkdown(content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildHtmlDocument(sanitizedHtml, theme, dir, filename);
  triggerDownload(html, `${filename}.html`, 'text/html;charset=utf-8');
}

// AFTER
export function exportHtml(content: string, theme: ColorTheme, dir: DocDirection, filename: string): void {
  const autoBidi = dir === 'auto';
  const effectiveDir = autoBidi ? 'rtl' : dir;
  const rawHtml = renderMarkdown(content, autoBidi);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildHtmlDocument(sanitizedHtml, theme, effectiveDir, filename);
  triggerDownload(html, `${filename}.html`, 'text/html;charset=utf-8');
}
```

`buildHtmlDocument` signature and body are unchanged — it receives `'rtl' | 'ltr'` (never `'auto'`).

### word-copy.ts — Exact Diff

Same pattern as html-generator.ts. Apply to both `copyForWord` and `copyHtml` functions:

```typescript
// copyForWord — AFTER
export async function copyForWord(content: string, theme: ColorTheme, dir: DocDirection): Promise<void> {
  const autoBidi = dir === 'auto';
  const effectiveDir = autoBidi ? 'rtl' : dir;
  const rawHtml = renderMarkdown(content, autoBidi);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildWordHtml(sanitizedHtml, theme, effectiveDir);
  await writeHtmlToClipboard(html);
}

// copyHtml — AFTER
export async function copyHtml(content: string, theme: ColorTheme, dir: DocDirection): Promise<void> {
  const autoBidi = dir === 'auto';
  const effectiveDir = autoBidi ? 'rtl' : dir;
  const rawHtml = renderMarkdown(content, autoBidi);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const html = buildCssVarHtml(sanitizedHtml, theme, effectiveDir);
  await writeHtmlToClipboard(html);
}
```

`buildWordHtml` and `buildCssVarHtml` signatures and bodies are unchanged — they receive `'rtl' | 'ltr'`.

### DirectionToggle.tsx — Exact Diff

```typescript
// BEFORE
const DIRECTIONS: { value: DocDirection; label: string; ariaLabel: string }[] = [
  { value: 'rtl', label: 'RTL', ariaLabel: 'כיוון מימין לשמאל' },
  { value: 'ltr', label: 'LTR', ariaLabel: 'כיוון משמאל לימין' },
];

// AFTER
const DIRECTIONS: { value: DocDirection; label: string; ariaLabel: string }[] = [
  { value: 'auto', label: 'BiDi', ariaLabel: 'זיהוי כיוון אוטומטי' },
  { value: 'rtl', label: 'RTL', ariaLabel: 'כיוון מימין לשמאל' },
  { value: 'ltr', label: 'LTR', ariaLabel: 'כיוון משמאל לימין' },
];
```

No other changes needed. `handleKeyDown` arithmetic (`% DIRECTIONS.length`) works for 3 items automatically.

**Note:** `useDocDirection` default remains `'rtl'` (not `'auto'`). Users who want per-sentence BiDi must explicitly click the BiDi button. This preserves backward compatibility — existing behavior unchanged on first load.

### PDF Export — No Changes Required

PDF export uses `generatePdf(element, filename)` where `element = previewContentRef.current` (the live DOM). Since `MarkdownRenderer` renders with BiDi `dir` attributes already in the DOM, PDF capture inherits them automatically. No changes to `lib/export/pdf-generator.ts`.

### types/editor.ts — Exact Diff

```typescript
// BEFORE
export type DocDirection = 'rtl' | 'ltr';

// AFTER
export type DocDirection = 'rtl' | 'ltr' | 'auto';
```

**TypeScript impact:** Any `switch` or exhaustive check on `DocDirection` will get a TypeScript error if `'auto'` is not handled. The only such places are `DirectionToggle.tsx` (where we're adding 'auto') and the export functions (where we add the `autoBidi`/`effectiveDir` pattern). The `buildHtmlDocument`, `buildWordHtml`, `buildCssVarHtml` functions accept `DocDirection` for their `dir` parameter — update them to accept the narrower `'rtl' | 'ltr'` type, or just ensure they're only ever called with `effectiveDir` (which is already `'rtl' | 'ltr'`). Simplest: leave their parameter types as `DocDirection` and TypeScript won't complain since they accept the wider union.

### Marked.js Output Reference (What apply-bidi.ts Parses)

| Input Markdown | Marked.js Output |
|---|---|
| `paragraph` | `<p>paragraph</p>\n` |
| `# Heading` | `<h1>Heading</h1>\n` |
| `- tight item` | `<ul>\n<li>tight item</li>\n</ul>\n` |
| `- loose item\n\n- loose` | `<ul>\n<li><p>loose item</p>\n</li>\n<li><p>loose</p>\n</li>\n</ul>\n` |
| `\| A \| B \|` | `<table>...<td>A</td><td>B</td>...</table>` |
| `> quote` | `<blockquote>\n<p>quote</p>\n</blockquote>\n` |
| ` ```lang\ncode``` ` | `<pre><code class="hljs language-lang">...</code></pre>\n` |
| ` ```mermaid\ngraph``` ` | `<div class="mermaid-wrapper"><div class="mermaid">graph</div></div>\n` |

### Architecture Compliance

| Rule | Application |
|---|---|
| Utility files: kebab-case | `lib/bidi/apply-bidi.ts`, `lib/bidi/apply-bidi.test.ts` |
| Unit tests co-located | `apply-bidi.test.ts` next to `apply-bidi.ts` |
| TypeScript explicit return types | `applyBidiToHtml(html: string): string` |
| No external state / side effects | Pure function — no React, no hooks |
| Vitest for unit tests | Same as `lib/bidi/detect-direction.test.ts` (Story 4.1) |
| Named exports only | No default exports in `lib/bidi/` |
| No new npm packages | Pure TypeScript regex — zero new dependencies |

### Anti-Patterns to Avoid

- **Do NOT create a `lib/bidi/index.ts` barrel file** — Story 4.1 explicitly says no barrel. Import directly from specific files.
- **Do NOT modify `MarkdownRenderer.tsx` to add a `BiDiWrapper` component** — BiDi post-processing belongs in `renderMarkdown`, not as a React component.
- **Do NOT use `DOMParser` or `cheerio` for HTML parsing** — regex is sufficient and keeps the code server-compatible (Next.js SSR). No new dependency needed.
- **Do NOT apply BiDi to ALL elements** — Only block-level text containers: `<p>`, `<h1>`-`<h6>`, tight `<li>`, `<td>`, `<th>`. Do NOT target `<div>`, `<span>`, `<blockquote>` (outer), `<ul>`, `<ol>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`.
- **Do NOT change `useDocDirection` default** — Keep `'rtl'` as default. 'auto' is an opt-in feature.
- **Do NOT add `autoBidi` to the `pdf-generator.ts` call** — PDF export reads the live DOM which already has `dir` attributes from `MarkdownRenderer`.
- **Do NOT forget to add `dir` to the `useMemo` dep array in `MarkdownRenderer.tsx`** — failing to do so causes stale HTML when user switches between auto/rtl/ltr.
- **Do NOT use `charCodeAt`** — `detectSentenceDirection` (Story 4.1) uses `codePointAt(0)` with spread; Story 4.2 doesn't reimplement detection.

### Cross-Story Context

**Story 4.1 (prerequisite):**
- Creates `lib/bidi/detect-direction.ts` with `detectSentenceDirection` and `analyzeDocument`
- Creates `lib/bidi/unicode-ranges.ts` with Unicode range constants
- `apply-bidi.ts` uses `detectSentenceDirection` (single-sentence variant), NOT `analyzeDocument` (batch variant)

**Story 3.x export context:**
- `lib/export/html-generator.ts` and `word-copy.ts` were modified in Story 3.3 and 3.4
- Both pass `dir: DocDirection` and call `renderMarkdown(content)` — Story 4.2 extends this with `autoBidi` logic
- `lib/export/pdf-generator.ts` takes the DOM element directly — NO change needed (BiDi attrs are in DOM already)

**Future stories:**
- All future stories that display text should pass `dir` through to `MarkdownRenderer` — the existing prop pattern already handles this

### Git Intelligence

Commit pattern for this story: `"Implement Story 4.2: BiDi integration with rendering pipeline"`

New files to CREATE:
- `lib/bidi/apply-bidi.ts`
- `lib/bidi/apply-bidi.test.ts`

Files to MODIFY:
- `types/editor.ts` — add 'auto' to DocDirection
- `components/layout/DirectionToggle.tsx` — add BiDi option
- `lib/markdown/render-pipeline.ts` — add autoBidi param and import
- `lib/markdown/render-pipeline.test.ts` — add BiDi tests
- `components/preview/MarkdownRenderer.tsx` — pass autoBidi, fix dep array, fix container dir
- `lib/export/html-generator.ts` — autoBidi + effectiveDir
- `lib/export/word-copy.ts` — autoBidi + effectiveDir (both copyForWord and copyHtml)

Files NOT to touch:
- `lib/bidi/detect-direction.ts` — Story 4.1's output, do NOT modify
- `lib/bidi/unicode-ranges.ts` — Story 4.1's output, do NOT modify
- `lib/export/pdf-generator.ts` — no change needed (DOM-based export)
- `lib/export/md-generator.ts` — exports raw Markdown text, no rendering involved
- `app/editor/page.tsx` — passes `docDirection` through; no change needed
- `components/preview/PreviewPanel.tsx` — passes `dir` through to MarkdownRenderer; no change needed
- `components/preview/PresentationView.tsx` — passes `dir` through; no change needed
- `components/editor/EditorPanel.tsx`, `EditorTextarea.tsx` — editor input direction, not preview

### Project Structure Notes

**Alignment with unified project structure:**
- `lib/bidi/apply-bidi.ts` — follows kebab-case utility naming per architecture spec line 412
- `lib/bidi/apply-bidi.test.ts` — co-located test per architecture spec line 443
- No new directories — `lib/bidi/` already exists (Story 4.1 creates it)

**`@/` path aliases:** All imports in `lib/markdown/render-pipeline.ts` use `@/lib/bidi/apply-bidi` (Next.js tsconfig alias). This is consistent with how other lib files import across directories (e.g., `html-generator.ts` uses `@/lib/markdown/render-pipeline`).

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2 (lines 671–688)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — BiDi integrates into rendering pipeline as post-processing (line 375)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — lib/bidi/ source tree (lines 666–669)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — RTL/BiDi cross-cutting concern (line 787)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Data flow: renderMarkdown -> export targets (line 806)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/implementation-artifacts/4-1-per-sentence-bidi-detection-engine.md — Story 4.1 (prerequisite, files created, API)](_bmad-output/implementation-artifacts/4-1-per-sentence-bidi-detection-engine.md)
- [Source: lib/markdown/render-pipeline.ts — Current 7-line pipeline (must add autoBidi param)](lib/markdown/render-pipeline.ts)
- [Source: lib/markdown/render-pipeline.test.ts — Existing test patterns to extend](lib/markdown/render-pipeline.test.ts)
- [Source: components/preview/MarkdownRenderer.tsx — useMemo, dir prop, DOMPurify pattern](components/preview/MarkdownRenderer.tsx)
- [Source: lib/export/html-generator.ts — renderMarkdown call, effectiveDir pattern](lib/export/html-generator.ts)
- [Source: lib/export/word-copy.ts — copyForWord/copyHtml, same effectiveDir pattern](lib/export/word-copy.ts)
- [Source: components/layout/DirectionToggle.tsx — DIRECTIONS array to extend](components/layout/DirectionToggle.tsx)
- [Source: types/editor.ts — DocDirection type to extend](types/editor.ts)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

### File List