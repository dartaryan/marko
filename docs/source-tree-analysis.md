# Source Tree Analysis

## Directory Structure

```
hebrew-markdown-export/
├── index.html              # ENTRY POINT — Entire application (4,867 lines)
│                           #   Lines 1-52:      HTML head, meta tags, CDN imports
│                           #   Lines 53-2082:   CSS (theming, layout, responsive, print)
│                           #   Lines 2083-2482: HTML body (editor, preview, panels, modals)
│                           #   Lines 2483-4865: JavaScript (all application logic)
├── pen.png                 # App icon (512x512) — used as favicon, PWA icon, Apple touch icon
├── site.webmanifest        # PWA manifest — standalone display, RTL, Hebrew locale
├── .gitignore              # Git ignore rules (design/, docs/, .bmad/, .cursor/)
├── .cursorrules            # Cursor AI config (empty)
├── _bmad/                  # BMAD framework configuration (workflow tooling, not app code)
│   ├── bmm/                # BMM module configs and workflows
│   └── core/               # Core BMAD tasks and protocols
├── _bmad-output/           # BMAD output artifacts
├── docs/                   # Generated project documentation (this folder)
└── .claude/                # Claude Code configuration
    ├── commands/            # BMAD slash commands
    └── settings.local.json # Local Claude settings
```

## Critical Files

### `index.html` — The Entire Application

This single file contains the complete application. Here's a section-by-section breakdown:

#### CSS Architecture (lines 53–2082, ~2,030 lines)
- **CSS Custom Properties** (lines 54-73): 20+ design tokens for theming (`--primary`, `--secondary`, `--background`, etc.)
- **Dark Mode** (lines 75-86): `[data-theme="dark"]` overrides for all color tokens
- **Layout System** (lines 342-353): CSS Grid for two-panel editor/preview layout
- **Component Styles**: Header (118-206), Buttons (208-261), View Toggles (263-303), Panels (355-466), Editor/Textarea (494-517), Preview/Markdown (519-701)
- **Color Panel** (lines 1466-1700): Slide-out panel for color customization
- **Responsive Breakpoints** (lines 876-1132): 5 breakpoints — 1024px, 768px, 640px, 480px, plus print styles
- **Animations** (lines 1201-1222): Panel slide-in animations

#### HTML Structure (lines 2083–2482, ~400 lines)
- **Header**: Logo, view toggle group (editor/preview/both), action buttons (sample, paste, clear, copy dropdown, export dropdown, theme, direction, color, install)
- **Main**: Two-panel grid — Editor panel (toolbar + textarea) and Preview panel
- **Footer**: Project credits with GitHub link
- **Overlays/Modals**: Color panel, link modal, image modal, table modal, export filename modal, What's New modal, color preview modal (image extraction)
- **Toast**: Notification system

#### JavaScript Architecture (lines 2483–4865, ~2,380 lines)
- **App Config** (2484-2518): Version constant (`1.3.0`), changelog array with 3 versions
- **Marked.js Config** (2520-2533): GFM, breaks, Highlight.js integration
- **Mermaid Config** (2536-2574): Base theme, custom color variables from app palette
- **Core Functions** (2703-2873): `renderMarkdown()`, `debounce()`, `saveEditorContent()`, `clearEditor()`, `setViewMode()`, `loadSample()`, copy functions (HTML, plain text, Word)
- **Export System** (2876-3230): `generateStyledHTML()`, `generatePrintHTML()`, `doExportPDF()`, `doExportHTML()`, `doExportMarkdown()`, filename picker
- **UI Interactions** (3232-3355): Dropdown menus, theme toggle, direction toggle, toast notifications
- **Formatting Toolbar** (3355-3614): Text formatting insertion (bold, italic, strikethrough, headings, lists, code blocks, Mermaid templates, links, images, tables)
- **Color System** (3810-4277): 17-property color model, 15 presets (classic, ocean, forest, sunset, mono, lavender, rose, gold, teal, night, ruby, sakura, mint, coffee, sky), localStorage persistence, dynamic CSS injection
- **Color-Aware Exports** (4282-4532): Overridden `generateStyledHTML()` and `generatePrintHTML()` using current colors
- **Global Tooltip System** (4549-4574): Event-delegation-based tooltips via `data-tooltip` attributes
- **Clipboard Paste** (4579-4597): Paste from clipboard button handler
- **PWA Install** (4599-4627): `beforeinstallprompt` handling, install button visibility
- **What's New** (4629-4680): Version comparison, changelog rendering, dismiss tracking via localStorage
- **Image Color Extraction** (4682-4864): k-means clustering (15 iterations, k=6), luminance/saturation analysis, color mapping to 17 app properties, shuffle and preview

## Entry Points

| Entry Point | Description |
|-------------|-------------|
| `index.html` | Opened directly in browser or served via GitHub Pages |
| `site.webmanifest` | PWA entry for installed app mode |

## Asset Summary

| File | Purpose | Size |
|------|---------|------|
| `pen.png` | App icon (favicon, PWA, Apple touch) | 512x512 |
| `site.webmanifest` | PWA configuration | 19 lines |

## External Dependencies (CDN)

| Dependency | CDN URL | Purpose |
|-----------|---------|---------|
| Marked.js | cdn.jsdelivr.net/npm/marked | Markdown → HTML parsing |
| Highlight.js 11.9.0 | cdnjs.cloudflare.com | Code syntax highlighting |
| Mermaid.js 10.x | cdn.jsdelivr.net/npm/mermaid@10 | Diagram rendering |
| Google Fonts | fonts.googleapis.com | Varela Round + JetBrains Mono |

## Key Patterns

- **No module system** — all JavaScript is in a single `<script>` block with global functions
- **No build step** — edit `index.html` and deploy directly
- **CSS Custom Properties** for theming — all colors flow through CSS variables
- **localStorage** for state persistence — editor content, color settings, last version seen
- **Event delegation** for tooltips — single listener on `document` with `data-tooltip` lookups
- **Debounced rendering** — 150ms delay on editor input before re-rendering
