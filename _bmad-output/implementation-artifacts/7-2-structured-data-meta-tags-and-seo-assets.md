# Story 7.2: Structured Data, Meta Tags & SEO Assets

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a search engine crawler,
I want proper structured data, meta tags, sitemap, and robots.txt on the landing page,
so that Marko is correctly indexed and appears in relevant search results.

## Acceptance Criteria

1. **Given** a crawler accesses the landing page, **When** it parses the HTML, **Then** JSON-LD structured data is present using the `SoftwareApplication` schema
2. **And** Open Graph meta tags are set for social sharing (og:title, og:description, og:image, og:url, og:type)
3. **And** the page has a descriptive `<title>` and `<meta name="description">` targeting Hebrew keywords
4. **Given** a crawler accesses `/sitemap.xml`, **When** the sitemap is served, **Then** it lists all public routes (landing page, sign-in, sign-up)
5. **Given** a crawler accesses `/robots.txt`, **When** the file is served, **Then** it allows crawling of the landing page and blocks the editor route
6. **And** `sitemap.xml` and `robots.txt` are generated dynamically via Next.js route handlers

## Tasks / Subtasks

- [x] Task 1: Create `app/sitemap.ts` — dynamic sitemap generation (AC: #4, #6)
  - [x] 1.1 Create `app/sitemap.ts` exporting a `sitemap()` function returning `MetadataRoute.Sitemap`
  - [x] 1.2 Include public routes: `/` (landing), `/sign-in`, `/sign-up`
  - [x] 1.3 Exclude `/editor` from sitemap (no SEO value for app pages)
  - [x] 1.4 Set `changeFrequency` and `priority` appropriately (landing=weekly/1.0, sign-in/sign-up=monthly/0.3)
  - [x] 1.5 Use the production domain URL (configure as constant or environment variable)
- [x] Task 2: Create `app/robots.ts` — robots.txt generation (AC: #5, #6)
  - [x] 2.1 Create `app/robots.ts` exporting a `robots()` function returning `MetadataRoute.Robots`
  - [x] 2.2 Allow all crawlers for `/` (landing page)
  - [x] 2.3 Disallow `/editor` route (no SEO value for app pages)
  - [x] 2.4 Reference sitemap URL in the robots config
- [x] Task 3: Create `components/landing/Seo.tsx` — JSON-LD structured data component (AC: #1)
  - [x] 3.1 Create `components/landing/Seo.tsx` as a Server Component
  - [x] 3.2 Define `SoftwareApplication` JSON-LD schema object with Hebrew content
  - [x] 3.3 Render via `<script type="application/ld+json" dangerouslySetInnerHTML>` with XSS-safe serialization (`.replace(/</g, '\\u003c')`)
  - [x] 3.4 Include: name, description, url, applicationCategory, operatingSystem, offers (free), inLanguage (he)
  - [x] 3.5 Import and render `<Seo />` in `app/page.tsx`
- [x] Task 4: Enhance metadata in `app/layout.tsx` or `app/page.tsx` (AC: #2, #3)
  - [x] 4.1 Add `metadataBase` pointing to production domain in `app/layout.tsx`
  - [x] 4.2 Add `openGraph` config: title, description, url, siteName, locale ("he_IL"), type ("website"), images (og-image reference)
  - [x] 4.3 Add `twitter` card config: `summary_large_image`, title, description
  - [x] 4.4 Ensure `title` and `description` target Hebrew keywords: "עורך מארקדאון", "מארקדאון בעברית", "כלי מארקדאון"
  - [x] 4.5 Set `title.template` in layout for child pages: `%s | מארקו`
- [x] Task 5: Create or reference OG image (AC: #2)
  - [x] 5.1 Create a placeholder `public/og-image.png` (1200x630) or use Next.js `opengraph-image.tsx` for dynamic generation
  - [x] 5.2 Reference the image in Open Graph metadata
- [x] Task 6: Tests (AC: all)
  - [x] 6.1 Unit test for `app/sitemap.ts` — verify it returns correct routes, excludes `/editor`
  - [x] 6.2 Unit test for `app/robots.ts` — verify allow/disallow rules and sitemap reference
  - [x] 6.3 Unit test for `Seo.tsx` — verify JSON-LD output contains required schema fields
  - [x] 6.4 Test that Hebrew keywords appear in metadata (title, description)
  - [x] 6.5 Test JSON-LD XSS safety (no unescaped `<` in output)

## Dev Notes

### Architecture Patterns & Constraints

- **Next.js version:** 16.1.6 — uses App Router with file-based route conventions
- **Sitemap/Robots:** Use Next.js built-in file conventions (`app/sitemap.ts`, `app/robots.ts`) — NOT custom API routes. These are special Route Handlers cached by default
- **JSON-LD:** No built-in Next.js API — render `<script type="application/ld+json">` directly in Server Component JSX
- **Metadata:** Use static `metadata` export (not `generateMetadata`) since all content is fixed
- **Server Components only:** All SEO files and components must be Server Components — no "use client" directive
- **No Convex dependency:** SEO infrastructure is purely static/SSR — must NOT import ConvexClientProvider or any Convex hooks
- **No authentication dependency:** These are public assets, no Clerk hooks or auth gates needed

### Component Architecture

```
app/
├── sitemap.ts                    -- NEW: Dynamic sitemap (Next.js convention)
├── robots.ts                     -- NEW: Robots.txt (Next.js convention)
├── layout.tsx                    -- MODIFY: Add metadataBase, openGraph, twitter card
├── page.tsx                      -- MODIFY: Import and render <Seo /> component
│
components/landing/
└── Seo.tsx                       -- NEW: JSON-LD structured data component
│
public/
└── og-image.png                  -- NEW: Open Graph social preview image (1200x630)
```

### Next.js 16.x Sitemap API

```ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://marko.app',           // Use actual production domain
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // ... more routes
  ]
}
```

**Return type `MetadataRoute.Sitemap`:** Array of objects with `url`, `lastModified?`, `changeFrequency?`, `priority?`, `alternates?`, `images?`.

### Next.js 16.x Robots API

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/editor',
    },
    sitemap: 'https://marko.app/sitemap.xml',
  }
}
```

**Return type `MetadataRoute.Robots`:** Object with `rules` (single or array), `sitemap?`, `host?`.

### JSON-LD Implementation

```tsx
// components/landing/Seo.tsx
export function Seo() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'מארקו',
    description: 'עורך מארקדאון עברי עם תמיכה מלאה ב-RTL וייצוא מעוצב',
    url: 'https://marko.app',
    applicationCategory: 'Multimedia',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' },
    inLanguage: 'he',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
```

**XSS safety:** The `.replace(/</g, '\\u003c')` prevents injection attacks — this is the Next.js recommended pattern.

### Metadata Enhancement

Current `app/layout.tsx` metadata:
```ts
export const metadata: Metadata = {
  title: "מארקו - עורך מארקדאון עברי",
  description: "עורך מארקדאון עברי עם תמיכה מלאה ב-RTL וייצוא מעוצב",
};
```

Must be enhanced to include:
- `metadataBase`: `new URL('https://marko.app')` — allows relative image URLs
- `title.template`: `'%s | מארקו'` with `title.default` for child pages
- `openGraph`: title, description, url, siteName, locale, type, images
- `twitter`: card type, title, description, images
- Hebrew keywords in title/description: "עורך מארקדאון", "מארקדאון בעברית", "כלי מארקדאון"

**Metadata merging:** In Next.js, `openGraph` defined in layout is inherited by child pages unless overridden. Merging is shallow — if a child defines `openGraph`, it replaces the parent's entirely.

### Production Domain

The actual production domain may not be finalized yet. Use a configurable constant or environment variable:
```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marko.app';
```
This allows easy updating without code changes.

### OG Image Requirements

- **Dimensions:** 1200 x 630 pixels (standard Open Graph)
- **Content:** Should include the Marko logo/branding, Hebrew text, and a visual representation of the tool
- **Format:** PNG for quality
- **Location:** `public/og-image.png` — referenced via `metadataBase` as `/og-image.png`
- **Alternative:** Next.js supports `opengraph-image.tsx` for dynamic OG image generation — could be used instead

### Routes for Sitemap

Based on current `app/` structure:
| Route | Include in Sitemap | Priority | Change Frequency |
|---|---|---|---|
| `/` (landing page) | Yes | 1.0 | weekly |
| `/sign-in` | Yes | 0.3 | monthly |
| `/sign-up` | Yes | 0.3 | monthly |
| `/editor` | **No** — app page, no SEO value | - | - |

### RTL/Hebrew Considerations

- All metadata text (title, description, OG tags) in Hebrew
- `locale` for Open Graph: `"he_IL"`
- Technical terms (Markdown, RTL, PDF, HTML) can remain in English within Hebrew text
- JSON-LD `inLanguage` field: `"he"`
- ARIA labels in Hebrew for any interactive elements (unlikely in SEO components, but note for future)

### What NOT To Do

- Do NOT use `generateMetadata` — static `metadata` export is sufficient for fixed content
- Do NOT create custom API routes for sitemap/robots — use Next.js file conventions (`app/sitemap.ts`, `app/robots.ts`)
- Do NOT add "use client" to any SEO-related files
- Do NOT import Convex or Clerk in SEO files
- Do NOT use `next/script` for JSON-LD — use plain `<script>` tag in Server Component
- Do NOT hardcode the production URL everywhere — use a single constant/env var
- Do NOT include `/editor` in sitemap or allow it in robots.txt
- Do NOT install `schema-dts` unless you specifically need TypeScript type-checking for JSON-LD (plain objects work fine)

### Testing Approach

- **Sitemap test:** Import `sitemap()` function, assert it returns expected routes with correct properties, assert `/editor` is not included
- **Robots test:** Import `robots()` function, assert rules include allow `/`, disallow `/editor`, assert sitemap URL is set
- **Seo.tsx test:** Render component, parse JSON-LD from script tag, assert all required schema fields present
- **Metadata test:** Import `metadata` from layout.tsx, assert `openGraph` fields, assert Hebrew keywords in title/description
- **Co-locate tests:** `app/sitemap.test.ts`, `app/robots.test.ts`, `components/landing/Seo.test.tsx`

### Project Structure Notes

- Alignment: All file locations match the architecture spec exactly (`app/sitemap.ts`, `app/robots.ts`, `components/landing/Seo.tsx`)
- The `components/landing/` directory should already exist from Story 7.1 (Hero.tsx, Features.tsx, Demo.tsx). If not, create it
- Test files co-located with source (`.test.ts` / `.test.tsx` next to component files)
- Clean up default Next.js public assets if not used (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — but only if Story 7.1 didn't already handle this

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 7, Story 7.2 (lines 878-899)]
- [Source: _bmad-output/planning-artifacts/architecture.md - File Structure (lines 595-649), FR47-49 mapping (line 779-780)]
- [Source: _bmad-output/planning-artifacts/prd.md - SEO Strategy (lines 266-271), FR47-49 (lines 435-437)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Landing Page Strategy, Phase 1 Sprint 4]
- [Source: app/layout.tsx - Current root layout with existing metadata]
- [Source: app/page.tsx - Current placeholder landing page]

### Dependency: Story 7.1

This story depends on Story 7.1 (SSR Landing Page with Hebrew Content) being completed first. Story 7.1 creates:
- `components/landing/Hero.tsx`, `Features.tsx`, `Demo.tsx`
- Converts `app/page.tsx` to full SSR landing page
- May already add some SEO metadata (OG tags, JSON-LD) as part of Tasks 4.2 and 4.3

**If Story 7.1 already added JSON-LD or OG tags:** Verify and enhance them rather than creating from scratch. Extract JSON-LD into `Seo.tsx` component for separation of concerns.

**If Story 7.1 did NOT add JSON-LD or OG tags:** Create them fresh as described in this story.

### Previous Story Intelligence

**From Story 7.1 (SSR Landing Page - story file analysis):**
- Edge runtime for fast TTFB — SEO files benefit from this too (sitemap/robots are cached by default)
- Root `<html>` has `dir="rtl"` and `lang="he"` — metadata inherits this context
- Fonts: Noto Sans Hebrew + JetBrains Mono, loaded via `next/font/google` with `display: "swap"`
- Color system uses CSS custom properties — not relevant for SEO files
- No Convex or Clerk imports in landing components — maintain this boundary
- Test baseline: 381 tests passing — maintain zero regressions

**From Recent Git History:**
- Commit pattern: "Implement Story X.Y: Clear description"
- All stories maintain test co-location
- shadcn/ui components available but unlikely needed for SEO infrastructure
- Recent work focused on AI features (6.1, 6.2) — no SEO precedent in codebase yet

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Layout metadata test required mocking `next/font/google` and `ConvexClientProvider` to avoid import side-effects in test environment

### Completion Notes List

- Story 7.1 had already added `metadataBase`, `openGraph`, and inline JSON-LD in `page.tsx`. Enhanced existing setup rather than creating from scratch.
- Extracted inline JSON-LD from `app/page.tsx` into dedicated `components/landing/Seo.tsx` component with XSS-safe serialization
- Added `twitter` card config and `title.template` to layout metadata
- Created `app/sitemap.ts` and `app/robots.ts` using Next.js file conventions (not API routes)
- Generated placeholder `public/og-image.png` (1200x630, dark navy background) — should be replaced with branded design
- All SEO files are Server Components with no "use client", no Convex, no Clerk dependencies
- Uses `SITE_URL` constant from `lib/constants.ts` (configurable via `NEXT_PUBLIC_SITE_URL` env var)
- 22 new tests added across 4 test files; full suite: 484 tests passing, zero regressions

### Senior Developer Review (AI)

**Reviewer:** BenAkiva on 2026-03-08
**Outcome:** Approved with fixes applied

**Issues Found:** 1 High, 3 Medium, 4 Low (5 fixed, 2 accepted, 1 deferred)

**Fixed:**
1. [HIGH] JSON-LD description in Seo.tsx now matches layout.tsx meta description for SEO consistency
2. [MEDIUM] Sitemap `lastModified` changed from `new Date()` to fixed date constant — prevents misleading crawlers
3. [MEDIUM] XSS safety test rewritten to validate no raw `<` characters in innerHTML (previously used overly permissive regex)
4. [LOW] Sitemap test landing page identification uses `new URL().pathname === "/"` instead of fragile negative match
5. [LOW] Twitter card images converted to object format with alt text and dimensions

**Accepted (no fix needed):**
6. [LOW] `<Seo />` after footer — valid HTML for `<script>` tags, Google reads JSON-LD from any DOM location
7. [LOW] No `/api/` in robots.txt disallow — no Next.js API routes exist (Convex handles backend)

**Deferred:**
8. [MEDIUM] OG image is blank placeholder — needs designer, cannot be code-fixed. Replace before launch.

### Change Log

- 2026-03-08: Code review completed — 5 issues fixed (description sync, sitemap dates, XSS test, sitemap test, twitter images)
- 2026-03-08: Implemented Story 7.2 — Structured Data, Meta Tags & SEO Assets (all 6 tasks complete)

### File List

- `app/sitemap.ts` — NEW: Dynamic sitemap generation (Next.js convention)
- `app/sitemap.test.ts` — NEW: 6 unit tests for sitemap
- `app/robots.ts` — NEW: Robots.txt generation (Next.js convention)
- `app/robots.test.ts` — NEW: 4 unit tests for robots
- `app/layout.tsx` — MODIFIED: Added twitter card, title.template
- `app/layout.test.ts` — NEW: 7 unit tests for layout metadata
- `app/page.tsx` — MODIFIED: Replaced inline JSON-LD with `<Seo />` component import
- `components/landing/Seo.tsx` — NEW: JSON-LD structured data component with XSS safety
- `components/landing/Seo.test.tsx` — NEW: 5 unit tests for Seo component
- `public/og-image.png` — NEW: Placeholder OG image (1200x630)
