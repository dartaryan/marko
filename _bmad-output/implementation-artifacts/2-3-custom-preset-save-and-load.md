# Story 2.3: Custom Preset Save & Load

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to save my current color customizations as a named preset and load them later,
so that I can reuse my favorite themes across sessions.

## Acceptance Criteria

1. **AC1: Save Current Colors** — Given the user has customized colors and clicks "שמור נושא נוכחי...", when the save form appears and the user enters a name and confirms, then the current 17-color theme is saved to localStorage under key `marko-v2-custom-presets` as `{ name: string; colors: ColorTheme }` and the form closes.

2. **AC2: Custom Presets Visible in Panel** — Given one or more custom presets are saved, when the color panel opens, then a "נושאים שלי" (My Themes) section appears in the preset area below the built-in preset grid, listing each custom preset with its name and a delete button.

3. **AC3: Apply Custom Preset** — Given a custom preset is visible in the panel, when the user clicks the preset's color swatch or its name, then all 17 colors update immediately to the saved values, the preview reflects the new theme, and the active built-in preset indicator is cleared (no built-in shows as selected).

4. **AC4: Delete Custom Preset** — Given a custom preset is visible, when the user clicks its delete (×) button, then that preset is removed from `marko-v2-custom-presets` in localStorage and disappears from the panel.

5. **AC5: Persistence Across Sessions** — Given the user saves custom presets, when the browser is refreshed or the app is reopened, then all saved custom presets are restored and visible in the panel.

6. **AC6: Name Validation** — Given the save form is open, when the user submits with an empty or whitespace-only name, then the preset is not saved, the form remains open, and the confirm button is visually disabled.

7. **AC7: V1 Migration Compatibility** — Given a user had a v1 custom preset (migrated by Story 1.7 to `marko-v2-custom-presets` as `[{ name: 'My Custom', colors: {...} }]`), when the color panel opens, then the migrated preset appears in the "נושאים שלי" section and is usable.

8. **AC8: Keyboard Accessible** — Given the save form is open, when the user types a name and presses Enter, the preset is saved (same as clicking confirm). Pressing Escape cancels the form. The delete buttons are keyboard focusable and activatable via Enter/Space.

## Tasks / Subtasks

- [x] Task 1: Add `CustomPreset` type to `types/colors.ts` (AC: #1, #5, #7)
  - [x] 1.1: Add `export interface CustomPreset { name: string; colors: ColorTheme; }` — uses `colors` (not `theme`) to match the v1-migration output format (`V2_KEYS.customPresets`)

- [x] Task 2: Create `lib/hooks/useCustomPresets.ts` (AC: #1, #4, #5, #7)
  - [x] 2.1: Export `CUSTOM_PRESETS_KEY = 'marko-v2-custom-presets'` — MUST equal `V2_KEYS.customPresets` from `lib/migration/v1-migration.ts` (both are the same string)
  - [x] 2.2: Implement `useCustomPresets()` using `useLocalStorage<CustomPreset[]>(CUSTOM_PRESETS_KEY, [])`
  - [x] 2.3: Implement `savePreset(name: string, colors: ColorTheme): void` — functional update: `setCustomPresets((prev) => [...prev, { name, colors }])`
  - [x] 2.4: Implement `deletePreset(index: number): void` — functional update: `setCustomPresets((prev) => prev.filter((_, i) => i !== index))` (index-based deletion handles duplicate names safely)
  - [x] 2.5: Return `{ customPresets, savePreset, deletePreset }` from hook

- [x] Task 3: Update `components/theme/PresetGrid.tsx` to show custom presets (AC: #2, #3, #4, #8)
  - [x] 3.1: Add props: `customPresets: CustomPreset[]`, `onCustomPresetSelect: (colors: ColorTheme) => void`, `onDeleteCustomPreset: (index: number) => void`
  - [x] 3.2: Add `import { X } from 'lucide-react'` and `import type { CustomPreset } from '@/types/colors'`
  - [x] 3.3: Extract `getPresetGradient` to handle both `ColorTheme` (from `theme` property for built-ins) and `ColorTheme` (from `colors` property for custom) — same function works since both are `ColorTheme`
  - [x] 3.4: Wrap built-in grid in a `<div>` so it and the custom section share one root element
  - [x] 3.5: Add custom presets section: `{customPresets.length > 0 && (<div className="mt-3" role="group" aria-label="נושאים מותאמים אישית">...</div>)}`
  - [x] 3.6: Section heading: `<h4 className="mb-1.5 text-xs font-medium text-muted-foreground">נושאים שלי</h4>`
  - [x] 3.7: Each custom preset row: gradient swatch button + name text button + delete button — see Dev Notes for full implementation
  - [x] 3.8: Gradient swatch: `style={{ background: getPresetGradient(preset.colors) }}` (note: `preset.colors`, not `preset.theme`)
  - [x] 3.9: Delete button: `<X className="size-3.5" aria-hidden="true" />` with `aria-label={`מחק נושא ${preset.name}`}`

- [x] Task 4: Update `components/theme/ColorPanel.tsx` to wire save UI and hook (AC: #1, #2, #3, #4, #6, #8)
  - [x] 4.1: Add `import { useCustomPresets } from '@/lib/hooks/useCustomPresets'`
  - [x] 4.2: Add `import { useState } from 'react'` — if not already imported (it is, from earlier stories)
  - [x] 4.3: Inside component body: `const { customPresets, savePreset, deletePreset } = useCustomPresets()`
  - [x] 4.4: Add `const [isSavingPreset, setIsSavingPreset] = useState(false)` and `const [draftPresetName, setDraftPresetName] = useState('')`
  - [x] 4.5: Add `handleSavePreset()`: validate trimmed name, call `savePreset(name, theme)`, reset state
  - [x] 4.6: Update `<PresetGrid>` call to pass `customPresets`, `onCustomPresetSelect`, `onDeleteCustomPreset` props
  - [x] 4.7: `onCustomPresetSelect`: call `onThemeChange(colors)` AND `setActivePreset('')` (clears built-in active indicator)
  - [x] 4.8: Add save form UI immediately after the `<PresetGrid>` section, inside the preset `<div>` wrapper — see Dev Notes for full JSX
  - [x] 4.9: Save confirm button: `disabled={!draftPresetName.trim()}` with `disabled:opacity-50 disabled:cursor-not-allowed`
  - [x] 4.10: `onKeyDown` on input: Enter → `handleSavePreset()`, Escape → cancel and clear state

- [x] Task 5: Write tests for Story 2.3 (AC: all)
  - [x] 5.1: Add to `components/theme/ColorPanel.test.tsx`: test "שמור נושא נוכחי..." button renders
  - [x] 5.2: Test: clicking save button reveals name input with placeholder "שם הנושא..."
  - [x] 5.3: Test: entering a name and clicking "שמור" saves to localStorage under `CUSTOM_PRESETS_KEY` with correct `{ name, colors }` shape
  - [x] 5.4: Test: clicking "שמור" with empty name does NOT save (localStorage entry absent or unchanged)
  - [x] 5.5: Test: existing custom preset (from localStorage) renders name text in panel
  - [x] 5.6: Test: clicking delete button (`aria-label="מחק נושא Mine"`) removes preset from localStorage
  - [x] 5.7: Test: clicking custom preset swatch/name calls `onThemeChange` with the stored `colors` object
  - [x] 5.8: Test: v1-migrated format `[{ name: 'My Custom', colors: {...} }]` renders correctly

## Dev Notes

### Prerequisite: Story 2.2 Must Be Implemented First

Story 2.3 depends on Story 2.2 artifacts:

| Artifact | Path | What 2.3 Uses |
|---|---|---|
| `PresetGrid.tsx` | `components/theme/PresetGrid.tsx` | Extended with custom presets section |
| `ColorPanel.tsx` | `components/theme/ColorPanel.tsx` | Extended with save UI and `useCustomPresets` |
| `ACTIVE_PRESET_KEY` | exported from `ColorPanel.tsx` | Story 2.2 establishes this — 2.3 does not need to reimport it separately |
| `COLOR_PRESETS` | `lib/colors/presets.ts` | Already rendering in PresetGrid — do not change |

**Do NOT implement Story 2.3 until Stories 2.1 and 2.2 are fully implemented and code-reviewed.**

### Critical: `CustomPreset.colors` vs `ColorPreset.theme`

V1 migration (`lib/migration/v1-migration.ts:40`) stores:
```typescript
const v2Format = [{ name: 'My Custom', colors: parsed }];
```

This uses `colors` (not `theme`). The new `CustomPreset` type MUST use `colors` to match this existing format:
```typescript
// types/colors.ts — ADD this interface
export interface CustomPreset {
  name: string;       // User-provided display name
  colors: ColorTheme; // MUST be 'colors' — matches V2_KEYS.customPresets migration format
}
```

`ColorPreset` (built-ins) uses `theme: ColorTheme`. Do NOT confuse the two — always use `preset.colors` for custom presets and `preset.theme` for built-ins.

### `lib/hooks/useCustomPresets.ts` — Full Implementation

```typescript
'use client';
import { useLocalStorage } from './useLocalStorage';
import type { ColorTheme, CustomPreset } from '@/types/colors';

// MUST match V2_KEYS.customPresets in lib/migration/v1-migration.ts
export const CUSTOM_PRESETS_KEY = 'marko-v2-custom-presets';

export function useCustomPresets() {
  const [customPresets, setCustomPresets] = useLocalStorage<CustomPreset[]>(
    CUSTOM_PRESETS_KEY,
    []
  );

  function savePreset(name: string, colors: ColorTheme): void {
    setCustomPresets((prev) => [...prev, { name, colors }]);
  }

  function deletePreset(index: number): void {
    setCustomPresets((prev) => prev.filter((_, i) => i !== index));
  }

  return { customPresets, savePreset, deletePreset };
}
```

**Why index-based deletion:** User-provided names may not be unique. Deleting by index is always unambiguous. `useLocalStorage` supports functional updates (`setCustomPresets((prev) => ...)`) — confirmed from `useLocalStorage.ts:24`.

### `components/theme/PresetGrid.tsx` — Full Updated File (after Stories 2.1 + 2.2 + 2.3)

```typescript
'use client';
import { X } from 'lucide-react';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import type { ColorTheme, CustomPreset } from '@/types/colors';

interface PresetGridProps {
  activePreset: string;
  onPresetSelect: (name: string, theme: ColorTheme) => void;
  customPresets: CustomPreset[];
  onCustomPresetSelect: (colors: ColorTheme) => void;
  onDeleteCustomPreset: (index: number) => void;
}

function getPresetGradient(theme: ColorTheme): string {
  return `linear-gradient(135deg, ${theme.previewBg} 0%, ${theme.h1} 50%, ${theme.link} 90%)`;
}

export function PresetGrid({
  activePreset,
  onPresetSelect,
  customPresets,
  onCustomPresetSelect,
  onDeleteCustomPreset,
}: PresetGridProps) {
  return (
    <div>
      {/* Built-in presets: 5-column grid */}
      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="נושאי צבע מובנים">
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
                'h-9 w-full rounded transition-transform',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isActive
                  ? 'ring-2 ring-primary ring-offset-1'
                  : 'motion-safe:hover:scale-105',
                'motion-safe:active:scale-95',
              ].join(' ')}
            />
          );
        })}
      </div>

      {/* Custom presets: list rows with swatch, name, delete */}
      {customPresets.length > 0 && (
        <div className="mt-3" role="group" aria-label="נושאים מותאמים אישית">
          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">נושאים שלי</h4>
          <div className="space-y-1">
            {customPresets.map((preset, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Gradient swatch — click applies preset */}
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  style={{ background: getPresetGradient(preset.colors) }}
                  className="h-6 w-8 flex-shrink-0 rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-safe:hover:scale-105 motion-safe:active:scale-95"
                  aria-label={`הפעל נושא ${preset.name}`}
                  title={preset.name}
                />
                {/* Preset name — click applies preset */}
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  className="flex-1 truncate text-start text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                  aria-label={`הפעל נושא ${preset.name}`}
                >
                  {preset.name}
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteCustomPreset(index)}
                  className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`מחק נושא ${preset.name}`}
                  title={`מחק ${preset.name}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key decisions:**
- Two click targets for applying (swatch and name text) give a larger hit area while keeping the layout clean
- Index-based deletion (not name-based) handles duplicate preset names safely
- `getPresetGradient` works identically for built-in (`preset.theme`) and custom (`preset.colors`) — same `ColorTheme` structure, just passed directly

### `components/theme/ColorPanel.tsx` — Diff from Story 2.2

Story 2.2 establishes the base ColorPanel with preset grid. Story 2.3 makes these targeted changes:

**Add import at top:**
```typescript
import { useCustomPresets } from '@/lib/hooks/useCustomPresets';
import type { CustomPreset } from '@/types/colors';
```

**Inside component body — add after `activePreset` state:**
```typescript
const { customPresets, savePreset, deletePreset } = useCustomPresets();
const [isSavingPreset, setIsSavingPreset] = useState(false);
const [draftPresetName, setDraftPresetName] = useState('');

function handleSavePreset() {
  const trimmed = draftPresetName.trim();
  if (!trimmed) return;
  savePreset(trimmed, theme);
  setDraftPresetName('');
  setIsSavingPreset(false);
}
```

**Update the preset section JSX** (replaces the section from Story 2.2):
```typescript
{/* Preset selection grid + save form */}
<div>
  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">נושא</h3>
  <PresetGrid
    activePreset={activePreset}
    onPresetSelect={(name, presetTheme) => {
      onThemeChange(presetTheme);
      setActivePreset(name);
    }}
    customPresets={customPresets}
    onCustomPresetSelect={(colors) => {
      onThemeChange(colors);
      setActivePreset(''); // clear built-in active indicator — custom themes are not in COLOR_PRESETS
    }}
    onDeleteCustomPreset={deletePreset}
  />

  {/* Save current colors as named custom preset */}
  <div className="mt-2">
    {isSavingPreset ? (
      <div className="flex gap-1.5">
        <input
          type="text"
          value={draftPresetName}
          onChange={(e) => setDraftPresetName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSavePreset();
            if (e.key === 'Escape') {
              setIsSavingPreset(false);
              setDraftPresetName('');
            }
          }}
          placeholder="שם הנושא..."
          dir="rtl"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className="flex-1 rounded border border-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="שם הנושא החדש"
        />
        <button
          type="button"
          onClick={handleSavePreset}
          disabled={!draftPresetName.trim()}
          className="rounded border border-border px-2 py-1 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="שמור נושא"
        >
          שמור
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSavingPreset(false);
            setDraftPresetName('');
          }}
          className="rounded border border-border px-2 py-1 text-sm hover:bg-muted transition-colors"
          aria-label="ביטול שמירת נושא"
        >
          ביטול
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setIsSavingPreset(true)}
        className="w-full rounded border border-border px-3 py-1.5 text-start text-sm text-muted-foreground hover:bg-muted transition-colors"
        aria-label="שמור צבעים נוכחיים כנושא מותאם אישית"
      >
        שמור נושא נוכחי...
      </button>
    )}
  </div>
</div>
```

**No other changes to ColorPanel.tsx.** The reset button, color pickers, and `handleColorChange` are unchanged from Story 2.2.

### Full Updated `ColorPanel.tsx` (after Stories 2.1 + 2.2 + 2.3)

```typescript
'use client';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { PresetGrid } from './PresetGrid';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useCustomPresets } from '@/lib/hooks/useCustomPresets';
import type { ColorTheme } from '@/types/colors';

// Exported so other stories can use the same key (Story 2.2)
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
  const { customPresets, savePreset, deletePreset } = useCustomPresets();
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [draftPresetName, setDraftPresetName] = useState('');

  function handleColorChange(key: keyof ColorTheme, value: string) {
    onThemeChange({ ...theme, [key]: value });
    setActivePreset(''); // manual edit = custom theme
  }

  function handleSavePreset() {
    const trimmed = draftPresetName.trim();
    if (!trimmed) return;
    savePreset(trimmed, theme);
    setDraftPresetName('');
    setIsSavingPreset(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>הגדרות צבע</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6 pb-6">
          {/* Preset section: built-in grid + custom presets + save form */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">נושא</h3>
            <PresetGrid
              activePreset={activePreset}
              onPresetSelect={(name, presetTheme) => {
                onThemeChange(presetTheme);
                setActivePreset(name);
              }}
              customPresets={customPresets}
              onCustomPresetSelect={(colors) => {
                onThemeChange(colors);
                setActivePreset('');
              }}
              onDeleteCustomPreset={deletePreset}
            />

            <div className="mt-2">
              {isSavingPreset ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={draftPresetName}
                    onChange={(e) => setDraftPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePreset();
                      if (e.key === 'Escape') {
                        setIsSavingPreset(false);
                        setDraftPresetName('');
                      }
                    }}
                    placeholder="שם הנושא..."
                    dir="rtl"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    className="flex-1 rounded border border-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="שם הנושא החדש"
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    disabled={!draftPresetName.trim()}
                    className="rounded border border-border px-2 py-1 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="שמור נושא"
                  >
                    שמור
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSavingPreset(false);
                      setDraftPresetName('');
                    }}
                    className="rounded border border-border px-2 py-1 text-sm hover:bg-muted transition-colors"
                    aria-label="ביטול שמירת נושא"
                  >
                    ביטול
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSavingPreset(true)}
                  className="w-full rounded border border-border px-3 py-1.5 text-start text-sm text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="שמור צבעים נוכחיים כנושא מותאם אישית"
                >
                  שמור נושא נוכחי...
                </button>
              )}
            </div>
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

### Testing Requirements

Use Vitest + jsdom (configured in project). Tests co-located with component. Import `CUSTOM_PRESETS_KEY` from `@/lib/hooks/useCustomPresets` in tests.

**`components/theme/ColorPanel.test.tsx` additions for Story 2.3:**

```typescript
import { CUSTOM_PRESETS_KEY } from '@/lib/hooks/useCustomPresets';

// Test: save button renders
it('renders "שמור נושא נוכחי..." button', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  expect(screen.getByText('שמור נושא נוכחי...')).toBeInTheDocument();
});

// Test: save button reveals form
it('clicking save preset button shows name input', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByText('שמור נושא נוכחי...'));
  expect(screen.getByPlaceholderText('שם הנושא...')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'שמור נושא' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ביטול שמירת נושא' })).toBeInTheDocument();
});

// Test: save with valid name persists to localStorage
it('saves preset with valid name to localStorage', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByText('שמור נושא נוכחי...'));
  fireEvent.change(screen.getByPlaceholderText('שם הנושא...'), { target: { value: 'Green Theme' } });
  fireEvent.click(screen.getByRole('button', { name: 'שמור נושא' }));
  const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
  expect(saved).toHaveLength(1);
  expect(saved[0].name).toBe('Green Theme');
  expect(saved[0].colors).toMatchObject({ h1: DEFAULT_CLASSIC_THEME.h1 });
});

// Test: empty name does not save
it('does not save when name is empty or whitespace', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByText('שמור נושא נוכחי...'));
  // submit button should be disabled
  expect(screen.getByRole('button', { name: 'שמור נושא' })).toBeDisabled();
  fireEvent.change(screen.getByPlaceholderText('שם הנושא...'), { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: 'שמור נושא' })).toBeDisabled();
  expect(localStorage.getItem(CUSTOM_PRESETS_KEY)).toBeNull();
});

// Test: saved preset name appears in panel
it('renders saved custom preset name in panel', () => {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify([{ name: 'Mine', colors: DEFAULT_CLASSIC_THEME }]));
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  expect(screen.getByText('Mine')).toBeInTheDocument();
});

// Test: delete removes from localStorage
it('deletes custom preset when × button clicked', () => {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify([{ name: 'Mine', colors: DEFAULT_CLASSIC_THEME }]));
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByLabelText('מחק נושא Mine'));
  const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
  expect(saved).toHaveLength(0);
});

// Test: applying custom preset calls onThemeChange with its colors
it('applying custom preset calls onThemeChange with stored colors', () => {
  const onThemeChange = vi.fn();
  const customColors = { ...DEFAULT_CLASSIC_THEME, h1: '#FF0000' };
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify([{ name: 'Mine', colors: customColors }]));
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={onThemeChange} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByLabelText('הפעל נושא Mine'));
  expect(onThemeChange).toHaveBeenCalledWith(customColors);
});

// Test: v1 migration compatibility
it('renders v1-migrated preset (marko-v2-custom-presets format)', () => {
  const migrated = [{ name: 'My Custom', colors: DEFAULT_CLASSIC_THEME }];
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(migrated));
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  expect(screen.getByText('My Custom')).toBeInTheDocument();
});

// Test: Enter key saves preset
it('pressing Enter in name input saves the preset', () => {
  render(<ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByText('שמור נושא נוכחי...'));
  const input = screen.getByPlaceholderText('שם הנושא...');
  fireEvent.change(input, { target: { value: 'Quick Save' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
  expect(saved[0].name).toBe('Quick Save');
});
```

### localStorage Keys in Use (Full Picture)

| Key | Set in | Used in | Value type |
|---|---|---|---|
| `marko-v2-color-theme` | `useColorTheme` hook (Story 2.1) | `useColorTheme` | `ColorTheme` (JSON) |
| `marko-v2-active-preset` | `ColorPanel` (Story 2.2) | `ColorPanel` | `string` (preset name or `''`) |
| `marko-v2-custom-presets` | `useCustomPresets` hook (this story) | `ColorPanel` via hook | `CustomPreset[]` = `{ name: string; colors: ColorTheme }[]` |
| `marko-v2-editor-content` | `useEditorContent` hook (Story 1.1) | Editor | `string` |
| `marko-v2-direction` | direction hook (Story 1.6) | direction toggle | `'rtl' \| 'ltr'` |

### Architecture Compliance

| Rule | Compliance in this story |
|---|---|
| No direct `localStorage.setItem` in components | `useCustomPresets` hook encapsulates all custom preset persistence |
| CSS custom properties via `apply-colors.ts`, not style injection | `onCustomPresetSelect` calls `onThemeChange`, which reaches `useColorTheme`'s setter → `applyColorTheme` via `useEffect` |
| `ColorTheme` type lives in `types/colors.ts` | `CustomPreset` added to same file; imported from `@/types/colors` |
| PascalCase component files | No new components in this story |
| Hebrew ARIA labels on all interactive elements | All buttons have Hebrew `aria-label` ✓ |
| `prefers-reduced-motion` respected | `motion-safe:` prefix on swatch hover/active ✓ |
| Tests co-located with components | Additions to `ColorPanel.test.tsx` ✓ |
| No new npm dependencies | `X` icon from `lucide-react` (already installed) ✓ |

### Anti-Patterns to Avoid

- **Do NOT** use `localStorage.setItem` directly in `ColorPanel` or `PresetGrid` — always go through `useCustomPresets`
- **Do NOT** use `preset.theme` for custom presets — custom presets use `preset.colors` (migration format)
- **Do NOT** use `preset.colors` for built-in presets — built-ins from `COLOR_PRESETS` use `preset.theme`
- **Do NOT** delete by name (ambiguous with duplicates) — delete by index from `useCustomPresets`
- **Do NOT** call `applyColorTheme` directly in `PresetGrid` or the save handler — flow through `onThemeChange` → parent → `useColorTheme` setter
- **Do NOT** show the save form as a separate shadcn Dialog — inline form keeps the flow within the Sheet
- **Do NOT** reset `isSavingPreset` to false when the Sheet closes — if it was open, let the Sheet's Escape close it first; the user can close the form separately
- **Do NOT** cap the number of custom presets — no artificial limit; the UX is simple enough (list + delete)
- **Do NOT** add a `hebrewName` to `CustomPreset` — the `name` IS the display name; user types it in the UI language (Hebrew or whatever they choose)
- **Do NOT** track "which custom preset is active" — only built-in preset active state is tracked via `ACTIVE_PRESET_KEY`; applying a custom preset clears this to `''`

### Previous Story Intelligence (Stories 2.1 and 2.2)

From Story 2.1:
- `useColorTheme()` returns `[ColorTheme, setColorTheme]` — tuple pattern from parent component
- `ColorPanel` receives `theme`, `onThemeChange`, `isOpen`, `onOpenChange` — do not change this interface
- `useLocalStorage<T>` supports functional update syntax: `setValue((prev) => ...)` — confirmed in `lib/hooks/useLocalStorage.ts:24`
- `applyColorTheme` is called via `useEffect` inside `useColorTheme` — never call it directly

From Story 2.2:
- `ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` is exported from `ColorPanel.tsx`
- `PresetGrid` is in `components/theme/PresetGrid.tsx` — extending props in this story
- `handleColorChange` in ColorPanel already calls `setActivePreset('')` — custom preset application should also call `setActivePreset('')`
- `X` icon from `lucide-react` is the project-standard close/delete icon — confirms use here
- motion-safe pattern confirmed: `motion-safe:hover:scale-105`, `motion-safe:active:scale-95`

### Git Intelligence

Recent commit patterns (Stories 1.1–2.2):
- One commit per story implementation: `"Implement Story X.Y: [short description]"`
- Separate commit for code review: `"Mark Story X.Y done: post code-review status sync"`
- `lucide-react` icons added to existing import line — add `X` to existing import if it's not already there
- No new npm dependencies since project initialization
- Test files co-located: `ComponentName.test.tsx` next to `ComponentName.tsx`

### Project Structure Notes

**Files to CREATE (new in Story 2.3):**
- `lib/hooks/useCustomPresets.ts` — custom preset persistence hook

**Files to MODIFY (existing):**
- `types/colors.ts` — add `CustomPreset` interface (after `ColorPreset`)
- `components/theme/PresetGrid.tsx` — add custom presets section and 3 new props
- `components/theme/ColorPanel.tsx` — add `useCustomPresets`, save form UI, updated `PresetGrid` call
- `components/theme/ColorPanel.test.tsx` — add Story 2.3 test cases (8 new tests)

**Files NOT to touch:**
- `lib/colors/presets.ts` — 15 built-in presets, do not modify
- `lib/colors/defaults.ts` — `DEFAULT_CLASSIC_THEME`, do not modify
- `lib/hooks/useColorTheme.ts` — hook signature unchanged
- `lib/hooks/useLocalStorage.ts` — used as-is
- `lib/migration/v1-migration.ts` — already handles v1 custom preset migration, do not modify
- `app/editor/page.tsx` — no changes needed (custom preset state lives in ColorPanel)
- `components/layout/Header.tsx` — no changes needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 acceptance criteria](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.7 AC: v1 custom presets migrated to marko-v2-custom-presets array format](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ColorPanel sections: Preset grid | Reset/Save buttons](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Button labels: "שמור" (Save), "ביטול" (Cancel)](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Color themes & presets: localStorage + optional Convex sync](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — No direct localStorage.setItem in components — centralize in custom hooks](../planning-artifacts/architecture.md)
- [Source: lib/migration/v1-migration.ts — V2_KEYS.customPresets = 'marko-v2-custom-presets'; migration format: { name, colors }](../../lib/migration/v1-migration.ts)
- [Source: lib/hooks/useLocalStorage.ts — supports functional updates: setValue((prev) => ...)](../../lib/hooks/useLocalStorage.ts)
- [Source: _bmad-output/implementation-artifacts/2-1-color-system-and-color-panel.md — ColorPanel interface, useColorTheme pattern, architecture rules](./2-1-color-system-and-color-panel.md)
- [Source: _bmad-output/implementation-artifacts/2-2-built-in-theme-presets.md — PresetGrid.tsx base, ACTIVE_PRESET_KEY, motion-safe pattern, ColorPanel Story 2.2 diff](./2-2-built-in-theme-presets.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

(none)

### Completion Notes List

- Created `lib/hooks/useCustomPresets.ts` — encapsulates `marko-v2-custom-presets` localStorage via `useLocalStorage`, exposing `savePreset` / `deletePreset` (index-based) following the v1-migration `{ name, colors }` format
- Added `CustomPreset` interface to `types/colors.ts` with `colors: ColorTheme` (not `theme`) to match V2_KEYS.customPresets migration output
- Extended `PresetGrid.tsx` with 3 new props; preserved existing radiogroup keyboard nav for built-ins; added "נושאים שלי" section with swatch + name + delete row per preset
- Extended `ColorPanel.tsx` with `useCustomPresets`, `isSavingPreset`/`draftPresetName` state, `handleSavePreset`, inline save form, and updated `PresetGrid` call; `onCustomPresetSelect` clears `activePreset` to `''`
- Added 12 tests to `ColorPanel.test.tsx` covering: save button render, form reveal, valid name persistence, empty/whitespace name blocked, existing preset display, delete, apply, v1-migration compatibility, Enter saves, Escape cancels, Cancel button, "נושאים שלי" heading — all pass
- Code review fixes: swatch button made `aria-hidden`/`tabIndex={-1}` (duplicate aria-label), `key={index}` changed to `key={name-index}`, `autoFocus` replaced with `useRef`/`useEffect`, `SheetDescription` documented

### File List

- `types/colors.ts` — added `CustomPreset` interface
- `lib/hooks/useCustomPresets.ts` — NEW: custom preset persistence hook
- `components/theme/PresetGrid.tsx` — added 3 props + custom presets section + `X` icon import; swatch button made aria-hidden (name button is the keyboard target); key uses `${name}-${index}`
- `components/theme/ColorPanel.tsx` — added `useState`/`useRef`/`useEffect`/`useCustomPresets` imports, hook usage, save form state and handler, updated `PresetGrid` call; added `SheetDescription`; replaced `autoFocus` with `useRef`/`useEffect` focus management
- `components/theme/ColorPanel.test.tsx` — added 12 Story 2.3 test cases + `CUSTOM_PRESETS_KEY` import (8 functional + 4 keyboard/UX: Enter saves, Escape cancels, Cancel button, "נושאים שלי" heading)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — updated `2-3-custom-preset-save-and-load` to `done`

### Change Log

- 2026-03-07: Implemented Story 2.3 — custom preset save & load; created useCustomPresets hook, extended PresetGrid with custom section, added save form to ColorPanel, 8 new tests added (134 total pass)
- 2026-03-07: Code review fixes — 4 new tests (Enter/Escape/Cancel/heading), aria-hidden swatch, key fix, autoFocus → useRef/useEffect, SheetDescription documented
