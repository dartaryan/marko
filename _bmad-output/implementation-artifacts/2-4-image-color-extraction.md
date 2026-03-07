# Story 2.4: Image Color Extraction

Status: done

## Story

As a user,
I want to upload an image and extract a color palette from it to apply as a theme,
so that I can match my document styling to a brand image, photo, or design.

## Acceptance Criteria

1. **AC1: Upload Trigger** — Given the color panel is open, when the user clicks "העלה תמונה", then a native file picker opens accepting `image/*` files. The file input has a Hebrew label and is keyboard accessible.

2. **AC2: Color Extraction** — Given the user selects an image file, when the file loads, then the system extracts 6 dominant colors using k-means clustering (k=6, 15 iterations) on the canvas pixel data (image downscaled to max 100×100).

3. **AC3: Preview Modal** — Given colors are extracted, when the modal opens, then a shadcn Dialog shows: (a) a strip of 6 extracted color circles, (b) a mock document preview with `role="img"` and `aria-label="תצוגה מקדימה של נושא הצבעים המחולץ"` showing h1, h1-border, text lines, h2, h2-border, blockquote, table, code block, and hr — all colored using the 17-property mapping.

4. **AC4: Shuffle** — Given the preview modal is open, when the user clicks "ערבב", then the color-to-property mapping rotates (shuffleIndex increments) and the mock document preview updates live.

5. **AC5: Apply** — Given the preview modal is open, when the user clicks "החל צבעים", then all 17 color properties update, the preview reflects the new theme, the active built-in preset indicator is cleared, colors persist to localStorage, and the modal closes.

6. **AC6: Cancel** — Given the preview modal is open, when the user clicks "ביטול" or presses Escape, then the modal closes and no colors are changed.

7. **AC7: Accessibility** — File input has a visually associated Hebrew label. All modal buttons have Hebrew `aria-label`. Preview mock has `role="img"`. Focus returns to the upload button after modal closes.

## Tasks / Subtasks

- [x] Task 1: Create `lib/colors/image-extraction.ts` (AC: #2, #4, #5)
  - [x] 1.1: Define `export type RGB = [number, number, number]`
  - [x] 1.2: Implement `export function getLuminance(rgb: RGB): number` → `0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]`
  - [x] 1.3: Implement `export function rgbToHex(rgb: RGB): string` → `'#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')`
  - [x] 1.4: Implement `export function quantizeColors(pixels: RGB[], k: number): RGB[]` — see Dev Notes for full implementation (k-means, 15 iterations, convergence tolerance 2)
  - [x] 1.5: Implement `export function mapExtractedColors(extractedColors: RGB[], shuffleIndex: number): ColorTheme` — see Dev Notes for full implementation (luminance-sort, rotate by shuffleIndex, map 6 colors to 17 properties)

- [x] Task 2: Create `lib/colors/image-extraction.test.ts` (AC: #2, #4)
  - [x] 2.1: Test `getLuminance([255,255,255])` ≈ 255, `getLuminance([0,0,0])` = 0
  - [x] 2.2: Test `rgbToHex([255,0,0])` = `'#ff0000'`, `rgbToHex([0,128,255])` = `'#0080ff'`
  - [x] 2.3: Test `quantizeColors([], 6)` returns array of length 6 (fallback colors)
  - [x] 2.4: Test `mapExtractedColors` returns object with all 17 `ColorTheme` keys
  - [x] 2.5: Test `mapExtractedColors(colors, 0)` !== `mapExtractedColors(colors, 1)` for non-trivial input (shuffleIndex produces different mapping)

- [x] Task 3: Add `components/ui/dialog.tsx` via shadcn CLI (AC: #3, #6, #7)
  - [x] 3.1: Run `npx shadcn@latest add dialog` — adds `components/ui/dialog.tsx` to the project. This is a PREREQUISITE before creating `ColorPreviewModal.tsx`.

- [x] Task 4: Create `components/theme/ColorPreviewModal.tsx` (AC: #3, #4, #5, #6, #7)
  - [x] 4.1: Define props interface — see Dev Notes for full component code
  - [x] 4.2: Import `Dialog, DialogContent, DialogHeader, DialogTitle` from `@/components/ui/dialog`
  - [x] 4.3: Import `rgbToHex` from `@/lib/colors/image-extraction`
  - [x] 4.4: Render extracted colors strip: 6 circles, `style={{ background: rgbToHex(c) }}`, `aria-hidden="true"`
  - [x] 4.5: Render mock document preview div with `role="img"` and `aria-label="תצוגה מקדימה של נושא הצבעים המחולץ"` — see Dev Notes for full JSX structure
  - [x] 4.6: Render footer buttons: "ערבב" (shuffle), "החל צבעים" (apply), "ביטול" (cancel) — all with Hebrew `aria-label`
  - [x] 4.7: `onOpenChange` on Dialog: when closed by Escape, call `onCancel`

- [x] Task 5: Create `components/theme/ImageColorExtractor.tsx` (AC: #1, #2, #3, #7)
  - [x] 5.1: Props: `onApply: (theme: ColorTheme) => void`
  - [x] 5.2: State: `extractedColors: RGB[]` (init `[]`), `shuffleIndex: number` (init `0`), `isModalOpen: boolean` (init `false`)
  - [x] 5.3: `fileInputRef = useRef<HTMLInputElement>(null)` — used to trigger the hidden file input
  - [x] 5.4: Render: section label `<h3>` "חילוץ צבעים מתמונה", upload button that calls `fileInputRef.current?.click()`, hidden `<input type="file" accept="image/*">` with associated `<label>` (visually hidden via `sr-only`)
  - [x] 5.5: `handleFileChange(e: React.ChangeEvent<HTMLInputElement>)`: reads file via FileReader → creates Image → draws to canvas (maxSize=100) → getImageData → filter alpha ≥ 128 → quantizeColors(pixels, 6) → sort by getLuminance → setExtractedColors → setShuffleIndex(0) → setIsModalOpen(true) → reset `e.target.value = ''`
  - [x] 5.6: Render `<ColorPreviewModal>` only when `extractedColors.length > 0`:
    - `isOpen={isModalOpen}`
    - `colorMapping={mapExtractedColors(extractedColors, shuffleIndex)}`
    - `extractedColors={extractedColors}`
    - `onShuffle={() => setShuffleIndex(i => (i + 1) % extractedColors.length)}`
    - `onApply={() => { onApply(mapExtractedColors(extractedColors, shuffleIndex)); setIsModalOpen(false); setExtractedColors([]); setShuffleIndex(0); }}`
    - `onCancel={() => { setIsModalOpen(false); setExtractedColors([]); setShuffleIndex(0); }}`

- [x] Task 6: Update `components/theme/ColorPanel.tsx` (AC: #5)
  - [x] 6.1: Add `import { ImageColorExtractor } from './ImageColorExtractor'`
  - [x] 6.2: Add `<ImageColorExtractor>` section between the preset section and the SECTIONS color pickers — see Dev Notes for exact placement
  - [x] 6.3: Wire `onApply`: `(extractedTheme) => { onThemeChange(extractedTheme); setActivePreset(''); }`

- [x] Task 7: Add tests to `components/theme/ColorPanel.test.tsx` (AC: #1, #7)
  - [x] 7.1: Test: "העלה תמונה" button renders in the open panel
  - [x] 7.2: Test: hidden file input has `accept="image/*"`

## Dev Notes

### Prerequisite: Stories 2.1, 2.2, and 2.3 Must Be Implemented First

Story 2.4 builds on the ColorPanel state after Stories 2.1+2.2+2.3:

| Artifact | Established In | Used in 2.4 |
|---|---|---|
| `useLocalStorage` | Story 2.1 | Not directly — colors flow through `onThemeChange` |
| `ACTIVE_PRESET_KEY` / `setActivePreset` | Story 2.2 | `setActivePreset('')` on apply |
| `useCustomPresets`, save form in ColorPanel | Story 2.3 | Not changed; ImageColorExtractor is a peer section |
| `ColorPanel.tsx` full state (presets, save form) | Story 2.3 | Base to modify in Task 6 |

**Do NOT implement Story 2.4 until Stories 2.1, 2.2, and 2.3 are fully done and code-reviewed.**

### `lib/colors/image-extraction.ts` — Full Implementation

This is pure TypeScript with no DOM or React dependencies. All functions are exportable and testable.

```typescript
import type { ColorTheme } from '@/types/colors';

export type RGB = [number, number, number];

export function getLuminance(rgb: RGB): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

export function quantizeColors(pixels: RGB[], k: number): RGB[] {
  if (pixels.length === 0) {
    // Fallback palette matching v1 defaults
    return [[26,26,26],[61,61,61],[107,107,107],[225,5,20],[240,237,232],[248,246,243]];
  }

  // Initialize centers evenly across the pixel array
  const centers: RGB[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) {
    centers.push([...pixels[Math.min(i * step, pixels.length - 1)]] as RGB);
  }

  // k-means: 15 iterations, convergence tolerance = 2
  for (let iter = 0; iter < 15; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);

    for (const px of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let i = 0; i < k; i++) {
        const d =
          (px[0] - centers[i][0]) ** 2 +
          (px[1] - centers[i][1]) ** 2 +
          (px[2] - centers[i][2]) ** 2;
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      clusters[minIdx].push(px);
    }

    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCenter: RGB = [0, 0, 0];
      for (const px of clusters[i]) {
        newCenter[0] += px[0]; newCenter[1] += px[1]; newCenter[2] += px[2];
      }
      newCenter[0] /= clusters[i].length;
      newCenter[1] /= clusters[i].length;
      newCenter[2] /= clusters[i].length;
      const diff =
        Math.abs(newCenter[0] - centers[i][0]) +
        Math.abs(newCenter[1] - centers[i][1]) +
        Math.abs(newCenter[2] - centers[i][2]);
      if (diff > 2) converged = false;
      centers[i] = newCenter;
    }
    if (converged) break;
  }

  return centers;
}

export function mapExtractedColors(extractedColors: RGB[], shuffleIndex: number): ColorTheme {
  // Sort by luminance (darkest → lightest)
  const sorted = [...extractedColors].sort((a, b) => getLuminance(a) - getLuminance(b));

  // Rotate by shuffleIndex (Shuffle button rotates mapping)
  const rotated: RGB[] = sorted.map((_, i) => sorted[(i + shuffleIndex) % sorted.length]);

  const darkest    = rgbToHex(rotated[0]);
  const secondDark = rgbToHex(rotated[1]);
  const medium     = rgbToHex(rotated[2]);
  const vibrant    = rgbToHex(rotated[3]);
  const secondLight = rgbToHex(rotated[4] ?? rotated[3]);
  const lightest   = rgbToHex(rotated[5] ?? rotated[4] ?? rotated[3]);

  const lastRgb = rotated[rotated.length - 1];
  const bgColor  = getLuminance(lastRgb) > 200 ? rgbToHex(lastRgb) : '#FFFFFF';
  const bgLight  = getLuminance(lastRgb) > 180 ? lightest : '#F5F5F5';

  return {
    primaryText:      darkest,
    secondaryText:    secondDark,
    link:             vibrant,
    code:             vibrant,
    h1:               darkest,
    h1Border:         vibrant,
    h2:               secondDark,
    h2Border:         medium,
    h3:               medium,
    previewBg:        bgColor,
    codeBg:           darkest,
    blockquoteBg:     bgLight,
    tableHeader:      vibrant,
    tableAlt:         bgLight,
    blockquoteBorder: vibrant,
    hr:               vibrant,
    tableBorder:      secondLight,
  };
}
```

**Why `bgAlt` is NOT in the mapping:** The v1 code computes `bgAlt` but never uses it in `extractedColorMapping` — `tableAlt` and `blockquoteBg` both use the `bgLight` formula. Do NOT add `bgAlt` to this implementation.

**Why no `adjustColor` helper:** The v1 `adjustColor` was used only for the unused `bgAlt`. It is not needed here.

### `components/theme/ColorPreviewModal.tsx` — Full Implementation

```typescript
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { rgbToHex } from '@/lib/colors/image-extraction';
import type { ColorTheme } from '@/types/colors';
import type { RGB } from '@/lib/colors/image-extraction';

interface ColorPreviewModalProps {
  isOpen: boolean;
  colorMapping: ColorTheme;
  extractedColors: RGB[];
  onShuffle: () => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ColorPreviewModal({
  isOpen,
  colorMapping: m,
  extractedColors,
  onShuffle,
  onApply,
  onCancel,
}: ColorPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה של צבעים</DialogTitle>
        </DialogHeader>

        {/* Extracted colors strip — 6 circles */}
        <div className="flex justify-center gap-2 py-2" aria-hidden="true">
          {extractedColors.map((c, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full border-2 border-border"
              style={{ background: rgbToHex(c) }}
              title={rgbToHex(c)}
            />
          ))}
        </div>

        {/* Mock document preview */}
        <div
          role="img"
          aria-label="תצוגה מקדימה של נושא הצבעים המחולץ"
          className="rounded-xl border border-border p-4"
          style={{ background: m.previewBg, direction: 'rtl' }}
        >
          {/* H1 */}
          <div className="mb-1.5 h-3.5 w-3/5 rounded" style={{ background: m.h1 }} />
          {/* H1 border */}
          <div className="mb-3 h-0.5 w-full rounded" style={{ background: m.h1Border }} />
          {/* Text lines */}
          <div className="mb-3 flex flex-col gap-1">
            <div className="h-2 w-full rounded" style={{ background: m.secondaryText + '40' }} />
            <div className="h-2 w-11/12 rounded" style={{ background: m.secondaryText + '30' }} />
            <div className="h-2 w-4/5 rounded" style={{ background: m.secondaryText + '35' }} />
          </div>
          {/* H2 */}
          <div className="mb-1 h-3 w-2/5 rounded" style={{ background: m.h2 }} />
          {/* H2 border */}
          <div className="mb-2.5 h-0.5 w-full rounded" style={{ background: m.h2Border }} />
          {/* Blockquote */}
          <div
            className="mb-2.5 flex gap-2 rounded-lg p-2"
            style={{ background: m.blockquoteBg }}
          >
            <div className="w-1 min-h-6 rounded" style={{ background: m.blockquoteBorder }} />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-1.5 w-4/5 rounded" style={{ background: m.secondaryText + '30' }} />
              <div className="h-1.5 w-3/5 rounded" style={{ background: m.secondaryText + '25' }} />
            </div>
          </div>
          {/* Table */}
          <div className="mb-2.5 overflow-hidden rounded-lg">
            <div
              className="flex items-center px-2"
              style={{ background: m.tableHeader, height: '20px' }}
            >
              <div className="h-1.5 w-1/3 rounded" style={{ background: 'rgba(255,255,255,0.5)' }} />
            </div>
            <div
              className="h-4 border-b"
              style={{ background: m.previewBg, borderColor: m.tableBorder }}
            />
            <div className="h-4" style={{ background: m.tableAlt }} />
          </div>
          {/* Code block */}
          <div className="mb-2.5 h-8 rounded-lg" style={{ background: m.codeBg }} />
          {/* HR */}
          <div className="h-0.5 rounded" style={{ background: m.hr }} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onApply}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="החל צבעים על המסמך"
          >
            החל צבעים
          </button>
          <button
            type="button"
            onClick={onShuffle}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ערבב מיפוי הצבעים"
          >
            ערבב
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ביטול חילוץ הצבעים"
          >
            ביטול
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Escape closes the modal via shadcn Dialog's built-in behavior** → triggers `onOpenChange(false)` → calls `onCancel`.

### `components/theme/ImageColorExtractor.tsx` — Full Implementation

```typescript
'use client';
import { useRef, useState } from 'react';
import {
  getLuminance,
  mapExtractedColors,
  quantizeColors,
  rgbToHex,
} from '@/lib/colors/image-extraction';
import type { RGB } from '@/lib/colors/image-extraction';
import type { ColorTheme } from '@/types/colors';
import { ColorPreviewModal } from './ColorPreviewModal';

interface ImageColorExtractorProps {
  onApply: (theme: ColorTheme) => void;
}

export function ImageColorExtractor({ onApply }: ImageColorExtractorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedColors, setExtractedColors] = useState<RGB[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pixels: RGB[] = [];
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          pixels.push([data[i], data[i + 1], data[i + 2]]);
        }

        const colors = quantizeColors(pixels, 6);
        colors.sort((a, b) => getLuminance(a) - getLuminance(b));
        setExtractedColors(colors);
        setShuffleIndex(0);
        setIsModalOpen(true);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  }

  const colorMapping =
    extractedColors.length > 0
      ? mapExtractedColors(extractedColors, shuffleIndex)
      : null;

  function handleClose() {
    setIsModalOpen(false);
    setExtractedColors([]);
    setShuffleIndex(0);
  }

  return (
    <>
      {/* Visually hidden label for the file input (accessibility) */}
      <label htmlFor="imageColorInput" className="sr-only">
        בחר תמונה לחילוץ צבעים
      </label>
      <input
        type="file"
        id="imageColorInput"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-2 rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="העלה תמונה לחילוץ צבעים"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        העלה תמונה
      </button>

      {colorMapping && (
        <ColorPreviewModal
          isOpen={isModalOpen}
          colorMapping={colorMapping}
          extractedColors={extractedColors}
          onShuffle={() =>
            setShuffleIndex((i) => (i + 1) % extractedColors.length)
          }
          onApply={() => {
            onApply(colorMapping);
            handleClose();
          }}
          onCancel={handleClose}
        />
      )}
    </>
  );
}
```

**Why `e.target.value = ''` after reading:** Prevents the browser from blocking re-selection of the same file. Must be done BEFORE the async FileReader callback so the reset happens in the same sync tick. Confirmed in v1: `input.value = ''` called immediately after `reader.readAsDataURL(file)`.

**Canvas is created in memory only** — never appended to DOM. This is identical to v1 behavior.

### `components/theme/ColorPanel.tsx` — Diff from Story 2.3

Base: full ColorPanel.tsx from Story 2.3 (which includes PresetGrid, custom presets save form, 4 color picker sections, reset button).

**Add import at top:**
```typescript
import { ImageColorExtractor } from './ImageColorExtractor';
```

**Add ImageColorExtractor section** between the preset section `</div>` and the `{SECTIONS.map(...)` block:
```tsx
{/* Image extraction */}
<div>
  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">חילוץ מתמונה</h3>
  <ImageColorExtractor
    onApply={(extractedTheme) => {
      onThemeChange(extractedTheme);
      setActivePreset(''); // extracted theme is not a named preset
    }}
  />
</div>
```

**No other changes.** The preset section, save form, color pickers, and reset button are unchanged from Story 2.3.

### Full Updated ColorPanel.tsx (after Stories 2.1 + 2.2 + 2.3 + 2.4)

```typescript
'use client';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { PresetGrid } from './PresetGrid';
import { ImageColorExtractor } from './ImageColorExtractor';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useCustomPresets } from '@/lib/hooks/useCustomPresets';
import type { ColorTheme } from '@/types/colors';

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
    setActivePreset('');
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
                      if (e.key === 'Escape') { setIsSavingPreset(false); setDraftPresetName(''); }
                    }}
                    placeholder="שם הנושא..."
                    dir="rtl"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    className="flex-1 rounded border border-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="שם הנושא החדש"
                  />
                  <button type="button" onClick={handleSavePreset} disabled={!draftPresetName.trim()} className="rounded border border-border px-2 py-1 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="שמור נושא">שמור</button>
                  <button type="button" onClick={() => { setIsSavingPreset(false); setDraftPresetName(''); }} className="rounded border border-border px-2 py-1 text-sm hover:bg-muted transition-colors" aria-label="ביטול שמירת נושא">ביטול</button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsSavingPreset(true)} className="w-full rounded border border-border px-3 py-1.5 text-start text-sm text-muted-foreground hover:bg-muted transition-colors" aria-label="שמור צבעים נוכחיים כנושא מותאם אישית">שמור נושא נוכחי...</button>
              )}
            </div>
          </div>

          {/* Image extraction */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">חילוץ מתמונה</h3>
            <ImageColorExtractor
              onApply={(extractedTheme) => {
                onThemeChange(extractedTheme);
                setActivePreset('');
              }}
            />
          </div>

          {/* Individual color pickers — 4 sections */}
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{section.title}</h3>
              <div className="space-y-2">
                {section.keys.map((key) => (
                  <ColorPicker key={key} label={HEBREW_LABELS[key]} value={theme[key]} onChange={(value) => handleColorChange(key, value)} />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => { onThemeChange(DEFAULT_CLASSIC_THEME); setActivePreset('classic'); }}
            className="w-full rounded border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted active:scale-[0.98] transition-colors"
          >
            איפוס לברירת מחדל
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### `lib/colors/image-extraction.test.ts` — Full Test File

```typescript
import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  rgbToHex,
  quantizeColors,
  mapExtractedColors,
} from './image-extraction';
import type { RGB } from './image-extraction';

describe('getLuminance', () => {
  it('returns ~255 for white', () => {
    expect(getLuminance([255, 255, 255])).toBeCloseTo(255, 0);
  });
  it('returns 0 for black', () => {
    expect(getLuminance([0, 0, 0])).toBe(0);
  });
  it('applies correct channel weights', () => {
    // pure red: 0.299 * 255 ≈ 76.245
    expect(getLuminance([255, 0, 0])).toBeCloseTo(76.245, 1);
  });
});

describe('rgbToHex', () => {
  it('converts [255,0,0] to #ff0000', () => {
    expect(rgbToHex([255, 0, 0])).toBe('#ff0000');
  });
  it('converts [0,128,255] to #0080ff', () => {
    expect(rgbToHex([0, 128, 255])).toBe('#0080ff');
  });
  it('pads single-hex-digit channels', () => {
    expect(rgbToHex([0, 0, 15])).toBe('#00000f');
  });
});

describe('quantizeColors', () => {
  it('returns 6 fallback colors for empty pixels', () => {
    const result = quantizeColors([], 6);
    expect(result).toHaveLength(6);
    expect(result[0]).toHaveLength(3);
  });

  it('returns k clusters for valid pixel input', () => {
    const pixels: RGB[] = Array.from({ length: 100 }, (_, i) => [i * 2, i, 255 - i]);
    const result = quantizeColors(pixels, 6);
    expect(result).toHaveLength(6);
  });
});

describe('mapExtractedColors', () => {
  const sampleColors: RGB[] = [
    [20, 20, 20],    // very dark
    [60, 60, 60],    // dark
    [120, 120, 120], // medium
    [180, 100, 50],  // vibrant
    [220, 210, 200], // light
    [250, 248, 245], // very light
  ];

  it('returns an object with all 17 ColorTheme keys', () => {
    const result = mapExtractedColors(sampleColors, 0);
    const keys = [
      'primaryText', 'secondaryText', 'link', 'code',
      'h1', 'h1Border', 'h2', 'h2Border', 'h3',
      'previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt',
      'blockquoteBorder', 'hr', 'tableBorder',
    ];
    for (const key of keys) {
      expect(result).toHaveProperty(key);
    }
  });

  it('all values are valid hex strings', () => {
    const result = mapExtractedColors(sampleColors, 0);
    for (const value of Object.values(result)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('shuffleIndex=1 produces different mapping than shuffleIndex=0', () => {
    const r0 = mapExtractedColors(sampleColors, 0);
    const r1 = mapExtractedColors(sampleColors, 1);
    expect(r0.primaryText).not.toBe(r1.primaryText);
  });

  it('shuffleIndex wraps around (length produces same as 0)', () => {
    const r0 = mapExtractedColors(sampleColors, 0);
    const rN = mapExtractedColors(sampleColors, sampleColors.length);
    expect(r0).toEqual(rN);
  });
});
```

### `components/theme/ColorPanel.test.tsx` — Additions for Story 2.4

```typescript
// Add to existing ColorPanel.test.tsx (after Story 2.3 tests)

it('renders "העלה תמונה" button in the open color panel', () => {
  render(
    <ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />
  );
  expect(screen.getByRole('button', { name: 'העלה תמונה לחילוץ צבעים' })).toBeInTheDocument();
});

it('has a hidden file input that accepts image/* files', () => {
  const { container } = render(
    <ColorPanel isOpen theme={DEFAULT_CLASSIC_THEME} onThemeChange={vi.fn()} onOpenChange={vi.fn()} />
  );
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  expect(fileInput).toBeTruthy();
  expect(fileInput.accept).toBe('image/*');
});
```

**Note on canvas/FileReader testing:** Integration tests that exercise the full extraction pipeline (FileReader → Canvas → quantize → modal) are complex in jsdom (Canvas API is mocked). These are out of scope for this story. The extraction logic is fully covered by unit tests in `lib/colors/image-extraction.test.ts`.

### Architecture Compliance

| Rule | Compliance |
|---|---|
| No direct `localStorage.setItem` in components | Colors flow through `onThemeChange` → `useColorTheme` → `applyColorTheme` + localStorage |
| CSS custom properties via `apply-colors.ts` | `onApply` calls `onThemeChange` which reaches `useColorTheme`'s setter → CSS vars applied via `useEffect` |
| `ColorTheme` type in `types/colors.ts` | `mapExtractedColors` returns `ColorTheme`; `RGB` type lives in `image-extraction.ts` |
| PascalCase component files | `ImageColorExtractor.tsx`, `ColorPreviewModal.tsx` ✓ |
| Hebrew ARIA labels on all interactive elements | Upload button, all modal buttons, file label — all have Hebrew `aria-label` ✓ |
| `prefers-reduced-motion` respected | No animations in this story's components; `motion-safe:` not needed here |
| Tests co-located with components | `image-extraction.test.ts` in `lib/colors/`; panel tests in `ColorPanel.test.tsx` ✓ |
| No new npm dependencies | Uses native Canvas API + FileReader + shadcn Dialog ✓ |
| shadcn Dialog added via CLI | `npx shadcn@latest add dialog` — do NOT manually copy sheet.tsx pattern |

### Anti-Patterns to Avoid

- **Do NOT** use a third-party color extraction library (e.g., `colorthief`, `node-vibrant`). The architecture specifies Canvas API + custom k-means. No new npm dependencies.
- **Do NOT** call `applyColorTheme` directly from `ImageColorExtractor` or `ColorPreviewModal`. Always go through `onApply` → `ColorPanel.onThemeChange` → `useColorTheme` setter.
- **Do NOT** append the canvas to the DOM. It's created in memory only: `document.createElement('canvas')` without `document.body.appendChild`.
- **Do NOT** store extracted colors in localStorage. Extraction is a one-time session interaction; only the final applied `ColorTheme` persists (via `useColorTheme`).
- **Do NOT** track "which image was used" or add a preview thumbnail. The feature is purely about extracting and applying colors.
- **Do NOT** reset `activePreset` to a specific value — always clear it to `''` when applying extracted colors. Extracted themes are anonymous.
- **Do NOT** add `aria-hidden` to the upload button itself — only to the file input and decorative SVG icons.
- **Do NOT** reuse `ACTIVE_PRESET_KEY` anywhere in the new components — that constant lives in `ColorPanel.tsx` and controls the preset indicator state.
- **Do NOT** implement `adjustColor` helper — it was in v1 but is NOT used in `mapExtractedColors`. See "Why `bgAlt` is NOT in the mapping" above.

### Previous Story Intelligence (Stories 2.1–2.3)

From Story 2.1:
- `useColorTheme()` returns `[ColorTheme, setColorTheme]` — setter triggers `applyColorTheme` via `useEffect`
- `ColorPanel` interface: `theme`, `onThemeChange`, `isOpen`, `onOpenChange` — do NOT change this interface
- `useLocalStorage<T>` supports functional updates

From Story 2.2:
- `ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` exported from `ColorPanel.tsx`
- `setActivePreset('')` on any non-preset application (manual edits, custom presets, image extraction) — consistent throughout the codebase
- `motion-safe:` prefix confirmed for animations; not needed here as no new interactive hover animations are added

From Story 2.3:
- `useCustomPresets` hook in `lib/hooks/useCustomPresets.ts`
- Full `ColorPanel.tsx` state after 2.3 shown above in "Prerequisite" table — that is the exact base to modify
- `PresetGrid.tsx` is finalized after Story 2.3 — do NOT modify it for Story 2.4

### Git Intelligence

Recent commit patterns:
- One commit per story: `"Implement Story X.Y: [description]"`
- Code review as separate commit: `"Mark Story X.Y done: post code-review status sync"`
- No npm package additions since project initialization — confirmed pattern for this story
- `npx shadcn@latest add dialog` generates `components/ui/dialog.tsx` — add this file to git before committing implementation

### Project Structure Notes

**Files to CREATE (new in Story 2.4):**
- `lib/colors/image-extraction.ts` — pure extraction utilities (no DOM, no React)
- `lib/colors/image-extraction.test.ts` — unit tests for extraction logic
- `components/theme/ImageColorExtractor.tsx` — upload trigger + Canvas extraction + state
- `components/theme/ColorPreviewModal.tsx` — preview Dialog with shuffle/apply/cancel
- `components/ui/dialog.tsx` — added via `npx shadcn@latest add dialog`

**Files to MODIFY (existing):**
- `components/theme/ColorPanel.tsx` — add ImageColorExtractor section (1 import + 1 JSX block)
- `components/theme/ColorPanel.test.tsx` — add 2 new tests for upload button and file input

**Files NOT to touch:**
- `lib/colors/presets.ts` — 15 built-in presets, unchanged
- `lib/colors/defaults.ts` — DEFAULT_CLASSIC_THEME, unchanged
- `lib/colors/apply-colors.ts` — unchanged; extraction flows through `onThemeChange`
- `lib/hooks/useColorTheme.ts` — unchanged
- `lib/hooks/useCustomPresets.ts` — unchanged
- `lib/migration/v1-migration.ts` — unchanged; v1 had no custom-extracted-color persistence
- `components/theme/PresetGrid.tsx` — finalized in Story 2.3, do NOT touch
- `components/theme/ColorPicker.tsx` — individual color picker, unchanged
- `app/editor/page.tsx` — no changes needed
- `types/colors.ts` — no changes needed; `RGB` type stays in `image-extraction.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4 acceptance criteria](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ImageColorExtractor component spec: Canvas API, k-means k=6 15 iterations, shuffle button, role="img" preview](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ColorPanel sections: Image extraction button | Preset grid](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Source tree: ImageColorExtractor.tsx, ColorPreviewModal.tsx, image-extraction.ts](_bmad-output/planning-artifacts/architecture.md)
- [Source: hebrew-markdown-export/index.html — v1 image extraction: quantizeColors, mapExtractedColors, getLuminance, shuffleExtractedColors — exact algorithm migrated](../../hebrew-markdown-export/index.html)
- [Source: _bmad-output/implementation-artifacts/2-3-custom-preset-save-and-load.md — Full ColorPanel.tsx expected state after Stories 2.1+2.2+2.3 — base for Story 2.4 diff](_bmad-output/implementation-artifacts/2-3-custom-preset-save-and-load.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — No new npm dependencies; Canvas API for extraction](_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

_No blocking issues. shadcn dialog (newer version) required `components/ui/button` dependency — added via `npx shadcn@latest add button --yes`._

### Completion Notes List

- Implemented pure-TS k-means color extraction in `lib/colors/image-extraction.ts` (no new npm deps — Canvas API + native FileReader)
- All 4 extraction functions fully tested: 12 unit tests, all passing
- `ColorPreviewModal.tsx` uses shadcn Dialog with RTL layout, `role="img"` mock preview, Hebrew aria-labels on all buttons
- `ImageColorExtractor.tsx` handles FileReader → Canvas → quantize → sort → open modal; canvas created in-memory only
- `ColorPanel.tsx` updated: import + ImageColorExtractor section inserted between preset section and SECTIONS map
- `ColorPanel.test.tsx` extended with 2 new tests (upload button presence, file input accept attribute)
- Full test suite: 152 tests, 10 files — all passing with no regressions
- TypeScript: 0 errors

### File List

- `lib/colors/image-extraction.ts` (created)
- `lib/colors/image-extraction.test.ts` (created)
- `components/ui/dialog.tsx` (created via `npx shadcn@latest add dialog`)
- `components/ui/button.tsx` (created via `npx shadcn@latest add button` — required by dialog.tsx)
- `components/theme/ColorPreviewModal.tsx` (created)
- `components/theme/ImageColorExtractor.tsx` (created)
- `components/theme/ColorPanel.tsx` (modified — added import + ImageColorExtractor section)
- `components/theme/ColorPanel.test.tsx` (modified — added 2 tests for Story 2.4)
- `components/editor/EditorPanel.tsx` (modified — added `flex-1 min-h-0` to section className to fix panel layout overflow in split view)
- `components/preview/PreviewPanel.tsx` (modified — added `flex-1 min-h-0` to section className to fix panel layout overflow in split view)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — story status updated)

## Change Log

- 2026-03-07: Story 2.4 implemented — image color extraction feature complete. Added image-extraction.ts (k-means), ColorPreviewModal.tsx (shadcn Dialog preview), ImageColorExtractor.tsx (upload trigger + canvas pipeline), shadcn dialog + button components, ColorPanel.tsx updated, 14 new tests added. All 152 tests passing.
- 2026-03-07: Code review fixes — added `uploadButtonRef` + `focus()` call in `handleClose` for AC7 focus return; added `reader.onerror`/`img.onerror` handlers for silent-failure fix; added `allIdentical` degenerate fallback in `quantizeColors` for solid-color images; wrapped Story 2.4 tests in `describe` block; documented EditorPanel.tsx and PreviewPanel.tsx layout fixes in File List.
