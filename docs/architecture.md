# Architecture Documentation

## Architecture Pattern

**Single-Page Client-Side Application (Monolithic SPA)**

The entire application is a single `index.html` file with no build pipeline, no framework, and no backend. All rendering, state management, and export operations happen client-side in the browser.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   index.html                          │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │   CSS Layer  │  │  HTML Layer   │  │  JS Layer  │  │   │
│  │  │  (~2,030 ln) │  │  (~400 ln)    │  │ (~2,380 ln)│  │   │
│  │  │              │  │               │  │            │  │   │
│  │  │ • Theming    │  │ • Editor      │  │ • Render   │  │   │
│  │  │ • Layout     │  │ • Preview     │  │ • Export   │  │   │
│  │  │ • Responsive │  │ • Modals      │  │ • Colors   │  │   │
│  │  │ • Print      │  │ • Color Panel │  │ • PWA      │  │   │
│  │  │ • Dark Mode  │  │ • Tooltips    │  │ • Storage  │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                External CDN Libraries                 │   │
│  │  Marked.js │ Highlight.js │ Mermaid.js │ Google Fonts│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  localStorage                         │   │
│  │  mdEditorContent │ mdEditorColors │ mdEditorLastVer  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Static Host)                │
│  Serves: index.html, pen.png, site.webmanifest              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Markdown Rendering Pipeline

```
User types in <textarea>
        │
        ▼
  debounce(150ms)
        │
        ▼
  renderMarkdown()
        │
        ├──► marked.parse(markdown) ──► Raw HTML
        │
        ├──► Find <pre><code class="language-mermaid"> blocks
        │       └──► Replace with <div class="mermaid">
        │
        ├──► Set preview.innerHTML
        │
        ├──► hljs.highlightElement() on <pre><code> blocks
        │
        └──► mermaid.run() on .mermaid divs
```

### Color System Flow

```
Color Change (picker / preset / image extraction)
        │
        ▼
  currentColors object updated
        │
        ▼
  applyColors()
        │
        ├──► Generate <style> tag with all .preview-content rules
        ├──► Inject/update in <head>
        ├──► Save to localStorage
        ├──► Re-init Mermaid with themeVariables from currentColors
        └──► Re-render existing Mermaid diagrams with new colors
```

### Export Flow

```
User clicks Export button
        │
        ▼
  openExportModal(type)  ──► Show filename picker (pre-filled from first heading)
        │
        ▼
  confirmExport()
        │
        ├──► PDF:  generatePrintHTML() ──► window.open() ──► print dialog
        ├──► HTML: generateStyledHTML() ──► Blob ──► download link
        └──► MD:   editor.value ──► Blob ──► download link
```

## State Management

The application uses **localStorage** as its only persistence layer. No server-side state exists.

| Key | Type | Purpose |
|-----|------|---------|
| `mdEditorContent` | string | Saved Markdown content from the editor |
| `mdEditorColors` | JSON string | Current color customization (17 properties) |
| `mdEditorCustomPreset` | JSON string | User-saved custom color preset |
| `mdEditorLastVersion` | string | Last app version seen (for What's New modal) |

### In-Memory State

| Variable | Type | Purpose |
|----------|------|---------|
| `currentColors` | object | Active 17-property color configuration |
| `colorPresets` | object | 15 built-in theme presets |
| `defaultColors` | object | Default "classic" color scheme |
| `isLTR` | boolean | Current text direction (false = RTL default) |
| `mermaidId` | number | Auto-incrementing ID for Mermaid divs |
| `deferredPrompt` | event | PWA install prompt event |
| `extractedColors` | array | Colors from image extraction (k-means result) |
| `extractedColorMapping` | object | Mapped extracted colors to 17 app properties |
| `pendingExportType` | string | Current export type for filename modal |

## Component Architecture

### UI Components (HTML/CSS)

```
Application
├── Header (fixed)
│   ├── Logo
│   ├── View Toggle Group (editor / both / preview)
│   └── Header Actions
│       ├── Sample Button
│       ├── Paste Button
│       ├── Clear Button
│       ├── Copy Dropdown (HTML / Plain Text / Word)
│       ├── Export Dropdown (PDF / HTML / Markdown)
│       ├── Theme Toggle (dark/light)
│       ├── Direction Toggle (RTL/LTR)
│       ├── Color Settings Button
│       └── PWA Install Button (conditional)
│
├── Main (grid layout)
│   ├── Editor Panel
│   │   ├── Panel Header
│   │   ├── Formatting Toolbar
│   │   │   ├── Text Group (bold, italic, strikethrough, highlight)
│   │   │   ├── Heading Dropdown (H1-H6)
│   │   │   ├── List Group (unordered, ordered, task)
│   │   │   ├── Insert Group (link, image, table, HR)
│   │   │   ├── Code Group (inline, block dropdown)
│   │   │   └── Mermaid Dropdown (flowchart, sequence, class, state, ER, pie, gantt)
│   │   └── Textarea (RTL by default)
│   │
│   └── Preview Panel
│       ├── Panel Header
│       └── Preview Content (rendered Markdown)
│
├── Footer
│   └── Credits + GitHub link
│
├── Color Panel (slide-out)
│   ├── Text Colors (4 pickers)
│   ├── Heading Colors (5 pickers)
│   ├── Background Colors (5 pickers)
│   ├── Accent Colors (3 pickers)
│   ├── Image Color Extraction button
│   ├── Preset Grid (15 themes)
│   └── Reset / Save buttons
│
├── Modals
│   ├── Link Modal (text + URL inputs)
│   ├── Image Modal (alt + URL inputs)
│   ├── Table Modal (visual grid size picker)
│   ├── Export Modal (filename picker)
│   ├── What's New Modal (changelog)
│   └── Color Preview Modal (image extraction result)
│
├── Toast Notification (fixed bottom)
└── Global Tooltip (fixed, positioned on hover)
```

## Security Considerations

- **No server-side code** — no injection vectors on backend
- **Mermaid securityLevel: 'loose'** — allows HTML in Mermaid diagrams. This is a known trade-off for rendering flexibility in a local-use tool
- **CDN dependencies** — external scripts loaded from jsdelivr and cdnjs. SRI hashes are not used
- **Clipboard API** — requires user permission, graceful fallback to `document.execCommand('copy')`
- **No authentication** — fully client-side, no user accounts

## Testing Strategy

- **No automated tests** — the project has no test files, test framework, or CI/CD pipeline
- **Manual testing** — all features tested by directly using the app in the browser
- **Browser compatibility** — targets modern browsers (Chrome, Firefox, Edge, Safari) with CSS Grid and ES2017+ features

## Deployment

- **GitHub Pages** — static deployment from the `main` branch
- **No build step** — `index.html` is deployed directly as-is
- **CDN assets** — all external dependencies loaded at runtime from CDN
- **PWA** — `site.webmanifest` enables installation as a standalone app

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single HTML file | Simplicity — no build tools, easy to deploy, easy to share |
| No framework | Lightweight, fast load, no unnecessary abstraction for a tool this focused |
| CDN dependencies | Avoid package management overhead for a static site |
| localStorage | Simple persistence without a backend; appropriate for a single-user editor |
| CSS Custom Properties | Enable runtime theming (15 presets + custom) without CSS-in-JS |
| Inline styles for Word export | Word ignores external CSS; inline styles ensure RTL preservation |
| k-means for color extraction | Effective dominant color extraction from images without external libs |
| Debounced rendering (150ms) | Prevents excessive re-renders during fast typing |
