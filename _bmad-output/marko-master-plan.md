# Marko Master Plan

> **Living document.** Updated as work progresses. All agents reference this as the single source of truth.
> **Last updated:** 2026-03-16
> **Owner:** BenAkiva

---

## Vision

Take the original hebrew-markdown-export editor — a warm, handcrafted, emerald-green Hebrew markdown tool — and evolve it into **Marko**, a premium SaaS product. Not a clone. Not a generic SaaS template. A professional-grade evolution that keeps the original's soul (emerald palette, Varela Round, rounded warmth) while elevating every pixel to a polished, unified, expensive-feeling product.

**Guiding question for every design decision:**
> "Does this feel like hebrew-markdown-export grew up and hired a world-class designer — or does it feel like a different product?"

---

## Current State (2026-03-15)

### What's Built
- Next.js 16 + React 19 + TypeScript project structure
- Convex backend (code exists, **NOT connected**)
- Clerk auth (code exists, **NOT connected**)
- Stripe payments (code exists, **NOT connected**)
- Anthropic AI (code exists, **NOT connected**)
- shadcn/ui component library (New York variant)
- Landing page with Hero, Features, Demo sections
- Editor page with split view (editor/preview)
- Formatting toolbar with 14+ buttons
- View mode toggle (editor/split/preview)
- Dark/light mode toggle
- 15 color presets + custom color panel
- Export modal (PDF, HTML, Markdown)
- Clipboard copy functionality
- RTL/LTR/BiDi direction toggle
- Sample document loading

### What's Been Done So Far
- [x] **Phase A** — Font replaced (Varela Round), emerald palette applied to CSS tokens
- [x] **Phase B** — Landing gradient, glassmorphic header, panel accent stripes, scrollbar, animations added
- [x] **WS2 V1–V15** — Full visual rebuild pass completed (all 15 tasks)
- [ ] ~~Phase C/D~~ — **CANCELLED** (replaced by this plan)

### Honest Assessment (Hawk QA, 2026-03-16)
The visual rebuild (WS2) was completed mechanically — CSS patches on shadcn defaults without a coherent design vision. The result is:
- **Incoherent** — components speak different visual languages, no unified system
- **Not premium** — still feels like a generic SaaS template, not the elevated brand BenAkiva wants
- **Not the original's soul** — the warmth, depth, and personality of the original site is missing

**Decision: Full reset.** WS1 (Design System) must be redone from scratch by UI/UX Pro Max, and WS2 must be re-executed based on the new design system.

### Key Problems Right Now
1. **Design system is insufficient** — current `marko-design-system.md` produced mechanical results, needs complete redo by UI/UX Pro Max
2. **Visual rebuild needs redo** — all V1-V15 tasks must be re-implemented with the new design system
3. **Editor page lacks depth** — panels don't float, no spatial hierarchy, feels flat
4. **Mobile editor broken** — layout unusable at 375px
5. **APIs not connected** — AI, auth, payments all have code but no real credentials
6. **Missing features** — Presentation mode, v1 migration, several PRD features not implemented
7. **No unified look & feel** — the "expensive, fast, comfortable" premium feel is absent

---

## Workstreams

### WS1: Design Language Creation
**Status:** `DONE` — design system is comprehensive (1285 lines, all sections covered)
**Agent:** `/ui-ux-pro-max`
**Depends on:** Nothing
**Output:** `_bmad-output/marko-design-system.md`

The design system is solid and does NOT need redoing. The problem was that WS2 (implementation) only followed ~33% of the spec. Key elements like panel border-radius, shadows, header glassmorphism, and logo styling were specified correctly in the system but not implemented by the dev agent.

**The spec must include:**

| Section | What to Define |
|---------|---------------|
| Color tokens | Full palette with semantic names, light mode + dark mode, usage rules (when to use which color) |
| Typography | Scale (h1-h6, body, caption, code), weights, line heights, letter spacing, Hebrew-specific rules |
| Spacing | Consistent scale (4px base?), padding/margin rules, component spacing |
| Elevation | Shadow system (levels 0-4), when to use each level, emerald-tinted shadows |
| Border radius | System (sm/md/lg/xl/pill), which components get which radius |
| Components | Button variants, input styles, panel/card patterns, modal style, header pattern, toolbar pattern, toggle/radio pattern, badge/tag style |
| Interactions | Hover effects, focus rings, transitions (duration, easing), active states |
| Layout | Grid system, breakpoints, responsive rules, panel floating behavior |
| Dark mode | Complete token mapping, not just "invert" — intentional dark palette |
| RTL rules | Directional spacing, icon mirroring, text alignment defaults |
| Icons | Size scale, stroke width, color usage |

**Brand constraints (from original site):**
- Primary: Emerald green (#10B981)
- Secondary: Mint (#6EE7B7), Cyan-teal (#2DD4BF)
- Dark: Forest (#064E3B)
- Font: Varela Round (body), JetBrains Mono (code)
- Feel: Warm, rounded, elevated, handcrafted — NOT corporate, NOT flat, NOT generic

**Reference:**
- Original site: https://dartaryan.github.io/hebrew-markdown-export/
- Original repo: https://github.com/dartaryan/hebrew-markdown-export/
- Screenshots: `_bmad-output/hawk-screenshots/phase-a-verify-2026-03-15/original-site-top.png`

---

### WS2: Visual Rebuild (Round 2)
**Status:** `TODO` — Round 1 only implemented ~33% of the design system spec
**Agent:** `/bmad-dev` or `/bmad-quick-dev-new-preview`
**Depends on:** WS1 (design system exists at `_bmad-output/marko-design-system.md`)
**Input:** `_bmad-output/marko-design-system.md`

Round 1 (V1-V15, commits `36f0e3d` through `9ef1395`) was completed but the dev agent failed to follow the design system faithfully. Key missing elements identified by Hawk QA:
- Header: no background, no backdrop-filter, no z-index, logo icon unstyled
- Panels: no 24px border-radius, no shadow-3, no accent stripe (THE signature element)
- Buttons: pill shape (9999px) not applied
- Overall: classes like `marko-header` and `marko-panel` exist but are missing critical CSS properties

**Dev agent instructions:** Read `_bmad-output/marko-design-system.md` in full before touching any code. For EVERY component, compare the current code against the design system spec line by line. Fix every gap. No shortcuts. No "close enough."

#### Tasks

| ID | Component | File(s) | Status |
|----|-----------|---------|--------|
| V1 | Global CSS tokens & base styles | `app/globals.css` | `TODO` |
| V2 | Header (glassmorphic, branded buttons) | `components/layout/Header.tsx` | `TODO` |
| V3 | Editor/Preview panels (floating, elevated) | `components/layout/PanelLayout.tsx` | `TODO` |
| V4 | Editor page background & layout | `app/editor/page.tsx` or layout | `TODO` |
| V5 | Formatting toolbar (sized, grouped, styled) | `components/editor/EditorToolbar.tsx`, `FormatButton.tsx` | `TODO` |
| V6 | Button variants (pill, sizes, hover) | `components/ui/button.tsx` | `TODO` |
| V7 | Color panel (slide-out, premium feel) | `components/theme/ColorPanel.tsx` | `TODO` |
| V8 | Export modal (rounded, branded) | `components/export/ExportModal.tsx` | `TODO` |
| V9 | Landing page — Hero | `components/landing/Hero.tsx` | `TODO` |
| V10 | Landing page — Features cards | `components/landing/Features.tsx` | `TODO` |
| V11 | Landing page — Demo section | `components/landing/Demo.tsx` | `TODO` |
| V12 | Footer (editor + landing) | `components/layout/Footer.tsx` | `TODO` |
| V13 | Dark mode — full theme validation | All components | `TODO` |
| V14 | Mobile responsive — all breakpoints | All components | `TODO` |
| V15 | Auth components styling | `components/auth/*.tsx` | `TODO` |

---

### WS3: Feature Completion
**Status:** `NOT STARTED`
**Agent:** `/bmad-dev`
**Depends on:** Can run parallel with WS2 for non-visual features. Visual features wait for WS1.

#### 3A: Enhanced Presentation Mode (NEW — not in original PRD scope)

**Priority:** HIGH
**Output:** New component + toolbar integration

**Spec:**
- User inserts page breaks in markdown (e.g., `---` or `<!-- break -->`) to define slide boundaries
- "Presentation mode" button in toolbar (already exists as button, needs implementation)
- Activating it switches to **full-screen horizontal slide view**:
  - One slide at a time, fills the viewport
  - NO scrolling within a slide — content must fit
  - Navigation arrows at bottom center for prev/next
  - Keyboard navigation (arrow keys, space, escape to exit)
  - Slide counter (e.g., "3 / 12")
- **Slide rendering rules:**
  - Headings (h1, h2) auto-center on slide
  - Body text left/right aligned per RTL/LTR setting
  - Code blocks, tables, diagrams render normally but sized to fit
  - If content overflows a slide, warn user (visual indicator in editor) — do NOT auto-split
- **Visual style:**
  - Clean, minimal, professional — not PowerPoint-flashy
  - Use the design system colors and typography
  - Subtle slide transition (fade or slide, not bounce)
  - Dark background option for screen sharing
- **AI integration:**
  - AI action: "Convert to presentation" — reformats markdown with page breaks, restructures for slides
  - Prompt engineered for clean slide content (short bullets, clear headings)

#### 3B: Features from PRD (Phase 1 — verify & complete)

| ID | Feature | Epic | Status | Notes |
|----|---------|------|--------|-------|
| F1 | V1 localStorage migration | E1 | `VERIFY` | Detect old keys, transform, one-time migration |
| F2 | BiDi per-sentence auto-detection | E4 | `VERIFY` | May need polish — the innovation feature |
| F3 | PDF smart page breaking | E3 | `VERIFY` | H1-H3 break, tables don't split, code blocks stay together |
| F4 | Image color extraction (K-means) | E2 | `VERIFY` | Upload image → extract 6 colors → map to 17 properties |
| F5 | Clipboard copy for Word | E3 | `VERIFY` | Inline styles, RTL preservation |
| F6 | Sample document loading | E1 | `VERIFY` | Tooltip + content loading |
| F7 | Keyboard shortcuts | E1 | `VERIFY` | All documented shortcuts working |
| F8 | AI privacy disclosure | E6 | `TODO` | Notice before AI processing |

#### 3C: API Connections

| ID | Service | Status | What's Needed |
|----|---------|--------|---------------|
| A1 | Convex | `NOT CONNECTED` | Deploy functions, set CONVEX_DEPLOYMENT + NEXT_PUBLIC_CONVEX_URL |
| A2 | Clerk | `NOT CONNECTED` | Create app, set keys, configure webhook to Convex |
| A3 | Stripe | `NOT CONNECTED` | Set up account, create products/prices, set keys |
| A4 | Anthropic | `NOT CONNECTED` | Set ANTHROPIC_API_KEY, configure model routing |
| A5 | Sumit | `NOT CONNECTED` | Israeli receipt/invoice integration |

---

### WS4: QA Verification
**Status:** `ONGOING`
**Agent:** `/bmad-hawk`
**Depends on:** Runs after each workstream milestone

#### Verification Gates

| Gate | When | What to Verify |
|------|------|---------------|
| G1 | After WS1 | Review design system for completeness, RTL coverage, dark mode coverage |
| G2 | After WS2 | Full visual QA — all pages, all breakpoints (375/768/1024/1440), light+dark, RTL |
| G3 | After WS3A | Presentation mode — visual quality, slide rendering, navigation, responsive |
| G4 | After WS3B | Feature-by-feature visual check |
| G5 | After WS3C | Auth flows, AI actions UI, payment flows |
| G6 | Pre-launch | Full regression — everything together |

---

## Execution Order

```
WS1 (Design System)
 └──→ WS2 (Visual Rebuild) ──→ G2 (Hawk QA)
       └──→ WS3A (Presentation Mode) ──→ G3
       └──→ WS3B (Feature Verify) ──→ G4
 └──→ WS3C (API Connections) ──→ G5
                                    └──→ G6 (Pre-Launch)
```

**WS3C (API connections) can start in parallel with WS2** since it's backend work that doesn't depend on the design system.

---

## How to Use This Document

### For BenAkiva
- Check status of any workstream at a glance
- Update priorities or add new requirements in the relevant section
- Mark items as done when verified

### For Dev Agents
- Read this document FIRST before starting any work
- Check which workstream you're assigned to
- Read the design system (`_bmad-output/marko-design-system.md`) before any visual work
- Update task status in this document when completing work
- Reference the PRD at `_bmad-output/planning-artifacts/prd.md` for detailed functional requirements

### For UI/UX Pro Max
- WS1 is DONE — design system already exists at `_bmad-output/marko-design-system.md`
- If called again, review and improve the existing system rather than starting from scratch

### For Hawk (QA)
- Run verification at each gate
- Update findings in `_bmad-output/hawk-findings-{gate-id}.md`
- Update this document's status after each gate

---

## Reference Documents

| Document | Path | Purpose |
|----------|------|---------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | All 52 functional requirements |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | 34 stories across 9 epics |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Tech stack, patterns, deployment |
| UX Design | `_bmad-output/planning-artifacts/ux-design-directions.html` | Personas, journeys, emotional design |
| Original Site | https://dartaryan.github.io/hebrew-markdown-export/ | Brand reference |
| Original Repo | https://github.com/dartaryan/hebrew-markdown-export/ | Code reference |
| Design System | `_bmad-output/marko-design-system.md` | Authoritative — 1285 lines, all sections |
| Hawk Screenshots | `_bmad-output/hawk-screenshots/` | Visual QA evidence |
| Old Renovation Plan | `_bmad-output/marko-visual-renovation-plan.md` | **SUPERSEDED by this document** |

---

## Agent Prompts

Copy-paste these prompts to kick off each workstream.

### Prompt: WS2 — Dev Agent (Visual Rebuild Round 2)

> Read `_bmad-output/marko-master-plan.md` — you are executing **WS2: Visual Rebuild (Round 2)**.
>
> **CRITICAL CONTEXT:** Round 1 was completed but Hawk QA found that only ~33% of the design system was actually implemented. The design system is correct and comprehensive — the implementation just didn't follow it. Your job is to fix every gap.
>
> Read the design system at `_bmad-output/marko-design-system.md` **in full** before touching any code. This is your bible. Every CSS change, every Tailwind class, every component style must follow this system exactly. No improvising. No shadcn defaults unless the system says so.
>
> **Known failures from Round 1 (fix these first):**
> - Header (`components/layout/Header.tsx`): missing `rgba(6,78,59,0.95)` background, `backdrop-filter: blur(12px) saturate(1.2)`, `z-index: 50`. Logo icon missing gradient bg, 12px radius, shadow-2.
> - Panels (`components/layout/PanelLayout.tsx`): missing `border-radius: 24px`, `box-shadow: var(--shadow-3)`, 3px gradient accent stripe at top.
> - Buttons: pill shape (`border-radius: 9999px`) not applied.
> - Many other component specs likely also not followed.
>
> Execute tasks V1 through V15 in order. For EACH task:
> 1. Read the design system section for that component
> 2. Read the current code
> 3. Compare line-by-line — every property the spec defines must appear in the code
> 4. Fix every gap
> 5. Run `pnpm dev` to confirm it builds
>
> After completing all tasks, run `pnpm dev` and confirm the app loads on both `/` and `/editor`.

### Prompt: WS3A — Dev Agent (Presentation Mode)

> Read `_bmad-output/marko-master-plan.md` — you are implementing **WS3A: Enhanced Presentation Mode**.
>
> Read the full spec in the master plan under section 3A. Also read the design system at `_bmad-output/marko-design-system.md` for visual styling rules.
>
> Implement the presentation mode feature:
> 1. Create a `PresentationView` component that renders markdown content as slides
> 2. Slides are split by `---` (horizontal rule) page breaks
> 3. Full-screen horizontal view, one slide at a time, no scrolling within slides
> 4. Navigation arrows at bottom, keyboard support (arrows, space, escape)
> 5. Headings auto-center, slide counter, subtle transitions
> 6. Wire up the existing "מצב מצגת" button in the toolbar to activate it
> 7. Style everything per the design system
>
> Read each file before editing. Run `pnpm dev` when done.

### Prompt: Hawk QA (After Any Workstream)

> Read `_bmad-output/marko-master-plan.md` and check which gate applies.
>
> Open the browser, navigate to `http://localhost:3000` and `http://localhost:3000/editor`.
> Take screenshots at 1440px, 768px, and 375px viewports, both light and dark mode.
> Compare against the design system at `_bmad-output/marko-design-system.md`.
> Report bugs with severity, exact location, and suggested fix.
> Update the master plan status after verification.
