# Story 1.4: Formatting Toolbar

Status: done

## Story

As a user,
I want a toolbar with formatting buttons for common Markdown syntax,
So that I can quickly insert formatting without memorizing Markdown syntax.

## Acceptance Criteria

1. **Given** the user is in the editor **When** they click a toolbar button (bold, italic, strikethrough, headings H1-H6, unordered/ordered/task lists, link, image, table, HR, code inline/block, Mermaid) **Then** the corresponding Markdown syntax is inserted at the cursor position or wraps the selected text
2. **And** all toolbar buttons have Hebrew ARIA labels and tooltips
3. **And** toolbar buttons are navigable via keyboard with `role="toolbar"` and arrow key navigation between buttons
4. **And** dropdowns (headings, code, Mermaid) open via Enter/Space, close with Escape, and items navigate with ArrowDown/ArrowUp
5. **And** the toolbar uses Tailwind logical properties for RTL layout (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
6. **And** button press provides subtle scale-down feedback via `active:scale-[0.97]` Tailwind class
7. **And** the toolbar is organized in logical groups separated by visual dividers and remains simple and uncluttered

## Tasks / Subtasks

- [x] Task 1: Create format utility (AC: #1)
  - [x] 1.1 Create `lib/editor/format-utils.ts` — export `getFormatText(type: FormatType, selectedText: string): string`
  - [x] 1.2 Implement all format types: bold, italic, strikethrough, h1-h6, ul, ol, task, link, image, table, hr, code-inline, code-block
  - [x] 1.3 Wrap selection if `selectedText` is non-empty; else insert Hebrew placeholder
  - [x] 1.4 Create `lib/editor/format-utils.test.ts` — unit tests for each format type with and without selection

- [x] Task 2: Create FormatButton component (AC: #2, #6)
  - [x] 2.1 Create `components/editor/FormatButton.tsx` — reusable toolbar button
  - [x] 2.2 Props: `{ onClick, ariaLabel, title, disabled?, children }`
  - [x] 2.3 Classes: `active:scale-[0.97]`, `hover:bg-muted hover:text-foreground`, `transition-colors`, size `h-7 w-7`

- [x] Task 3: Create ToolbarDropdown component (AC: #4)
  - [x] 3.1 Create `components/editor/ToolbarDropdown.tsx` — generic accessible dropdown for headings, code, Mermaid
  - [x] 3.2 Props: `{ triggerAriaLabel, triggerLabel, items: DropdownItem[], onSelect }`
  - [x] 3.3 Keyboard: Enter/Space opens, Escape closes + restores focus to trigger, ArrowDown/ArrowUp navigate items
  - [x] 3.4 ARIA: `aria-haspopup="menu"`, `aria-expanded`, `role="menu"` on list, `role="menuitem"` on items (tabIndex={-1})
  - [x] 3.5 Outside-click closes dropdown (same `useEffect` + `mousedown` pattern as MermaidInsertButton)

- [x] Task 4: Create EditorToolbar component (AC: #1, #3, #5, #7)
  - [x] 4.1 Create `components/editor/EditorToolbar.tsx`
  - [x] 4.2 Props: `{ textareaRef: React.RefObject<HTMLTextAreaElement | null>; onInsert: (text: string) => void }` (React 19 requires `| null`)
  - [x] 4.3 On button click: read `textareaRef.current.value.slice(selectionStart, selectionEnd)` to get selected text, call `getFormatText(type, selectedText)`, then `onInsert(result)`
  - [x] 4.4 Toolbar container: `role="toolbar"` with `aria-label="סרגל עיצוב"`, flex-wrap row, border-b, px-2 py-1
  - [x] 4.5 Groups (separated by `ToolbarSeparator`): Text | Headings | Lists | Insert | Code | Mermaid
  - [x] 4.6 Use `lucide-react` icons (size={14} or `className="size-3.5"`)
  - [x] 4.7 Mermaid dropdown: use `MERMAID_TEMPLATES` + `getMermaidTemplate()` from `@/lib/markdown/mermaid-templates`

- [x] Task 5: Update EditorPanel (AC: #1)
  - [x] 5.1 Remove `MermaidInsertButton` import and usage from `components/editor/EditorPanel.tsx`
  - [x] 5.2 Add `<EditorToolbar textareaRef={textareaRef} onInsert={insertTextAtCursor} />` between the panel header div and the textarea div
  - [x] 5.3 Simplify panel header to just show "עורך" label (no MermaidInsertButton slot)

- [x] Task 6: Test and verify (all ACs)
  - [x] 6.1 Create `components/editor/EditorToolbar.test.tsx` — test toolbar renders, format buttons exist
  - [x] 6.2 Manually test bold with selection → `**selected**`, without selection → `**טקסט מודגש**`
  - [x] 6.3 Manually test Headings dropdown → 6 options accessible via keyboard
  - [x] 6.4 Manually test Mermaid dropdown → 7 types, template inserts correctly
  - [x] 6.5 `pnpm build`, `pnpm lint`, `pnpm test` — all must pass with zero errors

## Dev Notes

### CRITICAL: EditorPanel.tsx Integration

The panel must be restructured. Current state (after Story 1.3):

```tsx
// CURRENT: header has MermaidInsertButton on the right
<section className="flex flex-col border-e border-border" aria-label="עורך מארקדאון">
  <div className="flex h-9 items-center justify-between border-b border-border px-4">
    <span className="text-sm font-medium text-muted-foreground">עורך</span>
    <MermaidInsertButton onInsert={insertTextAtCursor} />
  </div>
  <div className="flex-1 overflow-hidden">
    <EditorTextarea ref={textareaRef} value={content} onChange={onChange} />
  </div>
</section>
```

Target state (Story 1.4):

```tsx
// AFTER: separate toolbar row below header, MermaidInsertButton removed
<section className="flex flex-col border-e border-border" aria-label="עורך מארקדאון">
  <div className="flex h-9 items-center border-b border-border px-4">
    <span className="text-sm font-medium text-muted-foreground">עורך</span>
  </div>
  <EditorToolbar textareaRef={textareaRef} onInsert={insertTextAtCursor} />
  <div className="flex-1 overflow-hidden">
    <EditorTextarea ref={textareaRef} value={content} onChange={onChange} />
  </div>
</section>
```

`insertTextAtCursor` in EditorPanel.tsx does NOT change — it handles cursor placement correctly for all insertions. EditorToolbar reads the selection from `textareaRef.current` before calling `onInsert`.

### Format Utility (`lib/editor/format-utils.ts`)

```ts
// lib/editor/format-utils.ts

export type FormatType =
  | 'bold' | 'italic' | 'strikethrough'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'ul' | 'ol' | 'task'
  | 'link' | 'image' | 'table' | 'hr'
  | 'code-inline' | 'code-block';

/**
 * Returns the Markdown string to insert.
 * If selectedText is non-empty, wraps it; else inserts a Hebrew placeholder.
 * The caller (EditorPanel.insertTextAtCursor) replaces the textarea selection
 * with this returned string.
 */
export function getFormatText(type: FormatType, selectedText: string): string {
  const sel = selectedText.trim();

  switch (type) {
    // Inline wraps
    case 'bold':          return `**${sel || 'טקסט מודגש'}**`;
    case 'italic':        return `*${sel || 'טקסט נטוי'}*`;
    case 'strikethrough': return `~~${sel || 'טקסט חצוי'}~~`;
    case 'code-inline':   return `\`${sel || 'קוד'}\``;

    // Block elements
    case 'h1': return `# ${sel || 'כותרת ראשית'}\n`;
    case 'h2': return `## ${sel || 'כותרת משנית'}\n`;
    case 'h3': return `### ${sel || 'כותרת שלישית'}\n`;
    case 'h4': return `#### ${sel || 'כותרת רביעית'}\n`;
    case 'h5': return `##### ${sel || 'כותרת חמישית'}\n`;
    case 'h6': return `###### ${sel || 'כותרת שישית'}\n`;

    case 'ul':   return `- ${sel || 'פריט רשימה'}\n`;
    case 'ol':   return `1. ${sel || 'פריט רשימה'}\n`;
    case 'task': return `- [ ] ${sel || 'משימה'}\n`;

    case 'link':  return `[${sel || 'טקסט הקישור'}](url)`;
    case 'image': return `![${sel || 'תיאור תמונה'}](url)`;
    case 'hr':    return `\n---\n`;

    case 'table':
      return `\n| כותרת א | כותרת ב | כותרת ג |\n| --- | --- | --- |\n| תא 1 | תא 2 | תא 3 |\n`;

    case 'code-block':
      return `\`\`\`\n${sel || 'קוד כאן'}\n\`\`\`\n`;

    default:
      return sel;
  }
}
```

**Testing `getFormatText`:** Create `lib/editor/format-utils.test.ts`:
- Bold with selection: `getFormatText('bold', 'hello')` → `'**hello**'`
- Bold without selection: `getFormatText('bold', '')` → `'**טקסט מודגש**'`
- H1 with selection: `getFormatText('h1', 'Title')` → `'# Title\n'`
- Cover all 16 format types

### FormatButton Component (`components/editor/FormatButton.tsx`)

```tsx
'use client';

interface FormatButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FormatButton({ onClick, ariaLabel, title, disabled, children }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                 hover:bg-muted hover:text-foreground active:scale-[0.97]
                 transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}
```

### ToolbarDropdown Component (`components/editor/ToolbarDropdown.tsx`)

Model closely on `MermaidInsertButton.tsx` (already established pattern in Story 1.3):

```tsx
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  label: string;
  labelEn?: string;
  value: string;
}

interface ToolbarDropdownProps {
  triggerAriaLabel: string;
  triggerLabel: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
}

export function ToolbarDropdown({ triggerAriaLabel, triggerLabel, items, onSelect }: ToolbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside-click close (same pattern as MermaidInsertButton)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Focus first item when menu opens (same pattern as MermaidInsertButton)
  useEffect(() => {
    if (!isOpen) return;
    const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
      );
      const idx = items.indexOf(document.activeElement as HTMLElement);
      const next = e.key === 'ArrowDown'
        ? (idx + 1) % items.length
        : (idx - 1 + items.length) % items.length;
      items[next]?.focus();
    }
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-7 items-center gap-0.5 rounded px-1.5 text-xs text-muted-foreground
                   hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
      >
        <span>{triggerLabel}</span>
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={triggerAriaLabel}
          className="absolute start-0 top-full z-50 mt-1 min-w-36 rounded-md border
                     border-border bg-popover shadow-md"
        >
          {items.map((item) => (
            <button
              key={item.value}
              role="menuitem"
              type="button"
              tabIndex={-1}
              onClick={() => { onSelect(item.value); close(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-start text-sm
                         text-popover-foreground hover:bg-muted transition-colors"
            >
              <span>{item.label}</span>
              {item.labelEn && (
                <span className="ms-auto text-xs text-muted-foreground">{item.labelEn}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### EditorToolbar Component (`components/editor/EditorToolbar.tsx`)

Full button/group definitions:

**Group 1 — Text formatting:**
| Button | `FormatType` | `lucide-react` icon | Hebrew `ariaLabel` |
|---|---|---|---|
| Bold | `'bold'` | `Bold` | `'מודגש'` |
| Italic | `'italic'` | `Italic` | `'נטוי'` |
| Strikethrough | `'strikethrough'` | `Strikethrough` | `'קו חוצה'` |

**Group 2 — Headings (ToolbarDropdown):**
Trigger: Hebrew label `"כותרת"`, ariaLabel `"כותרת"`, items: H1-H6 with labels `"כותרת 1"` … `"כותרת 6"` and values `'h1'`…`'h6'`. On select: `onInsert(getFormatText(value as FormatType, getSelected()))`.

**Group 3 — Lists:**
| Button | `FormatType` | `lucide-react` icon | Hebrew `ariaLabel` |
|---|---|---|---|
| Unordered | `'ul'` | `List` | `'רשימה'` |
| Ordered | `'ol'` | `ListOrdered` | `'רשימה ממוספרת'` |
| Task | `'task'` | `ListChecks` | `'רשימת משימות'` |

**Group 4 — Insert:**
| Button | `FormatType` | `lucide-react` icon | Hebrew `ariaLabel` |
|---|---|---|---|
| Link | `'link'` | `Link` | `'קישור'` |
| Image | `'image'` | `ImageIcon` | `'תמונה'` |
| Table | `'table'` | `Table2` | `'טבלה'` |
| HR | `'hr'` | `Minus` | `'קו מפריד'` |

**Group 5 — Code (ToolbarDropdown):**
Trigger: Hebrew label `"קוד"`, items:
- `{ label: 'קוד מוטבע', labelEn: 'Inline', value: 'code-inline' }`
- `{ label: 'בלוק קוד', labelEn: 'Block', value: 'code-block' }`

**Group 6 — Mermaid (ToolbarDropdown):**
Reuse `MERMAID_TEMPLATES` from `@/lib/markdown/mermaid-templates`:
```ts
import { MERMAID_TEMPLATES, getMermaidTemplate } from '@/lib/markdown/mermaid-templates';

const mermaidItems: DropdownItem[] = MERMAID_TEMPLATES.map((t) => ({
  label: t.labelHe,
  labelEn: t.labelEn,
  value: t.key,
}));
// onSelect: (key) => onInsert(getMermaidTemplate(key))
```

**Helper inside EditorToolbar** to read current selection:
```ts
function getSelected(): string {
  const ta = textareaRef.current;
  if (!ta) return '';
  return ta.value.slice(ta.selectionStart, ta.selectionEnd);
}
```

**ToolbarSeparator** (defined inline in EditorToolbar, no separate file):
```tsx
function ToolbarSeparator() {
  return <div className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />;
}
```

**Icon sizes:** All `lucide-react` icons in the toolbar should use `className="size-3.5"` (14px). This matches the h-7 button size.

**Icon imports from `lucide-react` v0.577.0:**
```ts
import {
  Bold, Italic, Strikethrough,
  List, ListOrdered, ListChecks,
  Link, ImageIcon, Table2, Minus,
  Code, Code2,
  ChevronDown,
} from 'lucide-react';
```

Note: `Heading1`…`Heading6` individual icons may or may not exist in v0.577.0. Use a text label dropdown trigger (`"כותרת"` + ChevronDown) instead of individual heading icons.

**Toolbar container:**
```tsx
<div
  role="toolbar"
  aria-label="סרגל עיצוב"
  className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1"
>
```

**Full EditorToolbar skeleton:**
```tsx
'use client';
import { Bold, Italic, Strikethrough, List, ListOrdered, ListChecks,
         Link, ImageIcon, Table2, Minus, Code, Code2 } from 'lucide-react';
import { FormatButton } from './FormatButton';
import { ToolbarDropdown, type DropdownItem } from './ToolbarDropdown';
import { getFormatText, type FormatType } from '@/lib/editor/format-utils';
import { MERMAID_TEMPLATES, getMermaidTemplate } from '@/lib/markdown/mermaid-templates';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInsert: (text: string) => void;
}

export function EditorToolbar({ textareaRef, onInsert }: EditorToolbarProps) {
  function getSelected(): string {
    const ta = textareaRef.current;
    if (!ta) return '';
    return ta.value.slice(ta.selectionStart, ta.selectionEnd);
  }

  function insert(type: FormatType) {
    onInsert(getFormatText(type, getSelected()));
  }

  const headingItems: DropdownItem[] = [
    { label: 'כותרת 1', labelEn: 'H1', value: 'h1' },
    { label: 'כותרת 2', labelEn: 'H2', value: 'h2' },
    { label: 'כותרת 3', labelEn: 'H3', value: 'h3' },
    { label: 'כותרת 4', labelEn: 'H4', value: 'h4' },
    { label: 'כותרת 5', labelEn: 'H5', value: 'h5' },
    { label: 'כותרת 6', labelEn: 'H6', value: 'h6' },
  ];

  const codeItems: DropdownItem[] = [
    { label: 'קוד מוטבע', labelEn: 'Inline', value: 'code-inline' },
    { label: 'בלוק קוד', labelEn: 'Block', value: 'code-block' },
  ];

  const mermaidItems: DropdownItem[] = MERMAID_TEMPLATES.map((t) => ({
    label: t.labelHe, labelEn: t.labelEn, value: t.key,
  }));

  return (
    <div role="toolbar" aria-label="סרגל עיצוב"
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1"
    >
      {/* Group 1: Text */}
      <FormatButton onClick={() => insert('bold')} ariaLabel="מודגש" title="מודגש">
        <Bold className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('italic')} ariaLabel="נטוי" title="נטוי">
        <Italic className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('strikethrough')} ariaLabel="קו חוצה" title="קו חוצה">
        <Strikethrough className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 2: Headings dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="כותרת"
        triggerLabel="כותרת"
        items={headingItems}
        onSelect={(val) => onInsert(getFormatText(val as FormatType, getSelected()))}
      />

      <ToolbarSeparator />

      {/* Group 3: Lists */}
      <FormatButton onClick={() => insert('ul')} ariaLabel="רשימה" title="רשימה">
        <List className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('ol')} ariaLabel="רשימה ממוספרת" title="רשימה ממוספרת">
        <ListOrdered className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('task')} ariaLabel="רשימת משימות" title="רשימת משימות">
        <ListChecks className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 4: Insert */}
      <FormatButton onClick={() => insert('link')} ariaLabel="קישור" title="קישור">
        <Link className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('image')} ariaLabel="תמונה" title="תמונה">
        <ImageIcon className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('table')} ariaLabel="טבלה" title="טבלה">
        <Table2 className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('hr')} ariaLabel="קו מפריד" title="קו מפריד">
        <Minus className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 5: Code dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="קוד"
        triggerLabel="קוד"
        items={codeItems}
        onSelect={(val) => onInsert(getFormatText(val as FormatType, getSelected()))}
      />

      <ToolbarSeparator />

      {/* Group 6: Mermaid dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="הוסף תרשים Mermaid"
        triggerLabel="תרשים"
        items={mermaidItems}
        onSelect={(key) => onInsert(getMermaidTemplate(key))}
      />
    </div>
  );
}

function ToolbarSeparator() {
  return <div className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />;
}
```

### Project Structure After Story 1.4

```
components/
├── editor/
│   ├── EditorPanel.tsx          -- MODIFIED: remove MermaidInsertButton, add EditorToolbar
│   ├── EditorTextarea.tsx       -- UNCHANGED (forwardRef from Story 1.3)
│   ├── EditorToolbar.tsx        -- NEW: full toolbar with 6 groups
│   ├── EditorToolbar.test.tsx   -- NEW: toolbar unit tests
│   ├── FormatButton.tsx         -- NEW: individual toolbar button component
│   ├── ToolbarDropdown.tsx      -- NEW: accessible dropdown for headings/code/mermaid
│   └── MermaidInsertButton.tsx  -- UNCHANGED (no longer used in EditorPanel, kept)
lib/
└── editor/
    ├── format-utils.ts          -- NEW: getFormatText(type, selectedText)
    └── format-utils.test.ts     -- NEW: unit tests for all format types
```

**All other files UNCHANGED.** Do NOT touch:
- `app/editor/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `lib/markdown/` (config, render-pipeline, mermaid-setup, mermaid-templates)
- `lib/hooks/`
- `components/preview/MarkdownRenderer.tsx`
- `components/layout/`
- `convex/` — NOT used in this story

### Constraints from Architecture (MUST follow)

- **Package manager**: `pnpm` exclusively — never `npm install` or `yarn add`
- **Tailwind v4 logical properties**: NEVER `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`
- **Colors**: NEVER hardcode color values. Use Tailwind semantic tokens (`text-muted-foreground`, `bg-muted`, `bg-border`, `bg-popover`, etc.) or CSS custom properties
- **TypeScript strict mode ON**: No `any` types. All function parameters and return types explicit where non-obvious
- **`'use client'`**: At the very top of every new component file
- **SSR-safe**: All browser API access inside event handlers or `useEffect` — no top-level window/document calls
- **WCAG AA**: All interactive elements have Hebrew ARIA labels. Tab order is logical

### Previous Story Intelligence (from Story 1.3)

1. **`lib/editor/` directory does not yet exist** — create it for `format-utils.ts`
2. **ESLint `jsx-a11y` is strict**: In Story 1.3, `role="option"` required `aria-selected`. For `role="menuitem"`, no `aria-selected` is required — do NOT add it
3. **`vitest.config.ts` includes `**/*.test.tsx`**: Test files can use either `.test.ts` or `.test.tsx`
4. **`pnpm build` and `pnpm lint` MUST pass** — hard requirement before marking complete
5. **Mermaid templates already exist**: `MERMAID_TEMPLATES` and `getMermaidTemplate()` are in `lib/markdown/mermaid-templates.ts` — reuse them directly, do NOT duplicate
6. **`insertTextAtCursor` in EditorPanel replaces the textarea selection**: When the toolbar calls `onInsert(formattedText)`, the formattedText replaces whatever is currently selected (start=end means no selection, so it just inserts at cursor). The cursor is restored to `start + formattedText.length` after insertion
7. **DOMPurify**: Not relevant to this story (toolbar inserts into editor textarea, not preview HTML)
8. **Convex**: NOT used — do NOT import from `convex/`

### What NOT to Implement in This Story

- **AI sparkle icon** — Epic 6 (future story)
- **Highlight (`==text==`)** — NOT standard GFM. `marked` v17 + GFM does NOT render `==text==`. Do NOT add this format type
- **View mode toggles** (editor-only / preview-only / split) — Story 1.5
- **Presentation mode** — Story 1.5
- **Clear button / Load sample / Direction toggle** — Story 1.6
- **v1 localStorage migration** — Story 1.7
- **Color panel / dark mode toggle** — Epic 2
- **Export** — Epic 3
- **Per-sentence BiDi detection** — Epic 4
- **Authentication / Clerk** — Epic 5
- **Mobile overflow menu** — Out of scope for Phase 1 (toolbar wraps via `flex-wrap`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#FormattingToolbar]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Toolbar-grouping]
- [Source: _bmad-output/implementation-artifacts/1-3-mermaid-diagram-rendering.md]
- [Source: components/editor/EditorPanel.tsx — insertTextAtCursor + textareaRef patterns]
- [Source: components/editor/MermaidInsertButton.tsx — dropdown keyboard nav pattern to replicate]
- [Source: lib/markdown/mermaid-templates.ts — MERMAID_TEMPLATES and getMermaidTemplate()]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

- React 19 `useRef<HTMLTextAreaElement>` returns `RefObject<HTMLTextAreaElement | null>` — updated `EditorToolbarProps` accordingly to fix TypeScript build error.
- `@testing-library/react` not installed; used `react-dom/server` `renderToStaticMarkup` for component rendering tests instead.

### Completion Notes List

- Implemented `getFormatText` utility covering all 16 format types (inline wraps + block elements) with Hebrew placeholders when no selection present. 30 unit tests, all passing.
- Created `FormatButton` — reusable accessible button with `h-7 w-7`, `active:scale-[0.97]`, semantic color tokens.
- Created `ToolbarDropdown` — keyboard-navigable accessible dropdown (Enter/Space opens, Escape closes with focus restore, ArrowDown/ArrowUp navigate items). Outside-click closes via `mousedown` listener. `aria-haspopup="menu"`, `role="menu"`, `role="menuitem"` with `tabIndex={-1}`. Uses Tailwind logical properties (`start-0`).
- Created `EditorToolbar` — 6 groups (Text, Headings, Lists, Insert, Code, Mermaid) separated by `ToolbarSeparator`. Reuses `MERMAID_TEMPLATES`/`getMermaidTemplate()` from `lib/markdown/mermaid-templates`. All labels in Hebrew. `role="toolbar"` with `aria-label="סרגל עיצוב"`.
- Updated `EditorPanel` — removed `MermaidInsertButton`, simplified header to label only, inserted `EditorToolbar` between header and textarea.
- `pnpm build`, `pnpm lint`, `pnpm test` all pass. 68 tests total, 0 errors, 0 regressions.

### File List

- `lib/editor/format-utils.ts` (NEW)
- `lib/editor/format-utils.test.ts` (NEW)
- `components/editor/FormatButton.tsx` (NEW)
- `components/editor/ToolbarDropdown.tsx` (NEW)
- `components/editor/EditorToolbar.tsx` (NEW)
- `components/editor/EditorToolbar.test.tsx` (NEW)
- `components/editor/EditorPanel.tsx` (MODIFIED)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED)

## Change Log

- 2026-03-07: Story 1.4 implemented — formatting toolbar with 6 groups (text, headings, lists, insert, code, mermaid), accessible dropdowns, keyboard navigation, Hebrew ARIA labels. `EditorPanel` updated to use `EditorToolbar`, `MermaidInsertButton` removed from panel header. 68 tests passing, build clean.
