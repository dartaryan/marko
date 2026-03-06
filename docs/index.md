# Hebrew Markdown Editor — Documentation Index

> Generated: 2026-03-05 | Scan Level: Exhaustive | Mode: Initial Scan

## Project Overview

- **Type:** Monolith (single-part web application)
- **Primary Language:** JavaScript (vanilla ES2017+)
- **Architecture:** Single-page client-side application (single `index.html`, ~4,867 lines)
- **Framework:** None (vanilla HTML/CSS/JS)
- **Hosting:** GitHub Pages (static)
- **PWA:** Yes (installable, offline-capable)
- **Version:** 1.3.0

## Quick Reference

- **Tech Stack:** HTML5, CSS3 (custom properties), Vanilla JS, Marked.js, Highlight.js 11.9, Mermaid.js 10.x, Google Fonts
- **Entry Point:** `index.html` (opened directly or via GitHub Pages)
- **State:** localStorage (editor content, colors, version tracking)
- **Build:** None required — edit and deploy directly
- **Deploy:** `git push origin main` → GitHub Pages auto-deploys

## Generated Documentation

- [Project Overview](./project-overview.md) — Executive summary, purpose, tech stack, feature list
- [Architecture](./architecture.md) — System architecture, data flow, state management, design decisions
- [Source Tree Analysis](./source-tree-analysis.md) — Directory structure, file breakdown, line-by-line section map
- [Component Inventory](./component-inventory.md) — All UI components, JS functions, color presets
- [Development Guide](./development-guide.md) — Setup, running locally, making changes, deployment, debugging

## Getting Started

1. **Understand the project:** Start with [Project Overview](./project-overview.md) for a high-level understanding
2. **Explore the code:** See [Source Tree Analysis](./source-tree-analysis.md) for the exact line ranges of each section in `index.html`
3. **Learn the architecture:** Read [Architecture](./architecture.md) for data flow diagrams and state management
4. **Find components:** Use [Component Inventory](./component-inventory.md) to locate specific UI elements or JS functions
5. **Start developing:** Follow [Development Guide](./development-guide.md) for setup, conventions, and common tasks

## AI-Assisted Development

When working with this project using AI tools:

- Point the AI to this `index.md` as the project context entry point
- The entire codebase is in a single file (`index.html`), so line number references are critical for navigation
- Key sections: CSS (53-2082), HTML (2083-2482), JavaScript (2483-4865)
- When adding features, maintain the single-file pattern — add CSS in the `<style>` block, HTML in `<body>`, JS in the `<script>` block
- All UI text should be in Hebrew; code identifiers in English
- Color customization must flow through the 17-property `currentColors` object
- Test exports (PDF, HTML, Word) after any rendering changes — they use separate styling functions
