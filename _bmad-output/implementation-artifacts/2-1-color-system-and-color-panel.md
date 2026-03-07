# Story 2.1: Color System & Color Panel

Status: done

## Story

As a user,
I want to customize 17 color properties of my document preview through an interactive color panel,
so that I can personalize the look and feel of my documents.

## Acceptance Criteria (BDD)

1. **AC1: Panel Opening** — Given the user clicks the palette icon button in the header, when the button is pressed, then the color panel slides in from the right as a Sheet overlay with animation duration <300ms.

2. **AC2: Real-Time Preview** — Given the color panel is open, when the user adjusts any of the 17 color pickers, then the document preview updates in real-time to reflect the new color.

3. **AC3: CSS Custom Properties** — Given a color picker value changes, when the color is applied, then it is written to the corresponding CSS custom property on `document.documentElement` (e.g., `--color-primary-text`, `--color-h1`, `--color-preview-bg`).

4. **AC4: Hebrew Labels** — Given the color panel is open, when viewed, then each color picker row has a Hebrew label identifying the color property.

5. **AC5: Default Classic Theme** — Given a user opens the app for the first time (no localStorage data), when the color panel opens, then the "classic" v2 default theme is loaded (values from `lib/colors/defaults.ts`, matching `app/globals.css` `:root` values).

6. **AC6: Persistence** — Given the user customizes colors and closes the panel, when the app is reloaded, then the customized colors are restored from localStorage key `marko-v2-color-theme`.

7. **AC7: Reset to Default** — Given the user has customized colors, when they click the "איפוס לברירת מחדל" button, then all 17 colors reset to the classic defaults and the preview updates immediately.

8. **AC8: Focus Trapping** — Given the color panel is open, when the user presses Tab, then focus cycles within the panel and does not reach elements behind the overlay (shadcn Sheet handles this natively).

9. **AC9: Keyboard Dismiss** — Given the color panel is open, when the user presses Escape, then the panel closes and focus returns to the trigger button.

10. **AC10: Organized Sections** — Given the color panel is open, when viewed, then the 17 color pickers are organized into 4 labeled sections in Hebrew: "טקסט" (4), "כותרות" (5), "רקעים" (5), "מבטאים" (3).

## Tasks / Subtasks

- [x] Task 1: Create color type definitions (AC: #2, #3, #5)
  - [x] 1.1: Create `types/colors.ts` with `ColorTheme` interface (17 camelCase properties) and `ColorPreset` type
- [x] Task 2: Create color data files (AC: #2, #3, #5, #7)
  - [x] 2.1: Create `lib/colors/defaults.ts` exporting `DEFAULT_CLASSIC_THEME` (values matching `app/globals.css` `:root` block)
  - [x] 2.2: Create `lib/colors/presets.ts` exporting `COLOR_PRESETS` record with all 15 built-in presets ported from v1 (exact values — see Dev Notes)
  - [x] 2.3: Create `lib/colors/apply-colors.ts` exporting `applyColorTheme(theme: ColorTheme): void` using `document.documentElement.style.setProperty`
- [x] Task 3: Create useColorTheme hook (AC: #5, #6)
  - [x] 3.1: Create `lib/hooks/useColorTheme.ts` using `useLocalStorage<ColorTheme>(COLOR_THEME_KEY, DEFAULT_CLASSIC_THEME)`
  - [x] 3.2: Export `COLOR_THEME_KEY = 'marko-v2-color-theme'` constant (must match `V2_KEYS.colorTheme` in `lib/migration/v1-migration.ts`)
  - [x] 3.3: Call `applyColorTheme(colorTheme)` inside `useEffect([colorTheme])` to apply on mount + every change
- [x] Task 4: Install shadcn Sheet and create components (AC: #1, #4, #8, #9, #10)
  - [x] 4.1: Install shadcn Sheet: `npx shadcn@latest add sheet` (no shadcn components installed yet — `components/ui/` does not exist)
  - [x] 4.2: Create `components/theme/ColorPicker.tsx` — dual-input row: color `<input type="color">` + hex text input with Hebrew label
  - [x] 4.3: Create `components/theme/ColorPanel.tsx` — controlled Sheet (side="right"), 4 Hebrew sections, 17 ColorPicker rows, reset button
- [x] Task 5: Wire up in editor (AC: #1, #2, #6)
  - [x] 5.1: Add `onOpenColorPanel?: () => void` prop to `components/layout/Header.tsx`; add Palette icon button to utility group
  - [x] 5.2: In `app/editor/page.tsx`: add `useColorTheme()` hook, `isColorPanelOpen` state, render `<ColorPanel>`, pass `onOpenColorPanel` to Header
- [x] Task 6: Write tests (AC: all)
  - [x] 6.1: Create `components/theme/ColorPanel.test.tsx` — test Hebrew section headers render, color change calls onThemeChange, reset restores defaults
  - [x] 6.2: Test `apply-colors.ts` sets correct CSS custom properties on `document.documentElement`

## Dev Notes

### Prerequisite: Story 1.7

Story 1.7 (`lib/migration/v1-migration.ts`) must be implemented before this story. The migration writes migrated v1 colors to `marko-v2-color-theme`, which `useColorTheme` then reads on first load. The `COLOR_THEME_KEY` constant in `useColorTheme.ts` **must equal** `V2_KEYS.colorTheme` exported from `lib/migration/v1-migration.ts`. They are the same string: `'marko-v2-color-theme'`.

### ColorTheme Type (`types/colors.ts`)

```typescript
// types/colors.ts

export interface ColorTheme {
  // Text (4)
  primaryText: string;
  secondaryText: string;
  link: string;
  code: string;
  // Headings (5)
  h1: string;
  h1Border: string;
  h2: string;
  h2Border: string;
  h3: string;
  // Backgrounds (5)
  previewBg: string;
  codeBg: string;
  blockquoteBg: string;
  tableHeader: string;
  tableAlt: string;
  // Accents (3)
  blockquoteBorder: string;
  hr: string;
  tableBorder: string;
}

export interface ColorPreset {
  name: string;        // English key (e.g., 'classic')
  hebrewName: string;  // Hebrew label for UI
  theme: ColorTheme;
}
```

### CSS Custom Property Mapping

EXACT mapping from `ColorTheme` property to CSS custom property (as defined in `app/globals.css`):

| ColorTheme property | CSS custom property |
|---|---|
| `primaryText` | `--color-primary-text` |
| `secondaryText` | `--color-secondary-text` |
| `link` | `--color-link` |
| `code` | `--color-code` |
| `h1` | `--color-h1` |
| `h1Border` | `--color-h1-border` |
| `h2` | `--color-h2` |
| `h2Border` | `--color-h2-border` |
| `h3` | `--color-h3` |
| `previewBg` | `--color-preview-bg` |
| `codeBg` | `--color-code-bg` |
| `blockquoteBg` | `--color-blockquote-bg` |
| `tableHeader` | `--color-table-header` |
| `tableAlt` | `--color-table-alt` |
| `blockquoteBorder` | `--color-blockquote-border` |
| `hr` | `--color-hr` |
| `tableBorder` | `--color-table-border` |

### `lib/colors/apply-colors.ts`

**CRITICAL: Use `document.documentElement.style.setProperty`, NOT a `<style>` element injection (that was v1's approach).**

Inline styles on `<html>` have higher specificity than both `:root` (globals.css light) and `.dark` (globals.css dark), so user-chosen colors override both modes — correct per spec ("document preview colors independent of UI dark/light mode").

```typescript
import type { ColorTheme } from '@/types/colors';

const CSS_VAR_MAP: Record<keyof ColorTheme, string> = {
  primaryText: '--color-primary-text',
  secondaryText: '--color-secondary-text',
  link: '--color-link',
  code: '--color-code',
  h1: '--color-h1',
  h1Border: '--color-h1-border',
  h2: '--color-h2',
  h2Border: '--color-h2-border',
  h3: '--color-h3',
  previewBg: '--color-preview-bg',
  codeBg: '--color-code-bg',
  blockquoteBg: '--color-blockquote-bg',
  tableHeader: '--color-table-header',
  tableAlt: '--color-table-alt',
  blockquoteBorder: '--color-blockquote-border',
  hr: '--color-hr',
  tableBorder: '--color-table-border',
};

export function applyColorTheme(theme: ColorTheme): void {
  if (typeof document === 'undefined') return; // SSR guard
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as Array<keyof ColorTheme>).forEach((key) => {
    root.style.setProperty(CSS_VAR_MAP[key], theme[key]);
  });
}
```

### `lib/colors/defaults.ts`

Values MUST match the `:root` block in `app/globals.css` exactly (these are the v2 "classic" defaults — note they differ from v1's forest-green default):

```typescript
import type { ColorTheme } from '@/types/colors';

export const DEFAULT_CLASSIC_THEME: ColorTheme = {
  primaryText: '#333333',
  secondaryText: '#666666',
  link: '#10B981',
  code: '#e83e8c',
  h1: '#065f46',
  h1Border: '#10B981',
  h2: '#047857',
  h2Border: '#34d399',
  h3: '#059669',
  previewBg: '#ffffff',
  codeBg: '#f8f8f8',
  blockquoteBg: '#f0fdf4',
  tableHeader: '#ecfdf5',
  tableAlt: '#f8fafb',
  blockquoteBorder: '#10B981',
  hr: '#d1d5db',
  tableBorder: '#d1d5db',
};
```

### `lib/colors/presets.ts` — All 15 Built-In Presets (Exact V1 Values)

The "classic" preset matches `DEFAULT_CLASSIC_THEME` (v2 defaults). The other 14 are ported exactly from `docs/reference-data/index.html` lines 3834–4102.

```typescript
import type { ColorTheme, ColorPreset } from '@/types/colors';
import { DEFAULT_CLASSIC_THEME } from './defaults';

const PRESET_THEMES: Record<string, ColorTheme> = {
  classic: { ...DEFAULT_CLASSIC_THEME },
  ocean: {
    primaryText: '#0C4A6E', secondaryText: '#0369A1', link: '#0EA5E9', code: '#0EA5E9',
    h1: '#0C4A6E', h1Border: '#0EA5E9', h2: '#0C4A6E', h2Border: '#38BDF8', h3: '#0369A1',
    previewBg: '#FFFFFF', codeBg: '#0F172A', blockquoteBg: '#F0F9FF',
    tableHeader: '#0EA5E9', tableAlt: '#F0F9FF', blockquoteBorder: '#0EA5E9',
    hr: '#0EA5E9', tableBorder: '#BAE6FD',
  },
  forest: {
    primaryText: '#14532D', secondaryText: '#15803D', link: '#22C55E', code: '#22C55E',
    h1: '#14532D', h1Border: '#22C55E', h2: '#14532D', h2Border: '#4ADE80', h3: '#15803D',
    previewBg: '#FFFFFF', codeBg: '#0F1A14', blockquoteBg: '#F0FDF4',
    tableHeader: '#22C55E', tableAlt: '#DCFCE7', blockquoteBorder: '#22C55E',
    hr: '#22C55E', tableBorder: '#BBF7D0',
  },
  sunset: {
    primaryText: '#7C2D12', secondaryText: '#C2410C', link: '#F97316', code: '#F97316',
    h1: '#7C2D12', h1Border: '#F97316', h2: '#7C2D12', h2Border: '#FB923C', h3: '#C2410C',
    previewBg: '#FFFBEB', codeBg: '#1C1917', blockquoteBg: '#FFF7ED',
    tableHeader: '#F97316', tableAlt: '#FFEDD5', blockquoteBorder: '#F97316',
    hr: '#F97316', tableBorder: '#FED7AA',
  },
  mono: {
    primaryText: '#1F2937', secondaryText: '#4B5563', link: '#6B7280', code: '#374151',
    h1: '#111827', h1Border: '#6B7280', h2: '#1F2937', h2Border: '#9CA3AF', h3: '#374151',
    previewBg: '#FFFFFF', codeBg: '#111827', blockquoteBg: '#F9FAFB',
    tableHeader: '#4B5563', tableAlt: '#F3F4F6', blockquoteBorder: '#6B7280',
    hr: '#6B7280', tableBorder: '#E5E7EB',
  },
  lavender: {
    primaryText: '#4C1D95', secondaryText: '#6D28D9', link: '#8B5CF6', code: '#8B5CF6',
    h1: '#4C1D95', h1Border: '#8B5CF6', h2: '#4C1D95', h2Border: '#A78BFA', h3: '#6D28D9',
    previewBg: '#FAFAFE', codeBg: '#1E1B4B', blockquoteBg: '#F5F3FF',
    tableHeader: '#8B5CF6', tableAlt: '#EDE9FE', blockquoteBorder: '#8B5CF6',
    hr: '#8B5CF6', tableBorder: '#DDD6FE',
  },
  rose: {
    primaryText: '#881337', secondaryText: '#BE123C', link: '#F43F5E', code: '#F43F5E',
    h1: '#881337', h1Border: '#F43F5E', h2: '#881337', h2Border: '#FB7185', h3: '#BE123C',
    previewBg: '#FFF1F2', codeBg: '#1C1917', blockquoteBg: '#FFF1F2',
    tableHeader: '#F43F5E', tableAlt: '#FFE4E6', blockquoteBorder: '#F43F5E',
    hr: '#F43F5E', tableBorder: '#FECDD3',
  },
  gold: {
    primaryText: '#78350F', secondaryText: '#B45309', link: '#F59E0B', code: '#D97706',
    h1: '#78350F', h1Border: '#F59E0B', h2: '#78350F', h2Border: '#FBBF24', h3: '#B45309',
    previewBg: '#FFFBEB', codeBg: '#1C1917', blockquoteBg: '#FEF3C7',
    tableHeader: '#F59E0B', tableAlt: '#FEF3C7', blockquoteBorder: '#F59E0B',
    hr: '#F59E0B', tableBorder: '#FDE68A',
  },
  teal: {
    primaryText: '#134E4A', secondaryText: '#0F766E', link: '#14B8A6', code: '#14B8A6',
    h1: '#134E4A', h1Border: '#14B8A6', h2: '#134E4A', h2Border: '#2DD4BF', h3: '#0F766E',
    previewBg: '#FFFFFF', codeBg: '#0F1A1A', blockquoteBg: '#F0FDFA',
    tableHeader: '#14B8A6', tableAlt: '#CCFBF1', blockquoteBorder: '#14B8A6',
    hr: '#14B8A6', tableBorder: '#99F6E4',
  },
  night: {
    primaryText: '#E2E8F0', secondaryText: '#94A3B8', link: '#60A5FA', code: '#60A5FA',
    h1: '#F1F5F9', h1Border: '#3B82F6', h2: '#E2E8F0', h2Border: '#60A5FA', h3: '#CBD5E1',
    previewBg: '#0F172A', codeBg: '#020617', blockquoteBg: '#1E293B',
    tableHeader: '#334155', tableAlt: '#1E293B', blockquoteBorder: '#3B82F6',
    hr: '#3B82F6', tableBorder: '#334155',
  },
  ruby: {
    primaryText: '#1A1A1A', secondaryText: '#3D3D3D', link: '#E10514', code: '#E10514',
    h1: '#1A1A1A', h1Border: '#E10514', h2: '#3D3D3D', h2Border: '#E10514', h3: '#6B6B6B',
    previewBg: '#F8F6F3', codeBg: '#1A1A1A', blockquoteBg: '#F0EDE8',
    tableHeader: '#E10514', tableAlt: '#F0EDE8', blockquoteBorder: '#E10514',
    hr: '#E10514', tableBorder: '#E5E0DA',
  },
  sakura: {
    primaryText: '#4A2040', secondaryText: '#6B3A5D', link: '#E891B2', code: '#D4729A',
    h1: '#4A2040', h1Border: '#E891B2', h2: '#6B3A5D', h2Border: '#F0B4CC', h3: '#8B5A7E',
    previewBg: '#FFF5F8', codeBg: '#2D1526', blockquoteBg: '#FCEEF3',
    tableHeader: '#D4729A', tableAlt: '#FCEEF3', blockquoteBorder: '#E891B2',
    hr: '#E891B2', tableBorder: '#F5D5E2',
  },
  mint: {
    primaryText: '#1B3A36', secondaryText: '#2D5F58', link: '#4FD1C5', code: '#38B2AC',
    h1: '#1B3A36', h1Border: '#4FD1C5', h2: '#2D5F58', h2Border: '#81E6D9', h3: '#388F86',
    previewBg: '#F0FFFD', codeBg: '#0F2624', blockquoteBg: '#E6FFFA',
    tableHeader: '#38B2AC', tableAlt: '#E6FFFA', blockquoteBorder: '#4FD1C5',
    hr: '#4FD1C5', tableBorder: '#B2F5EA',
  },
  coffee: {
    primaryText: '#3E2723', secondaryText: '#5D4037', link: '#A1887F', code: '#8D6E63',
    h1: '#3E2723', h1Border: '#8D6E63', h2: '#5D4037', h2Border: '#BCAAA4', h3: '#6D4C41',
    previewBg: '#FBF8F5', codeBg: '#2C1E1A', blockquoteBg: '#EFEBE9',
    tableHeader: '#6D4C41', tableAlt: '#EFEBE9', blockquoteBorder: '#8D6E63',
    hr: '#A1887F', tableBorder: '#D7CCC8',
  },
  sky: {
    primaryText: '#1E3A5F', secondaryText: '#2C5282', link: '#63B3ED', code: '#4299E1',
    h1: '#1E3A5F', h1Border: '#63B3ED', h2: '#2C5282', h2Border: '#90CDF4', h3: '#3182CE',
    previewBg: '#F7FBFF', codeBg: '#1A2A3E', blockquoteBg: '#EBF8FF',
    tableHeader: '#4299E1', tableAlt: '#EBF8FF', blockquoteBorder: '#63B3ED',
    hr: '#63B3ED', tableBorder: '#BEE3F8',
  },
};

// Hebrew display names for preset buttons (used in Story 2.2 PresetGrid)
const PRESET_HEBREW_NAMES: Record<string, string> = {
  classic: 'קלאסי', ocean: 'אוקיינוס', forest: 'יער', sunset: 'שקיעה',
  mono: 'מונוכרום', lavender: 'לבנדר', rose: 'ורוד', gold: 'זהב',
  teal: 'טיל', night: 'לילה', ruby: 'רובי', sakura: 'סקורה',
  mint: 'מנטה', coffee: 'קפה', sky: 'שמיים',
};

export const COLOR_PRESETS: ColorPreset[] = Object.entries(PRESET_THEMES).map(
  ([name, theme]) => ({ name, hebrewName: PRESET_HEBREW_NAMES[name], theme })
);

// Convenience lookup by name (used in Story 2.2)
export const COLOR_PRESET_MAP: Record<string, ColorTheme> = PRESET_THEMES;
```

### `lib/hooks/useColorTheme.ts`

```typescript
'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { applyColorTheme } from '@/lib/colors/apply-colors';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import type { ColorTheme } from '@/types/colors';

// MUST match V2_KEYS.colorTheme in lib/migration/v1-migration.ts (Story 1.7)
export const COLOR_THEME_KEY = 'marko-v2-color-theme';

export function useColorTheme(): [ColorTheme, (theme: ColorTheme) => void] {
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>(
    COLOR_THEME_KEY,
    DEFAULT_CLASSIC_THEME
  );

  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  return [colorTheme, setColorTheme];
}
```

### `components/theme/ColorPicker.tsx`

Dual-input row: `<input type="color">` (native color picker) + hex text input. Both stay in sync.

```typescript
'use client';

interface ColorPickerProps {
  label: string;    // Hebrew label
  value: string;    // Hex color string e.g. '#10B981'
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  function handleHexInput(raw: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
      onChange(raw);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <label className="flex-1 truncate text-sm text-foreground" dir="rtl">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => handleHexInput(e.target.value)}
          className="w-20 rounded border border-border px-2 py-1 font-mono text-xs"
          maxLength={7}
          aria-label={`${label} - ערך hex`}
          dir="ltr"
        />
      </div>
    </div>
  );
}
```

### `components/theme/ColorPanel.tsx`

Controlled shadcn `Sheet` (side="right"). 4 sections with Hebrew headers. 17 ColorPicker rows. Reset button.

```typescript
'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import type { ColorTheme } from '@/types/colors';

interface ColorPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

// Hebrew labels for all 17 properties
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

// Section layout: 4 groups matching AC10
const SECTIONS: { title: string; keys: (keyof ColorTheme)[] }[] = [
  { title: 'טקסט', keys: ['primaryText', 'secondaryText', 'link', 'code'] },
  { title: 'כותרות', keys: ['h1', 'h1Border', 'h2', 'h2Border', 'h3'] },
  { title: 'רקעים', keys: ['previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt'] },
  { title: 'מבטאים', keys: ['blockquoteBorder', 'hr', 'tableBorder'] },
];

export function ColorPanel({ isOpen, onOpenChange, theme, onThemeChange }: ColorPanelProps) {
  function handleColorChange(key: keyof ColorTheme, value: string) {
    onThemeChange({ ...theme, [key]: value });
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>הגדרות צבע</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6 pb-6">
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
            onClick={() => onThemeChange(DEFAULT_CLASSIC_THEME)}
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

### Header Modification (`components/layout/Header.tsx`)

Add `Palette` to lucide-react imports and `onOpenColorPanel` prop:

```typescript
// Add to imports:
import { Expand, Trash2, FileText, Palette } from 'lucide-react';

// Add to HeaderProps interface:
onOpenColorPanel?: () => void;

// Add button to utility group (before DirectionToggle):
<button
  type="button"
  onClick={onOpenColorPanel}
  aria-label="הגדרות צבע"
  title="הגדרות צבע"
  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
             hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
>
  <Palette className="size-4" aria-hidden="true" />
</button>
```

### Editor Page Integration (`app/editor/page.tsx`)

```typescript
// Add imports:
import { useState } from 'react'; // already imported
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { ColorPanel } from '@/components/theme/ColorPanel';

// Add inside EditorPage():
const [colorTheme, setColorTheme] = useColorTheme();
const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);

// Add <ColorPanel> to JSX (sibling to PresentationView):
<ColorPanel
  isOpen={isColorPanelOpen}
  onOpenChange={setIsColorPanelOpen}
  theme={colorTheme}
  onThemeChange={setColorTheme}
/>

// Update <Header>:
<Header
  ...existingProps...
  onOpenColorPanel={() => setIsColorPanelOpen(true)}
/>
```

### How globals.css & apply-colors interact

- `app/globals.css` `:root` block defines the **initial CSS custom property values** — these render correctly on first paint (before JS hydrates), preventing a flash of unstyled colors.
- `apply-colors.ts` sets `document.documentElement.style.setProperty(...)` on hydration — **inline styles override** `:root` stylesheet values.
- `useColorTheme`'s `useEffect` runs after first render, applying either the `DEFAULT_CLASSIC_THEME` (visually identical to globals.css defaults, so no visual change) or the user's persisted theme.
- The `.dark` block in globals.css also sets the 17 custom properties; `apply-colors.ts` overrides these too via inline styles — this is intentional per spec ("document preview colors independent of dark/light mode").

### shadcn Sheet Installation

No shadcn components exist yet (`components/ui/` does not exist). Install Sheet first:
```bash
npx shadcn@latest add sheet
```
This creates `components/ui/sheet.tsx` and may update `components/ui/` with dependencies (dialog, etc.).

### Project Structure Notes

Files to **create** (new):
- `types/colors.ts`
- `lib/colors/defaults.ts`
- `lib/colors/presets.ts`
- `lib/colors/apply-colors.ts`
- `lib/hooks/useColorTheme.ts`
- `components/theme/ColorPicker.tsx`
- `components/theme/ColorPanel.tsx`
- `components/theme/ColorPanel.test.tsx`

Files to **modify** (existing):
- `components/layout/Header.tsx` — add Palette button + `onOpenColorPanel` prop
- `app/editor/page.tsx` — add `useColorTheme`, `isColorPanelOpen`, `<ColorPanel>`

Files **NOT to touch** (no changes needed):
- `app/globals.css` — CSS custom properties already defined correctly
- `components/preview/PreviewPanel.tsx` — already uses `var(--color-preview-bg)`
- `lib/hooks/useLocalStorage.ts` — reused as-is
- `lib/migration/v1-migration.ts` — must be implemented (Story 1.7) before this, but do NOT modify

### Anti-Patterns to Avoid

- **Do NOT** inject a `<style>` element (v1's approach) — use CSS custom properties on `document.documentElement.style`
- **Do NOT** call `localStorage.setItem` directly in components — use `useColorTheme` hook
- **Do NOT** put `ColorTheme` type only in `lib/colors/types.ts` — it belongs in `types/colors.ts` (same pattern as `types/editor.ts`)
- **Do NOT** use an uncontrolled Sheet — ColorPanel must be controlled (`isOpen`/`onOpenChange` from parent)
- **Do NOT** skip the SSR guard in `apply-colors.ts` — `document` is undefined on server
- **Do NOT** add a `types/colors.ts` AND a `lib/colors/types.ts` with duplicate definitions — one source of truth in `types/colors.ts`
- **Do NOT** import `COLOR_PRESETS` into `useColorTheme` — the hook only needs `DEFAULT_CLASSIC_THEME`; presets are for UI components

### Testing Requirements

`components/theme/ColorPanel.test.tsx`:
1. Test 4 Hebrew section headers render: "טקסט", "כותרות", "רקעים", "מבטאים"
2. Test color change: simulate `onChange` on a ColorPicker → verify `onThemeChange` called with correct merged theme
3. Test reset button: click "איפוס לברירת מחדל" → verify `onThemeChange` called with `DEFAULT_CLASSIC_THEME`
4. Test 17 pickers render (count of color inputs = 17)

`apply-colors.ts` test (inline or separate):
1. Test `applyColorTheme` calls `document.documentElement.style.setProperty` for all 17 properties with correct CSS var names
2. Test SSR guard: when `document` is undefined (server), function returns without error

Use Vitest + jsdom (already configured in the project). Test file co-located with component.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1 acceptance criteria](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — State Management: color theme via React context + localStorage](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure: components/theme/, lib/colors/, lib/hooks/useColorTheme.ts](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — CSS Custom Properties: --color-primary-text, --color-h1, --color-preview-bg](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Naming: PascalCase components, kebab-case utility files, use prefix hooks](../planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ColorPanel: shadcn Sheet side=right, 17 pickers in 4 sections, Hebrew labels](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Sheet animation 300ms ease-out, Sheet direction side=right](../planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color System: 17-property model, 15 presets, CSS variable implementation](../planning-artifacts/ux-design-specification.md)
- [Source: app/globals.css — `:root` block defines DEFAULT_CLASSIC_THEME values and all CSS custom property names](../../app/globals.css)
- [Source: docs/reference-data/index.html lines 3813–4102 — v1 `defaultColors` and all 15 `colorPresets` exact values](../../docs/reference-data/index.html)
- [Source: lib/hooks/useLocalStorage.ts — JSON.stringify/parse storage pattern to follow in useColorTheme](../../lib/hooks/useLocalStorage.ts)
- [Source: lib/hooks/useEditorContent.ts — key constant export pattern (EDITOR_CONTENT_KEY) to follow for COLOR_THEME_KEY](../../lib/hooks/useEditorContent.ts)
- [Source: _bmad-output/implementation-artifacts/1-7-v1-localstorage-migration.md — V2_KEYS.colorTheme = 'marko-v2-color-theme', migration writes to this key](./1-7-v1-localstorage-migration.md)

### Git Intelligence

Recent commits follow single-commit-per-story pattern. Previous stories (1.4–1.6) show:
- New `lib/hooks/` files follow `useLocalStorage` pattern exactly
- Component props are typed via interfaces at top of file
- Lucide-react icons added to existing imports (not separate import lines)
- All Hebrew text in JSX uses RTL-appropriate elements or `dir="rtl"` attribute
- No new npm dependencies have been added in any story since project initialization

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m] (2026-03-07)

### Debug Log References

None — clean implementation with no debug issues.

### Completion Notes List

- Implemented all 17 CSS custom properties via `document.documentElement.style.setProperty` (not style injection — per spec)
- Installed shadcn Sheet (`components/ui/sheet.tsx`) via `npx shadcn@latest add sheet`
- COLOR_THEME_KEY = 'marko-v2-color-theme' correctly matches V2_KEYS.colorTheme from Story 1.7
- Added `vitest.setup.ts` setting `IS_REACT_ACT_ENVIRONMENT = true` to silence React act() warnings in tests
- All 10 ColorPanel tests and 7 apply-colors tests pass; total test suite: 121 tests, all passing
- Radix Dialog missing `aria-describedby` warning is expected (cosmetic only, no functional impact)

### File List

**New files:**
- `types/colors.ts`
- `lib/colors/defaults.ts`
- `lib/colors/presets.ts`
- `lib/colors/apply-colors.ts`
- `lib/colors/apply-colors.test.ts`
- `lib/hooks/useColorTheme.ts`
- `components/ui/sheet.tsx` (generated by shadcn)
- `components/theme/ColorPicker.tsx`
- `components/theme/ColorPanel.tsx`
- `components/theme/ColorPanel.test.tsx`
- `vitest.setup.ts`

**Modified files:**
- `components/layout/Header.tsx` — added Palette import, `onOpenColorPanel?` prop, Palette button
- `app/editor/page.tsx` — added `useColorTheme`, `isColorPanelOpen` state, `<ColorPanel>` render, `onOpenColorPanel` prop
- `vitest.config.ts` — added `setupFiles: ['./vitest.setup.ts']`

## Change Log

- 2026-03-07: Implemented Story 2.1 — color system and color panel with 17-property ColorTheme, 15 presets, shadcn Sheet panel, Hebrew labels, localStorage persistence, and full test coverage (17 new tests added)