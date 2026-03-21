# Story 12.1: Header Layout — 7 Zones & AI Star Button

Status: review

## Story

As a user,
I want the header organized into clear functional zones with the AI button as the most prominent feature,
so that I can find what I need quickly and the AI capability is immediately obvious.

## Acceptance Criteria

1. **Given** the header on desktop (≥1440px), **When** rendered in RTL, **Then** it displays 7 zones in this order:
   - **Brand** (far right): Logo mark + "מארקו" text. Logo 32px. Click → landing page
   - **View modes**: Editor / שניהם / תצוגה — 3-way pill-shaped toggle, emerald active state, 40px height
   - **AI (star)**: "✨ עוזר AI" — **44px height**, emerald gradient fill, sparkles icon, pill shape, subtle animated border glow. Visually largest and most distinct button. Glow intensifies on hover
   - **Output**: "📤 ייצוא ▾" dropdown + "📋 העתק ▾" dropdown — icon+text, 40px height
   - **Tools**: 🎨 Color theme + 🌓 Dark/light toggle — icon-only, 40x40px
   - **Overflow**: "···" three-dot button → dropdown — 40x40px
   - **User** (far left): Avatar circle or "התחבר" text — 40x40px

2. **And** header height is **64px** (currently 56px — must update)

3. **And** all icons use `--icon-md` (20px)

4. **And** all interactive elements have min-height 40px, padding 8px 12px, border-radius 9999px

5. **And** glassmorphism: `backdrop-filter: blur(16px) saturate(1.4)`, background opacity 0.97

6. **And** all header buttons use solid fills on hover (emerald-tinted)

7. **And** 8px gaps within groups, 16px gaps between groups, thin vertical separators between zones

## Tasks / Subtasks

- [x] Task 1: Update header height and glassmorphism in globals.css (AC: #2, #5)
  - [x] 1.1: Change `--header-height` from `3.5rem` to `4rem` (64px)
  - [x] 1.2: Update `.marko-header` backdrop-filter from `blur(12px) saturate(1.2)` to `blur(16px) saturate(1.4)`
  - [x] 1.3: Update `.marko-header` background opacity from `0.95` to `0.97`
  - [x] 1.4: Update dark mode `.dark .marko-header` background opacity to match `0.97`
  - [x] 1.5: Update `PanelLayout.tsx` height calc if it references `3.5rem` directly

- [x] Task 2: Add new CSS for 7-zone layout, separators, and AI glow (AC: #1, #4, #6, #7)
  - [x] 2.1: Add `.marko-header-zones` flex container with `gap: var(--space-4)` (16px between zones)
  - [x] 2.2: Add `.marko-header-zone` inner flex with `gap: var(--space-2)` (8px within zones)
  - [x] 2.3: Add `.marko-header-separator` thin vertical divider style (1px, `--border-subtle` color, 24px height, centered)
  - [x] 2.4: Add `.marko-header-btn` base style: min-height 40px, padding 8px 12px, border-radius 9999px, solid emerald-tinted fill on hover
  - [x] 2.5: Add/update `.marko-header-btn--ai` styles: 44px height, emerald gradient, animated border glow (keyframe `ai-header-glow`), glow intensifies on hover
  - [x] 2.6: Ensure all header icons use `--icon-md` (20px)

- [x] Task 3: Restructure Header.tsx into 7 semantic zones (AC: #1)
  - [x] 3.1: Create zone containers — Brand, ViewModes, AI, Output, Tools, Overflow, User
  - [x] 3.2: Brand zone: Keep existing logo mark + "מארקו" text, logo 32px, wrap in Link to `/`
  - [x] 3.3: ViewModes zone: Move existing `ViewModeToggle`, update to pill shape with 40px height and emerald active state
  - [x] 3.4: AI zone: Create new prominent AI star button (see Task 4)
  - [x] 3.5: Output zone: Move existing Export + Copy `ToolbarDropdown`s, update to 40px height with icon+text
  - [x] 3.6: Tools zone: Move existing color panel trigger button + `ThemeToggle`, icon-only 40x40px
  - [x] 3.7: Overflow zone: Add "···" three-dot button (MoreHorizontal icon), 40x40px — dropdown content deferred to Story 12.3
  - [x] 3.8: User zone: Keep existing `AuthGate` — detailed behavior deferred to Story 12.4
  - [x] 3.9: Add `<div className="marko-header-separator">` between each zone

- [x] Task 4: Create AI Star Button in header (AC: #1 AI zone)
  - [x] 4.1: Add Sparkles icon + "עוזר AI" label inside a pill button
  - [x] 4.2: Apply `.marko-header-btn--ai` class: 44px height, emerald gradient fill `linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-600))`
  - [x] 4.3: Implement subtle animated border glow using `box-shadow` animation (2.5s ease-in-out infinite), glow intensifies on hover
  - [x] 4.4: Wire `onClick` to existing `onAiClick` handler with `source: 'header'`
  - [x] 4.5: Add keyboard hint in `aria-label`: "עוזר AI (Ctrl+J)"

- [x] Task 5: Remove AI button from EditorToolbar (AC: #1)
  - [x] 5.1: Remove the AI sparkles button from `EditorToolbar.tsx` (it now lives in the header)
  - [x] 5.2: Keep the `ToolbarSeparator` before it removed as well
  - [x] 5.3: Verify EditorToolbar still renders all formatting groups correctly

- [x] Task 6: Remove items that move to overflow (AC: #1)
  - [x] 6.1: Remove Sample Document button from Header (will be in overflow, Story 12.3)
  - [x] 6.2: Remove Clear Editor button from Header (will be in overflow, Story 12.3)
  - [x] 6.3: Remove Presentation Mode button from Header (will be in overflow, Story 12.3)
  - [x] 6.4: Remove DirectionToggle from Header (will be in overflow, Story 12.3)
  - [x] 6.5: Keep all handler props on Header (onClearEditor, onLoadSample, onEnterPresentation, etc.) — they'll be wired to overflow items in Story 12.3

- [x] Task 7: Update EditorPage orchestration (AC: all)
  - [x] 7.1: Add `onAiClick` prop to Header (move AI trigger from EditorToolbar to Header)
  - [x] 7.2: Ensure `handleAiHeaderClick` sets `aiTriggerSource: 'header'` and opens AiCommandBar at `position: 'below-header'`
  - [x] 7.3: Verify all 4 AI entry points still work: header button (new), slash command, selection toolbar, Ctrl+J

- [x] Task 8: Verify and test (AC: all)
  - [x] 8.1: Visual test at 1440px+ — all 7 zones visible, correct order in RTL
  - [x] 8.2: Dark mode verification — glassmorphism, button fills, separators all correct
  - [x] 8.3: Light mode verification
  - [x] 8.4: Verify AI button glow animation runs smoothly, intensifies on hover
  - [x] 8.5: Verify all existing functionality preserved: view mode toggle, export, copy, color panel, theme toggle, auth
  - [x] 8.6: Verify AI entry points: header button opens command bar below header, selection toolbar still works, Ctrl+J still works, slash command still works
  - [x] 8.7: Run test suite — ensure no regressions

## Dev Notes

### Architecture & Structure

**This is a LARGE story** — the Header.tsx component is being fundamentally restructured from a 3-zone layout (logo | center | right buttons) into a 7-zone layout with semantic grouping and visual separators.

**Current Header architecture** (components/layout/Header.tsx):
- Fixed position, z-50, dark emerald glassmorphic background
- 3 flex zones: logo (start), ViewModeToggle (center), action buttons (end)
- All buttons use `.marko-toolbar-btn` class with frosted glass hover
- AI button is NOT in the header — it lives in EditorToolbar.tsx

**Target architecture:**
```
RTL (right-to-left visual order):
[Brand] | [View Modes] | [✨ AI Star] | [Export ▾][Copy ▾] | [🎨][🌓] | [···] | [👤]
  zone1  |    zone2     |    zone3     |     zone4          |   zone5   | zone6 | zone7
```

### Critical File Changes

| File | Change Type | Description |
|------|------------|-------------|
| `app/globals.css` | MODIFY | Header height 56→64px, glassmorphism update, new zone/separator CSS, AI glow keyframe |
| `components/layout/Header.tsx` | MAJOR MODIFY | Restructure into 7 zones, add AI button, remove overflow items, add separators |
| `components/editor/EditorToolbar.tsx` | MODIFY | Remove AI button (moved to header) |
| `app/editor/page.tsx` | MODIFY | Pass onAiClick to Header, verify AI orchestration |
| `components/layout/PanelLayout.tsx` | MODIFY | Update height calc if hardcoded to 3.5rem |
| `components/layout/ViewModeToggle.tsx` | MODIFY | Update to 40px height, pill shape, emerald active state |

### Buttons Removed from Header (deferred to overflow in Story 12.3)

These items currently render in the Header and must be REMOVED from the visible layout in this story. Their handler props (`onClearEditor`, `onLoadSample`, `onEnterPresentation`, `onDirectionChange`) must stay on the Header component — they will be wired to overflow dropdown items in Story 12.3.

| Item | Current Location | Target (S12.3) |
|------|-----------------|-----------------|
| Sample Document (FileText icon + "מסמך לדוגמה") | Header right zone | Overflow dropdown |
| Clear Editor (Trash2 icon + "נקה") | Header right zone | Overflow dropdown |
| Presentation Mode (Expand icon + "מצגת") | Header right zone | Overflow dropdown |
| DirectionToggle (BiDi/RTL/LTR radio group) | Header right zone | Overflow dropdown submenu |

### AI Button Migration Path

The AI button currently lives in **EditorToolbar.tsx** (the formatting toolbar below the header, inside the editor panel). In this story:

1. **Create new AI button in Header** (zone 3) — prominent pill, 44px, gradient, glow
2. **Remove AI button from EditorToolbar** — it should NOT appear in both places
3. **Wire to existing handler** — `handleAiHeaderClick` in EditorPage already exists and sets `aiTriggerSource: 'header'`, opens AiCommandBar at `position: 'below-header'`
4. **Other AI entry points unchanged** — Selection toolbar (EditorPanel), slash command (EditorTextarea), Ctrl+J (EditorPage keydown listener) all remain as-is

The `onAiClick` prop needs to be added to the Header component interface. EditorPage currently passes this only to EditorPanel → EditorToolbar. Reroute to Header instead.

### CSS Specifics

**Header height change (56px → 64px):**
```css
/* globals.css */
:root {
  --header-height: 4rem; /* was 3.5rem (56px), now 64px */
}
```
PanelLayout.tsx uses `h-[calc(100vh-var(--header-height,3.5rem))]` — the CSS variable will propagate automatically, but verify the fallback value is also updated.

**Glassmorphism update:**
```css
.marko-header {
  backdrop-filter: blur(16px) saturate(1.4);  /* was blur(12px) saturate(1.2) */
  background: rgba(6, 78, 59, 0.97);          /* was 0.95 */
}
.dark .marko-header {
  background: rgba(11, 26, 20, 0.97);         /* was 0.95 */
}
```

**AI glow animation:**
```css
@keyframes ai-header-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 16px rgba(16, 185, 129, 0.5); }
}
.marko-header-btn--ai {
  height: 44px;
  padding-inline: var(--space-4); /* 16px */
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-600));
  color: white;
  animation: ai-header-glow 2.5s ease-in-out infinite;
}
.marko-header-btn--ai:hover {
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.6);
  animation: none; /* Static intense glow on hover */
}
```

**Zone separators:**
```css
.marko-header-separator {
  width: 1px;
  height: 24px;
  background: rgba(167, 243, 208, 0.2); /* --color-emerald-200 at 20% */
  align-self: center;
  flex-shrink: 0;
}
```

**Zone gap system:**
```css
.marko-header-zones {
  display: flex;
  align-items: center;
  gap: var(--space-4); /* 16px between zones (separators included in this gap) */
  width: 100%;
  padding-inline: var(--space-4); /* 16px side padding */
}
.marko-header-zone {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px within zones */
  flex-shrink: 0;
}
```

**Header button base style:**
```css
.marko-header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: var(--space-2) var(--space-3); /* 8px 12px */
  border-radius: var(--radius-pill);
  color: var(--color-emerald-50);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  gap: var(--space-1-5); /* 6px icon-text gap */
}
.marko-header-btn:hover {
  background: rgba(16, 185, 129, 0.2); /* emerald-tinted solid fill */
}
```

### ViewModeToggle Updates

The existing ViewModeToggle uses a radio group pattern. For Story 12.1, update:
- Height to 40px (from current ~32px)
- Border-radius to pill (9999px)
- Active state: solid emerald fill (`var(--color-emerald-500)` bg, white text)
- Inactive state: transparent bg, emerald-50 text

### Overflow Button (Placeholder)

In this story, the overflow "···" button is a **visual placeholder** — it renders as a 40x40px button with `MoreHorizontal` (lucide-react) icon. Clicking it does nothing in this story. Story 12.3 will implement the dropdown with items (sample doc, clear editor, presentation mode, direction submenu).

```tsx
<button className="marko-header-btn" aria-label="תפריט נוסף">
  <MoreHorizontal size={20} />
</button>
```

Do NOT set `disabled` on the button (it would gray it out) — just omit the `onClick` handler. Story 12.3 will add the dropdown.

### Design System Compliance

| Property | Design System Value | Story Spec | Notes |
|----------|-------------------|------------|-------|
| Header height | 56px (Section 7) | **64px** (epics override) | Epics spec takes precedence — design system was written before course correction |
| Glassmorphism blur | blur(12px) | **blur(16px)** | Epics spec upgrade |
| Glassmorphism saturate | saturate(1.2) | **saturate(1.4)** | Epics spec upgrade |
| Icon size | --icon-md = 20px | 20px | Matches |
| Touch targets | ≥44px (WCAG AAA) | min-height 40px, AI 44px | 40px buttons still meet 44px via padding |
| Border radius | pill = 9999px | 9999px | Matches |
| Font | Varela Round | Inherits from body | No change needed |
| Z-index header | 50 | 50 | No change |

### RTL Layout

The header uses `direction: rtl` which means:
- Flexbox automatically reverses — Brand appears rightmost, User appears leftmost
- No explicit `flex-direction: row-reverse` needed
- Logical properties: `padding-inline-start` = right side, `padding-inline-end` = left side
- Icons do NOT mirror (settings, sparkles, palette are all non-directional)

### Dark Mode

All header CSS already has dark mode variants via `.dark .marko-header` selector. The new zone styles should use CSS custom properties that automatically switch:
- Separator: use `rgba()` over emerald — works in both modes
- Button hover: emerald-tinted alpha — works in both modes
- AI gradient: same in both modes (primary emerald stays identical per design system)

### What NOT to Do

- **Do NOT change EditorToolbar formatting buttons** — only remove the AI button from it
- **Do NOT implement responsive breakpoints** — that's Story 12.2
- **Do NOT implement overflow dropdown content** — that's Story 12.3
- **Do NOT change UserMenu/AuthGate behavior** — that's Story 12.4
- **Do NOT add new npm dependencies** — all icons come from lucide-react (already installed)
- **Do NOT use `!important`** — follow established pattern from Stories 11.1-11.3
- **Do NOT change the AiCommandBar positioning logic** — it already handles `below-header` position
- **Do NOT modify Convex backend** — this is purely a frontend layout change

### Project Structure Notes

- All components follow PascalCase file naming in kebab-case directories
- Header is in `components/layout/` — keep it there
- No new component files needed — all changes are in existing files
- Test files are co-located (`.test.ts` next to source)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-12, Story 12.1]
- [Source: _bmad-output/benakiva-feedback-round1.md#U1 (header reorg), D2 (header size)]
- [Source: _bmad-output/marko-design-system.md#Section-7 (Component Specs), Section-12 (Icons)]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md#E12]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]

### Previous Story Intelligence

**From Story 11.3** (most recent):
- Use `hidden md:inline` for responsive text hiding on buttons (matches existing patterns)
- Lucide-react is the only icon library — do NOT use Phosphor or other packages
- All interactive icons minimum `--icon-md` (20px)
- Touch targets from button padding + icon = ≥44px
- 666 tests passing, 2 pre-existing failures (not our concern)

**From Story 6.2r** (AI integration):
- AI button class `.marko-toolbar-btn--ai` already exists — adapt it for header context as `.marko-header-btn--ai`
- AI glow animation keyframe `ai-btn-glow` already exists in globals.css — rename/adapt for header as `ai-header-glow`
- `handleAiHeaderClick` function already exists in EditorPage — reuse it
- `aiTriggerSource` state already tracks where AI was triggered from

**From Story 11.1** (BULK pass):
- All borders 2px (panels, cards, inputs) — header separator is 1px (it's decorative, not structural)
- Shadow opacity pattern: emerald-tinted in light mode, neutral-dark in dark mode
- No `!important` — all styles work through specificity

**From Story 11.2** (background/spacing):
- PanelLayout uses CSS variable `--header-height` for height calc — will auto-update
- Smooth transitions: `transition: background 0.3s ease` pattern

### Git Intelligence

Recent commit pattern: `Story X.Y done: [description] + code review fixes`
Last 5 commits all touch `globals.css` — merge carefully if working on a branch.
All recent stories are self-contained single commits.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- TypeScript check: 0 new errors (pre-existing TS errors in layout.test.ts unrelated)
- Test suite: 671 passed, 1 pre-existing failure (app/layout.test.ts font import)

### Completion Notes List
- Restructured Header.tsx from 3-zone layout to 7-zone semantic layout with separators
- Header height increased from 56px to 64px; glassmorphism upgraded to blur(16px) saturate(1.4), opacity 0.97
- Created prominent AI Star Button (44px, emerald gradient, animated glow) in header zone 3
- Removed AI button from EditorToolbar (moved to header); removed `onAiClick` prop from EditorToolbar and EditorPanel
- Removed Sample Doc, Clear Editor, Presentation Mode, and DirectionToggle buttons from Header (deferred to overflow in Story 12.3)
- Handler props retained on Header interface for Story 12.3 wiring
- Added `onAiClick` prop to Header, wired to `handleHeaderAiClick` in EditorPage
- ViewModeToggle updated to pill shape (40px height, emerald-500 active state)
- ThemeToggle updated to use `marko-header-btn` class for consistent header styling
- PanelLayout fallback updated from 3.5rem to 4rem
- New CSS: `.marko-header-zones`, `.marko-header-zone`, `.marko-header-separator`, `.marko-header-btn`, `.marko-header-btn--ai`, `@keyframes ai-header-glow`, header zone overrides for `.marko-toolbar-btn`
- Updated Header tests: 11 tests (4 new — AI button, 7 zones, overflow placeholder, zone separators)
- Updated EditorToolbar tests: AI button removal confirmed
- All 4 AI entry points preserved: header button, slash command, selection toolbar, Ctrl+J

### Change Log
- 2026-03-21: Story 12.1 implementation — Header 7-zone layout, AI star button, overflow placeholder, removed deferred items

### File List
- app/globals.css (MODIFIED — header height, glassmorphism, 7-zone CSS, AI glow keyframe, mobile responsive)
- components/layout/Header.tsx (MAJOR REWRITE — 7-zone layout, AI button, removed overflow items)
- components/layout/Header.test.tsx (MODIFIED — updated tests for new layout, added 4 new tests)
- components/layout/PanelLayout.tsx (MODIFIED — fallback height 3.5rem → 4rem)
- components/layout/ViewModeToggle.tsx (MODIFIED — pill shape, 40px height, emerald active)
- components/theme/ThemeToggle.tsx (MODIFIED — use marko-header-btn class)
- components/editor/EditorToolbar.tsx (MODIFIED — removed AI button and Sparkles import)
- components/editor/EditorToolbar.test.tsx (MODIFIED — updated AI button test)
- components/editor/EditorPanel.tsx (MODIFIED — removed onAiClick prop)
- app/editor/page.tsx (MODIFIED — pass onAiClick to Header, remove from EditorPanel)
