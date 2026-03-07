# Story 2.2: Built-in Theme Presets

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to choose from built-in color theme presets inside the color panel,
so that I can quickly apply a polished look without manually adjusting each of the 17 colors.

## Acceptance Criteria

1. **AC1: Preset Grid Visible** — Given the user opens the color panel, when the panel is open, then a grid of 15 preset buttons is shown above the color picker sections.

2. **AC2: Preset Applied Instantly** — Given the user clicks a preset button, when the button is pressed, then all 17 color properties update immediately to the preset's values and the document preview reflects the new theme without any reload.

3. **AC3: Visual Color Preview** — Given the preset grid is visible, when the user views the preset buttons, then each button displays a small gradient preview using that preset's own colors (not a generic icon), making each button visually distinct.

4. **AC4: Hebrew Tooltip** — Given the user hovers or focuses a preset button, when the tooltip appears, then it shows the Hebrew name of the preset (e.g., "קלאסי", "אוקיינוס", "יער").

5. **AC5: Selected State Persisted** — Given the user selects a preset, when the panel is closed and reopened (or the page is reloaded), then the selected preset button is visually marked as active (ring/border indicator) and the applied colors are still present.

6. **AC6: Reset Restores Classic** — Given the user clicks the "איפוס לברירת מחדל" button (reset), when clicked, then all 17 colors revert to the classic theme AND the classic preset button becomes the active selection.

7. **AC7: Individual Color Overrides Clear Selection** — Given a preset is active, when the user manually adjusts any individual color picker, then the active preset indicator is cleared (no preset button shows as selected), signalling a custom theme.

8. **AC8: Keyboard Accessible** — Given the preset grid is visible, when the user navigates with Tab/Arrow keys, then each preset button is focusable and activatable via Enter/Space, with a visible focus ring.

## Tasks / Subtasks

- [ ] Task 1: Create `components/theme/PresetGrid.tsx` (AC: #1, #2, #3, #4, #5, #8)
  - [ ] 1.1: Import `COLOR_PRESETS` from `@/lib/colors/presets` (created in Story 2.1) and `ColorTheme` from `@/types/colors`
  - [ ] 1.2: Define `PresetGridProps` interface: `{ activePreset: string; onPresetSelect: (name: string, theme: ColorTheme) => void; }`
  - [ ] 1.3: Implement `getPresetGradient(theme: ColorTheme): string` — returns `linear-gradient(135deg, ${theme.previewBg} 0%, ${theme.h1} 50%, ${theme.link} 90%)` for visual preview
  - [ ] 1.4: Render a `div` with class `grid grid-cols-5 gap-1.5` containing one `button` per preset
  - [ ] 1.5: Each button: `style={{ background: getPresetGradient(preset.theme) }}`, `aria-label={preset.hebrewName}`, `title={preset.hebrewName}`, `type="button"`, `onClick={() => onPresetSelect(preset.name, preset.theme)}`, active ring class when `preset.name === activePreset`
  - [ ] 1.6: Button dimensions: `h-9 w-full rounded` with `transition-transform active:scale-95`, active ring: `ring-2 ring-offset-1 ring-primary`

- [ ] Task 2: Add active preset tracking and PresetGrid to `components/theme/ColorPanel.tsx` (AC: #1, #2, #5, #6, #7)
  - [ ] 2.1: Add `import { PresetGrid } from './PresetGrid'` and `import { useLocalStorage } from '@/lib/hooks/useLocalStorage'` to ColorPanel imports
  - [ ] 2.2: Define module-level `export const ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` at top of file (exported so Story 2.3 can reuse)
  - [ ] 2.3: Inside `ColorPanel` component body: `const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, 'classic')`
  - [ ] 2.4: Add `<PresetGrid>` section at the top of the scrollable content div (before the 4 color sections), with a Hebrew section heading "נושא" using class `text-sm font-semibold text-muted-foreground mb-2`
  - [ ] 2.5: Wire preset selection: `<PresetGrid activePreset={activePreset} onPresetSelect={(name, theme) => { onThemeChange(theme); setActivePreset(name); }} />`
  - [ ] 2.6: Update `handleColorChange` to also call `setActivePreset('')` — individual edits signal a custom (non-preset) theme
  - [ ] 2.7: Update reset button handler: `() => { onThemeChange(DEFAULT_CLASSIC_THEME); setActivePreset('classic'); }` (also restores classic preset active state)

- [ ] Task 3: Write tests (AC: all)
  - [ ] 3.1: In `components/theme/ColorPanel.test.tsx` — add test: clicking a preset button calls `onThemeChange` with the ocean preset's full `ColorTheme` object (spot-check 3 properties)
  - [ ] 3.2: Add test: reset button calls `onThemeChange` with `DEFAULT_CLASSIC_THEME` (already tested in Story 2.1, now verify it still passes)
  - [ ] 3.3: Add test: 15 preset buttons render in the panel (count `button[title]` elements with gradient style)
  - [ ] 3.4: Add test: after selecting a preset, the button for that preset has the `ring-2` class (active indicator)

## Dev Notes

### Prerequisite: Story 2.1 Must Be Implemented First

Story 2.2 directly depends on all artifacts created in Story 2.1:

| Artifact | Path | What 2.2 Uses |
|---|---|---|
| `COLOR_PRESETS` | `lib/colors/presets.ts` | All 15 preset definitions with Hebrew names and ColorTheme values |
| `DEFAULT_CLASSIC_THEME` | `lib/colors/defaults.ts` | Reset to classic in reset handler |
| `ColorTheme` type | `types/colors.ts` | Props type for `onPresetSelect` |
| `ColorPanel.tsx` | `components/theme/ColorPanel.tsx` | Extended with preset section in this story |
| `useLocalStorage` hook | `lib/hooks/useLocalStorage.ts` | Used inside ColorPanel for activePreset |
| shadcn Sheet | `components/ui/sheet.tsx` | Already installed by Story 2.1 |

**Do NOT implement Story 2.2 until Story 2.1 is fully done and code-reviewed.**

### `components/theme/PresetGrid.tsx` — Full Implementation

```typescript
'use client';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import type { ColorTheme } from '@/types/colors';

interface PresetGridProps {
  activePreset: string; // preset name or '' for custom
  onPresetSelect: (name: string, theme: ColorTheme) => void;
}

function getPresetGradient(theme: ColorTheme): string {
  return `linear-gradient(135deg, ${theme.previewBg} 0%, ${theme.h1} 50%, ${theme.link} 90%)`;
}

export function PresetGrid({ activePreset, onPresetSelect }: PresetGridProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="נושאי צבע">
      {COLOR_PRESETS.map((preset) => {
        const isActive = preset.name === activePreset;
        return (
          <button
            key={preset.name}
            type="button"
            aria-label={preset.hebrewName}
            aria-pressed={isActive}
            title={preset.hebrewName}
            onClick={() => onPresetSelect(preset.name, preset.theme)}
            style={{ background: getPresetGradient(preset.theme) }}
            className={[
              'h-9 w-full rounded transition-transform active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isActive ? 'ring-2 ring-primary ring-offset-1' : 'hover:scale-105',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
```

**Key decisions:**
- `aria-pressed={isActive}` provides screen reader feedback for selected state (toggle button pattern)
- `role="group"` with Hebrew aria-label on the grid wrapper for assistive tech navigation
- `hover:scale-105` only when NOT active (active preset does not scale on hover — it already has a ring)
- `active:scale-95` provides click tactile feedback regardless
- Gradient uses `previewBg → h1 → link` — gives a meaningful 3-color preview of each preset's personality

### `components/theme/ColorPanel.tsx` — Diff from Story 2.1

Story 2.1 establishes the base ColorPanel. Story 2.2 makes these targeted changes:

**Add imports at top:**
```typescript
import { PresetGrid } from './PresetGrid';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
```

**Add module-level constant (exported):**
```typescript
// Export so Story 2.3 can use the same key for custom preset persistence
export const ACTIVE_PRESET_KEY = 'marko-v2-active-preset';
```

**Inside component body — add after existing state/logic:**
```typescript
const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, 'classic');
```

**Update `handleColorChange` to clear active preset:**
```typescript
function handleColorChange(key: keyof ColorTheme, value: string) {
  onThemeChange({ ...theme, [key]: value });
  setActivePreset(''); // manual edit = custom theme, no preset selected
}
```

**Inside the scrollable `div` — add preset section BEFORE the existing SECTIONS.map block:**
```typescript
{/* Preset section */}
<div>
  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">נושא</h3>
  <PresetGrid
    activePreset={activePreset}
    onPresetSelect={(name, presetTheme) => {
      onThemeChange(presetTheme);
      setActivePreset(name);
    }}
  />
</div>
```

**Update reset button handler:**
```typescript
onClick={() => {
  onThemeChange(DEFAULT_CLASSIC_THEME);
  setActivePreset('classic');
}}
```

### Full Updated `ColorPanel.tsx`

For completeness, here is the complete file as it should look after both Story 2.1 and Story 2.2 changes are applied:

```typescript
'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { PresetGrid } from './PresetGrid';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { ColorTheme } from '@/types/colors';

// Exported so Story 2.3 can use the same key for custom preset persistence
export const ACTIVE_PRESET_KEY = 'marko-v2-active-preset';

interface ColorPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

const HEBREW_LABELS: Record<keyof ColorTheme, string> = {
  primaryText: 'טקסט ראשי',
  secondaryText: 'טקסט משני',
  link: 'קישורים',
  code: 'קוד מוטבע',
  h1: 'כותרת 1',
  h1Border: 'גבול כותרת 1',
  h2: 'כותרת 2',
  h2Border: 'גבול כותרת 2',
  h3: 'כותרת 3',
  previewBg: 'רקע תצוגה מקדימה',
  codeBg: 'רקע קוד',
  blockquoteBg: 'רקע ציטוט',
  tableHeader: 'כותרת טבלה',
  tableAlt: 'שורת טבלה חלופית',
  blockquoteBorder: 'גבול ציטוט',
  hr: 'קו הפרדה',
  tableBorder: 'גבול טבלה',
};

const SECTIONS: { title: string; keys: (keyof ColorTheme)[] }[] = [
  { title: 'טקסט', keys: ['primaryText', 'secondaryText', 'link', 'code'] },
  { title: 'כותרות', keys: ['h1', 'h1Border', 'h2', 'h2Border', 'h3'] },
  { title: 'רקעים', keys: ['previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt'] },
  { title: 'מבטאים', keys: ['blockquoteBorder', 'hr', 'tableBorder'] },
];

export function ColorPanel({ isOpen, onOpenChange, theme, onThemeChange }: ColorPanelProps) {
  const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, 'classic');

  function handleColorChange(key: keyof ColorTheme, value: string) {
    onThemeChange({ ...theme, [key]: value });
    setActivePreset(''); // manual edit = custom theme
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>הגדרות צבע</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6 pb-6">
          {/* Preset selection grid */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">נושא</h3>
            <PresetGrid
              activePreset={activePreset}
              onPresetSelect={(name, presetTheme) => {
                onThemeChange(presetTheme);
                setActivePreset(name);
              }}
            />
          </div>

          {/* Individual color pickers — 4 sections */}
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.keys.map((key) => (
                  <ColorPicker
                    key={key}
                    label={HEBREW_LABELS[key]}
                    value={theme[key]}
                    onChange={(value) => handleColorChange(key, value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              onThemeChange(DEFAULT_CLASSIC_THEME);
              setActivePreset('classic');
            }}
            className="w-full rounded border border-border px-3 py-2 text-sm
                       text-muted-foreground hover:bg-muted active:scale-[0.98] transition-colors"
          >
            איפוס לברירת מחדל
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### `COLOR_PRESETS` Data (Already in Story 2.1)

`lib/colors/presets.ts` is created by Story 2.1 and exports:
- `COLOR_PRESETS: ColorPreset[]` — array of 15 presets in order: classic, ocean, forest, sunset, mono, lavender, rose, gold, teal, night, ruby, sakura, mint, coffee, sky
- `COLOR_PRESET_MAP: Record<string, ColorTheme>` — lookup by name (used in Story 2.3)
- Each `ColorPreset` has `{ name: string; hebrewName: string; theme: ColorTheme }`

**Do NOT recreate this file in Story 2.2.** Import from `@/lib/colors/presets` directly.

### ACTIVE_PRESET_KEY and Future Stories

`ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` is exported from `ColorPanel.tsx` in this story. Story 2.3 (Custom Preset Save & Load) will need this key to determine which preset is active when saving. Import it from `ColorPanel.tsx`:
```typescript
import { ACTIVE_PRESET_KEY } from '@/components/theme/ColorPanel';
```

If in a future refactor it makes sense to move this to `lib/hooks/useColorTheme.ts` alongside `COLOR_THEME_KEY`, that's acceptable — but do not do that preemptively in this story.

### localStorage Keys in Use (Full Picture)

| Key | Set in | Used in | Value type |
|---|---|---|---|
| `marko-v2-color-theme` | `useColorTheme` hook (Story 2.1) | `useColorTheme` | `ColorTheme` (JSON) |
| `marko-v2-active-preset` | `ColorPanel` (this story) | `ColorPanel` | `string` (preset name or `''`) |
| `marko-v2-content` | `useEditorContent` hook (Story 1.1) | Editor | `string` |
| `marko-v2-direction` | direction hook (Story 1.6) | direction toggle | `'rtl' \| 'ltr'` |

### Animation Specification

Per UX design spec (animation table):
- **Preset switch:** 150ms ease-out color transition on the preview (handled automatically by CSS custom property changes — no additional animation code needed in PresetGrid)
- **Button hover scale:** handled by Tailwind `hover:scale-105` (with `transition-transform`)
- **Button click:** `active:scale-95` (100ms) per spec
- All animations must respect `prefers-reduced-motion`:
  - Tailwind's `motion-safe:` prefix: use `motion-safe:hover:scale-105` and `motion-safe:active:scale-95` instead of bare `hover:scale-105` and `active:scale-95`
  - Without `motion-safe:`, the button scales even when user prefers reduced motion

**Correct button className (motion-safe):**
```typescript
className={[
  'h-9 w-full rounded transition-transform',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
  isActive
    ? 'ring-2 ring-primary ring-offset-1'
    : 'motion-safe:hover:scale-105',
  'motion-safe:active:scale-95',
].join(' ')}
```

### Testing Requirements

Use Vitest + jsdom (configured in project). Tests co-located with component.

**`components/theme/ColorPanel.test.tsx` additions for Story 2.2:**

```typescript
import { COLOR_PRESETS } from '@/lib/colors/presets';
import { ACTIVE_PRESET_KEY } from './ColorPanel';

// Test: 15 preset buttons render
it('renders 15 preset buttons', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  // Each preset button has a title attribute (Hebrew name)
  const presetButtons = screen.getAllByRole('button').filter(btn => btn.getAttribute('title'));
  expect(presetButtons).toHaveLength(15);
});

// Test: clicking preset applies correct theme
it('calls onThemeChange with ocean preset theme when ocean button clicked', () => {
  const onThemeChange = vi.fn();
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={onThemeChange} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByTitle('אוקיינוס'));
  const oceanPreset = COLOR_PRESETS.find(p => p.name === 'ocean')!;
  expect(onThemeChange).toHaveBeenCalledWith(oceanPreset.theme);
});

// Test: active preset button has aria-pressed=true
it('shows active state on selected preset button', async () => {
  // Set active preset in localStorage
  localStorage.setItem(ACTIVE_PRESET_KEY, 'ocean');
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  expect(screen.getByTitle('אוקיינוס')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTitle('קלאסי')).toHaveAttribute('aria-pressed', 'false');
});

// Test: reset calls onThemeChange with DEFAULT_CLASSIC_THEME
it('reset button applies DEFAULT_CLASSIC_THEME', () => {
  const onThemeChange = vi.fn();
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={onThemeChange} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByText('איפוס לברירת מחדל'));
  expect(onThemeChange).toHaveBeenCalledWith(DEFAULT_CLASSIC_THEME);
});
```

### Architecture Compliance

| Rule | Compliance in this story |
|---|---|
| No direct `localStorage.setItem` in components | `useLocalStorage` hook used for `ACTIVE_PRESET_KEY` |
| CSS custom properties via `apply-colors.ts`, not style injection | `onThemeChange` calls `useColorTheme`'s setter which triggers `applyColorTheme` via `useEffect` |
| `ColorTheme` type lives in `types/colors.ts` | Imported from `@/types/colors` |
| PascalCase component files | `PresetGrid.tsx` ✓ |
| Hebrew ARIA labels on all interactive elements | `aria-label={preset.hebrewName}` ✓ |
| `prefers-reduced-motion` respected | `motion-safe:` Tailwind prefix ✓ |
| Tests co-located with components | `ColorPanel.test.tsx` ✓ |

### Anti-Patterns to Avoid

- **Do NOT** hardcode hex colors in `PresetGrid.tsx` — all colors come from `COLOR_PRESETS` data from `lib/colors/presets.ts`
- **Do NOT** call `applyColorTheme` directly in `PresetGrid` or `ColorPanel` — `onThemeChange` propagates to `useColorTheme`'s setter in the parent, which calls `applyColorTheme` via `useEffect`
- **Do NOT** import `COLOR_PRESETS` into `useColorTheme.ts` — the hook only manages theme state, not preset data
- **Do NOT** create a `useActivePreset` hook — the state is localized to `ColorPanel` and does not need to be global
- **Do NOT** manage preset state in `app/editor/page.tsx` — keep it inside `ColorPanel` to stay self-contained
- **Do NOT** reset `activePreset` when `ColorPanel` closes — the active preset should persist even when the panel is closed
- **Do NOT** add a 16th or different preset — exactly 15 built-in presets as defined in Story 2.1

### Previous Story Intelligence (Story 2.1)

Story 2.1 established:
- `useColorTheme()` returns `[ColorTheme, setColorTheme]` — tuple pattern, same as `useLocalStorage`
- `ColorPanel` receives `theme`, `onThemeChange`, `isOpen`, `onOpenChange` as props — do not change this interface
- shadcn Sheet is installed (`components/ui/sheet.tsx` exists)
- All Hebrew labels in JSX use `dir="rtl"` attribute or are placed in RTL-aware elements
- Component props typed via `interface` at top of file (before component)

### Git Intelligence

Recent commit patterns (Stories 1.1–1.7):
- One commit per story implementation — do not split across multiple commits
- Commit message format: `"Implement Story X.Y: [short description]"` then separate `"Mark Story X.Y done: post code-review status sync"` after review
- `lucide-react` icons added to existing import line (not new import statements)
- No new npm dependencies since project initialization — shadcn components only via `npx shadcn@latest add`
- Test files co-located: `ComponentName.test.tsx` next to `ComponentName.tsx`

### Project Structure Notes

**Files to CREATE (new in Story 2.2):**
- `components/theme/PresetGrid.tsx` — preset button grid component

**Files to MODIFY (existing from Story 2.1):**
- `components/theme/ColorPanel.tsx` — add preset section, active preset tracking
- `components/theme/ColorPanel.test.tsx` — add preset selection tests

**Files NOT to touch:**
- `lib/colors/presets.ts` — already has all 15 presets, do not modify
- `lib/colors/defaults.ts` — already has DEFAULT_CLASSIC_THEME, do not modify
- `lib/hooks/useColorTheme.ts` — hook signature unchanged from Story 2.1
- `types/colors.ts` — types unchanged from Story 2.1
- `app/editor/page.tsx` — no changes needed (ColorPanel is self-contained)
- `components/layout/Header.tsx` — no changes needed (palette button already in Story 2.1)
- `app/globals.css` — no changes needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2 acceptance criteria](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PresetGrid: 5-column CSS grid, gradient buttons, onClick=applyPreset](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ColorPanel section breakdown: preset grid, 17 pickers, reset/save](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Animation: preset switch 150ms ease-out, button press 100ms scale 0.97](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Accessibility: each preset button has aria-label with Hebrew preset name](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — components/theme/PresetGrid.tsx in project structure](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Color themes & presets: localStorage + optional Convex sync](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — No direct localStorage.setItem in components — centralize in custom hooks](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — CSS custom properties for 17-color system, never hardcode colors in components](../planning-artifacts/architecture.md)
- [Source: _bmad-output/implementation-artifacts/2-1-color-system-and-color-panel.md — Full ColorPanel, COLOR_PRESETS, PRESET_HEBREW_NAMES, useColorTheme specs](./2-1-color-system-and-color-panel.md)
- [Source: _bmad-output/implementation-artifacts/2-1-color-system-and-color-panel.md — COLOR_PRESET_MAP exported for Story 2.2+ lookup by name](./2-1-color-system-and-color-panel.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

### File List