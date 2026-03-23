# Story 13.1: Theme Data Model & 8 Launch Themes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a theme data structure with 8 curated themes defined,
So that the theme panel and preview can render them.

## Acceptance Criteria

1. **Theme data model** defined in `lib/colors/` with each theme containing: `id` (slug), `name` (English), `hebrewName` (Hebrew), `tier` ("free" | "premium"), and a complete `ColorTheme` object (all 17 color properties).

2. **8 launch themes** defined with these EXACT base specifications:

| Theme | Hebrew | Background | Headings | Accent | Tier | Default? |
|-------|--------|-----------|----------|--------|------|----------|
| Green Meadow | שדה ירוק | #FAFAF5 | #064E3B | #10B981 | free | YES |
| Sea of Galilee | ים כנרת | #F2F8F7 | #0D4F5A | #14B8A6 | free | No |
| Minimal Gray | אפור מינימלי | #FAFAFA | #1F2937 | #6B7280 | free | No |
| Old Parchment | קלף ישן | #F5ECD7 | #78350F | #D97706 | premium | No |
| Negev Night | לילה בנגב | #1A1B2E | #FCD34D | #F59E0B | premium | No |
| Soft Rose | ורד רך | #FFF5F0 | #9F1239 | #F43F5E | premium | No |
| Lavender Dream | חלום לבנדר | #F5F3FF | #5B21B6 | #8B5CF6 | premium | No |
| Ocean Deep | עומק האוקיינוס | #EFF6FF | #1E3A5F | #3B82F6 | premium | No |

3. **Free themes** (Green Meadow, Sea of Galilee, Minimal Gray) are usable without login.

4. **Premium themes** (Old Parchment, Negev Night, Soft Rose, Lavender Dream, Ocean Deep) show a preview but display an upsell toast on apply attempt.

5. **Green Meadow** is the new default theme (replaces "Classic" as the default on fresh installs). Existing users who have persisted colors are NOT affected.

6. **Theme selection persists** to localStorage via a theme ID key. On page reload, the active theme is restored.

7. **Existing 15 presets continue to work** in the "Advanced" section (no deletion). The new 8 themes are the PRIMARY selection mechanism shown in the PresetGrid.

## BDD Scenarios

```gherkin
Scenario: Load Green Meadow theme (default)
  Given the app initializes with no stored theme
  When no theme ID is in localStorage
  Then Green Meadow theme colors are applied
  And document renders with #FAFAF5 background and #10B981 accent

Scenario: Apply free theme without login
  Given a user is logged out
  When they select "Sea of Galilee" theme
  Then it applies instantly via CSS variable update
  And localStorage stores themeId: "sea-of-galilee"

Scenario: Premium theme upsell on apply
  Given a user without a paid subscription
  When they click a premium theme (e.g., "Old Parchment")
  Then a toast appears: "ערכת נושא פרימיום — זמינה עם מנוי"
  And the theme does NOT apply
  And the previous theme remains active

Scenario: Persist theme selection across reload
  Given a user selected "Minimal Gray"
  When the page reloads
  Then "Minimal Gray" is still active
  And all 17 CSS variables reflect Minimal Gray values

Scenario: Existing user migration — no disruption
  Given a user has custom colors stored from the old 15-preset system
  When they load the app after this update
  Then their existing custom colors remain intact
  And activePreset tracking coexists with new themeId tracking
```

## Tasks / Subtasks

- [x] Task 1: Define `Theme` interface and theme data (AC: #1, #2)
  - [x] 1.1 Add `Theme` interface to `types/colors.ts`
  - [x] 1.2 Create `lib/colors/themes.ts` with 8 theme objects (complete 17-property ColorTheme for each)
  - [x] 1.3 Export `CURATED_THEMES` array and `CURATED_THEME_MAP` lookup
  - [x] 1.4 Update `lib/colors/defaults.ts` — `DEFAULT_THEME` becomes Green Meadow's ColorTheme

- [x] Task 2: Create theme selection hook (AC: #5, #6)
  - [x] 2.1 Create `lib/hooks/useThemeSelection.ts` — manages `activeThemeId` in localStorage
  - [x] 2.2 Integrate with `useColorTheme` — when a curated theme is selected, apply its ColorTheme
  - [x] 2.3 Handle "no stored theme" → default to `green-meadow`
  - [x] 2.4 Preserve backward compatibility with existing `marko-v2-color-theme` key

- [x] Task 3: Premium tier gating logic (AC: #3, #4)
  - [x] 3.1 Add tier check utility: `canApplyTheme(theme, userTier)` in `lib/colors/themes.ts`
  - [x] 3.2 Wire premium gate into theme selection flow — show Hebrew upsell toast on blocked apply

- [x] Task 4: Update PresetGrid to show curated themes (AC: #1, #7)
  - [x] 4.1 Update `PresetGrid.tsx` to render 8 curated themes as primary selection
  - [x] 4.2 Show premium badge (lock icon) on premium theme circles
  - [x] 4.3 Keep existing 15 presets accessible (collapsed "נושאים נוספים" section or similar)

- [x] Task 5: Wire into ColorPanel and editor page (AC: #5, #6)
  - [x] 5.1 Update `ColorPanel.tsx` to use `useThemeSelection` for curated theme selection
  - [x] 5.2 Update `app/editor/page.tsx` if needed for new hook integration
  - [x] 5.3 Update reset button to reset to Green Meadow (not old Classic)

- [x] Task 6: Tests (AC: all)
  - [x] 6.1 Unit test: Theme data model — all 8 themes have valid 17-property ColorTheme
  - [x] 6.2 Unit test: `canApplyTheme` returns correct result per tier
  - [x] 6.3 Unit test: `useThemeSelection` defaults to green-meadow when no stored ID
  - [x] 6.4 Unit test: Theme selection persists to localStorage

## Dev Notes

### Architecture Compliance

- **Tech stack**: TypeScript strict mode, React 19, Next.js 16, Tailwind v4, shadcn/ui
- **State management**: Custom hooks + `useLocalStorage` — NO external state library (no Zustand/Redux)
- **Styling**: CSS custom properties via `applyColorTheme()` — never hardcode colors in components
- **RTL**: All UI text in Hebrew, all labels in Hebrew, logical Tailwind properties (`ms-`, `me-`, `ps-`, `pe-`)
- **ARIA**: All interactive elements need Hebrew `aria-label`

### Existing Color System — DO NOT BREAK

The current color system is built on these files that MUST remain functional:

| File | Purpose | Action |
|------|---------|--------|
| `types/colors.ts` | `ColorTheme` (17 props), `ColorPreset`, `CustomPreset` | ADD `Theme` interface, keep existing |
| `lib/colors/defaults.ts` | `DEFAULT_CLASSIC_THEME` | Update default OR add new `DEFAULT_THEME` alongside |
| `lib/colors/presets.ts` | 15 `COLOR_PRESETS`, `COLOR_PRESET_MAP` | KEEP — still used for advanced/legacy |
| `lib/colors/apply-colors.ts` | `applyColorTheme()` — sets CSS vars on `:root` | NO CHANGES — reuse as-is |
| `lib/hooks/useColorTheme.ts` | `useColorTheme()` — persists `ColorTheme` to localStorage key `marko-v2-color-theme` | MINOR CHANGES — may need to coordinate with theme selection |
| `lib/hooks/useCustomPresets.ts` | Save/delete custom presets to `marko-v2-custom-presets` | NO CHANGES |
| `lib/hooks/useLocalStorage.ts` | Generic localStorage hook with hydration safety | NO CHANGES — reuse for new theme ID storage |
| `components/theme/ColorPanel.tsx` | Sheet panel, preset grid, image extraction, 17 color pickers | MODIFY — add curated theme section |
| `components/theme/PresetGrid.tsx` | 5-col radiogroup grid, keyboard nav, custom presets | MODIFY — show 8 curated themes as primary |
| `components/theme/ColorPicker.tsx` | Single color input | NO CHANGES |
| `components/theme/ImageColorExtractor.tsx` | Image upload + k-means extraction | NO CHANGES |
| `app/globals.css` | CSS custom properties (17 color vars + semantic tokens) | NO CHANGES |

### Theme Data Model Design

```typescript
// ADD to types/colors.ts
export interface Theme {
  id: string;           // kebab-case slug, e.g., "green-meadow"
  name: string;         // English display name
  hebrewName: string;   // Hebrew display name
  tier: 'free' | 'premium';
  colors: ColorTheme;   // Reuses existing 17-property interface
}
```

**Why `colors: ColorTheme` reuses the existing interface**: The 17-property `ColorTheme` is already used by `applyColorTheme()`, `useColorTheme()`, exports, Mermaid theming, and the V1 migration. A curated theme is just a named, tiered wrapper around the same `ColorTheme` — no new color properties needed.

### Deriving Full 17-Property Themes

The epic spec gives 3 base values per theme (background, headings, accent). The dev MUST derive all 17 properties for each theme following this pattern:

| Property | Derivation Rule |
|----------|----------------|
| `previewBg` | = specified background |
| `h1`, `h2` | = specified heading color |
| `h3` | = heading color lightened ~15% |
| `h1Border`, `h2Border` | = specified accent |
| `link`, `blockquoteBorder` | = specified accent |
| `primaryText` | = dark contrasting text on the background (≥4.5:1 WCAG) |
| `secondaryText` | = primaryText lightened ~30% |
| `code` | = accent or heading color (whichever has better contrast on codeBg) |
| `codeBg` | = very dark shade derived from heading color |
| `blockquoteBg` | = background tinted toward accent at ~5% |
| `tableHeader` | = accent at ~10% opacity on background |
| `tableAlt` | = background slightly darkened |
| `tableBorder` | = neutral gray appropriate to background lightness |
| `hr` | = neutral gray appropriate to background lightness |

**Use the existing presets in `presets.ts` as reference** — they follow this same derivation pattern. Study `night` preset for dark theme (Negev Night) derivation.

### localStorage Key Strategy

| Key | Value | Purpose |
|-----|-------|---------|
| `marko-v2-active-theme` | Theme ID string (e.g., `"green-meadow"`) | NEW — tracks curated theme selection |
| `marko-v2-color-theme` | Full `ColorTheme` JSON | EXISTING — still primary color storage |
| `marko-v2-active-preset` | Preset name string | EXISTING — tracks old preset selection |
| `marko-v2-custom-presets` | `CustomPreset[]` JSON | EXISTING — no changes |

**Flow when user selects a curated theme:**
1. Set `marko-v2-active-theme` = theme ID
2. Set `marko-v2-color-theme` = theme's `ColorTheme` (via existing `useColorTheme`)
3. Clear `marko-v2-active-preset` = `""` (no old preset active)

**Flow when user selects an old preset (from advanced):**
1. Set `marko-v2-active-preset` = preset name (existing behavior)
2. Set `marko-v2-color-theme` = preset's `ColorTheme` (existing behavior)
3. Clear `marko-v2-active-theme` = `""` (no curated theme active)

**Flow when user modifies individual colors:**
1. Both `active-theme` and `active-preset` become `""` (custom state)
2. `marko-v2-color-theme` stores the modified ColorTheme

### Premium Tier Logic

```typescript
import { useUser } from '@clerk/nextjs';

function canApplyTheme(theme: Theme): boolean {
  if (theme.tier === 'free') return true;
  // Premium requires paid subscription — check user tier
  return false; // For now, premium always blocks (subscription system exists in E9)
}
```

**Upsell toast** (Hebrew): Use `sonner` toast — `toast("ערכת נושא פרימיום — זמינה עם מנוי")`

**Premium UX**: Premium theme circles show a small lock icon (Lucide `Lock` at 10px). User can see the gradient preview. Clicking triggers the upsell toast instead of applying.

### What NOT to Do

- **DO NOT delete the 15 existing presets** — they remain for advanced/power users and backward compatibility
- **DO NOT redesign the ColorPanel UI layout** — visual card mockups, 2-column grid, slide-out redesign are all S13.2 scope
- **DO NOT add accent customizer or HSL color wheel** — that is S13.3
- **DO NOT add arrow-key live preview navigation** between themes — that is S13.2 interaction
- **DO NOT modify `apply-colors.ts`** — the CSS variable application system works as-is
- **DO NOT modify `image-extraction.ts`** — image extraction is unchanged
- **DO NOT add dark mode variants** per theme — dark mode toggle is separate (S2.5, already done)
- **DO NOT use `!important`** in any CSS rules
- **DO NOT use physical CSS properties** (`ml-`, `mr-`, `left-`, `right-`) — only logical (`ms-`, `me-`, `start-`, `end-`)

### Project Structure Notes

New files to create:
```
lib/colors/themes.ts          — 8 curated Theme objects + CURATED_THEMES array + helpers
lib/hooks/useThemeSelection.ts — Active theme ID state + persistence hook
```

Files to modify:
```
types/colors.ts                — Add Theme interface
lib/colors/defaults.ts         — Update default to Green Meadow (or add alongside)
components/theme/PresetGrid.tsx — Show curated themes as primary, old presets as secondary
components/theme/ColorPanel.tsx — Integrate curated theme selection, update reset default
```

Files NOT to touch:
```
lib/colors/apply-colors.ts
lib/colors/presets.ts          — Keep for advanced section
lib/hooks/useColorTheme.ts     — Keep core hook stable; new hook wraps it
lib/hooks/useCustomPresets.ts
lib/hooks/useLocalStorage.ts
components/theme/ColorPicker.tsx
components/theme/ImageColorExtractor.tsx
components/theme/ColorPreviewModal.tsx
app/globals.css
```

### Testing Standards

- **Framework**: Vitest for unit tests
- **Co-locate**: Test files next to source (e.g., `lib/colors/themes.test.ts`)
- **Minimum tests**:
  - All 8 themes have valid 17-property `ColorTheme` (no missing/undefined keys)
  - All theme IDs are unique kebab-case strings
  - `canApplyTheme` correctly gates free vs premium
  - Green Meadow is the default when no theme stored
  - Theme selection round-trips through localStorage
- **Pre-existing test baseline**: ~700+ tests passing, 1-3 known failures in Header/EditorToolbar tests (pre-existing, do not fix)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 13, Story 13.1]
- [Source: _bmad-output/benakiva-feedback-round1.md — D5 (curated themes), U2 (color panel direction)]
- [Source: _bmad-output/planning-artifacts/architecture.md — FR18-23 Color Theming]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color Panel UX]
- [Source: types/colors.ts — ColorTheme interface]
- [Source: lib/colors/presets.ts — existing 15 presets pattern]
- [Source: lib/colors/apply-colors.ts — CSS variable application]
- [Source: components/theme/ColorPanel.tsx — current panel implementation]
- [Source: components/theme/PresetGrid.tsx — current preset grid with keyboard nav]

### Previous Story Intelligence

**From Epic 12 (most recent completed):**
- Glassmorphic header with 7 zones established — theme button (🎨) is in the Tools zone
- shadcn/ui `Sheet` component used for side panels — ColorPanel already uses this pattern
- Radix testing requires `pointerdown` events, `ResizeObserver` polyfill, async waits for portals
- Responsive CSS is media-query-first — no JS-based `useMediaQuery` for layout

**From Epic 11 (visual identity):**
- CSS custom properties system for shadows, spacing, fonts, colors is well-established in `globals.css`
- Design system tokens (emerald brand #10B981, pill buttons, 2px borders) must be maintained
- Component-level custom classes use `.marko-` prefix (e.g., `.marko-preset-circle`)

**From S2.1–S2.3 (original color system, now superseded by E13):**
- `ColorPanel` Sheet opens from right side (`side="right"`) — correct for RTL
- `PresetGrid` uses radiogroup pattern with arrow-key navigation — reuse this keyboard pattern
- `ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` exported from `ColorPanel.tsx` — coordinate with new theme ID key

### Git Intelligence

Recent commits follow pattern: `"Story X.Y done: [description] + code review fixes"`

Last 5 commits:
- `ebd3f2d` Story 12.4: User menu, navigation
- `90861b9` Story 12.3: Overflow menu, BiDi simplification
- `6694cc2` Story 12.2: Header responsive behavior
- `63bce35` Story 12.1: Header 7-zone layout, AI star button
- `0c67a3b` Story 11.3: Remove footer and icon enrichment

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- No blocking issues encountered during implementation

### Completion Notes List

- **Task 1**: Added `Theme` interface to `types/colors.ts`. Created `lib/colors/themes.ts` with 8 curated themes (3 free, 5 premium), each with complete 17-property `ColorTheme` derived from spec base colors. Added `DEFAULT_THEME` (Green Meadow) to `defaults.ts`.
- **Task 2**: Created `lib/hooks/useThemeSelection.ts` with `marko-v2-active-theme` localStorage key. Updated `useColorTheme` to default to `DEFAULT_THEME` (Green Meadow). Backward compatibility preserved — `marko-v2-color-theme` key remains the primary color storage.
- **Task 3**: Added `canApplyTheme(theme, userTier)` to `themes.ts`. Free themes allowed for all users; premium requires `paid` tier. Upsell toast wired in ColorPanel via `sonner`.
- **Task 4**: Rewrote `PresetGrid.tsx` — 8 curated themes as primary radiogroup with lock icons on premium circles. Existing 15 presets in collapsible "נושאים נוספים" section with `ChevronDown` toggle.
- **Task 5**: Updated `ColorPanel.tsx` with `userTier` prop, curated theme selection flow, and Green Meadow reset. Updated `app/editor/page.tsx` to pass actual user tier from `useCurrentUser()`.
- **Task 6**: Added 19 unit tests in `themes.test.ts` (data model validation, hex format, tier counts, `canApplyTheme` for all user tiers) and 7 tests in `useThemeSelection.test.ts`. Updated `ColorPanel.test.tsx` with 5 curated theme tests replacing legacy preset tests. Total: 26 new tests, 736 passing, 0 regressions (1 pre-existing failure in `layout.test.ts`).

### File List

**New files:**
- `lib/colors/themes.ts` — 8 curated Theme objects, CURATED_THEMES, CURATED_THEME_MAP, canApplyTheme
- `lib/hooks/useThemeSelection.ts` — Theme ID selection hook with localStorage
- `lib/colors/themes.test.ts` — 19 unit tests for theme data model and canApplyTheme
- `lib/hooks/useThemeSelection.test.ts` — 7 unit tests for theme selection hook

**Modified files:**
- `types/colors.ts` — Added Theme interface
- `lib/colors/defaults.ts` — Added DEFAULT_THEME (Green Meadow)
- `lib/hooks/useColorTheme.ts` — Changed default from DEFAULT_CLASSIC_THEME to DEFAULT_THEME
- `components/theme/PresetGrid.tsx` — Curated themes primary, legacy presets collapsible, premium lock badges
- `components/theme/ColorPanel.tsx` — Added userTier prop, curated theme selection, upsell toast, Green Meadow reset
- `components/theme/ColorPanel.test.tsx` — Updated tests for curated themes and new reset default
- `app/editor/page.tsx` — Pass userTier to ColorPanel from useCurrentUser()

### Change Log

- 2026-03-23: Story 13.1 implemented — Theme data model, 8 curated themes, premium gating, PresetGrid update, 26 new tests
