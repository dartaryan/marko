# Story 10.2: Component-Level RTL Audit

Status: review

## Story

As a Hebrew user,
I want every panel, modal, dropdown, and tooltip to open and align correctly in RTL mode,
so that I never see misaligned or backwards UI elements.

## Acceptance Criteria

1. **ColorPanel RTL compliance:**
   - Slides from the **right** side (`side="right"`)
   - Close (X) button at **top-left** (uses `end-4` which resolves to left in RTL)
   - All labels right-aligned, hex inputs have `dir="ltr"`
   - User text inputs (preset name) use `dir="auto"`

2. **ExportModal RTL compliance:**
   - Primary action button (Export) on the **left** side in RTL
   - Secondary action (Cancel) on the **right** side in RTL
   - Close (X) at **top-left**
   - Filename input has `dir="auto"`

3. **Directional icon mirroring:**
   - Arrows used for navigation/action direction are mirrored with `transform: scaleX(-1)` when semantically "forward" in LTR context
   - Non-directional icons (X, bold, italic, search, gear, plus, trash, sparkles) are NOT mirrored

4. **Code content & form inputs:**
   - Code blocks, inline code, URLs, hex values use `direction: ltr; text-align: left` (already done in S10.1 globals.css)
   - Code blocks have `unicode-bidi: embed` (already done in S10.1)
   - Hex color inputs use `dir="ltr"` (ColorPicker)
   - User text fields use `dir="auto"` for automatic direction detection

5. **Screen reader / ARIA Hebrew compliance:**
   - All sr-only close button text uses Hebrew "סגור" not English "Close"
   - All interactive elements have Hebrew `aria-label` attributes

6. **Components audited with zero regressions:**
   - ColorPanel.tsx, ExportModal.tsx, ToolbarDropdown.tsx, AiCommandPalette.tsx
   - All landing components (Hero, Features, Demo, Seo)
   - All auth components (AuthButton, UserMenu, AuthGate, UpgradePrompt, DeleteAccountDialog)
   - All layout components (Header, Footer, PanelLayout, DirectionToggle, ViewModeToggle)
   - All editor components (EditorPanel, EditorToolbar, EditorTextarea, FormatButton, MermaidInsertButton)
   - All UI primitives (dialog.tsx, sheet.tsx, alert-dialog.tsx, command.tsx)

## Tasks / Subtasks

- [x] Task 1: Fix user text input dir attributes (AC: #1, #4)
  - [x] 1.1 `components/theme/ColorPanel.tsx:126` — changed `dir="rtl"` to `dir="auto"` on preset name input
  - [x] 1.2 Verified `components/theme/ColorPicker.tsx:47` has `dir="ltr"` on hex input ✓
  - [x] 1.3 Verified `components/export/ExportModal.tsx:100` has `dir="auto"` on filename input ✓

- [x] Task 2: Fix sr-only and ARIA text to Hebrew (AC: #5)
  - [x] 2.1 `components/ui/sheet.tsx:80` — changed sr-only `Close` to `סגור`
  - [x] 2.2 `components/ui/dialog.tsx:76` — changed sr-only `Close` to `סגור`
  - [x] 2.3 `components/ui/dialog.tsx:114` — changed DialogFooter close button text `Close` to `סגור`
  - [x] 2.4 `components/ui/alert-dialog.tsx` — verified: no close X button (uses Action/Cancel pattern), no English sr-only text present ✓

- [x] Task 3: Verify directional icon behavior (AC: #3)
  - [x] 3.1 `components/landing/Hero.tsx:46` — ArrowLeft verified: semantically correct for RTL (left = forward). No mirror needed. Visually verified.
  - [x] 3.2 Audited all lucide icon imports: XIcon, SearchIcon, ChevronDown, Bold, Italic, Strikethrough, List, ListOrdered, ListChecks, Link, ImageIcon, Table2, Minus, Sparkles, Trash2, CreditCard, Languages, FileDown, Palette, Check, Copy, X, FileText. ALL non-directional — no mirroring needed.
  - [x] 3.3 No directional icons found that need mirroring — no changes required.

- [x] Task 4: Verify ColorPanel RTL layout (AC: #1)
  - [x] 4.1 Confirmed `side="right"` on SheetContent (ColorPanel.tsx:78) ✓
  - [x] 4.2 Confirmed close (X) resolves to top-left in RTL via `end-4` in sheet.tsx:78 ✓
  - [x] 4.3 Confirmed `direction: 'rtl'` inline style (ColorPanel.tsx:83) ✓
  - [x] 4.4 Visual verification: color panel opens correctly, X is top-left, labels right-aligned, hex inputs LTR ✓

- [x] Task 5: Verify ExportModal RTL layout (AC: #2)
  - [x] 5.1 Confirmed `dir="rtl"` on DialogContent (ExportModal.tsx:85) ✓
  - [x] 5.2 Confirmed DialogFooter button order: Export (primary, left in RTL) and Cancel (secondary, right in RTL) ✓
  - [x] 5.3 Confirmed close (X) at top-left via `end-4` in dialog.tsx:73 ✓
  - [x] 5.4 Visual verification: export modal buttons correctly placed, filename input bidirectional ✓

- [x] Task 6: Full component audit pass (AC: #6)
  - [x] 6.1 Grepped all .tsx files for physical Tailwind classes — ZERO matches found (all already logical)
  - [x] 6.2 Grepped all .tsx files for physical CSS in inline styles — ZERO matches found
  - [x] 6.3 No physical properties to fix — codebase is 100% logical properties in components
  - [x] 6.4 Tooltips use native `title` attributes — render correctly in RTL automatically ✓

- [x] Task 7: Visual verification across viewports (AC: #6)
  - [x] 7.1 Tested at 1440px desktop: all panels, modals, dropdowns display correctly ✓
  - [x] 7.2 Tested at 768px tablet: responsive layout maintains RTL ✓
  - [x] 7.3 Tested at 375px mobile: mobile layout maintains RTL ✓
  - [x] 7.4 Tested both light and dark modes: RTL correctness maintained ✓

## Dev Notes

### Current RTL State (from Story 10.1)

Story 10.1 completed the **globals.css** logical properties migration. The root `<html dir="rtl" lang="he">` is set. All CSS custom properties in globals.css use logical properties. The codebase is approximately **95% RTL-compliant** at the component level.

### Pre-Audit Findings (from codebase analysis)

The following issues were identified during story creation and need to be fixed:

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| 1 | `components/theme/ColorPanel.tsx` | 126 | Preset name input has `dir="rtl"` | Change to `dir="auto"` |
| 2 | `components/ui/sheet.tsx` | 80 | sr-only text says "Close" | Change to "סגור" |
| 3 | `components/ui/dialog.tsx` | 76 | sr-only text says "Close" | Change to "סגור" |
| 4 | `components/ui/dialog.tsx` | 114 | Close button text says "Close" | Change to "סגור" |

### Components Confirmed Compliant (no changes expected)

These were verified during story creation:

- **ColorPanel.tsx** — `side="right"` ✓, `direction: 'rtl'` inline ✓, close at `end-4` (= top-left in RTL) ✓
- **ExportModal.tsx** — `dir="rtl"` ✓, `dir="auto"` on filename ✓, button order correct via `sm:justify-end` ✓
- **ToolbarDropdown.tsx** — `start-0`, `text-start`, `ms-auto` — all logical ✓
- **AiCommandPalette.tsx** — `dir="rtl"` wrapper ✓, `me-2` for icons ✓
- **ColorPicker.tsx** — `dir="ltr"` on hex input ✓
- **DeleteAccountDialog.tsx** — `dir="rtl"` on confirm input (acceptable: expected input is Hebrew "מחק")
- **PresentationView.tsx** — `start-4 top-4` logical positioning ✓
- **All editor components** — logical properties throughout ✓
- **All auth components** — logical properties ✓
- **Landing components** — logical properties, center-aligned ✓

### Icon Mirroring Decision Guide

**DO mirror** (add `className="rtl:scale-x-[-1]"`):
- Back/forward arrows designed for LTR navigation
- Undo/redo arrows, indent/outdent arrows
- Send/reply arrows, external link arrows
- Sidebar toggle arrows

**DO NOT mirror:**
- X/close, bold, italic, underline, strikethrough
- Star/sparkles, search, settings/gear
- Plus, trash, code symbols, color picker
- ChevronDown (vertical, non-directional)
- Sun, Moon, Copy, FileText, Languages, ListChecks

**Special case — Hero.tsx ArrowLeft:**
The ArrowLeft on the "פתחו את העורך" CTA points LEFT. In RTL, left IS the forward direction. This is semantically correct — it means "go forward to the editor." Do NOT mirror this. Verify visually.

### Architecture Compliance

- **Tailwind logical properties:** `ms-` not `ml-`, `me-` not `mr-`, `ps-` not `pl-`, `pe-` not `pr-`, `start-` not `left-`, `end-` not `right-`, `text-start` not `text-left`, `text-end` not `text-right` [Source: architecture.md#Enforcement Guidelines]
- **shadcn/ui:** RTL configured (`components.json` has `"rtl": true`), Radix primitives natively support RTL [Source: architecture.md#Technology Stack]
- **Hebrew ARIA labels:** All `aria-label` values and sr-only text must be in Hebrew [Source: architecture.md#UI Language Rules]
- **dir attributes:** `dir="ltr"` for code/hex/URL inputs, `dir="auto"` for user text fields, `dir="rtl"` for Hebrew-only UI [Source: epics.md#Story 10.2 AC]

### Project Structure Notes

- All component files are in `components/` organized by feature domain (editor/, preview/, theme/, export/, ai/, auth/, landing/, layout/, ui/)
- UI primitives in `components/ui/` are shadcn-generated — edits here are acceptable for RTL/a11y fixes but should be minimal
- Tailwind CSS v4 with `@import "tailwindcss"` — supports logical properties natively
- `rtl:` Tailwind variant available for RTL-specific overrides (e.g., `rtl:scale-x-[-1]`)

### Library/Framework Requirements

- Next.js 15.x with App Router
- Tailwind CSS v4 (logical properties: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
- shadcn/ui with RTL (`components.json` → `"rtl": true`)
- Radix UI 1.4.3 (native RTL support)
- Lucide React icons (some directional icons need manual mirroring via CSS)

### Testing Requirements

- **Visual:** Open every panel/modal/dropdown in the app and verify RTL alignment
- **ColorPanel:** Opens from right, X at top-left, labels right-aligned, hex inputs LTR
- **ExportModal:** X at top-left, Export button on left, Cancel on right, filename input bidirectional
- **Dropdowns:** ToolbarDropdown and MermaidInsertButton menus open from `start-0` (right in RTL)
- **AiCommandPalette:** All text right-aligned, icons on right side, search input RTL
- **Dark mode:** Verify all RTL fixes work in both light and dark themes
- **Responsive:** Check at 1440px, 768px, 375px viewports

### Previous Story Intelligence (Story 10.1)

**Key learnings:**
- globals.css was already 85-90% migrated to logical properties by WS2 renovation work
- 8 intentional `direction` overrides exist in globals.css (preview=rtl, code=ltr, mermaid=ltr, header=rtl)
- Added `unicode-bidi: embed` and `text-align: left` to code block selectors
- Fixed physical `border-radius` on blockquote and mermaid-error
- Fixed `hr` gradient direction for RTL
- Agent: Claude Opus 4.6 (1M context)

**Files modified in S10.1:** `app/globals.css` only — component files were explicitly out of scope

### Git Intelligence

Recent commit pattern: `Story X.Y done: <description>` format. Last 3 commits:
- `8993490` Story 10.1 done: RTL root setup + globals.css logical properties migration
- `bda388b` WS3 kickoff: course correction, 6 new epics (E10-E15), and Story 10.1 created
- `199009d` WS2 Round 2: Fix design system compliance gaps across all components

### References

- [Source: epics.md#Epic 10, Story 10.2] — Full acceptance criteria and component list
- [Source: architecture.md#Enforcement Guidelines] — 8 rules including logical Tailwind properties
- [Source: architecture.md#UI Language Rules] — Hebrew ARIA labels requirement
- [Source: benakiva-feedback-round1.md#B2] — RTL audit feedback that triggered E10
- [Source: benakiva-feedback-round1.md#B1] — Color panel direction bug report
- [Source: marko-design-system.md#Spacing] — RTL logical property rules
- [Source: 10-1-root-rtl-setup-and-global-css-logical-properties.md] — Previous story learnings

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Playwright visual verification screenshots saved to `screenshots/` (editor-desktop-rtl.png, colorpanel-rtl.png, exportmodal-rtl.png, editor-tablet-768.png, editor-mobile-375.png, editor-dark-mode.png)

### Completion Notes List

- ✅ Task 1: Changed `dir="rtl"` to `dir="auto"` on ColorPanel preset name input. Verified ColorPicker hex input has `dir="ltr"` and ExportModal filename input has `dir="auto"`.
- ✅ Task 2: Changed 3 instances of English "Close" to Hebrew "סגור" in sheet.tsx (sr-only), dialog.tsx (sr-only), and dialog.tsx (DialogFooter button). Verified alert-dialog.tsx has no close X button.
- ✅ Task 3: Audited all 23 lucide icon imports across components. No directional icons need mirroring. ArrowLeft in Hero.tsx is semantically correct for RTL.
- ✅ Task 4: ColorPanel RTL layout verified — side="right", end-4 close button, direction:rtl inline style all correct.
- ✅ Task 5: ExportModal RTL layout verified — dir="rtl", button order correct, end-4 close button.
- ✅ Task 6: Full component audit found ZERO physical Tailwind classes (ml-, mr-, pl-, pr-, left-, right-, text-left, text-right, border-l-, border-r-, rounded-l-, rounded-r-) and ZERO physical CSS inline styles across all components. Codebase is 100% logical properties.
- ✅ Task 7: Visual verification passed at 1440px, 768px, 375px viewports in both light and dark modes.
- ℹ️ 3 pre-existing test failures in Header.test.tsx (2) and EditorToolbar.test.tsx (1) — confirmed pre-existing by running tests on clean main branch state, unrelated to RTL audit changes.

### File List

- `components/theme/ColorPanel.tsx` — changed `dir="rtl"` to `dir="auto"` on preset name input (line 126)
- `components/ui/sheet.tsx` — changed sr-only "Close" to "סגור" (line 80)
- `components/ui/dialog.tsx` — changed sr-only "Close" to "סגור" (line 76), changed DialogFooter button "Close" to "סגור" (line 114)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — updated story status to review

## Change Log

- 2026-03-16: Story 10.2 implemented — 4 code fixes (1 dir attribute, 3 Hebrew translations), full component audit (zero physical properties found), visual verification across 3 viewports + dark mode
