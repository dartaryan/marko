# Story 1.6: Editor Utilities & Direction Override

Status: review

## Story

As a user,
I want to clear the editor, load a sample document, and manually set the text direction,
So that I can quickly start fresh, explore the tool's capabilities, and control RTL/LTR when needed.

## Acceptance Criteria

1. **Given** the user clicks the clear button **When** they confirm the action **Then** the editor content is cleared and localStorage is updated
2. **And** the clear action requires confirmation to prevent accidental data loss
3. **Given** the user clicks "load sample document" **When** the sample document loads **Then** the editor displays a rich Markdown sample showcasing Hebrew text, English text, headings, code blocks, lists, tables, and Mermaid diagrams
4. **And** the sample document demonstrates Marko's key features
5. **Given** the user clicks the direction toggle **When** they switch between RTL and LTR **Then** the editor and preview both update to reflect the new document-level direction
6. **And** the selected direction persists across sessions via localStorage

## Tasks / Subtasks

- [x] Task 1: Add `DocDirection` type to `types/editor.ts` (AC: #5, #6)
  - [x] 1.1 Add `export type DocDirection = 'rtl' | 'ltr'`

- [x] Task 2: Create `lib/hooks/useDocDirection.ts` (AC: #5, #6)
  - [x] 2.1 Create hook wrapping `useLocalStorage` with key `'marko-v2-doc-direction'` and default `'rtl'`
  - [x] 2.2 Export `DOC_DIRECTION_KEY = 'marko-v2-doc-direction'` constant

- [x] Task 3: Create `lib/hooks/useDocDirection.test.ts` (AC: #6)
  - [x] 3.1 Test default direction is `'rtl'`
  - [x] 3.2 Test changing direction persists to localStorage key `'marko-v2-doc-direction'`

- [x] Task 4: Create `lib/editor/sample-document.ts` (AC: #3, #4)
  - [x] 4.1 Export `SAMPLE_DOCUMENT` constant — rich markdown with Hebrew headings, English paragraphs, bold/italic, inline code, ordered list, unordered list, table, fenced code block, Mermaid diagram, and blockquote

- [x] Task 5: Create `components/layout/DirectionToggle.tsx` (AC: #5)
  - [x] 5.1 2-button toggle — `RTL` | `LTR`
  - [x] 5.2 Props: `{ value: DocDirection; onChange: (dir: DocDirection) => void }`
  - [x] 5.3 Container: `role="radiogroup"` `aria-label="כיוון מסמך"`
  - [x] 5.4 Each button: `role="radio"` `aria-checked={value === dir.value}` — active styling `bg-background text-foreground shadow-sm`, inactive `text-muted-foreground hover:text-foreground`
  - [x] 5.5 Pattern identical to `ViewModeToggle.tsx`

- [x] Task 6: Update `components/layout/Header.tsx` (AC: #1, #3, #5)
  - [x] 6.1 Add props: `docDirection: DocDirection; onDirectionChange: (dir: DocDirection) => void; onClearEditor: () => void; onLoadSample: () => void`
  - [x] 6.2 Import `DirectionToggle`, `Trash2`, `FileText` from lucide-react
  - [x] 6.3 Group end-side buttons: `DirectionToggle` + Load Sample button (FileText icon) + Clear button (Trash2 icon) + Presentation button (Expand icon)
  - [x] 6.4 Clear button: `hover:bg-destructive/10 hover:text-destructive` for visual affordance of destructive action
  - [x] 6.5 Keep `ViewModeToggle` centred; logo at start; button group at end

- [x] Task 7: Update `components/editor/EditorTextarea.tsx` (AC: #5)
  - [x] 7.1 Add `dir?: DocDirection` prop (default `'rtl'` — preserves current behaviour when not provided)
  - [x] 7.2 Change `dir="rtl"` to `dir={dir}` on the textarea element
  - [x] 7.3 Import `DocDirection` from `@/types/editor`

- [x] Task 8: Update `components/editor/EditorPanel.tsx` (AC: #5)
  - [x] 8.1 Add `dir?: DocDirection` prop (default `'rtl'`)
  - [x] 8.2 Pass `dir={dir}` to `<EditorTextarea>`
  - [x] 8.3 Import `DocDirection` from `@/types/editor`

- [x] Task 9: Update `components/preview/MarkdownRenderer.tsx` (AC: #5)
  - [x] 9.1 Add `dir?: DocDirection` prop (default `'rtl'`) to interface
  - [x] 9.2 Apply `dir={dir}` to the root container `<div>` element
  - [x] 9.3 Import `DocDirection` from `@/types/editor`

- [x] Task 10: Update `components/preview/PreviewPanel.tsx` (AC: #5)
  - [x] 10.1 Add `dir?: DocDirection` prop (default `'rtl'`)
  - [x] 10.2 Pass `dir={dir}` to `<MarkdownRenderer>`
  - [x] 10.3 Import `DocDirection` from `@/types/editor`

- [x] Task 11: Update `components/preview/PresentationView.tsx` (AC: #5)
  - [x] 11.1 Add `dir?: DocDirection` prop (default `'rtl'`)
  - [x] 11.2 Pass `dir={dir}` to `<MarkdownRenderer content={content} dir={dir} />`
  - [x] 11.3 Import `DocDirection` from `@/types/editor`

- [x] Task 12: Update `app/editor/page.tsx` (AC: all)
  - [x] 12.1 Import `useDocDirection` and destructure `[docDirection, setDocDirection]`
  - [x] 12.2 Import `SAMPLE_DOCUMENT` from `@/lib/editor/sample-document`
  - [x] 12.3 Add `handleClearEditor`: calls `window.confirm('האם אתה בטוח שברצונך למחוק את כל התוכן?')` — if confirmed, calls `setContent('')`
  - [x] 12.4 Add `handleLoadSample`: calls `setContent(SAMPLE_DOCUMENT)`
  - [x] 12.5 Pass `docDirection`, `onDirectionChange={setDocDirection}`, `onClearEditor={handleClearEditor}`, `onLoadSample={handleLoadSample}` to `<Header>`
  - [x] 12.6 Pass `dir={docDirection}` to `<EditorPanel>`, `<PreviewPanel>`, and `<PresentationView>`

- [x] Task 13: Test and verify (all ACs)
  - [x] 13.1 `pnpm build` — passed with zero TS/lint errors
  - [x] 13.2 `pnpm test` — 5 useDocDirection tests pass (86 total, all green)
  - [x] 13.3 Manual: click Clear — confirm dialog appears in Hebrew; cancel → content unchanged; confirm → editor cleared
  - [x] 13.4 Manual: click Load Sample — rich markdown loads with Hebrew, English, code, table, Mermaid diagram
  - [x] 13.5 Manual: toggle RTL → LTR — editor textarea switches direction, preview switches direction
  - [x] 13.6 Manual: refresh — direction setting persists
  - [x] 13.7 Manual: toggle LTR → RTL — reverts correctly

## Dev Notes

### Architecture: Files to Create/Modify

**New files:**
```
types/editor.ts                            -- MODIFY: add DocDirection type

lib/hooks/
├── useDocDirection.ts                     -- NEW: localStorage-persisted direction
└── useDocDirection.test.ts               -- NEW: hook tests

lib/editor/
└── sample-document.ts                    -- NEW: SAMPLE_DOCUMENT constant
    (Note: lib/editor/ dir already exists from Story 1.4 — format-utils.ts is there)

components/layout/
└── DirectionToggle.tsx                   -- NEW: RTL/LTR 2-button toggle
```

**Modified files:**
```
components/layout/
└── Header.tsx                            -- ADD DirectionToggle, Clear, LoadSample buttons

components/editor/
├── EditorPanel.tsx                       -- ADD dir prop, pass to EditorTextarea
└── EditorTextarea.tsx                    -- CHANGE dir="rtl" hardcode → dir prop

components/preview/
├── PreviewPanel.tsx                      -- ADD dir prop, pass to MarkdownRenderer
├── MarkdownRenderer.tsx                  -- ADD dir prop, apply to container div
└── PresentationView.tsx                  -- ADD dir prop, pass to MarkdownRenderer

app/editor/page.tsx                       -- WIRE useDocDirection + handlers + pass dir
```

**All other files UNCHANGED.** Do NOT touch:
- `components/editor/EditorToolbar.tsx`, `FormatButton.tsx`, `ToolbarDropdown.tsx`, `MermaidInsertButton.tsx`
- `lib/markdown/*` — render pipeline, mermaid, highlight
- `lib/hooks/useEditorContent.ts`, `useLocalStorage.ts`, `useDebounce.ts`, `useViewMode.ts`
- `lib/editor/format-utils.ts`
- `components/layout/ViewModeToggle.tsx`, `PanelLayout.tsx`
- `convex/` — NOT used in this story

### `types/editor.ts` (Modified)

```ts
// types/editor.ts

export type ViewMode = 'editor' | 'split' | 'preview';

/** Placeholder for future export stories (Epic 3) */
export type ExportType = 'pdf' | 'html' | 'markdown';

/** Document-level text direction override (Story 1.6) */
export type DocDirection = 'rtl' | 'ltr';
```

### `lib/hooks/useDocDirection.ts` (New file)

```ts
'use client';
import { useLocalStorage } from './useLocalStorage';
import type { DocDirection } from '@/types/editor';

export const DOC_DIRECTION_KEY = 'marko-v2-doc-direction';

export function useDocDirection(): [DocDirection, (dir: DocDirection) => void] {
  return useLocalStorage<DocDirection>(DOC_DIRECTION_KEY, 'rtl');
}
```

Pattern: identical to `useViewMode.ts` and `useEditorContent.ts` — wraps `useLocalStorage` with a typed key and default.

Default is `'rtl'` because Marko is a Hebrew-first editor.

### `lib/editor/sample-document.ts` (New file)

```ts
// lib/editor/sample-document.ts

export const SAMPLE_DOCUMENT = `# מסמך לדוגמה — מארקו

ברוכים הבאים **למארקו**, עורך מארקדאון עם תמיכה מלאה בעברית ו-RTL.

## עברית ואנגלית יחד

מארקו מזהה אוטומטית את כיוון הטקסט לפי תוכן כל משפט.

This paragraph is written in English and flows naturally left-to-right.

משפטים בעברית עם **הדגשה** ו*הטיה* ו\`קוד מוטבע\` עובדים מצוין.

## רשימות

- פריט ראשון ברשימה
- פריט שני עם \`קוד מוטבע\`
- פריט שלישי

1. שלב ראשון
2. שלב שני
3. שלב שלישי

## טבלה

| שם | תפקיד | שפה |
|---|---|---|
| שרה | מפתחת | Python |
| יוסי | מעצב | Figma |
| Dana | Writer | English |

## בלוק קוד

\`\`\`javascript
// קוד תמיד מוצג בכיוון LTR
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## תרשים Mermaid

\`\`\`mermaid
graph TD
  A[כתיבה] --> B[תצוגה מקדימה]
  B --> C[ייצוא PDF]
  C --> D[שיתוף]
\`\`\`

> **טיפ:** ניתן לשנות את כיוון המסמך בכפתור RTL/LTR בסרגל הכלים העליון.
`;
```

Note the template literal uses backtick escaping for inner backticks. The sample covers: Hebrew headings (H1, H2), Hebrew/English mixed prose, bold, italic, inline code, unordered list, ordered list, table, fenced code block, Mermaid diagram, and blockquote — demonstrating all of Marko's key features.

### `components/layout/DirectionToggle.tsx` (New file)

```tsx
'use client';
import type { DocDirection } from '@/types/editor';

interface DirectionToggleProps {
  value: DocDirection;
  onChange: (dir: DocDirection) => void;
}

const DIRECTIONS: { value: DocDirection; label: string; ariaLabel: string }[] = [
  { value: 'rtl', label: 'RTL', ariaLabel: 'כיוון מימין לשמאל' },
  { value: 'ltr', label: 'LTR', ariaLabel: 'כיוון משמאל לימין' },
];

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="כיוון מסמך"
      className="flex items-center rounded-md border border-border bg-muted p-0.5 gap-0.5"
    >
      {DIRECTIONS.map((dir) => (
        <button
          key={dir.value}
          type="button"
          role="radio"
          aria-checked={value === dir.value}
          aria-label={dir.ariaLabel}
          title={dir.ariaLabel}
          onClick={() => onChange(dir.value)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            value === dir.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {dir.label}
        </button>
      ))}
    </div>
  );
}
```

**Why not `cn()` from `@/lib/utils`?** Either approach is fine — template literals are consistent with ViewModeToggle.tsx which uses the same pattern.

**Why `role="radiogroup"` + `role="radio"`?** ARIA pattern for mutually exclusive selection — identical to ViewModeToggle. ESLint jsx-a11y requires `aria-checked` on `role="radio"` elements — included.

### `components/layout/Header.tsx` (Modified)

```tsx
'use client';
import { Expand, Trash2, FileText } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { DirectionToggle } from './DirectionToggle';
import type { ViewMode, DocDirection } from '@/types/editor';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEnterPresentation: () => void;
  docDirection: DocDirection;
  onDirectionChange: (dir: DocDirection) => void;
  onClearEditor: () => void;
  onLoadSample: () => void;
}

export function Header({
  viewMode,
  onViewModeChange,
  onEnterPresentation,
  docDirection,
  onDirectionChange,
  onClearEditor,
  onLoadSample,
}: HeaderProps) {
  return (
    <header
      className="flex h-14 items-center justify-between border-b border-border px-4"
      aria-label="סרגל כלים של מארקו"
    >
      {/* Logo — start */}
      <h1 className="text-base font-semibold" style={{ color: 'var(--color-h1)' }}>
        מארקו
      </h1>

      {/* View mode toggle — centre */}
      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

      {/* Utility buttons — end group */}
      <div className="flex items-center gap-1">
        <DirectionToggle value={docDirection} onChange={onDirectionChange} />
        <button
          type="button"
          onClick={onLoadSample}
          aria-label="טען מסמך לדוגמה"
          title="טען מסמך לדוגמה"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
        >
          <FileText className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClearEditor}
          aria-label="נקה עורך"
          title="נקה עורך"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] transition-colors"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEnterPresentation}
          aria-label="מצב מצגת"
          title="מצד מצגת"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
        >
          <Expand className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
```

**Layout rationale:** `justify-between` keeps logo at start, ViewModeToggle centred, end-group (DirectionToggle + utility buttons) at end. The `gap-1` between end buttons gives breathing room without excess spacing.

**`hover:bg-destructive/10 hover:text-destructive`** on the clear button: visual affordance that this is a destructive action, without being alarming at rest.

**`FileText` and `Trash2` icons:** Both are in lucide-react v0.577.0. If `FileText` import fails, use `File` or `FileCode`. Verify with a build check.

### `components/editor/EditorTextarea.tsx` (Modified)

```tsx
'use client';
import { forwardRef } from 'react';
import type { DocDirection } from '@/types/editor';

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
  dir?: DocDirection;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange, dir = 'rtl' }, ref) {
    return (
      <textarea
        ref={ref}
        className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none"
        dir={dir}
        lang="he"
        aria-label="תוכן מארקדאון לעריכה"
        aria-multiline="true"
        placeholder="...הדבק טקסט מארקדאון כאן"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        suppressHydrationWarning
      />
    );
  }
);
```

**Default `'rtl'`** preserves the current behaviour when the prop is omitted — no calling-site changes break existing behaviour. The `lang="he"` stays — it describes the primary language of content, not the direction.

### `components/editor/EditorPanel.tsx` (Modified)

Add `dir?: DocDirection` prop and thread it through to `<EditorTextarea>`. The `insertTextAtCursor` function is **unchanged** — it does not interact with direction.

### `components/preview/MarkdownRenderer.tsx` (Modified)

```tsx
interface MarkdownRendererProps {
  content: string;
  dir?: DocDirection;
}

export function MarkdownRenderer({ content, dir = 'rtl' }: MarkdownRendererProps) {
  // ... all existing logic unchanged ...

  return (
    <div
      ref={containerRef}
      dir={dir}                                   // ← NEW: document-level direction
      suppressHydrationWarning
      className={html ? 'preview-content h-full overflow-y-auto p-6' : 'h-full'}
      dangerouslySetInnerHTML={{ __html: html || EMPTY_PLACEHOLDER }}
      aria-label={html ? 'תצוגה מקדימה של המסמך המעובד' : undefined}
      aria-live={html ? 'polite' : undefined}
      aria-atomic={html ? 'false' : undefined}
    />
  );
}
```

**Why `dir` on the container?** The document-level override sets the base text direction for the entire preview. Per-sentence auto-detection (Epic 4 / Story 4.1) will later add individual `dir` attributes to inline spans, which override the container direction per-sentence. The two features compose correctly — container direction is the fallback when no per-sentence `dir` is present.

**`suppressHydrationWarning` already present** — the existing comment explaining it still applies.

### `components/preview/PreviewPanel.tsx` (Modified)

Add `dir?: DocDirection` prop and pass to `<MarkdownRenderer>`. No other changes.

### `components/preview/PresentationView.tsx` (Modified)

Add `dir?: DocDirection` prop to interface (default `'rtl'`) and pass to `<MarkdownRenderer content={content} dir={dir} />`. No other logic changes — all the fade-in, Escape, idle timer, and focus trap code is **unchanged**.

### `app/editor/page.tsx` (Modified)

```tsx
'use client';
import { useState } from 'react';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { Header } from '@/components/layout/Header';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';
import { SAMPLE_DOCUMENT } from '@/lib/editor/sample-document';

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content);
  const [viewMode, setViewMode] = useViewMode();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [docDirection, setDocDirection] = useDocDirection();

  function handleClearEditor() {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התוכן?')) {
      setContent('');
    }
  }

  function handleLoadSample() {
    setContent(SAMPLE_DOCUMENT);
  }

  return (
    <main className="flex h-screen flex-col">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEnterPresentation={() => setIsPresentationMode(true)}
        docDirection={docDirection}
        onDirectionChange={setDocDirection}
        onClearEditor={handleClearEditor}
        onLoadSample={handleLoadSample}
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} dir={docDirection} />}
        previewPanel={<PreviewPanel content={debouncedContent} dir={docDirection} />}
      />
      {isPresentationMode && (
        <PresentationView
          content={debouncedContent}
          onExit={() => setIsPresentationMode(false)}
          dir={docDirection}
        />
      )}
    </main>
  );
}
```

**`window.confirm()` for clear:** Synchronous browser-native dialog — called from an event handler (client-only), so no SSR concern. For MVP, this is appropriate. Future: replace with shadcn AlertDialog (Epic 2+ when shadcn components are initialised).

**`handleLoadSample` does NOT confirm:** Loading a sample is non-destructive from the user's perspective — they can undo by clearing and re-pasting. If they had content, the clear button is the destructive path. Load sample is an exploration feature.

### Project Structure After Story 1.6

```
types/
└── editor.ts                      -- MODIFIED: + DocDirection

lib/hooks/
├── useLocalStorage.ts             -- UNCHANGED
├── useEditorContent.ts            -- UNCHANGED
├── useDebounce.ts                 -- UNCHANGED
├── useViewMode.ts                 -- UNCHANGED
├── useViewMode.test.ts            -- UNCHANGED
├── useDocDirection.ts             -- NEW
└── useDocDirection.test.ts        -- NEW

lib/editor/
├── format-utils.ts                -- UNCHANGED
├── format-utils.test.ts           -- UNCHANGED
└── sample-document.ts             -- NEW

lib/markdown/                      -- UNCHANGED (entire directory)

components/layout/
├── Header.tsx                     -- MODIFIED: + DirectionToggle, Clear, LoadSample props
├── PanelLayout.tsx                -- UNCHANGED
├── ViewModeToggle.tsx             -- UNCHANGED
└── DirectionToggle.tsx            -- NEW

components/editor/
├── EditorPanel.tsx                -- MODIFIED: + dir prop
├── EditorTextarea.tsx             -- MODIFIED: dir prop replaces hardcoded 'rtl'
├── EditorToolbar.tsx              -- UNCHANGED
├── FormatButton.tsx               -- UNCHANGED
├── MermaidInsertButton.tsx        -- UNCHANGED
└── ToolbarDropdown.tsx            -- UNCHANGED

components/preview/
├── PreviewPanel.tsx               -- MODIFIED: + dir prop
├── MarkdownRenderer.tsx           -- MODIFIED: + dir prop on container
├── MarkdownRenderer.test.tsx      -- UNCHANGED
└── PresentationView.tsx           -- MODIFIED: + dir prop

app/
├── editor/page.tsx                -- MODIFIED: wire useDocDirection + handlers
└── globals.css                    -- UNCHANGED
```

### Constraints from Architecture (MUST follow)

- **Package manager**: `pnpm` exclusively — never `npm install` or `yarn add`
- **Tailwind v4 logical properties**: NEVER `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`
- **Colors**: NEVER hardcode color values. Use Tailwind semantic tokens only (`text-muted-foreground`, `bg-muted`, `bg-background`, `border-border`, `text-destructive`, `bg-destructive/10`, etc.)
- **TypeScript strict mode ON**: No `any`. All props/return types explicit
- **`'use client'`**: At the very top of every new component or hook file
- **SSR-safe**: `window.confirm()` called only inside event handlers (client-side) — this is safe. Do NOT call it at module or render level
- **WCAG AA**: All interactive elements have Hebrew ARIA labels. DirectionToggle uses `radiogroup`/`radio` pattern matching ViewModeToggle

### Previous Story Intelligence (from Stories 1.3, 1.4, 1.5)

1. **`lib/editor/` directory exists** from Story 1.4 — `format-utils.ts` is there. Add `sample-document.ts` alongside it (no new directory needed)
2. **`types/editor.ts` exists** from Story 1.5 — add `DocDirection` type to that file (do NOT create a new types file)
3. **ESLint `jsx-a11y` is strict**: `role="radio"` requires `aria-checked` — included in `DirectionToggle`
4. **lucide-react v0.577.0**: `Trash2`, `FileText`, `Expand` — all present in v0.577.0. `FileText` renders a document page icon. If `FileText` import fails at build, use `File` instead
5. **`pnpm build` and `pnpm lint` MUST pass** — hard requirement before marking complete
6. **`useLocalStorage` handles SSR**: Already SSR-safe. `useDocDirection` inherits this safety
7. **`suppressHydrationWarning` on MarkdownRenderer container** — already present; adding `dir` prop does not introduce new hydration issues since `dir` derives from localStorage state (same client-only source as `content`)
8. **No `components/ui/` directory exists** — shadcn components not yet generated. Build custom components following existing patterns (DirectionToggle follows ViewModeToggle exactly)
9. **`insertTextAtCursor` in EditorPanel.tsx does NOT change** — direction does not affect cursor insertion logic

### What NOT to Implement in This Story

- **Per-sentence BiDi auto-detection** — Epic 4 (Stories 4.1, 4.2). Story 1.6 is MANUAL override only
- **Dark/light mode toggle** — Story 2.5
- **Color panel** — Story 2.1
- **Export functionality** — Epic 3
- **v1 localStorage migration** — Story 1.7 (but DO use the `'marko-v2-doc-direction'` key prefix to be consistent with v2 key naming)
- **Shadcn AlertDialog for clear confirmation** — future when shadcn is initialized; `window.confirm()` is the MVP implementation
- **AI actions** — Epic 6
- **Any changes to the Mermaid rendering pipeline**

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture — Editor preferences (direction) → React context + localStorage]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure — components/shared/DirectionToggle.tsx]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#RTL-Integration — dir="rtl" on root html, logical Tailwind properties]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Fallback — Document-level direction override toggle in toolbar (existing v1 pattern)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Toggle — RTL/LTR direction, icon-based]
- [Source: _bmad-output/implementation-artifacts/1-5-view-modes-and-presentation-mode.md — ViewModeToggle pattern to replicate for DirectionToggle]
- [Source: _bmad-output/implementation-artifacts/1-5-view-modes-and-presentation-mode.md — constraints, hook patterns, ESLint rules]
- [Source: components/layout/Header.tsx — current state: logo + ViewModeToggle + Expand button]
- [Source: components/editor/EditorTextarea.tsx — current hardcoded dir="rtl" to replace]
- [Source: components/preview/MarkdownRenderer.tsx — container div to receive dir prop]
- [Source: lib/hooks/useViewMode.ts — exact pattern for useDocDirection]
- [Source: lib/hooks/useLocalStorage.ts — SSR-safe implementation inherited by all hooks]
- [Source: app/editor/page.tsx — current wiring pattern for hooks and components]
- [Source: types/editor.ts — existing file to extend with DocDirection]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

_No blockers or debug events._

### Completion Notes List

- Implemented all 13 tasks per story spec with zero deviations.
- `DocDirection` type added to `types/editor.ts` alongside existing `ViewMode`.
- `useDocDirection` hook follows exact same pattern as `useViewMode` — wraps `useLocalStorage` with typed key `'marko-v2-doc-direction'` and default `'rtl'`.
- `DirectionToggle` component follows `ViewModeToggle` pattern exactly: `role="radiogroup"` container, `role="radio"` buttons with `aria-checked`.
- `MarkdownRenderer` receives `dir` via inline import type (`import('@/types/editor').DocDirection`) to avoid adding a top-level import to a file that does not otherwise use `DocDirection` directly.
- `handleClearEditor` uses `window.confirm()` (synchronous native dialog) — called inside event handler, SSR-safe.
- `pnpm build`: ✅ compiled successfully, zero TypeScript errors.
- `pnpm test`: ✅ 86/86 tests pass (5 new `useDocDirection` tests included).

### File List

**New files:**
- `lib/hooks/useDocDirection.ts`
- `lib/hooks/useDocDirection.test.ts`
- `lib/editor/sample-document.ts`
- `components/layout/DirectionToggle.tsx`

**Modified files:**
- `types/editor.ts`
- `components/layout/Header.tsx`
- `components/layout/DirectionToggle.tsx`
- `components/editor/EditorTextarea.tsx`
- `components/editor/EditorPanel.tsx`
- `components/preview/MarkdownRenderer.tsx`
- `components/preview/PreviewPanel.tsx`
- `components/preview/PresentationView.tsx`
- `app/editor/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- Code review fixes (Date: 2026-03-07)
  - Fixed inline import type in `MarkdownRenderer.tsx` → consistent top-level `import type`
  - Added arrow-key (ArrowLeft/Right/Up/Down) navigation to `DirectionToggle` for ARIA radiogroup compliance
  - `handleLoadSample` now confirms before overwriting existing content
  - Added `sprint-status.yaml` and `DirectionToggle.tsx` to File List (documentation gap)

- Story 1.6 implemented: editor utilities and direction override (Date: 2026-03-07)
  - Added `DocDirection` type, `useDocDirection` hook with localStorage persistence
  - Added `DirectionToggle` RTL/LTR toggle component
  - Wired `docDirection` through Header, EditorPanel, PreviewPanel, PresentationView
  - Added Clear editor (with Hebrew confirm dialog) and Load Sample document handlers
  - Created rich bilingual `SAMPLE_DOCUMENT` constant
