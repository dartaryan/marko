# Story 13.3: Accent Customizer & Advanced Mode

Status: done

## Story

As a user who wants to personalize beyond the curated themes,
I want an accent color picker and access to individual color overrides,
So that I can fine-tune my document appearance.

## Acceptance Criteria

1. **Accent customizer section** ("התאמה אישית"): Below the theme gallery grid, a collapsible section labeled "התאמה אישית" (Customize) with a Paintbrush icon. When expanded, shows an HSL color wheel for selecting one accent color. The system auto-generates complementary tints/shades from the chosen accent, producing a full 17-property `ColorTheme`. A live **WCAG contrast ratio** indicator shows the contrast between generated body text and background (minimum 4.5:1 for body text; show warning if violated).

2. **Advanced mode** ("מתקדם"): A collapsible toggle labeled "מתקדם" (Advanced). When expanded, reveals the 16 individual color pickers (the 4 current SECTIONS: Text, Headings, Backgrounds, Accents). The image color extractor is moved here (from its current position in the default view). This section is hidden/collapsed by default.

3. **Reset button**: The existing "איפוס לברירת מחדל" (Reset to Default) button remains at the bottom. When clicked, all colors reset to the **current active curated theme's** defaults (not always Green Meadow — if user selected Sea of Galilee then committed, reset goes back to that). If no curated theme is active, falls back to Green Meadow.

4. **Panel layout order** (top to bottom): Theme gallery (PresetGrid curated cards) → Legacy presets (collapsible) → Custom presets → Save preset form → **"התאמה אישית" (Accent Customizer)** → **"מתקדם" (Advanced: individual pickers + image extraction)** → Reset button.

5. **RTL & Hebrew**: All text in the panel is right-aligned. All labels in Hebrew. Hex color inputs use `dir="ltr"`. The HSL wheel works correctly in RTL layout.

6. **No new dependencies** if possible: Implement the HSL wheel using a native `<canvas>` element or a lightweight custom component. If the implementation is significantly simpler with `react-colorful` (~3KB gzipped), that is acceptable, but prefer zero-dependency first. Do NOT add heavy libraries like `react-color` (~40KB).

## Tasks / Subtasks

- [x] Task 1: Create accent color generation utility (AC: #1)
  - [x] 1.1 Create `lib/colors/accent-generator.ts` with `generateThemeFromAccent(hslAccent: {h: number, s: number, l: number}): ColorTheme`
  - [x] 1.2 Algorithm: derive all 17 properties from a single HSL accent — headings use the accent hue at varying lightness, backgrounds use very light tints, text uses near-black desaturated variant, code/borders use muted variants
  - [x] 1.3 Create `lib/colors/contrast.ts` with `getContrastRatio(hex1: string, hex2: string): number` and `meetsWCAG_AA(textHex: string, bgHex: string): boolean`
  - [x] 1.4 HSL ↔ hex conversion helpers: `hslToHex`, `hexToHsl` in `lib/colors/color-utils.ts`
  - [x] 1.5 Unit tests for accent generation, contrast calculation, and color conversions

- [x] Task 2: Create HSL color wheel component (AC: #1, #5)
  - [x] 2.1 Create `components/theme/HslWheel.tsx` — canvas-based circular HSL wheel (hue on angle, saturation on radius) with a lightness slider below
  - [x] 2.2 Render the wheel on a `<canvas>` element (~180px diameter). User clicks/drags to pick hue + saturation. A separate range slider controls lightness
  - [x] 2.3 Show current color as a hex value below the wheel (editable, `dir="ltr"`)
  - [x] 2.4 Emit `onChange(hsl: {h, s, l})` on every interaction
  - [x] 2.5 Ensure canvas interactions work in RTL layout (pointer math is absolute, not affected by direction)
  - [x] 2.6 Unit tests for HslWheel rendering and interaction

- [x] Task 3: Create WCAG contrast indicator component (AC: #1)
  - [x] 3.1 Create `components/theme/ContrastIndicator.tsx` — shows the contrast ratio between generated primaryText and previewBg
  - [x] 3.2 Display format: "ניגודיות: 7.2:1 ✓" (pass) or "ניגודיות: 3.1:1 ⚠" (fail, < 4.5:1)
  - [x] 3.3 Pass state uses `text-[var(--success)]`, fail state uses `text-[var(--warning)]`
  - [x] 3.4 Unit tests

- [x] Task 4: Create AccentCustomizer section component (AC: #1)
  - [x] 4.1 Create `components/theme/AccentCustomizer.tsx` — collapsible section with HslWheel + ContrastIndicator
  - [x] 4.2 On accent change: call `generateThemeFromAccent()`, feed result to `onThemeChange` (persists immediately, same as clicking a theme card)
  - [x] 4.3 Clear `activeThemeId` and `activePreset` when accent customizer is used (it's a manual customization)
  - [x] 4.4 Section header: Paintbrush icon + "התאמה אישית" label, collapsible with ChevronDown animation (same pattern as legacy presets toggle)
  - [x] 4.5 Section starts collapsed by default

- [x] Task 5: Restructure ColorPanel layout — Advanced mode (AC: #2, #4)
  - [x] 5.1 Wrap the 4 individual color picker SECTIONS + ImageColorExtractor inside a collapsible "מתקדם" (Advanced) section
  - [x] 5.2 Section header: Settings icon + "מתקדם" label, collapsible with ChevronDown animation
  - [x] 5.3 Section starts collapsed by default
  - [x] 5.4 Move ImageColorExtractor from its current location to inside the Advanced section (above the 4 color picker groups)
  - [x] 5.5 Move "שמור נושא נוכחי..." (save preset) form to remain above the accent customizer (part of the PresetGrid area, not inside Advanced)

- [x] Task 6: Update reset button behavior (AC: #3)
  - [x] 6.1 Reset to the **committed curated theme** if one is active (use `activeThemeId` to look up in `CURATED_THEME_MAP`), otherwise fall back to Green Meadow
  - [x] 6.2 Reset should also collapse the accent customizer and advanced sections

- [x] Task 7: Tests (AC: all)
  - [x] 7.1 AccentCustomizer integration tests: section collapses/expands, accent change generates theme, WCAG indicator updates
  - [x] 7.2 ColorPanel layout tests: verify section order (gallery → legacy → custom → save → accent → advanced → reset)
  - [x] 7.3 Advanced mode tests: section collapses/expands, image extractor is inside, color pickers are inside
  - [x] 7.4 Reset button tests: resets to active curated theme, falls back to Green Meadow
  - [x] 7.5 Ensure all 762 existing tests still pass (zero regressions) — 824 total tests pass (762 existing + 62 new)

## Dev Notes

### Architecture Compliance

- **Framework**: React 19.2, Next.js 16.1, TypeScript strict mode
- **UI library**: shadcn/ui (Sheet, radix-ui primitives) — panel chrome stays the same
- **Styling**: Tailwind v4 with CSS logical properties for RTL (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `border-s`, `border-e`, `inset-inline`)
- **State**: Custom hooks + useLocalStorage (no Redux/Zustand)
- **CSS vars**: Theme colors applied via `applyColorTheme()` in `lib/colors/apply-colors.ts` — NO changes to this function
- **Icons**: Lucide React only (`Paintbrush`, `Settings`, `ChevronDown` already available) — NO emojis in component code
- **RTL**: `direction: 'rtl'` on SheetContent, all labels in Hebrew, hex inputs `dir="ltr"`
- **ARIA**: Hebrew aria-labels on all interactive elements, collapsible sections use `aria-expanded`
- **Testing**: Vitest, co-located test files
- **No `!important`** in CSS, no physical directional properties

### Existing Files to Modify

| File | Change Scope |
|------|-------------|
| `components/theme/ColorPanel.tsx` | **MAJOR** — Restructure layout: wrap individual color pickers + image extractor in collapsible "מתקדם" section. Add AccentCustomizer section between save-preset form and Advanced section. Update reset button to use active curated theme. |
| `components/theme/ColorPanel.test.tsx` | **MODERATE** — Update tests for new layout order, add tests for accent/advanced section collapse, reset behavior. |

### New Files to Create

| File | Purpose |
|------|---------|
| `lib/colors/accent-generator.ts` | `generateThemeFromAccent(hsl)` — derives 17-property ColorTheme from single accent |
| `lib/colors/accent-generator.test.ts` | Unit tests for accent generation algorithm |
| `lib/colors/contrast.ts` | `getContrastRatio()`, `meetsWCAG_AA()` — WCAG contrast utilities |
| `lib/colors/contrast.test.ts` | Unit tests for contrast calculation |
| `lib/colors/color-utils.ts` | `hslToHex()`, `hexToHsl()` — color space conversion helpers |
| `lib/colors/color-utils.test.ts` | Unit tests for color conversions |
| `components/theme/HslWheel.tsx` | Canvas-based HSL color wheel with lightness slider |
| `components/theme/HslWheel.test.tsx` | Unit tests for HslWheel component |
| `components/theme/ContrastIndicator.tsx` | WCAG contrast ratio display |
| `components/theme/ContrastIndicator.test.tsx` | Unit tests for ContrastIndicator |
| `components/theme/AccentCustomizer.tsx` | Collapsible section wrapping HslWheel + ContrastIndicator |
| `components/theme/AccentCustomizer.test.tsx` | Integration tests for AccentCustomizer |

### Accent Generation Algorithm — Implementation Detail

The `generateThemeFromAccent()` function takes one HSL color and derives all 17 `ColorTheme` properties:

```typescript
// lib/colors/accent-generator.ts
export function generateThemeFromAccent(accent: { h: number; s: number; l: number }): ColorTheme {
  const { h, s } = accent;
  // Use the accent hue (h) as the base for all generated colors.
  // Vary saturation and lightness to create the full palette.
  return {
    // Text — near-black with subtle hue tint
    primaryText: hslToHex(h, Math.min(s, 10), 15),      // very dark, barely tinted
    secondaryText: hslToHex(h, Math.min(s, 8), 40),     // medium gray, subtle tint
    link: hslToHex(h, Math.max(s, 60), 40),             // saturated accent for links
    code: hslToHex((h + 300) % 360, 50, 45),            // complementary hue for code

    // Headings — accent at varying lightness
    h1: hslToHex(h, Math.max(s, 50), 25),               // darkest heading
    h1Border: hslToHex(h, Math.max(s, 60), 45),         // accent-level border
    h2: hslToHex(h, Math.max(s, 45), 32),               // slightly lighter
    h2Border: hslToHex(h, Math.max(s, 50), 55),         // lighter border
    h3: hslToHex(h, Math.max(s, 40), 38),               // lightest heading

    // Backgrounds — very light tints of accent hue
    previewBg: hslToHex(h, Math.min(s, 20), 98),        // near-white with hue tint
    codeBg: hslToHex(h, Math.min(s, 10), 96),           // very light code bg
    blockquoteBg: hslToHex(h, Math.min(s, 25), 96),     // light tinted bg
    tableHeader: hslToHex(h, Math.min(s, 20), 97),      // very subtle tint
    tableAlt: hslToHex(h, Math.min(s, 15), 98),         // near-white alternate

    // Accents — mid-tone accent variants
    blockquoteBorder: hslToHex(h, Math.max(s, 60), 45), // same as link
    hr: hslToHex(h, Math.min(s, 15), 80),               // light muted separator
    tableBorder: hslToHex(h, Math.min(s, 15), 80),      // light muted border
  };
}
```

This is a starting reference — the dev agent should tune the exact lightness/saturation values to produce visually pleasing results and run WCAG checks. The key insight: `primaryText` on `previewBg` MUST pass 4.5:1 contrast ratio.

### WCAG Contrast Calculation — Implementation Detail

The contrast ratio formula (WCAG 2.1):

```typescript
// lib/colors/contrast.ts
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG_AA(textHex: string, bgHex: string): boolean {
  return getContrastRatio(textHex, bgHex) >= 4.5;
}
```

This is ~20 lines — no npm package needed. Implement in `lib/colors/contrast.ts`.

### HSL Color Wheel — Implementation Detail

Use a `<canvas>` element to render a circular HSL wheel:

```
┌──────────────────────────────────────┐
│                                      │
│        ┌──────────────┐              │
│        │  HSL Wheel   │              │
│        │  (canvas)    │              │
│        │  ~180px ⌀    │              │
│        └──────────────┘              │
│                                      │
│  ─────── Lightness slider ─────────  │
│                                      │
│  Accent:  #10B981      [■]          │
│                                      │
└──────────────────────────────────────┘
```

- **Wheel rendering**: For each pixel, calculate angle → hue, distance from center → saturation. Use current lightness from slider. Fill pixel with `hsl(h, s%, l%)`.
- **Interaction**: On mousedown/mousemove on canvas, compute angle and distance from center to derive hue (0-360) and saturation (0-100). Clamp saturation to the wheel radius.
- **Lightness slider**: A standard `<input type="range" min="0" max="100">` below the wheel.
- **Hex display**: Show computed hex value, editable. On valid hex input, reverse-compute HSL and update wheel position.
- **Performance**: Use `requestAnimationFrame` for drag events. Redraw the wheel only when lightness changes (not on every hue/sat change — the indicator dot moves but the wheel bitmap stays the same until lightness changes).
- **RTL**: Canvas coordinates are absolute (top-left origin regardless of dir). No RTL-specific adjustments needed for the canvas math. The surrounding layout (labels, slider) should use logical properties.

### ColorPanel Restructured Layout

Current layout (Story 13.2 state):
```
├── SheetHeader (title + description)
├── PresetGrid (curated cards + legacy + custom)
├── Save preset form
├── Image extraction                          ← MOVING
├── Individual color pickers (4 sections)     ← MOVING
├── Reset button
```

New layout (Story 13.3):
```
├── SheetHeader (title + description)
├── PresetGrid (curated cards + legacy + custom)
├── Save preset form
├── AccentCustomizer (collapsed by default)    ← NEW
│   ├── HslWheel
│   └── ContrastIndicator
├── Advanced section (collapsed by default)    ← NEW wrapper
│   ├── Image extraction                       ← MOVED here
│   └── Individual color pickers (4 sections)  ← MOVED here
├── Reset button
```

### Collapsible Section Pattern

Use the same pattern as the legacy presets toggle in PresetGrid:

```tsx
const [showSection, setShowSection] = useState(false);

<button
  type="button"
  onClick={() => setShowSection(v => !v)}
  className="flex w-full items-center gap-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
  style={{ fontSize: 'var(--text-body-sm)' }}
  aria-expanded={showSection}
  aria-label="סעיף כותרת"
>
  <ChevronDown
    className={`size-3.5 transition-transform ${showSection ? 'rotate-180' : ''}`}
    aria-hidden="true"
  />
  <Icon className="size-3.5" aria-hidden="true" />
  <span className="font-medium">כותרת</span>
</button>

{showSection && (
  <div className="mt-2">
    {/* section content */}
  </div>
)}
```

### Reset Button Behavior Change

Current reset (ColorPanel.tsx line 243-254) always resets to Green Meadow. New behavior:

```typescript
function handleReset() {
  // Reset to the currently committed curated theme, or Green Meadow as fallback
  const activeTheme = activeThemeId ? CURATED_THEME_MAP[activeThemeId] : null;
  const resetTarget = activeTheme ?? CURATED_THEME_MAP[DEFAULT_THEME_ID];
  onThemeChange(resetTarget ? resetTarget.colors : DEFAULT_THEME);
  setActiveThemeId(resetTarget?.id ?? DEFAULT_THEME_ID);
  setActivePreset('');
  // Collapse accent and advanced sections
  setShowAccent(false);
  setShowAdvanced(false);
}
```

### What NOT to Do

- **Do NOT** modify `lib/colors/themes.ts` — theme data is complete from S13.1
- **Do NOT** modify `lib/colors/apply-colors.ts` — CSS var application is unchanged
- **Do NOT** modify `lib/hooks/useThemeSelection.ts` — hook is sufficient
- **Do NOT** modify `lib/hooks/useColorTheme.ts` — existing hook handles persistence
- **Do NOT** modify `components/theme/PresetGrid.tsx` — gallery is complete from S13.2
- **Do NOT** modify `components/theme/ThemeCard.tsx` — card component is complete from S13.2
- **Do NOT** add dark mode variants to the accent generator — not in scope
- **Do NOT** use physical CSS properties (`margin-left`, `padding-right`) — always logical
- **Do NOT** use `!important` in CSS
- **Do NOT** add Framer Motion or other animation libraries — use CSS transitions only
- **Do NOT** add `react-color` (40KB) — too heavy. If a color wheel library is needed, `react-colorful` (~3KB) is acceptable
- **Do NOT** change the save-preset form location — it stays between custom presets and accent customizer
- **Do NOT** break existing keyboard navigation in the theme gallery (VS Code pattern from S13.2)
- **Do NOT** delete the legacy presets section or custom presets — they remain as-is

### Previous Story Intelligence (Story 13.2)

Key learnings from Story 13.2:

1. **Preview/commit pattern**: `onThemePreview` applies CSS vars without persisting. `onThemeChange` persists. The accent customizer should use `onThemeChange` (persist immediately on accent selection, same as clicking a theme card).

2. **Panel layout**: SheetContent has `direction: 'rtl'`, `w-80` (320px), `overflow-y-auto`. New sections must fit within this width.

3. **Font sizes**: Use CSS vars: `var(--text-body-sm)` for labels, `var(--text-caption)` for small text.

4. **Button classes**: Use existing `marko-panel-btn-full` for full-width buttons, `marko-panel-btn-sm` for small buttons, `marko-panel-btn-reset` for the reset button.

5. **Section spacing**: Sections use `space-y-6` container with individual sections wrapped in `<div>`.

6. **Test patterns**: ColorPanel tests use `render(<ColorPanel .../>)` with mocked localStorage. ThemeCard tests check for aria-labels and color values.

7. **Code review fixes from S13.2**: Preview must not write to localStorage (use `applyColorTheme` directly, not `setColorTheme`). ThemeCard uses `previewBg` for background. Escape revert works even without curated theme active (falls back to `currentColors`).

8. **Test count**: 762 total passing tests. 1 pre-existing failure in layout.test.ts. DO NOT break existing tests.

### Previous Story Intelligence (Story 13.1)

Key learnings from Story 13.1:

1. **Theme data**: `CURATED_THEMES` array in `lib/colors/themes.ts` has 8 themes (3 free, 5 premium). Each has `id`, `name`, `hebrewName`, `tier`, and full 17-property `colors: ColorTheme`.

2. **canApplyTheme**: `canApplyTheme(theme, userTier)` returns `true` for free themes or paid users. Returns `true` during `loading` state.

3. **Upsell toast**: `toast('ערכת נושא פרימיום — זמינה עם מנוי')` via sonner.

4. **localStorage keys**:
   - `marko-v2-active-theme` — curated theme ID
   - `marko-v2-color-theme` — full ColorTheme object
   - `marko-v2-active-preset` — legacy preset name

5. **Active state**: `activeThemeId` tracks curated selection. `activePreset` tracks legacy preset. Manual color edit clears both.

### Git Intelligence

Recent commits (relevant patterns):
```
da7427c Story 13.2 done: Color panel redesign — theme gallery + code review fixes
e6d8472 Story 13.1 done: Theme data model, 8 curated themes + code review fixes
```

Consistent patterns: co-located tests, Tailwind logical properties, sonner toasts, Lucide icons, code review fixes applied in the same commit.

### Project Structure Notes

All files align with architecture:
- Components: `components/theme/` — feature-based
- Library: `lib/colors/` — color utilities
- Hooks: `lib/hooks/` — custom React hooks
- Types: `types/colors.ts` — shared interfaces
- Tests: co-located with source files

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-13, Story 13.3] — Acceptance criteria
- [Source: _bmad-output/benakiva-feedback-round1.md#D5] — Accent customizer spec: HSL wheel, complementary tints, WCAG indicator
- [Source: _bmad-output/benakiva-feedback-round1.md#U2] — Color panel redesign: Advanced toggle, section ordering
- [Source: _bmad-output/marko-design-system.md#Color-Panel] — Panel width 320px, surface bg, 12px radius
- [Source: _bmad-output/planning-artifacts/architecture.md#Color-System] — 17-property model, CSS custom properties, component organization
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ColorPanel] — Panel behavior, Sheet component
- [Source: _bmad-output/implementation-artifacts/13-2-color-panel-redesign-theme-gallery.md] — Previous story: preview/commit flow, test patterns, file list
- [Source: _bmad-output/implementation-artifacts/13-1-theme-data-model-and-8-launch-themes.md] — Theme data model, tier gating, localStorage keys

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- ContrastIndicator test initially missing `beforeEach` import — fixed immediately

### Completion Notes List

- Task 1: Created 3 utility files (`color-utils.ts`, `contrast.ts`, `accent-generator.ts`) with zero dependencies. `generateThemeFromAccent()` derives all 17 ColorTheme properties from a single HSL accent. WCAG contrast utilities implemented per spec. 31 unit tests pass.
- Task 2: Created canvas-based `HslWheel.tsx` — 180px circular wheel with pointer capture for drag, lightness range slider, editable hex input with `dir="ltr"`. All labels in Hebrew. 9 unit tests pass.
- Task 3: Created `ContrastIndicator.tsx` — displays ratio with Hebrew label, `--success`/`--warning` color classes, descriptive aria-labels. 6 unit tests pass.
- Task 4: Created `AccentCustomizer.tsx` — collapsible section with Paintbrush icon + ChevronDown, controlled/uncontrolled expansion, clears activeThemeId/activePreset on accent change. 7 integration tests pass.
- Task 5: Restructured `ColorPanel.tsx` — wrapped image extractor + 4 color picker sections in collapsible "Advanced" section with Settings icon. Both new sections collapsed by default.
- Task 6: Updated reset button — resets to active curated theme (via `activeThemeId` lookup in `CURATED_THEME_MAP`), falls back to Green Meadow. Also collapses accent & advanced sections.
- Task 7: Updated 11 existing tests to expand Advanced section before asserting. Added 9 new Story 13.3 tests (accent toggle, advanced toggle, layout order, reset behavior). 824 total tests pass (762 existing + 62 new). 1 pre-existing failure in layout.test.ts unchanged.

### File List

**New files:**
- `lib/colors/color-utils.ts` — HSL/hex conversion helpers
- `lib/colors/color-utils.test.ts` — 15 unit tests
- `lib/colors/contrast.ts` — WCAG contrast ratio utilities
- `lib/colors/contrast.test.ts` — 8 unit tests
- `lib/colors/accent-generator.ts` — Generate 17-property ColorTheme from single HSL accent
- `lib/colors/accent-generator.test.ts` — 8 unit tests
- `components/theme/HslWheel.tsx` — Canvas-based HSL color wheel with lightness slider
- `components/theme/HslWheel.test.tsx` — 9 unit tests
- `components/theme/ContrastIndicator.tsx` — WCAG contrast ratio display
- `components/theme/ContrastIndicator.test.tsx` — 6 unit tests
- `components/theme/AccentCustomizer.tsx` — Collapsible accent customizer section
- `components/theme/AccentCustomizer.test.tsx` — 7 integration tests

**Modified files:**
- `components/theme/ColorPanel.tsx` — Added AccentCustomizer section, wrapped pickers in collapsible Advanced section, updated reset button
- `components/theme/ColorPanel.test.tsx` — Updated 11 existing tests for Advanced section, added 9 new Story 13.3 tests

## Change Log

- 2026-03-25: Story 13.3 implemented — Accent customizer with HSL wheel + WCAG contrast indicator, Advanced mode collapsible section, reset button uses active curated theme. 62 new tests added (824 total). Zero new dependencies.
