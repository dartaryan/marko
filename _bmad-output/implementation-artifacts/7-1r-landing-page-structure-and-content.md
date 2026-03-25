# Story 7.1r: Landing Page Structure & Content

Status: review

## Story

As a potential user,
I want a warm, engaging landing page that immediately shows what Marko does,
So that I'm motivated to try the editor.

## Acceptance Criteria

1. **Warm Light Theme** — Landing page uses warm, light-themed design (emerald brand, NOT the current dark gradient). Background should feel warm and inviting like Craft.do's aesthetic, not dark/moody.

2. **Hero Section** — Contains:
   - Headline: 3-6 Hebrew words, right-aligned (RTL)
   - Animated editor mockup showing a mini Hebrew document cycling through 4-5 color themes (3.5s interval, 1.2s easeInOut transition). Theme dots below for manual selection.
   - Primary CTA: "התחל בחינם" (Start for Free) — emerald green button, pill-shaped
   - Secondary CTA: "צפה בהדגמה" (Watch Demo)
   - Respects `prefers-reduced-motion`: disables auto-cycling, shows static mockup

3. **Tabbed Demos Below Fold** — 3-4 tabs (Write | Format | AI | Export) following Pitch.com pattern:
   - Content lazy-loaded on tab interaction (not on page load)
   - Each tab shows a relevant demo/screenshot/description of that capability
   - Tabs render as a responsive tab bar

4. **Repeated CTAs** — Primary CTA "התחל בחינם" appears in hero + mid-page + bottom. Page ends with a CTA section (NO footer).

5. **Smart CTA for Returning Users** — When auth cookie is detected (Clerk session), primary CTA changes to "פתח את מארקו" (Open Marko) pointing to `/editor`.

6. **Mobile Performance** — FCP < 3s, LCP < 5s on mobile. All below-fold media lazy-loaded. Target Lighthouse Performance 90+ on mobile.

7. **LandingRedirectGuard Preserved** — The existing `LandingRedirectGuard` component (S14.1) must remain functional. Do NOT modify or break the returning-visitor redirect logic.

## Tasks / Subtasks

- [x] Task 1: Redesign Hero component (AC: 1, 2)
  - [x]Replace dark gradient with warm, light-themed background (emerald tints on light base)
  - [x]Build `EditorMockup` component: mini Hebrew doc with heading + paragraph + blockquote + code block
  - [x]Implement theme cycling: rotate through 4-5 curated themes every 3.5s using CSS custom properties
  - [x]Add theme indicator dots below mockup (clickable, pauses auto-cycling)
  - [x]Add `prefers-reduced-motion` check: disable cycling, show static theme
  - [x]Update CTA to "התחל בחינם" (primary) + "צפה בהדגמה" (secondary)
  - [x]Wire smart CTA: check Clerk auth state → show "פתח את מארקו" for logged-in users

- [x] Task 2: Build tabbed demo section (AC: 3)
  - [x]Create `TabbedDemos` component with `id="demos"` anchor, 4 tabs: כתיבה | עיצוב | AI | ייצוא
  - [x]Each tab panel has a title, description, and visual demo/illustration (see tab content spec below)
  - [x]Lazy-load tab content on interaction (do NOT load all tabs on page load)
  - [x]Ensure responsive: horizontal tabs on desktop, scrollable on mobile

- [x] Task 3: Add mid-page and bottom CTA sections (AC: 4)
  - [x]Add a mid-page CTA between features and demos
  - [x]Add a final bottom CTA section replacing the footer
  - [x]All CTAs use the same smart logic (auth-aware)

- [x] Task 4: Update page.tsx and landing CSS (AC: 1, 6)
  - [x]Update `app/page.tsx` to compose new sections in correct order
  - [x]Replace `.landing-gradient` CSS with warm light-themed styles
  - [x]Add new CSS classes for landing sections in `globals.css`
  - [x]Ensure edge runtime remains (`export const runtime = "edge"`)

- [x] Task 5: Performance optimization (AC: 6)
  - [x]Verify all below-fold content is lazy-loaded
  - [x]Ensure images/illustrations use Next.js `<Image>` or are optimized
  - [x]Test FCP/LCP targets manually
  - [x]Keep JS bundle minimal — no heavy libraries in this story (Framer Motion is S7.2r)

- [x] Task 6: Write tests (AC: 1-7)
  - [x]Update Hero.test.tsx for new structure
  - [x]Update Features.test.tsx if Features changes
  - [x]Replace Demo.test.tsx with TabbedDemos tests
  - [x]Test smart CTA logic (auth/anonymous rendering)
  - [x]Test LandingRedirectGuard still works unchanged

## Dev Notes

### Critical Architecture Constraints

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript strict mode, Tailwind CSS v4.

**Edge Runtime:** `app/page.tsx` uses `export const runtime = "edge"` — this MUST be preserved. Do NOT use Node.js-only APIs in landing page components.

**RTL First:** All components must use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`). The HTML root is `dir="rtl"`.

**No Framer Motion Yet:** Story S7.2r handles Framer Motion animations. In THIS story, use CSS animations only (`@keyframes` in globals.css). The theme cycling in the editor mockup should use CSS transitions on custom properties. S7.2r will later wrap this with `<LazyMotion>` and add scroll-triggered reveals.

**No Footer:** The footer was removed in S11.3. Do NOT add a footer. End the page with a CTA section instead.

### What EXISTS vs What to BUILD

**KEEP (do not modify):**
- `LandingRedirectGuard.tsx` — working perfectly (S14.1)
- `Seo.tsx` — JSON-LD structured data (will be enhanced in S7.3r)
- `app/layout.tsx` — root layout with providers, fonts, FOUC script

**REWRITE completely:**
- `Hero.tsx` — new warm design, editor mockup, smart CTAs
- `Features.tsx` — keep the 4-card structure, adapt colors for light theme. Current grid is 3-column (`repeat(3, 1fr)`) with 4 cards (4th orphaned on row 2). Keep this layout as-is — the asymmetry is acceptable. Adjust text/icon colors for light background (dark text instead of white).
- `Demo.tsx` → replace with `TabbedDemos.tsx` (tabbed demo section). After TabbedDemos is confirmed working, DELETE `Demo.tsx` and `Demo.test.tsx` and remove the `Demo` import from `app/page.tsx`. Do this as the final cleanup task.

**ADD new:**
- `EditorMockup.tsx` — animated editor preview cycling through themes
- `TabbedDemos.tsx` — tabbed demo section (Write | Format | AI | Export)
- `CtaSection.tsx` — reusable CTA section (used mid-page and bottom)

**UPDATE:**
- `app/page.tsx` — new section composition order
- `app/globals.css` — replace dark `.landing-gradient` with warm light landing styles

### Current Landing Page Structure (to be replaced)

The current `app/page.tsx` renders:
```
LandingRedirectGuard > main.landing-gradient
  ├── Hero (dark gradient, white text, single CTA "פתחו את העורך")
  ├── Features (4-card grid on dark bg)
  └── Demo (static split editor/preview panel)
```

**New structure should be:**
```
LandingRedirectGuard > main.landing-warm
  ├── Hero (warm light bg, editor mockup with theme cycling, dual CTAs)
  ├── TabbedDemos (4 tabs: Write | Format | AI | Export, lazy-loaded)
  ├── CtaSection (mid-page CTA)
  ├── Features (feature highlights, adapted for light bg)
  └── CtaSection (bottom CTA, no footer)
```

### Theme Cycling Implementation

Import theme data from `lib/colors/themes.ts`. The `CURATED_THEMES` array has 8 themes. Use these 5 for the cycling demo (by actual ID):
- `green-meadow` (default/brand — index 0)
- `sea-of-galilee` (teal — index 1)
- `minimal-gray` (professional — index 2)
- `negev-night` (dark contrast — index 4)
- `ocean-deep` (blue/varied — index 7)

```tsx
const LANDING_THEMES = [CURATED_THEMES[0], CURATED_THEMES[1], CURATED_THEMES[2], CURATED_THEMES[4], CURATED_THEMES[7]];
```

**Cycling logic:**
1. `useState` for `activeThemeIndex` (0-based)
2. `useEffect` with `setInterval(3500)` to advance the index
3. Apply theme colors as CSS custom properties on the mockup container
4. CSS `transition: all 1.2s ease-in-out` on the mockup for smooth color changes
5. Theme dots: clicking sets index and clears interval (pauses auto-cycling)
6. `prefers-reduced-motion` media query: skip the interval, show theme 0 statically

**Mockup content (Hebrew):**
```markdown
# ברוכים הבאים
מארקו הוא עורך מארקדאון מתקדם עם תמיכה מלאה בעברית.

> ציטוט לדוגמה — כי גם ציטוטים מגיעים מימין

```code
const hello = "שלום עולם";
```
```

Render this as static HTML inside the mockup (no live markdown parsing needed).

### Smart CTA Logic

Use Clerk's auth state to determine CTA text:
```tsx
import { useAuth } from "@clerk/nextjs";

// In a client component:
const { isSignedIn } = useAuth();
// isSignedIn is undefined during SSR/initial load — default to anonymous CTA to prevent flicker
const ctaText = isSignedIn === true ? "פתח את מארקו" : "התחל בחינם";
const ctaHref = "/editor";
```

**Auth loading state — CRITICAL:** `useAuth()` returns `{ isSignedIn: undefined }` during SSR and initial hydration. Always default to the anonymous CTA ("התחל בחינם") when `isSignedIn` is `undefined` or `false`. This prevents CTA text flickering on first paint. Do NOT show a loading spinner — just use the anonymous text as fallback.

**Hero is a client component.** Mark `Hero.tsx` with `"use client"` because it needs:
1. Theme cycling (`useState`, `useEffect`, `setInterval`)
2. Auth-aware CTA (`useAuth` hook)
3. `prefers-reduced-motion` detection (`window.matchMedia`)

The `ClerkProvider` is available in the component tree (wrapped via `ConvexClientProvider` in `app/layout.tsx`), so `useAuth` will work. The existing `<Suspense fallback={null}>` wrapping `LandingRedirectGuard` in `page.tsx` is sufficient — no additional Suspense boundary needed for Hero.

### Warm Light Theme Design

**Replace the dark `.landing-gradient`** (`linear-gradient 064E3B → 10B981 → 6EE7B7`) with a warm, light background:

**Light mode landing background:**
- Warm off-white/cream base (`#FAFAF5` or `#F8FAF7`) with subtle emerald tint
- Accent: emerald gradient accents on specific elements (CTAs, borders, section dividers)
- Text: dark text (`#1F2937` or `--foreground`) on light background
- Hero: subtle radial gradient glow of emerald behind the mockup

**Dark mode landing background:**
- Keep emerald-tinted dark: `#0B1A14` base with subtle emerald gradient accents
- Text: light text (`#ecfdf5`)

**CSS implementation:** Follow existing pattern — define `.landing-warm { background: ... }` and `.dark .landing-warm { background: ... }` in globals.css, mirroring the current `.landing-gradient` / `.dark .landing-gradient` pattern.

**Header styling:** The `.marko-header` retains its current dark emerald style. Do NOT modify header styling in this story. The contrast between dark header and warm light landing is intentional.

**Key visual elements:**
- Feature cards: white/card background with subtle border and shadow (`.marko-feature-card` pattern)
- Mockup: elevated with shadow-3 or shadow-4, rounded corners (radius-2xl)
- CTA buttons: solid emerald green (`#10B981`), white text, pill shape, hover lift + glow
- Section transitions: subtle background shade changes between sections

### Design System Tokens to Use

From `globals.css` and the design system:
- `--radius-2xl: 20px` — for panels and cards
- `--radius-pill: 9999px` — for CTA buttons
- `--shadow-3`, `--shadow-4` — for elevation
- `--shadow-glow` — for CTA hover effects
- `--text-display: 2.441rem` — hero headline
- `--text-h2: 1.563rem` — section headings
- `--text-body: 1.0625rem` — body text (17px per design system override D3)
- `--space-*` — spacing scale (use existing tokens)
- `--color-emerald-*` — emerald palette for accents

### Responsive Breakpoints

From the design system:
- Desktop: > 1024px — full two-column mockup + CTAs
- Tablet: 768-1024px — stacked mockup + CTAs, 2-col features
- Mobile: < 768px — single column, touch-friendly (44x44px min tap targets)

Tabs: horizontal scroll on mobile, no wrapping. Active tab indicator should be clear.

### Performance Considerations

- **No Framer Motion** in this story — CSS only for transitions
- **Lazy-load tab content** using React `useState` to only render active tab content
- **No heavy images** — the mockup is pure HTML/CSS with theme colors
- **Edge runtime** — no Node.js APIs
- `Seo` component renders JSON-LD as a `<script>` tag — keep outside the `LandingRedirectGuard` so it renders even during redirect

### Previous Story Patterns to Follow

From S14.3 (most recent story):
- Pages use inline styles with CSS custom properties for consistency
- Forms/pages follow the `.marko-page-container` pattern from settings/contact pages
- Hebrew ARIA labels on all interactive elements
- Test files co-located with components
- Use Sonner toasts for user feedback (import from `@/components/ui/sonner`)

From S13.1 (theme system):
- Theme data lives in `lib/colors/themes.ts` as `CURATED_THEMES: Theme[]`
- Each theme has `id`, `name`, `hebrewName`, `tier`, and `colors` object with 17 properties
- Import `Theme` type from `@/types/colors`

### File Structure for New/Modified Files

```
components/landing/
  ├── Hero.tsx              ← REWRITE (warm theme, mockup, dual CTAs)
  ├── EditorMockup.tsx      ← NEW (animated theme-cycling mockup)
  ├── TabbedDemos.tsx       ← NEW (replaces Demo.tsx)
  ├── CtaSection.tsx        ← NEW (reusable mid/bottom CTA)
  ├── Features.tsx          ← UPDATE (adapt colors for light theme)
  ├── Demo.tsx              ← KEEP (may delete after TabbedDemos works)
  ├── Seo.tsx               ← KEEP UNCHANGED
  ├── LandingRedirectGuard.tsx ← KEEP UNCHANGED
  └── tests updated accordingly

app/
  ├── page.tsx              ← UPDATE (new section composition)
  └── globals.css           ← UPDATE (replace .landing-gradient, add new landing classes)
```

### Testing Requirements

**Unit tests (Vitest):**
- `Hero.test.tsx` — renders headline, CTAs, mockup container
- `EditorMockup.test.tsx` — renders mockup content, theme dots, handles click
- `TabbedDemos.test.tsx` — renders tabs, switches content on click, lazy-loads
- `CtaSection.test.tsx` — renders CTA text, smart auth detection
- `Features.test.tsx` — update if features structure changes

**Test patterns from project:**
- Use `@testing-library/react` with `render`, `screen`, `fireEvent`
- Mock Clerk's `useAuth` for smart CTA testing: use `vi.mock("@clerk/nextjs", ...)` at the top of each test file, following the pattern in `components/auth/AuthButton.test.tsx`. The existing landing `test-utils.ts` render function does NOT include provider wrappers.
- Mock `window.matchMedia` for `prefers-reduced-motion` tests
- Co-locate test files: `Hero.test.tsx` next to `Hero.tsx`

### Secondary CTA Behavior

The secondary CTA "צפה בהדגמה" (Watch Demo) should smooth-scroll to the TabbedDemos section using `id="demos"` anchor:
```tsx
<a href="#demos" style={{ scrollBehavior: "smooth" }}>צפה בהדגמה</a>
```
Or use `document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth' })`.

### Tabbed Demo Content Spec

Each tab needs a Hebrew title, 1-2 sentence description, and visual:

| Tab | Hebrew Label | Title | Description | Visual |
|-----|-------------|-------|-------------|--------|
| Write | כתיבה | כתבו מארקדאון בעברית | "עורך חכם עם תמיכה מלאה ב-RTL, זיהוי אוטומטי של כיוון טקסט, וסרגל כלים אינטואיטיבי." | Static mockup of editor with Hebrew text and toolbar |
| Format | עיצוב | עיצוב מיידי ומרשים | "ערכות עיצוב מובנות, התאמה אישית של צבעים, ומצב כהה — המסמך שלכם תמיד נראה מושלם." | Before/after comparison: raw markdown vs styled output |
| AI | AI | עזרת AI חכמה | "סיכום, תרגום, שיפור סגנון ושכתוב — ישירות מתוך העורך. AI שמבין עברית." | Simulated AI suggestion card (command bar with sample action) |
| Export | ייצוא | ייצוא לכל פורמט | "ייצאו ל-PDF, HTML או Markdown עם שמירה על העיצוב, הצבעים והכיוון." | Export format icons (PDF, HTML, MD) with a small document preview |

Visuals should be built as simple React components with Tailwind — no images. Use the same design tokens (shadows, radii, colors) as the rest of the landing page.

### Reduced Motion — Full Compliance

Add a `@media (prefers-reduced-motion: reduce)` rule in globals.css that disables ALL landing animations:
- `animate-fade-in`, `animate-slide-in`, `animate-scale-in` (existing)
- Theme cycling interval (new — handled in JS via `matchMedia` check)
- Any new CSS transitions on the landing page

The existing `globals.css` does NOT have a global reduced-motion rule for landing animations — add one.

### ArrowLeft Icon in CTA

The current Hero CTA uses `ArrowLeft` from lucide-react. In the new design, the primary CTA "התחל בחינם" should NOT have an arrow — it's a standalone pill button. The secondary CTA "צפה בהדגמה" also needs no arrow. Remove the `ArrowLeft` import from Hero.

### What NOT to Do

- Do NOT install Framer Motion (that's S7.2r)
- Do NOT modify `Seo.tsx` (that's S7.3r)
- Do NOT modify `LandingRedirectGuard.tsx` (working from S14.1)
- Do NOT add a footer (removed in S11.3)
- Do NOT use Node.js APIs in landing page components (edge runtime)
- Do NOT use physical CSS properties (`margin-left`, `padding-right`) — use logical properties
- Do NOT hardcode colors — use CSS custom properties and design tokens
- Do NOT load all tab content on page load — lazy-load on interaction
- Do NOT use `motion` from framer-motion — CSS transitions only in this story

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7 Rewritten, Story 7.1r]
- [Source: _bmad-output/benakiva-feedback-round1.md — D7 Landing Redesign, N1 Animations (architecture only)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Landing Page Architecture, SSR, Edge Runtime]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Landing Page UX, Typography, Color System]
- [Source: _bmad-output/marko-design-system.md — Design Tokens, Spacing, Shadows, Typography Scale]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md — E7 Rewrite, Design System Overrides]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Pre-existing TS errors fixed: `useRef` missing initial value in editor/page.tsx and AiSuggestionCard.tsx, `setContent` callback form mismatch in editor/page.tsx
- Pre-existing build error: /editor page Suspense boundary issue (not related to landing page)

### Completion Notes List
- Rewrote Hero.tsx: warm light theme, dual CTAs (primary "התחל בחינם" + secondary "צפה בהדגמה"), smart auth-aware CTA via Clerk useAuth, EditorMockup integration
- Created EditorMockup.tsx: animated Hebrew document preview cycling through 5 curated themes (green-meadow, sea-of-galilee, minimal-gray, negev-night, ocean-deep) at 3.5s intervals with 1.2s CSS transitions, clickable theme dots, prefers-reduced-motion support
- Created TabbedDemos.tsx: 4 tabs (כתיבה/עיצוב/AI/ייצוא) with lazy-loaded content, each tab has Hebrew title, description, and illustrative React component demo
- Created CtaSection.tsx: reusable CTA section with default and bottom variants, auth-aware smart CTA
- Updated Features.tsx: adapted colors for light theme using CSS custom properties (--landing-heading, --landing-subtext)
- Updated page.tsx: new composition order (Hero > TabbedDemos > CtaSection > Features > CtaSection bottom), replaced landing-gradient with landing-warm
- Updated globals.css: added .landing-warm class with light/dark mode support, secondary CTA styles, tab button styles, mockup glow effect, responsive styles
- Deleted Demo.tsx and Demo.test.tsx (replaced by TabbedDemos)
- All 953 tests pass across 89 test files, zero regressions
- Edge runtime preserved
- LandingRedirectGuard unchanged and functional
- Seo.tsx unchanged
- No Framer Motion used (CSS transitions only, per spec)
- No footer added

### Change Log
- 2026-03-25: Story 7.1r implementation complete — landing page redesigned with warm light theme, editor mockup, tabbed demos, smart CTAs

### File List
- components/landing/Hero.tsx — REWRITTEN (warm theme, editor mockup, smart auth CTAs)
- components/landing/EditorMockup.tsx — NEW (animated theme-cycling mockup)
- components/landing/TabbedDemos.tsx — NEW (4-tab demo section replacing Demo.tsx)
- components/landing/CtaSection.tsx — NEW (reusable mid/bottom CTA)
- components/landing/Features.tsx — UPDATED (light theme color tokens)
- components/landing/Demo.tsx — DELETED (replaced by TabbedDemos)
- components/landing/Demo.test.tsx — DELETED
- components/landing/Hero.test.tsx — REWRITTEN (auth mock, matchMedia mock, 8 tests)
- components/landing/EditorMockup.test.tsx — NEW (5 tests)
- components/landing/TabbedDemos.test.tsx — NEW (8 tests)
- components/landing/CtaSection.test.tsx — NEW (6 tests)
- app/page.tsx — UPDATED (new section composition, landing-warm class)
- app/page.test.tsx — UPDATED (Clerk mock, matchMedia mock, 6 tests)
- app/globals.css — UPDATED (landing-warm styles, secondary CTA, tab styles, mockup glow)
- app/editor/page.tsx — FIX (pre-existing TS errors: useRef initial value, setContent callback)
- components/ai/AiSuggestionCard.tsx — FIX (pre-existing TS error: useRef initial value)
