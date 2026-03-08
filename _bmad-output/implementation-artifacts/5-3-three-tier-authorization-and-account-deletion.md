# Story 5.3: Three-Tier Authorization & Account Deletion

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the system to correctly enforce my access tier, and I want the ability to delete my account and all data,
so that I get the right features for my tier and can exercise my right to data deletion.

## Acceptance Criteria

1. **Anonymous capabilities** — Given a user with no Clerk session, when the system checks their capabilities, then they have access to: editor, preview, theming, exports — but NOT AI features.

2. **Free tier capabilities** — Given a user with a Clerk session and tier "free" (no subscription), when the system checks their capabilities, then they have access to: all anonymous features PLUS limited AI (Sonnet only).

3. **Paid tier capabilities** — Given a user with a Clerk session and tier "paid" (active subscription), when the system checks their capabilities, then they have access to: all free features PLUS unlimited Sonnet and daily Opus allocation.

4. **Account deletion** — Given a logged-in user requests account deletion, when they confirm the deletion, then their Convex user record and all associated data are deleted, and their Clerk account is deleted via the Clerk Backend API, and a confirmation message is displayed in Hebrew, and the user is returned to anonymous mode.

## Tasks / Subtasks

- [x] Task 1: Create tier capability definitions (AC: #1, #2, #3)
  - [x] 1.1 Create `lib/auth/capabilities.ts` — `TierCapabilities` interface, `TIER_CAPABILITIES` constant mapping each tier to feature flags (canUseAi, canUseSonnet, canUseOpus, hasAiLimit, aiModelAccess)
  - [x] 1.2 Create `getCapabilitiesForTier(tier: UserTier | "anonymous")` — Returns capabilities for a tier
  - [x] 1.3 Create `lib/auth/capabilities.test.ts` — Tests verifying capabilities for all three tiers

- [x] Task 2: Create useCapabilities hook (AC: #1, #2, #3)
  - [x] 2.1 Create `lib/hooks/useCapabilities.ts` — Wraps `useCurrentUser` + `getCapabilitiesForTier`, returns `{ capabilities, tier, isLoading }`
  - [x] 2.2 Create `lib/hooks/useCapabilities.test.ts` — Tests for anonymous, free, and paid tiers

- [x] Task 3: Create Convex authorization guards (AC: #1, #2, #3)
  - [x] 3.1 Create `convex/lib/authorization.ts` — `requireAuth(ctx)` helper that returns authenticated user or throws, `requireTier(ctx, minTier)` helper for tier enforcement
  - [x] 3.2 Create `convex/lib/tierLimits.ts` — Constants for AI usage limits per tier (`FREE_MONTHLY_AI_LIMIT`, `PAID_DAILY_OPUS_LIMIT`), `checkAiAccess(user, model)` function
  - [x] 3.3 Create `convex/__tests__/authorization.test.ts` — Tests for auth guards and tier checking

- [x] Task 4: Create account deletion backend (AC: #4)
  - [x] 4.1 Add `deleteMyAccount` action to `convex/users.ts` — Verifies auth, deletes user record from Convex, calls Clerk Backend API to delete Clerk user
  - [x] 4.2 Ensure `CLERK_SECRET_KEY` is documented as required Convex env var for Clerk API calls
  - [x] 4.3 Make existing `deleteFromClerk` mutation idempotent (handle case where user already deleted by `deleteMyAccount`)
  - [x] 4.4 Create `convex/__tests__/deleteAccount.test.ts` — Tests for deletion flow

- [x] Task 5: Create account deletion UI (AC: #4)
  - [x] 5.1 Create `components/auth/DeleteAccountDialog.tsx` — AlertDialog with Hebrew confirmation text ("מחיקת חשבון", "פעולה זו תמחק את החשבון שלך ואת כל הנתונים לצמיתות. לא ניתן לבטל פעולה זו."), requires typing confirmation
  - [x] 5.2 Create `components/auth/DeleteAccountButton.tsx` — Destructive button that opens the dialog, placed in user account area
  - [x] 5.3 Integrate delete option into UserMenu via Clerk's `<UserButton />` custom menu items or a separate account settings section
  - [x] 5.4 Handle post-deletion: show Hebrew success toast ("החשבון נמחק בהצלחה"), return to anonymous mode
  - [x] 5.5 Create `components/auth/DeleteAccountDialog.test.tsx` — Tests for dialog rendering, confirmation flow, and error states

- [x] Task 6: Verify existing functionality
  - [x] 6.1 Verify all existing 300 tests still pass
  - [x] 6.2 Verify editor works fully for anonymous users (no regression)
  - [x] 6.3 Verify auth flow (sign in, sign out, UserButton) continues working

## Dev Notes

### CRITICAL: Stories 5.1 and 5.2 are prerequisites

Both Story 5.1 (Clerk + Convex integration) and Story 5.2 (anonymous/authenticated UI) are **done**. The following already exist and MUST NOT be recreated:

**From Story 5.1:**
- `convex/schema.ts` — `users` table: `clerkId` (string, indexed), `email` (optional string), `name` (optional string), `tier` (`"free" | "paid"`), `createdAt` (number)
- `convex/users.ts` — `getCurrentUser` query (returns user or null), `getCurrentUserOrThrow` query (throws ConvexError), `upsertFromClerk` / `deleteFromClerk` internal mutations
- `convex/http.ts` — Webhook handler at `/clerk-users-webhook` for `user.created`, `user.updated`, `user.deleted` events
- `convex/auth.config.ts` — Clerk JWT issuer domain

**From Story 5.2:**
- `components/auth/AuthButton.tsx` — Outlined "הרשמה / התחברות" button using `SignInButton mode="modal"`
- `components/auth/UserMenu.tsx` — Clerk `<UserButton />` wrapper with gold paid badge, primary color theming via `variables: { colorPrimary: "hsl(var(--primary))" }`
- `components/auth/AuthGate.tsx` — Conditional renderer using `useCurrentUser` hook
- `components/ai/AiActionPlaceholder.tsx` — Hebrew register prompt for anonymous, coming-soon for authenticated
- `types/user.ts` — Exports `UserTier` type (`"free" | "paid"`)
- `lib/hooks/useCurrentUser.ts` — Returns `{ user, isLoading, isAuthenticated }`
- `components/layout/Header.tsx` — Has auth section with separator + AuthGate at far left of actions

### Architecture: Two-Layer Authorization

**Frontend (convenience layer — UI gating only):**
- `lib/auth/capabilities.ts` — Pure function mapping tier to feature flags
- `lib/hooks/useCapabilities.ts` — React hook consuming `useCurrentUser` + `getCapabilitiesForTier`
- Used by UI components to show/hide/dim features per tier
- **NEVER trust frontend for security decisions**

**Backend (enforcement — security boundary):**
- `convex/lib/authorization.ts` — Server-side guards that throw `ConvexError` on unauthorized access
- `convex/lib/tierLimits.ts` — AI usage limit constants and checking functions
- Every Convex mutation/action that needs auth MUST use these guards
- Epic 6 (AI) will import these guards to enforce tier-based AI access

### Three-Tier Capability Model

| Feature | Anonymous | Free | Paid |
|---------|-----------|------|------|
| Editor, preview, theming | Yes | Yes | Yes |
| All export formats | Yes | Yes | Yes |
| AI features | No | Yes (limited) | Yes (unlimited) |
| Sonnet model | No | Yes | Yes (unlimited) |
| Opus model | No | No | Yes (daily allocation) |
| Account deletion | N/A | Yes | Yes |

**Capability interface shape:**
```typescript
interface TierCapabilities {
  canUseAi: boolean;
  canUseSonnet: boolean;
  canUseOpus: boolean;
  hasAiLimit: boolean;
  maxMonthlyAiCalls: number | null; // null = unlimited
  maxDailyOpusCalls: number | null; // null = N/A or unlimited
}
```

**AI limit constants (defined now, enforced in Epic 6):**
- `FREE_MONTHLY_AI_LIMIT` — TBD (PRD says "limited per month", exact number deferred to Epic 6 validation)
- `PAID_DAILY_OPUS_LIMIT` — TBD (PRD says "daily Opus allocation")
- Use placeholder values (e.g., 10 monthly free, 5 daily Opus) with clear `// TODO: finalize limits` comments

### Account Deletion Flow

```
User clicks "Delete Account" in UserButton menu
  → DeleteAccountDialog opens (AlertDialog)
  → User types "מחק" to confirm
  → Frontend calls Convex action `deleteMyAccount`
  → Convex action:
    1. ctx.auth.getUserIdentity() → get clerkId
    2. Query users table by clerkId → get user record
    3. Delete user from Convex users table
    4. (Future: cascade delete from aiUsage, analyticsEvents, subscriptions)
    5. Call Clerk Backend API: DELETE https://api.clerk.com/v1/users/{clerk_user_id}
       Headers: { Authorization: "Bearer ${CLERK_SECRET_KEY}" }
    6. Return success
  → Frontend shows toast: "החשבון נמחק בהצלחה"
  → Clerk detects session invalidation → user becomes anonymous
  → (Clerk webhook fires user.deleted → deleteFromClerk runs → idempotent, user already gone)
```

**CRITICAL: Clerk API call requires `CLERK_SECRET_KEY` as Convex env var.**
Run `npx convex env set CLERK_SECRET_KEY <value>` before testing deletion.
The key is already in `.env.local` for Next.js but Convex needs its own copy.

**Idempotent deletion:** The `deleteFromClerk` internal mutation (webhook handler) will fire AFTER `deleteMyAccount` already deleted the user. It must handle "user not found" gracefully — no-op, no error.

### Clerk UserButton Custom Menu Items

To add "Delete Account" to the existing `<UserButton />`, use Clerk's `<UserButton.MenuItems>` API:

```typescript
<UserButton
  appearance={{ /* existing config */ }}
>
  <UserButton.MenuItems>
    <UserButton.Action
      label="מחיקת חשבון"
      labelIcon={<Trash2 className="h-4 w-4" />}
      onClick={() => setShowDeleteDialog(true)}
    />
  </UserButton.MenuItems>
</UserButton>
```

This adds a custom action to the UserButton dropdown without replacing the built-in "Manage account" and "Sign out" options.

### Convex Action Pattern for External API Calls

Account deletion is a Convex `action` (not mutation) because it calls the Clerk external API:

```typescript
import { action } from "./_generated/server";
import { ConvexError } from "convex/values";

export const deleteMyAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "AUTH_REQUIRED",
        message: "נדרש התחברות כדי למחוק חשבון",
        messageEn: "Authentication required to delete account",
      });
    }

    const clerkId = identity.subject;

    // Delete from Convex (via internal mutation)
    await ctx.runMutation(internal.users.deleteFromClerk, { clerkId });

    // Delete from Clerk via Backend API
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new ConvexError({
        code: "CONFIG_ERROR",
        message: "שגיאת הגדרות שרת",
        messageEn: "Server configuration error: missing CLERK_SECRET_KEY",
      });
    }

    const response = await fetch(
      `https://api.clerk.com/v1/users/${clerkId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new ConvexError({
        code: "CLERK_DELETE_FAILED",
        message: "שגיאה במחיקת החשבון. נסה שוב.",
        messageEn: "Failed to delete Clerk account",
      });
    }
  },
});
```

**Note:** `response.status === 404` is acceptable — means Clerk already deleted the user.

### Convex Authorization Guard Pattern

```typescript
// convex/lib/authorization.ts
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function requireAuth(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "AUTH_REQUIRED",
      message: "נדרש התחברות",
      messageEn: "Authentication required",
    });
  }
  return identity;
}
```

**For tier enforcement (used by Epic 6 AI functions):**
```typescript
export async function requireTier(
  ctx: QueryCtx | MutationCtx,
  minTier: "free" | "paid"
) {
  const identity = await requireAuth(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "משתמש לא נמצא",
      messageEn: "User not found",
    });
  }

  if (minTier === "paid" && user.tier !== "paid") {
    throw new ConvexError({
      code: "TIER_INSUFFICIENT",
      message: "נדרש מנוי בתשלום לתכונה זו",
      messageEn: "Paid subscription required for this feature",
    });
  }

  return user;
}
```

### Project Structure Notes

**New files to create:**

| File | Purpose |
|------|---------|
| `lib/auth/capabilities.ts` | Tier capability definitions and `getCapabilitiesForTier()` |
| `lib/auth/capabilities.test.ts` | Tests for capability mapping |
| `lib/hooks/useCapabilities.ts` | React hook for current user capabilities |
| `lib/hooks/useCapabilities.test.ts` | Tests for capabilities hook |
| `convex/lib/authorization.ts` | Server-side `requireAuth()`, `requireTier()` guards |
| `convex/lib/tierLimits.ts` | AI usage limit constants and `checkAiAccess()` |
| `convex/__tests__/authorization.test.ts` | Tests for auth guards |
| `convex/__tests__/deleteAccount.test.ts` | Tests for account deletion |
| `components/auth/DeleteAccountDialog.tsx` | AlertDialog with Hebrew confirmation |
| `components/auth/DeleteAccountDialog.test.tsx` | Tests for deletion dialog |

**Files to modify:**

| File | Change |
|------|--------|
| `convex/users.ts` | Add `deleteMyAccount` action, make `deleteFromClerk` idempotent |
| `components/auth/UserMenu.tsx` | Add `<UserButton.MenuItems>` with delete account action |
| `components/auth/UserMenu.test.tsx` | Add tests for delete account menu item |

**Alignment with project structure:**
- `lib/auth/` follows existing `lib/hooks/`, `lib/colors/`, `lib/bidi/` pattern
- `convex/lib/` is a new subfolder for shared Convex helpers — keeps `convex/` root for entity-specific files
- Tests co-located per project convention
- `components/auth/` already exists from Story 5.2

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase files | `DeleteAccountDialog.tsx` |
| Utility functions | camelCase | `getCapabilitiesForTier`, `requireAuth` |
| Constants | UPPER_SNAKE_CASE | `FREE_MONTHLY_AI_LIMIT`, `PAID_DAILY_OPUS_LIMIT` |
| Types/Interfaces | PascalCase | `TierCapabilities`, `AiModel` |
| Convex functions | camelCase verb prefix | `deleteMyAccount` (action) |
| Error codes | UPPER_SNAKE_CASE | `AUTH_REQUIRED`, `TIER_INSUFFICIENT` |
| CSS/Tailwind | Logical properties | `ms-4`, `text-start`, `end-0` |
| UI text | Hebrew | `"מחיקת חשבון"`, `"החשבון נמחק בהצלחה"` |
| Error messages | Hebrew + English | `message` + `messageEn` |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@clerk/nextjs` | ^7.0.1 | `useClerk().signOut()`, `UserButton`, `UserButton.MenuItems` | Already installed |
| `convex` | ^1.32.0 | `action`, `internal`, `ConvexError`, `ctx.runMutation` | Already installed |
| `sonner` | ^2.0.7 | Toast notifications for deletion feedback | Already installed |
| `lucide-react` | (installed) | `Trash2` icon for delete menu item | Already installed |

**No new packages need to be installed for this story.**

**shadcn/ui components needed:**
- `AlertDialog` — for deletion confirmation. Check if `components/ui/alert-dialog.tsx` exists. If not, install: `npx shadcn@latest add alert-dialog`
- `Button` — already installed
- `Input` — already installed (for "מחק" typing confirmation)

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Current baseline:** 28 test files, 300 tests passing

**Mocking patterns (from Story 5.2):**

```typescript
// Mock useCurrentUser (established in Story 5.2)
vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

// Mock Convex useMutation for deletion
vi.mock("convex/react", () => ({
  useAction: vi.fn(),
  useQuery: vi.fn(),
  useConvexAuth: vi.fn(),
}));
```

**Required test scenarios:**

1. **capabilities.test.ts** — Anonymous returns `canUseAi: false`, free returns `canUseAi: true, canUseOpus: false`, paid returns `canUseOpus: true, hasAiLimit: false`
2. **useCapabilities.test.ts** — Returns correct capabilities for each auth state, handles loading state
3. **authorization.test.ts** — `requireAuth` throws on no identity, `requireTier` throws on insufficient tier, both return user on success
4. **deleteAccount.test.ts** — Successful deletion calls both Convex and Clerk, handles Clerk 404 gracefully, throws on missing CLERK_SECRET_KEY
5. **DeleteAccountDialog.test.tsx** — Dialog renders Hebrew text, confirm button disabled until "מחק" typed, calls action on confirm, shows toast on success, handles errors

**Testing pattern (from existing codebase):**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";

describe("DeleteAccountDialog", () => {
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
});
```

### Previous Story Intelligence

**From Story 5.2 (immediate predecessor, done):**
- `useCurrentUser` hook is the canonical way to get auth state — import it, don't recreate
- AuthGate was refactored in code review to use `useCurrentUser` instead of duplicating logic — follow this pattern
- `UserProfile` type was removed as dead code — don't create types that nothing imports
- Clerk `appearance.variables.colorPrimary` set to `"hsl(var(--primary))"` — maintain this theming
- Gold badge uses `role="img"` + `aria-label` — follow this accessibility pattern
- `SignInButton mode="modal"` chosen over redirect — preserves editor state
- Separator in Header is a raw `div` (not shadcn Separator) — functionally equivalent, don't "fix"
- 300 tests passing across 28 test files
- Mock `useCurrentUser` not `convex/react` directly when testing components that use auth

**From Story 5.1:**
- `deleteFromClerk` already exists as internal mutation — reuse it in `deleteMyAccount` action via `ctx.runMutation(internal.users.deleteFromClerk, { clerkId })`
- Webhook handler validates Svix signatures — don't bypass this
- `identity.subject` is the Clerk user ID used as `clerkId`

**Code review lessons to apply:**
- Don't duplicate hook logic — import existing hooks
- Don't create unused types — only export what's consumed
- Add `role` attributes to decorative/informational elements for accessibility
- Test mocks should target the highest-level abstraction (mock `useCurrentUser`, not raw Convex hooks)

### Git Intelligence

Recent commits:
```
32281fb Implement Story 5.2: Anonymous and authenticated editor experience
a489249 Implement Story 5.1: Clerk auth integration and Convex user sync
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
d16e68a Implement Story 4.1: Per-sentence BiDi detection engine
ebed371 Fix Story 3.4 code review issues: logical CSS, lang attr, LTR test, toast duration
```

**Expected commit:** `Implement Story 5.3: Three-tier authorization and account deletion`

### Post-Deletion Client-Side Flow

After the Convex action succeeds, the client must:
1. Call `clerk.signOut()` via the `useClerk()` hook from `@clerk/nextjs` — this invalidates the Clerk session client-side
2. Show success toast via Sonner: `toast.success("החשבון נמחק בהצלחה")`
3. The user automatically returns to anonymous mode (AuthGate re-renders with `<AuthButton />`)

```typescript
import { useClerk } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// In the deletion handler:
const { signOut } = useClerk();
const deleteMyAccount = useAction(api.users.deleteMyAccount);

const handleDelete = async () => {
  await deleteMyAccount();
  await signOut();
  toast.success("החשבון נמחק בהצלחה");
};
```

### Future Epic Awareness

**Epic 6 (AI Document Actions) will consume the authorization system:**
- `getCapabilitiesForTier()` and `useCapabilities` will gate AI features in the command palette UI
- `requireAuth()` and `requireTier()` will enforce tier-based AI access in Convex AI actions
- `aiUsage` Convex table will be created — `deleteMyAccount` must be updated to cascade-delete AI usage records

**Epic 8 (Analytics & Operator Tools) will add:**
- `analyticsEvents` Convex table — `deleteMyAccount` must cascade-delete analytics records
- `checkAiAccess()` from `tierLimits.ts` will be used for abuse detection

**Epic 9 (Payments & Subscriptions) will add:**
- `subscriptions` Convex table — `deleteMyAccount` must cancel active subscriptions and cascade-delete records
- Tier upgrade mutations (free → paid) will update the `tier` field

Add `// TODO: cascade delete from [tableName] when Epic X is implemented` comments in `deleteMyAccount` for each future table.

### Project Context Warning

The `project-context.md` file describes the v1 architecture (single-file vanilla JS SPA). The project has been rebuilt as a Next.js 16 + Convex + Clerk application. **Ignore** the project-context.md technology stack — follow the architecture patterns established in Stories 5.1 and 5.2 instead.

### Anti-Patterns to AVOID

- **Do NOT gate core editor features behind authentication** — editor is fully functional for anonymous users
- **Do NOT create a navigation bar** — No "Home / Pricing / Settings" nav. Marko is a tool, not a website
- **Do NOT create a separate settings/account page** — Delete account lives inside UserButton dropdown
- **Do NOT add modal popups blocking workflow for auth** — deletion dialog is the only acceptable modal
- **Do NOT store AI limits in the database** — keep them as constants, change via code deployment
- **Do NOT implement actual AI rate limiting enforcement** — that's Epic 6. Only define the constants and checking functions here
- **Do NOT create `aiUsage` or `analyticsEvents` tables** — those are Epic 6 and Epic 8. Account deletion function should note future cascade deletes with TODO comments

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Authentication & Security, Three-Tier Authorization]
- [Source: _bmad-output/planning-artifacts/architecture.md — API & Communication Patterns, Convex Function Types]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture, Convex Schema]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Auth UI: Minimal Header Integration, Journey 3]
- [Source: _bmad-output/planning-artifacts/prd.md — FR32, FR33, FR34, FR35, FR50, FR51, FR52]
- [Source: _bmad-output/implementation-artifacts/5-1-clerk-authentication-integration-and-user-sync.md]
- [Source: _bmad-output/implementation-artifacts/5-2-anonymous-and-authenticated-editor-experience.md]
- [Source: Clerk docs — deleteUser() Backend API](https://clerk.com/docs/reference/backend/user/delete-user)
- [Source: Clerk docs — Deleting Users Guide](https://clerk.com/docs/users/deleting-users)
- [Source: Convex docs — Actions (External API Calls)](https://docs.convex.dev/functions/actions)
- [Source: Convex docs — Clerk Integration](https://docs.convex.dev/auth/clerk)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No blocking issues encountered during implementation

### Completion Notes List
- Created three-tier capability system (anonymous/free/paid) with `TierCapabilities` interface and `getCapabilitiesForTier()` pure function
- Created `useCapabilities` React hook wrapping `useCurrentUser` + `getCapabilitiesForTier` for UI-layer tier gating
- Created Convex server-side authorization guards: `requireAuth()` for auth enforcement, `requireTier()` for tier-based access control
- Created `tierLimits.ts` with AI usage limit constants and `checkAiAccess()` function (enforcement deferred to Epic 6)
- Added `deleteMyAccount` Convex action to `users.ts` — deletes user from Convex via existing `deleteFromClerk` internal mutation, then calls Clerk Backend API to delete Clerk user
- `deleteFromClerk` was already idempotent (checks `if (user)` before deletion) — no changes needed
- Created `DeleteAccountDialog` with Hebrew confirmation UI — user must type "מחק" to confirm, shows toast on success/error
- Integrated delete account option into `UserMenu` via Clerk `<UserButton.MenuItems>` API
- Added TODO comments in `deleteMyAccount` for future cascade deletes (Epic 6, 8, 9)
- Updated 3 existing test files (`AuthGate.test.tsx`, `Header.test.tsx`, `auth-persistence.test.tsx`) to add mocks for `useClerk`, `useAction`, and `sonner` required by new `DeleteAccountDialog` dependency
- All 339 tests pass (33 test files), including 39 new tests across 5 new test files + 1 updated test file
- Task 5.2 (`DeleteAccountButton.tsx`) was not created as a separate component — the delete trigger is a `UserButton.Action` inline in `UserMenu.tsx`, which is more appropriate since the button lives inside Clerk's `UserButton` dropdown and a wrapper component would be unnecessary

### Change Log
- 2026-03-08: Implemented Story 5.3 — three-tier authorization system and account deletion functionality
- 2026-03-08: Code review fixes — `deleteMyAccount` now uses `requireAuth()` guard instead of duplicating auth check; `checkAiAccess` returns Hebrew + English messages; added missing assertion to "enables confirm button" test; added integration test for delete action → dialog flow; added `requireTier` documentation comment
- 2026-03-08: Code review #2 fixes — (H1) Fixed `DeleteAccountDialog` auto-close bug: Radix `AlertDialogAction` wraps `DialogPrimitive.Close` which auto-closes dialog on click; added `e.preventDefault()` so dialog stays open and shows "מוחק..." loading state during async deletion. (H2) Reversed `deleteMyAccount` deletion order: Clerk API is called first, then Convex mutation; if Clerk fails nothing is deleted and user can retry; if Clerk succeeds but Convex fails, the webhook handles cleanup idempotently. (M2) Documented `CLERK_SECRET_KEY` as required Convex env var in `.env.example`. (L1) Added test verifying dialog stays open with loading state during async deletion. Added 3 new tests (deletion order verification, Convex-not-called-on-failure, loading state persistence).

### File List

**New files:**
- `lib/auth/capabilities.ts` — Tier capability definitions, `TierCapabilities` interface, `getCapabilitiesForTier()`
- `lib/auth/capabilities.test.ts` — 8 tests for capability mapping across all tiers
- `lib/hooks/useCapabilities.ts` — React hook for current user capabilities
- `lib/hooks/useCapabilities.test.ts` — 4 tests for hook behavior (anonymous, free, paid, loading)
- `convex/lib/authorization.ts` — Server-side `requireAuth()`, `requireTier()` guards
- `convex/lib/tierLimits.ts` — AI limit constants and `checkAiAccess()` function
- `convex/__tests__/authorization.test.ts` — 14 tests for auth guards, tier checking, and AI access
- `convex/__tests__/deleteAccount.test.ts` — 7 tests for account deletion action (including deletion order and rollback safety)
- `components/auth/DeleteAccountDialog.tsx` — AlertDialog with Hebrew confirmation and deletion flow
- `components/auth/DeleteAccountDialog.test.tsx` — 8 tests for dialog rendering, confirmation, loading state, and error handling
- `components/ui/alert-dialog.tsx` — shadcn AlertDialog component (installed)
- `components/ui/input.tsx` — shadcn Input component (installed)

**Modified files:**
- `convex/users.ts` — Added `deleteMyAccount` action using `requireAuth()` guard, added imports for `action`, `internal`, and `requireAuth`
- `components/auth/UserMenu.tsx` — Added `<UserButton.MenuItems>` with delete account action and `DeleteAccountDialog`
- `components/auth/UserMenu.test.tsx` — Updated mock for UserButton children, added delete menu action test and dialog integration test
- `components/auth/AuthGate.test.tsx` — Added mocks for `useClerk`, `useAction`, `sonner`, `api.users.deleteMyAccount`
- `components/layout/Header.test.tsx` — Added mocks for `useClerk`, `useAction`, `sonner`, `api.users.deleteMyAccount`
- `components/auth/auth-persistence.test.tsx` — Added mocks for `useClerk`, `useAction`, `sonner`, `api.users.deleteMyAccount`
- `.env.example` — Documented `CLERK_SECRET_KEY` as required Convex env var for account deletion
