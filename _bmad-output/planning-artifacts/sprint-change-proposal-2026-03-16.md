# Sprint Change Proposal — Post-Feedback Round 1

> **Date:** 2026-03-16
> **Trigger:** BenAkiva's 22-item feedback on live site after WS2 completion + deep research benchmarking study
> **Scope Classification:** MAJOR — requires workstream restructure, new epics, and updated master plan
> **Recommended Approach:** Direct Adjustment (no rollback, no MVP reduction)

---

## 1. Issue Summary

After completing WS1 (design system) and WS2 (visual rebuild round 2), BenAkiva reviewed the live site and identified 22 issues spanning design direction (7), bugs (2), new features (7), and UX flow (4). A deep research study of 40+ products across 8 areas validated and enriched each item into specific, actionable specs.

**Core finding:** The site functions but doesn't match BenAkiva's vision for Marko's identity — it's too thin, too generic, has RTL bugs, lacks key features (document management, settings, themes), and the header/navigation needs complete reorganization.

**Evidence:** `_bmad-output/benakiva-feedback-round1.md` — 22 items with Hebrew feedback, interpretation, research findings, and detailed implementation specs.

---

## 2. Impact Analysis

### 2.1 Full Feedback-to-Epic Mapping

| ID | Feedback Item | Impact Type | Existing Artifact | Action |
|----|--------------|-------------|-------------------|--------|
| B2 | RTL audit (logical properties) | **NEW EPIC** | Extends E4 but far exceeds its scope | Create E10 with 3 stories |
| U1 | Header reorganization | **SUPERSEDES** | E1/S1.4 (toolbar), E6/S6.2 (AI UI) | Create E12, retire S1.4 |
| D3 | BULK pass (thicker everything) | **NEW** cross-cutting | No existing coverage | Create stories in E11 |
| B1 | Color panel direction fix | MODIFIES | E2/S2.1 | Quick fix, fold into E10 |
| D1 | Editor background gradient | NEW | Relates to E1/S1.2 | New story in E11 |
| D2 | Header size & consistency | MODIFIES | E1/S1.4 — tied to U1 | Fold into E12 (do with U1) |
| D4 | Panel spacing (breathing room) | MODIFIES | E1/S1.2 (layout) | New story in E11 |
| D5 | Curated themes (8 themes) | **SUPERSEDES** | E2/S2.1, S2.2, S2.3 | Create E13, retire old stories |
| D6 | Remove footer | MODIFIES | E1 (layout) | Trivial, fold into E11 |
| U2 | Color panel full redesign | **SUPERSEDES** | E2/S2.1 | Fold into E13 (with D5) |
| U3 | BiDi simplification | MODIFIES | E4 + E1/S1.6 | New story in E12 |
| N4 | Skip landing for returning visitors | NEW | Relates to E7 | New story in E14 |
| N7 | More icons throughout | NEW cross-cutting | No existing coverage | New story in E11 |
| N5 | Settings page | **NEW** | No existing coverage | New stories in E14 |
| U4 | Navigation (logo + user menu) | MODIFIES | E1 + E5 | Fold into E12 |
| N3 | Document management | **NEW EPIC** | No existing coverage | Create E15 with 3 stories |
| N6 | Contact & bug report (GitHub Issues) | **NEW** | No existing coverage | New stories in E14 |
| D7 | Landing page redesign | **SUPERSEDES** | E7/S7.1, S7.2 | Rewrite E7 |
| N1 | Landing animations (Framer Motion) | NEW | No existing coverage | New story in rewritten E7 |
| N2 | Logo ("מ" pencil mark) | **BLOCKED** | No existing coverage | Creative brief only, not a dev story |

### 2.2 Existing Epic Disposition

| Epic | Original Stories | Disposition | Notes |
|------|-----------------|-------------|-------|
| **E1** Foundation & Core Editor | S1.1–S1.7 | **KEEP, MODIFY** | S1.1, S1.2, S1.3, S1.7 still valid. S1.4 superseded by E12. S1.5 valid (presentation mode stays). S1.6 modified (direction toggle moves to overflow) |
| **E2** Visual Customization | S2.1–S2.5 | **HEAVY REWRITE** | S2.1, S2.2, S2.3 superseded by E13. S2.4 (image extraction) moves to E13 Advanced section. S2.5 (dark/light) still valid |
| **E3** Export & Sharing | S3.1–S3.4 | **KEEP AS-IS** | All 4 stories remain valid |
| **E4** BiDi Intelligence | S4.1–S4.2 | **KEEP** | Both stories valid. B2 creates companion epic E10 |
| **E5** Auth & Accounts | S5.1–S5.3 | **KEEP** | All valid. U4 user menu items handled in E12 |
| **E6** AI Document Actions | S6.1–S6.4 | **MODIFY** | S6.1, S6.3, S6.4 valid. S6.2 needs revision for 4 AI entry points (handled by E12) |
| **E7** SEO Landing Page | S7.1–S7.2 | **REWRITE** | Superseded by D7+N1. Rewrite as landing redesign epic |
| **E8** Analytics & Ops | S8.1–S8.3 | **KEEP AS-IS** | All valid |
| **E9** Payments (Phase 2) | S9.1–S9.4 | **KEEP AS-IS** | All valid, Phase 2 |

### 2.3 New Epics

#### E10: RTL & Accessibility Foundation
**Source:** B2 (RTL audit), B1 (color panel direction)
**Priority:** P0 — must be done first, touches every component
**Scope:** Full CSS logical properties migration, icon mirroring rules, code content LTR exceptions, modal/dialog button placement, form input direction handling

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S10.1 | Root RTL setup & global CSS logical properties | Set `<html dir="rtl" lang="he">`, replace all physical CSS properties with logical equivalents in `globals.css`. Replace `text-align: left/right` → `start/end`, all `margin-left/right` → `margin-inline-start/end`, all `padding-left/right` → `padding-inline-start/end`, all `left/right` positioning → `inset-inline-start/end`, all `border-left/right` → `border-inline-start/end` | Medium |
| S10.2 | Component-level RTL audit | Audit and fix RTL in all components: ColorPanel (side→right, X→top-left), ExportModal (button placement), ToolbarDropdown, AiCommandPalette, landing components, auth components, all tooltips. Fix icon mirroring (scaleX(-1) for directional icons, never mirror X/bold/search). Fix code blocks (`direction: ltr`, `unicode-bidi: embed`). Fix form inputs (email/URL/hex → `dir="ltr"`) | Medium |
| S10.3 | RTL verification & edge cases | Modal/dialog buttons: primary→left, secondary→right, X→top-left. Number rendering. `dir="auto"` on user text fields. Verify all components pass RTL visual check | Small |

---

#### E11: Visual Identity — BULK & Polish
**Source:** D1, D3, D4, D6, N7
**Priority:** P0 (D3) + P1 (D1, D4, D6) + P2 (N7)
**Scope:** Global CSS pass for heavier visual weight, editor background, panel spacing, footer removal, icon enrichment

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S11.1 | BULK pass — global CSS weight increase (P0) | Buttons: solid fills default, min-height 40/44px, pill radius 9999px, padding 10px 20px. Borders: 1→2px on panels/cards/inputs. Font: body 1rem→1.0625rem, UI labels +1px. Touch targets: min 44×44px. Accent stripes: 3→4px. Shadows: +25% spread, emerald tint. Panel internal padding: 20px desktop, 16px mobile. Letter-spacing: Varela Round -0.01em | Medium |
| S11.2 | Editor page background & panel spacing (P1) | Rich emerald gradient background (light: 135deg #064E3B→#065F46→#047857, dark: #041F17→#0B1A14→#0F2A1E). Subtle noise texture overlay (SVG, 0.02 opacity). Panel outer padding: 24px desktop, 16px tablet, 8px mobile. Panel gaps: 24/16/8px. Panel border-radius: 24/16/12px. Presentation mode exception: full-screen, no margins | Small |
| S11.3 | Remove footer & icon enrichment (P1+P2) | Delete Footer.tsx, remove all references. Landing: end with CTA section instead. Evaluate Phosphor Icons (duotone) vs lucide-react — if switching, global replacement. Add icon+text labels on desktop header buttons, icon-only on mobile. Icons next to color panel section headers, landing feature cards (32px), user menu items, dropdown menus | Medium |

---

#### E12: Header & Navigation Redesign
**Source:** U1, U3, U4, D2
**Priority:** P0 (U1) + P1 (D2) + P2 (U3) + P3 (U4)
**Scope:** Complete header layout rebuild with 7 zones, AI star feature, overflow menu, user menu, responsive behavior

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S12.1 | Header layout — zones & base structure (P0) | Rebuild Header.tsx with 7-zone RTL layout: Brand (logo+text), View modes (3-way toggle), AI star button (emerald gradient, 44px, sparkle icon, animated glow), Output (export+copy dropdowns), Tools (theme+dark toggle), Overflow (3-dot→clear/direction/presentation/sample), User (avatar/login). Header height 64px. All buttons 40px min-height, pill shape, 8px intra-group gap, 16px inter-group gap, vertical separators | Large |
| S12.2 | Header responsive behavior | 4 breakpoints: ≥1440px full layout, 1024-1439px collapse export/copy into single dropdown, 768-1023px Brand+AI+output+overflow+user (view toggle→overflow), <768px Brand(logo-only)+AI+overflow+user (view toggle above panels, bottom toolbar strip for formatting) | Medium |
| S12.3 | Overflow menu & BiDi simplification (P2) | Create overflow "···" menu with: sample doc, clear editor, presentation mode, direction override submenu (אוטומטי✓/ימין-לשמאל/שמאל-לימין). Remove DirectionToggle from header. Add tiny direction indicator bottom-right of editor panel (click to cycle). Wire direction to Settings page (N5) | Small |
| S12.4 | User menu & navigation (P3) | Logo click→ `/` with `?home=true`. User menu (logged in): Documents, Settings, Contact, Bug Report, separator, Sign Out. User menu (anonymous): Settings, Contact, Bug Report, separator, Sign In. All items with icons. Mobile: hamburger/drawer menu | Small |

---

#### E13: Theme System Redesign
**Source:** D5, U2
**Priority:** P1 (D5) + P2 (U2)
**Scope:** 8 curated themes, redesigned color panel, accent customizer, WCAG contrast

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S13.1 | Theme data model & 8 launch themes (P1) | Define theme data structure in `lib/colors/`. Implement 8 themes (Green Meadow free/default, Sea of Galilee free, Minimal Gray free, Old Parchment premium, Negev Night premium, Soft Rose premium, Lavender Dream premium, Ocean Deep premium) with exact hex values from spec. Theme includes: background, heading color, accent color, body text, code bg, blockquote, link, etc. Free/premium flag per theme | Medium |
| S13.2 | Color panel redesign — theme gallery (P2) | Rebuild ColorPanel.tsx: opens from right side (RTL), X at top-left. Header "ערכות נושא". 2-column scrollable grid of visual cards (~140px wide). Each card: mini Hebrew document mockup in theme colors (heading+paragraph+code). Click to apply instantly. Arrow-key navigation with live preview, Enter to commit, Escape to cancel. Premium themes: lock badge, preview works, upsell on apply | Medium |
| S13.3 | Accent customizer & advanced mode (P2) | Below theme grid: "התאמה אישית" section with HSL color wheel for one accent color. System auto-generates complementary tints/shades. Live WCAG contrast ratio indicator (min 4.5:1, warn if violated). "מתקדם" toggle reveals 16 individual pickers + image color extractor. "חזור לברירת מחדל" reset button. All text right-aligned, hex inputs LTR | Medium |

---

#### E14: User Experience Pages
**Source:** N4, N5, N6
**Priority:** P2 (N4) + P3 (N5, N6)
**Scope:** Settings page, contact page, bug report page, skip-landing redirect

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S14.1 | Skip landing for returning visitors (P2) | First visit to `/`: show landing, set `localStorage.setItem('marko_seen_landing', 'true')`. Subsequent visits: redirect to `/editor` (check in `app/page.tsx` or middleware). Logo click: `?home=true` bypasses redirect. Private browsing shows landing again | Small |
| S14.2 | Settings page (P3) | Create `/settings` with 3 sections: Editing (default direction, auto-save), Appearance (default theme, dark/light mode, font size), Account (email/name from Clerk, subscription status, AI usage). Storage: localStorage for anonymous, Convex `userSettings` for logged-in. Settings via React context. Access from user menu "הגדרות" | Medium |
| S14.3 | Contact & bug report pages (P3) | `/contact`: name, email, message form → GitHub Issue with `contact` label via GitHub API. `/report-bug`: structured form (description, steps, expected, screenshot upload) + auto-collected metadata (browser, OS, screen, URL, theme) → GitHub Issue with `bug` label. Both: `GITHUB_TOKEN` env var, success toast, accessible from user menu | Medium |

---

#### E15: Document Management
**Source:** N3
**Priority:** P3
**Scope:** Collapsible sidebar, auto-save, document list, Convex backend

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S15.1 | Document sidebar UI | Collapsible sidebar (260px), hidden by default. Toggle via `Ctrl+\` or header icon. RTL: appears on right side. Slide in/out animation. Doc list rows: title (from H1), preview snippet (~60 chars), relative date, pin icon. Search bar with instant filtering. Right-click context menu: Pin, Delete, Duplicate. Delete confirmation | Medium |
| S15.2 | Auto-save & document CRUD | Auto-save with 500ms debounce. Save to IndexedDB for all users. Status indicator: "שומר..."→"נשמר ✓"→fade. New doc: cursor line 1, placeholder "התחל לכתוב...", first line = title. Previous doc auto-saved on switch. Save data: content, title, theme ID, direction, lastModified | Medium |
| S15.3 | Convex backend for documents | Schema: `documents` table (userId, content, title, themeId, direction, createdAt, updatedAt, isPinned). Mutations: saveDocument, deleteDocument, updateDocument, pinDocument. Queries: listUserDocuments (pinned→updatedAt desc), searchDocuments. Cloud sync for logged-in users | Medium |

---

#### E7 (Rewritten): Landing Page Redesign
**Source:** D7, N1, N2
**Priority:** P3 (D7, N1), BLOCKED (N2)
**Scope:** Complete landing page rebuild, Framer Motion animations, logo placeholder

**Stories:**

| Story | Title | Scope | Size |
|-------|-------|-------|------|
| S7.1r | Landing page structure & content | Warm, light-themed (emerald brand). Hero: headline (3-6 Hebrew words, right-aligned) + editor mockup. Below fold: 3-4 tabbed demos (Write/Format/AI/Export), Pitch.com lazy-load pattern. Primary CTA "התחל בחינם" (emerald, repeated 3x). Secondary "צפה בהדגמה". Returning users: CTA→"פתח את מארקו" via auth cookie. End with CTA section (no footer). Performance: <3s FCP, <5s LCP, Lighthouse 90+ | Large |
| S7.2r | Landing animations — Framer Motion | Install framer-motion, wrap with LazyMotion. Hero: editor mockup cycling through 4-5 themes every 3.5s (Framer animate, 1.2s easeInOut). Theme dots below mockup (click pauses, selects). Respect prefers-reduced-motion. Below-fold: sections fade+slide from right on scroll (whileInView). Tabbed demos lazy-load on interaction. CSS for micro-interactions (hovers, card reveals). Performance: <35KB animation JS async, 60FPS | Medium |
| S7.3r | SEO preservation | Maintain SSR, structured data (SoftwareApplication JSON-LD), Open Graph meta, Hebrew keyword targeting, sitemap.xml, robots.txt. Edge runtime for fast TTFB | Small |

**N2 (Logo):** BLOCKED — requires external design work. Creative brief is in feedback doc. Placeholder: continue using current green square until logo is designed. Not scheduled as a dev story.

---

### 2.4 Modified Existing Stories

| Story | Modification | Reason |
|-------|-------------|--------|
| **S1.4** Formatting Toolbar | Superseded by E12 (S12.1). Mark as REPLACED | U1 header reorg replaces toolbar layout |
| **S1.6** Editor Utilities | Remove direction toggle references. Direction now in overflow (S12.3) and Settings (S14.2) | U3 BiDi simplification |
| **S2.1** Color System & Panel | Superseded by E13 (S13.1, S13.2, S13.3). Mark as REPLACED | D5+U2 complete theme redesign |
| **S2.2** Built-in Presets | Superseded by E13/S13.1. Mark as REPLACED | D5: 8 curated themes replace 15 presets |
| **S2.3** Custom Preset Save | Superseded by E13/S13.3 Advanced section. Mark as REPLACED | Themes model changes preset UX |
| **S2.4** Image Color Extraction | Move to E13/S13.3 Advanced section | Still exists, just relocated |
| **S6.2** AI Actions UI | Needs revision: 4 entry points (header button, slash command, selection toolbar, Ctrl+J). Inline command bar, action chips, suggestion cards. "Gift not gate" paywall (5 free/month, partial results, toast counter) | U1 AI multi-entry design |
| **S7.1** SSR Landing Page | Superseded by E7/S7.1r. Mark as REPLACED | D7 complete redesign |
| **S7.2** Structured Data & SEO | Folded into E7/S7.3r. Mark as REPLACED | SEO preserved in rewrite |

---

## 3. Dependency Map & Critical Path

```
PHASE 1 (P0 — Foundation)
  E10/S10.1 (Root RTL + global CSS)
    └──→ E10/S10.2 (Component RTL audit)
           └──→ E10/S10.3 (RTL verification)
  E11/S11.1 (BULK pass) ←── can run parallel with E10

PHASE 2 (P0+P1 — Core Redesign)
  E12/S12.1 (Header layout) ←── depends on: E10 complete, E11/S11.1 complete
    └──→ E12/S12.2 (Header responsive)
  E11/S11.2 (Background + panel spacing)
  E13/S13.1 (Theme data model)
  D6 via E11/S11.3 (Remove footer)

PHASE 3 (P1+P2 — Enhanced UX)
  E13/S13.2 (Color panel redesign) ←── depends on E13/S13.1
    └──→ E13/S13.3 (Accent + advanced)
  E12/S12.3 (Overflow + BiDi simplification)
  E12/S12.4 (User menu + navigation)
  E11/S11.3 (Icons) — can overlap
  E14/S14.1 (Skip landing)
  S6.2 revision (AI 4 entry points) ←── depends on E12/S12.1

PHASE 4 (P3 — New Features)
  E14/S14.2 (Settings page)
  E14/S14.3 (Contact + bug report)
  E15/S15.1 (Document sidebar UI)
    └──→ E15/S15.2 (Auto-save + CRUD)
    └──→ E15/S15.3 (Convex backend)

PHASE 5 (P3 — Landing Rebuild)
  E7/S7.1r (Landing structure) ←── depends on E11, E13/S13.1 (needs themes)
    └──→ E7/S7.2r (Animations)
    └──→ E7/S7.3r (SEO)

PARALLEL TRACK (unchanged)
  WS3C: API Connections (A1–A5) — can proceed independently at any time

BLOCKED
  N2 (Logo) — external design work, not scheduled
```

**Critical path:** E10 → E11/S11.1 → E12/S12.1 → E12/S12.2 → E13/S13.2 → S6.2 revision

**Key dependency rules:**
- B2 (E10) first — it touches every component, so do it before component-specific work
- D3 (E11/S11.1) early — global CSS pass, affects all sizing/spacing decisions
- D5/S13.1 (themes) before U2/S13.2 (color panel redesign) — need theme data before building the panel
- D7/S7.1r (landing) before N1/S7.2r (animations) — need the page before animating it
- N2 (logo) is external — flag it, don't wait for it

---

## 4. Story Sizing & Split Guidance

Items flagged as too large for a single dev agent session (~1 hour):

| Item | Concern | Recommended Split |
|------|---------|-------------------|
| **B2** (RTL audit) | Massive — every component | Already split into 3 stories: S10.1 (globals), S10.2 (components), S10.3 (verification) |
| **U1** (Header reorg) | Layout + responsive + AI | Already split into 4 stories: S12.1 (layout), S12.2 (responsive), S12.3 (overflow), S12.4 (user menu) |
| **D5+U2** (themes + panel) | Data model + UI + panel | Already split into 3 stories: S13.1 (data), S13.2 (panel gallery), S13.3 (accent+advanced) |
| **N3** (Doc management) | Backend + sidebar + save | Already split into 3 stories: S15.1 (sidebar UI), S15.2 (auto-save), S15.3 (Convex backend) |
| **D7+N1** (Landing) | Full page + animations | Already split into 3 stories: S7.1r (structure), S7.2r (animations), S7.3r (SEO) |
| **D3** (BULK pass) | Global CSS change | Single story S11.1 — manageable as one pass since it's all CSS changes to globals and component files |
| **S12.1** (Header layout) | Marked Large | Largest single story. Could split further into "zones + static layout" + "interactivity + AI button glow" if needed. Monitor during implementation. |

**All stories are sized to Small or Medium except S12.1 (Large) and S7.1r (Large).** Both Large stories could be split further if dev agents struggle, but they should be attempted as-is first.

---

## 5. Updated Workstream Structure

### Proposed WS3 Restructure

```
WS1 (Design System)          = DONE
WS2 (Visual Rebuild Round 2) = DONE

WS3: Feedback Implementation (NEW — replaces old WS3A/3B)
  ├── WS3-P0: Foundation (E10 + E11/S11.1)
  │     Stories: S10.1, S10.2, S10.3, S11.1
  │     Gate: G3a — RTL + BULK verified by Hawk
  │
  ├── WS3-P1: Core Redesign (E12/S12.1-12.2 + E11/S11.2-11.3 + E13/S13.1 + D6)
  │     Stories: S12.1, S12.2, S11.2, S11.3, S13.1
  │     Gate: G3b — Header + visual polish verified by Hawk
  │
  ├── WS3-P2: Enhanced UX (E13/S13.2-13.3 + E12/S12.3-12.4 + E14/S14.1 + S6.2 revision + N7)
  │     Stories: S13.2, S13.3, S12.3, S12.4, S14.1, S6.2(rev)
  │     Gate: G3c — Theme panel + navigation + AI entry points verified
  │
  └── WS3-P3: New Features & Landing (E14/S14.2-14.3 + E15 + E7 rewrite)
        Stories: S14.2, S14.3, S15.1, S15.2, S15.3, S7.1r, S7.2r, S7.3r
        Gate: G3d — All new features + landing verified

WS3C: API Connections (PRESERVED — parallel track)
  A1: Convex, A2: Clerk, A3: Stripe, A4: Anthropic, A5: Sumit

WS4: QA Verification (UPDATED gates)
  G3a: After WS3-P0 (RTL + BULK)
  G3b: After WS3-P1 (Header + visual)
  G3c: After WS3-P2 (Theme panel + nav)
  G3d: After WS3-P3 (Features + landing)
  G4:  After WS3C (API connections)
  G5:  Pre-launch (full regression)
```

### Story Count Summary

| Workstream Phase | Stories | Effort |
|-----------------|---------|--------|
| WS3-P0 | 4 stories (S10.1, S10.2, S10.3, S11.1) | ~4 dev sessions |
| WS3-P1 | 5 stories (S12.1, S12.2, S11.2, S11.3, S13.1) | ~5 dev sessions |
| WS3-P2 | 6 stories (S13.2, S13.3, S12.3, S12.4, S14.1, S6.2 rev) | ~5 dev sessions |
| WS3-P3 | 8 stories (S14.2, S14.3, S15.1, S15.2, S15.3, S7.1r, S7.2r, S7.3r) | ~8 dev sessions |
| **Total new** | **23 stories** | **~22 dev sessions** |

Plus existing valid stories from original epics: E1 (5 remain), E3 (4), E4 (2), E5 (3), E6 (3 valid + 1 revised), E8 (3), E9 (4 Phase 2) = **24 existing stories**.

**Grand total: 47 stories** (23 new + 24 existing).

---

## 6. Design System Override Register

The design system at `_bmad-output/marko-design-system.md` remains authoritative EXCEPT for these explicit overrides from BenAkiva's feedback:

| Property | Design System Value | Override Value | Source |
|----------|-------------------|----------------|--------|
| Header height | 56px | **64px** | D2 |
| Panel border width | 1px | **2px** | D3 |
| Body font size | 1rem (16px) | **1.0625rem (17px)** | D3 |
| Button min-height (standard) | varies | **40px** | D3 |
| Button min-height (primary) | varies | **44px** | D3 |
| Touch target minimum | varies | **44×44px** | D3 |
| Accent stripe width | 3px | **4px** | D3 |
| Shadow spread | as specified | **+25%** | D3 |
| Panel internal padding (desktop) | 16px | **20px** | D3/D4 |
| Panel outer padding (desktop) | varies | **24px** | D4 |
| Panel gap (desktop) | varies | **24px** | D4 |
| Letter-spacing (Varela Round body) | default | **-0.01em** | D3 |
| Backdrop-filter blur | 12px | **16px** | D2 |
| Backdrop-filter saturate | 1.2 | **1.4** | D2 |
| Header background opacity | varies | **0.97** | D2 |
| Theme presets count | 15 | **8 curated** | D5 |

---

## 7. Implementation Handoff

**Scope classification: MAJOR** — requires workstream restructure with new epics and dependency-aware sequencing.

### Handoff Plan

| Role | Responsibility |
|------|---------------|
| **SM (this workflow)** | Produce this Sprint Change Proposal. Update master plan. Update epics document. |
| **BenAkiva (PO)** | Review and approve this proposal. Validate priority ordering. Flag any disagreements. |
| **Dev Agent** | Execute stories in phase order (P0→P1→P2→P3). Read feedback doc for each story's detailed spec. |
| **Hawk (QA)** | Verify at each gate (G3a, G3b, G3c, G3d). RTL verification is critical at G3a. |
| **External** | Logo design (N2) — BenAkiva to commission or AI-generate separately |

### Success Criteria
1. All P0 stories (E10 + E11/S11.1) complete and pass Hawk QA → Hebrew text direction correct everywhere
2. Header redesign (E12) matches the spec layout with AI as star feature
3. 8 curated themes work with one-click apply and live preview
4. All existing editor functionality (edit, preview, export, BiDi) preserved through changes
5. No visual regressions at 375px, 768px, 1024px, 1440px viewports, light+dark modes

---

## Appendix: Items NOT Changing

These original epics/stories are confirmed valid and need no modification:

- **E3** (Export): All 4 stories (S3.1–S3.4) — export works, no feedback about it
- **E4** (BiDi): Both stories (S4.1, S4.2) — BiDi engine works, U3 just moves the toggle
- **E5** (Auth): All 3 stories (S5.1–S5.3) — auth works, E12 handles menu items
- **E8** (Analytics): All 3 stories (S8.1–S8.3) — backend, untouched by UI feedback
- **E9** (Payments): All 4 stories (S9.1–S9.4) — Phase 2, not in scope yet
