# Story 12.3: Overflow Menu & BiDi Simplification

Status: review

## Story

As a user,
I want infrequently used actions tucked into an overflow menu, and text direction control simplified,
so that the header stays clean and I can still access everything when needed.

## Acceptance Criteria

1. **Given** the overflow "···" button is clicked
   **When** the dropdown opens
   **Then** it shows: מסמך לדוגמה (Sample document), נקה עורך (Clear editor), מצגת (Presentation mode), "כיוון טקסט" direction submenu
   **And** direction submenu shows: אוטומטי ✓ | ימין לשמאל | שמאל לימין

2. **Given** the DirectionToggle component
   **When** evaluated
   **Then** it is removed from the header entirely
   **And** default behavior is BiDi auto-detect (already implemented)

3. **Given** the editor panel
   **When** rendered
   **Then** a tiny direction indicator in the bottom-right shows current effective direction ("RTL" or "BiDi")
   **And** clicking it cycles through direction options (auto → rtl → ltr → auto)

## Tasks / Subtasks

- [x] Task 1: Create OverflowMenu component (AC: #1)
  - [x] 1.1 Install shadcn/ui dropdown-menu (`npx shadcn@latest add dropdown-menu`)
  - [x] 1.2 Create `components/layout/OverflowMenu.tsx` with dropdown content
  - [x] 1.3 Add 4 menu items: Sample Document, Clear Editor, Presentation Mode, Direction submenu
  - [x] 1.4 Implement direction submenu with 3 options + checkmark on active
  - [x] 1.5 Wire menu item callbacks to existing handler props
  - [x] 1.6 Style dropdown to match glassmorphism header theme
  - [x] 1.7 Add CSS for overflow dropdown in globals.css

- [x] Task 2: Integrate OverflowMenu into Header (AC: #1, #2)
  - [x] 2.1 Replace placeholder overflow button in Header.tsx with OverflowMenu component
  - [x] 2.2 Pass handler props to OverflowMenu: onLoadSample, onClearEditor, onEnterPresentation, docDirection, onDirectionChange
  - [x] 2.3 Verify header props are already wired in EditorPage (onEnterPresentation, onClearEditor, onLoadSample, onDirectionChange already in HeaderProps interface)

- [x] Task 3: Create DirectionIndicator in editor panel (AC: #3)
  - [x] 3.1 Create `components/layout/DirectionIndicator.tsx` — tiny badge showing "BiDi" / "RTL" / "LTR"
  - [x] 3.2 Add click handler to cycle: auto → rtl → ltr → auto
  - [x] 3.3 Position in bottom-right of editor panel area (absolute, low z-index)
  - [x] 3.4 Add CSS for direction indicator in globals.css
  - [x] 3.5 Integrate into PanelLayout.tsx or EditorPanel.tsx

- [x] Task 4: Clean up DirectionToggle (AC: #2)
  - [x] 4.1 Verify DirectionToggle is NOT imported/rendered anywhere in the current codebase
  - [x] 4.2 Keep `components/layout/DirectionToggle.tsx` file for now (may be useful reference for S14.2 Settings page)
  - [x] 4.3 Add deprecation comment at top of file: "Deprecated by S12.3 — direction control moved to overflow menu and DirectionIndicator"

- [x] Task 5: Tests and verification (AC: #1, #2, #3)
  - [x] 5.1 Add OverflowMenu tests: renders 4 items, direction submenu, keyboard nav, callbacks fire
  - [x] 5.2 Add DirectionIndicator tests: displays correct label, cycles on click
  - [x] 5.3 Update Header tests: overflow zone now renders OverflowMenu instead of placeholder
  - [x] 5.4 Run full test suite, verify no regressions
  - [ ] 5.5 Visual verification: light mode, dark mode, RTL layout, all breakpoints

## Dev Notes

### Architecture Overview

This story wires the overflow "···" button (placeholder since S12.1) to a real dropdown menu, and simplifies direction control by moving it from a dedicated header toggle to a submenu + tiny editor indicator.

**What already exists:**
- Overflow button in Header.tsx zone 6 (line ~240): `<button>` with `MoreHorizontal` icon, no onClick handler
- `HeaderProps` interface (line ~133) already declares: `onEnterPresentation`, `onDirectionChange`, `onClearEditor`, `onLoadSample`, `docDirection`
- These props are passed to Header but **NOT destructured in the component** — the Header component signature (line ~147) only destructures: `viewMode, onViewModeChange, onOpenColorPanel, onExportRequest, onCopyRequest, onAiClick`
- The remaining props (`onEnterPresentation`, `onClearEditor`, `onLoadSample`, `docDirection`, `onDirectionChange`) need to be destructured and passed to OverflowMenu
- `DirectionToggle.tsx` exists at `components/layout/DirectionToggle.tsx` — a radio group (Auto/RTL/LTR) with emerald styling. It was removed from the header in S12.1 and is NOT rendered anywhere currently
- `DocDirection` type exists at `types/editor.ts`: `'rtl' | 'ltr' | 'auto'`
- EditorPage (`app/editor/page.tsx`) already manages `docDirection` state and passes handlers to Header

### Component Design: OverflowMenu

**Recommended approach:** Use shadcn/ui `DropdownMenu` component (Radix-based). It natively supports submenus (`DropdownMenuSub`), proper keyboard navigation, RTL direction, and accessibility.

**Why not continue with custom dropdowns?** The existing Header dropdowns (UnifiedOutputDropdown, ToolbarDropdown) are simple flat menus. The overflow menu requires a **submenu** for direction control. Radix DropdownMenu handles nested submenus, focus trapping, and arrow key navigation natively — building this custom would be error-prone and duplicate Radix's work.

**Installation:** `npx shadcn@latest add dropdown-menu` — this is required before implementation.

**Menu structure:**
```
┌──────────────────────────┐
│ 📄 מסמך לדוגמה           │  → onLoadSample()
│ 🗑️ נקה עורך              │  → onClearEditor()
│ 🖥️ מצגת                  │  → onEnterPresentation()
│ ─────────────────────── │
│ 🔤 כיוון טקסט        ▸  │  → submenu
│   ┌────────────────────┐ │
│   │ ✓ אוטומטי          │ │  → onDirectionChange('auto')
│   │   ימין לשמאל       │ │  → onDirectionChange('rtl')
│   │   שמאל לימין       │ │  → onDirectionChange('ltr')
│   └────────────────────┘ │
└──────────────────────────┘
```

**Icons:** Use lucide-react icons already in the project:
- Sample doc: `FileText`
- Clear editor: `Trash2`
- Presentation: `Maximize` or `Presentation`
- Direction submenu: `Languages` or `Type`
- Submenu items: no icons, checkmark via `DropdownMenuRadioItem`

**Props interface:**
```typescript
interface OverflowMenuProps {
  docDirection: DocDirection;
  onDirectionChange: (dir: DocDirection) => void;
  onLoadSample: () => void;
  onClearEditor: () => void;
  onEnterPresentation: () => void;
}
```

### Component Design: DirectionIndicator

A tiny, unobtrusive badge in the bottom-right corner of the editor area.

**Visual spec:**
- Size: ~24px height, auto width
- Text: "BiDi" (when auto), "RTL" (when rtl), "LTR" (when ltr)
- Style: Semi-transparent background, small font (11px), rounded
- Position: Absolute, bottom-right of editor content area
- Opacity: 0.5 default, 0.9 on hover
- Click/Enter/Space: Cycles through auto → rtl → ltr → auto
- Tooltip: "כיוון טקסט: [current]" (via title attribute)
- Keyboard: Must be focusable (`tabIndex={0}`), activate via Enter or Space

**Placement:** Inside `PanelLayout.tsx` or `EditorPanel.tsx`, positioned relative to the editor panel container. Use `position: absolute; inset-block-end: 8px; inset-inline-end: 8px;` (logical properties).

**Props interface:**
```typescript
interface DirectionIndicatorProps {
  value: DocDirection;
  onChange: (dir: DocDirection) => void;
}
```

### Styling Requirements

**Overflow dropdown styling — add to globals.css:**
- Override shadcn/ui DropdownMenu defaults to match the header's glassmorphism theme
- Background: `rgba(6, 78, 59, 0.97)` with `backdrop-filter: blur(16px) saturate(1.4)`
- Text color: emerald-50/white
- Hover: `rgba(16, 185, 129, 0.2)` background (matches `.marko-header-btn:hover`)
- Separator: 1px, `rgba(167, 243, 208, 0.15)`
- Border-radius: `var(--radius-lg)` or 12px
- Shadow: `0 8px 32px rgba(0,0,0,0.3)`
- The dropdown must have dark mode variants (`.dark` prefix)
- Use custom CSS classes (e.g., `.marko-overflow-menu`) to scope the overrides

**Direction indicator styling:**
- Use a new `.marko-direction-indicator` class
- Muted appearance: small, semi-transparent, non-intrusive
- Must work in both light and dark modes
- Must use logical properties for RTL positioning

### Critical File Changes

| File | Action | Details |
|------|--------|---------|
| `components/layout/OverflowMenu.tsx` | **NEW** | Overflow dropdown with 4 items + direction submenu |
| `components/layout/OverflowMenu.test.tsx` | **NEW** | Tests for menu rendering, callbacks, keyboard nav |
| `components/layout/DirectionIndicator.tsx` | **NEW** | Tiny direction badge for editor panel |
| `components/layout/DirectionIndicator.test.tsx` | **NEW** | Tests for display and click cycling |
| `components/layout/Header.tsx` | MODIFY | Destructure remaining props, replace placeholder with OverflowMenu |
| `components/layout/Header.test.tsx` | MODIFY | Update overflow zone tests |
| `components/layout/PanelLayout.tsx` | MODIFY | Add DirectionIndicator to editor area |
| `app/globals.css` | MODIFY | Add overflow dropdown + direction indicator styles |
| `components/layout/DirectionToggle.tsx` | MODIFY | Add deprecation comment |
| `components/ui/dropdown-menu.tsx` | **NEW** (auto-generated) | Via `npx shadcn@latest add dropdown-menu` |

### What NOT to Do

- Do NOT change UserMenu/AuthGate behavior (Story 12.4)
- Do NOT add navigation items to user menu (Story 12.4)
- Do NOT change AI button styling/behavior
- Do NOT use `!important`
- Do NOT use physical CSS properties (ml-, mr-, pl-, pr-, left, right) — use logical properties only
- Do NOT modify Convex backend
- Do NOT add any dependencies beyond `dropdown-menu` from shadcn
- Do NOT implement the Settings page direction option (Story 14.2)
- Do NOT change the responsive breakpoint behavior from S12.2
- Do NOT delete DirectionToggle.tsx — keep it with deprecation note for potential S14.2 reference

### Project Structure Notes

- New files go in `components/layout/` (consistent with Header, ViewModeToggle, MobileBottomToolbar)
- Auto-generated `components/ui/dropdown-menu.tsx` from shadcn — do not manually edit
- Tests co-located next to components per architecture rules
- All user-facing strings in Hebrew, code identifiers in English
- ARIA labels in Hebrew

### Previous Story Intelligence

**From S12.1 (Header 7-zone layout):**
- Overflow button is a placeholder at line ~240 in Header.tsx with `MoreHorizontal` icon
- Items removed from header: Sample Doc (`FileText`), Clear Editor (`Trash2`), Presentation Mode (`Expand`), DirectionToggle — handler props retained on `HeaderProps` for S12.3 wiring
- Header uses `direction: rtl` on the `<header>` element — dropdowns will inherit RTL direction
- CSS zone class: `.marko-header-zone--overflow`
- Separator class: `.marko-header-separator--after-overflow`
- The `marko-header-btn` class provides the standard 40px min-height, pill-shape styling

**From S12.2 (Responsive behavior):**
- Overflow zone is visible at ALL breakpoints (never hidden by responsive CSS)
- At `<768px`: overflow is one of only 4 visible zones (Brand logo, AI, Overflow, User)
- ViewModes may move into overflow on tablet — but this is NOT in scope for S12.3; responsive visibility is handled purely by CSS hiding
- 681 total tests passing (1 pre-existing failure in `layout.test.ts` font import)

**From S12.1 completion notes — code patterns established:**
- Custom dropdown pattern: `useState(false)` + container ref + outside-click + keyboard nav
- CSS animations: `.animate-slide-down` for dropdown opening
- Zone separator: `<ZoneSeparator className="..." />` helper component in Header.tsx
- All header buttons: `.marko-header-btn` class
- Dark mode: CSS `.dark .marko-header` selector prefix

### Git Intelligence

Recent commit pattern: Single large commit per story with code review fixes. Latest commits:
- `6694cc2` Story 12.2 done: Header responsive behavior + code review fixes
- `63bce35` Story 12.1 done: Header 7-zone layout, AI star button + code review fixes
- `0c67a3b` Story 11.3 done: Remove footer and icon enrichment + code review fixes

All recent work is in the same files this story will touch (Header.tsx, globals.css, PanelLayout.tsx). No merge conflicts expected since this builds directly on S12.2.

### Technical Stack Reference

- **Framework:** Next.js 16.x, React 19.x, TypeScript strict
- **UI Components:** shadcn/ui (Radix primitives), Tailwind CSS v4
- **Icons:** lucide-react v0.577.0
- **Radix UI:** radix-ui v1.4.3 (unified package)
- **Testing:** Vitest (unit), co-located test files
- **CSS:** Tailwind logical properties, CSS custom properties, BEM-like custom classes
- **RTL:** `dir="rtl"` on `<html>`, logical properties throughout, Radix handles dropdown alignment

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 12, Story 12.3]
- [Source: _bmad-output/benakiva-feedback-round1.md — U3 BiDi Simplification, U1 Header Reorganization]
- [Source: _bmad-output/planning-artifacts/architecture.md — Enforcement Guidelines, Component Structure, RTL Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Dropdown Patterns, RTL Layout Rules]
- [Source: _bmad-output/implementation-artifacts/12-1-header-layout-7-zones-and-ai-star-button.md — Overflow placeholder, removed items]
- [Source: _bmad-output/implementation-artifacts/12-2-header-responsive-behavior.md — Responsive visibility, overflow always visible]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Initial OverflowMenu tests failed: Radix DropdownMenu uses pointer events, not click. Fixed by dispatching `pointerdown` events in tests.

### Completion Notes List
- ✅ Task 1: Created OverflowMenu component using shadcn/ui DropdownMenu (Radix-based) with 4 menu items + direction submenu with radio items and checkmark indicator
- ✅ Task 2: Integrated OverflowMenu into Header, destructured all remaining props (onEnterPresentation, docDirection, onDirectionChange, onClearEditor, onLoadSample), replaced placeholder button
- ✅ Task 3: Created DirectionIndicator component (tiny badge, click-to-cycle, keyboard accessible, logical CSS properties), integrated into PanelLayout with new optional props
- ✅ Task 4: Verified DirectionToggle is not imported anywhere, added deprecation comment
- ✅ Task 5: Added 19 new tests (7 OverflowMenu + 12 DirectionIndicator), updated 1 Header test. Full suite: 701 tests pass, 0 new failures (1 pre-existing layout.test.ts font import failure)

### Implementation Plan
- Used shadcn/ui DropdownMenu with DropdownMenuSub for direction submenu (Radix handles RTL, keyboard nav, focus trapping natively)
- DirectionIndicator placed in PanelLayout editor panel div (position: relative on parent, absolute on indicator using logical properties)
- All CSS scoped via `.marko-overflow-menu` and `.marko-direction-indicator` classes with dark mode support
- No `!important`, no physical CSS properties — all logical properties

### File List
- components/layout/OverflowMenu.tsx — **NEW** — Overflow dropdown with 4 items + direction submenu
- components/layout/OverflowMenu.test.tsx — **NEW** — 7 tests for menu rendering and trigger behavior
- components/layout/DirectionIndicator.tsx — **NEW** — Tiny direction badge for editor panel
- components/layout/DirectionIndicator.test.tsx — **NEW** — 12 tests for display, cycling, keyboard, accessibility
- components/layout/Header.tsx — MODIFIED — Import OverflowMenu, destructure remaining props, replace placeholder
- components/layout/Header.test.tsx — MODIFIED — Updated overflow zone test description
- components/layout/PanelLayout.tsx — MODIFIED — Import DirectionIndicator, add docDirection/onDirectionChange props, render in editor panel
- app/editor/page.tsx — MODIFIED — Pass docDirection and onDirectionChange to PanelLayout
- app/globals.css — MODIFIED — Added .marko-overflow-menu and .marko-direction-indicator CSS (light + dark)
- components/layout/DirectionToggle.tsx — MODIFIED — Added deprecation comment
- components/ui/dropdown-menu.tsx — **NEW** (auto-generated by shadcn)

### Change Log
- 2026-03-22: Story 12.3 implementation complete — OverflowMenu with 4 items + direction submenu, DirectionIndicator in editor panel, DirectionToggle deprecated. 19 new tests added, 701 total passing.
