# Story 7.3r: SEO Preservation

Status: review

## Story

As a search engine,
I want the redesigned landing page to maintain all SEO signals,
So that Marko continues to rank for Hebrew Markdown searches.

## Acceptance Criteria

1. **Given** the landing page, **When** crawled, **Then** JSON-LD structured data (SoftwareApplication schema) is present
2. **Given** the landing page, **When** crawled, **Then** Open Graph meta tags are set for social sharing
3. **Given** the landing page, **When** crawled, **Then** `<title>` and `<meta name="description">` target Hebrew keywords
4. **Given** `/sitemap.xml`, **When** requested, **Then** it lists all public routes
5. **Given** `/robots.txt`, **When** requested, **Then** it allows landing page crawling and blocks non-public routes
6. **Given** the landing page, **When** rendered, **Then** it uses SSR (server-side rendering) for content
7. **Given** the landing page, **When** served, **Then** edge runtime is used for fast TTFB

## Tasks / Subtasks

- [x] Task 1: Update sitemap with new public routes and dynamic lastModified (AC: #4)
  - [x] 1.1 Add `/contact` route (priority 0.5, monthly)
  - [x] 1.2 Add `/report-bug` route (priority 0.3, monthly)
  - [x] 1.3 Replace hardcoded `LAST_UPDATED = new Date("2026-03-08")` with current date or per-route dates
  - [x] 1.4 Verify `/settings`, `/subscription`, `/editor` remain excluded (app-only routes)
  - [x] 1.5 Update sitemap tests to cover new routes and lastModified logic

- [x] Task 2: Update robots.txt to disallow app-only routes (AC: #5)
  - [x] 2.1 Change `disallow` from single `/editor` string to array: `["/editor", "/settings", "/subscription"]`
  - [x] 2.2 Update robots tests to verify all disallowed routes

- [x] Task 3: Verify and enhance JSON-LD structured data (AC: #1)
  - [x] 3.1 Confirm `Seo.tsx` renders correctly after landing redesign (Stories 7.1r, 7.2r)
  - [x] 3.2 Add `screenshot` property pointing to OG image for richer snippets
  - [x] 3.3 Verify XSS escaping still works
  - [x] 3.4 Run existing Seo tests, add test for screenshot property

- [x] Task 4: Generate branded OG image (AC: #2)
  - [x] 4.1 Replace placeholder `public/og-image.png` with a branded image matching warm emerald theme
  - [x] 4.2 Image must be 1200x630px, show Marko logo/name + Hebrew tagline + warm emerald brand colors
  - [x] 4.3 Consider using Next.js `ImageResponse` (opengraph-image) for dynamic generation, or commit a static PNG

- [x] Task 5: Verify metadata and Hebrew keyword targeting (AC: #2, #3)
  - [x] 5.1 Confirm `app/layout.tsx` metadata still targets Hebrew keywords: "עורך מארקדאון", "מארקדאון בעברית", "כלי מארקדאון"
  - [x] 5.2 Verify OG metadata (title, description, image, locale, type) are correct
  - [x] 5.3 Verify Twitter Card metadata matches OG
  - [x] 5.4 Run layout metadata tests

- [x] Task 6: Verify SSR and edge runtime (AC: #6, #7)
  - [x] 6.1 Confirm `app/page.tsx` still exports `runtime = "edge"`
  - [x] 6.2 Verify `Seo` component is a Server Component (no "use client")
  - [x] 6.3 Confirm landing page HTML is server-rendered (not hydration-dependent for content)
  - [x] 6.4 Verify Framer Motion animations don't break SSR (they use `next/dynamic` with `ssr: false`)

- [x] Task 7: Lighthouse audit and final verification (AC: all)
  - [x] 7.1 Run `pnpm build` to verify no build errors (pre-existing /editor page issue; SEO files compile fine)
  - [x] 7.2 Run full test suite: `pnpm test`
  - [x] 7.3 Document Lighthouse SEO score target: 90+ on mobile

## Dev Notes

### Current State of SEO Infrastructure

All SEO infrastructure was originally built in Story 7.2 (superseded). Stories 7.1r and 7.2r preserved it during the landing redesign. This story's purpose is to **verify, update, and harden** the SEO signals after significant landing page changes.

**Existing SEO files (DO NOT recreate — update in place):**

| File | Purpose | Status |
|------|---------|--------|
| `app/sitemap.ts` | Dynamic sitemap generation | Needs update: stale date, missing new routes |
| `app/robots.ts` | Robots.txt generation | Needs update: missing disallow for new app routes |
| `components/landing/Seo.tsx` | JSON-LD structured data | Verify intact, consider screenshot property |
| `app/layout.tsx` (metadata export) | Title, description, OG, Twitter | Verify intact |
| `public/og-image.png` | Social sharing preview | Placeholder — needs real branded image |
| `lib/constants.ts` | `SITE_URL` constant | No changes needed |

**Existing tests (extend, don't replace):**

| Test File | Count | Status |
|-----------|-------|--------|
| `app/sitemap.test.ts` | 6 tests | Needs updates for new routes |
| `app/robots.test.ts` | 4 tests | Needs updates for new disallow rules |
| `components/landing/Seo.test.tsx` | 5 tests | May need new test for screenshot |
| `app/layout.test.ts` | 7 tests | Verify still passing |

### Sitemap: What Changed Since Original Story 7.2

New app routes were added by later epics that the sitemap doesn't know about:

**New PUBLIC routes to ADD to sitemap:**
- `/contact` — Contact page (E14/S14.3), crawlable, has user value
- `/report-bug` — Bug report page (E14/S14.3), crawlable, has user value

**App-only routes to EXCLUDE (never add to sitemap):**
- `/editor` — Already excluded
- `/settings` — User settings, requires auth, no SEO value
- `/subscription` — Payment flow, requires auth, no SEO value

**Date issue:** `LAST_UPDATED` is hardcoded to `2026-03-08`. Update to current date or remove in favor of per-entry dates.

### Robots.txt: Disallow Gap

Currently only disallows `/editor`. Should also disallow:
- `/settings` — auth-required, no crawl value
- `/subscription` — auth-required, no crawl value

The `disallow` field in Next.js `MetadataRoute.Robots` accepts a string or string array.

### OG Image: Placeholder Replacement

`public/og-image.png` is currently a placeholder (dark navy background). For social sharing to be effective, it needs a real branded image. Options:

1. **Static PNG** — Create a 1200x630 image with warm emerald brand, Hebrew text "מארקו — עורך מארקדאון בעברית", and a mini editor mockup screenshot
2. **Dynamic via `app/opengraph-image.tsx`** — Next.js can generate OG images at build time using `ImageResponse` from `next/og`. More maintainable but adds complexity.

Recommendation: **Static PNG** for simplicity. The warm emerald landing design is stable. Use a screenshot of the landing hero section cropped to 1200x630 with the Marko title overlaid.

### Technical Stack Reference

- **Framework:** Next.js 16.1.6 (App Router)
- **Metadata API:** `export const metadata: Metadata` in `app/layout.tsx`
- **Sitemap/Robots:** Next.js file conventions (`app/sitemap.ts`, `app/robots.ts`)
- **JSON-LD:** Manual `<script type="application/ld+json">` in `components/landing/Seo.tsx`
- **Runtime:** Edge runtime on landing page (`export const runtime = "edge"` in `app/page.tsx`)
- **Deployment:** Vercel (auto-deploy from main)
- **Testing:** Vitest for unit tests

### Hebrew Keywords to Verify in Content

Target keywords from PRD (FR49):
- "עורך מארקדאון" (Markdown editor)
- "מארקדאון בעברית" (Hebrew Markdown)
- "כלי מארקדאון" (Markdown tool)

These must appear in:
1. `<title>` tag (via layout metadata) — currently present
2. `<meta name="description">` — currently present
3. JSON-LD description — currently present
4. OG title/description — currently present
5. Landing page visible content (Hero, Features sections) — verify after redesign

### Anti-Patterns to Avoid

- **DO NOT** recreate SEO files from scratch — update existing ones
- **DO NOT** add `"use client"` to `Seo.tsx` — it must remain a Server Component
- **DO NOT** remove `export const runtime = "edge"` from `app/page.tsx`
- **DO NOT** use external SEO packages — Next.js built-in metadata API is sufficient
- **DO NOT** add `/editor`, `/settings`, or `/subscription` to the sitemap
- **DO NOT** change `SITE_URL` or its environment variable name
- **DO NOT** modify other landing components (Hero, Features, TabbedDemos, etc.) — this story is SEO-only

### Previous Story Intelligence

**From Story 7.1r (Landing Page Structure):**
- Landing page uses warm emerald theme with `landing-warm` CSS class
- Hero section with EditorMockup, TabbedDemos, CtaSection, Features
- `LandingRedirectGuard` wraps content for returning visitor redirect
- `Seo` component renders outside the guard (correct — always present for crawlers)
- Edge runtime preserved
- 953 tests passed

**From Story 7.2r (Landing Animations):**
- Framer Motion added via `MotionProvider` in `app/layout.tsx`
- `ScrollReveal` component wraps below-fold sections
- All animation components use `next/dynamic({ ssr: false })` — no SSR impact
- `m` components used (not `motion`) for tree-shaking
- `LazyMotion features={domAnimation} strict` in provider
- Noscript fallback in layout head for non-JS crawlers: `opacity: 1; transform: none`
- 958 tests passed, bundle ~22 KB

**Key insight:** Both previous stories confirmed SEO component and edge runtime are intact. The noscript CSS fallback ensures crawlers that don't execute JS still see full content.

### Project Structure Notes

All SEO files follow existing conventions:
- `app/sitemap.ts`, `app/robots.ts` — Next.js file conventions (no changes to structure)
- `components/landing/Seo.tsx` — Component in landing feature folder
- `public/og-image.png` — Static asset in public folder
- `app/layout.tsx` — Root layout with metadata export
- Tests co-located with source files

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.3r acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — SEO & Landing Page section (FR47-49)]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR47, FR48, FR49, SEO Strategy section]
- [Source: `_bmad-output/implementation-artifacts/7-1r-landing-page-structure-and-content.md` — Previous story learnings]
- [Source: `_bmad-output/implementation-artifacts/7-2r-landing-animations-framer-motion.md` — Previous story learnings]
- [Source: `app/sitemap.ts` — Current sitemap implementation]
- [Source: `app/robots.ts` — Current robots.txt implementation]
- [Source: `components/landing/Seo.tsx` — Current JSON-LD implementation]
- [Source: `app/layout.tsx:24-63` — Current metadata configuration]
- [Source: `app/page.tsx` — Landing page with edge runtime]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Build failure on `/editor` page is pre-existing (useSearchParams() Suspense boundary issue), confirmed identical with and without SEO changes
- Framer Motion uses `"use client"` on `ScrollReveal` only, wrapping server-rendered children — no SSR impact
- Noscript CSS fallback in layout head ensures non-JS crawlers see full content

### Completion Notes List
- Task 1: Updated `app/sitemap.ts` — added `/contact` (priority 0.5) and `/report-bug` (priority 0.3), replaced hardcoded `LAST_UPDATED` date with `new Date()`, verified `/editor`, `/settings`, `/subscription` excluded. Tests expanded from 6 to 10.
- Task 2: Updated `app/robots.ts` — changed `disallow` from single string `"/editor"` to array `["/editor", "/settings", "/subscription"]`. Tests expanded from 4 to 5.
- Task 3: Enhanced `components/landing/Seo.tsx` — added `screenshot` property pointing to `/opengraph-image`. Verified XSS escaping intact. Added screenshot test. Tests: 5 → 6.
- Task 4: Created `app/opengraph-image.tsx` using Next.js `ImageResponse` — 1200x630px branded image with warm emerald gradient, Hebrew title "מארקו", tagline "עורך מארקדאון בעברית", feature pills, and marko.app URL. Updated `layout.tsx` and `Seo.tsx` to reference `/opengraph-image` instead of static `/og-image.png`.
- Task 5: Verified all Hebrew keywords present in title, description, OG, Twitter, and JSON-LD. All 7 layout metadata tests pass.
- Task 6: Verified `runtime = "edge"` in page.tsx, Seo.tsx is Server Component (no "use client"), SSR intact, Framer Motion animations don't break SSR.
- Task 7: Full test suite: 964 tests pass across 91 files. Zero regressions. Lighthouse SEO target: 90+ mobile.

### File List
- `app/sitemap.ts` — Modified: added /contact, /report-bug routes; replaced hardcoded date with dynamic
- `app/sitemap.test.ts` — Modified: expanded from 6 to 10 tests covering new routes and dynamic dates
- `app/robots.ts` — Modified: disallow changed from string to array with 3 routes
- `app/robots.test.ts` — Modified: expanded from 4 to 5 tests covering all disallowed routes
- `components/landing/Seo.tsx` — Modified: added screenshot property to JSON-LD
- `components/landing/Seo.test.tsx` — Modified: added screenshot property test (5 → 6 tests)
- `app/opengraph-image.tsx` — New: dynamic OG image generation using Next.js ImageResponse
- `app/layout.tsx` — Modified: OG/Twitter image URLs updated from /og-image.png to /opengraph-image
- `app/layout.test.ts` — Modified: updated image URL assertion to match new path

### Change Log
- 2026-03-26: Story 7.3r implemented — SEO preservation after landing redesign. Updated sitemap (+2 routes, dynamic dates), robots.txt (+2 disallow rules), JSON-LD (screenshot property), OG image (dynamic generation via ImageResponse), verified all metadata and SSR/edge runtime. 964 tests pass.
