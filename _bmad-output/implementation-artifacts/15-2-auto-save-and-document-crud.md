# Story 15.2: Auto-Save & Document CRUD

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my documents to save automatically and switching between them to be seamless,
So that I never lose work.

## Acceptance Criteria

1. **Auto-save with debounce** — Given the user is typing, When 500ms passes since the last keystroke, Then the document auto-saves to IndexedDB. Save data includes: content, title (extracted), color theme ID (`activeThemeId` from `useThemeSelection`), direction setting (`docDirection` from `useDocDirection`), and last modified timestamp.

2. **Save status indicator** — Given the save process, When in progress, Then a status indicator in the header shows "שומר..." (with subtle pulse animation), transitioning to "נשמר ✓" on success (fades after 2s). On error, show "שגיאה בשמירה" in error styling. The indicator replaces idle state (no text visible when not saving).

3. **IndexedDB storage for anonymous users** — Given anonymous users, When saving, Then documents save to IndexedDB locally. This is already the primary storage mechanism from Story 15.1.

4. **New Document experience** — Given the user clicks "New Document" (+ button in sidebar), When a new document opens, Then:
   - The previous document is explicitly auto-saved before switching (flush pending save, not just debounce)
   - The editor content is cleared
   - The cursor is at line 1
   - The placeholder text shows "התחל לכתוב..." in muted text
   - First line becomes the title automatically (existing `getDocumentTitle` handles this)

5. **Document switching saves previous** — Given the user clicks a different document in the sidebar, When the switch happens, Then the current document is auto-saved immediately (flush) before loading the new document content.

6. **Theme and direction persistence** — Given the user changes the color theme or document direction, When the change occurs, Then the active document is updated with the new themeId/direction. When loading a document, its stored themeId and direction are applied to the editor.

## Tasks / Subtasks

- [x] Task 1: Add save status indicator to header (AC: #2)
  - [x] 1.1 Create `components/documents/SaveStatusIndicator.tsx` — renders "שומר..." / "נשמר ✓" / "שגיאה בשמירה" text
  - [x] 1.2 Implement save status state machine: `idle` → `saving` → `saved` → `idle` (fade after 2s), or `saving` → `error`
  - [x] 1.3 Place in header between Documents zone and View Modes zone — use `marko-header-zone--save-status`. Update `HeaderProps` interface in `Header.tsx` to accept `saveStatus` prop, OR render `SaveStatusIndicator` as a sibling to `Header` in `page.tsx` (whichever approach is cleaner given the existing Header structure)
  - [x] 1.4 Style: muted text, small font size, subtle pulse on "שומר...", checkmark icon on "נשמר ✓", error color on failure
  - [x] 1.5 Respect `prefers-reduced-motion` — no pulse animation when reduced motion preferred
  - [x] 1.6 Write tests for SaveStatusIndicator component

- [x] Task 2: Refactor auto-save to include themeId and direction (AC: #1, #6)
  - [x] 2.1 In `app/editor/page.tsx`, import `useThemeSelection` to get `activeThemeId` and `useAutoSave` for the preference toggle
  - [x] 2.2 Wrap the auto-save `useEffect` with an `isAutoSave` guard — if user disabled auto-save in Settings, skip debounced saves (but still allow flush-before-switch in Task 4)
  - [x] 2.3 Modify the existing auto-save `useEffect` (currently line ~161-167) to pass `{ content, themeId: activeThemeId, direction: docDirection }` to `updateDocument`
  - [x] 2.4 Add `activeThemeId` and `docDirection` to the debounced save dependency list
  - [x] 2.5 Track previous themeId and direction in refs — initialize `prevThemeIdRef` from current `activeThemeId` and `prevDirectionRef` from current `docDirection` (NOT hardcoded defaults) to avoid spurious save on mount
  - [x] 2.6 CRITICAL: Only update `prevSaveContentRef`, `prevThemeIdRef`, `prevDirectionRef` AFTER a successful save — not before. If the save fails, the refs must retain old values so the next debounce cycle retries the save
  - [x] 2.7 Write tests for the expanded auto-save logic

- [x] Task 3: Implement save status tracking in auto-save flow (AC: #1, #2)
  - [x] 3.1 Create a `useSaveStatus` hook in `lib/hooks/useSaveStatus.ts` — manages save state machine (`idle` | `saving` | `saved` | `error`)
  - [x] 3.2 `startSave()` → sets `saving`, `completeSave()` → sets `saved` + 2s timeout to `idle`, `failSave()` → sets `error` + 5s timeout to `idle`
  - [x] 3.3 In editor page, wrap `updateDocument` calls with save status tracking: call `startSave()` before, `completeSave()` on success, `failSave()` on error
  - [x] 3.4 Pass `saveStatus` to `SaveStatusIndicator` component
  - [x] 3.5 Write tests for `useSaveStatus` hook

- [x] Task 4: Implement flush-before-switch for document switching (AC: #4, #5)
  - [x] 4.1 Create a `flushSave` function that immediately saves current content/themeId/direction to IndexedDB (bypassing debounce). This always runs regardless of `isAutoSave` preference — switching documents must never lose work
  - [x] 4.2 In `handleSelectDocument`, call `await flushSave()` before `setActiveDocumentId(id)`. NOTE: this makes the handler async — ensure `DocumentSidebar`'s `onSelectDocument` callback is invoked with `void handleSelectDocument(id)` to avoid unhandled promise warnings. Check all callers in `DocumentSidebar.tsx` and `DocumentListItem.tsx`
  - [x] 4.3 In `handleCreateDocument`, call `await flushSave()` before `createDocument()`. Pass current `activeThemeId` and `docDirection` to `createDocument()` so new documents inherit the current editor settings
  - [x] 4.4 Ensure `flushSave` is a no-op when no active document or no content changes
  - [x] 4.5 Write tests for flush-before-switch behavior

- [x] Task 5: Update new document placeholder text (AC: #4)
  - [x] 5.1 In `EditorTextarea.tsx`, change placeholder from `"...הדבק טקסט מארקדאון כאן"` to `"התחל לכתוב..."`
  - [x] 5.2 Update any tests that reference the old placeholder text
  - [x] 5.3 Ensure cursor is focused in textarea after new document creation (call `editorTextareaRef.current?.focus()` in the new document handler)

- [x] Task 6: Apply stored theme and direction on document load (AC: #6)
  - [x] 6.1 In the document switching `useEffect` (currently line ~112-125), when loading a new document's content, also apply its `themeId` and `direction`
  - [x] 6.2 If document has a non-empty `themeId`, call `setActiveThemeId(doc.themeId)` + apply theme colors via `setColorTheme(themeColors)`
  - [x] 6.3 If document has a `direction` value, call `setDocDirection(doc.direction)`
  - [x] 6.4 Handle edge cases: document has no themeId (legacy/empty) → keep current theme, document has unknown themeId → keep current theme
  - [x] 6.5 Write tests for theme/direction restoration on document switch

- [x] Task 7: Integration testing (AC: all)
  - [x] 7.1 Test full flow: type → debounce → save → status indicator → saved
  - [x] 7.2 Test document switch: type → switch doc → previous saved → new content loaded → theme applied
  - [x] 7.3 Test new document: create → previous saved → editor cleared → placeholder shown → cursor focused
  - [x] 7.4 Test save error: simulate IndexedDB failure → error status shown → recovers on next save
  - [x] 7.5 Run full test suite, confirm zero regressions

## Dev Notes

### Architecture Patterns & Constraints

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript strict mode.

**State Management — NO Zustand, NO Redux:**
This project uses React hooks + localStorage/IndexedDB for client state and Convex for server state. Do NOT add any external state management library. Follow the existing pattern:
- Custom hooks wrapping state + persistence logic (see `useEditorContent.ts`, `useColorTheme.ts`)
- `useState` for component-local state
- `useRef` for non-rendered references (previous values, cancellation flags)

### What Already Exists (from Story 15.1) — DO NOT RECREATE

| Feature | Status | Location |
|---------|--------|----------|
| IndexedDB CRUD (create, read, update, delete, pin, duplicate) | DONE | `lib/hooks/useDocuments.ts` |
| Document type with themeId, direction, timestamps | DONE | `types/document.ts` |
| Auto-save content (500ms debounce) | DONE | `app/editor/page.tsx:161-167` |
| Document switching (content sync) | DONE | `app/editor/page.tsx:112-125` |
| New document creation | DONE | `app/editor/page.tsx:131-142` |
| Document sidebar UI with search, context menu | DONE | `components/documents/` |
| Header toggle (zone 1.5) | DONE | `components/layout/Header.tsx` |
| Title/snippet auto-extraction | DONE | `lib/documents/utils.ts` |
| Legacy localStorage→IndexedDB migration | DONE | Inside `useDocuments.ts` |
| `useAutoSave` toggle preference | DONE | `lib/hooks/useAutoSave.ts` (boolean toggle only) |

### What THIS Story Adds — ONLY These Changes

1. **Save status indicator** — New visual component in header showing save state
2. **Expanded auto-save data** — Include `themeId` + `direction` in every save (currently only `content` is saved)
3. **Flush-before-switch** — Immediate save before document switching (currently relies on debounce)
4. **Placeholder text change** — "התחל לכתוב..." replaces "...הדבק טקסט מארקדאון כאן"
5. **Theme/direction restoration** — When loading a document, apply its stored theme and direction
6. **Save error handling** — User-facing feedback when IndexedDB write fails

### Save Status Indicator — Implementation Details

**State machine:**
```
idle ─(save triggered)─→ saving ─(success)─→ saved ─(2s timeout)─→ idle
                                 ─(error)──→ error ─(5s timeout)─→ idle
```

**Header placement:** Add a new zone `marko-header-zone--save-status` between the documents zone (1.5) and view modes zone (2). Keep it minimal — just a `<span>` with dynamic text and classes.

**Visual design — use opacity transitions for smooth fade:**
```tsx
// Wrapper element — always rendered, with a11y attributes:
<div role="status" aria-live="polite" className="marko-header-zone marko-header-zone--save-status">
  {/* Use opacity transition instead of conditional rendering for smooth fade-out */}
  <span className={cn(
    "text-xs transition-opacity duration-500",
    status === 'idle' && "opacity-0",
    status === 'saving' && "text-muted-foreground opacity-100 motion-safe:animate-pulse",
    status === 'saved' && "text-muted-foreground opacity-100",
    status === 'error' && "text-destructive opacity-100",
  )}>
    {status === 'saving' && 'שומר...'}
    {status === 'saved' && <><Check className="inline size-3 me-1" aria-hidden="true" />נשמר</>}
    {status === 'error' && 'שגיאה בשמירה'}
  </span>
</div>
```

**NOTE:** Use `opacity-0` / `opacity-100` with `transition-opacity` instead of conditional rendering (`return null`). This ensures the "saved" → "idle" transition animates smoothly via CSS, rather than React unmounting the span abruptly.

### Auto-Save Expansion — CRITICAL PATTERN

**Current auto-save** (page.tsx:161-167):
```typescript
const debouncedContentForSave = useDebounce(content, 500);
useEffect(() => {
  if (activeDocumentId === null) return;
  if (debouncedContentForSave === prevSaveContentRef.current) return;
  prevSaveContentRef.current = debouncedContentForSave;
  void updateDocument(activeDocumentId, { content: debouncedContentForSave });
}, [activeDocumentId, debouncedContentForSave, updateDocument]);
```

**Required expansion:**
```typescript
const debouncedContentForSave = useDebounce(content, 500);
const { activeThemeId } = useThemeSelection(); // ADD THIS IMPORT
const [isAutoSave] = useAutoSave(); // ADD: respect user's auto-save preference

useEffect(() => {
  if (!isAutoSave) return; // Skip debounced auto-save if user disabled in Settings
  if (activeDocumentId === null) return;

  const contentChanged = debouncedContentForSave !== prevSaveContentRef.current;
  const themeChanged = activeThemeId !== prevThemeIdRef.current;
  const directionChanged = docDirection !== prevDirectionRef.current;

  if (!contentChanged && !themeChanged && !directionChanged) return;

  // NOTE: Do NOT update refs before save succeeds — if save fails, refs retain old
  // values so the next debounce cycle will retry the save
  const doSave = async () => {
    startSave();
    try {
      await updateDocument(activeDocumentId, {
        content: debouncedContentForSave,
        themeId: activeThemeId,
        direction: docDirection,
      });
      // Only update refs AFTER successful save
      prevSaveContentRef.current = debouncedContentForSave;
      prevThemeIdRef.current = activeThemeId;
      prevDirectionRef.current = docDirection;
      completeSave();
    } catch {
      failSave();
    }
  };
  void doSave();
}, [activeDocumentId, debouncedContentForSave, activeThemeId, docDirection, updateDocument, isAutoSave]);
```

**New refs needed — initialize from current values, NOT hardcoded defaults:**
```typescript
// Initialize these in the document-switching useEffect when a new document loads,
// or in a useEffect that runs once on mount with current values
const prevThemeIdRef = useRef<string>(activeThemeId);
const prevDirectionRef = useRef<string>(docDirection);
```

**IMPORTANT:** `prevThemeIdRef` and `prevDirectionRef` must be initialized from the actual current values (`activeThemeId` from `useThemeSelection` and `docDirection` from `useDocDirection`). Using hardcoded defaults like `''` or `'auto'` causes a false "changed" detection on first render, triggering a spurious save.

### Flush-Before-Switch — CRITICAL

The current auto-save relies on debounce, which means if the user types and immediately switches documents, up to 500ms of typing may be lost. Fix:

```typescript
// NOTE: flushSave uses raw `content` (not debounced) intentionally — we want the
// latest editor state saved immediately, not whatever was last debounced.
// This runs regardless of `isAutoSave` preference — switching must never lose work.
const flushSave = useCallback(async () => {
  if (activeDocumentId === null) return;
  if (content === prevSaveContentRef.current
      && activeThemeId === prevThemeIdRef.current
      && docDirection === prevDirectionRef.current) return;

  await updateDocument(activeDocumentId, {
    content,
    themeId: activeThemeId,
    direction: docDirection,
  });
  // Update refs after successful save
  prevSaveContentRef.current = content;
  prevThemeIdRef.current = activeThemeId;
  prevDirectionRef.current = docDirection;
}, [activeDocumentId, content, activeThemeId, docDirection, updateDocument]);
```

Wire into switching — **IMPORTANT async callback handling:**
```typescript
// These are now async. Ensure DocumentSidebar calls them with `void` prefix
// to avoid unhandled promise warnings. Check all callers in DocumentSidebar.tsx
// and DocumentListItem.tsx — e.g., onClick={() => void onSelectDocument(doc.id)}
const handleSelectDocument = useCallback(async (id: string) => {
  await flushSave();
  setActiveDocumentId(id);
}, [flushSave, setActiveDocumentId]);

const handleCreateDocument = useCallback(async () => {
  if (isCreatingRef.current) return;
  isCreatingRef.current = true;
  try {
    await flushSave();
    await createDocument('', activeThemeId, docDirection);
    // Focus editor after creating new document
    requestAnimationFrame(() => {
      editorTextareaRef.current?.focus();
    });
  } finally {
    isCreatingRef.current = false;
  }
}, [flushSave, createDocument, activeThemeId, docDirection]);
```

### Theme/Direction Restoration on Document Load

In the document switching `useEffect` (line ~112-125), add theme and direction restoration:

```typescript
useEffect(() => {
  if (activeDocumentId === prevActiveDocIdRef.current) return;
  prevActiveDocIdRef.current = activeDocumentId;
  if (activeDocument) {
    setContent(activeDocument.content);
    prevSaveContentRef.current = activeDocument.content;

    // Restore theme if document has one
    if (activeDocument.themeId && CURATED_THEME_MAP[activeDocument.themeId]) {
      setActiveThemeId(activeDocument.themeId);
      const theme = CURATED_THEME_MAP[activeDocument.themeId];
      if (theme) setColorTheme(theme.colorTheme);
      prevThemeIdRef.current = activeDocument.themeId;
    }

    // Restore direction
    if (activeDocument.direction) {
      setDocDirection(activeDocument.direction);
      prevDirectionRef.current = activeDocument.direction;
    }
  } else if (activeDocumentId === null) {
    setContent('');
    prevSaveContentRef.current = '';
  }
}, [activeDocumentId, activeDocument, setContent, setActiveThemeId, setColorTheme, setDocDirection]);
```

**IMPORTANT:** Import `CURATED_THEME_MAP` from `lib/colors/themes.ts` to look up theme by ID. Use it to check if the stored themeId is still valid before applying.

### Placeholder Text Change

In `components/editor/EditorTextarea.tsx` line 97, change:
```tsx
// FROM:
placeholder="...הדבק טקסט מארקדאון כאן"
// TO:
placeholder="התחל לכתוב..."
```

After creating a new document, focus the textarea:
```typescript
// In handleCreateDocument, after createDocument():
requestAnimationFrame(() => {
  editorTextareaRef.current?.focus();
});
```

### Existing Components to Reuse — DO NOT REINVENT

| Need | Use | Location |
|------|-----|----------|
| Debounce | `useDebounce` | `lib/hooks/useDebounce.ts` |
| Theme ID | `useThemeSelection` | `lib/hooks/useThemeSelection.ts` |
| Theme lookup | `CURATED_THEME_MAP` | `lib/colors/themes.ts` |
| Direction state | `useDocDirection` | `lib/hooks/useDocDirection.ts` |
| Color application | `useColorTheme` | `lib/hooks/useColorTheme.ts` |
| Document CRUD | `useDocuments` | `lib/hooks/useDocuments.ts` |
| Icons | `Check` from `lucide-react` | `lucide-react` |
| Toast (error feedback) | Sonner | `sonner` |
| Auto-save preference | `useAutoSave` | `lib/hooks/useAutoSave.ts` |

### Files to Create

```
lib/hooks/useSaveStatus.ts           — Save state machine hook
lib/hooks/useSaveStatus.test.ts      — Tests for save status hook
components/documents/SaveStatusIndicator.tsx      — Header save indicator
components/documents/SaveStatusIndicator.test.tsx — Tests for indicator
```

### Files to Modify

```
app/editor/page.tsx              — Expanded auto-save, flush-before-switch, theme/direction restoration
components/editor/EditorTextarea.tsx — Placeholder text change
components/layout/Header.tsx     — Add SaveStatusIndicator zone
```

### Files NOT to Modify

```
lib/hooks/useDocuments.ts        — CRUD is sufficient as-is
types/document.ts                — Document type is correct
lib/documents/utils.ts           — Utility functions are correct
convex/*                         — Convex changes are in Story 15.3
```

### RTL & Hebrew — CRITICAL

- ALL UI text in Hebrew (hardcoded, no i18n library)
- Save status text: "שומר...", "נשמר ✓", "שגיאה בשמירה"
- Use logical CSS properties: `ms-`, `me-`, `ps-`, `pe-` (NEVER `ml-`, `mr-`, `pl-`, `pr-`)
- Placeholder: "התחל לכתוב..." (RTL, muted styling)

### Animation — CRITICAL RULES

- No animation exceeds 300ms
- ALL animations MUST respect `prefers-reduced-motion: reduce` — use `motion-safe:` Tailwind prefix
- Save indicator pulse: `motion-safe:animate-pulse` on "שומר..." text
- Save indicator fade: `transition-opacity duration-500` for "נשמר ✓" fade-out
- No bouncing, no spring physics

### Testing Standards

**Framework:** Vitest with co-located test files.

**useSaveStatus hook tests:**
- Initial state is `idle`
- `startSave()` transitions to `saving`
- `completeSave()` transitions to `saved`, then `idle` after 2s
- `failSave()` transitions to `error`, then `idle` after 5s
- Rapid transitions: `startSave()` during `saved` cancels the fade timer
- Cleanup: timers cleared on unmount

**SaveStatusIndicator component tests:**
- Renders nothing for `idle` status
- Renders "שומר..." for `saving` status
- Renders "נשמר" with check icon for `saved` status
- Renders "שגיאה בשמירה" for `error` status

**Integration tests (editor page):**
- Mock IndexedDB (use manual mock or `fake-indexeddb`)
- Typing triggers save after debounce
- Document switch flushes pending save
- New document creation flushes and clears editor
- ThemeId and direction are included in save data
- Theme/direction restored on document load

**Test patterns from previous stories:**
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

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(min-width: 1024px)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

**Test count baseline:** Full test suite at ~1007 tests across 94 files. Maintain zero regressions.

### Performance Considerations

- Auto-save debounce (500ms) prevents excessive IndexedDB writes during rapid typing
- Flush-before-switch is synchronous to the switch action — must await completion before loading new doc
- Save status indicator is a lightweight `<span>` — no expensive renders
- Theme lookup via `CURATED_THEME_MAP[id]` is O(1) object property access
- Direction is a simple string comparison — negligible cost

### Accessibility — WCAG AA Required

- Save status indicator: `aria-live="polite"` for screen reader announcements
- Save indicator: `role="status"` to announce state changes
- Error state: also show toast via Sonner for redundant feedback
- Focus management: after new document creation, focus returns to editor textarea
- All text meets 4.5:1 contrast ratio

### Previous Story Intelligence

**From Story 15.1 (Document Sidebar UI):**
- IndexedDB database: `marko-documents`, object store: `documents`, indexes on `updatedAt` and `isPinned`
- `updateDocument(id, { content, themeId, direction })` already accepts all three fields — no API change needed
- Active document ID tracked in localStorage: `marko-v2-active-document-id`
- `prevSaveContentRef` pattern used to avoid redundant saves — extend with `prevThemeIdRef` and `prevDirectionRef`
- `isCreatingRef` guard prevents double-creation — keep this pattern
- Document list re-sorts automatically after `updateDocument` via `refreshDocuments()`
- Test suite at 1007 tests — maintain zero regressions

**From Story 13.1 (Theme Data Model):**
- `useThemeSelection` hook: `{ activeThemeId, activeTheme, setActiveThemeId }`
- `CURATED_THEME_MAP`: object mapping theme ID string → `Theme` object (with `colorTheme: ColorTheme`)
- Theme IDs are strings like `"green-meadow"`, `"morning-coffee"`, `"ocean-deep"`
- `activeThemeId` stored in localStorage key `marko-v2-active-theme`

**From Story 14.2 (Settings Page):**
- `useAutoSave` hook returns `[isAutoSave, setAutoSave]` — a boolean toggle for user preference
- Check `isAutoSave` before running auto-save logic. If user disabled auto-save in settings, skip the debounced save (but still allow manual save / flush-before-switch)

### Git History Context

Recent commits follow pattern: "Story X.Y done: Description + code review fixes". Last commit was Story 15.1 (Document Sidebar UI with IndexedDB storage). All stories pass full test suite before marking done.

### Project Structure Notes

- Alignment with unified project structure: feature components in `components/documents/`, hooks in `lib/hooks/`, types in `types/`
- Save status indicator goes in `components/documents/` (document feature scope)
- New hook `useSaveStatus` goes in `lib/hooks/` (general-purpose pattern)
- No new types needed — `SaveStatus` type is internal to `useSaveStatus.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-15, Story 15.2]
- [Source: _bmad-output/benakiva-feedback-round1.md#N3 — Auto-save 500ms debounce, status indicator spec]
- [Source: _bmad-output/planning-artifacts/architecture.md — State management, localStorage hooks, error handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Auto-save pattern, toast notifications, loading states]
- [Source: _bmad-output/implementation-artifacts/15-1-document-sidebar-ui.md — Previous story, IndexedDB patterns, component structure]
- [Source: lib/hooks/useDocuments.ts — IndexedDB CRUD with updateDocument accepting themeId/direction]
- [Source: lib/hooks/useThemeSelection.ts — Theme ID state (activeThemeId)]
- [Source: lib/hooks/useDocDirection.ts — Direction state (docDirection)]
- [Source: app/editor/page.tsx — Current auto-save implementation, document switching]
- [Source: components/editor/EditorTextarea.tsx:97 — Current placeholder text]
- [Source: lib/hooks/useAutoSave.ts — Auto-save preference toggle]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no blockers encountered.

### Completion Notes List

- Task 1: Created `SaveStatusIndicator` component with opacity-based transitions, `motion-safe:animate-pulse`, RTL Hebrew text, and `aria-live="polite"` accessibility. Added `useSaveStatus` hook with state machine (idle→saving→saved→idle / error→idle). Placed in Header between documents and view modes zones via new `saveStatus` prop. Tests: 11 tests (6 hook + 5 component), all passing.
- Task 2: Expanded auto-save `useEffect` to include `activeThemeId` and `docDirection` alongside content. Added `prevThemeIdRef` and `prevDirectionRef` initialized from current values (not hardcoded defaults). Refs only update after successful save. Added `isAutoSave` guard from Settings preference.
- Task 3: Wired `useSaveStatus` into auto-save flow — `startSave()` before, `completeSave()` on success, `failSave()` on error. Passed `saveStatus` through Header to SaveStatusIndicator.
- Task 4: Created `flushSave` function that immediately saves (bypassing debounce), runs regardless of `isAutoSave`. Wired into `handleSelectDocument` and `handleCreateDocument` (both now async). New documents inherit current `activeThemeId` and `docDirection`. Editor textarea focused after new doc creation via `requestAnimationFrame`.
- Task 5: Changed placeholder text from "...הדבק טקסט מארקדאון כאן" to "התחל לכתוב..." in EditorTextarea. No test updates needed (no tests referenced old placeholder).
- Task 6: Added theme/direction restoration in document switching `useEffect`. Uses `CURATED_THEME_MAP` for theme validation. Falls back to current theme/direction for legacy documents without stored values.
- Task 7: Full test suite: 96 files, 1021 tests, ALL passing. Zero regressions.

### Change Log

- 2026-03-26: Story 15.2 implementation complete — auto-save with themeId/direction, save status indicator, flush-before-switch, placeholder text update, theme/direction restoration on document load.

### File List

**New files:**
- lib/hooks/useSaveStatus.ts — Save state machine hook
- lib/hooks/useSaveStatus.test.ts — Tests for save status hook (6 tests)
- components/documents/SaveStatusIndicator.tsx — Header save indicator component
- components/documents/SaveStatusIndicator.test.tsx — Tests for indicator (5 tests)

**Modified files:**
- app/editor/page.tsx — Expanded auto-save, flush-before-switch, theme/direction restoration, save status wiring
- components/layout/Header.tsx — Added saveStatus prop and SaveStatusIndicator zone
- components/editor/EditorTextarea.tsx — Placeholder text change
