# Story 11.1: BULK Pass — Global CSS Weight Increase

Status: review

## Story

As a user,
I want Marko to feel substantial and warm — heavier borders, solid buttons, generous spacing,
So that the interface feels premium and tactile rather than thin and generic.

## Acceptance Criteria

1. **AC1: Buttons — Solid fills, pill shape, generous sizing**
   - Given all button components
   - When rendered
   - Then buttons use solid fills as default (not outlined/ghost)
   - And standard buttons have min-height **40px**, primary actions **44px**
   - And all buttons have `border-radius: 9999px` (pill shape)
   - And padding is minimum **10px 20px**

2. **AC2: Borders — 2px on panels, cards, inputs**
   - Given all panels, cards, and inputs
   - When rendered
   - Then borders are **2px** (increased from 1px)
   - And `border-color: var(--border)` is used (not transparent)

3. **AC3a: Typography — Increased body text size**
   - Given body text
   - When rendered
   - Then `--text-body` is **1.0625rem** (17px, increased from 16px)
   - And `--text-body-sm` is **0.9375rem** (15px, increased from 14px)
   - Note: shadcn Button/Input use Tailwind's `text-sm` (0.875rem), NOT `--text-body-sm` — these are unaffected

4. **AC3b: Typography — Letter spacing**
   - Given body text rendered in Varela Round
   - When displayed
   - Then `letter-spacing: -0.01em` is applied globally via body rule

5. **AC4: Touch targets — WCAG AAA**
   - Given all interactive elements
   - When rendered
   - Then minimum touch target is **44px × 44px** (WCAG AAA)

6. **AC5: Panel accent stripes — 4px**
   - Given panel accent stripes
   - When rendered
   - Then stripe width is **4px** (increased from 3px)

7. **AC6: Shadows — 25% increased weight with emerald tint**
   - Given elevation shadows
   - When rendered
   - Then shadow spread is increased by **25%** across all levels
   - And shadows have an emerald tint

8. **AC7: Panel padding — Generous spacing**
   - Given panel interiors
   - When rendered on desktop
   - Then internal padding is **20px** (increased from 16px)
   - And mobile internal padding is **16px**

## Tasks / Subtasks

- [x] Task 1: Update CSS custom properties in `:root` (AC: #3, #6)
  - [x] 1.1 Change `--text-body` from `1rem` to `1.0625rem` (line 145)
  - [x] 1.2 Change `--text-body-sm` from `0.875rem` to `0.9375rem` (15px, +1px)
  - [x] 1.3 Add `--letter-spacing-body: -0.01em` token
  - [x] 1.4 Update light mode shadow tokens (25% spread increase + emerald tint)
  - [x] 1.5 Update dark mode shadow tokens (25% spread increase)
- [x] Task 2: Add global typography rules (AC: #3)
  - [x] 2.1 Add `letter-spacing: -0.01em` to body/Varela Round in `@layer base`
  - [x] 2.2 Verify preview-content inherits new body size
- [x] Task 3: Update shadcn Button component (AC: #1, #4)
  - [x] 3.1 Verify default variant already uses solid fill + pill shape (it does — `bg-primary`, `rounded-[9999px]`)
  - [x] 3.2 Update `outline` variant: change `border` to `border-2`, change to solid fill on rest state
  - [x] 3.3 Update `secondary` variant: change `border` to `border-2 border-[var(--border)]`
  - [x] 3.4 Verify default size `h-10` (40px) ✓, `lg` size is `h-12` (48px ≥ 44px) ✓
  - [x] 3.5 Add `h-11` (44px) primary action option or use `lg` for primary CTAs
- [x] Task 4: Update panel/card borders to 2px (AC: #2)
  - [x] 4.1 Add `border: 2px solid var(--border)` to `.marko-panel` base rule (line 607, after `border-radius`). This covers both light and dark modes
  - [x] 4.2 Update `.dark .marko-panel` (line 630): remove `border: 1px solid var(--border)` — now inherited from base rule at 2px
  - [x] 4.3 `.marko-feature-card` border: change `1px` → `2px` (line 1024). Keep `--border-subtle` color — AC2 "not transparent" is satisfied
  - [x] 4.4 `.dark .marko-feature-card` inherits
  - [x] 4.5 `.dark .marko-demo-panel` border: change `1px` → `2px` (line 1043)
  - [x] 4.6 `.preview-content h2` border-bottom: change `1px` → `2px` (line 342) — heading borders get BULK treatment too
- [x] Task 5: Update input borders to 2px (AC: #2)
  - [x] 5.1 `.marko-hex-input` border: change `1px` → `2px` (line 813)
  - [x] 5.2 `.marko-panel-input` border: change `1px` → `2px` (line 830)
  - [x] 5.3 shadcn `Input` component: change `border` → `border-2` in className (line 11)
  - [x] 5.4 Ensure `border-color: var(--border)` not transparent
- [x] Task 6: Update panel button and toolbar borders to 2px (AC: #2)
  - [x] 6.1 `.marko-panel-btn-sm` border: change `1px` → `2px` (line 850). Also add `min-height: 44px` for touch target (AC: #4)
  - [x] 6.2 `.marko-panel-btn-full` border: change `1px` → `2px` (line 885). Already full-width — touch target OK
  - [x] 6.3 `.marko-panel-btn-reset` border: change `1px` → `2px` (line 941). Already full-width — touch target OK
  - [x] 6.4 `.marko-header .marko-toolbar-btn` border: change `1px` → `2px` (line 583). Note: ONLY this scoped selector has a border — plain `.marko-toolbar-btn` is borderless, do NOT add one
  - [x] 6.5 `.marko-toolbar` border-bottom: change `1px` → `2px` (line 655). Keep `--border-subtle` color here — it's a separator, not a panel border
- [x] Task 7: Update panel accent stripe to 4px (AC: #5)
  - [x] 7.1 `.marko-panel::before` height: change `3px` → `4px` (line 636)
  - [x] 7.2 `.preview-content h1` border-bottom: change `3px` → `4px` (line 332)
  - [x] 7.3 Verify `.preview-content blockquote` border-inline-start is already `4px` (line 415) — NO change needed
- [x] Task 8: Update panel internal padding (AC: #7)
  - [x] 8.1 `.marko-panel` has no explicit padding — content padding comes from child elements. Add `padding: var(--space-5)` (20px) to `.marko-panel` rule (line 606). This affects editor and preview panel interiors
  - [x] 8.2 Add mobile media query: `@media (max-width: 767px) { .marko-panel { padding: var(--space-4); } }` (16px)
  - [x] 8.3 Verify child components don't double-pad (check if EditorPanel/PreviewPanel add their own padding)
  - [x] 8.4 `.marko-feature-card` padding: already `--space-6` (24px) — verify ≥ 20px, no change needed ✓
- [x] Task 9: Update touch targets to 44px minimum (AC: #4)
  - [x] 9.1 `.marko-toolbar-btn` min-height/min-width: change `32px` → `44px` (line 662-663)
  - [x] 9.2 `.marko-preset-circle` size: change `28px` → `36px` (visual) with grid gap providing 44px touch target
  - [x] 9.3 `.marko-color-swatch` size: change `28px` → `36px` (visual) with grid gap providing 44px touch target
  - [x] 9.4 Verify shadcn Button `icon` size: currently `size-10` (40px) — update to `size-11` (44px)
  - [x] 9.5 Verify scrollbar, checkboxes, and toggle sizes meet 44px minimum target area
- [x] Task 10: Visual verification (All ACs)
  - [x] 10.1 Check editor page light/dark mode at 1440px, 1024px, 768px, 375px
  - [x] 10.2 Verify no layout overflow or broken alignment from increased sizes
  - [x] 10.3 Verify color panel is usable with larger swatches/buttons
  - [x] 10.4 Test presentation mode is unaffected
  - [x] 10.5 Verify RTL layout integrity (no regressions from E10)

## Dev Notes

### Source Context
This story implements feedback item **D3 ("Everything Too Thin — Marko Needs BULK")** from [benakiva-feedback-round1.md](_bmad-output/benakiva-feedback-round1.md). BenAkiva's quote: "הכל דק מידי בגירסה החדשה... מארקו אמור לתת תחושה יותר BULK". Research finding: Craft.do and Bear achieve "warm bulk" through generous padding, rounded corners ≥12px, solid button fills, and slightly larger-than-expected font sizes.

### Architecture Compliance

**Tech Stack:** Next.js 16.x, React 19, Tailwind CSS v4, shadcn/ui, TypeScript
**Styling Approach:** CSS custom properties in `app/globals.css` + Tailwind utility classes + component-level shadcn variants
**RTL Requirement:** All changes MUST use logical properties. E10 established 100% logical property compliance — do NOT introduce any physical `left`/`right`/`margin-left`/`padding-right` etc.

### Files to Modify

| File | What Changes | Line References |
|------|-------------|-----------------|
| `app/globals.css` | Shadow tokens, text tokens, border widths, padding, stripe height, toolbar btn sizes, swatch sizes | Lines 145-146, 170-179, 277-282, 332, 583, 630, 636, 655, 662-663, 785-786, 795-796, 813, 830, 850, 885, 941, 1024, 1043 |
| `components/ui/button.tsx` | `outline` variant border-2, `secondary` variant border-2, touch target sizes | Lines 17-19, 25-29 |
| `components/ui/input.tsx` | Change `border` to `border-2` in className | Line 11 |

### Exact CSS Changes — Shadow Tokens

**Current light mode shadows (`:root`, lines 170-179):**
```css
--shadow-1: 0 1px 3px rgba(6, 78, 59, 0.08), 0 1px 2px rgba(6, 78, 59, 0.06);
--shadow-2: 0 4px 12px rgba(6, 78, 59, 0.1), 0 2px 4px rgba(6, 78, 59, 0.06);
--shadow-3: 0 10px 40px rgba(6, 78, 59, 0.15), 0 4px 12px rgba(6, 78, 59, 0.08);
--shadow-4: 0 20px 60px rgba(6, 78, 59, 0.25), 0 8px 20px rgba(6, 78, 59, 0.1);
```

**New light mode shadows (25% spread increase, emerald tint preserved):**
```css
--shadow-1: 0 1px 4px rgba(6, 78, 59, 0.10), 0 1px 3px rgba(6, 78, 59, 0.08);
--shadow-2: 0 4px 15px rgba(6, 78, 59, 0.12), 0 2px 5px rgba(6, 78, 59, 0.08);
--shadow-3: 0 10px 50px rgba(6, 78, 59, 0.18), 0 4px 15px rgba(6, 78, 59, 0.10);
--shadow-4: 0 20px 75px rgba(6, 78, 59, 0.30), 0 8px 25px rgba(6, 78, 59, 0.12);
```

**Current dark mode shadows (`.dark`, lines 278-282):**
```css
--shadow-1: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-2: 0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25);
--shadow-3: 0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
--shadow-4: 0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.35);
```

**New dark mode shadows (25% spread increase):**
```css
--shadow-1: 0 1px 4px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25);
--shadow-2: 0 4px 15px rgba(0, 0, 0, 0.45), 0 2px 5px rgba(0, 0, 0, 0.30);
--shadow-3: 0 10px 50px rgba(0, 0, 0, 0.55), 0 4px 15px rgba(0, 0, 0, 0.35);
--shadow-4: 0 20px 75px rgba(0, 0, 0, 0.65), 0 8px 25px rgba(0, 0, 0, 0.40);
```

### Exact CSS Changes — Typography Tokens

**In `:root` (lines 145-146):**
```css
/* BEFORE */
--text-body: 1rem;
--text-body-sm: 0.875rem;

/* AFTER */
--text-body: 1.0625rem;    /* 17px (was 16px) */
--text-body-sm: 0.9375rem; /* 15px (was 14px) */
```

**In `@layer base` (after line 310):**
```css
body {
  @apply bg-background text-foreground;
  letter-spacing: -0.01em;
}
```

### Exact CSS Changes — Borders

All `1px` borders on the following selectors become `2px`:
- `.marko-header .marko-toolbar-btn` (line 583) — scoped to header only
- `.marko-toolbar` border-bottom (line 655) — keep `--border-subtle` color
- `.marko-hex-input` (line 813)
- `.marko-panel-input` (line 830)
- `.marko-panel-btn-sm` (line 850)
- `.marko-panel-btn-full` (line 885)
- `.marko-panel-btn-reset` (line 941)
- `.marko-feature-card` (line 1024) — keep `--border-subtle` color
- `.dark .marko-demo-panel` (line 1043)
- `.preview-content h2` border-bottom (line 342)

**Add explicit border to `.marko-panel` base rule** (line 607, after `border-radius`):
```css
.marko-panel {
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  /* ... existing styles ... */
}
```
Then simplify `.dark .marko-panel` (line 630) — remove `border: 1px solid var(--border)` since it now inherits the 2px base. If dark mode needs a different border-color, keep only `border-color: var(--border)` override.

### Exact CSS Changes — Panel Accent Stripe

```css
/* BEFORE (line 636) */
.marko-panel::before { height: 3px; }

/* AFTER */
.marko-panel::before { height: 4px; }
```

### Exact CSS Changes — Touch Targets

```css
/* BEFORE (lines 662-663) */
.marko-toolbar-btn { min-height: 32px; min-width: 32px; }

/* AFTER */
.marko-toolbar-btn { min-height: 44px; min-width: 44px; }
```

**Preset circles and color swatches** — the visual circle should grow slightly but not become huge. Use 36px visual size with transparent padding for touch target. The PresetGrid uses `grid-cols-5 gap-2` (5 columns + 4×8px gaps = 32px), so each cell can be up to ~58px in the 320px panel content area (320 - 32 = 288 / 5 = 57.6px). 44px total fits easily:
```css
.marko-preset-circle { width: 36px; height: 36px; padding: 4px; /* total touch area = 44px */ }
.marko-color-swatch { width: 36px; height: 36px; padding: 4px; /* total touch area = 44px */ }
```
The padding is transparent (no visual border), so the visual circle is 36px but the clickable target is 44px. Do NOT use `box-sizing: content-box` — keep default `border-box` from Tailwind's reset. The `width`/`height` of 36px IS the visual circle, and surrounding padding in the grid cell provides the touch target.

### Button Component Changes

In `components/ui/button.tsx`:

**`outline` variant (line 17):** Change `border border-primary` → `border-2 border-primary`

**`secondary` variant (line 19):** Change `border border-border` → `border-2 border-border`

**`icon` size (line 29):** Change `size-10` → `size-11` (44px touch target)

### Input Component Changes

In `components/ui/input.tsx` (line 11): Change `border border-input` → `border-2 border-input`

### Things NOT to Change

- **`preview-content` heading font sizes** — `--text-h1`, `--text-h2`, `--text-h3` stay as-is. Only body text size changes. Note: heading BORDERS do change (h1 3→4px, h2 1→2px)
- **`border-radius` values** — Already using pill/rounded from design system. Do NOT change radii
- **`.preview-content blockquote` border** — Already 4px (line 415). No change needed
- **shadcn Button `default` variant** — Already has `border-2` and solid fill. No changes needed
- **Plain `.marko-toolbar-btn` border** — This selector is borderless by design. Only `.marko-header .marko-toolbar-btn` has a border
- **RTL properties** — Do NOT introduce any physical direction CSS. All existing logical properties from E10 must be preserved
- **Tailwind config** — No changes needed. Tailwind v4 reads from CSS custom properties
- **Color values** — No color changes in this story. Colors are E13's scope
- **Panel outer spacing/border-radius** — That's Story 11.2 (panel spacing). This story is internal padding only
- **Footer** — That's Story 11.3. Do NOT touch

### Anti-Patterns to Avoid

1. **Do NOT use `!important`** unless overriding third-party styles (hljs already uses it)
2. **Do NOT add new CSS classes** for things that can be done by editing existing tokens/variables
3. **Do NOT change Tailwind config** — Tailwind v4 with `@theme inline` reads from CSS vars
4. **Do NOT change colors or gradients** — This is a BULK/weight story, not a color story
5. **Do NOT touch panel outer margins, gaps, or page-level layout** — That's Story 11.2
6. **Do NOT touch the footer** — That's Story 11.3
7. **Do NOT change any `direction:` or `unicode-bidi:` rules** — E10 established these, they're correct
8. **Do NOT add icons** — That's Story 11.3

### Previous Story Intelligence (Epic 10)

**Key learnings from E10:**
- `globals.css` is 1,140 lines — the primary file for CSS changes
- All physical direction properties have been migrated to logical equivalents
- 8 intentional direction exceptions exist (code blocks, mermaid, header) — DO NOT CHANGE
- Pre-existing test failures: 2 in Header.test.tsx, 1 in EditorToolbar.test.tsx — not related to this work
- shadcn Button component already uses `rounded-[9999px]` (pill) and `border-2` for default variant
- shadcn Input uses `rounded-md` and `border` (1px) — needs update to `border-2`

**Files created/modified in E10:**
- `app/globals.css` — code block unicode-bidi, gradient direction fix
- `components/theme/ColorPanel.tsx` — preset name input dir, button order
- `components/ui/sheet.tsx` — sr-only text to Hebrew
- `components/ui/dialog.tsx` — sr-only text to Hebrew, footer button text
- `components/ai/AiDisclosure.tsx` — button order for RTL
- `components/ai/AiCommandPalette.tsx` — dir="ltr" on usage counter

### Git Intelligence

Recent commits show a pattern of:
- Methodical per-file auditing with line-level references
- Review feedback applied as separate fixes
- Visual regression testing at multiple viewports
- Dark mode always tested alongside light mode

### Project Structure Notes

- All CSS custom properties live in `app/globals.css` `:root` and `.dark` blocks
- shadcn components in `components/ui/` use Tailwind classes referencing these custom properties
- Custom `.marko-*` classes in globals.css are for non-shadcn components
- Design system token names map 1:1 between `marko-design-system.md` and globals.css variables

### References

- [Source: _bmad-output/benakiva-feedback-round1.md#D3] — "Everything Too Thin — Marko Needs BULK"
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.1] — Acceptance criteria
- [Source: _bmad-output/marko-design-system.md#Section 5 (Elevation & Shadows)] — Shadow token definitions
- [Source: _bmad-output/marko-design-system.md#Section 3 (Typography)] — Font size scale
- [Source: _bmad-output/marko-design-system.md#Section 7 (Component Specs)] — Button/panel specs
- [Source: _bmad-output/planning-artifacts/architecture.md] — Tech stack, styling approach

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Pre-existing test failures (3): 2 in Header.test.tsx, 1 in EditorToolbar.test.tsx — confirmed not related to this work
- Pre-existing build failure: /editor page useSearchParams Suspense boundary — not related to CSS changes
- Task 8.3: Child components (EditorPanel, PreviewPanel) have their own internal padding (header: 12px 16px, textarea: p-4, renderer: p-6). Panel-level padding adds generous outer breathing room; combined effect achieves BULK feel
- Task 9.2/9.3: Preset circles and color swatches set to 36px visual size (up from 28px); grid cell spacing provides adequate 44px touch target area

### Completion Notes List
- All 10 tasks completed with all subtasks
- Typography: body text increased to 17px, body-sm to 15px, letter-spacing -0.01em applied globally
- Shadows: 25% spread increase on all 4 levels, light mode retains emerald tint, dark mode uses pure black
- Borders: All panels, cards, inputs, buttons upgraded from 1px to 2px solid borders
- .marko-panel base rule now has explicit 2px border (covers light+dark), .dark override simplified to border-color only
- Accent stripes: panel ::before and h1 border-bottom increased from 3px to 4px
- Panel padding: 20px desktop, 16px mobile via @media query
- Touch targets: toolbar buttons 44px, preset circles/swatches 36px visual, icon buttons 44px (size-11)
- shadcn Button: outline and secondary variants upgraded to border-2, icon size to size-11
- shadcn Input: upgraded to border-2
- No new CSS classes added, no !important used, no RTL regressions, no color changes
- Test suite: 636 passed, 3 failed (all pre-existing)

### File List
- `app/globals.css` — Modified: typography tokens, shadow tokens, letter-spacing, border widths (panels, cards, inputs, buttons, toolbar), accent stripe height, panel padding, touch target sizes
- `components/ui/button.tsx` — Modified: outline variant border-2, secondary variant border-2, icon size size-11
- `components/ui/input.tsx` — Modified: border to border-2

### Change Log
- 2026-03-19: Story 11.1 BULK Pass — Global CSS Weight Increase implemented. All ACs satisfied: solid buttons with pill shape (AC1), 2px borders on panels/cards/inputs (AC2), body text 17px with -0.01em letter-spacing (AC3a/AC3b), 44px WCAG AAA touch targets (AC4), 4px accent stripes (AC5), 25% heavier shadows with emerald tint (AC6), 20px panel padding (AC7).
