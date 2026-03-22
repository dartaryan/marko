# Story 12.2: Header Responsive Behavior

Status: review

## Story

As a mobile/tablet user,
I want the header to adapt gracefully to smaller screens,
so that essential actions remain accessible without clutter.

## Acceptance Criteria

1. **Given** viewport 1024–1439px, **When** the header renders, **Then** Export/Copy collapse into a single "📤 ▾" dropdown and Tools zone remains icon-only (already icon-only from S12.1).

2. **Given** viewport 768–1023px, **When** the header renders, **Then** only Brand + AI + single output dropdown + overflow + user are visible. View toggle is hidden from header and appears above the editor panels instead (overflow menu integration deferred to Story 12.3).

3. **Given** viewport <768px, **When** the header renders, **Then** only Brand (logo only, no "מארקו" text) + AI button + overflow + user are visible. View toggle appears above editor panels (not in header). A bottom toolbar strip appears above keyboard for formatting.

4. **Given** any responsive breakpoint, **When** zone elements are hidden, **Then** the corresponding separators between hidden zones are also hidden.

5. **Given** any viewport, **When** interacting with visible header elements, **Then** all touch targets remain ≥40px (44px for AI button) and all interactive elements retain pill-shape border-radius.

## Tasks / Subtasks

- [x] Task 1: Replace horizontal scroll with proper responsive CSS (AC: #1, #2, #3, #4)
  - [x] 1.1: Remove the current `@media (max-width: 767px)` rule that enables `overflow-x: auto` on `.marko-header` — this is the old "scroll all zones" approach being replaced
  - [x] 1.2: Add `@media (max-width: 1439px)` rule — hide Export+Copy text labels, show single combined "📤 ▾" output button. Hide Export/Copy individual dropdowns, show a unified output dropdown
  - [x] 1.3: Add `@media (max-width: 1023px)` rule — hide View Modes zone + its separator, hide Tools zone + its separator. View toggle will be rendered elsewhere (Task 3)
  - [x] 1.4: Add `@media (max-width: 767px)` rule — hide brand text "מארקו" (show logo only), hide Output zone + its separator. Only Brand(logo) + AI + Overflow + User visible
  - [x] 1.5: Use CSS classes on separators (e.g., `.marko-header-separator--after-viewmodes`) so they can be hidden at appropriate breakpoints alongside their zones

- [x] Task 2: Create unified output dropdown for tablet breakpoint (AC: #1, #2)
  - [x] 2.1: Create a combined output dropdown component/element that merges Export and Copy into one "📤 ▾" button
  - [x] 2.2: Show individual Export+Copy dropdowns on desktop (≥1440px), show unified dropdown on 1024–1439px, show unified dropdown on 768–1023px
  - [x] 2.3: At <768px, hide all output dropdowns from header entirely (output moves to overflow — Story 12.3 will wire it)
  - [x] 2.4: Unified dropdown menu items: Export PDF, Export HTML, Export Markdown (from Export), then separator, Copy as HTML, Copy as Text (from Copy)

- [x] Task 3: Move View Mode Toggle above editor panels on mobile (AC: #2, #3)
  - [x] 3.1: In `PanelLayout.tsx` (or `EditorPage`), render a `ViewModeToggle` above the panel grid when viewport is ≤1023px
  - [x] 3.2: Style the mobile view toggle bar: full-width, centered, subtle background matching panel area, 48px height, 8px bottom margin
  - [x] 3.3: Use a CSS media query or a `useMediaQuery` hook to conditionally render — prefer CSS `display: none` / `display: flex` approach for no layout shift
  - [x] 3.4: The header's ViewModeToggle should be hidden via CSS at ≤1023px (Task 1.3), and this new one shown — same `viewMode`/`onViewModeChange` props, single source of truth
  - [x] 3.5: At <768px the view toggle is the primary way to switch panels since the grid forces single column

- [x] Task 4: Create mobile bottom toolbar strip (AC: #3)
  - [x] 4.1: Create a fixed-position bottom toolbar component that appears only at <768px
  - [x] 4.2: Content: essential formatting actions (Bold, Italic, Heading, Link, List) — pulled from EditorToolbar's most-used groups
  - [x] 4.3: Position: `fixed`, `bottom: 0`, `inset-inline: 0`, `z-index: 50` (same as header), height `48px`
  - [x] 4.4: Style: same glassmorphic treatment as header — `backdrop-filter: blur(16px) saturate(1.4)`, emerald-tinted background
  - [x] 4.5: Buttons use `.marko-header-btn` base style (min-height 40px, pill shape, emerald hover)
  - [x] 4.6: Only show when editor panel is active (viewMode is 'editor' or 'split'), hide in preview-only mode
  - [x] 4.7: Update PanelLayout to account for bottom toolbar height on mobile — add bottom padding so content isn't obscured
  - [x] 4.8: Ensure bottom toolbar does NOT show in presentation mode

- [x] Task 5: Update Header.tsx component structure for responsive (AC: #1-#5)
  - [x] 5.1: Add semantic CSS classes to each zone container for targeted hiding: `.marko-header-zone--brand`, `.marko-header-zone--viewmodes`, `.marko-header-zone--ai`, `.marko-header-zone--output`, `.marko-header-zone--tools`, `.marko-header-zone--overflow`, `.marko-header-zone--user`
  - [x] 5.2: Add semantic classes to separators for targeted hiding at breakpoints
  - [x] 5.3: Add the unified output dropdown element (Task 2) alongside the existing individual dropdowns, with CSS to toggle visibility
  - [x] 5.4: Brand zone: wrap "מארקו" text in a span with class for hiding at <768px (e.g., `hidden md:inline` or CSS class)

- [x] Task 6: Verify and test all breakpoints (AC: all)
  - [x] 6.1: Visual verification at ≥1440px — all 7 zones visible, full layout unchanged from S12.1
  - [x] 6.2: Visual verification at 1024–1439px — unified output dropdown, Tools icon-only (already), no text labels on output
  - [x] 6.3: Visual verification at 768–1023px — Brand + AI + output dropdown + overflow + user only, view toggle above panels
  - [x] 6.4: Visual verification at <768px — Brand (logo only) + AI + overflow + user, view toggle above panels, bottom toolbar visible
  - [x] 6.5: Dark mode verification at each breakpoint
  - [x] 6.6: RTL layout verification at each breakpoint — flex direction still correct
  - [x] 6.7: Touch target verification — all buttons ≥40px, AI ≥44px at every breakpoint
  - [x] 6.8: Run test suite — no regressions
  - [x] 6.9: Verify presentation mode hides bottom toolbar and shows correctly at all sizes

## Dev Notes

### Architecture & Approach

**Current state:** The header has a basic mobile fallback (`overflow-x: auto` horizontal scroll at <768px) but no proper responsive collapse. All 7 zones are always rendered and visible. This story replaces that scroll behavior with proper progressive collapse at 3 breakpoints.

**Strategy:** CSS-first responsive approach using media queries on semantic zone classes. Avoid JS-based responsive logic where possible — CSS `display: none`/`display: flex` is faster and avoids layout shift. Only use JS (`useMediaQuery` or similar) if conditional rendering is needed for performance (e.g., not mounting the bottom toolbar DOM on desktop).

**Breakpoint mapping:**
| Breakpoint | Tailwind | CSS | Zones Visible |
|------------|----------|-----|---------------|
| ≥1440px | `2xl:` | `min-width: 1440px` | All 7: Brand, ViewModes, AI, Output(2), Tools, Overflow, User |
| 1024–1439px | `lg:` to `2xl:` | `max-width: 1439px` | All 7 but Output collapses to single dropdown |
| 768–1023px | `md:` to `lg:` | `max-width: 1023px` | 5: Brand, AI, Output(1), Overflow, User |
| <768px | below `md:` | `max-width: 767px` | 4: Brand(logo), AI, Overflow, User |

### Critical File Changes

| File | Change Type | Description |
|------|------------|-------------|
| `app/globals.css` | MODIFY | Add responsive media queries for header zones, separators, bottom toolbar |
| `components/layout/Header.tsx` | MODIFY | Add semantic zone classes, unified output dropdown, brand text hiding |
| `components/layout/PanelLayout.tsx` | MODIFY | Add mobile view toggle bar above panels, bottom padding for mobile toolbar |
| `app/editor/page.tsx` | MODIFY | Pass viewMode/onViewModeChange to PanelLayout for mobile view toggle, conditionally render bottom toolbar |
| `components/layout/MobileBottomToolbar.tsx` | NEW | Bottom formatting toolbar for <768px |

### CSS Implementation Details

**Zone hiding pattern — use `max-width` media queries (desktop-first for these overrides):**

```css
/* 1024-1439px: Collapse output */
@media (max-width: 1439px) {
  .marko-header-zone--output .marko-header-output-individual { display: none; }
  .marko-header-zone--output .marko-header-output-unified { display: flex; }
}

/* 768-1023px: Hide ViewModes + Tools zones */
@media (max-width: 1023px) {
  .marko-header-zone--viewmodes,
  .marko-header-separator--after-viewmodes,
  .marko-header-zone--tools,
  .marko-header-separator--after-tools { display: none; }
}

/* <768px: Logo text hidden, Output hidden */
@media (max-width: 767px) {
  .marko-header-brand-text { display: none; }
  .marko-header-zone--output,
  .marko-header-separator--after-output { display: none; }
}
```

**Unified output dropdown default state — hidden on desktop (≥1440px):**
```css
.marko-header-output-unified { display: none; }

@media (max-width: 1439px) {
  .marko-header-output-individual { display: none; }
  .marko-header-output-unified { display: flex; }
}
```

**Mobile view toggle bar (above panels):**
```css
.marko-mobile-view-toggle {
  display: none; /* Hidden on desktop */
}

@media (max-width: 1023px) {
  .marko-mobile-view-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-2);
    /* Uses same ViewModeToggle component, just repositioned */
  }
}
```

**Bottom toolbar strip:**
```css
.marko-mobile-bottom-toolbar {
  display: none; /* Hidden on desktop/tablet */
}

@media (max-width: 767px) {
  .marko-mobile-bottom-toolbar {
    display: flex;
    position: fixed;
    bottom: 0;
    inset-inline: 0;
    z-index: var(--z-header); /* 50 */
    height: 48px;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding-inline: var(--space-3);
    background: rgba(6, 78, 59, 0.97);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    direction: rtl;
  }

  .dark .marko-mobile-bottom-toolbar {
    background: rgba(11, 26, 20, 0.97);
  }
}
```

### Unified Output Dropdown

The unified dropdown replaces the two separate Export and Copy dropdowns at ≤1439px. Implementation approach:

1. Use the existing `ToolbarDropdown` component pattern from Header.tsx
2. Single trigger button: `📤` icon + dropdown chevron, no text label
3. Dropdown content combines both menus with a separator:
   - **Export section:** PDF, HTML, Markdown (use existing `onExportPdf`, `onExportHtml`, `onExportMarkdown` handlers)
   - **Separator**
   - **Copy section:** Copy as HTML, Copy as Text (use existing `onCopyHtml`, `onCopyText` handlers)
4. Section headers inside dropdown: "ייצוא" and "העתקה" as small muted labels

**Important:** The existing individual dropdowns stay in the DOM — they're just hidden via CSS at smaller breakpoints. This avoids duplicating handler wiring. The unified dropdown is always in the DOM too, just hidden at ≥1440px.

### Mobile View Toggle Placement

At ≤1023px, the ViewModeToggle moves from the header to above the panel grid. Implementation:

1. **In PanelLayout.tsx:** Add a wrapper div above the grid container that renders `ViewModeToggle`
2. **CSS-controlled visibility:** `.marko-mobile-view-toggle` is `display: none` by default, `display: flex` at `max-width: 1023px`
3. **Same component instance pattern:** PanelLayout already receives `viewMode` and `onViewModeChange` — pass these to the mobile ViewModeToggle
4. **Styling:** Center the toggle horizontally, give it `margin-bottom: var(--space-2)` (8px), background matching the page background (not glassmorphic — it's part of the content area, not the header)

### Mobile Bottom Toolbar

New component: `components/layout/MobileBottomToolbar.tsx`

**This is the ONLY new file in this story.** Keep it minimal:

```tsx
// Props: onBold, onItalic, onHeading, onLink, onList (or use existing editor command dispatch)
// Render: 5 icon-only buttons using lucide-react icons (Bold, Italic, Heading1, Link, List)
// All buttons use .marko-header-btn class for consistency
// Only visible at <768px via CSS
```

**Integration points:**
- EditorPage passes formatting handlers to MobileBottomToolbar
- These handlers already exist — they're the same ones used by EditorToolbar
- The toolbar dispatches commands to the editor textarea (same mechanism as EditorToolbar)
- Hide in preview-only mode: check `viewMode !== 'preview'`
- Hide in presentation mode: check `!isPresentation`

**PanelLayout bottom padding:** At <768px, add `padding-bottom: 56px` (48px toolbar + 8px buffer) to prevent content from being obscured by the fixed bottom toolbar.

### What NOT to Do

- **Do NOT implement overflow dropdown content** — that's Story 12.3. The overflow button stays as a placeholder
- **Do NOT change UserMenu/AuthGate behavior** — that's Story 12.4
- **Do NOT add new npm dependencies** — all icons from lucide-react, all UI primitives from shadcn/ui (already installed)
- **Do NOT use `!important`** — follow established specificity patterns from S11.1
- **Do NOT use physical CSS properties** (ml-, mr-, pl-, pr-, left, right) — use logical properties only (ms-, me-, ps-, pe-, start, end)
- **Do NOT use JavaScript for breakpoint detection where CSS suffices** — prefer CSS `display: none`/`display: flex` over `useMediaQuery` for hiding/showing zones
- **Do NOT modify the AI button styling or behavior** — it stays the same at all breakpoints (just gets more prominent as other elements hide)
- **Do NOT change the 7-zone DOM structure** — all zones remain in the DOM, CSS controls visibility
- **Do NOT touch Convex backend** — this is purely a frontend layout change
- **Do NOT add `dvh` viewport units yet** — the current `100vh` works; `dvh` can be a follow-up optimization

### Design System Compliance

| Property | Design System Value | Story Spec | Notes |
|----------|-------------------|------------|-------|
| Breakpoints | 768px, 1024px, 1440px | 768px, 1024px, 1440px | Matches |
| Touch targets | ≥44px (WCAG) | min-height 40px, AI 44px | 40px buttons meet 44px via padding |
| Header height | 64px (updated in S12.1) | 64px at all breakpoints | No change |
| Glassmorphism | blur(16px) saturate(1.4) | Same for bottom toolbar | Matches |
| Mobile panel padding | 8px | 8px | Matches |
| Bottom toolbar z-index | N/A (new) | 50 (same as header) | Consistent |
| Font | Varela Round | Inherits from body | No change |

### RTL Considerations

- All responsive changes use **logical properties** — `inset-inline`, `padding-inline`, `margin-inline-start/end`
- Flex direction in the header is controlled by `direction: rtl` on `.marko-header` — this persists at all breakpoints
- The mobile bottom toolbar also sets `direction: rtl`
- Zone order automatically adjusts because flex + RTL reverses visual order
- No `flex-direction: row-reverse` needed at any breakpoint

### Dark Mode

All new CSS must include `.dark` variants:
- Bottom toolbar: `.dark .marko-mobile-bottom-toolbar` with dark emerald bg
- Mobile view toggle bar: inherits from page background (already dark-mode aware)
- All existing header zone styles already have dark variants — hiding zones via `display: none` works identically in both modes

### Accessibility

- Hidden zones must use `display: none` (not `visibility: hidden` or `opacity: 0`) so screen readers skip them
- The mobile view toggle must have the same `aria-label` and keyboard navigation as the header version
- Bottom toolbar buttons need `aria-label` attributes in Hebrew (e.g., `aria-label="מודגש"` for Bold)
- Focus management: when zones are hidden at a breakpoint, ensure focus doesn't get trapped on invisible elements
- `prefers-reduced-motion`: bottom toolbar should not have entrance animations

### Project Structure Notes

- Header is in `components/layout/` — keep all responsive changes there
- New `MobileBottomToolbar.tsx` goes in `components/layout/` alongside Header.tsx
- Test file: `components/layout/MobileBottomToolbar.test.tsx` (co-located)
- All responsive CSS goes in `app/globals.css` alongside existing header styles

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-12, Story 12.2]
- [Source: _bmad-output/benakiva-feedback-round1.md#U1 (responsive behavior), D2 (header size), D4 (panel spacing)]
- [Source: _bmad-output/marko-design-system.md#Section-9 (Breakpoints, Responsive)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive-Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]

### Previous Story Intelligence

**From Story 12.1** (Header 7-zone layout — direct predecessor):
- Header restructured into 7 zones with semantic class `.marko-header-zones`, `.marko-header-zone`, `.marko-header-separator`
- AI button uses `.marko-header-btn--ai` — 44px, gradient, animated glow
- All header buttons use `.marko-header-btn` base class — min-height 40px, pill shape
- Overflow button is a placeholder (no dropdown) — do NOT wire it in this story
- Handler props retained on Header: `onClearEditor`, `onLoadSample`, `onEnterPresentation`, `onDirectionChange` — these are for Story 12.3
- Export/Copy use `ToolbarDropdown` component pattern — reuse for unified dropdown
- ViewModeToggle is already pill-shaped, 40px height, emerald active — reuse as-is in mobile position
- 671 tests passing, 1 pre-existing failure (layout.test.ts font import — ignore)
- Header CSS is at globals.css lines ~559-712 — add responsive rules after existing header styles

**From Story 11.2** (Panel spacing):
- PanelLayout uses `p-2 gap-2 md:p-4 md:gap-4 lg:p-6 lg:gap-6` — already responsive
- Mobile panels force single column via `@media (max-width: 767px) { .marko-panel-grid { grid-template-columns: 1fr !important; } }`
- View mode toggle is needed on mobile to switch between editor/preview since only one panel shows

**From Story 11.3** (Recent patterns):
- Use `hidden md:inline` pattern for responsive text hiding (Tailwind utility approach)
- Lucide-react is the only icon library — Bold, Italic, Heading1, Link, List icons all available
- All interactive icons minimum `--icon-md` (20px)

**From Story 6.2r** (AI actions):
- AI button works at all sizes — no changes needed to AI functionality for responsive

### Git Intelligence

Recent commit pattern: `Story X.Y done: [description] + code review fixes`
Last 5 commits all touch `globals.css` — add responsive rules carefully after existing header section.
All recent stories are self-contained single commits.
Current test count: 671 passing (per S12.1 completion notes).

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Initial build had pre-existing TS error (useRef without null init in page.tsx:74) — not from this story
- CSS rules not loading on first dev server run due to Turbopack HMR caching — resolved by dev server restart

### Completion Notes List
- Replaced old horizontal scroll mobile fallback with 3-tier CSS breakpoint system (1440px, 1024px, 768px)
- Created UnifiedOutputDropdown inline component in Header.tsx — combines Export+Copy with section headers and separator
- Added semantic zone classes (`.marko-header-zone--brand`, `--viewmodes`, `--ai`, `--output`, `--tools`, `--overflow`, `--user`) and separator classes for CSS-targeted hiding
- Wrapped brand text "מארקו" in `.marko-header-brand-text` span for mobile hiding
- Added mobile ViewModeToggle in PanelLayout.tsx — hidden on desktop via `.marko-mobile-view-toggle { display: none }`, shown ≤1023px
- Created MobileBottomToolbar.tsx — 5 icon-only buttons (Bold, Italic, Heading, Link, List), hidden on desktop, shown <768px via CSS
- Bottom toolbar returns null in preview mode (JS) and is not rendered in presentation mode (parent check)
- PanelLayout now accepts `onViewModeChange` and `hasBottomToolbar` props
- All responsive CSS uses logical properties (inset-inline, padding-inline, direction: rtl)
- 10 new unit tests for MobileBottomToolbar, all passing
- 681 total tests passing, 1 pre-existing failure (layout.test.ts font import)
- Visual verification at all 4 breakpoints (1440px, 1200px, 900px, 375px) in both light and dark modes

### Change Log
- Story 12.2 implemented: Header responsive behavior with progressive collapse at 3 breakpoints (Date: 2026-03-21)

### File List
- `app/globals.css` — MODIFIED: Replaced old mobile header scroll CSS with responsive breakpoint rules for zone hiding, unified output toggle, mobile view toggle bar, mobile bottom toolbar
- `components/layout/Header.tsx` — MODIFIED: Added semantic zone/separator classes, brand text wrapper, UnifiedOutputDropdown component, output-individual/unified wrappers
- `components/layout/PanelLayout.tsx` — MODIFIED: Added mobile ViewModeToggle above panel grid, onViewModeChange/hasBottomToolbar props, flex column wrapper
- `app/editor/page.tsx` — MODIFIED: Import MobileBottomToolbar, pass onViewModeChange/hasBottomToolbar to PanelLayout, render MobileBottomToolbar conditionally
- `components/layout/MobileBottomToolbar.tsx` — NEW: Mobile bottom formatting toolbar with 5 icon buttons, hidden in preview mode
- `components/layout/MobileBottomToolbar.test.tsx` — NEW: 10 unit tests for MobileBottomToolbar
