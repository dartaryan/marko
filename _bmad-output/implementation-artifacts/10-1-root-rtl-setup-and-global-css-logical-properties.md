# Story 10.1: Root RTL Setup & Global CSS Logical Properties

Status: done

## Story

As a Hebrew user,
I want all UI elements to correctly respect RTL layout without any left-aligned text that should be right-aligned,
So that the application feels native and professional in Hebrew.

## Acceptance Criteria

1. **Given** the root HTML element **When** the page loads **Then** `<html dir="rtl" lang="he">` is set in `app/layout.tsx`

2. **Given** the global CSS file (`app/globals.css`) **When** audited for physical direction properties **Then**:
   - ALL `text-align: left` are replaced with `text-align: start`
   - ALL `text-align: right` are replaced with `text-align: end`
   - ALL `margin-left` are replaced with `margin-inline-start`
   - ALL `margin-right` are replaced with `margin-inline-end`
   - ALL `padding-left` are replaced with `padding-inline-start`
   - ALL `padding-right` are replaced with `padding-inline-end`
   - ALL `left:` in positioning contexts are replaced with `inset-inline-start:`
   - ALL `right:` in positioning contexts are replaced with `inset-inline-end:`
   - ALL `border-left` are replaced with `border-inline-start`
   - ALL `border-right` are replaced with `border-inline-end`
   - No physical direction properties remain in `globals.css` (except code block exceptions)

3. **Given** code blocks, inline code, URLs, hex values, keyboard shortcuts, file paths **When** rendered in the preview **Then** they always use `direction: ltr; text-align: left` and code blocks have `unicode-bidi: embed`

## Tasks / Subtasks

- [x] Task 1: Verify root RTL setup (AC: #1)
  - [x] 1.1 Confirm `<html dir="rtl" lang="he">` in `app/layout.tsx` (line 70) — already set, verify unchanged
  - [x] 1.2 Confirm Toaster has `dir="rtl"` (line 76) — already set
  - [x] 1.3 Confirm font subsets include Hebrew (Varela Round lines 8-13)

- [x] Task 2: Audit `app/globals.css` for physical direction properties (AC: #2)
  - [x] 2.1 Search for all `text-align: left` and `text-align: right` — replace with `start`/`end` (except code blocks)
  - [x] 2.2 Search for all `margin-left`/`margin-right` — replace with `margin-inline-start`/`margin-inline-end`
  - [x] 2.3 Search for all `padding-left`/`padding-right` — replace with `padding-inline-start`/`padding-inline-end`
  - [x] 2.4 Search for all `left:`/`right:` in positioning contexts — replace with `inset-inline-start:`/`inset-inline-end:`
  - [x] 2.5 Search for all `border-left`/`border-right` — replace with `border-inline-start`/`border-inline-end`
  - [x] 2.6 Search for `float: left`/`float: right` — replace with `float: inline-start`/`float: inline-end`
  - [x] 2.7 Final sweep: grep for any remaining `left`, `right` physical property usage in globals.css

- [x] Task 3: Preserve code content LTR exceptions (AC: #3)
  - [x] 3.1 Verify `.preview-content code:not(pre code)` has `direction: ltr` (line ~388)
  - [x] 3.2 Verify `.preview-content pre` has `direction: ltr` (line ~397)
  - [x] 3.3 Verify `.preview-content pre code` has `direction: ltr` (line ~406)
  - [x] 3.4 Verify `.mermaid-wrapper` has `direction: ltr` (line ~481)
  - [x] 3.5 Ensure `unicode-bidi: embed` is present on code blocks to prevent Hebrew contamination
  - [x] 3.6 Add `text-align: left` (physical, intentional) to all code blocks if not present — this is the one allowed physical property

- [x] Task 4: Visual verification
  - [x] 4.1 Verify editor page renders correctly at 1440px desktop
  - [x] 4.2 Verify preview panel text alignment is correct for Hebrew content
  - [x] 4.3 Verify code blocks render LTR within RTL context
  - [x] 4.4 Verify no visual regressions in dark mode
  - [x] 4.5 Verify header remains visually correct

## Dev Notes

### Current State (Critical Context)

The RTL foundation is **~85-90% complete**. This story is primarily an audit and migration pass, not a greenfield implementation.

**Already done (DO NOT redo):**
- `app/layout.tsx:70` — `<html lang="he" dir="rtl" suppressHydrationWarning>` is already set
- `app/layout.tsx:76` — `<Toaster dir="rtl" position="bottom-center">` is configured
- Varela Round font includes Hebrew subset (lines 8-13)
- JetBrains Mono is Latin-only (correct for code blocks)
- Several logical properties already in use in `globals.css`:
  - `border-inline-start: 4px solid` on blockquotes (line ~411)
  - `padding-inline-start: 1.5rem` on lists (line ~423)
  - `margin-inline: auto` in multiple places (lines ~525, ~779, ~993)
  - `inset-inline: 0` on header (line ~546)
  - `padding-inline: var(--space-2)` on mobile header (line ~1077)

**Needs work — the actual migration targets in `globals.css`:**
- Scan ALL 1,128 lines for any remaining physical properties (`margin-left`, `padding-right`, `border-left`, `left:`, `right:`, etc.)
- The current state uses `text-align: start` in two places (lines ~447, ~879) which is correct but verify no `text-align: left/right` exists elsewhere
- Explicit `direction: rtl/ltr` declarations (11 places) are intentional and should NOT be changed — they are for content-aware styling

### Explicit Direction Declarations (DO NOT CHANGE)

These are **intentional** content-aware direction overrides. They are NOT violations:

| Line | Selector | Direction | Reason |
|------|----------|-----------|--------|
| ~327 | `.preview-content` | `rtl` | Preview renders Hebrew content |
| ~388 | `.preview-content code:not(pre code)` | `ltr` | Inline code is always LTR |
| ~397 | `.preview-content pre` | `ltr` | Code blocks are always LTR |
| ~406 | `.preview-content pre code` | `ltr` | Code in pre blocks is LTR |
| ~481 | `.mermaid-wrapper` | `ltr` | Diagrams flow LTR |
| ~497 | `.mermaid-error` | `rtl` | Error messages in Hebrew |
| ~516 | `.mermaid-error-source` | `ltr` | Code in errors is LTR |
| ~553 | `.marko-header` | `rtl` | Header is Hebrew UI |

### What "Physical Properties" to Replace

Replace these CSS patterns in `globals.css`:

| Physical Property | Logical Replacement |
|---|---|
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `margin-left: X` | `margin-inline-start: X` |
| `margin-right: X` | `margin-inline-end: X` |
| `padding-left: X` | `padding-inline-start: X` |
| `padding-right: X` | `padding-inline-end: X` |
| `left: X` (positioning) | `inset-inline-start: X` |
| `right: X` (positioning) | `inset-inline-end: X` |
| `border-left: X` | `border-inline-start: X` |
| `border-right: X` | `border-inline-end: X` |
| `float: left` | `float: inline-start` |
| `float: right` | `float: inline-end` |

**Exception:** `text-align: left` is ALLOWED inside code block selectors (`.preview-content pre`, `.preview-content code`) because code must always be LTR.

### Architecture Compliance

- **CSS Strategy:** Tailwind CSS v4 with `@import "tailwindcss"` at top of `globals.css`. Custom CSS uses standard CSS properties (not Tailwind utility classes in globals.css)
- **Design System:** `_bmad-output/marko-design-system.md` — states "Text direction: RTL-first"
- **shadcn/ui:** Configured with `rtl: true` in `components.json` — Radix primitives support RTL natively
- **Enforcement rule from architecture:** "Always use Tailwind logical properties for RTL: `ms-4` not `ml-4`, `ps-4` not `pl-4`, `text-start` not `text-left`"
- This story covers `globals.css` only — component-level Tailwind class audit is Story 10.2

### File Structure

Files to modify:
- `app/globals.css` — Main target: CSS logical properties migration (1,128 lines)

Files to verify (read-only):
- `app/layout.tsx` — Confirm root RTL setup unchanged
- `components.json` — Confirm `rtl: true` setting

Files NOT in scope (handled by Story 10.2):
- Individual component `.tsx` files
- Tailwind utility classes in components
- Icon mirroring rules
- Modal/dialog button placement

### Library/Framework Requirements

| Technology | Version | Notes |
|---|---|---|
| Next.js | 15.x | App router with `app/layout.tsx` as root |
| Tailwind CSS | v4 | Supports logical properties natively via `@import "tailwindcss"` |
| shadcn/ui | Latest | RTL configured via `components.json` |
| Radix UI | 1.4.3 | Headless primitives with native RTL support |

### Testing Requirements

- Visual inspection in browser at `http://localhost:3000/editor`
- Verify Hebrew text alignment is correct (right-aligned) across all preview content
- Verify code blocks remain LTR with left alignment
- Verify no visual regressions in both light and dark mode
- Check at desktop (1440px) viewport — mobile/responsive testing is Story 10.3
- No automated test framework changes needed for this story

### Project Structure Notes

- `app/globals.css` is the single source of global CSS — all custom CSS outside of Tailwind utility classes lives here
- The file uses `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"` at the top
- Design tokens are defined in a `@theme inline` block (lines 7-64)
- Dark mode uses `@custom-variant dark (&:is(.dark *))` (line 5)
- Preview content styles are the largest section (~lines 300-530)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 10, Story 10.1]
- [Source: `_bmad-output/benakiva-feedback-round1.md` — B2 (RTL audit), B1 (Color panel direction)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Lines 105, 142, 420, 549 (logical properties enforcement)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Lines 1204-1217 (RTL implementation table)]
- [Source: `_bmad-output/marko-design-system.md` — Line 29 ("RTL-first")]

### Git Intelligence

Recent commits show WS2 visual renovation work. The last 5 commits are all `WS2` CSS/design changes to `globals.css` and components. The dev agent should expect `globals.css` to be actively modified and should work carefully to avoid merge conflicts with any parallel work.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
None — no errors encountered during implementation.

### Completion Notes List
- **Task 1 (AC #1):** Root RTL setup verified intact — `<html lang="he" dir="rtl">` at layout.tsx:70, `<Toaster dir="rtl">` at layout.tsx:76, Varela Round font with `["hebrew", "latin"]` subsets at layout.tsx:10, `components.json` has `"rtl": true`.
- **Task 2 (AC #2):** Full audit of globals.css (1,128 lines) found **zero** remaining physical direction properties. The WS2 renovation work already migrated all properties to logical equivalents: `text-align: start` (lines 447, 879), `margin-inline: auto` (lines 525, 779, 993), `padding-inline-start` (line 423), `padding-inline` (line 1077), `inset-inline: 0` (line 546), `border-inline-start` (lines 411, 493). No `text-align: left/right`, `margin-left/right`, `padding-left/right`, `left:/right:`, `border-left/right`, or `float: left/right` found.
- **Task 3 (AC #3):** Added `unicode-bidi: embed` and `text-align: left` to `.preview-content pre` (line ~397) and `.preview-content pre code` (line ~408). Inline code already had `unicode-bidi: embed` (line 389). All code block selectors now have `direction: ltr`, `unicode-bidi: embed`, and `text-align: left` — ensuring code always renders LTR within the RTL context.
- **Task 4:** Visual verification at 1440px desktop confirmed: Hebrew text right-aligned, code blocks LTR, header RTL, dark mode renders correctly with no regressions. Computed styles verified: `pre` has `direction: ltr`, `text-align: left`, `unicode-bidi: embed`.

### Change Log
- 2026-03-16: Added `unicode-bidi: embed` and `text-align: left` to `.preview-content pre` and `.preview-content pre code` in `app/globals.css`
- 2026-03-16: [Code Review] Fixed physical `border-radius` on blockquote and mermaid-error → logical border-radius properties; fixed `hr` gradient direction for RTL (`90deg` → `to left`)

### File List
- `app/globals.css` — Modified: added `unicode-bidi: embed` and `text-align: left` to code block selectors; fixed physical border-radius and gradient direction
- `app/layout.tsx` — Verified (read-only): root RTL setup confirmed unchanged
- `components.json` — Verified (read-only): `"rtl": true` confirmed
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated: story status ready-for-dev → in-progress → review
