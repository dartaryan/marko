---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Marko - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Marko (hebrew-markdown-export), decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Document Editing & Rendering:**

- FR1: Users can paste or type Markdown content into an editor
- FR2: Users can see real-time rendered preview of their Markdown content
- FR3: Users can toggle between editor-only, preview-only, and split view modes
- FR4: Users can enter a presentation/reading mode that displays rendered content in a large, distraction-free format
- FR5: Users can insert Markdown formatting via a toolbar (bold, italic, headings, lists, code blocks, links, images, tables)
- FR6: Users can insert Mermaid diagram templates and see them rendered inline
- FR7: System auto-detects Hebrew vs English per sentence and applies correct text direction (RTL/LTR) automatically
- FR8: Users can manually override text direction at the document level
- FR9: Users can clear the editor content
- FR10: Users can load a sample document to explore the tool

**Export & Output:**

- FR11: Users can export the rendered document as a PDF with preserved colors, RTL direction, and Mermaid diagrams
- FR12: Users can export the rendered document as a styled HTML file
- FR13: Users can export the raw Markdown as a .md file
- FR14: Users can copy formatted content to clipboard for pasting into Microsoft Word with RTL preservation
- FR15: Users can copy rendered HTML or plain text to clipboard
- FR16: Users can specify a custom filename before exporting (auto-suggested from first heading)
- FR17: System shows a progress indicator during PDF generation

**Color Theming & Customization:**

- FR18: Users can customize 17 color properties of the preview rendering
- FR19: Users can select from built-in color theme presets
- FR20: Users can save and load custom color presets
- FR21: Users can extract a color palette from an uploaded image and apply it as a theme
- FR22: Users can toggle between dark and light UI modes
- FR23: System persists color customizations across sessions

**AI Document Actions:**

- FR24: Registered users can invoke AI actions on their document content
- FR25: Users can ask the AI to summarize their document or a selected section
- FR26: Users can ask the AI to translate a section between Hebrew and English
- FR27: Users can ask the AI to extract action items from their document
- FR28: Users can ask the AI to suggest grammar, style, and clarity improvements to their content
- FR29: System routes AI tasks to the appropriate model (Haiku/Sonnet) based on task complexity, invisible to the user
- FR30: System enforces AI usage limits based on user tier (free: limited per month, paid: unlimited Sonnet + daily Opus)
- FR31: Users receive a dismissible banner notification when they reach their free AI usage limit, with an upgrade link

**User Accounts & Authentication:**

- FR32: Users can use the core editor without logging in (anonymous tier)
- FR33: Users can register for a free account to unlock AI features
- FR34: Users can log in and log out of their account
- FR35: System distinguishes between anonymous, free registered, and paid user tiers
- FR36: System migrates v1 user settings (colors, content) when a v1 user visits Marko v2

**Payments & Subscription (Phase 2):**

- FR37: Registered users can upgrade to a paid subscription
- FR38: Paid users can access Opus-level AI with a daily allocation
- FR39: Paid users can force the Opus model via an explicit toggle
- FR40: System generates valid Israeli tax invoices/receipts for each transaction via Sumit
- FR41: Users can manage their subscription (view status, cancel)

**Analytics & Operator Tools:**

- FR42: System tracks user registrations, logins, and feature usage events
- FR43: System logs every AI API call with model used, token count, and cost
- FR44: Operator can view usage analytics (active users, AI calls, feature adoption)
- FR45: Operator can monitor AI API costs in real-time
- FR46: System flags accounts exhibiting potential abuse patterns

**SEO & Discovery:**

- FR47: System serves a crawlable, SEO-optimized landing page
- FR48: Landing page includes structured data, Open Graph meta tags, sitemap, and robots.txt
- FR49: Landing page targets Hebrew keywords for Markdown editor searches

**Privacy & Compliance:**

- FR50: System displays a visible notice before AI processing, informing users their document content will be sent to the AI provider
- FR51: System does not store document content on the server
- FR52: Users can delete their account and all associated data

### NonFunctional Requirements

**Performance:**

- NFR1: Editor page loads in under 2 seconds on a 4G connection
- NFR2: Markdown paste-to-rendered-preview completes in under 100ms
- NFR3: AI Sonnet responses return in under 10 seconds; Opus in under 20 seconds
- NFR4: PDF export generates in under 5 seconds for documents up to 20 pages
- NFR5: Rendering debounce remains at 150ms or less during typing
- NFR6: Landing page achieves Lighthouse score of 90+ (Performance, Accessibility, Best Practices, SEO)

**Security:**

- NFR7: All data in transit encrypted via HTTPS (TLS 1.2+)
- NFR8: Authentication tokens stored securely using server-side or platform-recommended mechanisms
- NFR9: AI API keys never exposed to the client -- all AI calls proxied through the backend
- NFR10: Payment data handled entirely by the payment provider (PCI-DSS compliance via Stripe/provider, no card data on Marko servers)
- NFR11: Rate limiting on AI endpoints to prevent abuse (per-account and per-IP)
- NFR12: CSRF protection on all authenticated endpoints
- NFR13: Input sanitization on all user-submitted data sent to the backend

**Scalability:**

- NFR14: System supports up to 1,000 concurrent users in Phase 1 without performance degradation
- NFR15: AI proxy layer handles up to 5x average load with request queuing
- NFR16: Architecture supports horizontal scaling when concurrent users exceed 1,000
- NFR17: Analytics pipeline handles up to 10,000 events per minute without blocking user-facing operations

**Accessibility:**

- NFR18: WCAG AA compliance across all interactive elements
- NFR19: All toolbar buttons, modals, and controls have Hebrew ARIA labels
- NFR20: Full keyboard navigation without mouse dependency
- NFR21: Focus trapping in modals with proper focus return
- NFR22: Color contrast ratio of 4.5:1 minimum for all text/background combinations
- NFR23: Screen reader-compatible preview output (semantic HTML: headings, lists, tables)
- NFR24: Visible focus indicators on all interactive elements
- NFR25: RTL-aware accessibility: assistive technologies correctly interpret right-to-left content flow

**Integration:**

- NFR26: Anthropic Claude API: Haiku, Sonnet, and Opus model access via server-side proxy
- NFR27: Payment provider API (Phase 2): Stripe or Israeli provider for subscription management
- NFR28: Sumit API (Phase 2): automated receipt/invoice generation per transaction
- NFR29: Analytics service: event tracking for user behavior, AI usage, and conversion metrics
- NFR30: Future: Mike integration via URL-based content passing (deep link protocol)

**Reliability:**

- NFR31: Editor functions fully offline (except AI features)
- NFR32: System auto-saves editor content -- no work lost on accidental page close or refresh
- NFR33: AI service degradation is graceful: if the API is down, users see an informational banner explaining AI is temporarily unavailable and can continue using all non-AI features
- NFR34: Export functions work independently of network connectivity (client-side PDF/HTML/MD generation)

### Additional Requirements

**From Architecture -- Starter Template (impacts Epic 1 Story 1):**

- Project initialization via Clean Composition: `create-next-app + convex init + shadcn init --rtl + Clerk`
- TypeScript strict mode, React 19.x, Next.js 16.x App Router
- pnpm package manager, Turbopack build tooling
- Vercel deployment with auto-deploy from GitHub
- Convex auto-deploys with `npx convex deploy` in Vercel build step

**From Architecture -- Data Architecture:**

- Data residency split: localStorage for documents/themes, Convex for user/AI/analytics
- Convex schema: users, aiUsage, analyticsEvents, subscriptions (Phase 2)
- v1 localStorage silent migration: detect v1 keys, transform to v2 format, delete v1 keys
- No external cache layer -- Convex built-in caching sufficient

**From Architecture -- Authentication & Security:**

- Three-tier authorization: Anonymous (no Clerk session), Free Registered (Clerk session), Paid (Clerk + subscription)
- Frontend: Clerk session check for UI gating (convenience only)
- Backend: Convex enforces tier/limits before AI calls (security boundary)
- Anthropic API key stored as Convex environment variable, never reaches client

**From Architecture -- AI Proxy:**

- Full response (no streaming) for Phase 1
- Convex actions for all AI calls
- Model routing: Haiku for simple tasks, Sonnet default, Opus for complex (paid only)

**From Architecture -- Frontend:**

- Markdown rendering pipeline: Marked.js + Highlight.js + Mermaid.js bundled via npm
- Plain textarea editor for Phase 1 (matches v1)
- State management: Convex for server state, React for UI state, localStorage for persistence
- No external state library (Redux, Zustand)

**From Architecture -- Implementation Patterns:**

- Tailwind logical properties for RTL (ms-, me-, ps-, pe-, start-, end-)
- 17-property CSS custom properties color system
- Feature-based component organization (not by type)
- Co-located tests
- Hebrew UI language, English code identifiers
- ConvexError with Hebrew (message) + English (messageEn) payloads

**From Architecture -- Infrastructure:**

- Vitest for unit tests, Playwright for E2E tests
- PWA via next-pwa or Serwist: service worker caches app shell, static assets, fonts
- CI/CD: Vercel auto-deploys from GitHub, no separate CI pipeline initially

**From UX -- Responsive Design:**

- Desktop: Two-panel CSS Grid layout (editor + preview side by side)
- Tablet (768-1023px): Stacked panels with toggle
- Mobile (<768px): Single panel with view mode toggle, touch-friendly toolbar with overflow menu
- Breakpoints: 1024px, 768px, 640px, 480px

**From UX -- Animation & Transitions:**

- No animation exceeds 300ms
- All animations respect `prefers-reduced-motion: reduce`
- Professional style: no bouncing, no spring physics
- Button press feedback: subtle scale-down animation (0.97) on mousedown

**From UX -- Error Handling UX:**

- PDF export failure: toast with retry button, fallback to browser print dialog
- AI errors: graceful degradation banner
- Network errors: offline banner with status indicator

**From UX -- Browser/Device Compatibility:**

- Desktop: Chrome, Firefox, Edge, Safari (latest 2 versions)
- Mobile: Chrome Mobile, Safari iOS
- Modern browsers only

**From UX -- Accessibility:**

- Radix UI primitives (via shadcn/ui) provide focus management, keyboard navigation, ARIA, RTL
- Hebrew ARIA labels on all components
- Focus trapping in modals/sheets with proper focus return

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Paste or type Markdown |
| FR2 | Epic 1 | Real-time rendered preview |
| FR3 | Epic 1 | Toggle view modes |
| FR4 | Epic 1 | Presentation/reading mode |
| FR5 | Epic 1 | Toolbar formatting |
| FR6 | Epic 1 | Mermaid diagrams |
| FR7 | Epic 4 | BiDi auto-detection per sentence |
| FR8 | Epic 1 | Manual direction override |
| FR9 | Epic 1 | Clear editor |
| FR10 | Epic 1 | Sample document |
| FR11 | Epic 3 | PDF export |
| FR12 | Epic 3 | HTML export |
| FR13 | Epic 3 | Markdown export |
| FR14 | Epic 3 | Word clipboard copy |
| FR15 | Epic 3 | HTML/text clipboard copy |
| FR16 | Epic 3 | Custom filename |
| FR17 | Epic 3 | PDF progress indicator |
| FR18 | Epic 2 | 17 color properties |
| FR19 | Epic 2 | Theme presets |
| FR20 | Epic 2 | Custom presets |
| FR21 | Epic 2 | Image color extraction |
| FR22 | Epic 2 | Dark/light mode |
| FR23 | Epic 2 | Persist colors |
| FR24 | Epic 6 | AI actions on documents |
| FR25 | Epic 6 | AI summarize |
| FR26 | Epic 6 | AI translate |
| FR27 | Epic 6 | AI extract action items |
| FR28 | Epic 6 | AI writing improvements |
| FR29 | Epic 6 | Model routing |
| FR30 | Epic 6 | Usage limits by tier |
| FR31 | Epic 6 | Limit banner with upgrade |
| FR32 | Epic 5 | Anonymous editor use |
| FR33 | Epic 5 | Free account registration |
| FR34 | Epic 5 | Login/logout |
| FR35 | Epic 5 | Tier distinction |
| FR36 | Epic 1 | V1 settings migration |
| FR37 | Epic 9 | Paid subscription upgrade |
| FR38 | Epic 9 | Opus access for paid |
| FR39 | Epic 9 | Force-Opus toggle |
| FR40 | Epic 9 | Israeli tax invoices/Sumit |
| FR41 | Epic 9 | Subscription management |
| FR42 | Epic 8 | Track registrations/usage |
| FR43 | Epic 8 | Log AI calls with cost |
| FR44 | Epic 8 | View usage analytics |
| FR45 | Epic 8 | Monitor AI costs |
| FR46 | Epic 8 | Abuse pattern flagging |
| FR47 | Epic 7 | SEO landing page |
| FR48 | Epic 7 | Structured data/meta |
| FR49 | Epic 7 | Hebrew keyword targeting |
| FR50 | Epic 6 | AI privacy disclosure |
| FR51 | Epic 6 | No server document storage |
| FR52 | Epic 5 | Account deletion |

## Epic List

### Epic 1: Project Foundation & Core Editor
Users can open Marko, write or paste Markdown, see beautifully rendered preview with Mermaid diagrams and syntax highlighting, use the formatting toolbar, toggle between editor/preview/split/presentation views, and have their content auto-saved. V1 users experience a seamless migration.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR36

### Epic 2: Visual Customization & Theming
Users can personalize their document appearance with 17 color properties, choose from built-in presets, save custom themes, extract palettes from images, and toggle dark/light mode -- all persisted across sessions.
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23

### Epic 3: Document Export & Sharing
Users can export their documents as PDF (with preserved colors, RTL, and diagrams), styled HTML, raw Markdown, or copy to clipboard/Word -- with custom filenames and progress feedback.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17

### Epic 4: Hebrew Bilingual Intelligence
The system automatically detects Hebrew vs English per sentence and applies correct text direction (RTL/LTR). This is Marko's key differentiator -- no other Markdown tool does per-sentence BiDi detection.
**FRs covered:** FR7

### Epic 5: User Authentication & Account Management
Users can register for free accounts, log in/out, and manage their profiles. The system distinguishes anonymous, free, and paid tiers. Users can delete their accounts and all associated data.
**FRs covered:** FR32, FR33, FR34, FR35, FR52

### Epic 6: AI Document Actions
Registered users can invoke AI on their documents -- summarize, translate Hebrew/English, extract action items, improve writing. The system routes to the optimal model invisibly, enforces usage limits per tier, and shows gentle upgrade prompts when limits are reached.
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR50, FR51

### Epic 7: SEO Landing Page & Discovery
Marko has a crawlable, SEO-optimized landing page targeting Hebrew Markdown keywords, with structured data, meta tags, sitemap, and robots.txt.
**FRs covered:** FR47, FR48, FR49

### Epic 8: Analytics & Operator Tools
System tracks user registrations, feature usage, and AI calls (with model, tokens, cost). Operator can view analytics and monitor costs. Abuse detection flags suspicious accounts.
**FRs covered:** FR42, FR43, FR44, FR45, FR46

### Epic 9: Payments & Subscription (Phase 2)
Paid users unlock unlimited Sonnet and daily Opus allocation with force-Opus toggle. System handles subscriptions with Israeli tax compliance (VAT, Sumit receipts).
**FRs covered:** FR37, FR38, FR39, FR40, FR41

## Epic 1: Project Foundation & Core Editor

Users can open Marko, write or paste Markdown, see beautifully rendered preview with Mermaid diagrams and syntax highlighting, use the formatting toolbar, toggle between editor/preview/split/presentation views, and have their content auto-saved. V1 users experience a seamless migration.

### Story 1.1: Project Initialization & Root Layout

As a developer,
I want the Marko project initialized with Next.js, Convex, shadcn/ui (RTL), and Clerk providers in the root layout,
So that I have a working foundation with RTL-first design, authentication readiness, and a reactive backend.

**Acceptance Criteria:**

**Given** a clean development environment
**When** the initialization commands are run (`create-next-app`, `convex init`, `shadcn init --rtl`, `pnpm add @clerk/nextjs`)
**Then** the project builds successfully with zero errors
**And** the root layout includes ClerkProvider, ConvexProvider, `dir="rtl"`, and Noto Sans Hebrew font
**And** the editor route (`/editor`) renders a placeholder page
**And** the landing page route (`/`) renders a placeholder page
**And** Tailwind CSS is configured with logical properties
**And** TypeScript strict mode is enabled
**And** the dev server starts with Turbopack HMR and Convex dev server running concurrently

### Story 1.2: Editor & Preview Layout with Markdown Rendering

As a user,
I want to paste or type Markdown content and see it rendered beautifully in real-time beside my editor,
So that I can instantly see how my document looks.

**Acceptance Criteria:**

**Given** the user opens the editor page
**When** they type or paste Markdown content into the editor textarea
**Then** the preview panel renders the Markdown within 100ms (with 150ms debounce)
**And** the layout displays editor and preview side-by-side on desktop (CSS Grid two-panel)
**And** Hebrew text renders RTL and English text renders LTR at the document level
**And** code blocks render with syntax highlighting (Highlight.js, github-dark theme)
**And** the editor textarea has `dir="rtl"` by default and `lang="he"`
**And** the editor content auto-saves to localStorage on every change
**And** on page load, editor content restores from localStorage
**And** all toolbar buttons and panels have Hebrew ARIA labels
**And** keyboard navigation works throughout the editor and preview panels

### Story 1.3: Mermaid Diagram Rendering

As a user,
I want to insert Mermaid diagram templates and see them rendered inline in the preview,
So that I can create flowcharts, sequence diagrams, and other visuals within my documents.

**Acceptance Criteria:**

**Given** the user has Markdown content with a Mermaid code block
**When** the rendering pipeline processes the content
**Then** the Mermaid diagram renders inline in the preview panel
**And** the diagram respects the current color theme (themed with app colors)
**And** users can insert Mermaid templates from the toolbar dropdown
**And** invalid Mermaid syntax shows a clear error message in the preview (not a crash)
**And** Mermaid.js is bundled via npm (not CDN)

### Story 1.4: Formatting Toolbar

As a user,
I want a toolbar with formatting buttons for common Markdown syntax,
So that I can quickly insert formatting without memorizing Markdown syntax.

**Acceptance Criteria:**

**Given** the user is in the editor
**When** they click a toolbar button (bold, italic, headings, lists, code blocks, links, images, tables)
**Then** the corresponding Markdown syntax is inserted at the cursor position or wraps the selected text
**And** all toolbar buttons have Hebrew ARIA labels and tooltips
**And** toolbar buttons are navigable via keyboard (Tab + Arrow keys)
**And** dropdowns (headings, code, Mermaid) open via Enter/Space and are accessible
**And** the toolbar uses Tailwind logical properties for RTL layout (ms-, me-, ps-, pe-)
**And** button press provides subtle scale-down feedback (0.97) on mousedown
**And** the toolbar remains simple and uncluttered per the design specification

### Story 1.5: View Modes & Presentation Mode

As a user,
I want to toggle between editor-only, preview-only, split view, and a full-screen presentation mode,
So that I can focus on writing, reviewing, or presenting my document.

**Acceptance Criteria:**

**Given** the user is on the editor page
**When** they select editor-only mode
**Then** only the editor panel is visible

**Given** the user is on the editor page
**When** they select preview-only mode
**Then** only the preview panel is visible

**Given** the user is on the editor page
**When** they select split mode
**Then** both panels display side-by-side (desktop) or stacked with toggle (tablet/mobile)

**Given** the user is on the editor page
**When** they enter presentation/reading mode
**Then** the rendered content fills the screen in a large, distraction-free format
**And** controls appear on mouse movement and hide after inactivity
**And** Escape key exits presentation mode
**And** focus is trapped within the presentation view with `role="document"`
**And** `prefers-reduced-motion` is respected for enter/exit transitions
**And** view mode state persists across page refreshes via localStorage

### Story 1.6: Editor Utilities & Direction Override

As a user,
I want to clear the editor, load a sample document, and manually set the text direction,
So that I can quickly start fresh, explore the tool's capabilities, and control RTL/LTR when needed.

**Acceptance Criteria:**

**Given** the user clicks the clear button
**When** they confirm the action
**Then** the editor content is cleared and localStorage is updated
**And** the clear action requires confirmation to prevent accidental data loss

**Given** the user clicks "load sample document"
**When** the sample document loads
**Then** the editor displays a rich Markdown sample showcasing Hebrew text, English text, headings, code blocks, lists, tables, and Mermaid diagrams
**And** the sample document demonstrates Marko's key features

**Given** the user clicks the direction toggle
**When** they switch between RTL and LTR
**Then** the editor and preview both update to reflect the new document-level direction
**And** the selected direction persists across sessions via localStorage

### Story 1.7: V1 localStorage Migration

As an existing v1 user,
I want my saved content, colors, and settings to automatically transfer to Marko v2,
So that I experience a seamless transition without losing any of my customizations.

**Acceptance Criteria:**

**Given** a user visits Marko v2 for the first time with v1 localStorage keys present (`mdEditorContent`, `mdEditorColors`, `mdEditorCustomPreset`, `mdEditorLastVersion`)
**When** the migration function runs on page load
**Then** v1 content is transformed to v2 format and loaded into the editor
**And** v1 color settings are transformed to v2 color theme format
**And** v1 custom presets are preserved and available in the v2 preset grid
**And** v1 localStorage keys are deleted after successful migration
**And** migration runs only once (idempotent -- subsequent visits skip migration)
**And** if v1 keys are not found, migration is silently skipped
**And** migration does not block or delay the editor loading experience

## Epic 2: Visual Customization & Theming

Users can personalize their document appearance with 17 color properties, choose from built-in presets, save custom themes, extract palettes from images, and toggle dark/light mode -- all persisted across sessions.

### Story 2.1: Color System & Color Panel

As a user,
I want to customize 17 color properties of my document preview through an interactive color panel,
So that I can personalize the look and feel of my documents.

**Acceptance Criteria:**

**Given** the user opens the color panel (slide-out sheet)
**When** they adjust any of the 17 color properties via color pickers
**Then** the preview updates in real-time to reflect the new colors
**And** colors are applied via CSS custom properties (`--color-primary-text`, `--color-h1`, `--color-preview-bg`, etc.)
**And** each color picker row has a Hebrew label
**And** the default "classic" color scheme loads on first use
**And** color customizations persist to localStorage across sessions
**And** the color panel has proper focus trapping and is accessible via keyboard
**And** the panel uses a shadcn Sheet component with slide-out animation (<300ms)

### Story 2.2: Built-in Theme Presets

As a user,
I want to choose from built-in color theme presets,
So that I can quickly apply a polished look without manually adjusting each color.

**Acceptance Criteria:**

**Given** the user opens the color panel
**When** they click a preset button from the preset grid (15 built-in presets)
**Then** all 17 color properties update to the preset values
**And** the preview immediately reflects the new theme
**And** each preset button shows a visual preview of its color scheme
**And** preset buttons have Hebrew tooltips with the preset name
**And** the selected preset is persisted to localStorage

### Story 2.3: Custom Preset Save & Load

As a user,
I want to save my current color customizations as a named preset and load them later,
So that I can reuse my favorite themes across sessions.

**Acceptance Criteria:**

**Given** the user has customized colors and clicks "save preset"
**When** they enter a name for the preset
**Then** the current 17 color values are saved as a named custom preset in localStorage
**And** the custom preset appears in the preset grid alongside built-in presets

**Given** the user has saved custom presets
**When** they click a custom preset
**Then** all 17 colors load from the saved preset
**And** users can delete custom presets they no longer want

### Story 2.4: Image Color Extraction

As a user,
I want to upload an image and extract a color palette from it to apply as a theme,
So that I can match my document styling to a brand image, photo, or design.

**Acceptance Criteria:**

**Given** the user clicks "extract colors from image"
**When** they upload an image file
**Then** the system extracts a color palette using k-means clustering
**And** a preview modal shows the extracted colors mapped to the 17 properties
**And** the user can accept or cancel before applying
**And** the file input has a Hebrew label and the preview has `role="img"` with descriptive `aria-label`
**And** accepted colors are applied to the preview and persisted to localStorage

### Story 2.5: Dark/Light Mode Toggle

As a user,
I want to toggle between dark and light UI modes,
So that I can use Marko comfortably in different lighting conditions.

**Acceptance Criteria:**

**Given** the user clicks the dark/light mode toggle
**When** the mode switches
**Then** the UI updates to dark or light theme using Tailwind `dark:` classes following shadcn conventions
**And** the toggle has a Hebrew `aria-label` and is keyboard accessible
**And** the mode preference persists to localStorage across sessions
**And** the system respects `prefers-color-scheme` as the initial default if no preference is saved
**And** the color theme panel colors (document preview) remain independent of the UI dark/light mode

## Epic 3: Document Export & Sharing

Users can export their documents as PDF (with preserved colors, RTL, and diagrams), styled HTML, raw Markdown, or copy to clipboard/Word -- with custom filenames and progress feedback.

### Story 3.1: Export Modal & Filename Selection

As a user,
I want to specify a custom filename before exporting and choose my export format,
So that I can organize my exported files with meaningful names.

**Acceptance Criteria:**

**Given** the user clicks an export action
**When** the export modal opens
**Then** a filename input is pre-populated with the document's first heading (auto-suggested)
**And** the user can edit the filename before exporting
**And** format options (PDF, HTML, Markdown) are clearly presented
**And** the modal has Hebrew labels, focus trapping, and keyboard accessibility
**And** the modal uses a shadcn Dialog component

### Story 3.2: PDF Export with Colors & RTL

As a user,
I want to export my rendered document as a PDF with preserved colors, RTL direction, and Mermaid diagrams,
So that I can share a polished, print-ready version of my document.

**Acceptance Criteria:**

**Given** the user selects PDF export
**When** the PDF generates
**Then** the output preserves all 17 color theme properties
**And** Hebrew text renders RTL correctly in the PDF
**And** Mermaid diagrams are included as rendered visuals
**And** code blocks retain syntax highlighting
**And** a progress indicator is displayed during generation
**And** PDF generates in under 5 seconds for documents up to 20 pages
**And** PDF generation works offline (client-side via html2pdf.js)
**And** on failure, a toast with retry button appears, with browser print dialog as fallback

### Story 3.3: HTML & Markdown Export

As a user,
I want to export my document as a styled HTML file or raw Markdown file,
So that I can use my content in other tools or share it on the web.

**Acceptance Criteria:**

**Given** the user selects HTML export
**When** the file generates
**Then** the HTML file includes inline styles preserving colors, RTL, and formatting
**And** the HTML is self-contained (no external dependencies)
**And** the file downloads with the user-specified filename

**Given** the user selects Markdown export
**When** the file generates
**Then** the raw Markdown content downloads as a .md file
**And** the file uses the user-specified filename
**And** both exports work offline (client-side generation)

### Story 3.4: Clipboard Copy (Word & HTML/Text)

As a user,
I want to copy my formatted content to the clipboard for pasting into Word or other applications,
So that I can use my styled document content in other tools without exporting files.

**Acceptance Criteria:**

**Given** the user clicks "copy for Word"
**When** the content is copied to clipboard
**Then** the clipboard contains formatted HTML with inline RTL styles that paste correctly into Microsoft Word
**And** RTL direction, colors, and formatting are preserved in Word

**Given** the user clicks "copy HTML" or "copy text"
**When** the content is copied
**Then** rendered HTML or plain text is placed on the clipboard
**And** a Hebrew toast notification confirms the copy succeeded
**And** all copy actions work offline

## Epic 4: Hebrew Bilingual Intelligence

The system automatically detects Hebrew vs English per sentence and applies correct text direction (RTL/LTR). This is Marko's key differentiator -- no other Markdown tool does per-sentence BiDi detection.

### Story 4.1: Per-Sentence BiDi Detection Engine

As a developer,
I want a BiDi detection engine that analyzes Unicode character composition per sentence to determine text direction,
So that the rendering pipeline can apply correct RTL/LTR direction automatically.

**Acceptance Criteria:**

**Given** a sentence containing predominantly Hebrew characters
**When** the detection engine analyzes it
**Then** the sentence is classified as RTL

**Given** a sentence containing predominantly English/Latin characters
**When** the detection engine analyzes it
**Then** the sentence is classified as LTR

**Given** a mixed-language sentence (e.g., Hebrew with inline English terms)
**When** the detection engine analyzes it
**Then** direction is determined by the dominant character set
**And** Unicode Hebrew, Arabic, and Latin character ranges are correctly identified
**And** code blocks and inline code are excluded from direction analysis (always LTR)
**And** the detection runs within the rendering pipeline without exceeding the 100ms performance budget
**And** unit tests cover pure Hebrew, pure English, mixed sentences, code blocks, numbers, and edge cases

### Story 4.2: BiDi Integration with Rendering Pipeline

As a user,
I want my mixed Hebrew/English documents to automatically display each sentence in the correct direction,
So that I never have to manually toggle RTL/LTR within a document.

**Acceptance Criteria:**

**Given** a document with mixed Hebrew and English paragraphs
**When** the content renders in the preview
**Then** each paragraph/sentence displays with the correct `dir` attribute (rtl or ltr)
**And** code blocks always render LTR regardless of surrounding content
**And** Mermaid diagrams are unaffected by BiDi detection
**And** tables, lists, and blockquotes respect per-cell/per-item direction
**And** the BiDi detection integrates as Marked.js post-processing
**And** the manual direction override (FR8) takes precedence when set
**And** export outputs (PDF, HTML, Word copy) preserve the per-sentence direction attributes
**And** assistive technologies correctly interpret the direction flow

## Epic 5: User Authentication & Account Management

Users can register for free accounts, log in/out, and manage their profiles. The system distinguishes anonymous, free, and paid tiers. Users can delete their accounts and all associated data.

### Story 5.1: Clerk Authentication Integration & User Sync

As a developer,
I want Clerk authentication configured with Convex user sync via webhook,
So that the system can identify users and maintain their profiles in the database.

**Acceptance Criteria:**

**Given** the Clerk and Convex integration is configured
**When** a new user registers via Clerk (sign-up page)
**Then** a Clerk webhook fires and creates a user record in the Convex `users` table with tier set to "free"
**And** the Convex schema includes the `users` table with fields: clerkId, tier, createdAt
**And** the Clerk webhook handler validates the webhook signature for security
**And** the sign-in and sign-up pages use Clerk's pre-built components at `/sign-in` and `/sign-up`
**And** Clerk middleware protects no routes by default (editor is public for anonymous users)

### Story 5.2: Anonymous & Authenticated Editor Experience

As a user,
I want to use the full editor without logging in, and see additional options when I do log in,
So that I can try Marko freely and unlock more features by registering.

**Acceptance Criteria:**

**Given** an anonymous user (no Clerk session) visits the editor
**When** they use the editor
**Then** all editing, preview, theming, and export features work fully
**And** the AI action button shows a prompt to register (not disabled/hidden)
**And** no login is required for any core editor functionality

**Given** a registered user is logged in
**When** they visit the editor
**Then** the header displays the Clerk UserButton with their profile
**And** the AI action button is enabled and functional
**And** the system reads their tier from Convex to determine capabilities

**Given** a logged-in user clicks the UserButton
**When** they select "Sign out"
**Then** they are logged out and returned to anonymous mode
**And** their editor content (localStorage) is preserved

### Story 5.3: Three-Tier Authorization & Account Deletion

As a user,
I want the system to correctly enforce my access tier, and I want the ability to delete my account and all data,
So that I get the right features for my tier and can exercise my right to data deletion.

**Acceptance Criteria:**

**Given** a user with tier "anonymous" (no session)
**When** the system checks their capabilities
**Then** they have access to: editor, preview, theming, exports -- but NOT AI features

**Given** a user with tier "free" (Clerk session, no subscription)
**When** the system checks their capabilities
**Then** they have access to: all anonymous features PLUS limited AI (Sonnet)

**Given** a user with tier "paid" (Clerk session + active subscription)
**When** the system checks their capabilities
**Then** they have access to: all free features PLUS unlimited Sonnet and daily Opus allocation

**Given** a logged-in user requests account deletion
**When** they confirm the deletion
**Then** their Convex user record and all associated data (AI usage logs, analytics events) are deleted
**And** their Clerk account is deleted via the Clerk API
**And** a confirmation message is displayed in Hebrew
**And** the user is returned to anonymous mode

## Epic 6: AI Document Actions

Registered users can invoke AI on their documents -- summarize, translate Hebrew/English, extract action items, improve writing. The system routes to the optimal model invisibly, enforces usage limits per tier, and shows gentle upgrade prompts when limits are reached.

### Story 6.1: AI Proxy Backend & Model Routing

As a developer,
I want a Convex AI proxy that routes requests to the appropriate Claude model based on task type,
So that AI calls are secure, cost-optimized, and never expose API keys to the client.

**Acceptance Criteria:**

**Given** a registered user triggers an AI action
**When** the request reaches the Convex action
**Then** the action verifies the user's Clerk authentication and tier
**And** the action selects the model based on task complexity (Haiku for classification, Sonnet for user-facing actions)
**And** the Anthropic API key is stored as a Convex environment variable and never sent to the client
**And** the action calls the Anthropic API and returns the full response (no streaming in Phase 1)
**And** the action logs the call to the `aiUsage` table (userId, model, tokenCount, cost, action, timestamp)
**And** input sent to the API is sanitized
**And** the Convex `aiUsage` table is created with appropriate indexes (by_userId, by_createdAt)

### Story 6.2: AI Actions UI & Document Interactions

As a registered user,
I want to summarize, translate, extract action items, and improve my document using AI,
So that I can quickly get value from my content without manual effort.

**Acceptance Criteria:**

**Given** a registered user clicks the AI action button
**When** they select "Summarize"
**Then** the AI returns a concise summary of the document (or selected section) and displays it in the AI result panel

**Given** a registered user selects text and chooses "Translate"
**When** the AI processes the request
**Then** the selected section is translated between Hebrew and English and displayed in the AI result panel

**Given** a registered user chooses "Extract Action Items"
**When** the AI processes the document
**Then** a structured bullet-point task list is generated and displayed

**Given** a registered user chooses "Improve Writing"
**When** the AI processes the content
**Then** grammar, style, and clarity suggestions are returned

**And** all AI results appear in a dedicated AI panel (`role="complementary"`, `aria-label="AI result"`)
**And** action buttons have Hebrew labels and are keyboard accessible
**And** a loading spinner with Hebrew text shows during AI processing
**And** Sonnet responses return in under 10 seconds
**And** if the AI API is unavailable, a Hebrew banner says "AI is temporarily unavailable" with non-AI features unaffected

### Story 6.3: AI Privacy Disclosure

As a user,
I want to see a clear notice that my document content will be sent to the AI provider before processing,
So that I can make an informed decision about using AI features.

**Acceptance Criteria:**

**Given** a user triggers their first AI action in a session
**When** the disclosure appears
**Then** a visible notice explains that document content will be sent to Anthropic for AI processing
**And** the notice mentions that Anthropic's API does not train on API inputs
**And** the user can dismiss the notice and proceed
**And** the system does not store any document content on the server (only sends ephemerally to AI)
**And** the disclosure is in Hebrew with clear, non-technical language

### Story 6.4: AI Usage Limits & Upgrade Prompts

As a free registered user,
I want to know my AI usage limits and see a gentle prompt to upgrade when I reach them,
So that I understand the value proposition without feeling pressured.

**Acceptance Criteria:**

**Given** a free user has remaining AI calls
**When** they use an AI action
**Then** the action succeeds and the usage count is incremented in Convex

**Given** a free user has reached their monthly AI limit
**When** they attempt an AI action
**Then** the Convex backend rejects the request with a typed error (AI_LIMIT_REACHED)
**And** a dismissible banner notification appears with a Hebrew message and an upgrade link
**And** the banner uses `role="status"` and has a dismiss button with `aria-label="close"`
**And** all non-AI features continue to work normally

**Given** a paid user (Phase 2) uses AI
**When** they make an AI call
**Then** unlimited Sonnet calls are allowed
**And** Opus calls are tracked against their daily allocation

**And** rate limiting is enforced per-account in Convex (not just per-session)

## Epic 7: SEO Landing Page & Discovery

Marko has a crawlable, SEO-optimized landing page targeting Hebrew Markdown keywords, with structured data, meta tags, sitemap, and robots.txt.

### Story 7.1: SSR Landing Page with Hebrew Content

As a potential user searching for a Hebrew Markdown tool,
I want to find Marko via Google and land on a clear, fast page that explains what it does,
So that I can decide to try the tool.

**Acceptance Criteria:**

**Given** a user visits the root URL (`/`)
**When** the page loads
**Then** a server-side rendered landing page displays with a hero section, feature showcase, and CTA to open the editor
**And** all content is in Hebrew (Hebrew-first, with English secondary where needed)
**And** the page targets Hebrew keywords: "עורך מארקדאון", "מארקדאון בעברית", "כלי מארקדאון"
**And** the page is fully crawlable by search engines (no client-side rendering dependencies for content)
**And** the page uses edge runtime for fast TTFB
**And** the page achieves Lighthouse score of 90+ across Performance, Accessibility, Best Practices, and SEO
**And** the landing page uses RTL layout with Tailwind logical properties

### Story 7.2: Structured Data, Meta Tags & SEO Assets

As a search engine crawler,
I want proper structured data, meta tags, sitemap, and robots.txt on the landing page,
So that Marko is correctly indexed and appears in relevant search results.

**Acceptance Criteria:**

**Given** a crawler accesses the landing page
**When** it parses the HTML
**Then** JSON-LD structured data is present using the SoftwareApplication schema
**And** Open Graph meta tags are set for social sharing (title, description, image, URL)
**And** the page has a descriptive `<title>` and `<meta name="description">` targeting Hebrew keywords

**Given** a crawler accesses `/sitemap.xml`
**When** the sitemap is served
**Then** it lists all public routes (landing page, sign-in, sign-up)

**Given** a crawler accesses `/robots.txt`
**When** the file is served
**Then** it allows crawling of the landing page and blocks the editor route (no SEO value for app pages)
**And** `sitemap.xml` and `robots.txt` are generated dynamically via Next.js route handlers

## Epic 8: Analytics & Operator Tools

System tracks user registrations, feature usage, and AI calls (with model, tokens, cost). Operator can view analytics and monitor costs. Abuse detection flags suspicious accounts.

### Story 8.1: Analytics Event Pipeline

As an operator,
I want the system to track user registrations, logins, and feature usage events,
So that I can understand how users interact with Marko.

**Acceptance Criteria:**

**Given** a user performs a trackable action (registration, login, export, theme change, view mode switch, AI action)
**When** the event fires
**Then** an event is logged to the Convex `analyticsEvents` table with: userId, event name, metadata, timestamp
**And** event names follow the `domain.action` convention (e.g., "auth.signup", "export.pdf", "ai.call", "theme.preset_applied")
**And** the analytics pipeline does not block user-facing operations (async logging)
**And** the `analyticsEvents` table has indexes by_userId and by_event for efficient querying
**And** the pipeline handles up to 10,000 events per minute without degradation

### Story 8.2: AI Cost Tracking & Monitoring

As an operator,
I want to see real-time AI API costs broken down by model, action type, and user,
So that I can monitor spending and ensure the business stays cost-efficient.

**Acceptance Criteria:**

**Given** AI calls are being logged in the `aiUsage` table (from Epic 6)
**When** the operator queries usage data
**Then** they can view total API cost for any time period
**And** costs are broken down by model (Haiku, Sonnet, Opus), by action type, and by user
**And** token counts and calculated costs are accurate per call
**And** Convex queries provide: total cost today, this week, this month; cost per user; cost per action type
**And** the operator can access this data via Convex dashboard queries (no custom admin UI in Phase 1)

### Story 8.3: Abuse Detection & Account Flagging

As an operator,
I want the system to automatically flag accounts exhibiting suspicious usage patterns,
So that I can investigate potential abuse before it impacts costs.

**Acceptance Criteria:**

**Given** the system monitors account activity
**When** a Convex scheduled function (cron) runs periodically
**Then** accounts are flagged if they exhibit patterns such as: rapid account creation + immediate AI usage, exceeding soft usage thresholds, or unusual request patterns
**And** flagged accounts are marked in the `users` table with a `flagged` field and reason
**And** the operator can query flagged accounts via Convex dashboard
**And** flagging does not automatically block users -- it surfaces for manual review
**And** the cron job is defined in `convex/crons.ts`

## Epic 9: Payments & Subscription (Phase 2)

Paid users unlock unlimited Sonnet and daily Opus allocation with force-Opus toggle. System handles subscriptions with Israeli tax compliance (VAT, Sumit receipts).

### Story 9.1: Payment Provider Integration & Subscription Flow

As a registered user,
I want to upgrade to a paid subscription through a secure checkout flow,
So that I can unlock unlimited AI features.

**Acceptance Criteria:**

**Given** a free registered user clicks "Upgrade"
**When** they are redirected to the payment provider checkout (Stripe or Israeli provider)
**Then** they can complete payment securely (no card data touches Marko's servers)
**And** on successful payment, a webhook updates the user's tier to "paid" in Convex
**And** the Convex `subscriptions` table is created with: userId, status, providerId, createdAt, expiresAt
**And** the payment includes 17% VAT clearly displayed
**And** pricing is in NIS (ILS) as the primary currency

### Story 9.2: Opus Access & Force-Opus Toggle

As a paid user,
I want access to Opus-level AI with a daily allocation and the ability to force Opus for complex tasks,
So that I get maximum AI quality when I need it.

**Acceptance Criteria:**

**Given** a paid user triggers an AI action
**When** the system processes the request
**Then** unlimited Sonnet calls are allowed without restriction
**And** Opus calls are available up to a daily allocation (tracked in Convex)

**Given** a paid user enables the "Deep Analysis" toggle
**When** they trigger an AI action
**Then** the system forces the Opus model for that request
**And** the Opus usage is deducted from their daily allocation
**And** if the daily Opus allocation is exhausted, the system falls back to Sonnet with a Hebrew notification

### Story 9.3: Israeli Tax Compliance & Sumit Receipts

As a paying user,
I want to receive a valid Israeli tax invoice/receipt for each transaction,
So that I have proper documentation for my records and tax compliance.

**Acceptance Criteria:**

**Given** a payment transaction completes
**When** the payment webhook fires
**Then** a Convex action calls the Sumit API to generate a valid Israeli tax invoice/receipt
**And** the receipt includes: amount, 17% VAT breakdown, date, and transaction reference
**And** the receipt is associated with the user's subscription record in Convex
**And** the user can access their receipt (via email or account page)

### Story 9.4: Subscription Management

As a paid user,
I want to view my subscription status and cancel if needed,
So that I have full control over my billing.

**Acceptance Criteria:**

**Given** a paid user navigates to subscription management
**When** they view their subscription
**Then** they see: current plan, renewal date, payment method summary, and billing history

**Given** a paid user clicks "Cancel subscription"
**When** they confirm cancellation
**Then** the subscription is marked for cancellation at the end of the current billing period
**And** the user retains paid access until the period expires
**And** after expiry, the user's tier reverts to "free" in Convex
**And** a Hebrew confirmation message explains when access will end
