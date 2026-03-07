# Story 3.1: Export Modal & Filename Selection

Status: done

## Story

As a user,
I want to specify a custom filename before exporting and choose my export format,
so that I can organize my exported files with meaningful names.

## Acceptance Criteria

1. **AC1: Export Dropdown in Header** — Given the user is on the editor page, when they look at the header, then an "ייצא" (Export) dropdown button is visible in the utility button group; clicking it reveals three format options: "PDF", "HTML", "Markdown".

2. **AC2: Export Modal Opens** — Given the user selects an export format from the dropdown, when the selection is made, then a shadcn `Dialog` modal opens with a title matching the format: "ייצא PDF" | "ייצא HTML" | "ייצא Markdown".

3. **AC3: Filename Auto-Suggested** — Given the modal opens, when it first appears, then the filename input is pre-populated with the document's first H1 or H2 heading text, slugified (spaces → hyphens, invalid chars stripped, max 50 chars), defaulting to `"markdown-document"` when no such heading exists.

4. **AC4: Filename Editable** — Given the modal is open, when the user types in the filename input, then the value updates while the extension label (`.pdf` / `.html` / `.md`) remains fixed alongside the input.

5. **AC5: Export Confirmation** — Given the modal is open with a non-empty, non-whitespace filename, when the user clicks "ייצא" or presses Enter, then `onExport(trimmedFilename, type)` is called with the trimmed filename and the selected `ExportType`.

6. **AC6: Export Button Disabled** — Given the filename input is empty or whitespace-only, when the modal is showing, then the "ייצא" button has `disabled` attribute and does not fire `onExport`.

7. **AC7: Cancel Closes Modal** — Given the modal is open, when the user clicks "ביטול", presses Escape, or clicks the backdrop, then the modal closes and `onExport` is NOT called.

8. **AC8: Auto-Focus on Open** — Given the modal opens, when it becomes visible, then the filename input receives focus and the text is selected (ready to type a new name or accept the suggestion).

9. **AC9: Hebrew Labels & Accessibility** — Given the modal renders, then: dialog title is Hebrew, description is Hebrew, all button `aria-label` attributes are Hebrew, the Dialog has proper focus trapping (Radix UI Dialog handles this natively).

## Tasks / Subtasks

- [x] Task 1: Create `lib/export/filename-utils.ts` (AC: #3)
  - [x] 1.1: Implement and export `function getFirstHeading(content: string): string`
  - [x] 1.2: Regex: `content.match(/^#{1,2}\s+(.+)$/m)` — H1/H2 only; `m` (multiline) flag is REQUIRED so `^` matches each line start, not just the string start
  - [x] 1.3: Slugify captured group: `.trim().replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-').substring(0, 50)`
  - [x] 1.4: Return `'markdown-document'` when no match OR when slugified result is empty string (heading was all invalid chars)

- [x] Task 2: Create `lib/export/filename-utils.test.ts` (AC: #3)
  - [x] 2.1: H1 heading with spaces → hyphenated slug (`'# My Document'` → `'My-Document'`)
  - [x] 2.2: H2 heading → slug (pattern `^#{1,2}` matches H2)
  - [x] 2.3: H3+ heading → `'markdown-document'` (not matched by `#{1,2}`)
  - [x] 2.4: Heading with invalid chars (`<>:"/\|?*`) → chars stripped
  - [x] 2.5: Heading longer than 50 chars → truncated at 50 characters
  - [x] 2.6: Empty string content → `'markdown-document'`
  - [x] 2.7: Content with no heading lines → `'markdown-document'`
  - [x] 2.8: Heading with leading/trailing spaces in text → trimmed before slugification

- [x] Task 3: Create `components/export/ExportModal.tsx` (AC: #2–#9)
  - [x] 3.1: Create file in new `components/export/` directory (per architecture)
  - [x] 3.2: Imports: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`
  - [x] 3.3: Imports: `getFirstHeading` from `@/lib/export/filename-utils`; `ExportType` from `@/types/editor`; `useState`, `useRef`, `useEffect` from `'react'`
  - [x] 3.4: Define module-level constants: `EXT_MAP: Record<ExportType, string>` = `{ pdf: '.pdf', html: '.html', markdown: '.md' }` and `TITLE_MAP: Record<ExportType, string>` = `{ pdf: 'ייצא PDF', html: 'ייצא HTML', markdown: 'ייצא Markdown' }`
  - [x] 3.5: Props interface: `isOpen: boolean`, `onOpenChange: (open: boolean) => void`, `exportType: ExportType`, `content: string`, `onExport: (filename: string, type: ExportType) => void`
  - [x] 3.6: State: `const [filename, setFilename] = useState('')`; Ref: `const inputRef = useRef<HTMLInputElement>(null)`
  - [x] 3.7: `useEffect([isOpen, content])` — when `isOpen` is true → `setFilename(getFirstHeading(content))`
  - [x] 3.8: `useEffect([isOpen])` — when `isOpen` is true → `setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0)` to wait for Dialog open animation before focusing; return cleanup `() => clearTimeout(timer)`
  - [x] 3.9: `handleExport()` — guard `if (!filename.trim()) return`; call `onExport(filename.trim(), exportType)`; call `onOpenChange(false)`
  - [x] 3.10: `handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>)` — if `e.key === 'Enter'` → `handleExport()` (Escape handled natively by Radix Dialog)
  - [x] 3.11: Filename input: `ref={inputRef}`, `dir="auto"`, `type="text"`, NO `autoFocus` (use ref/effect — see anti-patterns), `aria-label="שם הקובץ לייצוא"`, `placeholder="שם הקובץ"`
  - [x] 3.12: Extension label: `<span aria-label={\`סיומת הקובץ: ${ext}\`}>{ext}</span>` — read-only, `flex-shrink-0`
  - [x] 3.13: Cancel button: `onClick={() => onOpenChange(false)}`, `aria-label="ביטול ייצוא"`, label text "ביטול"
  - [x] 3.14: Export button: `disabled={!filename.trim()}`, `onClick={handleExport}`, `aria-label="אשר ייצוא"`, label text "ייצא", classes include `disabled:opacity-50 disabled:cursor-not-allowed`

- [x] Task 4: Create `components/export/ExportModal.test.tsx` (AC: all)
  - [x] 4.1: filename pre-filled from H1 heading in content (e.g., `'# My Document'` → input value `'My-Document'`)
  - [x] 4.2: shows ".pdf" extension label for pdf type
  - [x] 4.3: shows ".html" extension label for html type
  - [x] 4.4: shows ".md" extension label for markdown type
  - [x] 4.5: filename input is editable (fireEvent.change updates value)
  - [x] 4.6: export button calls `onExport('My-Document', 'pdf')` when clicked with valid filename
  - [x] 4.7: export button is disabled when filename input is cleared to empty string
  - [x] 4.8: export button is disabled when filename is whitespace-only (`'   '`)
  - [x] 4.9: cancel button calls `onOpenChange(false)` and does NOT call `onExport`
  - [x] 4.10: pressing Enter in input calls `onExport` with current filename
  - [x] 4.11: dialog title "ייצא PDF" renders for pdf type
  - [x] 4.12: `onOpenChange(false)` is called after a successful export confirm (modal self-closes)

- [x] Task 5: Update `components/layout/Header.tsx` (AC: #1)
  - [x] 5.1: Add `ToolbarDropdown` to existing import: `import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown'`
  - [x] 5.2: Add `ExportType` to the existing `from '@/types/editor'` import — it already imports `ViewMode` and `DocDirection` from there; add `ExportType` to the SAME import statement (do NOT create a second import from the same module)
  - [x] 5.3: Add `onExportRequest: (type: ExportType) => void` to `HeaderProps` interface
  - [x] 5.4: Destructure `onExportRequest` in the function signature
  - [x] 5.5: Add `exportItems` array before the JSX return: `[{ label: 'PDF', value: 'pdf' }, { label: 'HTML', value: 'html' }, { label: 'Markdown', labelEn: '.md', value: 'markdown' }]`
  - [x] 5.6: Add `<ToolbarDropdown>` in the utility buttons `<div>` (before the Palette button), with: `triggerLabel="ייצא"`, `triggerAriaLabel="ייצא מסמך"`, `items={exportItems}`, `onSelect={(val) => onExportRequest(val as ExportType)}`

- [x] Task 6: Update `app/editor/page.tsx` (AC: all)
  - [x] 6.1: Add `import { ExportModal } from '@/components/export/ExportModal'`
  - [x] 6.2: Add `ExportType` to imports from `@/types/editor` if not already present (check — currently not imported in page.tsx)
  - [x] 6.3: Add state: `const [isExportModalOpen, setIsExportModalOpen] = useState(false)`
  - [x] 6.4: Add state: `const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null)`
  - [x] 6.5: Add `function handleExportRequest(type: ExportType) { setPendingExportType(type); setIsExportModalOpen(true); }`
  - [x] 6.6: Add stub: `function handleExportConfirm(_filename: string, _type: ExportType) { /* Implemented in Stories 3.2 (PDF) and 3.3 (HTML, Markdown) */ }` — leading underscore on params suppresses lint warnings for intentionally unused params
  - [x] 6.7: Pass `onExportRequest={handleExportRequest}` to `<Header>`
  - [x] 6.8: After `<ColorPanel>`, add: `{pendingExportType && <ExportModal isOpen={isExportModalOpen} onOpenChange={setIsExportModalOpen} exportType={pendingExportType} content={content} onExport={handleExportConfirm} />}`

- [x] Task 7: Update sprint status
  - [x] 7.1: `_bmad-output/implementation-artifacts/sprint-status.yaml` — update `epic-3` from `backlog` to `in-progress`
  - [x] 7.2: Update `3-1-export-modal-and-filename-selection` from `backlog` to `done` (set by dev after implementation + code review)

## Dev Notes

### Critical: `ExportType` Values

`types/editor.ts` defines `ExportType = 'pdf' | 'html' | 'markdown'`. The Markdown type literal is `'markdown'` — NOT `'md'`. The file extension is `.md` but the type value is `'markdown'`. Using `'md'` anywhere as an ExportType will cause a TypeScript error.

### Critical: No `autoFocus` — Use `useRef` + `useEffect`

Story 2.3 code review established project-wide rule: **never use the `autoFocus` prop on inputs**. Always use `useRef` + `useEffect` with `setTimeout(..., 0)`. This avoids React hydration issues and respects Dialog open animation timing.

```typescript
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (!isOpen) return;
  const timer = setTimeout(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, 0);
  return () => clearTimeout(timer);
}, [isOpen]);
```

### Critical: `getFirstHeading` Regex Requires `m` Flag

Without the `m` (multiline) flag, `^` only matches the start of the entire string. With `m`, `^` matches the start of each line. The flag is **required** for documents where the heading is not the first character.

```typescript
// lib/export/filename-utils.ts
export function getFirstHeading(content: string): string {
  const match = content.match(/^#{1,2}\s+(.+)$/m); // 'm' flag required
  if (match) {
    const slug = match[1]
      .trim()
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return slug || 'markdown-document';
  }
  return 'markdown-document';
}
```

Matches only H1 and H2 (by design — matches reference implementation in `docs/reference-data/index.html:2963`). H3-H6 intentionally fall back to `'markdown-document'`.

### Critical: Export Stub in page.tsx

`handleExportConfirm` is intentionally a no-op in this story. Stories 3.2 and 3.3 replace it. Leading underscores suppress TypeScript lint warnings for intentionally unused parameters:

```typescript
function handleExportConfirm(_filename: string, _type: ExportType) {
  // Implemented in Stories 3.2 (PDF) and 3.3 (HTML, Markdown)
}
```

### ExportModal Full Implementation

```typescript
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getFirstHeading } from '@/lib/export/filename-utils';
import type { ExportType } from '@/types/editor';

const EXT_MAP: Record<ExportType, string> = {
  pdf: '.pdf',
  html: '.html',
  markdown: '.md',
};

const TITLE_MAP: Record<ExportType, string> = {
  pdf: 'ייצא PDF',
  html: 'ייצא HTML',
  markdown: 'ייצא Markdown',
};

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  content: string;
  onExport: (filename: string, type: ExportType) => void;
}

export function ExportModal({
  isOpen,
  onOpenChange,
  exportType,
  content,
  onExport,
}: ExportModalProps) {
  const [filename, setFilename] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset filename to first heading when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilename(getFirstHeading(content));
    }
  }, [isOpen, content]);

  // Focus and select-all input when modal opens (no autoFocus — Story 2.3 review)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  function handleExport() {
    const trimmed = filename.trim();
    if (!trimmed) return;
    onExport(trimmed, exportType);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleExport();
    // Escape handled natively by Radix UI Dialog
  }

  const ext = EXT_MAP[exportType];
  const title = TITLE_MAP[exportType];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>הכנס שם קובץ לייצוא המסמך</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            dir="auto"
            placeholder="שם הקובץ"
            aria-label="שם הקובץ לייצוא"
            className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span
            className="flex-shrink-0 text-sm text-muted-foreground"
            aria-label={`סיומת הקובץ: ${ext}`}
          >
            {ext}
          </span>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            aria-label="ביטול ייצוא"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!filename.trim()}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="אשר ייצוא"
          >
            ייצא
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Header Export Dropdown — Exact Changes

In `components/layout/Header.tsx`, make these targeted changes:

**Add import (new line):**
```typescript
import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown';
```

**Update existing type import (do NOT add a second import from `@/types/editor`):**
```typescript
// Before:
import type { ViewMode, DocDirection } from '@/types/editor';
// After:
import type { ViewMode, DocDirection, ExportType } from '@/types/editor';
```

**Add to HeaderProps interface:**
```typescript
onExportRequest: (type: ExportType) => void;
```

**Add to function signature destructure:**
```typescript
onExportRequest,
```

**Add before JSX return (inside function body):**
```typescript
const exportItems = [
  { label: 'PDF', value: 'pdf' },
  { label: 'HTML', value: 'html' },
  { label: 'Markdown', labelEn: '.md', value: 'markdown' },
];
```

**Add to utility buttons `<div>` — insert before the Palette button:**
```tsx
<ToolbarDropdown
  triggerLabel="ייצא"
  triggerAriaLabel="ייצא מסמך"
  items={exportItems}
  onSelect={(val) => onExportRequest(val as ExportType)}
/>
```

### page.tsx — Exact Additions

**New imports to add:**
```typescript
import { ExportModal } from '@/components/export/ExportModal';
import type { ExportType } from '@/types/editor';
```

**New state (after existing useState calls):**
```typescript
const [isExportModalOpen, setIsExportModalOpen] = useState(false);
const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null);
```

**New functions (after handleLoadSample):**
```typescript
function handleExportRequest(type: ExportType) {
  setPendingExportType(type);
  setIsExportModalOpen(true);
}

function handleExportConfirm(_filename: string, _type: ExportType) {
  // Implemented in Stories 3.2 (PDF) and 3.3 (HTML, Markdown)
}
```

**Update Header JSX (add one prop):**
```tsx
onExportRequest={handleExportRequest}
```

**Add after `<ColorPanel>` (before closing `</main>`):**
```tsx
{pendingExportType && (
  <ExportModal
    isOpen={isExportModalOpen}
    onOpenChange={setIsExportModalOpen}
    exportType={pendingExportType}
    content={content}
    onExport={handleExportConfirm}
  />
)}
```

### Testing Requirements

Use Vitest + jsdom (same configuration as all prior stories). Tests co-located with source files. Run with `pnpm test`.

**`components/export/ExportModal.test.tsx` — key patterns:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './ExportModal';

const defaultProps = {
  isOpen: true,
  onOpenChange: vi.fn(),
  exportType: 'pdf' as const,
  content: '# My Document\n\nSome content',
  onExport: vi.fn(),
};

it('pre-fills filename from first H1 heading', () => {
  render(<ExportModal {...defaultProps} />);
  expect(screen.getByRole('textbox', { name: 'שם הקובץ לייצוא' })).toHaveValue('My-Document');
});

it('shows .pdf extension for pdf type', () => {
  render(<ExportModal {...defaultProps} />);
  expect(screen.getByLabelText('סיומת הקובץ: .pdf')).toBeInTheDocument();
});

it('disables export button when filename is empty', () => {
  render(<ExportModal {...defaultProps} content="" />);
  // content="" → getFirstHeading returns 'markdown-document'; clear it manually
  fireEvent.change(screen.getByRole('textbox', { name: 'שם הקובץ לייצוא' }), { target: { value: '' } });
  expect(screen.getByRole('button', { name: 'אשר ייצוא' })).toBeDisabled();
});

it('calls onExport with trimmed filename and type', () => {
  const onExport = vi.fn();
  render(<ExportModal {...defaultProps} onExport={onExport} />);
  fireEvent.click(screen.getByRole('button', { name: 'אשר ייצוא' }));
  expect(onExport).toHaveBeenCalledWith('My-Document', 'pdf');
});

it('cancel button calls onOpenChange(false) without onExport', () => {
  const onExport = vi.fn();
  const onOpenChange = vi.fn();
  render(<ExportModal {...defaultProps} onExport={onExport} onOpenChange={onOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'ביטול ייצוא' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(onExport).not.toHaveBeenCalled();
});

it('Enter key triggers export', () => {
  const onExport = vi.fn();
  render(<ExportModal {...defaultProps} onExport={onExport} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'שם הקובץ לייצוא' }), { key: 'Enter' });
  expect(onExport).toHaveBeenCalledWith('My-Document', 'pdf');
});

it('onOpenChange(false) called after successful export', () => {
  const onOpenChange = vi.fn();
  render(<ExportModal {...defaultProps} onOpenChange={onOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'אשר ייצוא' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
```

**`lib/export/filename-utils.test.ts` — key patterns:**

```typescript
import { getFirstHeading } from './filename-utils';

it('returns slug from H1 heading', () => {
  expect(getFirstHeading('# My Document\n\nContent')).toBe('My-Document');
});

it('returns slug from H2 heading', () => {
  expect(getFirstHeading('## Section Title')).toBe('Section-Title');
});

it('returns markdown-document for H3 heading', () => {
  expect(getFirstHeading('### Sub Section')).toBe('markdown-document');
});

it('returns markdown-document for empty content', () => {
  expect(getFirstHeading('')).toBe('markdown-document');
});

it('strips invalid filename characters', () => {
  expect(getFirstHeading('# Hello:World<Test>')).toBe('HelloWorldTest');
});

it('truncates to 50 characters', () => {
  const longHeading = '# ' + 'A'.repeat(60);
  expect(getFirstHeading(longHeading)).toHaveLength(50);
});

it('trims leading/trailing spaces in heading text', () => {
  expect(getFirstHeading('#   Padded Title   ')).toBe('Padded-Title');
});
```

### Architecture Compliance

| Rule | Application in this story |
|---|---|
| `components/export/` for export UI components | `ExportModal.tsx` placed in `components/export/` (new directory) |
| `lib/export/` for export logic | `filename-utils.ts` placed in `lib/export/` (new directory) |
| No direct localStorage in components | This story uses no localStorage |
| Hebrew ARIA labels on all interactive elements | All buttons have Hebrew `aria-label` |
| No `autoFocus` — use `useRef` + `useEffect` | Applied per Story 2.3 code review |
| `DialogDescription` required in Dialog | `<DialogDescription>הכנס שם קובץ לייצוא המסמך</DialogDescription>` included |
| Tests co-located with components | `ExportModal.test.tsx` next to `ExportModal.tsx` |
| No new npm dependencies | All used packages already installed |
| `ExportType` from `types/editor.ts` | Already defined — do NOT redefine |

### Anti-Patterns to Avoid

- **Do NOT** use `autoFocus` attribute on the filename input — use `useRef` + `useEffect` (Story 2.3 code review finding, project-wide rule)
- **Do NOT** use `'md'` as an `ExportType` value — the type literal is `'markdown'`; extension `.md` is only the display string
- **Do NOT** create a shadcn `Button` component — plain `<button>` with Tailwind classes matches the project pattern (ColorPanel, Header) and avoids the missing `components/ui/button.tsx` issue
- **Do NOT** add a duplicate `import type { ... } from '@/types/editor'` in Header — add `ExportType` to the existing import statement
- **Do NOT** move `ToolbarDropdown` from `components/editor/` — import it from its current location; no refactoring in this story
- **Do NOT** implement actual PDF/HTML/MD generation in this story — `handleExportConfirm` is a no-op stub; real logic comes in Stories 3.2 and 3.3
- **Do NOT** add progress toasts or indicators in this story — those come with the actual export implementations in 3.2-3.3
- **Do NOT** add `html2pdf.js` or any export library — deferred to Story 3.2
- **Do NOT** nest a Dialog inside a Sheet — ExportModal opens from the Header, not from within any Sheet component

### Cross-Story Context

**Stories 3.2 and 3.3 will:**
- Replace the stub `handleExportConfirm` in `page.tsx` with real export logic
- Add `lib/export/pdf-generator.ts`, `lib/export/html-generator.ts`, `lib/export/word-copy.ts`
- Add `components/export/PdfProgress.tsx` (progress indicator for PDF generation)
- The `ExportModal` component created here is NOT modified by 3.2/3.3 — they work through the `onExport` callback

**Story 3.4 (Clipboard Copy):**
- Adds a separate "Copy" dropdown in the Header (NOT ExportModal-based)
- ExportModal is not involved in clipboard operations

### Git Intelligence

Commit pattern: `"Implement Story 3.1: export modal and filename selection"` (matches project history: `"Implement Story X.Y: [description]"`).

New directories needed: `components/export/` and `lib/export/` — created automatically when their first files are created.

No new npm packages required for this story.

### Project Structure Notes

**Files to CREATE (new in Story 3.1):**
- `lib/export/filename-utils.ts` — `getFirstHeading` utility (also creates the `lib/export/` directory)
- `lib/export/filename-utils.test.ts` — unit tests for filename utility
- `components/export/ExportModal.tsx` — export filename dialog (also creates `components/export/` directory)
- `components/export/ExportModal.test.tsx` — component tests for ExportModal

**Files to MODIFY (existing):**
- `components/layout/Header.tsx` — add export dropdown + `onExportRequest` prop
- `app/editor/page.tsx` — add export state management + ExportModal rendering + stub confirm handler

**Files NOT to touch:**
- `types/editor.ts` — `ExportType` already defined (no changes needed)
- `components/editor/ToolbarDropdown.tsx` — imported as-is, no modifications
- `components/ui/dialog.tsx` — imported as-is, no modifications
- All other files — this story's scope is strictly the export entry point and modal UI

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 acceptance criteria (line 565–584)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ExportDialog component spec §8 (line 1058–1065)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Flow 2: Export PDF user journey (line 456–492)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PDF export dialog design (line 736–739)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Modal/overlay patterns (line 1153–1168)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — components/export/ExportModal.tsx, lib/export/ directory (line 642–644, 676–681)](_bmad-output/planning-artifacts/architecture.md)
- [Source: docs/reference-data/index.html:2963–2983 — getFirstHeading() and openExportModal() reference implementation](docs/reference-data/index.html)
- [Source: docs/component-inventory.md:115 — getFirstHeading() documented as export auto-naming utility](docs/component-inventory.md)
- [Source: types/editor.ts:6 — ExportType = 'pdf' | 'html' | 'markdown'](types/editor.ts)
- [Source: components/ui/dialog.tsx — Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter](components/ui/dialog.tsx)
- [Source: components/editor/ToolbarDropdown.tsx — ToolbarDropdown and DropdownItem (reused in Header)](components/editor/ToolbarDropdown.tsx)
- [Source: _bmad-output/implementation-artifacts/2-3-custom-preset-save-and-load.md — autoFocus → useRef/useEffect project rule (code review fix, line 736)](_bmad-output/implementation-artifacts/2-3-custom-preset-save-and-load.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

- Implemented `getFirstHeading` in `lib/export/filename-utils.ts` with multiline regex `^#{1,2}\s+(.+)$` (m flag required). Slugification strips invalid chars, replaces spaces with hyphens, truncates to 50 chars.
- Created `ExportModal` component using Radix UI Dialog with controlled filename state. Uses `useRef` + `useEffect` + `setTimeout(..., 0)` for focus (per Story 2.3 project rule — no `autoFocus`).
- `handleExportConfirm` in page.tsx is intentionally a no-op stub; implementation deferred to Stories 3.2/3.3.
- Tests rewritten using project pattern (`react-dom/client` + `createRoot` + `act`) — `@testing-library/react` is NOT installed in this project.
- All 178 tests pass (20 new: 8 filename-utils + 12 ExportModal, 158 existing regressions).

### File List

- lib/export/filename-utils.ts (new)
- lib/export/filename-utils.test.ts (new)
- components/export/ExportModal.tsx (new)
- components/export/ExportModal.test.tsx (new)
- components/layout/Header.tsx (modified)
- app/editor/page.tsx (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- _bmad-output/implementation-artifacts/3-1-export-modal-and-filename-selection.md (modified)
