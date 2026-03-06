# Hebrew Markdown Editor — Project Overview

## Executive Summary

Hebrew Markdown Editor is a client-side web application for writing, previewing, and exporting Markdown content with full RTL (Right-to-Left) Hebrew language support. The entire application runs in the browser with no backend, no build tools, and no framework — it's a single `index.html` file (~4,867 lines) deployed as a static site on GitHub Pages with PWA (Progressive Web App) support.

**Live URL:** https://dartaryan.github.io/hebrew-markdown-export/

## Purpose

Provide Hebrew-speaking users with a professional Markdown editing experience that:
- Renders Markdown in real-time with proper RTL text direction
- Supports Mermaid diagrams with themed colors
- Exports to PDF, HTML, and raw Markdown files
- Copies formatted content for pasting into Microsoft Word with RTL preservation
- Offers extensive color/theme customization (15 presets + custom + image color extraction)
- Works offline as an installable PWA

## Project Facts

| Property | Value |
|----------|-------|
| **Project Name** | hebrew-markdown-export |
| **Repository Type** | Monolith (single-part) |
| **Project Type** | Web Application |
| **Primary Language** | JavaScript (ES2017+) |
| **Framework** | None (vanilla HTML/CSS/JS) |
| **Build Tools** | None |
| **Package Manager** | None |
| **Hosting** | GitHub Pages (static) |
| **PWA** | Yes (Web App Manifest) |
| **Version** | 1.3.0 |
| **Author** | Ben Akiva |
| **License** | Not specified |
| **Total Source Lines** | ~4,867 (single file) |

## Technology Stack

| Category | Technology | Version | Justification |
|----------|-----------|---------|---------------|
| Markup/Structure | HTML5 | N/A | Semantic HTML with RTL support |
| Styling | CSS3 | N/A | Custom properties, grid, flexbox, media queries |
| Logic | Vanilla JavaScript | ES2017+ | async/await, template literals, modules not needed |
| Markdown Parsing | Marked.js | latest (CDN) | GFM support, extensible, lightweight |
| Code Highlighting | Highlight.js | 11.9.0 | Wide language support, github-dark theme |
| Diagrams | Mermaid.js | 10.x | Flowcharts, sequence, pie charts with theming |
| Fonts | Google Fonts | CDN | Varela Round (body) + JetBrains Mono (code) |
| PWA | Web App Manifest | N/A | Offline-capable, installable |
| Persistence | localStorage | N/A | Editor content, color settings, version tracking |

## Architecture Overview

The application follows a **single-page monolithic** architecture where all HTML, CSS, and JavaScript reside in one file:

- **CSS Section** (~lines 53–2,082): CSS custom properties for theming, responsive layouts via CSS Grid, dark mode via `[data-theme="dark"]`, print styles, 5 responsive breakpoints
- **HTML Section** (~lines 2,083–2,482): Two-panel layout (editor + preview), color customization panel, modals (link, image, table, export, changelog, color preview)
- **JavaScript Section** (~lines 2,483–4,865): Markdown rendering pipeline, export engines (PDF/HTML/MD/Word), color system with 15 presets, image color extraction (k-means), PWA lifecycle, changelog/versioning

## Key Features

1. **Markdown Editor** — textarea with formatting toolbar (bold, italic, headings, lists, code blocks, tables, links, images)
2. **Live Preview** — real-time rendering with Marked.js + Highlight.js + Mermaid.js
3. **RTL/LTR Toggle** — switch between Hebrew (RTL) and English (LTR) text direction
4. **Dark/Light Theme** — toggleable with CSS custom properties
5. **View Modes** — editor-only, preview-only, or split view
6. **Export System** — PDF (via browser print), HTML file, Markdown file, copy to Word with inline RTL styles
7. **Color Customization** — 17 color properties, 15 theme presets, custom saves, image color extraction via k-means clustering
8. **Mermaid Diagrams** — flowcharts, sequence diagrams, pie charts, all themed with app colors
9. **PWA Support** — installable, offline-capable via web manifest
10. **Auto-save** — content persisted to localStorage with debounced saves
11. **What's New Modal** — version-based changelog shown on updates
12. **Auto-naming** — export filenames derived from first heading

## Links to Documentation

- [Source Tree Analysis](./source-tree-analysis.md)
- [Architecture](./architecture.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
