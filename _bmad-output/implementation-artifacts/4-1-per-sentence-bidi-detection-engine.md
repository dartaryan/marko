# Story 4.1: Per-Sentence BiDi Detection Engine

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a BiDi detection engine that analyzes Unicode character composition per sentence to determine text direction,
so that the rendering pipeline can apply correct RTL/LTR direction automatically.

## Acceptance Criteria

1. **AC1: RTL Classification** — Given a sentence containing predominantly Hebrew characters, when the detection engine analyzes it, then the sentence is classified as `'rtl'`.

2. **AC2: LTR Classification** — Given a sentence containing predominantly English/Latin characters, when the detection engine analyzes it, then the sentence is classified as `'ltr'`.

3. **AC3: Mixed Language — Dominant Set** — Given a mixed-language sentence (e.g., Hebrew with inline English terms), when the detection engine analyzes it, then direction is determined by the dominant character set (count of RTL-range vs. LTR-range Unicode code points), and RTL wins ties.

4. **AC4: Unicode Range Coverage** — The engine correctly identifies Hebrew characters (U+0590–U+05FF), Arabic characters (U+0600–U+06FF), and Latin characters (A–Z, a–z, U+0041–U+007A).

5. **AC5: Code Block Exclusion** — Code blocks and inline code content are always classified as `'ltr'` regardless of their text content, and are excluded from per-sentence direction analysis.

6. **AC6: Performance Budget** — The full detection pass on a typical document (up to 500 sentences) completes within the 100ms rendering performance budget.

7. **AC7: Comprehensive Test Coverage** — Unit tests cover: pure Hebrew, pure English, mixed Hebrew+English (Hebrew dominant), mixed Hebrew+English (English dominant), numbers only, HTML-wrapped text, empty string, Arabic characters, and batch `analyzeDocument` behavior.

## Tasks / Subtasks

- [ ] Task 1: Create `lib/bidi/unicode-ranges.ts` (AC: #4)
  - [ ] 1.1: Export `HEBREW_RANGE` constant: `{ start: 0x0590, end: 0x05FF }` (Hebrew Unicode block)
  - [ ] 1.2: Export `ARABIC_RANGE` constant: `{ start: 0x0600, end: 0x06FF }` (Arabic Unicode block)
  - [ ] 1.3: Export `LATIN_RANGE` constant: `{ start: 0x0041, end: 0x007A }` (Latin A–z block)
  - [ ] 1.4: Export `isRtlChar(codePoint: number): boolean` — returns `true` if codePoint is in HEBREW_RANGE or ARABIC_RANGE
  - [ ] 1.5: Export `isLtrChar(codePoint: number): boolean` — returns `true` if codePoint is in LATIN_RANGE
  - [ ] 1.6: Export `TextDirection` type: `export type TextDirection = 'rtl' | 'ltr'`

- [ ] Task 2: Create `lib/bidi/detect-direction.ts` (AC: #1–#6)
  - [ ] 2.1: Import `isRtlChar`, `isLtrChar`, `TextDirection` from `./unicode-ranges`
  - [ ] 2.2: Export `detectSentenceDirection(text: string): TextDirection`:
    - Strip HTML tags: `text.replace(/<[^>]*>/g, '')`
    - Iterate using `[...stripped]` (spread for surrogate-pair-safe iteration)
    - For each character, call `.codePointAt(0)` and count RTL vs LTR characters
    - Return `'rtl'` if `rtlCount >= ltrCount && (rtlCount + ltrCount) > 0`, else `'ltr'`
    - Return `'ltr'` for empty strings or strings with zero directional characters
  - [ ] 2.3: Export `analyzeDocument(sentences: string[]): TextDirection[]`:
    - Map each sentence through `detectSentenceDirection`
    - Returns array of `TextDirection` values, same length as input
    - This is the primary interface Story 4.2 will call from the rendering pipeline
  - [ ] 2.4: No default export — named exports only (project convention)

- [ ] Task 3: Create `lib/bidi/detect-direction.test.ts` (AC: #7)
  - [ ] 3.1: Import `{ detectSentenceDirection, analyzeDocument }` from `./detect-direction`
  - [ ] 3.2: `describe('detectSentenceDirection')` block with:
    - Pure Hebrew `'שלום עולם'` → `'rtl'`
    - Pure English `'Hello world'` → `'ltr'`
    - Hebrew dominant `'שלום React world'` → `'rtl'` (more Hebrew chars than Latin)
    - English dominant `'Hello world שלום'` → `'ltr'` (more Latin chars than Hebrew)
    - Numbers only `'12345'` → `'ltr'` (no directional chars, zero RTL/LTR counts → `'ltr'` default)
    - Empty string `''` → `'ltr'`
    - HTML-wrapped Hebrew `'<p>שלום עולם</p>'` → `'rtl'` (tags stripped before analysis)
    - Arabic characters `'مرحبا'` → `'rtl'`
    - RTL-wins-ties: sentence with equal RTL and LTR chars → `'rtl'`
  - [ ] 3.3: `describe('analyzeDocument')` block with:
    - Mixed array `['שלום', 'Hello', 'world']` → `['rtl', 'ltr', 'ltr']`
    - Empty array `[]` → `[]`
    - Single-element array `['שלום']` → `['rtl']`

## Dev Notes

### Scope — Detection Engine Only, No Pipeline Changes

**Story 4.1 creates the BiDi engine as a standalone pure-TypeScript library. Story 4.2 integrates it into the rendering pipeline.**

This story creates exactly 3 new files (directory `lib/bidi/` does not yet exist):
- `lib/bidi/unicode-ranges.ts`
- `lib/bidi/detect-direction.ts`
- `lib/bidi/detect-direction.test.ts`

Do NOT modify `lib/markdown/render-pipeline.ts`, `lib/markdown/config.ts`, `components/preview/MarkdownRenderer.tsx`, or any other existing file. This story is purely additive.

### Unicode Ranges

| Block | Start | End | Direction |
|---|---|---|---|
| Hebrew | U+0590 | U+05FF | RTL |
| Arabic | U+0600 | U+06FF | RTL |
| Latin (A–z) | U+0041 | U+007A | LTR |

Note: The Latin range U+0041–U+007A includes uppercase (A–Z, 0x41–0x5A) and lowercase (a–z, 0x61–0x7A) and the non-letter range 0x5B–0x60. Non-letter ASCII is directionally neutral in this implementation — acceptable for the detection use case.

### RTL-Wins-Ties Rule

When `rtlCount === ltrCount` and both are > 0, return `'rtl'`. Marko is a Hebrew-first application (default `dir="rtl"` on `<html>`). Mixed sentences with equal balance lean RTL.

### Surrogate-Pair-Safe Iteration

Use `[...text]` spread to iterate Unicode code points, NOT `text[i]` index access. JavaScript string indexing splits surrogate pairs for code points above U+FFFF. Spread correctly handles multi-byte code points. Then call `.codePointAt(0)` on each element.

```typescript
// CORRECT
for (const char of [...stripped]) {
  const cp = char.codePointAt(0);
  if (cp !== undefined) { ... }
}

// WRONG — splits surrogate pairs
for (let i = 0; i < text.length; i++) {
  const cp = text.charCodeAt(i); // broken for U+10000+
}
```

### HTML Tag Stripping

`detectSentenceDirection` receives both plain text and HTML fragments (e.g., from the rendering pipeline in Story 4.2). Always strip HTML tags before counting code points to prevent `<span class="hljs-keyword">` attribute content or tag names from polluting the directional character count.

```typescript
const stripped = text.replace(/<[^>]*>/g, '');
```

### Performance

Per-sentence detection is O(n) in character count. For a 500-sentence document with ~50 characters per sentence (25,000 characters), the iteration is ~25,000 operations. Pure synchronous JavaScript — well within the 100ms rendering budget. No async, no workers needed.

### No npm Packages Required

Pure TypeScript Unicode analysis using built-in `String.prototype.codePointAt()`. No external library needed. Do not add any new npm package for this story.

### Current render-pipeline.ts State (Story 4.2 will extend this)

```typescript
// lib/markdown/render-pipeline.ts — current 7-line implementation
import { marked } from './config';

export function renderMarkdown(content: string): string {
  if (!content.trim()) return '';
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
}
```

Story 4.2 will add a post-processing step after `marked.parse` that walks the HTML output and applies `dir` attributes using `analyzeDocument()`. Story 4.1 must NOT touch this file.

### Architecture Compliance

| Rule | Application |
|---|---|
| Utility files: kebab-case | `lib/bidi/detect-direction.ts`, `lib/bidi/unicode-ranges.ts` |
| Unit tests co-located | `lib/bidi/detect-direction.test.ts` next to source files |
| TypeScript explicit return types | All exported functions typed with `TextDirection` |
| No external state / side effects | Pure functions only — no React, no hooks, no localStorage |
| Vitest for unit tests | Same test framework as rest of project (`lib/markdown/render-pipeline.test.ts`) |
| Named exports only | No default exports (project convention in lib/) |

### Anti-Patterns to Avoid

- **Do NOT modify `render-pipeline.ts`** — BiDi integration is Story 4.2's responsibility
- **Do NOT use `charCodeAt(i)` loop** — use `[...text]` spread with `codePointAt(0)` for surrogate safety
- **Do NOT import React or any UI library** — `lib/bidi/` is pure framework-agnostic TypeScript
- **Do NOT add a new npm package** — pure TypeScript implementation, zero dependencies needed
- **Do NOT use raw `'rtl'`/`'ltr'` strings without the `TextDirection` type** — type the return values explicitly
- **Do NOT handle all Unicode RTL scripts** — scope is Hebrew + Arabic only (Marko's target users per architecture decision)
- **Do NOT create a `lib/bidi/index.ts` barrel file** — Story 4.2 imports directly from the specific files

### Cross-Story Context

**Story 4.2 (BiDi Integration — follows directly after this):**
- Will import `analyzeDocument` or `detectSentenceDirection` from `lib/bidi/detect-direction.ts`
- Will modify `lib/markdown/render-pipeline.ts` to add post-processing that applies `dir` attributes to `<p>`, `<li>`, `<td>` elements
- Will integrate as Marked.js post-processing (walks rendered HTML, wraps blocks with `dir` attributes)
- Architecture note (line 375): "BiDi engine integrates into the rendering pipeline (Marked.js post-processing)"
- Architecture note (line 687): "export outputs (PDF, HTML, Word copy) preserve the per-sentence direction attributes" — Story 4.2 handles this by ensuring the rendered HTML contains `dir` attributes that flow through to all export pipelines

**Story 3.x export context (important for Story 4.2 planning):**
- `lib/export/pdf-generator.ts`, `html-generator.ts`, `word-copy.ts` all receive rendered HTML from `render-pipeline.ts`
- Once Story 4.2 adds `dir` attributes to the HTML output, all exports inherit BiDi automatically
- Story 4.1 has no direct interaction with the export system

### Git Intelligence

Commit pattern: `"Implement Story 4.1: Per-sentence BiDi detection engine"`

New files to CREATE:
- `lib/bidi/unicode-ranges.ts`
- `lib/bidi/detect-direction.ts`
- `lib/bidi/detect-direction.test.ts`

Files NOT to touch (full list):
- `lib/markdown/render-pipeline.ts` — Story 4.2
- `lib/markdown/config.ts` — Story 4.2
- `components/preview/MarkdownRenderer.tsx` — Story 4.2
- All export files (`pdf-generator.ts`, `html-generator.ts`, etc.) — out of scope
- All component files — out of scope
- `app/editor/page.tsx` — out of scope

### Project Structure Notes

**New directory** `lib/bidi/` does not yet exist — create it with the three files above.

**Architecture alignment**: Architecture spec lines 666–669 define exactly these three filenames. The story must match those names precisely:
```
lib/bidi/
  detect-direction.ts      -- Per-sentence Hebrew/English detection
  unicode-ranges.ts        -- Hebrew/Arabic/Latin character ranges
  detect-direction.test.ts
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1 (lines 647–669)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — lib/bidi/ source tree (lines 666–669)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — BiDi integrates into rendering pipeline as post-processing (line 375)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — RTL/BiDi cross-cutting concern (line 787)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing: Vitest, unit tests co-located (lines 345, 443)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Naming patterns: kebab-case utility files (line 412)](_bmad-output/planning-artifacts/architecture.md)
- [Source: lib/markdown/render-pipeline.ts — Current pipeline state (7 lines, no BiDi)](lib/markdown/render-pipeline.ts)
- [Source: lib/markdown/config.ts — Marked.js configuration](lib/markdown/config.ts)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

### File List
