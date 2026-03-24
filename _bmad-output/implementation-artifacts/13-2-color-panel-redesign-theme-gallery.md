# Story 13.2: Color Panel Redesign — Theme Gallery

Status: done

## Story

As a user,
I want to see visual theme previews and apply them with one click,
so that choosing a theme is intuitive and delightful.

## Acceptance Criteria

1. **Panel chrome**: Color panel slides from the **right** side (RTL-correct, already works). Close (X) button at **top-left** (already works). Header shows "ערכות נושא" (Themes) with a Palette Lucide icon (per architecture constraint: Lucide React only, no emojis).

2. **Theme gallery layout**: Themes display in a **2-column scrollable grid** of visual cards (~140px wide each). Cards fill the panel width (320px panel → 2 cards with gap).

3. **Mini document mockup**: Each card shows a small Hebrew document preview rendered in the theme's colors — at minimum: a heading line (h1 color), a body text line (primaryText), and a code block snippet (codeBg + code color) on the theme's previewBg background.

4. **Click to apply**: Clicking a card applies the theme instantly (same behavior as current circle click — persists to localStorage).

5. **Arrow-key live preview (VS Code pattern)**: Arrow keys navigate between cards in the 2-column grid. Moving focus to a card triggers an instant **live preview** (temporarily applies the theme's colors to the document WITHOUT persisting). Enter **commits** the selection (persists to localStorage). Escape **cancels** and reverts to the previously committed theme.

6. **Premium themes**: Premium theme cards show a subtle lock icon and "Premium" badge. Premium themes **do** preview (via keyboard navigation or hover), but attempting to **commit** (click or Enter) triggers the upsell toast.

7. **Existing sections preserved**: Legacy presets (collapsible "נושאים נוספים"), custom presets, save-preset form, image extraction, individual color pickers, and reset button all remain functional below the gallery. No structural changes to these sections.

## Tasks / Subtasks

- [x] Task 1: Create ThemeCard component (AC: #3, #6)
  - [x] 1.1 Build mini document mockup rendering the theme's colors (heading, paragraph, code block)
  - [x] 1.2 Add theme Hebrew name label at bottom of card
  - [x] 1.3 Add premium lock icon + "פרימיום" badge for premium themes
  - [x] 1.4 Active state ring/border for the currently committed theme
  - [x] 1.5 Hover state with subtle elevation
  - [x] 1.6 Focus-visible ring for keyboard navigation

- [x] Task 2: Rewrite PresetGrid curated section → 2-column visual card grid (AC: #2, #4)
  - [x] 2.1 Replace 5-column circle `radiogroup` with 2-column card grid
  - [x] 2.2 Wire click → onCuratedThemeSelect (commit, same as current behavior)
  - [x] 2.3 Premium click → onPremiumBlocked (same as current)
  - [x] 2.4 Keep legacy presets, custom presets, delete buttons unchanged

- [x] Task 3: Implement VS Code arrow-key navigation with live preview (AC: #5, #6)
  - [x] 3.1 Track `committedTheme` (the last Enter'd or clicked theme) as a ref
  - [x] 3.2 Arrow keys move focus between cards (2 columns: Left/Right ±1, Up/Down ±2)
  - [x] 3.3 On focus via arrow key, call `onPreview(theme.colors)` for live CSS update without persisting
  - [x] 3.4 Enter key → commit (call onCuratedThemeSelect + persist)
  - [x] 3.5 Escape key → revert to committedTheme colors (call onPreview with committed colors)
  - [x] 3.6 Premium themes: preview works on arrow-key focus, but Enter triggers upsell instead of committing

- [x] Task 4: Update ColorPanel header and preview/commit flow (AC: #1, #5)
  - [x] 4.1 Change SheetTitle from "הגדרות צבע" to "🎨 ערכות נושא"
  - [x] 4.2 Update SheetDescription to match new theme gallery context
  - [x] 4.3 Add `onPreview` callback prop to PresetGrid for keyboard live preview
  - [x] 4.4 Wire onPreview → onThemeChange (applies CSS vars without persisting theme ID)

- [x] Task 5: Tests (AC: all)
  - [x] 5.1 ThemeCard unit tests: renders mockup with correct colors, shows premium badge, active state
  - [x] 5.2 PresetGrid tests: 2-column grid renders, click commits, keyboard navigation works
  - [x] 5.3 ColorPanel integration tests: header text updated, preview/commit flow works

## Dev Notes

### Architecture Compliance

- **Framework**: React 19, Next.js 16, TypeScript strict mode
- **UI library**: shadcn/ui (Sheet from Radix) — panel chrome stays the same
- **Styling**: Tailwind v4 with CSS logical properties for RTL (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `border-s`, `border-e`, `inset-inline`)
- **State**: Custom hooks + useLocalStorage (no Redux/Zustand)
- **CSS vars**: Theme colors applied via `applyColorTheme()` in `lib/colors/apply-colors.ts` — NO changes to this function
- **Icons**: Lucide React only — `Lock` already imported in PresetGrid
- **RTL**: `direction: 'rtl'` on SheetContent, all labels in Hebrew, hex inputs `dir="ltr"`
- **ARIA**: Hebrew aria-labels on all interactive elements, `role="radiogroup"` for gallery, keyboard navigation via roving tabindex
- **Testing**: Vitest, co-located test files
- **CSS class prefix**: `marko-` for custom classes (e.g., `marko-theme-card`)

### Existing Files to Modify

| File | Change Scope |
|------|-------------|
| `components/theme/PresetGrid.tsx` | **MAJOR** — Replace curated 5-column circles with 2-column ThemeCard grid. Add onPreview prop. Rewrite keyboard handler for 2-column layout + preview/commit. Legacy presets and custom presets sections stay unchanged. |
| `components/theme/ColorPanel.tsx` | **MINOR** — Update header text. Add onPreview wiring to PresetGrid. |
| `components/theme/ColorPanel.test.tsx` | **MINOR** — Update header assertion, add preview/commit tests. |

### New Files to Create

| File | Purpose |
|------|---------|
| `components/theme/ThemeCard.tsx` | Visual card component showing mini Hebrew document mockup in theme colors |
| `components/theme/ThemeCard.test.tsx` | Unit tests for ThemeCard rendering and states |

### ThemeCard Design Specification

Each card is a button (~140px wide, ~160px tall) with:

```
┌───────────────────────┐
│ previewBg              │
│                        │
│  כותרת ראשית           │  ← h1 color, bold, ~11px
│  טקסט לדוגמה של        │  ← primaryText, ~9px
│  מסמך בעברית           │
│  ┌──────────────────┐  │
│  │ const x = 42;    │  │  ← codeBg bg, code color, ~8px mono
│  └──────────────────┘  │
│                        │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │  ← hr color, thin line
│  ים כנרת         🔒   │  ← hebrewName + optional lock
└───────────────────────┘
```

- Background: `theme.colors.previewBg`
- Heading text: `theme.colors.h1` — use "כותרת ראשית" or similar short Hebrew heading
- Body text: `theme.colors.primaryText` — 1-2 lines of Hebrew sample text
- Code block: `theme.colors.codeBg` background + `theme.colors.code` text — use a short code snippet like `const x = 42;`
- Separator: `theme.colors.hr` color, thin horizontal rule
- Label area: theme `hebrewName` in small text + Lock icon for premium
- Active state: `border-2 border-[var(--primary)]` ring around the card
- Hover: `motion-safe:hover:shadow-md` subtle elevation lift
- Focus-visible: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`
- Border radius: `rounded-lg` (8px per design system)
- Card border: subtle `border border-[var(--border)]`
- Transition: `transition-shadow` for hover, respect `prefers-reduced-motion`

### VS Code Navigation Pattern — Implementation Detail

The key insight: separate **preview** (visual-only) from **commit** (persist).

```typescript
// In PresetGrid
const committedThemeRef = useRef<Theme | null>(null);

// On panel open or initial render:
// committedThemeRef.current = activeTheme (from useThemeSelection)

// Arrow key handler:
function handleArrowKey(nextTheme: Theme) {
  // Live preview — apply colors visually but don't persist
  onPreview(nextTheme.colors);
  // Move focus to next card (roving tabindex)
}

// Enter handler:
function handleEnter(focusedTheme: Theme) {
  if (!canApplyTheme(focusedTheme, userTier)) {
    onPremiumBlocked();
    return;
  }
  onCuratedThemeSelect(focusedTheme); // persist
  committedThemeRef.current = focusedTheme;
}

// Escape handler:
function handleEscape() {
  if (committedThemeRef.current) {
    onPreview(committedThemeRef.current.colors); // revert visual
  }
  // Optionally return focus to the committed card
}
```

**State in ColorPanel:**

```typescript
// onPreview callback — applies colors visually without persisting theme ID
function handlePreview(colors: ColorTheme) {
  onThemeChange(colors); // updates CSS vars via applyColorTheme
  // Do NOT call setActiveThemeId — that's only on commit
}
```

The `onThemeChange` prop already calls `applyColorTheme()` inside `useColorTheme` hook, so preview will visually update the document. The key is not calling `setActiveThemeId` during preview — only on commit (click or Enter).

### Arrow Key Direction in RTL

In RTL layout, visual left/right is flipped. Since the grid is `direction: rtl`, the first card in the row is on the RIGHT visually. Arrow key behavior:

- **ArrowRight** in RTL = move to PREVIOUS card (index - 1), since right is "backward" in RTL
- **ArrowLeft** in RTL = move to NEXT card (index + 1), since left is "forward" in RTL
- **ArrowDown** = move to card below (index + 2 in 2-column grid)
- **ArrowUp** = move to card above (index - 2 in 2-column grid)

This is the standard RTL roving tabindex behavior.

### Premium Preview Behavior

During keyboard navigation, premium themes DO preview (colors apply visually) but:
- Enter → shows upsell toast instead of committing
- Click → shows upsell toast instead of committing
- The visual preview during arrow-key navigation is intentional — lets users "try before they buy"

This is the same `canApplyTheme()` + `onPremiumBlocked()` pattern from Story 13.1, just applied at the commit step rather than the preview step.

### What NOT to Do

- **Do NOT** add the accent customizer / HSL wheel — that's Story 13.3
- **Do NOT** add the "מתקדם" (Advanced) toggle — that's Story 13.3
- **Do NOT** move image extraction to Advanced section — that's Story 13.3
- **Do NOT** hide individual color pickers — they remain visible for now; S13.3 hides them behind Advanced toggle
- **Do NOT** modify `lib/colors/themes.ts` — theme data is complete from S13.1
- **Do NOT** modify `lib/colors/apply-colors.ts` — CSS var application is unchanged
- **Do NOT** modify `lib/hooks/useThemeSelection.ts` — hook is sufficient as-is
- **Do NOT** modify `lib/hooks/useColorTheme.ts` — existing hook handles the preview flow
- **Do NOT** add dark mode theme variants — not in scope
- **Do NOT** use physical CSS properties (`margin-left`, `padding-right`) — always use logical properties
- **Do NOT** use `!important` in CSS
- **Do NOT** delete the legacy presets section or custom presets — they remain as-is
- **Do NOT** add Framer Motion or other animation libraries — use CSS transitions only

### Previous Story Intelligence (Story 13.1)

Key learnings from Story 13.1 implementation:

1. **Theme data**: `CURATED_THEMES` array in `lib/colors/themes.ts` has 8 themes (3 free, 5 premium). Each has `id`, `name`, `hebrewName`, `tier`, and full 17-property `colors: ColorTheme`.

2. **Tier gating**: `canApplyTheme(theme, userTier)` returns `true` for free themes or paid users. Returns `true` during `loading` state (permissive).

3. **Upsell toast**: `toast('ערכת נושא פרימיום — זמינה עם מנוי')` via sonner.

4. **localStorage keys**:
   - `marko-v2-active-theme` — curated theme ID (string)
   - `marko-v2-color-theme` — full ColorTheme object (the actual colors)
   - `marko-v2-active-preset` — legacy preset name
   - `marko-v2-custom-presets` — custom presets array

5. **Active state tracking**: `activeThemeId` tracks curated selection, `activePreset` tracks legacy preset. Manual color edit clears both.

6. **PresetGrid props interface** (current):
   ```typescript
   interface PresetGridProps {
     activePreset: string;
     activeThemeId: string;
     userTier: 'free' | 'paid' | 'anonymous' | 'loading';
     onPresetSelect: (name: string, theme: ColorTheme) => void;
     onCuratedThemeSelect: (theme: Theme) => void;
     onPremiumBlocked: () => void;
     customPresets: CustomPreset[];
     onCustomPresetSelect: (colors: ColorTheme) => void;
     onDeleteCustomPreset: (index: number) => void;
   }
   ```
   **Add** `onPreview: (colors: ColorTheme) => void` for keyboard live preview.

7. **Test count**: 26 new tests from S13.1 (19 in themes.test.ts, 7 in useThemeSelection.test.ts). 736 total passing. 1 pre-existing failure in layout.test.ts. DO NOT break existing tests.

### Git Intelligence

Recent commits show consistent patterns:
- Story files created with comprehensive dev notes
- Code review fixes applied in same commit
- Component changes co-located with test updates
- All changes use Tailwind logical properties for RTL
- sonner toasts for user notifications
- Lucide icons for all iconography

Last 5 commits modified theme-related files:
- `components/theme/ColorPanel.tsx` — Sheet panel with Hebrew labels
- `components/theme/PresetGrid.tsx` — 5-column circle grid (to be replaced)
- `lib/colors/themes.ts` — 8 curated themes data
- `lib/hooks/useThemeSelection.ts` — active theme tracking
- `types/colors.ts` — Theme + ColorTheme interfaces

### Project Structure Notes

Files align with the unified structure in architecture doc:
- Components: `components/theme/` — feature-based organization
- Library: `lib/colors/` — color system logic
- Hooks: `lib/hooks/` — custom React hooks
- Types: `types/colors.ts` — shared TypeScript interfaces
- Tests: co-located with source files

### CSS Classes to Add

Add these custom classes to `app/globals.css` (under the existing `.marko-preset-circle` section):

```css
.marko-theme-card {
  /* Base card: 2-column grid item */
  width: 100%;
  border-radius: var(--radius-md); /* 8px */
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 150ms ease;
}
```

Or better yet, use Tailwind utility classes directly on the component to avoid CSS bloat. The current codebase uses a mix of custom `.marko-*` classes and Tailwind — prefer Tailwind for new components since the card styling is straightforward.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-13] — Epic 13 acceptance criteria
- [Source: _bmad-output/benakiva-feedback-round1.md#U2] — Color panel redesign spec
- [Source: _bmad-output/benakiva-feedback-round1.md#D5] — Curated themes requirement
- [Source: _bmad-output/marko-design-system.md#Component-Specifications] — Color panel spec (320px width, RTL, gradient accent stripe)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — State management, component patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ColorPanel] — Panel slide-out behavior, Sheet component, focus trapping
- [Source: _bmad-output/implementation-artifacts/13-1-theme-data-model-and-8-launch-themes.md] — Theme data model, tier gating, localStorage keys

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed 3 existing ColorPanel tests that used `button[title="..."]` selector → changed to `button[aria-label="..."]` since ThemeCard uses aria-label instead of title
- Fixed 4 ThemeCard color assertion tests: JSDOM normalizes hex colors to rgb() format → added hexToRgb helper

### Completion Notes List

- ✅ Created ThemeCard component with mini Hebrew document mockup (heading, body, code block, separator, label)
- ✅ Replaced 5-column circle radiogroup with 2-column ThemeCard visual card grid
- ✅ Implemented VS Code arrow-key navigation: ArrowLeft/Right for column movement (RTL-aware), ArrowUp/Down for row movement
- ✅ Implemented preview/commit/escape flow: arrow keys trigger live preview, Enter commits, Escape reverts to committed theme
- ✅ Premium themes preview on keyboard navigation but Enter triggers upsell toast
- ✅ Updated panel header from "הגדרות צבע" to "🎨 ערכות נושא" with new description
- ✅ Added onPreview callback prop to PresetGrid, wired through ColorPanel's handlePreview
- ✅ Legacy presets, custom presets, save form, image extraction, color pickers all preserved unchanged
- ✅ 23 new tests added (15 ThemeCard, 8 ColorPanel integration), 762 total passing

### File List

New:
- components/theme/ThemeCard.tsx
- components/theme/ThemeCard.test.tsx

Modified:
- components/theme/PresetGrid.tsx
- components/theme/ColorPanel.tsx
- components/theme/ColorPanel.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-03-24: Story 13.2 implementation complete — Color panel redesigned with theme gallery, 2-column visual card grid, VS Code navigation pattern, preview/commit flow
- 2026-03-24: Code review fixes — P1: non-persisting preview via applyColorTheme (was writing to localStorage on every arrow-key); P2: ThemeCard uses previewBg instead of #FFFFFF, label uses secondaryText; P3: legacy preset arrows flipped for RTL; P4: Escape revert works even without curated theme active (currentColors fallback); P5: code block font 8px; P6: ArrowDown no longer moves sideways at grid boundary; S1: AC1 updated for Lucide icon constraint
