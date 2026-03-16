# BenAkiva Feedback — Round 1 (Research-Integrated)

> **Date:** 2026-03-16
> **Status:** READY FOR IMPLEMENTATION — research complete, all actions are specific and actionable
> **Context:** Feedback on current Marko editor state after WS2 Round 1. All items reference the live site at `http://localhost:3000` and `http://localhost:3000/editor`, compared against the original at `https://dartaryan.github.io/hebrew-markdown-export/`.
> **Research basis:** Deep Research benchmarking study of 40+ products across 8 areas (toolbar, RTL, themes, landing, AI, doc management, logo, animation).

---

## Design Direction Changes

Things that work as built but need design decisions changed.

---

### D1. Editor Page Background Is Flat and Boring

**What BenAkiva said:** "הרקע באתר המקורי הרבה יותר יפה" — the background behind the panels on the editor page is unappealing compared to the original.

**Interpretation:** The original site has a rich, deep emerald gradient behind the split view that makes the panels feel like they're floating on a premium surface. The current Marko editor page background is flat/plain, making the panels feel pasted on rather than elevated.

**Action:** Redesign the editor page background (`app/editor/page.tsx` / `app/globals.css`):
- Add a rich emerald gradient background: light mode `linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)`, dark mode `linear-gradient(135deg, #041F17 0%, #0B1A14 50%, #0F2A1E 100%)`
- Add subtle noise or grain texture overlay (CSS `background-image` with tiny SVG pattern, ~0.02 opacity) for depth — avoid flat solid colors
- The panels should visually "float" on this background like paper on a premium desk
- Reference: Craft.do's warm paper-textured aesthetic, but in emerald tones

---

### D2. Header Toolbar Feels Small and Inconsistent

**What BenAkiva said:** "הסרגל למעלה" is not as good as the original, feels too small. Glassmorphism is OK but icons need consistency.

**Interpretation:** The header bar height (56px) feels cramped. Icons are inconsistent in size and style — some buttons have text, some are icon-only, some are radio groups with a different visual language.

**Research finding:** Coda.io reduced to 5 persistent header buttons; Craft uses 4–6. The modern trend is fewer but bolder buttons. All successful editors use consistent icon sizing within each toolbar level.

**Action:** In `components/layout/Header.tsx`:
- Increase header height to **64px** (from 56px)
- Standardize all icon sizes: `--icon-md` (20px) for all header buttons
- All interactive elements: consistent **min-height 40px**, **padding 8px 12px**, **border-radius: 9999px** (pill shape)
- Glassmorphism: increase backdrop-filter to `blur(16px) saturate(1.4)`, background opacity to 0.97
- All header buttons use solid fills on hover (not just opacity change) — emerald-tinted hover states
- Group buttons with **8px gaps** within groups, **16px gaps** between groups, thin vertical separators between zones

---

### D3. Everything Too Thin — Marko Needs BULK

**What BenAkiva said:** "הכל דק מידי בגירסה החדשה... מארקו אמור לתת תחושה יותר BULK" — the font, buttons, borders all feel thin. The original site's readability comes from its visual weight.

**Interpretation:** The current UI uses thin borders, small buttons, and lightweight styling. Marko should feel substantial — heavier, warmer, more tactile.

**Research finding:** Craft.do and Bear achieve "warm bulk" through generous padding, rounded corners ≥12px, solid button fills, and slightly larger-than-expected font sizes. The warm-brand editors all avoid 1px borders and ghost buttons.

**Action:** Global design pass across all components:
- **Buttons:** Solid fills as default (not outlined/ghost). Min-height **40px** for standard, **44px** for primary actions. Border-radius **9999px** (pill). Padding **10px 20px** minimum
- **Borders:** Increase from 1px to **2px** on panels, cards, inputs. Use `border-color: var(--border)` not transparent
- **Font sizes:** Increase body text to **1.0625rem** (17px). Increase all UI labels by 1px. Headings stay as-is
- **Touch targets:** Minimum **44px × 44px** for all interactive elements (WCAG AAA)
- **Panel accent stripes:** Increase to **4px** from 3px
- **Shadows:** Increase shadow spread by 25% across all elevation levels. Add emerald tint to shadows
- **Spacing inside panels:** Increase internal padding to **20px** on desktop, **16px** on mobile
- **Letter-spacing:** Tighten Varela Round to **-0.01em** for body text (increases visual density/weight)

---

### D4. Panel Spacing Too Cramped

**What BenAkiva said:** "המרווחים של העמודים נראים מוזר וצפופים" — panels feel cramped against the screen edges.

**Interpretation:** The gap between the editor/preview panels and the viewport edges is too small. Should feel like floating pages with generous breathing room.

**Action:** In `app/editor/page.tsx` and `components/layout/PanelLayout.tsx`:
- **Desktop (≥1024px):** Outer padding **24px** all sides, gap between panels **24px**
- **Tablet (768–1023px):** Outer padding **16px**, gap **16px**
- **Mobile (<768px):** Outer padding **8px**, gap **8px**
- Panels get `border-radius: 24px` on desktop, `16px` on tablet, `12px` on mobile
- Exception: presentation mode = full-screen, no margins, no border-radius
- The emerald background (D1) should be visible in the gaps — this creates the "floating paper" effect

---

### D5. Color Presets Are Unprofessional — Replace with Curated Themes

**What BenAkiva said:** "אף אחד לא רוצה דף שחור או צהוב... צריך לארגן את הצבעים בצורה שהיא מקצועית וכיף"

**Interpretation:** Current 15 presets + 16 individual color pickers produce garish documents. Need curated, harmonious themes.

**Research finding:** Bear offers ~28 named themes (3 free, rest premium). Notion constrains to 10 fixed colors. VS Code's UX gold standard: arrow-key navigation with instant live preview, Enter to commit, Escape to cancel. The "theme + accent" model (pick a base theme, customize one accent color) prevents ugly results while allowing personalization.

**Action:** Complete theme system redesign in `components/theme/ColorPanel.tsx` and `lib/colors/`:

**Ship these 8 launch themes:**

| Theme | Hebrew Name | Background | Headings | Accents | Tier |
|-------|-------------|-----------|----------|---------|------|
| Green Meadow | שדה ירוק | #FAFAF5 (warm off-white) | #064E3B (forest) | #10B981 (emerald) | **Free** (default) |
| Sea of Galilee | ים כנרת | #F2F8F7 (pale aqua) | #0D4F5A (deep teal) | #14B8A6 (teal) | **Free** |
| Minimal Gray | אפור מינימלי | #FAFAFA (neutral) | #1F2937 (charcoal) | #6B7280 (gray) | **Free** |
| Old Parchment | קלף ישן | #F5ECD7 (warm sepia) | #78350F (brown) | #D97706 (amber) | Premium |
| Negev Night | לילה בנגב | #1A1B2E (deep night) | #FCD34D (gold) | #F59E0B (warm amber) | Premium |
| Soft Rose | ורד רך | #FFF5F0 (blush) | #9F1239 (deep rose) | #F43F5E (rose) | Premium |
| Lavender Dream | חלום לבנדר | #F5F3FF (pale violet) | #5B21B6 (deep purple) | #8B5CF6 (violet) | Premium |
| Ocean Deep | עומק האוקיינוס | #EFF6FF (ice blue) | #1E3A5F (navy) | #3B82F6 (blue) | Premium |

**Theme panel UX:**
- Present themes in a **2-column scrollable grid** of visual cards
- Each card shows a **mini Hebrew document mockup** rendered in the theme's colors (heading + paragraph + code block)
- One-click to apply. VS Code-style: arrow keys to preview instantly, Enter to commit, Escape to cancel
- Premium themes show a subtle lock icon + "Premium" badge, not blocked — show a preview, upsell on apply
- Below the theme grid: **"התאמה אישית"** (Customize) expandable section
  - One accent color picker (HSL wheel) — system auto-generates complementary tints/shades
  - Live **WCAG contrast ratio** indicator (minimum 4.5:1 for body text, warn if violated)
- Power users: **"מתקדם"** (Advanced) toggle reveals individual color overrides (the 16 current pickers)
- Remove the image color extractor from default view — move to Advanced section

---

### D6. Footer — Remove Entirely

**What BenAkiva said:** "אני גם שונא את הFOOTER"

**Action:**
- Delete `components/layout/Footer.tsx`
- Remove all footer references from `app/editor/page.tsx` and any layout files
- No footer on editor page
- Landing page: no footer either — end with a final CTA section instead

---

### D7. Landing Page — Complete Redesign

**What BenAkiva said:** "עמוד הכניסה משעמם וגנרי"

**Research finding:** Craft.do is Marko's closest analog — warm paper-textured aesthetic, freemium, CTA "Try Craft Free." Pitch.com's tabbed video demonstrations (4 workflow tabs, lazy-loaded videos on interaction) is the best product-showcase pattern. The universal CTA pattern: primary button says "Start for Free" with the word "free" explicitly in the CTA.

**Action:** Complete redesign of `components/landing/` — see detailed spec below in combined items. Key principles:
- **Warm, light-themed** (not dark — matching emerald brand)
- Hero: headline (3–6 Hebrew words, right-aligned) + animated editor mockup
- Below fold: **3–4 tabbed demos** (Write | Format | AI | Export) — lazy-loaded, Pitch.com pattern
- Primary CTA: **"התחל בחינם"** (Start for Free) — emerald green, repeated hero + mid-page + bottom
- Secondary CTA: **"צפה בהדגמה"** (Watch Demo)
- Returning users: CTA changes to **"פתח את מארקו"** (Open Marko) via auth cookie detection
- Performance targets: <3s FCP, <5s LCP, all below-fold media lazy-loaded, Lighthouse 90+ mobile

---

## Bugs & Broken Things

Things that should work but don't.

---

### B1. Color Panel Opens from Wrong Side (RTL)

**What BenAkiva said:** "התפריט שקשור לעיצוב המסמך נפתח בכיוון ההפוך בצורה שלא מתאימה לעברית"

**Research finding:** Material Design, Apple HIG, and all Israeli products (Elementor, Wix) confirm: in RTL mode, primary sidebars/panels open from the **right** side (the "start" side). The close (X) button moves to the **top-left** of panels/modals.

**Action:** In `components/theme/ColorPanel.tsx`:
- Change Sheet `side` prop to `"right"`
- Move close (X) button to **top-left** of the panel
- Verify all panel content is RTL-aligned internally
- Panel width: **320px** (current is fine)

---

### B2. RTL Text Alignment Bugs Throughout

**What BenAkiva said:** "יש המון טקסטים שאני רואה הטקסט מיושר לשמאל ולא לימין"

**Research finding:** Even Israeli-built products (monday.com) struggle with RTL. The solution is to use **CSS Logical Properties exclusively** and set `<html dir="rtl" lang="he">` at the root. Code content is always LTR. Modal primary action buttons go on the **left** in RTL (mirror of LTR convention).

**Action:** Full RTL audit — this is a P0 task:

**Root level:**
- Ensure `<html dir="rtl" lang="he">` is set in `app/layout.tsx`

**CSS rules (replace throughout `app/globals.css` and all component files):**
- Replace ALL `text-align: left` → `text-align: start`
- Replace ALL `text-align: right` → `text-align: end`
- Replace ALL `margin-left` → `margin-inline-start`
- Replace ALL `margin-right` → `margin-inline-end`
- Replace ALL `padding-left` → `padding-inline-start`
- Replace ALL `padding-right` → `padding-inline-end`
- Replace ALL `left:` → `inset-inline-start:` (in positioning contexts)
- Replace ALL `right:` → `inset-inline-end:` (in positioning contexts)
- Replace ALL `border-left` → `border-inline-start`
- Replace ALL `border-right` → `border-inline-end`

**Icon mirroring rules:**
- **Mirror these** (add `transform: scaleX(-1)` in RTL): back/forward arrows, text alignment icons, indent/outdent, undo/redo, send/reply, external link, sidebar toggle
- **Never mirror these**: close (X), bold/italic/underline, star, search, code symbols, settings gear, plus/add, trash, color picker, media playback, the Marko logo

**Code content exception:**
- Inline code, code blocks, URLs, hex values, keyboard shortcuts, file paths → always `direction: ltr; text-align: left`
- Code blocks: `unicode-bidi: embed` to prevent Hebrew contamination

**Modal/dialog buttons:**
- Primary action (Save/OK) → **left** side
- Secondary action (Cancel) → **right** side
- Close (X) → **top-left** corner

**Form inputs:**
- Inputs expecting LTR content (email, URL, hex color) → `direction: ltr; text-align: match-parent`
- User text fields → `dir="auto"` for automatic direction detection
- Numbers always render LTR

**Components to audit specifically:**
- `components/theme/ColorPanel.tsx` — labels, hex inputs
- `components/export/ExportModal.tsx` — button placement, text alignment
- `components/editor/ToolbarDropdown.tsx` — menu items
- `components/ai/AiCommandPalette.tsx` — suggestions, results
- `components/landing/` — all text blocks
- `components/auth/` — forms, buttons
- All tooltips

---

## New Features / Behaviors

Things that don't exist yet but should be added.

---

### N1. Landing Page Animations — Framer Motion Theme Cycling

**What BenAkiva said:** "אני שוקל להכניס אנימציות של remotion... כמו שטוענים לוגו וזה מראה את המסמך בכל מיני צבעים בPREVIEW"

**Research finding:** Framer Motion with LazyMotion wins decisively — **4.6 KB initial** load (+17 KB async), best React DX, smooth color interpolation, excellent Next.js SSR compatibility. Remotion is the wrong tool (designed for video generation, 100–200+ KB, licensing issues). CSS handles micro-interactions; Framer Motion handles orchestrated animations.

**Action:**

**Animation architecture:**
- Install `framer-motion` (if not already present)
- In `app/layout.tsx`: wrap with `<LazyMotion features={domAnimation} strict>` — use `m` components, not `motion`
- CSS/Tailwind for all **micro-interactions**: button hovers, card reveals, color transitions (zero JS cost, GPU-accelerated)
- Framer Motion for **orchestrated animations**: hero theme-cycling, scroll-triggered section reveals

**Hero section animation:**
- Build a Marko editor mockup as a React component with Tailwind classes
- The mockup shows a mini Hebrew document (heading + paragraph + blockquote + code block)
- Every **3.5 seconds**, the mockup smoothly transitions to a different color theme (cycle through 4–5 themes)
- Use Framer Motion `animate` prop with CSS custom properties: `transition: { duration: 1.2, ease: "easeInOut" }`
- **Theme dots** below the mockup (like carousel indicators) — clicking a dot pauses auto-cycling and selects that theme
- Respect `prefers-reduced-motion`: disable auto-cycling, show static mockup

**Below-fold animations:**
- Sections fade in + slide from right (RTL-aware) on scroll using `whileInView`
- Wrap below-fold animation sections with `next/dynamic({ ssr: false })` to avoid hydration cost
- Tabbed demo sections (Write | Format | AI | Export): lazy-load content on tab interaction, not on page load

**Performance budget:**
- <150 KB total JS gzipped on first load
- Animation JS <35 KB loaded async
- Lighthouse Performance 90+ mobile
- 60 FPS on all animations

---

### N2. Logo — "מ" with Pencil Stroke

**What BenAkiva said:** "צריך לוגו... האות מ שהסיום שלה הוא עיפרון"

**Research finding:** The "smooth taper" approach works best — the right vertical stroke of מ gradually narrows into a pencil point below the baseline. No hard break. Rounded corners match Varela Round. At 16px, reduce to essential silhouette with pointed bottom-right. Use pencil (warm, modern) not fountain pen nib (formal, old).

**Action — Creative brief for logo design:**

**Concept:** Hebrew letter "מ" (Mem) in block/square form. The rightmost vertical stroke gradually tapers from its normal width into a pencil tip below the baseline. Continuous smooth transition — no hard geometric break. Corners rounded to match pill-button UI aesthetic.

**Detail levels:**
| Size | Context | Detail |
|------|---------|--------|
| **16px** | Favicon | Solid emerald silhouette of מ with pointed bottom-right terminus only. No ferrule, no detail. The triangular tip reads as "pencil" |
| **32px** | Header icon | Visible taper, single ferrule line near tip in darker green |
| **64px** | App icon | Full taper visible, ferrule band, optional thin writing line extending from tip |
| **128px+** | Landing page | Full detail — ferrule band (#059669), optional gradient depth, subtle writing line in progress |

**Color variants (all deliverables):**
1. **Full color:** #10B981 body, #059669 tip/ferrule — primary use
2. **Light-bg mono:** #1F2937 — for light backgrounds where green doesn't contrast
3. **Dark-bg full color:** #34D399 on dark backgrounds
4. **Inverted:** White mark in emerald rounded square — for social avatars, app stores

**Wordmark:** "Marko" (or "מארקו") in Varela Round, positioned to the left of the mark in RTL layout (mark on right side).

**Rules:**
- Never mirror the logo in RTL contexts
- Never add markdown syntax symbols (#, *) — they're technical, not emotional
- Design at 16px first, then scale up
- Logo must work on emerald gradient backgrounds (the header)

**Implementation:**
- Create as clean SVG (hand-drawn or AI-generated concept → vectorized)
- Replace current green square in `components/layout/Header.tsx`
- Update `app/favicon.ico` and `app/icon.png`
- Add to landing page hero section

---

### N3. Document Management for Registered Users

**What BenAkiva said:** "לשמור מסמכים בDATABASE... תפריט נפתח"

**Research finding:** Simplenote's two-pane + first-line-as-title + auto-save is the minimum viable approach. Bear refines it with tags. All 7 analyzed products use auto-save (none have a manual save button). First-line-as-title works naturally with Markdown's `# heading` syntax. Tags are the lightweight organization mechanism.

**Action:**

**UI pattern: Collapsible sidebar panel (260px)**
- Hidden by default to maximize editor space
- Toggle via keyboard shortcut (`Ctrl+\`) or icon button in header
- In RTL mode: sidebar appears on the **right side**
- Slides in/out with Framer Motion animation

**Document list row:**
- **Title** (bold) — extracted from first H1 heading, or first line, or "מסמך חדש"
- **Preview snippet** (~60 chars, markdown stripped) — muted text below title
- **Relative date** — "היום", "אתמול", "לפני 3 ימים"
- **Pin icon** (optional) — pinned docs float to top

**Save behavior:**
- **Auto-save with 500ms debounce** after last keystroke
- Save to IndexedDB locally for all users
- Cloud sync to Convex for logged-in users
- Status indicator: "שומר..." → "נשמר ✓" → fades after 2s
- Save data: content, title (extracted), color theme ID, direction setting, last modified timestamp

**New document:**
- Opens immediately with cursor at line 1
- Placeholder: "התחל לכתוב..." in muted text
- First line becomes the title automatically
- Previous document auto-saved before switching

**Search:**
- Search bar at top of sidebar
- Instant full-text filtering with match highlighting
- Searches title + content

**Actions per document:**
- Click to open
- Right-click or swipe for context menu: Pin, Delete, Duplicate
- Delete requires confirmation ("למחוק את '...'?")

**Backend (Convex):**
- Wire up existing Convex setup (already in codebase but not connected)
- Schema: `documents` table with: `userId`, `content`, `title`, `themeId`, `direction`, `createdAt`, `updatedAt`, `isPinned`
- Mutations: `saveDocument`, `deleteDocument`, `updateDocument`, `pinDocument`
- Queries: `listUserDocuments` (sorted by pinned → updatedAt desc), `searchDocuments`

**v1.0 scope (minimum viable):** Auto-save, document list, title/snippet/date metadata, new/delete/pin, search, RTL layout.
**v1.5 (later):** Tags, cloud sync indicator, word count, templates, export history.

---

### N4. Skip Landing Page for Returning Visitors

**What BenAkiva said:** "שזה מופיע רק בפעם הראשונה שנכנסים לאתר"

**Research finding:** All analyzed products (Craft, Linear, Superhuman) use auth cookies to detect returning users. The CTA swaps from "Sign up" to "Open app." No product uses client-side personalization on the landing page itself.

**Action:**
- On first visit to `/`: show landing page, set `localStorage.setItem('marko_seen_landing', 'true')`
- On subsequent visits to `/`: check flag in `app/page.tsx` before render → `redirect('/editor')`
- Use `useEffect` + `router.push` for client-side, or middleware for server-side redirect
- **Logo click** in header: always navigates to `/` and temporarily bypasses the redirect (add `?home=true` query param)
- Clearing localStorage (or private browsing) shows landing page again — this is fine

---

### N5. Settings Page

**What BenAkiva said:** "צריך עמוד של הגדרות אישיות"

**Action:** Create `/settings` page:

**Sections:**
1. **עריכה** (Editing)
   - Default text direction: BiDi (auto) | RTL | LTR — radio group, default BiDi
   - Auto-save: on/off (default on)

2. **מראה** (Appearance)
   - Default color theme — theme picker (same grid as color panel)
   - Dark/light mode preference — System | Light | Dark
   - Font size: Small | Medium | Large (affects editor + preview)

3. **חשבון** (Account) — only for logged-in users
   - Email, name (from Clerk)
   - Subscription status (free/premium)
   - Usage: "3 of 5 AI actions used this month"

**Storage:**
- Anonymous users: localStorage
- Logged-in users: Convex `userSettings` table, synced on login
- Settings load on app init, applied globally via React context

**Access:** From user menu dropdown in header → "הגדרות"

---

### N6. Contact & Bug Report — GitHub Issues Integration

**What BenAkiva said:** "צור קשר, דיווח על בעיה או באג... אפשר שזה ייצר גיטהאב אישיוז"

**Action:**

**Contact page (`/contact`):**
- Simple form: name, email, message (all required)
- Submit creates a GitHub Issue with label `contact` via GitHub API
- Success toast: "ההודעה נשלחה בהצלחה ✓"

**Bug report page (`/report-bug`):**
- Structured form:
  - תיאור הבעיה (Description) — textarea, required
  - צעדים לשחזור (Steps to reproduce) — textarea, optional
  - מה ציפית שיקרה (Expected) — text, optional
  - צילום מסך (Screenshot) — file upload, optional (upload to GitHub issue as attachment)
- **Auto-collected metadata** (not shown to user, attached to issue): browser, OS, screen size, current URL, dark/light mode, current theme, editor content length (not content itself)
- Submit creates a GitHub Issue with label `bug` and structured markdown body
- GitHub API: use personal access token stored as env var `GITHUB_TOKEN`, create issues via `POST /repos/{owner}/{repo}/issues`

**Both accessible from:** User menu dropdown → "צור קשר" / "דווח על בעיה"

**Periodic issue check (future enhancement):**
- GitHub Action on a cron schedule that checks for new issues with specific labels
- Sends notification (email, Slack, or Telegram) to BenAkiva

---

### N7. More Icons — Warmer, More Playful UI

**What BenAkiva said:** "חסרים לי אייקונים! במארקו אין אייקונים בכלל... באתר הישן זה היה יותר חמוד וכיף"

**Research finding:** All successful editors use icon-only for floating/inline toolbars, **icon+text for menus and sidebars**. The original hebrew-markdown-export had icon+text buttons ("ייצוא", "העתק") which felt warmer. Consider Phosphor Icons duotone style for a warmer feel than lucide-react's thin strokes.

**Action:**
- **Header buttons:** Icon + text labels on desktop (e.g., `📤 ייצוא`, `📋 העתק`). Icon-only on mobile
- **Color panel:** Icons next to section headers (🎨 for themes, 🖌 for customize, 🖼 for image extractor)
- **Landing page feature cards:** Larger icons (32px, `--icon-xl`), more expressive
- **User menu items:** Icon + text for every item (⚙ הגדרות, 📞 צור קשר, 🐛 דווח על בעיה)
- **Dropdown menus:** All items get an icon on the right side (RTL start)
- **Minimum icon size:** `--icon-md` (20px) for all interactive elements
- **Icon style decision:** Evaluate **Phosphor Icons** (duotone variant) vs lucide-react. Phosphor's duotone has a two-tone fill that feels warmer and more playful — better match for Marko's brand. If switching, do it globally in one pass.

---

## UX Flow Changes

How things should behave differently.

---

### U1. Header Button Reorganization — Research-Backed Architecture

**What BenAkiva said:** "אין סדר הגיוני... הכפתור של AI הוא ממש לא במיקום הנכון... צריך תכנון עסקי ולוגיקה"

**Research finding:** Coda reduced to 5 header buttons. Notion uses 0 persistent toolbar buttons (everything via floating toolbar + slash commands). Cursor pioneered multi-layer AI entry (Tab → Cmd+K → Cmd+L → Cmd+I). The "star feature" in every analyzed product gets either a distinct color, larger size, or prime position — never buried among other buttons.

**Action:** Reorganize the header with this exact layout (RTL, right-to-left):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ RIGHT                          CENTER                              LEFT     │
│ [🖊מארקו] [עורך|שניהם|תצוגה]  ·  [✨ עוזר AI]  ·  [📤ייצוא▾][📋העתק▾]  ·  [🎨][🌓]  [···]  [👤] │
│  brand      view modes          STAR FEATURE      output actions     tools  overflow user │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Zone breakdown (right-to-left in RTL):**

| Zone | Contents | Size | Style |
|------|----------|------|-------|
| **Brand** (far right) | Logo (מ-pencil mark) + "מארקו" text | Logo 32px, text `--text-h4` | Always visible. Click → landing page |
| **View modes** | Editor / שניהם / תצוגה — 3-way toggle | 40px height | Pill-shaped radio group, emerald active state |
| **AI (star)** | "✨ עוזר AI" | **44px height, 36px font area** | **Emerald gradient fill**, sparkles icon, pill shape, subtle animated border glow. Visually the largest and most distinct button. On hover: glow intensifies |
| **Output** | "📤 ייצוא ▾" dropdown, "📋 העתק ▾" dropdown | 40px height | Icon + text, solid subtle fill on hover |
| **Tools** | 🎨 Color theme, 🌓 Dark/light toggle | 40px × 40px | Icon-only buttons, consistent sizing |
| **Overflow** | "···" button → dropdown with: Sample doc, Clear editor, Presentation mode, Direction override | 40px × 40px | Three dots. Hides infrequently used actions |
| **User** (far left) | Avatar/login → dropdown with: Documents, Settings, Contact, Bug Report, Sign Out | 40px × 40px | Avatar circle or "התחבר" text link |

**Removed from main header:**
- **Direction toggle** (BiDi/RTL/LTR) → moved to overflow menu AND Settings page. Default: BiDi auto-detect
- **Clear/Trash button** → moved to overflow menu
- **Presentation mode** → moved to overflow menu (or into export dropdown as "הצג כמצגת")
- **Sample document** → moved to overflow menu

**AI button — 4 entry points (Cursor-inspired multi-layer):**
1. **Header button** (always visible, most prominent) — opens AI command palette
2. **Slash command** `/ai` or `/בינה` in the editor textarea
3. **Sparkle button** in floating text-selection toolbar (appears when user selects text)
4. **Keyboard shortcut** `Ctrl+J` (or `Cmd+J` on Mac)

**AI interaction flow:**
- Activation → inline command bar drops down from header or appears above selection
- Shows action chips: `סכם` | `תרגם` | `צור תרשים` | `הרחב` | `שכתב` | free-text input
- Results appear **inline** as suggestion cards with gradient left-border (in RTL), Accept/Discard buttons, regenerate option
- Never a full-screen modal — keep user in editing context

**AI paywall (Grammarly "gift, not gate" pattern — proven +22% conversion):**
- **5 free AI actions per month** (generous enough to create a "wow" moment)
- No lock icons — show partial results for premium features (first sentence of summary visible, rest blurred)
- After each use: subtle toast "✨ פעולת AI 3 מתוך 5 החודש"
- When limit reached: friendly upsell "רוצה עוד? שדרג לפרימיום" — not blocking, not angry
- Translate (Hebrew↔English, Hebrew↔Arabic) gets special prominence — it's the killer differentiator

**Responsive behavior:**
- **≥1440px:** Full layout as above
- **1024–1439px:** Collapse Export/Copy into single "📤 ▾" dropdown. Tools zone becomes icon-only
- **768–1023px:** Brand + AI + single output dropdown + overflow + user. View toggle moves into overflow
- **<768px:** Brand (logo only) + AI button + overflow + user. View toggle above editor panels (not in header). Bottom toolbar strip above keyboard for formatting.

---

### U2. Color Panel — Full Redesign

**What BenAkiva said:** Combined feedback about panel direction, organization, and missing icons.

**Research finding:** VS Code arrow-key theme preview is the gold standard. Bear's instant-live-preview on click is the minimum bar. The "theme + accent" model prevents ugly results while allowing personalization.

**Action:** Complete redesign of `components/theme/ColorPanel.tsx`:

1. **Direction:** Opens from the **right** side (RTL-correct). Close (X) at **top-left**
2. **Header:** "🎨 ערכות נושא" (Themes) — h4, bold, icon + text
3. **Theme gallery:** 2-column grid of visual cards (see D5 for the 8 themes). Each card ~140px wide, shows mini Hebrew document mockup in theme colors. Click to apply instantly. Premium themes: subtle lock badge, preview works, upsell on apply
4. **Accent customizer:** Below theme grid. "🖌 התאמה אישית" section. HSL color wheel for accent color. System auto-generates complementary tints. Live WCAG contrast indicator
5. **Advanced toggle:** "מתקדם ▾" expands to reveal individual color overrides (16 pickers). Hidden by default. Image color extractor moved here
6. **Reset button:** "↩ חזור לברירת מחדל" at bottom
7. All text right-aligned, all labels in Hebrew, all inputs with proper RTL handling (hex inputs are LTR with `dir="ltr"`)

---

### U3. BiDi Simplification

**What BenAkiva said:** "לא ברור למה צריך גם בידי וגם יישור... ברירת מחדש בידי"

**Action:**
- **Remove** `DirectionToggle` component from the header entirely
- **Default behavior:** BiDi auto-detect (the smart feature, already implemented)
- **Override option 1:** In the overflow menu ("···"), add a "כיוון טקסט" submenu: אוטומטי ✓ | ימין לשמאל | שמאל לימין
- **Override option 2:** In Settings page (N5), under "עריכה" section
- **Editor toolbar:** Add a tiny direction indicator in the bottom-right of the editor panel showing current effective direction (e.g., "RTL" or "BiDi" in small muted text). Clicking it cycles through options.

---

### U4. Navigation — Logo Returns to Landing, User Menu Has Everything

**What BenAkiva said:** Wants logo to go back to landing, needs settings, contact, and bug report accessible.

**Action:**
- **Logo click:** Always navigates to `/` (landing page) with `?home=true` to bypass the returning-visitor redirect
- **User menu dropdown (logged in):**
  - 📄 המסמכים שלי (My Documents) → opens document sidebar
  - ⚙ הגדרות (Settings) → `/settings`
  - 📞 צור קשר (Contact) → `/contact`
  - 🐛 דווח על בעיה (Report Bug) → `/report-bug`
  - ─── (separator)
  - 🚪 התנתק (Sign Out)
- **User menu dropdown (anonymous):**
  - ⚙ הגדרות (Settings) → `/settings`
  - 📞 צור קשר (Contact) → `/contact`
  - 🐛 דווח על בעיה (Report Bug) → `/report-bug`
  - ─── (separator)
  - 🔑 התחבר (Sign In)
- **Mobile:** All navigation items move into a hamburger/drawer menu

---

## Research Summary

> The full 40+ product benchmarking study is archived separately. Key cross-cutting insights that informed every action item above:

1. **Progressive disclosure wins:** All successful editors hide 60%+ of features behind menus, slash commands, or keyboard shortcuts. Marko's current header shows too much.
2. **Hebrew RTL is an unsolved gap:** Even monday.com and Wix struggle. Marko's competitive advantage is being RTL-native from the root element down.
3. **"Gift, not gate" paywall converts +22%:** Grammarly's pattern of showing partial AI results (not blocking them) drove 100K+ new paid users and 20% revenue increase.
4. **Framer Motion is the right animation tool:** 4.6 KB initial load, best React DX, smooth theme interpolation — perfect for the landing page hero.
5. **Theme curation > Theme freedom:** Bear (28 curated themes) and Notion (10 fixed options) produce better user outcomes than VS Code's 5000+ community themes. For Marko: 8 curated themes + one accent color picker.
6. **Auto-save is universal:** No modern document tool has a manual save button. 500ms debounce is the standard.
7. **AI needs 4 entry points:** Persistent button (visible), slash command (power users), selection toolbar (contextual), keyboard shortcut (speed). One entry point is not enough.
8. **The pencil-logo works at 16px:** Simplify to pointed terminus only at favicon size. Full detail at 128px+.

---

## Priority Matrix (Impact × Effort)

| Priority | Item | Type | Impact | Effort | Notes |
|----------|------|------|--------|--------|-------|
| **P0** | B2. RTL audit (logical properties) | Bug | Critical | Medium | Affects every Hebrew user. Do first. |
| **P0** | U1. Header reorganization | UX | Critical | Medium | Fixes the core usability + AI visibility complaint |
| **P0** | D3. BULK pass (thicker/bolder everything) | Design | High | Medium | Core brand identity — affects all components |
| **P1** | B1. Color panel direction (right side) | Bug | High | Low | Quick fix — change Sheet side prop |
| **P1** | D1. Editor background gradient | Design | High | Low | CSS-only change, big visual impact |
| **P1** | D2. Header size/consistency | Design | High | Low | Tied to U1 — do together |
| **P1** | D4. Panel spacing (breathing room) | Design | Medium | Low | CSS padding changes |
| **P1** | D5. Curated color themes | Design | High | Medium | Replace 15 presets with 8 curated themes |
| **P1** | D6. Remove footer | Design | Low | Trivial | Delete component, remove references |
| **P2** | U2. Color panel full redesign | UX | High | Medium | Depends on D5 themes being defined |
| **P2** | U3. BiDi simplification | UX | Medium | Low | Remove from header, add to overflow/settings |
| **P2** | N4. Skip landing for returning visitors | Feature | Medium | Low | localStorage flag + redirect |
| **P2** | N7. More icons throughout | Feature | Medium | Medium | Global pass, possibly switch to Phosphor |
| **P3** | N5. Settings page | Feature | Medium | Medium | New page, context/storage logic |
| **P3** | U4. Navigation structure | UX | Medium | Low | User menu dropdown items |
| **P3** | N3. Document management | Feature | High | High | Requires Convex wiring, sidebar UI, auto-save |
| **P3** | N6. Contact & bug report (GitHub Issues) | Feature | Medium | Medium | New pages, GitHub API integration |
| **P3** | D7. Landing page redesign | Design | High | High | Full rewrite of landing components |
| **P3** | N1. Landing animations (Framer Motion) | Feature | Medium | Medium | Depends on D7 landing redesign |
| **P3** | N2. Logo design | Feature | High | External | Needs design work (AI gen or designer) |
