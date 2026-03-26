# Story 15.1: Document Sidebar UI

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a sidebar panel showing my saved documents with titles and previews,
So that I can switch between documents easily.

## Acceptance Criteria

1. **Sidebar Panel** — A 260px collapsible sidebar panel, hidden by default. Toggled via `Ctrl+\` keyboard shortcut or icon button in header zone. In RTL mode: sidebar appears on the **right side** (start edge). Slides in/out with smooth animation (300ms max, respect `prefers-reduced-motion`).

2. **Document List Row** — Each row displays:
   - **Title** (bold) — extracted from first H1 heading, or first line, or "מסמך חדש"
   - **Preview snippet** (~60 chars, markdown stripped) — muted text
   - **Relative date** — Hebrew format: "היום", "אתמול", "לפני 3 ימים"
   - **Pin icon** (optional) — pinned docs float to top of list

3. **Search** — Search bar at top of sidebar. Instant filtering by title + content with match highlighting as user types.

4. **Context Menu** — Right-click (or long-press on mobile) on a document row shows context menu with: Pin/Unpin, Delete, Duplicate. Delete requires confirmation dialog ("למחוק את '...'?").

5. **Active Document Highlight** — The currently open document is visually highlighted in the list (background color or border accent).

6. **Empty State** — When no documents exist, show a friendly empty state with icon and text "אין מסמכים עדיין" + a "מסמך חדש" button.

7. **Responsive Behavior** —
   - Desktop (>1024px): sidebar as 260px panel alongside editor, pushes content
   - Tablet (768-1024px): sidebar as overlay Sheet from right
   - Mobile (<768px): sidebar as full-width bottom sheet or overlay

## Tasks / Subtasks

- [x] Task 1: Create document data model and storage hook (AC: 2, 5)
  - [x] Define `Document` TypeScript type in `types/document.ts` (id, content, title, snippet, themeId, direction, createdAt, updatedAt, isPinned)
  - [x] Create `useDocuments` hook in `lib/hooks/useDocuments.ts` using IndexedDB (via `idb` library or raw IndexedDB API)
  - [x] Implement CRUD operations: createDocument, updateDocument, deleteDocument, pinDocument, duplicateDocument
  - [x] Implement `getDocumentTitle()` utility — extract from first H1, first line, or fallback "מסמך חדש"
  - [x] Implement `getDocumentSnippet()` utility — strip markdown, truncate to ~60 chars
  - [x] Implement `getRelativeDate()` utility — Hebrew relative dates (היום, אתמול, לפני X ימים)
  - [x] Write tests for document utilities and hook

- [x] Task 2: Build DocumentSidebar component (AC: 1, 5, 6, 7)
  - [x] Create `components/documents/DocumentSidebar.tsx` — main sidebar container
  - [x] Implement sidebar open/close state with `useState` (hidden by default)
  - [x] Desktop layout: fixed 260px panel on right side (RTL start), pushes editor content
  - [x] Tablet/mobile: use existing `Sheet` component from `components/ui/sheet.tsx` as overlay
  - [x] Smooth slide animation (300ms, ease-out), respect `prefers-reduced-motion: reduce`
  - [x] Empty state component with icon + "אין מסמכים עדיין" + "מסמך חדש" button
  - [x] Active document visual highlight (ring or background accent)
  - [x] Write tests

- [x] Task 3: Build DocumentListItem component (AC: 2)
  - [x] Create `components/documents/DocumentListItem.tsx`
  - [x] Display: title (bold), snippet (muted), relative date, pin icon
  - [x] Click handler to switch active document
  - [x] Hover and focus states
  - [x] Keyboard navigation (arrow keys between items, Enter to select)
  - [x] Write tests

- [x] Task 4: Build search functionality (AC: 3)
  - [x] Add search input at top of sidebar with magnifying glass icon
  - [x] Instant filter documents by title + content (debounced 150ms)
  - [x] Highlight matching text in search results
  - [x] Empty search state: "לא נמצאו מסמכים" message
  - [x] Write tests

- [x] Task 5: Build context menu (AC: 4)
  - [x] Use shadcn/ui `DropdownMenu` for context menu (right-click trigger)
  - [x] Menu items: "הצמד" / "בטל הצמדה" (Pin/Unpin), "שכפל" (Duplicate), "מחק" (Delete)
  - [x] Delete confirmation via `AlertDialog` — "למחוק את '{title}'?"
  - [x] Wire up actions to `useDocuments` hook CRUD methods
  - [x] Write tests

- [x] Task 6: Integrate sidebar toggle into Header (AC: 1)
  - [x] Add sidebar toggle button in header (icon: `FileText` from Lucide)
  - [x] Wire `Ctrl+\` keyboard shortcut (global event listener)
  - [x] Button shows active state when sidebar is open
  - [x] Place in header zone — between Brand and View Modes (zone 1.5)
  - [x] Write tests

- [x] Task 7: Integrate sidebar into editor page layout (AC: 1, 7)
  - [x] Modify `app/editor/page.tsx` to include `DocumentSidebar`
  - [x] Modify `PanelLayout` to accommodate sidebar panel (flex sibling approach)
  - [x] Ensure sidebar + editor + preview coexist without layout breaks
  - [x] Test all view modes (split, editor-only, preview-only) with sidebar open/closed
  - [x] Responsive testing at all 5 breakpoints
  - [x] Write integration tests

## Dev Notes

### Architecture Patterns & Constraints

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript strict mode.

**State Management — NO Zustand, NO Redux:**
This project uses React hooks + localStorage/IndexedDB for client state and Convex for server state. Do NOT add any external state management library. Follow the existing pattern:
- `useLocalStorage` hook for simple key-value persistence
- Custom hooks wrapping state + persistence logic (see `useEditorContent.ts`, `useColorTheme.ts`)
- `useState` for component-local state

**IndexedDB for Document Storage — CRITICAL DECISION:**
Documents MUST be stored in IndexedDB, NOT localStorage. Reasons:
- localStorage has a ~5MB limit, which is easily exceeded with multiple documents
- IndexedDB supports structured data, indexes, and larger storage quotas
- The feedback spec (N3) explicitly states "IndexedDB for anonymous users"
- Story 15.2 will add auto-save; Story 15.3 will add Convex cloud sync for logged-in users

**Implementation approach for IndexedDB:**
- Use the native IndexedDB API (no additional library needed — keep dependencies minimal)
- Database name: `marko-documents`
- Object store: `documents` with `id` as keyPath, indexes on `updatedAt` and `isPinned`
- Wrap in a custom `useDocuments` hook that provides React state + CRUD operations
- All IndexedDB operations are async — use `useEffect` + `useState` for loading states

### Component Organization

**Feature directory:** `components/documents/` — following the project's feature-based organization pattern.

```
components/
  documents/
    DocumentSidebar.tsx       — Main sidebar container (panel + sheet modes)
    DocumentListItem.tsx      — Individual document row
    DocumentSearch.tsx         — Search input with filtering
    DocumentContextMenu.tsx   — Right-click menu (Pin/Delete/Duplicate)
    DocumentEmptyState.tsx    — Empty state illustration
    DocumentSidebar.test.tsx  — Sidebar tests
    DocumentListItem.test.tsx — List item tests
```

**Types:** `types/document.ts`

```typescript
export interface Document {
  id: string;          // crypto.randomUUID()
  content: string;     // Raw markdown
  title: string;       // Extracted from content
  themeId: string;     // Active theme when created/last edited
  direction: 'auto' | 'rtl' | 'ltr';
  createdAt: number;   // Date.now() timestamp
  updatedAt: number;   // Date.now() timestamp
  isPinned: boolean;
}
```

### Sidebar Layout Integration — CRITICAL

**Desktop (>1024px) — Panel mode:**
The sidebar should modify the CSS Grid in `PanelLayout.tsx`. Currently the editor page uses:
```css
grid-template-columns: 1fr 1fr   /* split mode */
grid-template-columns: 1fr 0fr   /* editor-only */
grid-template-columns: 0fr 1fr   /* preview-only */
```

With sidebar open, prepend a `260px` column:
```css
grid-template-columns: 260px 1fr 1fr   /* sidebar + split */
grid-template-columns: 260px 1fr 0fr   /* sidebar + editor-only */
grid-template-columns: 260px 0fr 1fr   /* sidebar + preview-only */
```

**Tablet/Mobile (<1024px) — Sheet mode:**
Use the existing `Sheet` component (from `components/ui/sheet.tsx`) as an overlay. Side: `"right"` (matches RTL start-edge convention, same as ColorPanel).

### Title Extraction Logic

```typescript
function getDocumentTitle(content: string): string {
  // 1. Check for first H1 heading: # Title
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // 2. Fall back to first non-empty line
  const firstLine = content.split('\n').find(line => line.trim().length > 0);
  if (firstLine) return firstLine.trim().slice(0, 60);

  // 3. Default
  return 'מסמך חדש';
}
```

### Snippet Extraction Logic

```typescript
function getDocumentSnippet(content: string): string {
  // Strip markdown syntax, take first ~60 chars after title
  const stripped = content
    .replace(/^#+ .+$/gm, '')        // Remove headings
    .replace(/[*_~`>]/g, '')          // Remove markdown formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links → text only
    .replace(/\n+/g, ' ')            // Collapse newlines
    .trim();
  return stripped.slice(0, 60) + (stripped.length > 60 ? '...' : '');
}
```

### Hebrew Relative Dates

```typescript
function getRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  return `לפני ${Math.floor(diffDays / 30)} חודשים`;
}
```

### Keyboard Shortcut — Ctrl+\

Register a global keyboard listener for `Ctrl+\` (or `Cmd+\` on Mac):

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
      e.preventDefault();
      toggleSidebar();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [toggleSidebar]);
```

### Context Menu — Use shadcn/ui DropdownMenu

Do NOT build a custom context menu. Use shadcn/ui `DropdownMenu` component triggered by right-click:

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
```

For the delete confirmation, use shadcn/ui `AlertDialog`:

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
```

Check if these components are already installed. If not, install via: `npx shadcn@latest add dropdown-menu alert-dialog`

### Animation — CRITICAL RULES

- No animation exceeds 300ms
- ALL animations MUST respect `prefers-reduced-motion: reduce` — use Tailwind `motion-safe:` prefix or Framer Motion's `useReducedMotion()`
- Professional style: no bouncing, no spring physics
- The Sheet component already has built-in animations (300ms slide) — use those for tablet/mobile
- For desktop panel mode, use CSS transitions: `transition-all duration-300 ease-out`

### RTL & Hebrew — CRITICAL

- ALL UI text in Hebrew (hardcoded, no i18n library)
- `dir="rtl"` inherited from root `<html>` element
- Use logical CSS properties: `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-` (NEVER `pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`)
- Sidebar appears on **right side** in RTL (start edge) — this aligns with Sheet `side="right"`
- Context menu: use Radix-based DropdownMenu which handles RTL positioning natively
- Search input: `dir="auto"` (user may search in English)
- Keyboard shortcuts displayed as LTR within RTL context: wrap in `<span dir="ltr">`

### Existing Components to Reuse — DO NOT REINVENT

| Need | Use | Location |
|------|-----|----------|
| Sidebar overlay (tablet/mobile) | `Sheet` + `SheetContent` | `components/ui/sheet.tsx` |
| Context menu | `DropdownMenu` | `components/ui/dropdown-menu.tsx` |
| Delete confirmation | `AlertDialog` | `components/ui/alert-dialog.tsx` |
| Icons | Lucide React (`FileText`, `Pin`, `Trash2`, `Copy`, `Search`, `Plus`, `PanelRight`) | `lucide-react` |
| Toast notifications | Sonner | `sonner` |
| Button | `Button` | `components/ui/button.tsx` |

### Header Integration — PRECISE ZONE PLACEMENT

The header uses a 7-zone layout (from Story 12.1). The exact zones are:
1. **Brand** (logo "מארקו") → `marko-header-zone--brand`
2. **View Modes** (split/editor/preview toggle) → `marko-header-zone--viewmodes`
3. **AI Star** (עוזר AI button) → `marko-header-zone--ai`
4. **Output** (Export + Copy dropdowns) → `marko-header-zone--output`
5. **Tools** (Color panel + Theme toggle) → `marko-header-zone--tools`
6. **Overflow Menu** → `marko-header-zone--overflow`
7. **User** (Auth Gate) → `marko-header-zone--user`

**Sidebar toggle placement:** Add a new zone between Brand (1) and View Modes (2). Create `marko-header-zone--documents` with a `ZoneSeparator` before the view modes separator.

The toggle button pattern must match existing header buttons:
```tsx
{/* Zone 1.5: Document Sidebar Toggle — NEW */}
<div className="marko-header-zone marko-header-zone--documents">
  <button
    type="button"
    onClick={onToggleSidebar}
    aria-label="רשימת מסמכים (Ctrl+\)"
    title="רשימת מסמכים (Ctrl+\)"
    aria-expanded={isSidebarOpen}
    className="marko-header-btn"
  >
    <FileText className="size-5" aria-hidden="true" />
  </button>
</div>
```

**Header props change:** Add `onToggleSidebar: () => void` and `isSidebarOpen: boolean` to `HeaderProps` interface.

### Migration from Single-Document to Multi-Document

**CRITICAL — This story introduces a paradigm shift:**
- Currently, `useEditorContent` stores a single document in localStorage key `marko-v2-editor-content`
- This story adds a document list in IndexedDB, but the **current single-document flow must continue to work**
- Strategy: On first load, if IndexedDB is empty but localStorage has content, create a document in IndexedDB from the localStorage content (migration)
- After migration, the active document ID is tracked in localStorage: `marko-v2-active-document-id`
- `useEditorContent` will be modified in Story 15.2 (auto-save) to read/write the active document from IndexedDB instead of localStorage directly. For THIS story, keep `useEditorContent` as-is and only add the sidebar UI.

**For this story (15.1):** The sidebar displays documents from IndexedDB and allows switching. When a document is selected, its content is loaded into the editor via `useEditorContent.setContent()`. The current localStorage content is saved to IndexedDB as the first document on initial load.

### Performance Considerations

- Document list should render efficiently — use virtualization (`react-window`) only if >100 documents; otherwise, simple `.map()` is fine
- Search filtering: debounce input by 150ms (use existing `useDebounce` hook from `lib/hooks/useDebounce.ts`)
- Snippet extraction: compute on document save, store in Document object — do not recompute on every render
- IndexedDB reads are async — show loading skeleton while documents load

### Accessibility — WCAG AA Required

- Sidebar toggle button: `aria-label="רשימת מסמכים"`, `aria-expanded={isOpen}`
- Document list: `role="listbox"`, each item `role="option"`, `aria-selected` for active
- Keyboard navigation: `ArrowUp`/`ArrowDown` between items, `Enter` to select, `Escape` to close sidebar
- Focus trap when sidebar is open in Sheet mode (handled by Radix Sheet)
- All text meets 4.5:1 contrast ratio
- Delete confirmation dialog: focus trapped, `Escape` to cancel
- Context menu: full keyboard navigation (handled by Radix DropdownMenu)

### Project Structure Notes

**New files to create:**
- `types/document.ts` — Document type definition
- `lib/hooks/useDocuments.ts` — IndexedDB document CRUD hook
- `lib/documents/utils.ts` — Title extraction, snippet, relative date utilities
- `lib/documents/utils.test.ts` — Utility tests
- `components/documents/DocumentSidebar.tsx` — Main sidebar
- `components/documents/DocumentListItem.tsx` — List row
- `components/documents/DocumentSearch.tsx` — Search input
- `components/documents/DocumentContextMenu.tsx` — Context menu wrapper
- `components/documents/DocumentEmptyState.tsx` — Empty state
- `components/documents/DocumentSidebar.test.tsx` — Component tests
- `lib/hooks/useDocuments.test.ts` — Hook tests

**Files to modify:**
- `app/editor/page.tsx` — Add sidebar state + component
- `components/layout/Header.tsx` — Add sidebar toggle button
- `components/layout/PanelLayout.tsx` — Adjust CSS Grid for sidebar column

**Files NOT to modify (handled by later stories):**
- `lib/hooks/useEditorContent.ts` — Will be refactored in Story 15.2
- `convex/schema.ts` — Documents table added in Story 15.3
- `lib/hooks/useAutoSave.ts` — Auto-save behavior modified in Story 15.2

### Testing Standards

**Framework:** Vitest with co-located test files.

**Unit tests for utilities:**
- `getDocumentTitle()`: H1 extraction, first-line fallback, empty content → "מסמך חדש"
- `getDocumentSnippet()`: markdown stripping, truncation, empty content
- `getRelativeDate()`: today, yesterday, days, weeks, months

**Component tests:**
- Mock IndexedDB (use `fake-indexeddb` or manual mock)
- DocumentSidebar: renders, opens/closes, empty state
- DocumentListItem: renders title/snippet/date, click handler, pin icon
- DocumentSearch: filters documents, empty results
- DocumentContextMenu: pin/delete/duplicate actions

**Integration test patterns (from previous stories):**
```tsx
// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));
```

**Test count baseline:** Full test suite currently at ~930 tests across 87 files. Maintain zero regressions.

### Previous Story Intelligence

**From Story 14.3 (Contact & Bug Report Pages):**
- Page layout pattern: `min-h-screen bg-[var(--background)] p-6` + `max-w-2xl mx-auto`
- `try/catch` all browser API access for Safari strict privacy mode
- Sonner toasts configured: `<Toaster dir="rtl" position="bottom-center" duration={3000} />`

**From Story 14.2 (Settings Page):**
- Section cards: `rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5`
- Test count at 930 — maintain zero regressions

**From Story 14.1 (Skip Landing):**
- `useRef` guards to prevent `useEffect` re-trigger loops
- Client component pattern: `"use client"` at top of file

**From Story 12.1 (Header Layout):**
- Header uses 7-zone layout pattern — new buttons must fit into existing zones
- Header CSS classes: `marko-header-btn` for icon buttons

**From Story 13.2 (Color Panel):**
- ColorPanel uses `Sheet` side="right" — the document sidebar should use the same pattern for consistency on tablet/mobile

### Git History Context

Recent commits follow pattern: "Story X.Y done: Description + code review fixes". Last 5 commits are from Epic 7 (Landing Page) and Epic 14 (User Pages). All stories pass full test suite before marking done.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-15, Story 15.1]
- [Source: _bmad-output/benakiva-feedback-round1.md#N3 — Document Management specification]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data residency, state management, component patterns]
- [Source: _bmad-output/planning-artifacts/ux-specification.md — Sidebar design, responsive behavior, RTL rules]
- [Source: components/ui/sheet.tsx — Existing Sheet component for overlay sidebar]
- [Source: components/layout/Header.tsx — 7-zone header layout]
- [Source: lib/hooks/useLocalStorage.ts — Storage hook pattern to follow]
- [Source: lib/hooks/useEditorContent.ts — Current single-document storage]
- [Source: convex/schema.ts — Current schema (no documents table yet, added in S15.3)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No blocking issues encountered.

### Implementation Plan

- Used native IndexedDB API (no external library) for document storage with `marko-documents` database
- Sidebar rendered as flex sibling to editor grid (cleaner than modifying grid columns)
- Desktop: inline 260px `<aside>` panel; Tablet/Mobile: Sheet overlay side="right"
- Legacy localStorage content automatically migrated to IndexedDB on first load
- Editor content synced back to IndexedDB via debounced (500ms) save
- Active document ID tracked in localStorage (`marko-v2-active-document-id`)
- Search filtering done at editor page level for simplicity
- Context menu uses shadcn/ui DropdownMenu + AlertDialog for delete confirmation
- All UI text in Hebrew, logical CSS properties for RTL, `dir="auto"` on search input

### Completion Notes List

- Task 1: Created `Document` type, `useDocuments` IndexedDB hook with full CRUD, and utility functions (title extraction, snippet, Hebrew relative dates). 31 unit tests.
- Task 2: Built `DocumentSidebar` with dual-mode rendering (desktop panel + Sheet overlay), loading skeleton, empty state, keyboard navigation (ArrowUp/Down/Enter). `Ctrl+\` shortcut registered.
- Task 3: Built `DocumentListItem` with title, snippet, relative date, pin icon, active highlight (ring + bg), hover/focus states, and search match highlighting.
- Task 4: Built `DocumentSearch` with magnifying glass icon, `dir="auto"` input, instant filtering by title + content. Empty search state "לא נמצאו מסמכים".
- Task 5: Built `DocumentContextMenu` with Pin/Unpin, Duplicate, Delete (with AlertDialog confirmation in Hebrew).
- Task 6: Added documents zone (1.5) to Header between Brand and View Modes with `FileText` icon, `aria-expanded`, and active state class.
- Task 7: Integrated sidebar into `PanelLayout` via `sidebarPanel` prop (flex sibling). Wired all state in `EditorPage`: document selection loads content, content changes sync back to IndexedDB, delete/duplicate/create all update editor state. 12 component tests.
- Full test suite: 1007 tests across 94 files, zero regressions.

### File List

**New files:**
- types/document.ts
- lib/documents/utils.ts
- lib/documents/utils.test.ts
- lib/hooks/useDocuments.ts
- lib/hooks/useDocuments.test.ts
- components/documents/DocumentSidebar.tsx
- components/documents/DocumentListItem.tsx
- components/documents/DocumentSearch.tsx
- components/documents/DocumentContextMenu.tsx
- components/documents/DocumentEmptyState.tsx
- components/documents/DocumentSidebar.test.tsx

**Modified files:**
- components/layout/Header.tsx
- components/layout/PanelLayout.tsx
- app/editor/page.tsx

### Change Log

- 2026-03-26: Story 15.1 implemented — Document Sidebar UI with IndexedDB storage, CRUD operations, sidebar panel/sheet, search, context menu, Header toggle, and editor page integration. 43 new tests added (1007 total).
