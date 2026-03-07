# Story 3.2: PDF Export with Colors & RTL

Status: done

## Story

As a user,
I want to export my rendered document as a PDF with preserved colors, RTL direction, and Mermaid diagrams,
so that I can share a polished, print-ready version of my document.

## Acceptance Criteria

1. **AC1: Color Preservation** — Given the user confirms PDF export, when the PDF generates, then all 17 `ColorTheme` properties are preserved in the PDF (colors match the live preview).

2. **AC2: RTL Direction** — Given a document with Hebrew content, when the PDF generates, then Hebrew text renders RTL correctly (browser rendering handles this via html2canvas capturing the live DOM).

3. **AC3: Mermaid Diagrams** — Given a document containing Mermaid code blocks (already rendered as SVGs in the preview), when the PDF generates, then the rendered diagrams appear in the PDF as rasterized visuals.

4. **AC4: Code Block Rendering** — Given a document with code blocks, when the PDF generates, then code blocks retain syntax-highlighted appearance (dark background, colored tokens) as rendered in the live preview.

5. **AC5: Progress Indicator** — Given the user clicks "ייצא" in the ExportModal for PDF, when generation begins, then a `PdfProgress` overlay is shown with spinner + Hebrew text "...מייצר PDF".

6. **AC6: Success State** — Given PDF generation completes, when the file downloads, then `PdfProgress` updates to show "!PDF נוצר בהצלחה" and auto-dismisses after 3 seconds.

7. **AC7: Error Handling** — Given PDF generation throws an error, when it occurs, then `PdfProgress` shows "שגיאה ביצירת PDF. נסה שוב." with a retry button (re-runs `generatePdf` with the same filename) and a browser-print fallback.

8. **AC8: Performance** — PDF generation for a document of up to 20 pages completes in under 5 seconds on modern hardware.

9. **AC9: Offline Support** — Given the user is offline, when they export to PDF, then the export works without network requests (html2pdf.js lazy-loaded at first call, then cached by the browser module system).

10. **AC10: Smart Page Breaks** — Given a multi-page document, when the PDF generates, then: H1-H3 headings have `page-break-after: avoid`; tables, code blocks (`pre`), blockquotes have `page-break-inside: avoid`.

## Tasks / Subtasks

- [x] Task 1: Install `html2pdf.js` dependency (AC: #9)
  - [x] 1.1: Run `pnpm add html2pdf.js`
  - [x] 1.2: Run `pnpm add -D @types/html2pdf.js` — DefinitelyTyped types exist for this package; install them so TypeScript doesn't need a manual shim

- [x] Task 2: Create `lib/export/pdf-generator.ts` (AC: #1–#4, #8–#10)
  - [x] 2.1: Export `async function generatePdf(element: HTMLElement, filename: string): Promise<void>`
  - [x] 2.2: Lazy-load via `const html2pdfLib = await import('html2pdf.js'); const html2pdf = html2pdfLib.default;`
  - [x] 2.3: Build options object: `margin: [15, 15, 15, 15]`, `filename: \`${filename}.pdf\``, `image: { type: 'jpeg', quality: 0.95 }`, `html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true }`, `jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }`, `pagebreak: { mode: ['css', 'legacy'] }`
  - [x] 2.4: Inject page-break styles into the element BEFORE calling html2pdf, then restore: create a `<style>` element with `h1,h2,h3{page-break-after:avoid}pre,table,blockquote{page-break-inside:avoid}`, prepend to `element`, call html2pdf, then remove the style element after
  - [x] 2.5: Await `html2pdf().set(opt).from(element).save()` — this triggers download and resolves Promise on completion
  - [x] 2.6: The function must NOT clone the element — html2pdf.js needs the live DOM element so that CSS variables (color theme) and rendered Mermaid SVGs are available to html2canvas

- [x] Task 3: Create `lib/export/pdf-generator.test.ts` (AC: #1–#4, #7, #10)
  - [x] 3.1: Use `vi.hoisted()` to create shared mock functions (`mockSave`, `mockFrom`, `mockSet`, `mockHtml2pdf`) — this is required because `vi.mock` factory is hoisted and cannot access outer-scope `vi.fn()` declarations directly
  - [x] 3.2: `vi.mock('html2pdf.js', () => ({ default: mockHtml2pdf }))`
  - [x] 3.3: `beforeEach(() => { vi.clearAllMocks(); /* re-chain: mockSave.mockResolvedValue(undefined); mockFrom.mockReturnValue({save:mockSave}); ... */ })`
  - [x] 3.4: Test: calls `html2pdf()` with correct `filename` (`'my-doc.pdf'` not `'my-doc'`)
  - [x] 3.5: Test: calls `html2pdf()` with `jsPDF.format === 'a4'`
  - [x] 3.6: Test: calls `html2pdf()` with `html2canvas.scale === 2`
  - [x] 3.7: Test: calls `.from(element)` with the exact element passed in
  - [x] 3.8: Test: calls `.save()` to trigger download
  - [x] 3.9: Test: propagates rejection — `mockSave.mockRejectedValueOnce(new Error('fail'))` → `await expect(generatePdf(el, 'f')).rejects.toThrow('fail')`
  - [x] 3.10: Test: injects a `<style>` element into `element` before calling html2pdf (check `element.querySelector('style')` is called, or spy on `element.prepend`)
  - [x] 3.11: Test: removes the injected `<style>` after generation (element should not have the style tag after `generatePdf` resolves)

- [x] Task 4: Update `components/preview/MarkdownRenderer.tsx` to use `React.forwardRef` (AC: #3)
  - [x] 4.1: Add `React` to the import: `import React, { useMemo, useRef, useEffect, useCallback } from 'react'`
  - [x] 4.2: Convert to `export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(function MarkdownRenderer({ content, dir = 'rtl' }, forwardedRef) { ... })`
  - [x] 4.3: Keep the internal `containerRef = useRef<HTMLDivElement>(null)` — it is still used for Mermaid rendering
  - [x] 4.4: Replace `ref={containerRef}` on the main `<div>` with a ref callback that assigns to BOTH refs:
    ```tsx
    ref={(node) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }}
    ```
  - [x] 4.5: Add `MarkdownRenderer.displayName = 'MarkdownRenderer'` after the forwardRef definition

- [x] Task 5: Update `components/preview/PreviewPanel.tsx` to accept and forward `contentRef` (AC: #3)
  - [x] 5.1: Add `contentRef?: React.Ref<HTMLDivElement>` to `PreviewPanelProps` interface
  - [x] 5.2: Destructure `contentRef` in the function params
  - [x] 5.3: Pass `ref={contentRef}` to `<MarkdownRenderer>` — `ref` is a special prop handled by forwardRef, not passed as a prop explicitly; use `<MarkdownRenderer ref={contentRef} content={content} dir={dir} />`
  - [x] 5.4: Add `import React from 'react'` if not already present (needed to type `React.Ref`)

- [x] Task 6: Create `components/export/PdfProgress.tsx` (AC: #5, #6, #7)
  - [x] 6.1: Props interface: `state: 'generating' | 'success' | 'error'`, `onRetry: () => void`, `onClose: () => void`
  - [x] 6.2: Render as a fixed overlay positioned bottom-right (like a toast): `className="fixed bottom-4 end-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg"`
  - [x] 6.3: **generating state**: spinner icon (use `className="animate-spin"` on a circle SVG or `Loader2` from lucide-react) + `"...מייצר PDF"` text
  - [x] 6.4: **success state**: checkmark icon (`CheckCircle2` from lucide-react, green) + `"!PDF נוצר בהצלחה"` text
  - [x] 6.5: **error state**: alert icon (`AlertCircle` from lucide-react, destructive color) + `"שגיאה ביצירת PDF. נסה שוב."` text + retry button (`aria-label="נסה שוב"`) + close button (`aria-label="סגור"`, calls `onClose`)
  - [x] 6.6: Retry button `onClick={onRetry}` with label "נסה שוב"
  - [x] 6.7: All user-facing text is Hebrew per project convention
  - [x] 6.8: Import only `Loader2`, `CheckCircle2`, `AlertCircle` from `lucide-react` — do NOT add any new npm packages for this component

- [x] Task 7: Update `app/editor/page.tsx` (AC: all)
  - [x] 7.1: Add imports:
    ```typescript
    import { useRef } from 'react';
    import { generatePdf } from '@/lib/export/pdf-generator';
    import { PdfProgress } from '@/components/export/PdfProgress';
    import type { ExportType } from '@/types/editor';
    import { ExportModal } from '@/components/export/ExportModal';
    ```
    Note: `useState` is already imported. `useRef` needs to be added to the existing React import (currently only `useState` is imported from `'react'`).
  - [x] 7.2: Add state and ref inside `EditorPage`:
    ```typescript
    const previewContentRef = useRef<HTMLDivElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null);
    const [pendingPdfFilename, setPendingPdfFilename] = useState('');
    type PdfState = 'idle' | 'generating' | 'success' | 'error';
    const [pdfState, setPdfState] = useState<PdfState>('idle');
    ```
    Note: Story 3.1 adds `isExportModalOpen`, `pendingExportType`, and `handleExportRequest`. Only add what isn't already there after Story 3.1 is implemented.
  - [x] 7.3: Add `function handleExportRequest(type: ExportType) { setPendingExportType(type); setIsExportModalOpen(true); }` (already added by Story 3.1)
  - [x] 7.4: Replace stub `handleExportConfirm` with real implementation:
    ```typescript
    function handleExportConfirm(filename: string, type: ExportType) {
      if (type === 'pdf') {
        void handlePdfExport(filename);
      }
      // 'html' and 'markdown' — implemented in Story 3.3
    }
    ```
  - [x] 7.5: Add `handlePdfExport` async function:
    ```typescript
    async function handlePdfExport(filename: string) {
      const element = previewContentRef.current;
      if (!element) {
        // Fallback if ref not available (should not happen in practice)
        window.print();
        return;
      }
      setPendingPdfFilename(filename);
      setPdfState('generating');
      try {
        await generatePdf(element, filename);
        setPdfState('success');
        setTimeout(() => setPdfState('idle'), 3000);
      } catch {
        setPdfState('error');
      }
    }
    ```
  - [x] 7.6: Pass `contentRef={previewContentRef}` to `<PreviewPanel>` in JSX
  - [x] 7.7: Pass `onExportRequest={handleExportRequest}` to `<Header>` (already done by Story 3.1)
  - [x] 7.8: Add `{pendingExportType && <ExportModal isOpen={isExportModalOpen} onOpenChange={setIsExportModalOpen} exportType={pendingExportType} content={content} onExport={handleExportConfirm} />}` after `<ColorPanel>` (already done by Story 3.1)
  - [x] 7.9: Add `PdfProgress` after `ExportModal`:
    ```tsx
    {pdfState !== 'idle' && (
      <PdfProgress
        state={pdfState}
        onRetry={() => void handlePdfExport(pendingPdfFilename)}
        onClose={() => setPdfState('idle')}
      />
    )}
    ```

- [ ] Task 8: Update sprint status (AC: bookkeeping)
  - [ ] 8.1: `_bmad-output/implementation-artifacts/sprint-status.yaml` — update `3-2-pdf-export-with-colors-and-rtl` from `backlog` to `done` (set by dev after implementation + code review passes)

## Dev Notes

### Critical: Dependency Installation

`html2pdf.js` and its types must be installed BEFORE implementation:
```bash
pnpm add html2pdf.js
pnpm add -D @types/html2pdf.js
```

`@types/html2pdf.js` is on DefinitelyTyped and provides full type coverage. If `pnpm add -D @types/html2pdf.js` fails (package not found), create `lib/export/html2pdf.d.ts`:
```typescript
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: { unit: string; format: string; orientation: string };
    pagebreak?: { mode: string[] };
  }
  interface Html2PdfInstance {
    set(opt: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
  }
  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
```

### Critical: Story 3.1 Must Be Implemented First

Story 3.2 depends on Story 3.1 having been implemented:
- `components/export/ExportModal.tsx` must exist
- `components/ui/dialog.tsx` must exist
- `lib/export/filename-utils.ts` must exist
- `Header.tsx` must have `ToolbarDropdown` + `onExportRequest` prop
- `app/editor/page.tsx` must have `handleExportRequest`, `isExportModalOpen`, `pendingExportType` state, and the `ExportModal` rendering

Story 3.2 modifies `handleExportConfirm` from stub → real implementation. Do NOT touch the other Story 3.1 additions.

### Critical: Pass Live DOM Element to generatePdf — No Cloning

`html2pdf.js` uses `html2canvas` internally. html2canvas captures the LIVE DOM element with:
- Computed CSS variable values (color theme applied to `:root` via `applyColorTheme`)
- Rendered Mermaid SVGs (already in the DOM after async Mermaid rendering)

**Do NOT clone the element before passing to `generatePdf`**. A clone would:
- Lose CSS variable resolution (no computed styles)
- Not have rendered Mermaid SVGs (Mermaid renders async into the live DOM)

### Critical: useRef Import in page.tsx

Currently `app/editor/page.tsx` imports only `useState` from `'react'`:
```typescript
import { useState } from 'react';
```
Add `useRef` to this import:
```typescript
import { useState, useRef } from 'react';
```

### Critical: @testing-library/react Is NOT Installed

As confirmed by Story 1.4 dev notes: `@testing-library/react` is not in the project. All component tests in this story (if needed) must use `react-dom/server` render patterns or be omitted entirely.

`pdf-generator.test.ts` tests the pure async function and does NOT render React components — it only needs Vitest + `vi.mock`. No `@testing-library/react` required.

`PdfProgress.tsx` — no component tests required for this story (it's a simple presentational component).

### Critical: vi.hoisted() Required for html2pdf.js Mock

`vi.mock` factory functions are hoisted to the top of the file by Vitest. They cannot access variables defined with `vi.fn()` in the outer scope. Use `vi.hoisted()` to create shared mock references:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockSave, mockFrom, mockSet, mockHtml2pdf } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(undefined);
  const mockFrom = vi.fn().mockReturnValue({ save: mockSave });
  const mockSet = vi.fn().mockReturnValue({ from: mockFrom });
  const mockHtml2pdf = vi.fn().mockReturnValue({ set: mockSet });
  return { mockSave, mockFrom, mockSet, mockHtml2pdf };
});

vi.mock('html2pdf.js', () => ({ default: mockHtml2pdf }));

import { generatePdf } from './pdf-generator';

describe('generatePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
    mockFrom.mockReturnValue({ save: mockSave });
    mockSet.mockReturnValue({ from: mockFrom });
    mockHtml2pdf.mockReturnValue({ set: mockSet });
  });
  // ...
});
```

### Critical: MarkdownRenderer forwardRef — Merge Refs Correctly

The internal `containerRef` in `MarkdownRenderer` is used by Mermaid rendering (`renderMermaidDiagrams` calls `containerRef.current`). When converting to forwardRef, BOTH refs must point to the same DOM node. Use a ref callback:

```tsx
export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer({ content, dir = 'rtl' }, forwardedRef) {
    const containerRef = useRef<HTMLDivElement>(null);
    // ... existing Mermaid logic uses containerRef unchanged ...

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        // ... all other existing props unchanged ...
      />
    );
  }
);
MarkdownRenderer.displayName = 'MarkdownRenderer';
```

### html2pdf.js Full Implementation

```typescript
// lib/export/pdf-generator.ts
import type { ColorTheme } from '@/types/colors'; // Unused in this story — CSS vars are already on :root

export async function generatePdf(element: HTMLElement, filename: string): Promise<void> {
  const html2pdfLib = await import('html2pdf.js');
  const html2pdf = html2pdfLib.default;

  // Inject page-break styles for smart pagination
  const style = document.createElement('style');
  style.textContent = [
    'h1,h2,h3{page-break-after:avoid}',
    'pre,table,blockquote,figure{page-break-inside:avoid}',
    'img{page-break-inside:avoid;max-width:100%}',
  ].join('');
  element.prepend(style);

  const opt = {
    margin: [15, 15, 15, 15], // mm: top, right, bottom, left
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,           // 2x resolution for crisp text
      useCORS: true,      // Allow cross-origin images
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    // Always remove the injected style, even on failure
    element.removeChild(style);
  }
}
```

**Why no `theme` or `dir` parameter:**
- Color theme: CSS variables are already set on `document.documentElement` by `applyColorTheme` (called by `useColorTheme`). `html2canvas` reads computed styles including CSS variables.
- Direction: The live DOM element already has `dir="rtl"` or `dir="ltr"` applied by `MarkdownRenderer`. html2canvas captures this visually.

### PdfProgress Component Implementation

```tsx
// components/export/PdfProgress.tsx
'use client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PdfProgressProps {
  state: 'generating' | 'success' | 'error';
  onRetry: () => void;
  onClose: () => void;
}

export function PdfProgress({ state, onRetry, onClose }: PdfProgressProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 end-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg"
    >
      {state === 'generating' && (
        <>
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="text-sm">...מייצר PDF</span>
        </>
      )}
      {state === 'success' && (
        <>
          <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
          <span className="text-sm">!PDF נוצר בהצלחה</span>
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
          <span className="text-sm">שגיאה ביצירת PDF. נסה שוב.</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted transition-colors"
            aria-label="נסה שוב"
          >
            נסה שוב
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="סגור"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
```

### page.tsx — Complete Integration Diff

Story 3.1 adds most of the scaffolding. Story 3.2 changes/adds only the following to `app/editor/page.tsx`:

**Import changes (cumulative after Story 3.1):**
```typescript
'use client';
import { useState, useRef } from 'react';          // add useRef
// ... existing imports from Story 3.1 ...
import { generatePdf } from '@/lib/export/pdf-generator';  // NEW in Story 3.2
import { PdfProgress } from '@/components/export/PdfProgress';  // NEW in Story 3.2
```

**State additions (after Story 3.1 state):**
```typescript
// Story 3.1 adds:
const [isExportModalOpen, setIsExportModalOpen] = useState(false);
const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null);

// Story 3.2 adds:
const previewContentRef = useRef<HTMLDivElement>(null);
const [pendingPdfFilename, setPendingPdfFilename] = useState('');
type PdfState = 'idle' | 'generating' | 'success' | 'error';
const [pdfState, setPdfState] = useState<PdfState>('idle');
```

**Replace handleExportConfirm stub (Story 3.1 stub → Story 3.2 real):**
```typescript
// Story 3.1 stub (REMOVE):
// function handleExportConfirm(_filename: string, _type: ExportType) {
//   // Implemented in Stories 3.2 (PDF) and 3.3 (HTML, Markdown)
// }

// Story 3.2 replacement:
function handleExportConfirm(filename: string, type: ExportType) {
  if (type === 'pdf') {
    void handlePdfExport(filename);
  }
  // 'html' and 'markdown' — Story 3.3
}

async function handlePdfExport(filename: string) {
  const element = previewContentRef.current;
  if (!element) {
    window.print(); // fallback
    return;
  }
  setPendingPdfFilename(filename);
  setPdfState('generating');
  try {
    await generatePdf(element, filename);
    setPdfState('success');
    setTimeout(() => setPdfState('idle'), 3000);
  } catch {
    setPdfState('error');
  }
}
```

**JSX changes:**
```tsx
// Add contentRef prop to PreviewPanel:
<PreviewPanel content={debouncedContent} dir={docDirection} contentRef={previewContentRef} />

// Add PdfProgress after ExportModal (Story 3.1 renders ExportModal):
{pdfState !== 'idle' && (
  <PdfProgress
    state={pdfState}
    onRetry={() => void handlePdfExport(pendingPdfFilename)}
    onClose={() => setPdfState('idle')}
  />
)}
```

### Testing Requirements

Use Vitest + jsdom. Run with `pnpm test`. All tests co-located with source files.

**`lib/export/pdf-generator.test.ts` — complete test file:**

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockSave, mockFrom, mockSet, mockHtml2pdf } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(undefined);
  const mockFrom = vi.fn().mockReturnValue({ save: mockSave });
  const mockSet = vi.fn().mockReturnValue({ from: mockFrom });
  const mockHtml2pdf = vi.fn().mockReturnValue({ set: mockSet });
  return { mockSave, mockFrom, mockSet, mockHtml2pdf };
});

vi.mock('html2pdf.js', () => ({ default: mockHtml2pdf }));

import { generatePdf } from './pdf-generator';

describe('generatePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
    mockFrom.mockReturnValue({ save: mockSave });
    mockSet.mockReturnValue({ from: mockFrom });
    mockHtml2pdf.mockReturnValue({ set: mockSet });
  });

  it('appends .pdf to the filename', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'my-document');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'my-document.pdf' })
    );
  });

  it('uses A4 format', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ jsPDF: expect.objectContaining({ format: 'a4' }) })
    );
  });

  it('uses scale: 2 for high-resolution output', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ html2canvas: expect.objectContaining({ scale: 2 }) })
    );
  });

  it('calls .from() with the provided element', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockFrom).toHaveBeenCalledWith(el);
  });

  it('calls .save() to trigger download', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSave).toHaveBeenCalled();
  });

  it('propagates rejection when html2pdf fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('PDF generation failed'));
    const el = document.createElement('div');
    await expect(generatePdf(el, 'test')).rejects.toThrow('PDF generation failed');
  });

  it('injects a <style> element before calling html2pdf', async () => {
    const el = document.createElement('div');
    let styleExistedDuringCall = false;
    mockHtml2pdf.mockImplementationOnce(() => {
      styleExistedDuringCall = el.querySelector('style') !== null;
      return { set: mockSet };
    });
    await generatePdf(el, 'test');
    expect(styleExistedDuringCall).toBe(true);
  });

  it('removes the injected <style> after generation', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(el.querySelector('style')).toBeNull();
  });

  it('removes the injected <style> even when html2pdf fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('fail'));
    const el = document.createElement('div');
    await generatePdf(el, 'test').catch(() => {});
    expect(el.querySelector('style')).toBeNull();
  });
});
```

### Architecture Compliance

| Rule | Application |
|---|---|
| `lib/export/` for export logic | `pdf-generator.ts` placed in `lib/export/` |
| `components/export/` for export UI | `PdfProgress.tsx` placed in `components/export/` |
| Lazy-load heavy libraries | html2pdf.js loaded via `await import('html2pdf.js')` on first call |
| Hebrew UI text | All `PdfProgress` strings are Hebrew |
| ARIA on interactive elements | PdfProgress has `role="status"`, `aria-live="polite"`, Hebrew `aria-label` on buttons |
| No new UI dependencies | Uses lucide-react icons already in project |
| CSS custom properties, not hardcoded colors | PdfProgress uses Tailwind semantic classes (`text-destructive`, `bg-popover`, etc.) |
| Tailwind logical properties | `end-4` not `right-4` in PdfProgress positioning |
| Tests co-located with source | `pdf-generator.test.ts` next to `pdf-generator.ts` |
| No direct localStorage in components | This story doesn't touch localStorage |

### Anti-Patterns to Avoid

- **Do NOT clone the element** before passing to `generatePdf` — clones lose CSS variable resolution and rendered Mermaid SVGs
- **Do NOT import html2pdf.js statically** at the top of the file — use dynamic `await import()` to keep the initial bundle lean
- **Do NOT use Sonner or any toast library** — Sonner is not installed; `PdfProgress` is a custom fixed overlay component
- **Do NOT use @testing-library/react** — it is not installed; `pdf-generator.test.ts` only tests the pure function with `vi.mock`
- **Do NOT modify handleExportRequest** — Story 3.1 implements it; Story 3.2 only replaces `handleExportConfirm`
- **Do NOT implement HTML or Markdown export logic** in this story — `handleExportConfirm` for 'html' and 'markdown' types remains a no-op stub (Story 3.3)
- **Do NOT add `autoFocus`** on any inputs — project-wide rule from Story 2.3 code review (use `useRef` + `useEffect`)
- **Do NOT hardcode colors** in the PDF generator — CSS variables are already resolved by html2canvas reading computed styles from `document.documentElement`
- **Do NOT add `PdfProgress` inside the `<main>` scroll container** — it must be at the root `<main>` level as a fixed overlay

### Cross-Story Context

**Story 3.3 (HTML & Markdown Export) will:**
- Implement `handleExportConfirm` for `type === 'html'` and `type === 'markdown'`
- Add `lib/export/html-generator.ts` and `lib/export/md-generator.ts`
- `PdfProgress` is NOT used in Story 3.3 (HTML/MD exports are synchronous file downloads, no progress needed)

**Story 3.4 (Clipboard Copy):**
- Adds a separate "Copy" dropdown in the Header (not the Export dropdown)
- Uses `lib/export/word-copy.ts` — independent of this story's infrastructure

**Color Theme Sync:**
- Architecture doc cross-cutting rule: `lib/colors/apply-colors.ts → lib/export/pdf-generator.ts` (color sync chain)
- This is satisfied because `applyColorTheme` sets CSS vars on `:root`, and html2canvas reads them — no explicit color passing required

### Git Intelligence

Commit pattern for this story: `"Implement Story 3.2: PDF export with colors and RTL"` (matches project history format).

New files to CREATE:
- `lib/export/pdf-generator.ts`
- `lib/export/pdf-generator.test.ts`
- `components/export/PdfProgress.tsx`

Existing files to MODIFY (minimal changes only):
- `components/preview/MarkdownRenderer.tsx` — forwardRef wrapper only
- `components/preview/PreviewPanel.tsx` — add `contentRef` prop + pass to MarkdownRenderer
- `app/editor/page.tsx` — add `useRef`, `previewContentRef`, `pdfState`, `handlePdfExport`, `PdfProgress` rendering; replace stub `handleExportConfirm`

Files NOT to touch:
- `lib/export/filename-utils.ts` — Story 3.1, no changes
- `components/export/ExportModal.tsx` — Story 3.1, no changes
- `components/ui/dialog.tsx` — Story 3.1, no changes
- `components/layout/Header.tsx` — Story 3.1, no changes
- `types/editor.ts` — `ExportType` already defined

### Project Structure Notes

**Files created in this story:**
- `lib/export/pdf-generator.ts` — async wrapper around html2pdf.js (also creates `lib/export/` directory)
- `lib/export/pdf-generator.test.ts` — unit tests
- `components/export/PdfProgress.tsx` — progress/success/error overlay

**Dependencies added:**
- `html2pdf.js` (runtime) — client-side PDF generation
- `@types/html2pdf.js` (devDependency) — TypeScript types

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 acceptance criteria (line 585–603)](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Flow 2: Export → PDF (line 456–492)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PDF export dialog Phase 1 spec (line 736–739)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Lazy-load html2pdf.js (line 1341)](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — lib/export/pdf-generator.ts (line 677)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — components/export/PdfProgress.tsx (line 644)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Cross-Cutting Color Sync chain (line 789)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — Export offline support (line 735)](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/implementation-artifacts/3-1-export-modal-and-filename-selection.md — handleExportConfirm stub, Story 3.2 replaces it (line 93–95)](_bmad-output/implementation-artifacts/3-1-export-modal-and-filename-selection.md)
- [Source: _bmad-output/implementation-artifacts/1-4-formatting-toolbar.md — @testing-library/react not installed (line 601)](_bmad-output/implementation-artifacts/1-4-formatting-toolbar.md)
- [Source: docs/reference-data/index.html:3012–3027 — Reference doExportPDF implementation (browser print approach, replaced by html2pdf.js)](docs/reference-data/index.html)
- [Source: lib/colors/apply-colors.ts — CSS custom property mapping (17 properties set on document.documentElement)](lib/colors/apply-colors.ts)
- [Source: components/preview/MarkdownRenderer.tsx — existing containerRef and Mermaid rendering logic](components/preview/MarkdownRenderer.tsx)
- [Source: types/editor.ts:6 — ExportType = 'pdf' | 'html' | 'markdown'](types/editor.ts)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

### Completion Notes List

- Installed html2pdf.js 0.14.0 and @types/html2pdf.js 0.10.0 via pnpm
- Created `lib/export/pdf-generator.ts`: async wrapper with lazy import, page-break style injection/cleanup in finally block, A4 format, 2x scale, CORS enabled
- Created `lib/export/pdf-generator.test.ts`: 9 tests covering filename, format, scale, element ref, save call, rejection propagation, style injection before/after/on-failure — all pass
- Converted `MarkdownRenderer` to `React.forwardRef` with dual-ref callback (containerRef for Mermaid + forwardedRef for PDF export); displayName set; all 19 existing tests pass
- Updated `PreviewPanel` to accept `contentRef?: React.Ref<HTMLDivElement>` and pass it as `ref` to `MarkdownRenderer`
- Created `components/export/PdfProgress.tsx`: fixed bottom-right overlay with generating/success/error states, Hebrew text, lucide-react icons, ARIA attributes, logical `end-4` positioning
- Updated `app/editor/page.tsx`: added `useRef`, `previewContentRef`, `PdfProgress` import, `generatePdf` import, `pdfState` state, `handleExportConfirm` replaced stub with real PDF dispatch, `handlePdfExport` async function, `PdfProgress` rendered after ExportModal
- Full test suite: 189 tests pass, 0 regressions

### File List

- lib/export/pdf-generator.ts (new)
- lib/export/pdf-generator.test.ts (new)
- components/export/PdfProgress.tsx (new)
- components/preview/MarkdownRenderer.tsx (modified — forwardRef conversion)
- components/preview/PreviewPanel.tsx (modified — contentRef prop)
- app/editor/page.tsx (modified — useRef, PdfProgress, generatePdf, handlePdfExport)
- package.json (modified — html2pdf.js added)
- pnpm-lock.yaml (modified — lockfile updated)

## Senior Developer Review (AI)

**Reviewer:** BenAkiva on 2026-03-07
**Outcome:** Changes Requested → Fixed

**Findings resolved:**
- 🔴 H1 [FIXED]: AC7 browser-print fallback missing — added `onPrint` prop to `PdfProgress`, wired `window.print()` in `page.tsx`
- 🟡 M1 [FIXED]: No pagebreak/margin test coverage — added 2 tests (`pagebreak.mode`, `margin`)
- 🟡 M2 [FIXED]: No concurrent export guard — added `if (pdfState === 'generating') return` in `handlePdfExport`
- 🟡 M3 [FIXED]: `PdfState` type defined inside component — moved to module scope
- 🟡 M4 [FIXED]: `lib/export/filename-utils.ts` never committed (Story 3.1 residue) — included in commit
- 🟢 L1 [FIXED]: `removeChild` in finally could shadow errors — replaced with `style.remove()`
- 🟢 L2 [FIXED]: No margin test — added as part of M1
- 🟢 L3 [ACCEPTED]: Success state has no manual dismiss — auto-dismiss per AC6 is sufficient

**Final test count:** 191 tests, 0 failures.

## Change Log

- Implemented Story 3.2: PDF export with colors and RTL (Date: 2026-03-07)
- Code review fixes: AC7 print fallback, pagebreak/margin tests, concurrent guard, PdfState scope, style.remove() (Date: 2026-03-07)
