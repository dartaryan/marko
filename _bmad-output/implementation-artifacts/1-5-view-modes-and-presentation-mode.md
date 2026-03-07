# Story 1.5: View Modes & Presentation Mode

Status: done

## Story

As a user,
I want to toggle between editor-only, preview-only, split view, and a full-screen presentation mode,
So that I can focus on writing, reviewing, or presenting my document.

## Acceptance Criteria

1. **Given** the user is on the editor page **When** they select editor-only mode **Then** only the editor panel is visible
2. **Given** the user is on the editor page **When** they select preview-only mode **Then** only the preview panel is visible
3. **Given** the user is on the editor page **When** they select split mode **Then** both panels display side-by-side (desktop) or stacked with toggle (tablet/mobile)
4. **Given** the user is on the editor page **When** they enter presentation/reading mode **Then** the rendered content fills the screen in a large, distraction-free format
5. **And** controls appear on mouse movement and hide after inactivity (3s idle)
6. **And** Escape key exits presentation mode
7. **And** focus is trapped within the presentation view with `role="document"`
8. **And** `prefers-reduced-motion` is respected for enter/exit transitions (fade-in/out skipped)
9. **And** view mode state (editor/split/preview) persists across page refreshes via localStorage

## Tasks / Subtasks

- [x] Task 1: Create `types/editor.ts` (AC: #1, #2, #3)
  - [x] 1.1 Create `types/editor.ts` — export `ViewMode` type: `'editor' | 'split' | 'preview'`
  - [x] 1.2 Export `ExportType` type placeholder: `'pdf' | 'html' | 'markdown'` (architecture requires it, no harm adding it now)

- [x] Task 2: Create `lib/hooks/useViewMode.ts` (AC: #9)
  - [x] 2.1 Create `lib/hooks/useViewMode.ts` — wraps `useLocalStorage` with key `'marko-v2-view-mode'` and default `'split'`
  - [x] 2.2 Export `VIEW_MODE_KEY = 'marko-v2-view-mode'` constant for use in tests and migration
  - [x] 2.3 Create `lib/hooks/useViewMode.test.ts` — test default is `'split'`, test changing persists to localStorage

- [x] Task 3: Update `components/layout/PanelLayout.tsx` (AC: #1, #2, #3)
  - [x] 3.1 Add `viewMode: ViewMode` prop to `PanelLayoutProps`
  - [x] 3.2 Use inline `style={{ gridTemplateColumns, transition }}` to animate between: split=`'1fr 1fr'`, editor=`'1fr 0fr'`, preview=`'0fr 1fr'`
  - [x] 3.3 Both panel wrappers: add `overflow-hidden min-w-0` so collapsed panels (`0fr`) are fully clipped
  - [x] 3.4 Add `aria-hidden` on the collapsed panel: `aria-hidden={viewMode === 'preview'}` on editor wrapper, `aria-hidden={viewMode === 'editor'}` on preview wrapper
  - [x] 3.5 Transition: `'grid-template-columns 200ms ease-in-out'` — skip if `prefers-reduced-motion`
  - [x] 3.6 Keep existing `aria-label="פאנל עורך ותצוגה מקדימה"` on the grid container

- [x] Task 4: Create `components/layout/ViewModeToggle.tsx` (AC: #1, #2, #3)
  - [x] 4.1 Create `components/layout/ViewModeToggle.tsx` — 3-button segmented control
  - [x] 4.2 Props: `{ value: ViewMode; onChange: (mode: ViewMode) => void }`
  - [x] 4.3 Modes array: `[{ value: 'editor', labelHe: 'עורך', ariaLabel: 'מצב עורך בלבד' }, { value: 'split', labelHe: 'שניהם', ariaLabel: 'מצב פיצול' }, { value: 'preview', labelHe: 'תצוגה', ariaLabel: 'מצב תצוגה בלבד' }]`
  - [x] 4.4 Container: `role="radiogroup"` `aria-label="מצב תצוגה"` with border/bg styling
  - [x] 4.5 Each button: `role="radio"` `aria-checked={value === mode.value}` active styling `bg-background text-foreground shadow-sm`, inactive `text-muted-foreground hover:text-foreground`

- [x] Task 5: Create `components/preview/PresentationView.tsx` (AC: #4, #5, #6, #7, #8)
  - [x] 5.1 Create `components/preview/PresentationView.tsx` — fixed full-viewport overlay
  - [x] 5.2 Props: `{ content: string; onExit: () => void }`
  - [x] 5.3 Container: `role="document"` `aria-label="מצב מצגת"` `fixed inset-0 z-50 bg-background overflow-y-auto`
  - [x] 5.4 Fade-in: `mounted` state toggled in `useEffect` → `opacity: mounted ? 1 : 0` via inline style; skip transition if `prefers-reduced-motion` (check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` inside `useEffect`)
  - [x] 5.5 Escape key: `document.addEventListener('keydown', ...)` in `useEffect`, call `onExit` on `e.key === 'Escape'`
  - [x] 5.6 Mouse movement / idle controls: `onMouseMove` resets a 3s idle timer via `useRef<ReturnType<typeof setTimeout>>`. When idle, `controlsVisible` → false; on mouse move → true
  - [x] 5.7 Controls overlay: `fixed start-4 top-4 z-10` with `opacity` transition tied to `controlsVisible`. Contains Exit (X) button with `aria-label="יציאה ממצגת"`
  - [x] 5.8 Focus trap: `useRef` on container, focus container on mount (`tabIndex={-1}`), intercept Tab/Shift+Tab to cycle within focusable children
  - [x] 5.9 Use `<MarkdownRenderer content={content} />` inside a centred content div

- [x] Task 6: Update `components/layout/Header.tsx` (AC: #3, #4)
  - [x] 6.1 Add props: `{ viewMode: ViewMode; onViewModeChange: (m: ViewMode) => void; onEnterPresentation: () => void }`
  - [x] 6.2 Import `ViewModeToggle` and render it centred in the header flex row
  - [x] 6.3 Add presentation mode button (lucide `Expand` icon, size-4) on the end/right of the header with `aria-label="מצב מצגת"`
  - [x] 6.4 Header layout: `justify-between` — logo start, toggle centre (or flex row with gap), presentation button end

- [x] Task 7: Update `app/editor/page.tsx` (AC: all)
  - [x] 7.1 Add `useViewMode` import and destructure `[viewMode, setViewMode]`
  - [x] 7.2 Add `const [isPresentationMode, setIsPresentationMode] = useState(false)` (regular state — not persisted)
  - [x] 7.3 Pass `viewMode`, `onViewModeChange={setViewMode}`, `onEnterPresentation={() => setIsPresentationMode(true)}` to `<Header>`
  - [x] 7.4 Pass `viewMode` to `<PanelLayout>`
  - [x] 7.5 Conditionally render `<PresentationView content={debouncedContent} onExit={() => setIsPresentationMode(false)} />` when `isPresentationMode === true`

- [x] Task 8: Add CSS to `app/globals.css` (AC: #4)
  - [x] 8.1 Add `/* Presentation Mode Styles (Story 1.5) */` section
  - [x] 8.2 Add `.presentation-content` class: max-width `800px`, auto margins, slight padding — centres content for readability
  - [x] 8.3 Optionally: add `.presentation-content .preview-content` with `font-size: 1.1em` for 10% font bump (rem-based font sizes in preview-content won't cascade; this only affects relative sizes — acceptable for MVP)

- [x] Task 9: Test and verify (all ACs)
  - [x] 9.1 `pnpm build` — must pass with zero TS/lint errors
  - [x] 9.2 `pnpm test` — useViewMode tests pass
  - [x] 9.3 Manual: toggle editor/split/preview — panels animate in/out (200ms), header toggle shows active state
  - [x] 9.4 Manual: refresh page — view mode persists to last selected value
  - [x] 9.5 Manual: click presentation button — full-screen overlay fades in (300ms), toolbar and panels hidden
  - [x] 9.6 Manual: press Escape — exits presentation mode
  - [x] 9.7 Manual: move mouse in presentation mode — controls appear; stop moving — controls hide after 3s
  - [x] 9.8 Manual: Tab key in presentation — focus stays within PresentationView

## Dev Notes

### Architecture: Files to Create/Modify

**New files:**
```
types/
└── editor.ts                      -- NEW: ViewMode, ExportType types

lib/hooks/
├── useViewMode.ts                 -- NEW: localStorage-persisted view mode state
└── useViewMode.test.ts            -- NEW: hook tests

components/layout/
└── ViewModeToggle.tsx             -- NEW: 3-option segmented radiogroup toggle

components/preview/
└── PresentationView.tsx           -- NEW: fixed full-viewport presentation overlay
```

**Modified files:**
```
components/layout/
├── PanelLayout.tsx                -- ADD viewMode prop, CSS grid animation
└── Header.tsx                    -- ADD ViewModeToggle + presentation button

app/editor/page.tsx               -- WIRE useViewMode + PresentationView state
app/globals.css                   -- ADD .presentation-content styles
```

**All other files UNCHANGED.** Do NOT touch:
- `components/editor/*` — EditorPanel, EditorToolbar, etc. (Story 1.4 work)
- `components/preview/MarkdownRenderer.tsx`
- `lib/markdown/*` — render pipeline, mermaid
- `lib/hooks/useEditorContent.ts`, `useLocalStorage.ts`, `useDebounce.ts`
- `convex/` — NOT used in this story

### `types/editor.ts` (New file)

```ts
// types/editor.ts

export type ViewMode = 'editor' | 'split' | 'preview';

/** Placeholder for future export stories (Epic 3) */
export type ExportType = 'pdf' | 'html' | 'markdown';
```

### `lib/hooks/useViewMode.ts` (New file)

```ts
// lib/hooks/useViewMode.ts
'use client';
import { useLocalStorage } from './useLocalStorage';
import type { ViewMode } from '@/types/editor';

export const VIEW_MODE_KEY = 'marko-v2-view-mode';

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  return useLocalStorage<ViewMode>(VIEW_MODE_KEY, 'split');
}
```

Pattern: identical to `useEditorContent.ts` which wraps `useLocalStorage` with a typed key and default.

### `components/layout/PanelLayout.tsx` (Modified)

CSS `grid-template-columns` IS animatable in all modern browsers (Chrome 80+, Firefox 76+, Safari 15.4+). Use inline styles for animation, not Tailwind classes.

**Key constraint — collapsing grid columns to 0:**
- Grid items MUST have `overflow-hidden` AND `min-w-0` (`min-width: 0`) — without these, a grid column set to `0fr` won't fully collapse because the browser respects the content's min-content width.
- The transition on `grid-template-columns` animates between `1fr 1fr`, `1fr 0fr`, and `0fr 1fr`.

```tsx
'use client';
import type { ViewMode } from '@/types/editor';

interface PanelLayoutProps {
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  viewMode: ViewMode;
}

export function PanelLayout({ editorPanel, previewPanel, viewMode }: PanelLayoutProps) {
  const gridTemplateColumns =
    viewMode === 'split'   ? '1fr 1fr' :
    viewMode === 'editor'  ? '1fr 0fr' :
                             '0fr 1fr';

  // Respect prefers-reduced-motion — check happens client-side only
  // SSR: always render with transition (no window access). Hydration mismatch is minor and acceptable.
  const transition =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'none'
      : 'grid-template-columns 200ms ease-in-out';

  return (
    <div
      className="grid h-[calc(100vh-var(--header-height,3.5rem))] overflow-hidden"
      style={{ gridTemplateColumns, transition }}
      aria-label="פאנל עורך ותצוגה מקדימה"
    >
      <div
        className="flex flex-col overflow-hidden min-w-0"
        aria-hidden={viewMode === 'preview' || undefined}
      >
        {editorPanel}
      </div>
      <div
        className="flex flex-col overflow-hidden min-w-0"
        aria-hidden={viewMode === 'editor' || undefined}
      >
        {previewPanel}
      </div>
    </div>
  );
}
```

**Note on mobile:** On mobile (< lg), the CSS grid is single-column by default (Tailwind's `grid-cols-1` equivalent). With inline `gridTemplateColumns`, `split` mode will show two narrow columns on mobile. This is acceptable MVP behaviour; a full responsive stacked-split treatment is deferred (tablet stacking is addressed via the view mode toggle — user can manually select editor or preview on mobile). This matches the existing behaviour where the old PanelLayout also had `grid-cols-1 lg:grid-cols-2`.

**On the `prefers-reduced-motion` inline check:** Reading `window.matchMedia` at render time inside the function body (not in useEffect) works for client components since PanelLayout is always client-rendered after hydration. The tiny SSR/hydration mismatch (server sends transition, client may not) is not visible to users and is acceptable. If needed, a `useEffect` + state could be used instead.

### `components/layout/ViewModeToggle.tsx` (New file)

ARIA pattern: `role="radiogroup"` with `role="radio"` per item — correct for mutually exclusive options.

```tsx
'use client';
import type { ViewMode } from '@/types/editor';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { value: ViewMode; labelHe: string; ariaLabel: string }[] = [
  { value: 'editor',  labelHe: 'עורך',    ariaLabel: 'מצב עורך בלבד' },
  { value: 'split',   labelHe: 'שניהם',   ariaLabel: 'מצב פיצול' },
  { value: 'preview', labelHe: 'תצוגה',   ariaLabel: 'מצב תצוגה בלבד' },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="מצב תצוגה"
      className="flex items-center rounded-md border border-border bg-muted p-0.5 gap-0.5"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          role="radio"
          aria-checked={value === mode.value}
          aria-label={mode.ariaLabel}
          title={mode.ariaLabel}
          onClick={() => onChange(mode.value)}
          className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
            value === mode.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mode.labelHe}
        </button>
      ))}
    </div>
  );
}
```

**Why not use Radix UI ToggleGroup?** The `radix-ui` package is installed but no shadcn components have been generated yet (no `components/ui/` directory). Building the custom component is consistent with Story 1.3 and 1.4 patterns (custom FormatButton, ToolbarDropdown). If shadcn ToggleGroup is added later, this can be swapped in without breaking the API.

**Do NOT** use `cn()` from `@/lib/utils` if you prefer inline template literals — either is fine since `cn` simply merges Tailwind classes.

### `components/preview/PresentationView.tsx` (New file)

```tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/preview/MarkdownRenderer';

interface PresentationViewProps {
  content: string;
  onExit: () => void;
}

const IDLE_TIMEOUT_MS = 3000;

export function PresentationView({ content, onExit }: PresentationViewProps) {
  const [mounted, setMounted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);

  // Fade-in + reduced motion detection + focus management
  useEffect(() => {
    prefersReducedMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMounted(true);
    // Focus the container to enable keyboard interactions
    containerRef.current?.focus();
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) ?? []
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Idle timer
  const resetIdleTimer = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      IDLE_TIMEOUT_MS
    );
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  return (
    <div
      ref={containerRef}
      role="document"
      aria-label="מצב מצגת — לחץ Escape ליציאה"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto bg-background outline-none"
      onMouseMove={resetIdleTimer}
      style={{
        opacity: mounted ? 1 : 0,
        transition: prefersReducedMotion.current
          ? 'none'
          : 'opacity 300ms ease-out',
      }}
    >
      {/* Hover controls — top-start corner, logical RTL-safe positioning */}
      <div
        className="fixed start-4 top-4 z-10 transition-opacity duration-200"
        style={{
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? 'auto' : 'none',
        }}
        aria-hidden={!controlsVisible}
      >
        <button
          type="button"
          onClick={onExit}
          aria-label="יציאה ממצגת"
          title="יציאה ממצגת (Escape)"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border
                     bg-background/80 text-foreground backdrop-blur-sm
                     hover:bg-muted transition-colors shadow-sm"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Presentation content — centred, max-width for readability */}
      <div className="presentation-content mx-auto max-w-3xl px-6 py-16">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
```

**Why `tabIndex={-1}` on the container?** Allows `.focus()` to be called on a non-interactive element. The container gets focused on mount so keyboard listeners work immediately (including Escape) without requiring the user to click first.

**Why `outline-none` on the container?** The `tabIndex={-1}` container gets a browser focus outline that's visually jarring in presentation mode. `outline-none` removes it; the focus is programmatic only.

**`start-4` for RTL-safe position:** Uses Tailwind logical property so the exit button appears in the visual start corner regardless of RTL/LTR context.

### `components/layout/Header.tsx` (Modified)

Current state (after Story 1.3/1.4): placeholder header with just the logo.
Target state: logo + ViewModeToggle (centred) + presentation mode button (end).

```tsx
'use client';
import { Expand } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import type { ViewMode } from '@/types/editor';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEnterPresentation: () => void;
}

export function Header({ viewMode, onViewModeChange, onEnterPresentation }: HeaderProps) {
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

      {/* Presentation mode button — end */}
      <button
        type="button"
        onClick={onEnterPresentation}
        aria-label="מצב מצגת"
        title="מצב מצגת"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                   hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
      >
        <Expand className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}
```

**`Expand` icon:** From `lucide-react` v0.577.0. If `Expand` is not available, try `Maximize2` or `Fullscreen` — all are in lucide-react. Check with: `import { Expand } from 'lucide-react'`. If build fails with unknown export, use `Maximize2` instead.

### `app/editor/page.tsx` (Modified)

```tsx
'use client';
import { useState } from 'react';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { Header } from '@/components/layout/Header';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content);
  const [viewMode, setViewMode] = useViewMode();
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return (
    <main className="flex h-screen flex-col">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEnterPresentation={() => setIsPresentationMode(true)}
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} />}
        previewPanel={<PreviewPanel content={debouncedContent} />}
      />
      {isPresentationMode && (
        <PresentationView
          content={debouncedContent}
          onExit={() => setIsPresentationMode(false)}
        />
      )}
    </main>
  );
}
```

**Why `debouncedContent` in PresentationView?** Consistent with PreviewPanel — uses the debounced content so typing in the background doesn't cause rapid re-renders in the presentation overlay.

**Why `useState` for `isPresentationMode` (not localStorage)?** Presentation mode should not persist across page refreshes. Returning to the page should start in normal editor view, not full-screen presentation mode.

### `app/globals.css` addition (Section 8)

Add after the Mermaid Diagram Styles section:

```css
/* ============================================
   Presentation Mode Styles (Story 1.5)
   ============================================ */

.presentation-content {
  /* Max-width for readability on wide screens */
}

/* Font sizes in preview-content use rem units and won't cascade from font-size: 1.1em.
   A future story can introduce a --presentation-scale CSS variable to scale them uniformly.
   For now, the distraction-free full-screen view provides the "large format" experience. */
```

**Note:** The `.preview-content` class already applies full styling via CSS custom properties. In a dedicated full-screen view, the existing styling (no toolbar, no editor panel) provides the "large, distraction-free format" experience required by the AC. Explicit font scaling is a UX enhancement for a future iteration.

### Project Structure After Story 1.5

```
types/
└── editor.ts                      -- NEW: ViewMode, ExportType

lib/hooks/
├── useLocalStorage.ts             -- UNCHANGED
├── useEditorContent.ts            -- UNCHANGED
├── useDebounce.ts                 -- UNCHANGED
├── useViewMode.ts                 -- NEW
└── useViewMode.test.ts            -- NEW

components/layout/
├── Header.tsx                     -- MODIFIED: viewMode toggle + presentation button
├── PanelLayout.tsx                -- MODIFIED: viewMode prop + animated grid
└── ViewModeToggle.tsx             -- NEW: 3-option radiogroup

components/preview/
├── PreviewPanel.tsx               -- UNCHANGED
├── MarkdownRenderer.tsx           -- UNCHANGED
├── MarkdownRenderer.test.tsx      -- UNCHANGED
└── PresentationView.tsx           -- NEW: full-screen overlay

app/
├── editor/page.tsx                -- MODIFIED: wire useViewMode + PresentationView
└── globals.css                    -- MODIFIED: add .presentation-content section
```

### Constraints from Architecture (MUST follow)

- **Package manager**: `pnpm` exclusively — never `npm install` or `yarn add`
- **Tailwind v4 logical properties**: NEVER `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`
- **Colors**: NEVER hardcode color values. Use Tailwind semantic tokens (`text-muted-foreground`, `bg-muted`, `bg-background`, `border-border`, etc.)
- **TypeScript strict mode ON**: No `any`. All props/return types explicit where non-obvious
- **`'use client'`**: At the very top of every new component or hook file
- **SSR-safe**: `window.matchMedia` and `localStorage` access ONLY inside `useEffect` or event handlers — never at module top level. Exception: `typeof window !== 'undefined'` guards at render time are acceptable for non-critical behaviour (as shown in PanelLayout's reduced-motion check)
- **WCAG AA**: All interactive elements have Hebrew ARIA labels. Toggle group uses `radiogroup`/`radio` pattern for accessibility

### Previous Story Intelligence (from Stories 1.3 and 1.4)

1. **`lib/editor/` directory was created in Story 1.4**: `lib/hooks/` already exists. `types/` directory does NOT exist yet — create it
2. **ESLint `jsx-a11y` is strict**: `role="radio"` requires `aria-checked` — included. `role="document"` is non-interactive so no additional ARIA needed
3. **lucide-react v0.577.0**: Icon names to verify: `Expand`, `Maximize2`, `X` — all should be present. If `Expand` fails, use `Maximize2`
4. **`pnpm build` and `pnpm lint` MUST pass** — hard requirement before marking complete
5. **`insertTextAtCursor` in EditorPanel.tsx does NOT change** — view mode changes do not affect editor content management
6. **`useLocalStorage` handles SSR**: Already SSR-safe with `typeof window === 'undefined'` guard. `useViewMode` inherits this safety
7. **MermaidInsertButton.tsx pattern**: The `useRef` + `useEffect` + `useCallback` pattern for outside-click and keyboard management is the established pattern — follow it in PresentationView's idle timer
8. **`suppressHydrationWarning` on MarkdownRenderer**: Already present — no changes needed when reusing in PresentationView
9. **`EditorToolbar.tsx` was created in Story 1.4 as `'use client'`** — all new component files follow the same convention

### What NOT to Implement in This Story

- **Dark/light mode toggle** — Story 2.5 (Epic 2)
- **Theme toggle in presentation mode** — Epic 2 (future story); only Exit button in controls
- **Export button in presentation mode** — Epic 3 (future story)
- **Direction override (RTL/LTR toggle)** — Story 1.6
- **Clear button / Load sample document** — Story 1.6
- **Per-sentence BiDi detection** — Epic 4
- **Authentication / Clerk** — Epic 5
- **Color panel** — Epic 2
- **v1 localStorage migration** — Story 1.7
- **Font size scaling in presentation mode** — UX enhancement, deferred (the full-viewport distraction-free view satisfies AC #4 without explicit font scaling)
- **Mobile toolbar overflow menu** — Out of scope for Phase 1

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture — UI state (view mode) → React state + localStorage]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#PresentationView]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Animation-Transitions — View mode switch 200ms, Presentation enter 300ms]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy — ToggleGroup for view mode selector]
- [Source: _bmad-output/implementation-artifacts/1-4-formatting-toolbar.md — constraints, patterns]
- [Source: components/layout/PanelLayout.tsx — current grid layout base]
- [Source: components/layout/Header.tsx — placeholder comment "Story 1.5 will add toolbar buttons here"]
- [Source: app/editor/page.tsx — existing wiring patterns for hooks and components]
- [Source: lib/hooks/useLocalStorage.ts — SSR-safe localStorage hook used by useViewMode]
- [Source: lib/hooks/useEditorContent.ts — useViewMode follows identical pattern]
- [Source: app/globals.css — --header-height: 3.5rem; established CSS custom properties]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

- All 9 tasks completed in a single session; `pnpm build` and `pnpm test` (80 tests) both pass with zero errors.
- `types/editor.ts` created as new `types/` directory (directory did not exist before Story 1.5).
- `useViewMode` hook follows the exact same pattern as `useEditorContent` — thin wrapper over `useLocalStorage`.
- `PanelLayout` rewritten with `'use client'` directive; CSS `grid-template-columns` animated via inline style (not Tailwind) to allow smooth 200ms transitions. `overflow-hidden min-w-0` on panel wrappers ensures `0fr` columns fully collapse.
- `PresentationView` implements: fade-in (300ms, skipped for `prefers-reduced-motion`), 3s idle timer for controls, Escape-key exit, focus trap, and `role="document"` accessibility pattern.
- `Header` updated from placeholder to functional component with `ViewModeToggle` centred and `Expand` icon (lucide-react) for presentation mode.
- `PanelLayout` and `Header` both converted from plain components to `'use client'` (needed for `window.matchMedia` and event handlers).
- All Tailwind logical properties used (`start-`, `end-`) — no directional class violations.
- All interactive elements have Hebrew ARIA labels (WCAG AA).

### File List

**New files:**
- `types/editor.ts`
- `lib/hooks/useViewMode.ts`
- `lib/hooks/useViewMode.test.ts`
- `components/layout/ViewModeToggle.tsx`
- `components/preview/PresentationView.tsx`

**Modified files:**
- `components/layout/PanelLayout.tsx`
- `components/layout/Header.tsx`
- `app/editor/page.tsx`
- `app/globals.css`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-5-view-modes-and-presentation-mode.md`

### Change Log

- 2026-03-07: Implemented Story 1.5 — View Modes & Presentation Mode. Added ViewMode type, useViewMode hook with localStorage persistence, animated PanelLayout grid, ViewModeToggle segmented control, PresentationView full-screen overlay with fade-in/idle controls/focus trap/Escape exit, updated Header with toggle and presentation button, wired all state in EditorPage. All 80 tests pass, build succeeds with zero errors.
- 2026-03-07: Code review fixes — (H1) ViewModeToggle: added roving tabIndex + ArrowLeft/Right/Up/Down keyboard navigation for WCAG AA radiogroup compliance; (H2) PresentationView: exit button gets tabIndex={-1} when controls are hidden to prevent invisible focus targets; (M1) useViewMode.test.ts: imports useViewMode function to verify export; (M2) PanelLayout: added inert prop to collapsed panels to prevent keyboard focus reaching hidden content; (M3) .presentation-content CSS class: populated with max-width/margin/padding rules (Tailwind inline classes removed from component). 81 tests pass, build clean.
