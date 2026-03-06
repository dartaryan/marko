# Hebrew Markdown Export — Full Improvement Plan

**Repository:** [dartaryan/hebrew-markdown-export](https://github.com/dartaryan/hebrew-markdown-export)  
**Scope:** PDF Export upgrades + General tool improvements + Image-based theming system  
**Total items:** 51

---

## Context

The tool is a single-file (`index.html`) Hebrew Markdown editor with RTL support, live preview, Mermaid diagrams, custom color theme controls, and multiple export options.

**Current PDF export** is labeled `ייצא PDF (הדפסה)` and uses `window.print()` — the browser's native print dialog. This is inconsistent across browsers, ignores custom CSS themes, can break RTL, offers no margin or page control, and presents the user with an unwanted print UI instead of a direct download.

---

## Part 1 — PDF Export Fixes & Upgrades

> Replace `window.print()` with a proper client-side PDF generation pipeline. Highest-priority items: #1, #2, #3, #9, #20.

| # | Title | Description |
|---|-------|-------------|
| 1 | **Replace `window.print()` with `html2pdf.js`** | Use `html2pdf.js` for client-side PDF generation — consistent output, no browser print dialog, fully styled. |
| 2 | **Preserve custom color theme in PDF** | The current print method ignores CSS variables and custom themes. Inline all resolved CSS values into the exported PDF stylesheet. |
| 3 | **RTL-aware page layout** | Embed `direction: rtl` and `text-align: right` in the PDF-specific stylesheet so Hebrew text flows correctly in the generated file. |
| 4 | **Page margin controls** | Add a pre-export dialog with a tight / normal / wide margin selector (e.g. 8mm / 15mm / 25mm). |
| 5 | **Paper size selector** | Let the user choose A4, Letter, or A3 before exporting. Default to A4. |
| 6 | **Optional cover page** | Add a toggle to auto-generate a cover page with document title, author name, and export date. |
| 7 | **Auto-generated table of contents** | Generate a clickable TOC from H1–H3 headings and insert it at the start of the PDF. |
| 8 | **Page break hints in Markdown** | Support a custom syntax (e.g. `+++pagebreak+++` or a thematic break) to force page breaks in the exported PDF. |
| 9 | **Render Mermaid diagrams as images** | Convert Mermaid diagrams to rasterized images via `html2canvas` before PDF generation so they don't break or disappear. |
| 10 | **High-resolution export (2x)** | Pass `scale: 2` to `html2canvas` so the PDF is retina-quality, especially for diagrams and tables. |
| 11 | **PDF preview modal** | Show a visual thumbnail of the first page in a modal before the user confirms the download. |
| 12 | **Custom filename with memory** | Present a filename input dialog that pre-fills with the last-used name (stored in `localStorage`). |
| 13 | **Per-page header and footer** | Add optional header (document title) and footer (page number: X / Y) on every page of the PDF. |
| 14 | **Independent font size scaling for PDF** | Allow the user to set a PDF-specific font size (e.g. 12pt, 14pt) separate from the editor display size. |
| 15 | **Password-protected PDF** | Use jsPDF's encryption API to optionally password-protect the exported file before download. |
| 16 | **Clean export CSS class** | Add a `.pdf-hidden` CSS class that hides toolbar, editor pane, and all UI chrome from the PDF output without touching the DOM. |
| 17 | **Export selected content only** | Allow the user to highlight a region in the preview and export only that selection as a PDF. |
| 18 | **Correct multi-page breaks for tables and headings** | Implement `page-break-inside: avoid` and `page-break-after` rules so headers and tables never split awkwardly across pages. |
| 20 | **Progress indicator during PDF generation** | Show a spinner or progress bar while `html2canvas` and jsPDF run, since the UI currently freezes silently during generation. |

> Note: Item #19 (dark mode PDF export) was intentionally excluded.

---

## Part 2 — General Tool Improvements

### UX / Interface

| # | Title | Description |
|---|-------|-------------|
| 21 | **Keyboard shortcuts panel** | Add a visible shortcuts reference (Ctrl+B bold, Ctrl+I italic, etc.) accessible via `?` or a toolbar button. |
| 22 | **Autosave to localStorage** | Auto-persist editor content every few seconds so work is never lost on accidental page refresh. |
| 23 | **Live word & character count** | Display a running word count and character count in the status bar below the editor. |
| 24 | **Reading time estimate** | Show an estimated reading time in the preview pane (e.g. "~3 min read"). |
| 25 | **Focus mode** | A distraction-free toggle that hides the toolbar, preview, and all UI except the editor textarea. |
| 26 | **Undo/redo history stack** | Implement a proper internal undo/redo stack instead of relying on the browser's native undo behavior. |
| 27 | **Document outline panel** | A collapsible side panel showing all H1–H3 headings as clickable navigation links. |
| 28 | **Drag-and-drop image support** | Accept image drops anywhere on the editor and convert them to base64 inline Markdown syntax automatically. |

### Mobile & Responsive

| # | Title | Description |
|---|-------|-------------|
| 29 | **Full mobile layout** | Redesign for small screens: single stacked pane with a toggle button between edit and preview modes. |
| 30 | **Touch-friendly toolbar** | Increase toolbar button tap targets and group less-used actions in a collapsible overflow menu on mobile. |
| 31 | **Swipe gestures on mobile** | Let users swipe left/right between editor and preview panes on touch devices. |
| 32 | **Shareable URL with encoded Markdown** | Add a "Share" button that encodes the current document into the URL (base64 or LZ-compressed) for quick sharing. |

### Features

| # | Title | Description |
|---|-------|-------------|
| 33 | **Document templates picker** | Offer built-in templates (meeting notes, project brief, resume) accessible from a "New from template" menu. |
| 34 | **Footnote support** | Support standard Markdown footnote syntax (`[^1]`) and render them at the bottom of the preview and PDF. |
| 35 | **Find & replace panel** | Add a Ctrl+H triggered panel to search and replace text within the editor. |
| 36 | **Hebrew spellcheck toggle** | Enable browser spellcheck with `lang="he"` on the textarea and add a toggle to switch it on/off. |
| 37 | **Import `.docx` / `.txt` to Markdown** | Add an import button that accepts a `.docx` or `.txt` file and converts its content into Markdown automatically. |
| 38 | **GitHub Flavored Markdown task lists** | Support GFM checkbox syntax (`- [ ]` and `- [x]`) and render interactive checkboxes in the preview. |
| 39 | **Named document snapshots** | A "Save Snapshot" button that stores named versions of the document in `localStorage` for later recall. |
| 40 | **Comparison / diff mode** | A side-by-side diff view comparing two saved snapshots, highlighting additions and deletions. |

### Code Quality & Architecture

| # | Title | Description |
|---|-------|-------------|
| 41 | **Split monolithic `index.html` into JS modules** | Refactor into separate logical files: `editor.js`, `export.js`, `theme.js`, `mermaid.js` — bundled with a simple build step. |
| 42 | **Unit tests for parser and export** | Add a test suite (e.g. Vitest or Jest) covering the Markdown parser, RTL logic, and export utilities. |
| 43 | **PWA service worker for offline use** | Register a service worker so the tool works fully offline after the first load. |
| 44 | **i18n: Hebrew / English UI toggle** | Allow the interface labels and tooltips to switch between Hebrew and English without a page reload. |
| 45 | **Consistent CSS custom properties** | Move all color and spacing values into a single `:root` block of CSS variables; eliminate inline `style=` attributes. |
| 46 | **Replace inline `style=` with CSS classes** | Audit all inline style attributes throughout `index.html` and move them to named CSS classes. |
| 47 | **Mermaid error boundaries** | If a Mermaid diagram fails to parse, display a user-friendly error message in place of the broken diagram. |
| 48 | **CHANGELOG and version badge** | Add a `CHANGELOG.md` and display the current version number in the UI footer. |
| 49 | **Accessibility (a11y) improvements** | Add ARIA labels, roles, and keyboard navigation to all toolbar buttons, modals, and interactive elements. |

> Note: Item #50 (npm/CLI publishing) was intentionally excluded.

---

## Part 3 — Image-Based Theme Generation & Sharing

> A new theming system that replaces the current manual color pickers. The user uploads any image, the tool extracts a harmonious palette from it, applies it site-wide (replacing the current green accent scheme), and can export/share the theme with others.

### 3.1 — Image Upload & Color Extraction

| # | Title | Description |
|---|-------|-------------|
| 51 | **Upload image to generate theme** | Add an "Upload image" button in the theme panel. The user drops or selects any image (photo, brand asset, screenshot, etc.) and the tool extracts a full color palette from it. |
| 52 | **Client-side color extraction via Canvas API** | Use the HTML5 Canvas API to read pixel data from the uploaded image. Run a k-means clustering algorithm (or a library like `color-thief`) to identify the 5–8 dominant colors in the image. No server needed. |
| 53 | **Automatic role assignment** | Map extracted colors to semantic roles automatically: the most dominant color → primary accent, lightest → background, darkest → text, mid-tones → headings, borders, code blocks, etc. |
| 54 | **Contrast validation and auto-adjustment** | After role assignment, check all foreground/background pairs against WCAG AA contrast ratios (4.5:1 for body text). If any pair fails, automatically nudge the lightness value until it passes. |
| 55 | **Live theme preview before applying** | Show a small preview panel (sample heading, paragraph, code block, table, blockquote) rendered with the new palette before the user commits to applying it. |

### 3.2 — Site-Wide Theme Application

| # | Title | Description |
|---|-------|-------------|
| 56 | **Replace green accent system-wide** | The extracted palette replaces the current hardcoded green (`#...`) in all CSS custom properties: primary color, hover states, active states, borders, and highlights — across the editor, toolbar, preview pane, and modals. |
| 57 | **One-click apply with instant re-render** | Clicking "Apply Theme" updates all `:root` CSS variables at once. The entire UI re-renders immediately with no page reload. |
| 58 | **Theme history / undo** | Keep the last 5 applied themes in memory so the user can step back to a previous palette if the new one doesn't work well. |
| 59 | **Manual fine-tuning after extraction** | After the image-generated palette is applied, keep the existing color pickers open and pre-populated with the new values so the user can tweak individual roles. |
| 60 | **Named theme slots** | Let the user save up to 5 named themes (e.g. "Brand", "Dark Forest", "Tel Aviv Morning") in `localStorage` and switch between them instantly. |

### 3.3 — Theme Export & Sharing

| # | Title | Description |
|---|-------|-------------|
| 61 | **Export theme as JSON file** | A "Export Theme" button that downloads a `.json` file containing all theme color values mapped to their semantic role names (e.g. `{ "primary": "#2D6A4F", "background": "#F8F9FA", ... }`). |
| 62 | **Import theme from JSON file** | A matching "Import Theme" button that accepts a `.json` theme file and applies it immediately. Anyone who receives an exported theme file can load it in one click. |
| 63 | **Shareable theme link** | Generate a short URL-encoded string (e.g. `?theme=base64encodedJSON`) that encodes the full palette. The recipient opens the link and the theme is applied automatically on load. |
| 64 | **Copy theme as CSS variables snippet** | A "Copy CSS" button that copies the theme as a ready-to-paste `:root { ... }` CSS block, useful for developers who want to reuse the palette in their own projects. |
| 65 | **Theme thumbnail preview in export** | When exporting a theme JSON, generate a small PNG thumbnail (a 5-swatch color strip) and embed it as base64 inside the JSON so recipients can see the palette before importing. |

---

## Implementation Notes

### Recommended stack additions for Part 3

```js
// Color extraction — client-side, no dependencies needed beyond canvas
// Option A: use color-thief (lightweight, CDN-available)
import ColorThief from 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js';

// Option B: custom k-means on canvas pixel data (zero dependencies)
// Read imageData from a <canvas>, cluster RGB values, pick top-k centroids

// Contrast check
function contrastRatio(hex1, hex2) { /* WCAG relative luminance formula */ }

// Apply theme
function applyTheme(palette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([role, value]) => {
    root.style.setProperty(`--color-${role}`, value);
  });
}

// Export
function exportTheme(palette, name) {
  const blob = new Blob([JSON.stringify({ name, palette }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.theme.json`;
  a.click();
}

// Share via URL
function getThemeShareLink(palette) {
  const encoded = btoa(JSON.stringify(palette));
  return `${location.origin}${location.pathname}?theme=${encoded}`;
}
```

### CSS variable structure (target)

```css
:root {
  /* Primary accent — replaces current green */
  --color-primary:        #2D6A4F;
  --color-primary-hover:  #1B4332;
  --color-primary-light:  #D8F3DC;

  /* Text */
  --color-text-main:      #1E293B;
  --color-text-secondary: #64748B;

  /* Backgrounds */
  --color-bg-preview:     #F8F9FA;
  --color-bg-code:        #F1F5F9;
  --color-bg-quote:       #F0FDF4;

  /* Headings */
  --color-h1:             #1A3C2E;
  --color-h2:             #2D6A4F;
  --color-h3:             #40916C;

  /* Borders & dividers */
  --color-border:         #D1D5DB;
  --color-divider:        #E5E7EB;
}
```

### Priority order for implementation

1. **#1, #3, #9, #20** — Fix the PDF export pipeline first (highest pain point)
2. **#45, #46** — Consolidate CSS variables (prerequisite for the theme system)
3. **#51–#57** — Core image-to-theme extraction and application
4. **#61–#63** — Theme export and sharing
5. **#22, #29, #30** — Autosave and mobile layout (high user value, low complexity)
6. Remaining items by priority as time allows

---

*Document generated from a planning session. All 48 original items plus 15 new theming items = 51 actionable improvements (excluding intentionally omitted #19 and #50).*
