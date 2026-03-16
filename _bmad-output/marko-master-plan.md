# Marko Master Plan

> **Living document.** Updated as work progresses. All agents reference this as the single source of truth.
> **Last updated:** 2026-03-16 (post-feedback course correction)
> **Owner:** BenAkiva
> **Change log:** WS3 restructured per Sprint Change Proposal (feedback round 1). 6 new epics added. See `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md` for full analysis.

---

## Vision

Take the original hebrew-markdown-export editor — a warm, handcrafted, emerald-green Hebrew markdown tool — and evolve it into **Marko**, a premium SaaS product. Not a clone. Not a generic SaaS template. A professional-grade evolution that keeps the original's soul (emerald palette, Varela Round, rounded warmth) while elevating every pixel to a polished, unified, expensive-feeling product.

**Guiding question for every design decision:**
> "Does this feel like hebrew-markdown-export grew up and hired a world-class designer — or does it feel like a different product?"

**New guiding principle (from feedback round 1):**
> "Marko should feel BULK — substantial, warm, tactile. Not thin, not lightweight, not minimal. Heavy borders, solid buttons, generous spacing, rich backgrounds."

---

## Current State (2026-03-16)

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

### Completed Milestones
- [x] **Phase A** — Font replaced (Varela Round), emerald palette applied to CSS tokens
- [x] **Phase B** — Landing gradient, glassmorphic header, panel accent stripes, scrollbar, animations added
- [x] **WS1** — Design system created (1285 lines, comprehensive)
- [x] **WS2 V1–V15** — Full visual rebuild pass completed (Round 2)
- [x] **Feedback Round 1** — BenAkiva reviewed, 22 items documented with research backing
- [ ] ~~Phase C/D~~ — **CANCELLED** (replaced by workstream plan)

### Key Problems to Solve (from Feedback Round 1)
1. **RTL broken** — many text alignments wrong, CSS uses physical not logical properties (B2)
2. **Too thin** — buttons, borders, fonts all feel lightweight. Needs BULK (D3)
3. **Header disorganized** — no logical grouping, AI button buried, too many visible buttons (U1)
4. **Color system** — 15 presets produce garish results. Need 8 curated themes (D5)
5. **Editor flat** — background plain, panels don't float, spacing cramped (D1, D4)
6. **Missing features** — no document management, settings page, or contact/bug reporting (N3, N5, N6)
7. **Landing generic** — needs complete redesign with animations (D7, N1)
8. **APIs not connected** — AI, auth, payments all have code but no real credentials

---

## Workstreams

### WS1: Design Language Creation
**Status:** `DONE`
**Output:** `_bmad-output/marko-design-system.md`

The design system is comprehensive and authoritative. **Override register** (from feedback) is documented in the Sprint Change Proposal — specific values like header height 64px, borders 2px, body font 17px take precedence over the design system where explicitly noted.

---

### WS2: Visual Rebuild (Round 2)
**Status:** `DONE` (commits `36f0e3d` through `199009d`)

Round 2 completed and verified. Provides the CSS/component foundation that WS3 builds upon.

---

### WS3: Feedback Implementation
**Status:** `IN PROGRESS`
**Source:** `_bmad-output/benakiva-feedback-round1.md` (22 items, research-backed specs)
**Sprint Change Proposal:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md`

Organized into 4 priority phases, each with a Hawk QA gate.

#### WS3-P0: Foundation (RTL + BULK)
**Priority:** DO FIRST — these touch every component
**Epics:** E10 (RTL & Accessibility), E11/S11.1 (BULK pass)
**Gate:** G3a

| Story | Epic | Title | Status | Size |
|-------|------|-------|--------|------|
| S10.1 | E10 | Root RTL setup & global CSS logical properties | `TODO` | Medium |
| S10.2 | E10 | Component-level RTL audit | `TODO` | Medium |
| S10.3 | E10 | RTL verification & edge cases | `TODO` | Small |
| S11.1 | E11 | BULK pass — global CSS weight increase | `TODO` | Medium |

**Dev agent instructions for P0:**
> Read `_bmad-output/benakiva-feedback-round1.md` sections B2 and D3 in full — these contain the exact CSS replacement rules and component audit list.
>
> **S10.1 first:** Set `<html dir="rtl" lang="he">` in layout.tsx. Then do a global find-and-replace in `globals.css` and all component files: `text-align: left`→`start`, `margin-left`→`margin-inline-start`, etc. Full replacement list is in B2.
>
> **S10.2 next:** Audit every component listed in B2: ColorPanel, ExportModal, ToolbarDropdown, AiCommandPalette, landing, auth, tooltips. Fix icon mirroring, code block direction, modal button placement.
>
> **S11.1 (BULK):** Global CSS pass. Buttons→solid fills, min-height 40/44px, pill radius. Borders→2px. Font→17px body. Touch targets→44×44px. Accent stripes→4px. Shadows→+25%, emerald tint. Panel padding→20px.
>
> Read the design system at `_bmad-output/marko-design-system.md` for any values not explicitly overridden by feedback.

---

#### WS3-P1: Core Redesign (Header + Visual Polish + Themes Data)
**Priority:** After P0 foundation is solid
**Epics:** E12/S12.1-12.2 (Header), E11/S11.2-11.3 (Background/Icons), E13/S13.1 (Theme data)
**Gate:** G3b

| Story | Epic | Title | Status | Size |
|-------|------|-------|--------|------|
| S12.1 | E12 | Header layout — 7 zones, AI star button | `TODO` | Large |
| S12.2 | E12 | Header responsive behavior (4 breakpoints) | `TODO` | Medium |
| S11.2 | E11 | Editor background gradient & panel spacing | `TODO` | Small |
| S11.3 | E11 | Remove footer & icon enrichment | `TODO` | Medium |
| S13.1 | E13 | Theme data model & 8 launch themes | `TODO` | Medium |

**Dev agent instructions for P1:**
> Read feedback doc sections U1 (header reorg), D1 (background), D4 (spacing), D6 (footer), D5 (themes), N7 (icons).
>
> **S12.1 is the biggest story.** It rebuilds the entire header with 7 zones (Brand, View modes, AI star, Output, Tools, Overflow, User). The exact layout diagram is in U1. AI button must be the visually largest and most distinct element — emerald gradient, 44px, animated glow.
>
> **S13.1** defines the theme data structure and 8 themes with exact hex values from D5. This data feeds into S13.2 (the panel redesign) later.

---

#### WS3-P2: Enhanced UX (Theme Panel + Navigation + AI Entry Points)
**Priority:** After P1 header and themes data exist
**Epics:** E13/S13.2-13.3 (Panel redesign), E12/S12.3-12.4 (Overflow/User menu), E14/S14.1 (Skip landing)
**Gate:** G3c

| Story | Epic | Title | Status | Size |
|-------|------|-------|--------|------|
| S13.2 | E13 | Color panel redesign — theme gallery | `TODO` | Medium |
| S13.3 | E13 | Accent customizer & advanced mode | `TODO` | Medium |
| S12.3 | E12 | Overflow menu & BiDi simplification | `TODO` | Small |
| S12.4 | E12 | User menu & navigation | `TODO` | Small |
| S14.1 | E14 | Skip landing for returning visitors | `TODO` | Small |
| S6.2r | E6 | AI Actions UI revision (4 entry points) | `TODO` | Medium |

**Dev agent instructions for P2:**
> Read feedback doc sections U2 (color panel), U3 (BiDi), U4 (navigation), N4 (skip landing).
>
> **S13.2** rebuilds the color panel: opens from right side, 2-column theme card grid, mini Hebrew mockups, one-click apply, VS Code-style arrow-key preview. Depends on S13.1 theme data.
>
> **S6.2r** revises the AI UI: 4 entry points (header button, slash command, selection toolbar, Ctrl+J). Inline command bar, action chips, "gift not gate" paywall (5 free/month, partial results, toast counter). Full spec in U1.

---

#### WS3-P3: New Features & Landing
**Priority:** After P2 core UX is solid
**Epics:** E14/S14.2-14.3 (Settings/Contact), E15 (Document Management), E7 rewritten (Landing)
**Gate:** G3d

| Story | Epic | Title | Status | Size |
|-------|------|-------|--------|------|
| S14.2 | E14 | Settings page (`/settings`) | `TODO` | Medium |
| S14.3 | E14 | Contact & bug report pages (GitHub Issues) | `TODO` | Medium |
| S15.1 | E15 | Document sidebar UI | `TODO` | Medium |
| S15.2 | E15 | Auto-save & document CRUD | `TODO` | Medium |
| S15.3 | E15 | Convex backend for documents | `TODO` | Medium |
| S7.1r | E7 | Landing page structure & content | `TODO` | Large |
| S7.2r | E7 | Landing animations — Framer Motion | `TODO` | Medium |
| S7.3r | E7 | SEO preservation | `TODO` | Small |

**Dev agent instructions for P3:**
> Read feedback doc sections N5 (settings), N6 (contact/bug), N3 (doc management), D7 (landing), N1 (animations).
>
> **E15 (Document Management)** is the most complex new feature. S15.1 builds the sidebar UI, S15.2 implements auto-save with IndexedDB, S15.3 wires up Convex for cloud sync. All must handle RTL correctly.
>
> **E7 (Landing)** is a full rewrite. S7.1r builds the structure (hero + tabbed demos + CTAs). S7.2r adds Framer Motion (LazyMotion, theme-cycling hero, scroll animations). S7.3r preserves SEO (structured data, meta tags, sitemap).

---

#### WS3-BLOCKED: Items Requiring External Work

| Item | Type | Status | Notes |
|------|------|--------|-------|
| N2 (Logo) | External design | BLOCKED | Creative brief in feedback doc. BenAkiva to commission or AI-generate. Not a dev story |

---

### WS3C: API Connections (Parallel Track — PRESERVED)
**Status:** `NOT STARTED`
**Agent:** `/bmad-dev`
**Depends on:** Can run in parallel with any WS3 phase

| ID | Service | Status | What's Needed |
|----|---------|--------|---------------|
| A1 | Convex | `NOT CONNECTED` | Deploy functions, set CONVEX_DEPLOYMENT + NEXT_PUBLIC_CONVEX_URL |
| A2 | Clerk | `NOT CONNECTED` | Create app, set keys, configure webhook to Convex |
| A3 | Stripe | `NOT CONNECTED` | Set up account, create products/prices, set keys |
| A4 | Anthropic | `NOT CONNECTED` | Set ANTHROPIC_API_KEY, configure model routing |
| A5 | Sumit | `NOT CONNECTED` | Israeli receipt/invoice integration |

---

### WS3-Legacy: Features from Original Plan (Verify & Complete)
**Status:** `VERIFY` — these features may already work from WS2, need checking
**Priority:** After WS3-P1, before WS3-P3

| ID | Feature | Epic | Status | Notes |
|----|---------|------|--------|-------|
| F1 | V1 localStorage migration | E1 | `VERIFY` | Detect old keys, transform, one-time migration |
| F2 | BiDi per-sentence auto-detection | E4 | `VERIFY` | May need polish — the innovation feature |
| F3 | PDF smart page breaking | E3 | `VERIFY` | H1-H3 break, tables don't split, code blocks stay together |
| F4 | Image color extraction (K-means) | E2 | `VERIFY` | Upload image → extract 6 colors → map to properties (moves to Advanced section per D5) |
| F5 | Clipboard copy for Word | E3 | `VERIFY` | Inline styles, RTL preservation |
| F6 | Sample document loading | E1 | `VERIFY` | Tooltip + content loading |
| F7 | Keyboard shortcuts | E1 | `VERIFY` | All documented shortcuts working |
| F8 | AI privacy disclosure | E6 | `TODO` | Notice before AI processing |
| F9 | Presentation mode | E1 | `TODO` | Full-screen slide view (spec in original master plan WS3A section) |

---

### WS4: QA Verification
**Status:** `ONGOING`
**Agent:** `/bmad-hawk`
**Depends on:** Runs after each phase milestone

#### Verification Gates

| Gate | When | What to Verify |
|------|------|---------------|
| G1 | After WS1 | DONE — design system reviewed |
| G2 | After WS2 | DONE — visual rebuild verified |
| **G3a** | After WS3-P0 | RTL correctness in all components. BULK visual weight. All text direction correct. No physical CSS properties remaining |
| **G3b** | After WS3-P1 | Header 7-zone layout matches spec. Editor background gradient visible. Panel spacing correct. Footer removed. Theme data model has 8 themes |
| **G3c** | After WS3-P2 | Theme panel opens from right, cards work, arrow-key preview. Overflow menu has direction control. User menu has all items. Skip-landing redirect works. AI has 4 entry points |
| **G3d** | After WS3-P3 | Settings page functional. Contact/bug forms create GitHub issues. Document sidebar works (create/save/list/delete). Landing page matches redesign spec. Animations smooth. SEO preserved |
| G4 | After WS3C | Auth flows, AI actions UI, payment flows |
| G5 | Pre-launch | Full regression — everything together, all breakpoints (375/768/1024/1440), light+dark, RTL |

---

## Execution Order

```
WS1 (Design System) = DONE
WS2 (Visual Rebuild) = DONE

WS3-P0 (RTL + BULK)
  └──→ G3a (Hawk QA)
        └──→ WS3-P1 (Header + Visual + Theme Data)
              └──→ G3b (Hawk QA)
                    └──→ WS3-P2 (Theme Panel + Nav + AI)
                          └──→ G3c (Hawk QA)
                                └──→ WS3-P3 (Features + Landing)
                                      └──→ G3d (Hawk QA)

WS3C (API Connections) ←── parallel track, start anytime
  └──→ G4

WS3-Legacy (Feature Verify) ←── can start after G3a, parallel with P1+

All gates pass ──→ G5 (Pre-Launch Full Regression)
```

---

## Design System Override Register

The design system at `_bmad-output/marko-design-system.md` remains authoritative EXCEPT for these overrides from BenAkiva's feedback:

| Property | Design System | Override | Source |
|----------|--------------|----------|--------|
| Header height | 56px | **64px** | D2 |
| Panel border width | 1px | **2px** | D3 |
| Body font size | 1rem (16px) | **1.0625rem (17px)** | D3 |
| Button min-height (standard) | varies | **40px** | D3 |
| Button min-height (primary) | varies | **44px** | D3 |
| Touch targets | varies | **44x44px** | D3 |
| Accent stripe width | 3px | **4px** | D3 |
| Shadow spread | as specified | **+25%** | D3 |
| Panel internal padding (desktop) | 16px | **20px** | D3/D4 |
| Panel outer padding (desktop) | varies | **24px** | D4 |
| Panel gap (desktop) | varies | **24px** | D4 |
| Letter-spacing (Varela Round) | default | **-0.01em** | D3 |
| Backdrop-filter blur | 12px | **16px** | D2 |
| Backdrop-filter saturate | 1.2 | **1.4** | D2 |
| Header bg opacity | varies | **0.97** | D2 |
| Theme presets | 15 | **8 curated** | D5 |

---

## Epic Summary (Post Course Correction)

| Epic | Name | Stories | Status | Phase |
|------|------|---------|--------|-------|
| E1 | Foundation & Core Editor | S1.1-1.3, S1.5-1.7 (6 remain) | Mostly built | WS3-Legacy |
| E2 | Visual Customization | S2.4, S2.5 (2 remain) | S2.1-2.3 superseded by E13 | WS3-Legacy |
| E3 | Export & Sharing | S3.1-3.4 (4) | Built, verify | WS3-Legacy |
| E4 | BiDi Intelligence | S4.1-4.2 (2) | Built, verify | WS3-Legacy |
| E5 | Auth & Accounts | S5.1-5.3 (3) | Not connected | WS3C |
| E6 | AI Document Actions | S6.1, S6.2r, S6.3, S6.4 (4) | S6.2 revised for 4 entry points | WS3-P2 + WS3C |
| **E7** | **Landing Page (rewritten)** | S7.1r-7.3r (3) | **NEW** | WS3-P3 |
| E8 | Analytics & Ops | S8.1-8.3 (3) | Not started | WS3C |
| E9 | Payments (Phase 2) | S9.1-9.4 (4) | Future | Phase 2 |
| **E10** | **RTL & Accessibility** | S10.1-10.3 (3) | **NEW** | WS3-P0 |
| **E11** | **Visual Identity (BULK)** | S11.1-11.3 (3) | **NEW** | WS3-P0/P1 |
| **E12** | **Header & Navigation** | S12.1-12.4 (4) | **NEW** | WS3-P1/P2 |
| **E13** | **Theme System** | S13.1-13.3 (3) | **NEW** | WS3-P1/P2 |
| **E14** | **User Experience Pages** | S14.1-14.3 (3) | **NEW** | WS3-P2/P3 |
| **E15** | **Document Management** | S15.1-15.3 (3) | **NEW** | WS3-P3 |

**Total: 15 epics, 47 stories** (23 new from feedback, 24 existing)

---

## How to Use This Document

### For BenAkiva
- Check WS3 phase progress at a glance
- Each phase has a clear gate — nothing moves forward without QA verification
- P0→P1→P2→P3 matches your priority matrix exactly

### For Dev Agents
- Read this document FIRST before starting any work
- Read `_bmad-output/benakiva-feedback-round1.md` for the detailed spec of each feedback item
- Read the design system at `_bmad-output/marko-design-system.md` for visual rules, noting the Override Register above
- Check the Sprint Change Proposal at `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md` for story acceptance criteria
- **CRITICAL:** For each story, find its feedback item (D1-D7, B1-B2, N1-N7, U1-U4) in the feedback doc. That section IS the spec.

### For Hawk (QA)
- 4 new gates (G3a-G3d) — one after each WS3 phase
- G3a is the most critical — RTL must be correct before anything else proceeds
- For each gate, open browser at `http://localhost:3000` and `http://localhost:3000/editor`
- Test at 375px, 768px, 1024px, 1440px viewports, light+dark mode, RTL verification

---

## Reference Documents

| Document | Path | Purpose |
|----------|------|---------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | All 52 functional requirements |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | Full story breakdown (updated) |
| Sprint Change Proposal | `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md` | Detailed impact analysis & story specs |
| **Feedback Round 1** | `_bmad-output/benakiva-feedback-round1.md` | **PRIMARY SPEC for all WS3 stories** |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Tech stack, patterns, deployment |
| Design System | `_bmad-output/marko-design-system.md` | Visual authority (with Override Register) |
| Original Site | https://dartaryan.github.io/hebrew-markdown-export/ | Brand reference |
| Hawk Screenshots | `_bmad-output/hawk-screenshots/` | Visual QA evidence |
