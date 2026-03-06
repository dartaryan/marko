# Component Inventory

## UI Components

Since this is a vanilla HTML/CSS/JS application with no component framework, "components" here refers to distinct UI sections, each with its own CSS classes and JavaScript behavior.

### Layout Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Header | `.header` | 118-206 | Fixed top bar with logo, view toggles, and action buttons |
| Main Layout | `.main` | 342-353 | CSS Grid container for editor/preview panels |
| Panel | `.panel` | 355-466 | Card-like container with gradient top border and hover effects |
| Footer | `.footer` | 815-873 | Credits section with GitHub link |

### Editor Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Editor Panel | `.panel:first-child` | HTML 2083-2108 | Left panel with toolbar and textarea |
| Formatting Toolbar | `.editor-toolbar` | 1224-1278 | Sticky toolbar with formatting buttons |
| Toolbar Button | `.toolbar-btn` | 1250-1278 | 32x32 icon button with hover animation |
| Toolbar Group | `.toolbar-group` | 1235-1248 | Grouped toolbar buttons with separator |
| Toolbar Dropdown | `.toolbar-dropdown` | 1310-1356 | Expandable dropdown menus (headings, code, mermaid) |
| Editor Textarea | `.editor-textarea` | 494-517 | Full-height textarea with RTL/LTR support |
| Textarea Wrapper | `.editor-textarea-wrapper` | 481-492 | Flex container for textarea auto-sizing |

### Preview Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Preview Panel | `.panel:nth-child(2)` | HTML 2111-2123 | Right panel for rendered output |
| Preview Content | `.preview-content` | 519-701 | Styled container for rendered Markdown |
| Mermaid Container | `.mermaid` | 704-718 | LTR-directed wrapper for Mermaid diagrams |

### Navigation/Control Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| View Toggle Group | `.view-toggle-group` | 263-303 | Segmented button for editor/both/preview views |
| View Toggle Button | `.view-toggle-btn` | 272-303 | Individual view mode button with active state |
| Header Actions | `.header-actions` | 181-206 | Container for all header action buttons |
| Action Separator | `.header-action-separator` | 200-206 | Visual divider between action groups |
| Direction Toggle | `.direction-toggle-btn` | 1396-1436 | RTL/LTR toggle with color state change |
| Color Settings Button | `.color-settings-btn` | 1367-1393 | Opens color customization panel |

### Button Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Primary Button | `.btn-primary` | 224-234 | Green filled button |
| Secondary Button | `.btn-secondary` | 236-245 | Semi-transparent button |
| Icon Button | `.btn-icon` | 247-256 | Icon-only button |
| Panel Button | `.panel-btn` | 420-442 | Small action button in panel headers |

### Color Customization Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Color Panel | `.color-panel` | 1493-1511 | Slide-out sidebar for color customization |
| Color Panel Overlay | `.color-panel-overlay` | 1513-1526 | Dark backdrop when panel is open |
| Color Section | `.color-section` | 1571-1583 | Grouped color settings (text, headings, backgrounds, accents) |
| Color Row | `.color-row` | 1586-1601 | Label + color picker + hex input |
| Color Input | `.color-input` | 1604-1621 | Native color picker styled as small square |
| Color Hex Input | `.color-hex` | 1623-1633 | Text input for hex color values |
| Preset Grid | `.preset-grid` | 1641-1646 | 5-column grid of theme preset buttons |
| Preset Button | `.preset-btn` | 1648-1687 | Square gradient button with tooltip name |

### Modal Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Modal Overlay | `.modal-overlay` | CSS 1700+ | Full-screen backdrop with centered modal |
| Modal | `.modal` | CSS 1700+ | White card with title, fields, actions |
| Link Modal | `#linkModal` | HTML 2349-2365 | Text + URL inputs for link insertion |
| Image Modal | `#imageModal` | HTML 2368-2384 | Alt + URL inputs for image insertion |
| Table Modal | `#tableModal` | HTML 2387-2400 | Visual grid picker for table dimensions |
| Export Modal | `#exportModal` | HTML 2403-2418 | Filename input with extension label |
| What's New Modal | `#whatsNewModal` | HTML 2421-2432 | Changelog entries with version badges |
| Color Preview Modal | `#colorPreviewModal` | HTML 2435-2481 | Extracted colors preview with mock document |

### Feedback Components

| Component | CSS Class(es) | Lines | Description |
|-----------|---------------|-------|-------------|
| Toast | `.toast` | 720-751 | Bottom-center notification with animation |
| Global Tooltip | `.global-tooltip` | 1280-1308 | Fixed-position tooltip positioned via JS |
| Dropdown Menu | `.dropdown-menu` | 759-813 | Floating menu for copy/export actions |

## JavaScript Functional Components

### Core Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `renderMarkdown()` | 2703-2740 | Parse Markdown, render Mermaid, highlight code |
| `debounce()` | 2743-2753 | Utility to throttle rapid calls |
| `saveEditorContent()` | 2756-2758 | Persist editor text to localStorage |
| `clearEditor()` | 2767-2772 | Reset editor and preview |
| `setViewMode(mode)` | 2775-2805 | Toggle between editor/preview/both layouts |
| `loadSample()` | 2808-2813 | Load Hebrew Markdown sample content |

### Copy/Export Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `copyHTML()` | 2816-2823 | Copy rendered HTML to clipboard |
| `copyPlainText()` | 2826-2833 | Copy plain text to clipboard |
| `copyForWord()` | 2836-2873 | Copy with inline RTL styles for Word |
| `generateStyledHTML()` | 2876-2958 | Generate HTML with inline styles for Word/export |
| `generatePrintHTML()` | 3030-3200 | Generate full HTML document for PDF printing |
| `doExportPDF(filename)` | 3012-3027 | Open print dialog for PDF save |
| `doExportHTML(filename)` | 3202-3216 | Download styled HTML file |
| `doExportMarkdown(filename)` | 3217-3230 | Download raw Markdown file |
| `getFirstHeading()` | 2963-2972 | Extract first heading for auto-naming exports |

### Formatting Toolbar Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `insertFormat(type)` | 3355-3471 | Insert Markdown formatting (bold, italic, etc.) |
| `insertHeading(level)` | 3472-3498 | Insert heading at specified level |
| `insertCodeBlock(language)` | 3499-3520 | Insert fenced code block |
| `insertMermaid(type)` | 3521-3613 | Insert Mermaid diagram template (7 types) |
| `openLinkModal()` | 3614-3621 | Show link insertion modal |
| `openImageModal()` | 3622-3629 | Show image insertion modal |
| `openTableModal()` | 3630-3658 | Show table size picker modal |
| `insertLink()` | 3680-3698 | Insert Markdown link from modal inputs |
| `insertImage()` | 3699-3717 | Insert Markdown image from modal inputs |
| `insertTable()` | 3718-3760 | Generate Markdown table from grid selection |

### Color System Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `loadColors()` | 4108-4119 | Load saved colors from localStorage |
| `applyColors()` | 4122-4170 | Inject CSS + re-init Mermaid with colors |
| `updateColor(key, value)` | 4202-4207 | Update single color from picker |
| `updateColorFromHex(key, value)` | 4210-4217 | Update single color from hex input |
| `applyPreset(presetName)` | 4220-4233 | Apply a built-in color preset |
| `resetColors()` | 4252-4262 | Reset to default "classic" colors |
| `saveCustomPreset()` | 4265-4268 | Save current colors as custom preset |
| `toggleColorPanel()` | 4271-4276 | Toggle color panel slide-out |
| `initMermaid()` | 2544-2574 | Re-initialize Mermaid with current theme colors |

### Image Color Extraction Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `extractColorsFromImage(input)` | 4689-4723 | Read image, downsample, run k-means, show preview |
| `quantizeColors(pixels, k)` | 4740-4776 | k-means clustering (15 iterations, k=6 clusters) |
| `mapExtractedColors()` | 4778-4822 | Map 6 extracted colors to 17 app color properties |
| `updateColorPreviewModal()` | 4824-4849 | Render mock document with extracted colors |
| `shuffleExtractedColors()` | 4851-4855 | Rotate color assignments |
| `applyExtractedColors()` | 4857-4864 | Apply extracted colors to app |
| `getLuminance(rgb)` | 4726-4728 | Calculate perceived brightness |
| `getSaturation(rgb)` | 4730-4734 | Calculate color saturation |
| `rgbToHex(rgb)` | 4736-4738 | Convert RGB array to hex string |

### Utility Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `toggleTheme()` | 3257-3274 | Toggle dark/light mode |
| `toggleDirection()` | 3275-3297 | Toggle RTL/LTR |
| `showToast(message)` | 3298-3333 | Show notification toast |
| `toggleDropdown(id)` | 3232-3244 | Toggle header dropdown menus |
| `closeDropdowns()` | 3245-3256 | Close all open dropdowns |
| `toggleToolbarDropdown(id)` | 3334-3342 | Toggle toolbar dropdown menus |
| `adjustColor(color, percent)` | 4173-4184 | Lighten/darken a hex color |
| `capitalize(str)` | 4197-4199 | Capitalize first letter |
| `pasteFromClipboard()` | 4579-4597 | Paste clipboard text at cursor |
| `installPWA()` | 4611-4621 | Trigger PWA install prompt |
| `checkWhatsNew()` | 4632-4637 | Show changelog if version changed |
| `compareVersions(a, b)` | 4639-4647 | Semantic version comparison |

## Color Presets (15 themes)

| Preset | Primary Color | Description |
|--------|--------------|-------------|
| classic | #10B981 (emerald) | Default green theme |
| ocean | #0EA5E9 (sky blue) | Blue ocean theme |
| forest | #22C55E (green) | Deep green forest |
| sunset | #F97316 (orange) | Warm orange/red |
| mono | #6B7280 (gray) | Monochrome grayscale |
| lavender | #8B5CF6 (purple) | Purple lavender |
| rose | #F43F5E (pink) | Pink rose |
| gold | #F59E0B (amber) | Warm gold/amber |
| teal | #14B8A6 (teal) | Teal/turquoise |
| night | #60A5FA (blue) | Dark mode blue |
| ruby | #E10514 (red) | Red on warm white |
| sakura | #E891B2 (soft pink) | Cherry blossom pink |
| mint | #4FD1C5 (mint) | Cool mint green |
| coffee | #8D6E63 (brown) | Warm coffee brown |
| sky | #63B3ED (light blue) | Light sky blue |
