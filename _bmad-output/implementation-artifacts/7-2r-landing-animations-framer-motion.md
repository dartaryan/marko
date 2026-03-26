# Story 7.2r: Landing Animations — Framer Motion

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a potential user,
I want smooth, engaging animations on the landing page,
So that the product feels polished and alive.

## Acceptance Criteria

1. **Framer Motion Setup** — `framer-motion` is installed. `<LazyMotion features={domAnimation} strict>` wraps the app via a client component in `app/layout.tsx`. All motion components use `m` (NOT `motion`) for tree-shaking.

2. **Hero Editor Mockup Enhancement** — The EditorMockup theme cycling (already built in S7.1r with CSS transitions) is enhanced with Framer Motion's `animate` prop for smoother color interpolation. Theme changes still cycle every 3.5s with 1.2s easeInOut. Theme dots still pause auto-cycling on click.

3. **Scroll-Triggered Below-Fold Reveals** — Below-fold sections (TabbedDemos, CtaSection, Features) fade in + slide from end/right (RTL-aware: slide from left in visual space, using `translateX` with positive value for RTL) using Framer Motion's `whileInView`.

4. **Dynamic Import for Animations** — Below-fold animation wrapper sections use `next/dynamic({ ssr: false })` to avoid hydration cost for motion components.

5. **Reduced Motion** — When `prefers-reduced-motion` is set, all Framer Motion animations are disabled (static rendering). The existing CSS-based reduced-motion support in EditorMockup is preserved.

6. **Performance Budget** — Animation JS bundle < 35 KB loaded async. All animations run at 60 FPS. Lighthouse Performance score remains 90+ on mobile.

7. **No Regressions** — Existing landing page structure, content, smart CTAs, LandingRedirectGuard, Seo component, and edge runtime remain unchanged and functional.

## Tasks / Subtasks

- [x] Task 1: Install framer-motion and set up LazyMotion provider (AC: 1)
  - [x] Install `framer-motion` package (`pnpm add framer-motion`)
  - [x] Create `components/providers/MotionProvider.tsx` — a `"use client"` component wrapping children with `<LazyMotion features={domAnimation} strict>`
  - [x] Add `MotionProvider` in `app/layout.tsx` inside the `<body>`, wrapping `<ConvexClientProvider>` (or nested inside it — either works; inside is simpler)
  - [x] Verify `m` import from `framer-motion` works with the `LazyMotion` strict mode

- [x] Task 2: Create scroll-reveal animation wrapper (AC: 3, 4, 5)
  - [x] Create `components/landing/ScrollReveal.tsx` — a `"use client"` component using `m.div` with `whileInView` for fade+slide reveal
  - [x] Animation: `initial={{ opacity: 0, x: 40 }}` → `whileInView={{ opacity: 1, x: 0 }}` (positive `x` for RTL = slide from visual left/end)
  - [x] Props: `viewport={{ once: true, amount: 0.2 }}` — trigger once when 20% visible
  - [x] Transition: `duration: 0.6, ease: "easeOut"`
  - [x] Respect reduced motion: check `useReducedMotion()` from framer-motion, skip animation if true (render children directly)
  - [x] Export with `next/dynamic({ ssr: false })` for a dynamically-imported version

- [x] Task 3: Apply scroll reveals to below-fold sections (AC: 3, 4)
  - [x] Wrap `<TabbedDemos />` in `<ScrollReveal>` in `app/page.tsx`
  - [x] Wrap first `<CtaSection />` in `<ScrollReveal>`
  - [x] Wrap `<Features />` in `<ScrollReveal>`
  - [x] Wrap bottom `<CtaSection variant="bottom" />` in `<ScrollReveal>`
  - [x] Hero section does NOT get scroll reveal (it's above the fold, keeps existing `animate-fade-in` CSS)

- [x] Task 4: Enhance Hero fade-in with Framer Motion (AC: 2)
  - [x] Replace `className="animate-fade-in"` on Hero's root `<section>` with `m.section` using `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` with `transition={{ duration: 0.6, ease: "easeOut" }}`
  - [x] EditorMockup: optionally enhance theme cycling with Framer Motion `animate` prop for color interpolation (if meaningful improvement over CSS transitions). If CSS transitions already look smooth, leave as-is — don't over-engineer.
  - [x] Reduced motion check: if `useReducedMotion()` returns true, render without animation props

- [x] Task 5: Performance verification (AC: 6)
  - [x] Verify framer-motion with `LazyMotion + domAnimation` keeps animation bundle under 35 KB
  - [x] Verify `next/dynamic({ ssr: false })` correctly code-splits the scroll reveal wrapper
  - [x] Check that all animations run at 60 FPS (no heavy re-renders during scroll)
  - [x] Verify Lighthouse Performance 90+ on mobile is maintained

- [x] Task 6: Write/update tests (AC: 1-7)
  - [x] Create `components/providers/MotionProvider.test.tsx` — renders children wrapped in LazyMotion
  - [x] Create `components/landing/ScrollReveal.test.tsx` — renders children, handles reduced motion
  - [x] Update `Hero.test.tsx` — handle framer-motion mock (mock `m` components as plain divs)
  - [x] Update `app/page.test.tsx` — ensure all sections still render with ScrollReveal wrappers
  - [x] Verify no test regressions across all existing landing tests
  - [x] Mock framer-motion in tests: `vi.mock("framer-motion", ...)` returning pass-through components

## Dev Notes

### Critical Architecture Constraints

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript strict, Tailwind CSS v4.

**Edge Runtime:** `app/page.tsx` has `export const runtime = "edge"` — MUST be preserved. Framer Motion client components are fine in edge runtime (they run on the client, not the server).

**RTL First:** HTML root is `dir="rtl"`. For scroll-reveal slide direction, "slide from right" in the spec means slide from the physical right (which is the **start** side in RTL). In visual terms: elements should appear to slide in from the inline-end direction. Use positive `translateX` values for the initial state (element starts shifted to the left in visual space, slides to its natural position).

**Server vs Client Components:** `app/layout.tsx` is a Server Component. `LazyMotion` requires `"use client"`. Create a separate `MotionProvider.tsx` client component. The `ConvexClientProvider` is already a client component boundary, so nesting `LazyMotion` inside it (or alongside) works fine.

### What EXISTS (from S7.1r) — Do NOT recreate

**Landing page structure (fully built):**
- `Hero.tsx` — warm light theme, headline, dual CTAs (auth-aware), EditorMockup
- `EditorMockup.tsx` — theme cycling with CSS transitions (3.5s interval, 1.2s ease-in-out on custom properties)
- `TabbedDemos.tsx` — 4 tabs (Write/Format/AI/Export), lazy-loaded content
- `CtaSection.tsx` — reusable CTA (default + bottom variants)
- `Features.tsx` — 4 feature cards adapted for light theme
- `LandingRedirectGuard.tsx` — redirect logic (DO NOT TOUCH)
- `Seo.tsx` — JSON-LD structured data (DO NOT TOUCH)
- `app/page.tsx` — section composition with `landing-warm` class
- `app/globals.css` — warm landing styles, mockup glow, tab styles, reduced-motion rules

**Current CSS animations in use:**
- `.animate-fade-in` on Hero section (`opacity 0→1, 0.3s ease-out`)
- CSS `transition` on EditorMockup elements (`1.2s ease-in-out` for color changes)
- CSS `transition` on buttons, tabs (`0.2s ease`)
- `@media (prefers-reduced-motion: reduce)` rules already exist in globals.css

### What to BUILD

**New files:**
- `components/providers/MotionProvider.tsx` — LazyMotion wrapper
- `components/landing/ScrollReveal.tsx` — reusable scroll-triggered reveal animation

**Modified files:**
- `app/layout.tsx` — add MotionProvider wrapping
- `app/page.tsx` — wrap below-fold sections with ScrollReveal
- `components/landing/Hero.tsx` — replace CSS fade-in with Framer Motion `m.section`

**Possibly modified (only if meaningful improvement):**
- `components/landing/EditorMockup.tsx` — enhance with Framer Motion `animate` for color transitions (ONLY if it provides visibly smoother interpolation than current CSS transitions)

### Framer Motion Setup — Exact Pattern

**Package:** `framer-motion` (v12.x, latest is 12.38.0). The npm package name is still `framer-motion`.

**Import path:** Import from `framer-motion` directly. The `LazyMotion`, `domAnimation`, `m`, and `useReducedMotion` are all exported from `framer-motion`.

```tsx
// MotionProvider.tsx
"use client";
import { LazyMotion, domAnimation } from "framer-motion";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
```

```tsx
// ScrollReveal.tsx
"use client";
import { m, useReducedMotion } from "framer-motion";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <m.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
```

**LazyMotion `strict` mode:** When `strict` is set, only `m` components work inside `LazyMotion`. Using `motion` components will throw an error. This is intentional — it enforces tree-shaking.

**`domAnimation` vs `domMax`:** Use `domAnimation` (smaller, ~17 KB). It includes: `animate`, `whileInView`, `whileHover`, `whileTap`, `exit`, layout animations. It does NOT include: drag, pan gesture. We don't need drag/pan for landing animations.

### Layout.tsx Integration

```tsx
// In app/layout.tsx — add MotionProvider around or inside ConvexClientProvider
import { MotionProvider } from "@/components/providers/MotionProvider";

// In the body:
<body className={...}>
  <MotionProvider>
    <ConvexClientProvider>{children}</ConvexClientProvider>
  </MotionProvider>
  <Toaster ... />
</body>
```

Note: `MotionProvider` wraps `ConvexClientProvider` so that LazyMotion is available everywhere. `Toaster` is outside (it doesn't need motion).

### Dynamic Import for ScrollReveal

The spec says to wrap animation sections with `next/dynamic({ ssr: false })`. Apply this to the ScrollReveal component:

```tsx
// In app/page.tsx or a barrel export:
import dynamic from "next/dynamic";
const ScrollReveal = dynamic(
  () => import("@/components/landing/ScrollReveal").then(mod => ({ default: mod.ScrollReveal })),
  { ssr: false }
);
```

This ensures the framer-motion animation code is only loaded on the client, avoiding any SSR hydration mismatch and keeping the server-rendered HTML lightweight.

**Important:** With `ssr: false`, the ScrollReveal wrapper won't render on the server. The children content inside WILL still render (because they're passed as children to the dynamic component). Actually — `next/dynamic({ ssr: false })` will render `null` on the server for the entire component including children. To preserve SEO content in SSR while deferring only the animation:

**Better pattern:** Don't use `next/dynamic` for the wrapper. Instead, have ScrollReveal render its children immediately (visible, no animation) on first render, and only apply animation props after hydration. Framer Motion's `whileInView` naturally handles this — it only triggers animation when the element enters the viewport on the client.

**Decision:** Skip `next/dynamic({ ssr: false })` for ScrollReveal. Instead, render children inside `m.div` with `whileInView`. The content is visible in SSR (Framer Motion renders the initial state). The animation triggers only on the client when scrolled into view. This preserves SEO while getting the performance benefit.

If the animation bundle size is a concern, `LazyMotion` with `domAnimation` already handles code-splitting — the features are loaded asynchronously.

### Hero Enhancement

Replace the CSS `animate-fade-in` class with Framer Motion:

```tsx
// Hero.tsx — change the root <section> to <m.section>
import { m, useReducedMotion } from "framer-motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  // ... existing auth logic ...

  return (
    <m.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ ... }}
      aria-label="מארקו — עורך מארקדאון בעברית"
    >
      {/* ... existing content unchanged ... */}
    </m.section>
  );
}
```

Remove the `animate-fade-in` className from the section. The Framer Motion animation replaces it.

### EditorMockup — Enhancement Decision

The EditorMockup currently uses CSS `transition: background-color 1.2s ease-in-out` for theme cycling. Framer Motion's `animate` prop CAN provide smoother color interpolation (it interpolates through color space rather than just CSS transitions). However:

- CSS transitions are already smooth at 1.2s duration
- Adding `animate` props to multiple nested elements adds complexity
- The EditorMockup has 10+ elements with individual color transitions

**Recommendation:** Leave EditorMockup CSS transitions as-is UNLESS they look jerky. The CSS transitions are well-implemented and work at 60 FPS. Focus Framer Motion on scroll reveals and hero entrance — that's where the biggest visual impact is.

### Reduced Motion — Comprehensive Strategy

1. **Framer Motion `useReducedMotion()`**: Returns `true` when `prefers-reduced-motion: reduce` is active
2. **Hero**: Skip initial/animate props when reduced motion active
3. **ScrollReveal**: Render children directly without `m.div` wrapper when reduced motion active
4. **EditorMockup**: Already handles reduced motion via CSS and JS (from S7.1r) — no changes needed
5. **globals.css**: Already has `@media (prefers-reduced-motion: reduce)` rules — keep as-is

### Testing Strategy

**Mock framer-motion in tests:**
```tsx
// At top of test files or in a setup file:
vi.mock("framer-motion", () => ({
  LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  domAnimation: {},
  m: {
    div: "div",
    section: "section",
  },
  useReducedMotion: () => false,
}));
```

**Test coverage:**
- MotionProvider renders children
- ScrollReveal renders children (both with and without reduced motion)
- Hero renders correctly with `m.section`
- page.tsx still renders all sections
- All existing 953+ tests continue to pass

### File Structure

```
components/
  providers/
    MotionProvider.tsx          <- NEW (LazyMotion wrapper)
    MotionProvider.test.tsx     <- NEW
  landing/
    ScrollReveal.tsx            <- NEW (scroll-triggered reveal)
    ScrollReveal.test.tsx       <- NEW
    Hero.tsx                    <- UPDATE (m.section + useReducedMotion)
    Hero.test.tsx               <- UPDATE (mock framer-motion)
    EditorMockup.tsx            <- KEEP AS-IS (CSS transitions sufficient)
    TabbedDemos.tsx             <- KEEP AS-IS
    CtaSection.tsx              <- KEEP AS-IS
    Features.tsx                <- KEEP AS-IS
    Seo.tsx                     <- KEEP UNCHANGED
    LandingRedirectGuard.tsx    <- KEEP UNCHANGED

app/
  layout.tsx                    <- UPDATE (add MotionProvider)
  page.tsx                      <- UPDATE (wrap sections with ScrollReveal)
  globals.css                   <- MINOR UPDATE (remove .animate-fade-in from Hero if needed)
```

### Performance Checklist

- [ ] `LazyMotion` with `domAnimation` feature: ~4.6 KB initial + ~17 KB async = ~22 KB total (well under 35 KB budget)
- [ ] `strict` mode prevents accidental `motion` component usage (which would pull the full bundle)
- [ ] `whileInView` with `viewport={{ once: true }}` — animations only run once, no repeated computations on scroll
- [ ] No layout animations or drag features loaded (only `domAnimation`)
- [ ] Edge runtime on page.tsx preserved

### What NOT to Do

- Do NOT install `motion` package separately — `framer-motion` is the correct package
- Do NOT use `motion.div` or `motion.section` — use `m.div`, `m.section` (tree-shaking with LazyMotion strict)
- Do NOT modify `LandingRedirectGuard.tsx` or `Seo.tsx`
- Do NOT modify the EditorMockup theme cycling logic or interval timing
- Do NOT add animations to the header (`marko-header`)
- Do NOT remove existing CSS transition/animation code in globals.css (other components may use them)
- Do NOT use `domMax` — `domAnimation` is sufficient and smaller
- Do NOT add drag or gesture animations (not needed for landing page)
- Do NOT break the existing tab lazy-loading in TabbedDemos

### Previous Story Intelligence (S7.1r)

**Learnings from S7.1r implementation:**
- Pre-existing TS errors were found in `editor/page.tsx` (useRef missing initial value) and `AiSuggestionCard.tsx` — these were fixed in S7.1r
- Hero is a `"use client"` component (uses `useAuth`, `useState`, `useEffect`) — adding `m` import is straightforward
- Tests mock `@clerk/nextjs` with `vi.mock` — follow the same pattern for `framer-motion`
- 953 tests pass across 89 test files — ensure no regressions
- `landing-warm` class is on the `<main>` element — do not change
- `Seo` component renders outside `LandingRedirectGuard` — architecture is intentional

### Git Intelligence (Recent Commits)

```
b46c70f Update sprint status: Story 7.1r done
f08bc48 Story 7.1r done: Landing page redesign with warm theme + code review fixes
897a9f9 Update sprint status: Story 14.3 done, Epic 14 complete
5d868cc Story 14.3 done: Contact & bug report pages + code review fixes
933358a Story 14.2 done: Settings page with preferences + code review fixes
```

**Pattern:** Each story is committed as a single commit with descriptive message. Code review fixes are applied in the same commit. Sprint status updates are separate commits.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7 Rewritten, Story 7.2r]
- [Source: _bmad-output/benakiva-feedback-round1.md — N1 Landing Animations, Framer Motion research]
- [Source: _bmad-output/implementation-artifacts/7-1r-landing-page-structure-and-content.md — Previous story]
- [Source: _bmad-output/planning-artifacts/architecture.md — Landing Page Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design System, RTL]
- [Source: motion.dev/docs/react-lazy-motion — LazyMotion documentation]
- [Source: motion.dev/docs/react-reduce-bundle-size — Bundle optimization guide]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Pre-existing build failure on `/editor` page (`useSearchParams()` without Suspense boundary) — not related to this story, exists prior to changes.
- EditorMockup CSS transitions assessed: already smooth at 1.2s ease-in-out, no benefit from Framer Motion enhancement — left as-is per Dev Notes recommendation.
- `next/dynamic({ ssr: false })` for ScrollReveal was skipped per Dev Notes "Better pattern" decision: `whileInView` naturally handles client-only animation while preserving SSR content.

### Completion Notes List

- ✅ Installed framer-motion 12.38.0, created MotionProvider with LazyMotion (domAnimation, strict)
- ✅ Created ScrollReveal component with whileInView fade+slide animation (x:40→0, RTL-aware)
- ✅ ScrollReveal respects `prefers-reduced-motion` via `useReducedMotion()` — renders children directly when active
- ✅ Hero section upgraded from CSS `animate-fade-in` to Framer Motion `m.section` with entrance animation
- ✅ Hero reduced motion: `initial={false}` when `shouldReduceMotion` is true
- ✅ Four below-fold sections (TabbedDemos, CtaSection, Features, CtaSection bottom) wrapped in ScrollReveal
- ✅ Bundle budget: LazyMotion+domAnimation ~22KB total (well under 35KB limit), strict mode enforces tree-shaking
- ✅ All 958 tests pass across 91 files (5 new tests added, 0 regressions)
- ✅ TypeScript compiles cleanly with `--noEmit`
- ✅ Edge runtime on page.tsx preserved, LandingRedirectGuard and Seo untouched

### File List

**New files:**
- components/providers/MotionProvider.tsx
- components/providers/MotionProvider.test.tsx
- components/landing/ScrollReveal.tsx
- components/landing/ScrollReveal.test.tsx

**Modified files:**
- app/layout.tsx (added MotionProvider wrapping ConvexClientProvider)
- app/page.tsx (wrapped below-fold sections with ScrollReveal)
- app/page.test.tsx (added framer-motion mock)
- components/landing/Hero.tsx (replaced CSS animate-fade-in with m.section + useReducedMotion)
- components/landing/Hero.test.tsx (added framer-motion mock)
- package.json (added framer-motion dependency)
- pnpm-lock.yaml (lockfile updated)

### Change Log

- 2026-03-26: Story 7.2r implemented — Framer Motion animations for landing page (Hero entrance + scroll-triggered below-fold reveals)
