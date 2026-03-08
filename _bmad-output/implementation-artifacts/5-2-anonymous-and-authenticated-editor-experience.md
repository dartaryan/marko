# Story 5.2: Anonymous & Authenticated Editor Experience

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to use the full editor without logging in, and see additional options when I do log in,
so that I can try Marko freely and unlock more features by registering.

## Acceptance Criteria

1. **Anonymous editor access** — Given an anonymous user (no Clerk session) visits the editor, when they use the editor, then all editing, preview, theming, and export features work fully, and the AI action button shows a prompt to register (not disabled/hidden), and no login is required for any core editor functionality.

2. **Authenticated user header** — Given a registered user is logged in, when they visit the editor, then the header displays the Clerk `<UserButton />` with their profile, and the AI action button is enabled and functional, and the system reads their tier from Convex to determine capabilities.

3. **Sign out preserves content** — Given a logged-in user clicks the UserButton, when they select "Sign out", then they are logged out and returned to anonymous mode, and their editor content (localStorage) is preserved.

4. **Auth button in header (anonymous)** — Given an anonymous user, when the header renders, then an outlined button "הרשמה / התחברות" appears at the far left of header actions (after a visual separator), styled as non-prominent and secondary to the editor experience.

5. **AI action button gate (anonymous)** — Given an anonymous user, when the AI action area renders, then it shows an inline prompt "הירשם בחינם כדי להשתמש ב-AI" instead of functional AI actions.

6. **Tier-aware UI** — Given a logged-in user, when the system checks their tier from Convex, then free users see their initials avatar (28x28px, primary color), and paid users see the same avatar with a gold dot badge.

## Tasks / Subtasks

- [x] Task 1: Create auth components (AC: #2, #4, #6)
  - [x] 1.1 Create `components/auth/UserMenu.tsx` — Wrapper around Clerk `<UserButton />` for logged-in state with tier badge
  - [x] 1.2 Create `components/auth/AuthButton.tsx` — "הרשמה / התחברות" outlined button for anonymous state, links to `/sign-in`
  - [x] 1.3 Create `components/auth/AuthGate.tsx` — Conditional render component based on auth state (anonymous vs authenticated)
  - [x] 1.4 Create `components/auth/AuthButton.test.tsx` — Unit tests for AuthButton rendering and click behavior
  - [x] 1.5 Create `components/auth/UserMenu.test.tsx` — Unit tests for UserMenu rendering with tier states
  - [x] 1.6 Create `components/auth/AuthGate.test.tsx` — Unit tests for conditional rendering

- [x] Task 2: Create user types and hooks (AC: #2, #6)
  - [x] 2.1 Create `types/user.ts` — `UserTier` type (`"free" | "paid"`), `UserProfile` type
  - [x] 2.2 Create `lib/hooks/useCurrentUser.ts` — Custom hook wrapping Convex `useQuery(api.users.getCurrentUser)` with auth state check; returns `{ user, isLoading, isAuthenticated }`
  - [x] 2.3 Create `lib/hooks/useCurrentUser.test.ts` — Tests for the hook

- [x] Task 3: Integrate auth UI into Header (AC: #1, #2, #4)
  - [x] 3.1 Modify `components/layout/Header.tsx` — Add auth section at the far left of action buttons, after a `Separator` component
  - [x] 3.2 Import and render `<AuthGate>` wrapping `<AuthButton />` (anonymous) and `<UserMenu />` (authenticated)
  - [x] 3.3 Update `Header.test.tsx` — Add tests for auth states in header

- [x] Task 4: Create AI action placeholder (AC: #1, #5)
  - [x] 4.1 Create `components/ai/AiActionPlaceholder.tsx` — Shows register prompt for anonymous users, placeholder for future AI panel
  - [x] 4.2 Create `components/ai/AiActionPlaceholder.test.tsx` — Tests for anonymous and authenticated states

- [x] Task 5: Verify localStorage persistence across auth transitions (AC: #3)
  - [x] 5.1 Verify that signing in and signing out does NOT clear localStorage keys (`marko-v2-editor-content`, `marko-v2-color-theme`, `marko-v2-view-mode`, `marko-v2-doc-direction`)
  - [x] 5.2 Add integration test verifying content persistence across auth state changes

- [x] Task 6: Verify existing functionality (AC: #1)
  - [x] 6.1 Verify all existing 229+ tests still pass
  - [x] 6.2 Verify editor, preview, theming, export all work without authentication
  - [x] 6.3 Verify sign-in and sign-up pages still work correctly at `/sign-in` and `/sign-up`

## Dev Notes

### CRITICAL: Story 5.1 is a prerequisite

Story 5.1 (Clerk Authentication Integration & User Sync) MUST be implemented before this story. Story 5.1 creates:
- `convex/schema.ts` — `users` table with `clerkId`, `email`, `name`, `tier`, `createdAt`
- `convex/users.ts` — `getCurrentUser` query, `getCurrentUserOrThrow` query, `upsertFromClerk` and `deleteFromClerk` internal mutations
- `convex/http.ts` — Webhook handler for Clerk user events

If these don't exist when you start, **STOP** and implement Story 5.1 first or inform the user.

### Architecture Patterns & Constraints

**Auth State Architecture:**
- Clerk provides session/auth state via `useUser()` hook from `@clerk/nextjs`
- Convex provides user data (tier) via `useQuery(api.users.getCurrentUser)`
- Use `useConvexAuth()` from `convex/react` for auth state checks
- Use Convex's `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` components for conditional rendering where appropriate
- **NEVER** gate core editor features behind authentication — editor is fully functional for anonymous users

**Three-Tier Model (Frontend Perspective):**

| Tier | Detection | UI Difference |
|------|-----------|--------------|
| Anonymous | No Clerk session (`!isSignedIn`) | Auth button in header, AI register prompt |
| Free | Clerk session + `user.tier === "free"` | UserButton with initials avatar, AI enabled with quota |
| Paid | Clerk session + `user.tier === "paid"` | UserButton with gold badge, AI unlimited |

**State Management:**
- Auth state: Clerk React hooks (`useUser`, `useAuth`) — global via ClerkProvider
- User tier: Convex reactive query (`useQuery`) — auto-updates when tier changes
- Editor content: localStorage (unchanged) — persists across auth transitions
- **No additional state management library needed**

**Convex Query Pattern for User Data:**
```typescript
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Use "skip" when not authenticated to prevent unnecessary queries
const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
const user = useQuery(
  api.users.getCurrentUser,
  isAuthenticated ? {} : "skip"
);
```

**Error Format (if needed):**
```typescript
throw new ConvexError({
  code: "AUTH_REQUIRED",
  message: "נדרש התחברות כדי לגשת לתכונה זו",
  messageEn: "Authentication required to access this feature",
});
```

### Existing Infrastructure (DO NOT Recreate)

These already exist and should NOT be modified:
- **`app/ConvexClientProvider.tsx`** — Wraps `ClerkProvider` → `ConvexProviderWithClerk` with `useAuth`
- **`app/layout.tsx`** — Root layout with ConvexClientProvider, Toaster, fonts, dark mode script
- **`app/sign-in/[[...sign-in]]/page.tsx`** — Clerk `<SignIn />` component page
- **`app/sign-up/[[...sign-up]]/page.tsx`** — Clerk `<SignUp />` component page
- **`convex/auth.config.ts`** — Clerk JWT issuer domain configured for Convex auth
- **`proxy.ts`** — Clerk middleware with no protected routes (permissive)

### Must Be Created (Story 5.2 Scope)

1. **`components/auth/AuthButton.tsx`** — Outlined "הרשמה / התחברות" button for anonymous users
2. **`components/auth/UserMenu.tsx`** — Clerk `<UserButton />` wrapper with tier badge for authenticated users
3. **`components/auth/AuthGate.tsx`** — Conditional rendering based on auth state
4. **`components/auth/AuthButton.test.tsx`** — Tests
5. **`components/auth/UserMenu.test.tsx`** — Tests
6. **`components/auth/AuthGate.test.tsx`** — Tests
7. **`components/ai/AiActionPlaceholder.tsx`** — AI register prompt / placeholder
8. **`components/ai/AiActionPlaceholder.test.tsx`** — Tests
9. **`types/user.ts`** — UserTier, UserProfile types
10. **`lib/hooks/useCurrentUser.ts`** — Custom hook for current user data
11. **`lib/hooks/useCurrentUser.test.ts`** — Tests

### Must Be Modified (Story 5.2 Scope)

1. **`components/layout/Header.tsx`** — Add auth section (AuthButton/UserMenu) at far left of actions, with separator
2. **`components/layout/Header.test.tsx`** — Add auth state tests

### UX Requirements (from UX Design Specification)

**Anonymous State Header:**
- Outlined button "הרשמה / התחברות" at the far left of header actions, after a separator
- NOT prominent — the tool works without it
- Button links to `/sign-in` (Clerk handles redirect to sign-up from there)

**Authenticated State Header:**
- Clerk `<UserButton />` replaces the auth button
- Free tier: Initials avatar (28x28px circle, primary color background)
- Paid tier: Same avatar with small gold dot badge
- Click opens Clerk dropdown with account info, tier status, logout

**AI Action Area (anonymous):**
- Shows inline prompt: "הירשם בחינם כדי להשתמש ב-AI"
- NOT disabled, NOT hidden — shows a clear call to action
- Must NOT block or popup — inline only

**Anti-Patterns to AVOID:**
- NO navigation bar (Home/Pricing/Docs/Login) — Marko is a tool, not a website
- NO signup wizards, feature tours, or tooltip walkthroughs
- NO modal popups blocking workflow for auth
- NO forced registration — core loop works without login
- NO feature clutter in the toolbar — auth button is secondary and separate

**Intent Preservation:**
- After OAuth popup completes, return user to the editor seamlessly
- localStorage content MUST survive auth state transitions (sign in / sign out)

### Header Layout Reference

Current Header action buttons (right-to-left in RTL):
1. Load sample button
2. Clear editor button
3. Presentation mode button
4. DirectionToggle
5. ThemeToggle
6. Color panel button
7. Export dropdown
8. Copy dropdown

**Add after all these (at the far left/end):**
- Visual `Separator` (vertical divider)
- `<AuthGate>` → `<AuthButton />` (anonymous) or `<UserMenu />` (authenticated)

### Project Structure Notes

- Alignment with architecture: `components/auth/` folder matches the planned directory structure
- `components/ai/` folder matches planned structure — creating `AiActionPlaceholder.tsx` as foundation for Epic 6
- `types/user.ts` follows existing pattern of `types/editor.ts` and `types/colors.ts`
- `lib/hooks/useCurrentUser.ts` follows existing pattern of `lib/hooks/useEditorContent.ts` etc.
- Tests co-located with source files per project convention

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase files | `AuthButton.tsx`, `UserMenu.tsx` |
| Component directories | kebab-case | `components/auth/` |
| Hooks | `use` prefix, camelCase | `useCurrentUser.ts` |
| Types | PascalCase | `UserTier`, `UserProfile` |
| Test files | `.test.tsx` co-located | `AuthButton.test.tsx` |
| CSS/Tailwind | Logical properties | `ms-4` not `ml-4`, `text-start` not `text-left` |
| UI text | Hebrew | `"הרשמה / התחברות"` |
| Error messages | Hebrew + English | `message` + `messageEn` |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@clerk/nextjs` | ^7.0.1 | `useUser`, `useAuth`, `<UserButton />`, `<SignInButton />` | Already installed |
| `convex` | ^1.32.0 | `useQuery`, `useConvexAuth`, `<Authenticated>`, `<Unauthenticated>` | Already installed |
| `react` | 19.2.3 | React framework | Already installed |
| `next` | 16.1.6 | App Router | Already installed |

**No new packages need to be installed for this story.**

### Clerk Component Reference

**`<UserButton />`** from `@clerk/nextjs`:
- Renders user avatar with dropdown menu
- Built-in "Manage account" and "Sign out" options
- Customizable via `appearance` prop for sizing
- Must be used in client components (`"use client"`)

**`useUser()`** from `@clerk/nextjs`:
- Returns `{ isSignedIn, isLoaded, user }`
- `user` contains `firstName`, `lastName`, `imageUrl`, `emailAddresses`
- Must be used in client components

**`useConvexAuth()`** from `convex/react`:
- Returns `{ isAuthenticated, isLoading }`
- Syncs with Clerk auth state via ConvexProviderWithClerk
- Use to gate Convex queries with `"skip"` parameter

**`<SignInButton />`** from `@clerk/nextjs`:
- Wraps any element to make it trigger sign-in flow
- Use `mode="modal"` for popup (preserves editor state) or `mode="redirect"` for navigation

### Testing Requirements

**Framework:** Vitest (already configured in `vitest.config.ts`)

**Mocking Clerk hooks:**
```typescript
// Mock @clerk/nextjs
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(),
  UserButton: vi.fn(() => <div data-testid="clerk-user-button" />),
  SignInButton: vi.fn(({ children }) => children),
}));
```

**Mocking Convex hooks:**
```typescript
// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useConvexAuth: vi.fn(),
}));
```

**Required test scenarios:**

1. **AuthButton** — Renders Hebrew text, links to sign-in, correct styling
2. **UserMenu** — Renders UserButton when authenticated, shows tier badge for paid users
3. **AuthGate** — Shows AuthButton when anonymous, shows UserMenu when authenticated, shows loading state
4. **Header with auth** — Auth section appears after separator, correct component renders per state
5. **AiActionPlaceholder** — Shows register prompt for anonymous, shows placeholder for authenticated
6. **localStorage persistence** — Content survives mock auth state transitions

**Testing pattern (from existing codebase):**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";

describe("ComponentName", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => { root?.unmount(); });
    container.remove();
  });

  it("should render correctly", () => {
    act(() => {
      root = createRoot(container);
      root.render(<Component />);
    });
    // Assert with document.querySelector or data-testid
  });
});
```

### Previous Story Intelligence

**From Story 5.1 (prerequisite):**
- Convex `users` table schema: `clerkId` (indexed), `email` (optional), `name` (optional), `tier` (`"free" | "paid"`), `createdAt`
- `getCurrentUser` query returns user object or `null` — uses `ctx.auth.getUserIdentity()` to check auth
- `getCurrentUserOrThrow` throws `ConvexError` with code `"USER_NOT_FOUND"` when no user
- Anonymous users have NO record in the users table — only `"free"` and `"paid"` exist as tier values
- `identity.subject` from Clerk is the clerkId used for lookups

**From Stories 4.1/4.2 (most recent implemented):**
- Pure function patterns work well for testable code
- Test co-location: component tests next to source, convex tests in `convex/__tests__/`
- All 229+ existing tests must continue passing

**From Stories 3.x (export stories):**
- Logical CSS properties enforced (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
- Hebrew UI text standard
- Toast notifications for async feedback (RTL, bottom-center, 3000ms via Sonner)

**Common patterns established:**
- `"use client"` directive on all interactive components
- Props interfaces defined inline or in types/ folder
- Tailwind for all styling, logical properties for RTL
- shadcn/ui components from `components/ui/` for primitives

### Git Intelligence

Recent commit pattern:
```
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
d16e68a Implement Story 4.1: Per-sentence BiDi detection engine
ebed371 Fix Story 3.4 code review issues: logical CSS, lang attr, LTR test, toast duration
2421ec3 Fix Story 3.3 code review issues: dynamic direction, test coverage gaps, click spy
```

**Expected commit for this story:** `Implement Story 5.2: Anonymous and authenticated editor experience`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Authentication & Security, Three-Tier Authorization]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture, Convex Schema]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component Architecture, State Management]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Auth UI Flows, Anonymous vs Authenticated]
- [Source: _bmad-output/planning-artifacts/prd.md — FR32, FR33, FR34, FR35]
- [Source: _bmad-output/implementation-artifacts/5-1-clerk-authentication-integration-and-user-sync.md — Previous Story]
- [Source: Clerk docs — useUser hook](https://clerk.com/docs/nextjs/reference/hooks/use-user)
- [Source: Clerk docs — UserButton component](https://clerk.com/docs/nextjs/reference/components/user/user-button)
- [Source: Convex docs — Storing Users in Database](https://docs.convex.dev/auth/database-auth)
- [Source: Convex docs — Auth in Functions](https://docs.convex.dev/auth/functions-auth)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Created auth components: AuthButton (outlined sign-in button with Hebrew text), UserMenu (Clerk UserButton wrapper with gold paid badge and primary color theming), AuthGate (conditional renderer using useCurrentUser hook)
- Created user types (UserTier) and useCurrentUser custom hook wrapping Convex query with auth-aware skip pattern
- Integrated auth UI into Header with vertical separator divider after toolbar buttons, before AuthGate
- Created AiActionPlaceholder showing Hebrew register prompt for anonymous users and coming-soon text for authenticated users
- Verified localStorage persistence across auth transitions with dedicated integration tests
- All 300 tests pass (266 existing + 34 new), zero regressions
- Used SignInButton mode="modal" to preserve editor state during auth flow (no page navigation)
- Logical CSS properties used throughout (end/start, not left/right)

### File List

**New files:**
- components/auth/AuthButton.tsx
- components/auth/AuthButton.test.tsx
- components/auth/UserMenu.tsx
- components/auth/UserMenu.test.tsx
- components/auth/AuthGate.tsx
- components/auth/AuthGate.test.tsx
- components/auth/auth-persistence.test.tsx
- components/ai/AiActionPlaceholder.tsx
- components/ai/AiActionPlaceholder.test.tsx
- types/user.ts
- lib/hooks/useCurrentUser.ts
- lib/hooks/useCurrentUser.test.ts
- components/layout/Header.test.tsx

**Modified files:**
- components/layout/Header.tsx

## Senior Developer Review (AI)

**Reviewer:** BenAkiva — 2026-03-08
**Outcome:** Approved with fixes applied

### Issues Found & Fixed
- **[HIGH] AuthGate duplicated useCurrentUser hook logic** — AuthGate.tsx reimplemented the same `useConvexAuth + useQuery` pattern instead of importing `useCurrentUser`. Fixed: AuthGate now imports and uses the hook.
- **[MEDIUM] Dead UserProfile type** — `types/user.ts` exported `UserProfile` but nothing imported it. Fixed: removed `UserProfile`, kept `UserTier`. Updated `UserMenu` to import `UserTier` from `types/user.ts`.
- **[MEDIUM] AC6 initials avatar primary color not enforced** — Clerk UserButton used default colors instead of project primary. Fixed: added `variables: { colorPrimary: "hsl(var(--primary))" }` to Clerk appearance config.
- **[LOW] Gold badge missing role attribute** — Badge `<span>` had `aria-label` but no `role`, reducing screen reader reliability. Fixed: added `role="img"`.

### Issues Noted (Not Fixed)
- **[MEDIUM] AiActionPlaceholder not mounted in any page** — AC1/AC5 imply visibility but Task 4 scopes only "Create". Component works correctly; mounting deferred to Epic 6 when AI panel is built.
- **[LOW] Separator uses raw div instead of shadcn/ui Separator** — Functionally equivalent.
- **[LOW] AiActionPlaceholder uses raw `<button>` instead of shadcn/ui Button** — Style inconsistency.
- **[LOW] AuthButton uses `mode="modal"` vs Dev Notes spec of `/sign-in` link** — Documented deliberate deviation for better UX.
- **[LOW] No DOM order test for auth section position** — Tests verify separator exists but not element ordering.

### Test Impact
- Removed 2 redundant AuthGate tests (Convex query arg verification) — now covered by `useCurrentUser.test.ts`
- Updated AuthGate tests to mock `useCurrentUser` instead of `convex/react` directly
- Updated UserMenu test to verify `role="img"` on gold badge
- Final: 28 test files, 300 tests passing

## Change Log

- 2026-03-08: Implemented Story 5.2 — Anonymous & Authenticated Editor Experience. Added auth components (AuthButton, UserMenu, AuthGate), user types/hooks, AI action placeholder, integrated auth UI into Header, and verified localStorage persistence. 36 new tests, 302 total passing.
- 2026-03-08: Code review fixes — AuthGate uses useCurrentUser hook (eliminated duplication), removed dead UserProfile type, added Clerk primary color theming, improved badge accessibility. 300 tests passing.
