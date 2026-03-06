# Development Guide

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A text/code editor (VS Code, Cursor, etc.)
- Git (for version control)
- Optionally: a local HTTP server (e.g., `npx serve`, Python `http.server`, or VS Code Live Server extension)

**No Node.js, npm, or any package manager is required.**

## Project Setup

```bash
# Clone the repository
git clone https://github.com/dartaryan/hebrew-markdown-export.git
cd hebrew-markdown-export
```

That's it. There are no dependencies to install and no build step.

## Running Locally

### Option 1: Direct File Open
Simply open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

> **Note:** Some features (PWA install, clipboard API) may require HTTPS or a proper HTTP server.

### Option 2: Local HTTP Server (Recommended)
```bash
# Using Python
python -m http.server 8080

# Using Node.js (if available)
npx serve .

# Using VS Code
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

Then navigate to `http://localhost:8080` (or the port shown).

## Project Structure

The entire application lives in **one file**: `index.html`

```
index.html
├── Lines 1-52:      <head> — Meta tags, CDN imports
├── Lines 53-2082:   <style> — All CSS (~2,030 lines)
├── Lines 2083-2482: <body> — All HTML structure (~400 lines)
└── Lines 2483-4865: <script> — All JavaScript (~2,380 lines)
```

### Key Sections for Development

| Section | Lines | What to Edit |
|---------|-------|-------------|
| CSS Variables | 54-73 | Design tokens (default colors) |
| Dark Mode | 75-86 | Dark theme overrides |
| Responsive | 876-1132 | Mobile/tablet breakpoints |
| Print Styles | 1134-1170 | PDF export styling |
| HTML Structure | 2083-2482 | UI layout and elements |
| App Version | 2485 | `APP_VERSION` constant |
| Changelog | 2486-2518 | `CHANGELOG` array |
| Sample Content | 2593-2700 | Hebrew Markdown example |
| Color Presets | 3834-4102 | Theme preset definitions |

## Making Changes

### Adding a New Color Preset

1. Add the preset object to `colorPresets` (~line 3834):
```javascript
myPreset: {
    primaryText: '#...',
    secondaryText: '#...',
    link: '#...',
    code: '#...',
    h1: '#...',
    h1Border: '#...',
    h2: '#...',
    h2Border: '#...',
    h3: '#...',
    previewBg: '#...',
    codeBg: '#...',
    blockquoteBg: '#...',
    tableHeader: '#...',
    tableAlt: '#...',
    blockquoteBorder: '#...',
    hr: '#...',
    tableBorder: '#...'
}
```

2. Add the preset button to the HTML `.preset-grid` (~line 2319):
```html
<button class="preset-btn" data-name="My Preset" data-preset="myPreset"
        onclick="applyPreset('myPreset')"
        style="background: linear-gradient(135deg, #COLOR1, #COLOR2);"></button>
```

3. Add the Hebrew name to `getPresetDisplayName()` (~line 4235).

### Adding a New Mermaid Diagram Type

Add a case to `insertMermaid(type)` (~line 3521):
```javascript
case 'myDiagram':
    template = '```mermaid\nmyDiagramType\n    ...\n```';
    break;
```

Then add a button to the Mermaid toolbar dropdown in the HTML.

### Adding a New Export Format

1. Create a `doExportFoo(filename)` function following the pattern of `doExportHTML()` (~line 3202)
2. Add a case to `confirmExport()` (~line 2985)
3. Add a dropdown item to the export dropdown in the HTML

### Updating the Version

1. Update `APP_VERSION` on line 2485
2. Add a new entry to the `CHANGELOG` array on line 2486:
```javascript
{
    version: '1.4.0',
    date: '2026-XX-XX',
    changes: [
        'Description of change 1',
        'Description of change 2'
    ]
}
```

## Code Conventions

- **Language**: All UI text is in Hebrew. Function names and variables are in English.
- **Naming**: camelCase for variables and functions. No classes or modules.
- **CSS**: BEM-like naming (`.color-panel-header`, `.toolbar-dropdown-item`). CSS custom properties for all theme colors.
- **HTML IDs**: camelCase (e.g., `colorPanel`, `exportModal`, `editorToolbar`)
- **Event handling**: Mix of inline `onclick` handlers and `addEventListener` calls
- **No semicolons**: Some statements use semicolons, some don't. No enforced style.
- **No linting**: No ESLint, Prettier, or similar tools configured.

## Deployment

The project deploys to GitHub Pages automatically from the `main` branch.

```bash
# Make changes
git add index.html
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically serve the updated `index.html` at:
`https://dartaryan.github.io/hebrew-markdown-export/`

## Debugging Tips

- **Mermaid rendering issues**: Check browser console for Mermaid parse errors. The app silently catches them.
- **Color not applying**: Check if `customColorStyle` element exists in `<head>`. Inspect `currentColors` object in console.
- **Export RTL issues**: The `generateStyledHTML()` function applies inline styles. Check that RTL direction is set on all elements.
- **localStorage**: Clear with `localStorage.clear()` in console to reset all saved state.
- **PWA not installing**: Requires HTTPS. Check `site.webmanifest` for valid configuration. The install button only appears when `beforeinstallprompt` fires.

## Common Development Tasks

| Task | How |
|------|-----|
| Test dark mode | Click the moon/sun icon in the header |
| Test RTL/LTR | Click the direction toggle button in the toolbar |
| Test color preset | Open color panel (palette icon), click a preset |
| Test export | Click export dropdown, choose format, enter filename |
| Test Mermaid | Type a mermaid code block in the editor |
| Clear saved state | Run `localStorage.clear()` in browser console |
| Check version display | Change `APP_VERSION` and reload |
