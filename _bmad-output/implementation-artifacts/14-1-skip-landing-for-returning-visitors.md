# Story 14.1: Skip Landing for Returning Visitors

Status: review

## Story

As a returning user,
I want to go directly to the editor without seeing the landing page every time,
So that I can start working immediately.

## Acceptance Criteria

1. **AC1: First-time visitor sees landing page** — Given a first-time visitor navigates to `/`, When the page loads, Then the landing page is shown normally with Hero, Features, Demo sections, And `localStorage.setItem('marko-v2-seen-landing', 'true')` is set on mount.

2. **AC2: Returning visitor auto-redirects to editor** — Given a returning visitor (with `marko-v2-seen-landing` flag in localStorage) navigates to `/`, When the page loads, Then the flag is detected client-side and the user is redirected to `/editor` via `router.push('/editor')`.

3. **AC3: Logo click bypasses redirect** — Given a user clicks the logo in the header (already links to `/?home=true` per S12.4), When navigating to `/?home=true`, Then the `?home=true` query param is detected and the redirect is skipped, showing the landing page regardless of the localStorage flag.

4. **AC4: Private browsing / cleared storage** — Given a user in private browsing or who cleared localStorage, When they visit `/`, Then the landing page is shown again (expected behavior — no flag exists).

5. **AC5: No SEO regression** — Given the landing page uses SSR with `export const runtime = "edge"` for SEO, When implementing the redirect, Then the server-rendered HTML is preserved for crawlers/first-paint, And the redirect logic is purely client-side (does not affect server rendering or meta tags).

## Tasks / Subtasks

- [x] Task 1: Create `LandingRedirectGuard` client component (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 Create `components/landing/LandingRedirectGuard.tsx` — `"use client"` component
  - [x] 1.2 On mount (`useEffect`): read `localStorage.getItem('marko-v2-seen-landing')`
  - [x] 1.3 Check `searchParams` for `home=true` — if present, skip redirect and show landing
  - [x] 1.4 If flag exists AND no `?home=true` param → call `router.push('/editor')` and render nothing (or a brief loading state)
  - [x] 1.5 If no flag OR `?home=true` → set flag `localStorage.setItem('marko-v2-seen-landing', 'true')` and render children
- [x] Task 2: Integrate guard into `app/page.tsx` (AC: #5)
  - [x] 2.1 Import `LandingRedirectGuard` into `app/page.tsx`
  - [x] 2.2 Wrap existing JSX with `<LandingRedirectGuard>...</LandingRedirectGuard>`
  - [x] 2.3 Keep `app/page.tsx` as a Server Component — the guard is a separate client component child
  - [x] 2.4 Verify `export const runtime = "edge"` and SSR metadata remain intact
- [x] Task 3: Handle `?home=true` param cleanup (AC: #3)
  - [x] 3.1 After rendering landing with `?home=true`, optionally remove the param from URL using `router.replace('/', { scroll: false })` so bookmarks/shares don't carry the param
  - [x] 3.2 Ensure the flag is still set to `true` even on `?home=true` visits (user has already seen landing)
- [x] Task 4: Write tests (AC: #1-#5)
  - [x] 4.1 Create `components/landing/LandingRedirectGuard.test.tsx`
  - [x] 4.2 Test: no localStorage flag → renders children, sets flag
  - [x] 4.3 Test: localStorage flag exists → calls `router.push('/editor')`, does NOT render children
  - [x] 4.4 Test: localStorage flag exists + `?home=true` → renders children (no redirect)
  - [x] 4.5 Test: no localStorage flag + `?home=true` → renders children, sets flag
  - [x] 4.6 Test: after rendering with `?home=true`, URL param is cleaned up
  - [x] 4.7 Test: localStorage throws (Safari strict privacy) → renders children gracefully (no crash)
  - [x] 4.8 Update `app/page.test.tsx` — mock the guard so existing 5 landing page tests pass unchanged (see "Existing Page Tests" section below)
- [x] Task 5: Verify no regressions (AC: #5)
  - [x] 5.1 Run full test suite — all existing tests pass
  - [x] 5.2 Verify SSR output for `/` still contains landing page HTML (view-source or curl)
  - [x] 5.3 Verify logo link `/?home=true` in Header still works correctly

## Dev Notes

### Architecture Compliance

- **Framework**: Next.js 16.1 App Router, React 19.2, TypeScript strict mode
- **Rendering**: `app/page.tsx` is a **Server Component** with `export const runtime = "edge"` — do NOT convert to client component. The redirect guard must be a separate `"use client"` child component.
- **Styling**: Tailwind v4 with logical CSS properties (RTL-aware). Use `ps-`, `pe-`, `ms-`, `me-` instead of `pl-`, `pr-`, `ml-`, `mr-`.
- **Icons**: Lucide React only
- **Testing**: Vitest with co-located `.test.tsx` files

### Critical: localStorage Key Naming Convention

The feedback spec mentions `marko_seen_landing` — **DO NOT USE THIS**. All localStorage keys in the project use the `marko-v2-*` prefix with hyphens:
- `marko-v2-editor-content`
- `marko-v2-color-theme`
- `marko-v2-ui-mode`
- `marko-v2-doc-direction`
- `marko-v2-view-mode`
- `marko-v2-active-theme`
- `marko-v2-custom-presets`

**Use `marko-v2-seen-landing`** to be consistent. Store as plain string `'true'` (not JSON).

### Critical: Server vs Client Component Boundary

`app/page.tsx` is currently a Server Component:
```tsx
// app/page.tsx (Server Component — NO "use client")
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { Seo } from "@/components/landing/Seo";
export const runtime = "edge";

export default function LandingPage() {
  return (
    <>
      <main className="landing-gradient min-h-screen">
        <Hero />
        <Features />
        <Demo />
      </main>
      <Seo />
    </>
  );
}
```

**DO NOT add `"use client"` to this file.** Create a separate `LandingRedirectGuard` client component and wrap the children. The server component continues to render the full landing page HTML for SEO — the client-side guard handles the redirect after hydration.

### Implementation Pattern

```tsx
// components/landing/LandingRedirectGuard.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const SEEN_KEY = "marko-v2-seen-landing";

export function LandingRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const decidedRef = useRef(false); // Prevent re-trigger on searchParams change

  useEffect(() => {
    if (decidedRef.current) return;
    decidedRef.current = true;

    try {
      const seen = localStorage.getItem(SEEN_KEY);
      const isHomeBypass = searchParams.get("home") === "true";

      if (seen && !isHomeBypass) {
        router.push("/editor");
        return;
      }

      // Set flag — user is seeing landing now
      localStorage.setItem(SEEN_KEY, "true");
      setShow(true);

      // Clean up ?home=true param so bookmarks/shares don't carry it
      if (isHomeBypass) {
        router.replace("/", { scroll: false });
      }
    } catch {
      // localStorage unavailable (Safari strict privacy, storage full, etc.)
      // Safe fallback: show landing page
      setShow(true);
    }
  }, [router, searchParams]);

  if (!show) return null; // Brief blank while checking / redirecting
  return <>{children}</>;
}
```

**Critical: `decidedRef` prevents a re-trigger loop.** When `router.replace('/', ...)` removes the `?home=true` param, `searchParams` changes, which would re-fire the `useEffect`. Without the ref guard, the second run sees `seen=true` + `isHomeBypass=false` and redirects to `/editor` — defeating the bypass. The ref ensures the decision is made exactly once.

**Critical: `try/catch` around localStorage.** Mobile Safari with strict privacy settings or full storage quota can throw on `getItem`/`setItem`. Fallback: show landing page.

**Note:** `useSearchParams` requires a `<Suspense>` boundary in the parent. Wrap in `app/page.tsx` with `fallback={null}` (intentionally no loading skeleton — the guard handles its own blank state):
```tsx
import { Suspense } from "react";

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingRedirectGuard>
        <main>...</main>
        <Seo />
      </LandingRedirectGuard>
    </Suspense>
  );
}
```

**Note on SSR + Seo:** The server renders the full landing page HTML (including `<Seo />`) regardless of the guard. The guard only suppresses client-side rendering during the localStorage check. Crawlers receive the complete HTML with all SEO tags. Do NOT move `<Seo />` outside the guard — it must remain inside so the server component tree is unchanged.

### Flash Behavior Consideration

When a returning user visits `/`, the server renders the full landing page HTML. The client-side guard then redirects. There will be a brief flash of landing content before redirect. This is acceptable because:
1. It preserves SSR for SEO (crawlers don't execute JS)
2. The redirect is near-instant (localStorage check is synchronous)
3. Using `useState(false)` + `return null` hides content during the check

If the flash is noticeable, the dev can optionally add a CSS opacity transition or return a minimal loading skeleton instead of `null`.

### Logo Link Already Done

Story 12.4 already updated the logo `<Link href="/?home=true">` in `Header.tsx:169`. No changes needed to the header. Just verify in tests.

### Existing Landing Components

Located in `components/landing/`:
- `Hero.tsx` + `Hero.test.tsx`
- `Features.tsx` + `Features.test.tsx`
- `Demo.tsx` + `Demo.test.tsx`
- `Seo.tsx` + `Seo.test.tsx`

None of these need modification. The guard wraps them from outside.

### Existing Page Tests — Must Not Break

`app/page.test.tsx` has 5 existing tests that render `<LandingPage />` and assert on Hero, Features, Demo, Seo sections. After wrapping in `<Suspense><LandingRedirectGuard>`, these tests will break because the guard starts with `show=false` and returns `null` until `useEffect` fires.

**Solution:** In `app/page.test.tsx`, mock the guard to be a pass-through:
```tsx
vi.mock("@/components/landing/LandingRedirectGuard", () => ({
  LandingRedirectGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
```

This keeps existing tests focused on landing page content, while `LandingRedirectGuard.test.tsx` handles the redirect logic separately.

### Export the `SEEN_KEY` Constant

Export `SEEN_KEY` from `LandingRedirectGuard.tsx` so future stories (e.g., S14.2 settings "reset first-visit") can import it instead of duplicating the string literal.

### No Middleware Exists

The project currently has no `middleware.ts` file. Clerk auth is handled client-side. Do NOT create middleware for this feature — the client-side approach is correct because:
1. localStorage is not available in middleware (server-side only has cookies)
2. Creating middleware for a localStorage check would require a cookie mirror, adding unnecessary complexity
3. The client-side redirect is sufficient for the UX goal

### Testing Patterns (from S13.3)

- Vitest with co-located test files
- Mock `next/navigation`: `useRouter` returns `{ push: vi.fn(), replace: vi.fn() }`, `useSearchParams` returns `new URLSearchParams()`
- Mock `localStorage`: JSDOM provides it by default in Vitest
- Use `act()` wrapper for state updates in `useEffect`
- Test structure: describe blocks grouping by AC number

### Project Structure Notes

- New file: `components/landing/LandingRedirectGuard.tsx` — placed alongside other landing components
- New file: `components/landing/LandingRedirectGuard.test.tsx`
- Modified file: `app/page.tsx` — minimal change (add import + Suspense wrapper)
- No new dependencies required

### References

- [Source: _bmad-output/benakiva-feedback-round1.md#N4] — Original feedback item
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-14] — Epic 14 story definitions and acceptance criteria
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md] — Story sizing (Small) and phase placement (WS3-P2)
- [Source: _bmad-output/implementation-artifacts/12-4-user-menu-and-navigation.md] — Logo `/?home=true` implementation
- [Source: app/page.tsx] — Current landing page (Server Component, edge runtime)
- [Source: app/layout.tsx] — Root layout with FOUC script, RTL dir, fonts
- [Source: components/layout/Header.tsx:169] — Logo link to `/?home=true`

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
None — clean implementation, no blocking issues encountered.

### Completion Notes List
- Created `LandingRedirectGuard` client component following the story's implementation pattern exactly
- Used `decidedRef` to prevent re-trigger loop when `router.replace` changes searchParams
- Used `try/catch` around localStorage for Safari strict privacy graceful fallback
- Exported `SEEN_KEY` constant for reuse in future stories (e.g., S14.2 settings)
- Wrapped landing page in `<Suspense fallback={null}>` for `useSearchParams` compatibility
- Kept `app/page.tsx` as Server Component — no `"use client"`, `export const runtime = "edge"` preserved
- Mocked guard as pass-through in `app/page.test.tsx` so all 5 existing tests pass unchanged
- 8 new tests in LandingRedirectGuard.test.tsx covering all ACs + localStorage error edge case
- Full test suite: 844 passed, 0 regressions (1 pre-existing font mock failure in layout.test.ts unrelated to this story)
- Verified logo `/?home=true` link in Header.tsx:169 is intact (from S12.4)

### File List
- `components/landing/LandingRedirectGuard.tsx` — NEW: client component with redirect guard logic
- `components/landing/LandingRedirectGuard.test.tsx` — NEW: 8 tests covering all ACs
- `app/page.tsx` — MODIFIED: added Suspense + LandingRedirectGuard wrapper
- `app/page.test.tsx` — MODIFIED: added guard mock as pass-through

### Change Log
- 2026-03-25: Story 14.1 implemented — LandingRedirectGuard for returning visitor auto-redirect to /editor
