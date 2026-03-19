# Story 11.2: Editor Page Background & Panel Spacing

Status: review

## Story

As a user,
I want the editor page to have a rich emerald gradient background with panels floating like paper on a premium desk,
So that the editing experience feels immersive and polished.

## Acceptance Criteria

1. **AC1: Light mode background — Emerald gradient + noise texture**
   - Given the editor page in light mode
   - When rendered
   - Then the background uses `linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)`
   - And a subtle noise/grain texture overlay is visible (SVG pattern, ~0.02 opacity)

2. **AC2: Dark mode background — Deep emerald gradient**
   - Given the editor page in dark mode
   - When rendered
   - Then the background uses `linear-gradient(135deg, #041F17 0%, #0B1A14 50%, #0F2A1E 100%)`
   - And the same noise/grain texture overlay is visible at ~0.02 opacity
   - Note: Noise in dark mode is not explicit in the epic but added for visual consistency

3. **AC3: Desktop panel spacing (≥1024px)**
   - Given desktop viewport (≥1024px)
   - When panels are rendered
   - Then outer padding is **24px** all sides
   - And gap between panels is **24px**
   - And panels have `border-radius: 24px` (`--radius-3xl`)

4. **AC4: Tablet panel spacing (768–1023px)**
   - Given tablet viewport (768–1023px)
   - When panels are rendered
   - Then outer padding is **16px** all sides
   - And gap between panels is **16px**
   - And panels have `border-radius: 16px` (`--radius-xl`)

5. **AC5: Mobile panel spacing (<768px)**
   - Given mobile viewport (<768px)
   - When panels are rendered
   - Then outer padding is **8px** all sides
   - And gap between panels is **8px**
   - And panels have `border-radius: 12px` (`--radius-lg`)

6. **AC6: Floating paper effect**
   - Given the emerald background
   - When visible in the gaps between panels
   - Then it creates a "floating paper" visual effect — panels appear elevated above the background

7. **AC7: Presentation mode override**
   - Given presentation mode is active
   - Then panels are full-screen, no margins, no border-radius

## Tasks / Subtasks

- [x] Task 1: Replace editor page background gradient (AC: #1, #2)
  - [x] 1.1 In `app/globals.css`, find `.marko-panel-grid` rule (~line 602). Replace `background: linear-gradient(180deg, #e6f7f0 0%, #F0FDF4 50%, #F8FAF9 100%)` with the emerald gradient + inline SVG noise texture using CSS multiple backgrounds:
    ```css
    .marko-panel-grid {
      background:
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E") repeat,
        linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%);
    }
    ```
  - [x] 1.2 In `app/globals.css`, find `.dark .marko-panel-grid` rule (~line 606). Replace `background: var(--background-subtle)` with dark emerald gradient + noise:
    ```css
    .dark .marko-panel-grid {
      background:
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E") repeat,
        linear-gradient(135deg, #041F17 0%, #0B1A14 50%, #0F2A1E 100%);
    }
    ```
  - [x] 1.3 In `components/layout/PanelLayout.tsx` (~line 25), remove `bg-background-subtle` from the className since the CSS gradient now controls the background. The CSS `.marko-panel-grid` rule overrides it anyway, but removing it avoids confusion

- [x] Task 2: Update panel outer spacing in PanelLayout.tsx (AC: #3, #4, #5)
  - [x] 2.1 In `components/layout/PanelLayout.tsx` (~line 25-27), update the responsive Tailwind classes on the grid container. Current → Target:
    - `p-2` → `p-2` (mobile 8px — no change ✓)
    - `gap-3` → `gap-2` (mobile 12px → **8px**)
    - `md:p-3` → `md:p-4` (tablet 12px → **16px**)
    - `md:gap-4` → `md:gap-4` (tablet 16px — no change ✓)
    - `lg:p-4` → `lg:p-6` (desktop 16px → **24px**)
    - `lg:gap-6` → `lg:gap-6` (desktop 24px — no change ✓)
  - [x] 2.2 Final className should be: `marko-panel-grid grid h-[calc(100vh-var(--header-height,3.5rem))] overflow-hidden p-2 gap-2 md:p-4 md:gap-4 lg:p-6 lg:gap-6`

- [x] Task 3: Update panel border-radius responsive values (AC: #3, #4, #5)
  - [x] 3.1 In `app/globals.css`, find `.marko-panel` base rule (~line 610). Change `border-radius: var(--radius-xl)` (16px) → `border-radius: var(--radius-lg)` (**12px** for mobile)
  - [x] 3.2 Find the `@media (min-width: 768px) { .marko-panel { border-radius: ... } }` rule. Change `var(--radius-2xl)` (20px) → `var(--radius-xl)` (**16px** for tablet)
  - [x] 3.3 Verify `@media (min-width: 1024px) { .marko-panel { border-radius: var(--radius-3xl); } }` is **24px** — no change needed ✓

- [x] Task 4: Presentation mode compliance (AC: #7)
  - [x] 4.1 Check `components/preview/PresentationView.tsx` — verified it renders full-screen via `fixed inset-0 z-50`. It does NOT use `.marko-panel` or `.marko-panel-grid` styling, so border-radius/margins do not apply.
  - N/A 4.2 PresentationView does NOT wrap content in `.marko-panel` — no override needed
  - [x] 4.3 PresentationView is a fixed overlay — no CSS changes needed, just verified

- [x] Task 5: Visual verification (All ACs)
  - [x] 5.1 Light mode: verified emerald gradient at 1440px, 768px, 375px via Playwright screenshots
  - [x] 5.2 Dark mode: verified dark emerald gradient at 1440px via Playwright screenshot
  - [x] 5.3 Noise texture: confirmed subtle paper grain overlay at 0.02 opacity
  - [x] 5.4 Floating paper effect: confirmed emerald background visible in gaps between panels in split mode
  - [x] 5.5 Presentation mode: confirmed full-screen overlay with no panel styles applied
  - [x] 5.6 Dark/light toggle: added `transition: background 0.3s ease` to `.marko-panel-grid` — no flash during toggle
  - [x] 5.7 RTL layout: confirmed no regressions — panels float correctly in RTL
  - [x] 5.8 Tested split, editor-only, and preview-only view modes with new spacing — all correct

## Dev Notes

### Source Context

This story implements feedback items **D1 ("Editor Page Background Is Flat and Boring")** and **D4 ("Panel Spacing Too Cramped")** from [benakiva-feedback-round1.md](_bmad-output/benakiva-feedback-round1.md).

- **D1** — BenAkiva: "הרקע באתר המקורי הרבה יותר יפה" — the original site had a rich emerald gradient that made panels feel like floating paper. Current background is a flat mint-to-white gradient that feels generic.
- **D4** — BenAkiva: "המרווחים של העמודים נראים מוזר וצפופים" — panels feel cramped against edges, need generous breathing room.

Research finding: Craft.do achieves the "floating paper on a desk" effect through generous page-level padding, visible background between content cards, and subtle texture.

### Architecture Compliance

**Tech Stack:** Next.js 16.x, React 19, Tailwind CSS v4, shadcn/ui, TypeScript
**Styling Approach:** CSS custom properties in `app/globals.css` + Tailwind utility classes
**RTL Requirement:** All changes MUST use logical properties. E10 established 100% logical property compliance — do NOT introduce any physical `left`/`right`/`margin-left`/`padding-right` etc. Note: `padding` shorthand is RTL-safe (it's not directional). Tailwind `p-*` is also safe.

### Files to Modify

| File | What Changes |
|------|-------------|
| `app/globals.css` | `.marko-panel-grid` light/dark background gradients + noise texture, `.marko-panel` border-radius responsive values |
| `components/layout/PanelLayout.tsx` | Grid container Tailwind classes: gap and padding responsive values, remove `bg-background-subtle` |

### Current State of Key CSS Rules

**`.marko-panel-grid` (~line 602-608 in globals.css):**
```css
/* CURRENT */
.marko-panel-grid {
  background: linear-gradient(180deg, #e6f7f0 0%, #F0FDF4 50%, #F8FAF9 100%);
}
.dark .marko-panel-grid {
  background: var(--background-subtle);
}
```

**`.marko-panel` border-radius (~line 610-625 in globals.css):**
```css
/* CURRENT */
.marko-panel {
  border-radius: var(--radius-xl);    /* 16px */
}
@media (min-width: 768px) {
  .marko-panel { border-radius: var(--radius-2xl); }  /* 20px */
}
@media (min-width: 1024px) {
  .marko-panel { border-radius: var(--radius-3xl); }  /* 24px */
}
```

**PanelLayout.tsx grid className (~line 25-27):**
```tsx
/* CURRENT */
className="marko-panel-grid grid h-[calc(100vh-var(--header-height,3.5rem))]
           overflow-hidden bg-background-subtle p-2 gap-3
           md:p-3 md:gap-4 lg:p-4 lg:gap-6"
```

### CSS Token Reference

| Token | Value | Used For |
|-------|-------|----------|
| `--radius-lg` | 12px | Mobile panel border-radius (NEW) |
| `--radius-xl` | 16px | Tablet panel border-radius |
| `--radius-3xl` | 24px | Desktop panel border-radius (unchanged) |
| `--space-2` / Tailwind `p-2` | 8px | Mobile outer padding |
| `--space-4` / Tailwind `p-4` | 16px | Tablet outer padding |
| `--space-6` / Tailwind `p-6` | 24px | Desktop outer padding |

### Noise Texture Approach

Use CSS multiple backgrounds with an inline SVG `<feTurbulence>` filter. This is a zero-dependency approach — no image files needed. The SVG renders fractal noise in the browser at ~0.02 opacity, creating a subtle grain/paper texture over the gradient.

The inline SVG is URL-encoded and placed as the first background layer. The gradient is the second layer. Both light and dark modes use the same noise SVG — only the gradient colors change.

If the inline SVG causes any rendering issues (unlikely but possible in some browsers), fall back to a plain gradient without the noise layer. The gradient alone still satisfies the core visual requirement.

### Things NOT to Change

- **Panel internal padding** — Already set to 20px desktop / 16px mobile by S11.1. This story changes OUTER spacing (page padding + gap), not inner panel padding
- **Panel borders** — Already 2px solid from S11.1. Do NOT change
- **Shadow tokens** — Already increased 25% from S11.1. Do NOT change
- **Panel accent stripe** — Already 4px from S11.1. Do NOT change
- **Typography/font sizes** — No text changes in this story
- **Touch targets** — No size changes in this story
- **Footer** — That's Story 11.3. Do NOT touch Footer.tsx
- **Icons** — That's Story 11.3. Do NOT add icons
- **Colors** — Do NOT change CSS custom property color values (that's E13). Only the page background gradient changes
- **RTL direction properties** — Do NOT touch any `direction:` or `unicode-bidi:` rules
- **Presentation mode functionality** — Only verify CSS compliance; do not change how PresentationMode.tsx works

### Anti-Patterns to Avoid

1. **Do NOT use `!important`** for background or border-radius overrides
2. **Do NOT add `position: relative` + `::after` pseudo-element** for noise — use CSS multiple backgrounds instead (simpler, no z-index issues)
3. **Do NOT use physical direction Tailwind classes** — `p-2` is safe (shorthand), but never use `pl-*`, `pr-*`, `ml-*`, `mr-*`
4. **Do NOT hardcode pixel values** for border-radius — use `var(--radius-*)` tokens
5. **Do NOT create new CSS classes** for what can be done by editing existing rules
6. **Do NOT change the gradient on the `<main>` element** in `app/editor/page.tsx` — only the `.marko-panel-grid` needs updating. The `<main>` has `bg-background-subtle` which is fine as a fallback behind the grid
7. **Do NOT change panel `box-shadow`** — the existing shadow-3 / shadow-4 hover from S11.1 already creates the elevation effect

### Previous Story Intelligence (S11.1)

**Key learnings from S11.1:**
- `globals.css` is ~1,140 lines — the primary file for CSS changes
- Panel already has 2px borders, 20px internal padding, 4px accent stripe, increased shadows
- shadcn Button/Input already updated with border-2 and 44px touch targets
- Pre-existing test failures: 2 in Header.test.tsx, 1 in EditorToolbar.test.tsx — not related to this work
- Pre-existing build failure: /editor page useSearchParams Suspense boundary — not related to CSS
- All physical direction properties have been migrated to logical equivalents by E10
- 8 intentional direction exceptions exist (code blocks, mermaid, header) — DO NOT CHANGE

**Files modified by S11.1 that overlap:**
- `app/globals.css` — This story modifies different sections (background gradient, border-radius) than S11.1 (tokens, borders, padding, shadows)
- `components/layout/PanelLayout.tsx` — S11.1 did NOT modify this file. This story does

### Git Intelligence

Recent commits:
```
e899f2c Story 11.1 done: BULK pass — global CSS weight increase + BMAD framework restructure
04d8d98 Story 10.3 done: RTL verification pass + code review fixes
6546093 del
cd42ed6 Story 10.1 review fix + Story 10.2 component RTL audit
8993490 Story 10.1 done: RTL root setup + globals.css logical properties migration
```

Patterns observed:
- Methodical per-file changes with line-level references
- Visual regression testing at multiple viewports (1440px, 1024px, 768px, 375px)
- Dark mode always tested alongside light mode
- RTL checked for regressions after every CSS change

### Project Structure Notes

- CSS custom properties: `app/globals.css` `:root` and `.dark` blocks
- Layout components: `components/layout/PanelLayout.tsx` handles the CSS Grid editor/preview split
- Editor page: `app/editor/page.tsx` is the "use client" page component
- Panel wrappers: `EditorPanel.tsx` and `PreviewPanel.tsx` are children within the grid
- Presentation mode: `components/preview/PresentationMode.tsx` renders as a full-screen overlay

### References

- [Source: _bmad-output/benakiva-feedback-round1.md#D1] — "Editor Page Background Is Flat and Boring"
- [Source: _bmad-output/benakiva-feedback-round1.md#D4] — "Panel Spacing Too Cramped"
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.2] — Acceptance criteria and user story
- [Source: _bmad-output/marko-design-system.md#Section 9.3] — Editor page layout specs
- [Source: _bmad-output/marko-design-system.md#Section 9.5] — Panel floating behavior specs
- [Source: _bmad-output/planning-artifacts/architecture.md] — Tech stack, styling approach, file organization

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Pre-existing test failures confirmed (2 Header.test.tsx, 1 EditorToolbar.test.tsx) — not related to this story
- PresentationView.tsx found at `components/preview/PresentationView.tsx` (not PresentationMode.tsx as story spec assumed)

### Completion Notes List

- Replaced flat mint-to-white gradient with rich emerald gradient (135deg) + inline SVG feTurbulence noise texture at 0.02 opacity for both light and dark modes
- Added `transition: background 0.3s ease` to `.marko-panel-grid` for smooth dark/light toggle
- Updated PanelLayout.tsx responsive spacing: mobile gap 12px→8px, tablet padding 12px→16px, desktop padding 16px→24px
- Removed `bg-background-subtle` Tailwind class from PanelLayout grid container (CSS gradient now controls background)
- Updated panel border-radius: mobile 16px→12px (`--radius-lg`), tablet 20px→16px (`--radius-xl`), desktop 24px unchanged
- Verified PresentationView is a fixed overlay (`fixed inset-0 z-50`) that does not inherit panel styles — no CSS override needed
- Visual verification via Playwright at 1440px, 768px, 375px in both light and dark modes — floating paper effect confirmed
- All 3 view modes (split, editor-only, preview-only) tested with new spacing
- RTL layout verified — no regressions
- Test suite: 636 passed, 3 failed (all pre-existing, documented in S11.1 Dev Notes)

### File List

- `app/globals.css` — Modified: `.marko-panel-grid` light/dark background gradients + noise texture + transition; `.marko-panel` base border-radius changed to `--radius-lg`; 768px media query border-radius changed to `--radius-xl`
- `components/layout/PanelLayout.tsx` — Modified: Removed `bg-background-subtle`, updated responsive gap/padding classes (`gap-3`→`gap-2`, `md:p-3`→`md:p-4`, `lg:p-4`→`lg:p-6`)

### Change Log

- 2026-03-19: Implemented Story 11.2 — Editor page background & panel spacing (emerald gradient, noise texture, responsive spacing, border-radius updates)
