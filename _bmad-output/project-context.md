---
project_name: 'hebrew-markdown-export'
user_name: 'BenAkiva'
date: '2026-03-05'
sections_completed: ['technology_stack', 'language_rules', 'architecture_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 52
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Architecture**: Single-file monolithic SPA — entire app is one `index.html` (~4,867 lines), no build step, no framework, no package manager
- **Language**: Vanilla JavaScript ES2017+ (async/await, template literals), all global functions in a single `<script>` block
- **Styling**: CSS3 with Custom Properties for runtime theming, CSS Grid layout, 5 responsive breakpoints
- **Markdown**: Marked.js (latest via CDN) — GFM enabled, breaks enabled
- **Code Highlighting**: Highlight.js 11.9.0 (CDN) — github-dark theme
- **Diagrams**: Mermaid.js 10.x (CDN) — securityLevel 'loose', themed with app colors
- **Fonts**: Google Fonts — Varela Round (body), JetBrains Mono (code)
- **Persistence**: localStorage only (no backend, no server)
- **Deployment**: GitHub Pages static hosting, deploy by pushing `index.html` to `main`
- **PWA**: Web App Manifest (`site.webmanifest`), standalone display, RTL, Hebrew locale

## Critical Implementation Rules

### Language-Specific Rules (JavaScript ES2017+)

- All code lives in a single `<script>` block — no modules, no imports, all functions are global
- camelCase for variables and functions; no classes or OOP patterns
- async/await for all asynchronous operations (clipboard, image loading) — no Promise chains
- Direct DOM manipulation via getElementById/querySelector — no virtual DOM or abstraction layer
- innerHTML is used for preview rendering; new features should follow this pattern
- Mix of inline onclick handlers (HTML) and addEventListener (JS) — both patterns are acceptable
- Silent error handling for Mermaid parsing; clipboard uses try/catch with execCommand fallback
- No strict mode enforced; no linting or formatting tools configured

### Architecture & Subsystem Rules

- **Single-file constraint**: ALL code (CSS, HTML, JS) must go in `index.html` — never create separate .js, .css, or .html files for app code
- **Section boundaries**: CSS (~lines 53-2082), HTML (~lines 2083-2482), JS (~lines 2483-4865) — add new code in the correct section
- **Color system**: 17-property color model (`currentColors` object). New UI elements that use color MUST use CSS custom properties or be included in `applyColors()` and both `generateStyledHTML()` / `generatePrintHTML()`
- **Mermaid integration**: Mermaid is re-initialized via `initMermaid()` whenever colors change. New diagram types require a case in `insertMermaid(type)` + a toolbar dropdown button in HTML
- **Export system**: Three export paths (PDF via print, HTML file, MD file) + Word copy. All exports must preserve RTL direction and inline styles. New export formats follow the `doExportFoo(filename)` pattern with a case in `confirmExport()`
- **Rendering pipeline**: Editor input -> debounce(150ms) -> `renderMarkdown()` -> marked.parse -> Mermaid detect -> hljs highlight -> mermaid.run. Do not bypass this pipeline
- **Theming**: Dark/light mode via `[data-theme="dark"]` on `<html>`. CSS custom properties flow through both themes. New UI elements must support both themes
- **localStorage keys**: `mdEditorContent`, `mdEditorColors`, `mdEditorCustomPreset`, `mdEditorLastVersion` — prefix new keys with `mdEditor`

### Testing Rules

- No automated test framework — all testing is manual browser testing
- No CI/CD pipeline — changes are tested locally then pushed directly to main
- Test all features in both dark and light themes
- Test RTL (Hebrew) and LTR (English) modes for any text-related changes
- Test all three export formats (PDF, HTML, MD) + Word copy when modifying export code
- Test color changes across all 15 presets when modifying the color system
- Test responsive behavior at 5 breakpoints (1024px, 768px, 640px, 480px, and desktop)
- Clear localStorage (`localStorage.clear()`) to test fresh-state behavior

### Code Quality & Style Rules

- **UI text language**: All user-facing text (buttons, labels, tooltips, toasts, modals) is in Hebrew. Code (variables, functions, comments) is in English
- **CSS naming**: BEM-like convention — `.color-panel-header`, `.toolbar-dropdown-item`, `.preset-btn`
- **HTML IDs**: camelCase — `colorPanel`, `exportModal`, `editorToolbar`
- **CSS custom properties**: All theme colors defined as `--varName` in `:root` and overridden in `[data-theme="dark"]`
- **No semicolon consistency**: Mixed usage — no enforced style, follow the surrounding code's pattern
- **No comments required**: Codebase has minimal comments — don't add unnecessary documentation
- **Function size**: Functions tend to be small and single-purpose (e.g., `doExportHTML()`, `toggleTheme()`) — follow this pattern
- **SVG icons**: Inline SVG used for all icons (no icon library) — new icons should be inline SVG
- **Versioning**: Update `APP_VERSION` constant and add entry to `CHANGELOG` array for user-visible changes

### Development Workflow Rules

- **No branches required**: Push directly to `main` — no feature branch or PR workflow enforced
- **Deployment is automatic**: Pushing to `main` deploys to GitHub Pages immediately — no staging environment
- **No build step**: Edit `index.html` directly and deploy as-is
- **Commit scope**: Keep commits focused — the single-file nature means diffs can be large, so clear commit messages are essential
- **No package management**: Never add package.json, node_modules, or npm/yarn workflows — all dependencies are CDN-loaded via `<script>` and `<link>` tags
- **Static assets**: Only `index.html`, `pen.png`, and `site.webmanifest` are deployed — keep the root directory minimal
- **Git ignore**: `design/`, `docs/`, `.bmad/`, `.cursor/` directories are gitignored — don't rely on them being in the repo

### Critical Don't-Miss Rules

- **RTL is the default**: The app defaults to `dir="rtl"` and `lang="he"`. All new HTML elements must respect RTL layout. Never assume LTR
- **Word export requires inline styles**: Microsoft Word ignores external CSS and `<style>` blocks. The `generateStyledHTML()` function applies inline styles to every element — any new styled elements must be handled there too
- **Mermaid blocks need special detection**: Mermaid code blocks use `language-mermaid` class and are replaced with `<div class="mermaid">` before rendering. New Markdown extensions must not interfere with this replacement
- **Color changes cascade everywhere**: Changing the color system affects: preview rendering, PDF export, HTML export, Word copy, AND Mermaid diagram theming. All five must stay in sync
- **Don't add external dependencies via npm**: All libraries are CDN-loaded. To add a new dependency, add a `<script>` or `<link>` tag pointing to a CDN URL (jsdelivr or cdnjs)
- **Don't split the file**: Resist the urge to modularize into separate files — the single-file architecture is a deliberate design choice for simplicity and zero-build deployment
- **Print styles matter**: PDF export uses `window.open()` + `print()`. The `generatePrintHTML()` function creates a complete standalone HTML document with embedded styles — changes to preview styling must be mirrored there
- **Mermaid securityLevel is 'loose'**: This allows HTML in diagrams but is intentional. Do not change to 'strict' as it breaks diagram rendering
- **Debounce is 150ms**: The rendering debounce prevents excessive re-renders. Do not reduce below 100ms or remove entirely
- **Tooltip system uses event delegation**: Global tooltip via `data-tooltip` attribute on any element — don't create custom tooltip implementations

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-05
