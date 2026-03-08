# Story 6.4: AI Usage Limits & Upgrade Prompts

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a free registered user,
I want to know my AI usage limits and see a gentle prompt to upgrade when I reach them,
So that I understand the value proposition without feeling pressured.

## Acceptance Criteria

1. **Public usage query** — Given a registered user is logged in, when the frontend queries their AI usage, then a public Convex query (`getMyMonthlyUsage`) returns their current monthly usage count and the monthly limit for their tier (free: 10, paid: null/unlimited).

2. **Remaining count in command palette** — Given a free user with remaining AI calls opens the command palette, then the remaining count is displayed as "נותרו X פעולות AI" (X AI actions remaining) at the bottom of the palette actions list, using a muted/secondary text style.

3. **Exhausted quota gate in palette** — Given a free user who has exhausted their monthly AI limit opens the command palette, then all AI actions appear dimmed/disabled, and a gate section at the bottom displays: "ניצלת את כל פעולות ה-AI החינמיות החודש. שדרג לגישה בלתי מוגבלת ל-AI." (You've used all your free AI actions this month. Upgrade for unlimited AI access.) with an upgrade link/button.

4. **Backend rejection handling** — Given a free user attempts an AI action and the backend rejects with `AI_LIMIT_REACHED` (edge case: quota exhausted between palette open and action execution), then the palette/UI displays the quota-exhausted state (AC #3), a Hebrew error toast is NOT shown (limit communicated contextually, not via toast), and the action does not execute.

5. **Upgrade prompt component** — Given the quota gate section is displayed, then an upgrade button/link is rendered with Hebrew text "שדרג עכשיו" (Upgrade now). In Phase 1, clicking the button shows a toast: "שדרוג יהיה זמין בקרוב!" (Upgrade will be available soon!). In Phase 2, the button navigates to the payment flow.

6. **Non-AI features unaffected** — Given a free user has exhausted their AI quota, then all non-AI features (editing, preview, export, theming, presentation mode) continue to work normally with zero degradation.

7. **Paid user unlimited access** — Given a paid user (Phase 2), when they use AI actions, then Sonnet calls are unlimited (no monthly limit check), Opus calls are tracked against their daily allocation (PAID_DAILY_OPUS_LIMIT = 5), and no upgrade prompts are shown.

8. **Accessibility** — Given the remaining count or quota gate is displayed, then the count uses `aria-live="polite"` for screen reader announcements, the upgrade button has `aria-label="שדרג לגישה בלתי מוגבלת ל-AI"`, and disabled action items have `aria-disabled="true"` with a title explaining why they are disabled.

9. **No preemptive interruptions** — Given the UX design principle "respect over persuasion", then there are NO toolbar banners, NO blocking modals, NO preemptive toast notifications about limits. Limits are communicated ONLY inside the AI command palette when the user actively tries to use AI.

## Tasks / Subtasks

- [x] Task 1: Create public usage query (AC: #1)
  - [x] 1.1 Add `getMyMonthlyUsage` public query to `convex/usage.ts` — verifies auth via `ctx.auth.getUserIdentity()`, looks up user by clerkId, counts `aiUsage` records for the current calendar month, returns `{ count: number, limit: number | null }`
  - [x] 1.2 For free users: return `{ count: N, limit: 10 }` (using `FREE_MONTHLY_AI_LIMIT` from `convex/lib/tierLimits.ts`)
  - [x] 1.3 For paid users: return `{ count: N, limit: null }` (unlimited)
  - [x] 1.4 For unauthenticated users: return `{ count: 0, limit: 0 }` (no AI access)

- [x] Task 2: Integrate usage display into AiCommandPalette (AC: #2, #3, #4, #9)
  - [x] 2.1 In `components/ai/AiCommandPalette.tsx` — add `useQuery(api.usage.getMyMonthlyUsage)` to fetch current usage
  - [x] 2.2 Below the action list, add a remaining count section: if `usage.limit !== null && usage.count < usage.limit`, show "נותרו {remaining} פעולות AI" in muted text
  - [x] 2.3 When `usage.limit !== null && usage.count >= usage.limit`: dim all action items (`aria-disabled="true"`, muted styling, `pointer-events-none`), show gate section at bottom with exhausted message
  - [x] 2.4 Handle `AI_LIMIT_REACHED` error from backend: if `executeAction` throws with code `AI_LIMIT_REACHED`, update palette UI to show exhausted state (refetch usage query), do NOT show error toast for this specific error code

- [x] Task 3: Create UpgradePrompt component (AC: #5, #8, #9)
  - [x] 3.1 Create `components/auth/UpgradePrompt.tsx` — a reusable upgrade CTA component with Hebrew text
  - [x] 3.2 Props: `variant: "inline" | "palette"` — `inline` for general use, `palette` for inside command palette styling
  - [x] 3.3 Upgrade button text: "שדרג עכשיו" (Upgrade now), styled as primary/green button
  - [x] 3.4 Phase 1 behavior: clicking shows toast "שדרוג יהיה זמין בקרוב!" via `sonner`
  - [x] 3.5 Add `aria-label="שדרג לגישה בלתי מוגבלת ל-AI"` on the button
  - [x] 3.6 RTL layout: use `dir="rtl"`, Tailwind logical properties (`ms-*`, `me-*`)

- [x] Task 4: Wire upgrade prompt into palette gate section (AC: #3, #5)
  - [x] 4.1 In the AiCommandPalette quota gate section — render `<UpgradePrompt variant="palette" />` below the exhausted message
  - [x] 4.2 The gate section layout: exhausted message text → upgrade button, all inside the CommandList area
  - [x] 4.3 Ensure gate section is RTL and uses logical CSS properties

- [x] Task 5: Create tests (AC: all)
  - [x] 5.1 Create `convex/__tests__/usagePublicQuery.test.ts` — test `getMyMonthlyUsage` returns correct count for free user, returns null limit for paid user, returns zero for unauthenticated
  - [x] 5.2 Create `components/auth/UpgradePrompt.test.tsx` — test renders Hebrew upgrade text, test click shows toast in Phase 1, test has correct ARIA attributes, test RTL layout
  - [x] 5.3 Update `components/ai/AiCommandPalette.test.tsx` — test remaining count display for free user with quota, test dimmed actions for user at limit, test gate section with upgrade prompt appears when exhausted, test `AI_LIMIT_REACHED` error handling (no toast, shows gate)
  - [x] 5.4 Test paid user sees no limit display and no upgrade prompt

- [x] Task 6: Verify integration and existing tests (AC: all)
  - [x] 6.1 Verify all existing tests still pass (baseline from Stories 6.1, 6.2, 6.3)
  - [x] 6.2 Verify free user with remaining quota: palette shows actions + remaining count
  - [x] 6.3 Verify free user at limit: palette shows dimmed actions + exhausted message + upgrade button
  - [x] 6.4 Verify upgrade button shows Phase 1 toast
  - [x] 6.5 Verify non-AI features (editing, export, theming) unaffected when at limit
  - [x] 6.6 Verify paid user sees no limits or upgrade prompts

## Dev Notes

### CRITICAL: Stories 6.1, 6.2, and 6.3 are prerequisites

All three preceding stories in Epic 6 MUST be implemented before this story. This story extends the AI command palette (6.2), hooks into the AI action flow (6.2/6.3), and uses the backend AI proxy (6.1).

**Story 6.1 (AI Proxy Backend) — done/review:**
- Backend already enforces `FREE_MONTHLY_AI_LIMIT` (10) in `callAnthropicApi`
- Throws `ConvexError` with `code: "AI_LIMIT_REACHED"` when limit exceeded
- Usage logged automatically by the action — no client-side tracking needed

**Story 6.2 (AI Actions UI) — must be implemented first:**
- Creates `AiCommandPalette.tsx`, `AiResultPanel.tsx`, `useAiAction.ts`
- Story 6.2 AC #4 defines the basic quota gate (dimmed actions + message)
- Story 6.2 AC #13 defines remaining count display
- **Story 6.4 EXTENDS Story 6.2's gate** with the UpgradePrompt component and refined error handling

**Story 6.3 (AI Privacy Disclosure) — must be implemented first:**
- Creates `AiDisclosure.tsx` and `useAiDisclosure.ts`
- Disclosure is independent of limits — they don't interact
- But 6.3 must be done first to establish the complete AI action flow

If any prerequisite is not implemented, **STOP** and implement it first.

### Also prerequisite: Stories 5.1, 5.2, 5.3 — ALL implemented

The following exist and MUST NOT be recreated:

| File | Exports | Purpose |
|------|---------|---------|
| `convex/ai.ts` | `callAnthropicApi` action | AI proxy — auth, limits, Anthropic API call |
| `convex/usage.ts` | `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary` | AI usage tracking (all `internalQuery/internalMutation`) |
| `convex/lib/tierLimits.ts` | `FREE_MONTHLY_AI_LIMIT` (10), `PAID_DAILY_OPUS_LIMIT` (5), `checkAiAccess()` | Tier limit constants and checks |
| `convex/lib/authorization.ts` | `requireAuth()`, `requireTier()` | Auth guards |
| `convex/schema.ts` | `aiUsage` table | Schema with `by_userId` and `by_createdAt` indexes |
| `types/ai.ts` | `AiActionType`, `AiModel`, `AiRequestArgs`, `AiResponse` | Frontend type definitions |
| `lib/auth/capabilities.ts` | `TierCapabilities`, `getCapabilitiesForTier()` | Tier capabilities with `hasAiLimit`, `maxMonthlyAiCalls` |
| `lib/hooks/useCapabilities.ts` | `useCapabilities()` | Returns `{ capabilities, tier, isLoading }` |
| `lib/hooks/useCurrentUser.ts` | `useCurrentUser()` | Returns `{ user, isLoading, isAuthenticated }` |
| `components/ui/button.tsx` | `Button` | shadcn button component |

### Architecture: Usage Query and Upgrade Flow

**The key gap this story fills:** All usage queries in `convex/usage.ts` are `internalQuery` — the frontend has NO way to query the user's monthly usage count. This story creates a public query.

```
Frontend queries usage:
  → useQuery(api.usage.getMyMonthlyUsage)
  → Returns { count: N, limit: 10 } for free users
  → Returns { count: N, limit: null } for paid users
  → Returns { count: 0, limit: 0 } for unauthenticated

AiCommandPalette renders:
  → IF has quota (count < limit):
      Show actions + "נותרו X פעולות AI" at bottom
  → IF exhausted (count >= limit):
      Dim all actions + exhausted message + <UpgradePrompt />
  → IF paid (limit === null):
      Show actions, no limit info, no upgrade prompt

Backend rejection (edge case):
  → AI_LIMIT_REACHED error from callAnthropicApi
  → Palette catches this error specifically
  → Does NOT show toast (unlike other errors)
  → Shows exhausted gate state (refetch usage query updates the UI)
```

### getMyMonthlyUsage Query Design

```typescript
// convex/usage.ts — ADD this public query
import { query } from "./_generated/server";
import { FREE_MONTHLY_AI_LIMIT } from "./lib/tierLimits";

export const getMyMonthlyUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { count: 0, limit: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { count: 0, limit: 0 };

    // Count this month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("createdAt"), startOfMonth))
      .collect();

    const isPaid = user.tier === "paid";
    return {
      count: records.length,
      limit: isPaid ? null : FREE_MONTHLY_AI_LIMIT,
    };
  },
});
```

**IMPORTANT:** The `user._id` is a Convex `Id<"users">` which is a string — it matches the `userId` field in the `aiUsage` table (Story 6.1 stores `user._id` as the userId).

### UpgradePrompt Component Design

```tsx
// components/auth/UpgradePrompt.tsx
"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpgradePromptProps {
  variant?: "inline" | "palette";
  className?: string;
}

export function UpgradePrompt({ variant = "inline", className }: UpgradePromptProps) {
  const handleUpgrade = () => {
    // Phase 1: Placeholder — no payment flow yet
    toast.info("שדרוג יהיה זמין בקרוב!");
  };

  return (
    <div dir="rtl" className={className}>
      <Button
        onClick={handleUpgrade}
        aria-label="שדרג לגישה בלתי מוגבלת ל-AI"
        variant={variant === "palette" ? "default" : "outline"}
        size={variant === "palette" ? "sm" : "default"}
      >
        שדרג עכשיו
      </Button>
    </div>
  );
}
```

**Phase 2 evolution:** Replace the toast with `router.push("/pricing")` or equivalent payment flow navigation. The component signature stays the same — only the `handleUpgrade` body changes.

### Palette Gate Integration Pattern

Story 6.2 creates the `AiCommandPalette.tsx` component. Story 6.4 extends it with usage-aware rendering:

```tsx
// In AiCommandPalette.tsx — modifications for Story 6.4
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UpgradePrompt } from "@/components/auth/UpgradePrompt";

// Inside the component:
const usage = useQuery(api.usage.getMyMonthlyUsage);
const isExhausted = usage && usage.limit !== null && usage.count >= usage.limit;
const remaining = usage && usage.limit !== null ? usage.limit - usage.count : null;

// In the CommandList:
{isExhausted ? (
  <div dir="rtl" className="p-4 text-center">
    <p className="text-sm text-muted-foreground mb-3">
      ניצלת את כל פעולות ה-AI החינמיות החודש. שדרג לגישה בלתי מוגבלת ל-AI.
    </p>
    <UpgradePrompt variant="palette" />
  </div>
) : remaining !== null && remaining > 0 ? (
  <div dir="rtl" className="p-2 text-center" aria-live="polite">
    <p className="text-xs text-muted-foreground">
      נותרו {remaining} פעולות AI
    </p>
  </div>
) : null}
```

**Dimming actions when exhausted:** Each `CommandItem` should check `isExhausted` and apply:
- `aria-disabled="true"`
- `className="opacity-50 pointer-events-none"`
- `title="הגעת למגבלת השימוש החודשית"` (reached monthly limit)

### AI_LIMIT_REACHED Error Handling — NOT a Toast

When `useAiAction.executeAction()` catches a `ConvexError` with code `AI_LIMIT_REACHED`:
- Do NOT show an error toast (unlike other error codes)
- Instead, the palette should detect this and show the exhausted gate state
- The `useQuery(api.usage.getMyMonthlyUsage)` is reactive — when the backend rejects because the limit was reached, the usage count may have already been at the limit. The Convex reactive query will update automatically.

**Implementation pattern:** In the error handler within `useAiAction.ts` (or the component that calls it):
```typescript
catch (err) {
  const errorData = (err as any)?.data;
  if (errorData?.code === "AI_LIMIT_REACHED") {
    // Don't toast — the palette's reactive usage query will update
    // and the gate section will appear automatically
    return null;
  }
  // Other errors: show toast as usual
  toast.error(errorData?.message || "שגיאה בעיבוד AI");
}
```

### UX Design Reconciliation — CRITICAL

**Conflict between epics and UX spec:**
- Epics AC says: "a dismissible banner notification appears with a Hebrew message and an upgrade link"
- UX spec says: "No toolbar banner, no blocking modal, no toast. The limit is communicated contextually, only when the user tries to use AI."
- PRD FR31 says: "AI actions appear dimmed with an inline upgrade prompt and link — communicated contextually at the point of action, not via a banner or modal"

**Resolution:** Follow the UX spec and PRD FR31 — the "banner" in the epics refers to the gate section **inside** the command palette, not a separate toolbar/page banner. This aligns with the UX principle "respect over persuasion" and the architectural decision "Upgrade inside palette only."

### Styling & RTL — CRITICAL

- All new UI elements must use `dir="rtl"` for Hebrew layout
- Use Tailwind logical properties: `ms-*` not `ml-*`, `me-*` not `mr-*`, `ps-*` not `pl-*`
- Use `text-start` / `text-end`, never `text-left` / `text-right`
- Use `gap-*` between buttons, no directional margins
- Gate section text should be `text-muted-foreground` for non-intrusive appearance
- Remaining count should be small (`text-xs`) and muted — informative, not alarming

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Test baseline:** All existing tests from Stories 6.1, 6.2, 6.3 must continue passing.

**Mocking patterns:**

```typescript
// Mock Convex useQuery for usage
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useAction: vi.fn(),
}));

// Mock useQuery to return usage data
import { useQuery } from "convex/react";
(useQuery as vi.Mock).mockReturnValue({ count: 3, limit: 10 }); // Free user with quota
(useQuery as vi.Mock).mockReturnValue({ count: 10, limit: 10 }); // Free user exhausted
(useQuery as vi.Mock).mockReturnValue({ count: 50, limit: null }); // Paid user

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));
```

**Required test files and scenarios:**

1. **`convex/__tests__/usagePublicQuery.test.ts`:**
   - Returns `{ count: 0, limit: 0 }` for unauthenticated user
   - Returns `{ count: N, limit: 10 }` for free user with N usage records this month
   - Returns `{ count: N, limit: null }` for paid user
   - Correctly counts only records in current calendar month (ignores older records)
   - Returns `{ count: 0, limit: 10 }` for free user with no usage this month

2. **`components/auth/UpgradePrompt.test.tsx`:**
   - Renders "שדרג עכשיו" button text
   - Click calls `toast.info` with "שדרוג יהיה זמין בקרוב!"
   - Has `aria-label="שדרג לגישה בלתי מוגבלת ל-AI"`
   - Renders with `dir="rtl"`
   - Renders correct variant styling for "palette" vs "inline"

3. **`components/ai/AiCommandPalette.test.tsx` (updates):**
   - Free user with quota: shows "נותרו 7 פעולות AI" (7 remaining)
   - Free user exhausted: shows dimmed actions + "ניצלת את כל פעולות ה-AI החינמיות החודש..."
   - Free user exhausted: shows UpgradePrompt component
   - Paid user: no remaining count, no gate section, no upgrade prompt
   - `AI_LIMIT_REACHED` error: does NOT show toast, UI updates to exhausted state
   - Disabled actions have `aria-disabled="true"`

### Existing Infrastructure (DO NOT Recreate)

- **`convex/usage.ts`** — Has `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary`. ADD `getMyMonthlyUsage` public query.
- **`convex/lib/tierLimits.ts`** — Has `FREE_MONTHLY_AI_LIMIT` (10), `PAID_DAILY_OPUS_LIMIT` (5). IMPORT constants.
- **`convex/ai.ts`** — Full AI proxy action. NOT modified by this story.
- **`types/ai.ts`** — `AiActionType`. IMPORT for typing.
- **`lib/hooks/useCapabilities.ts`** — Tier capabilities. IMPORT for tier checks.
- **`lib/hooks/useCurrentUser.ts`** — Auth state. IMPORT for gate checks.
- **`components/ui/button.tsx`** — shadcn button. IMPORT for upgrade button.
- **Story 6.2 components** — `AiCommandPalette.tsx`, `AiResultPanel.tsx`, `useAiAction.ts`. MODIFY palette and action hook.
- **Story 6.3 components** — `AiDisclosure.tsx`, `useAiDisclosure.ts`. NOT modified.

### Must Be Created (Story 6.4 Scope)

| File | Purpose |
|------|---------|
| `components/auth/UpgradePrompt.tsx` | Reusable upgrade CTA component (Phase 1: toast placeholder) |
| `components/auth/UpgradePrompt.test.tsx` | Tests for upgrade prompt component |
| `convex/__tests__/usagePublicQuery.test.ts` | Tests for the new public usage query |

### Must Be Modified (Story 6.4 Scope)

| File | Change |
|------|--------|
| `convex/usage.ts` | Add `getMyMonthlyUsage` public query |
| `components/ai/AiCommandPalette.tsx` | Add usage query, remaining count display, exhausted gate with UpgradePrompt |
| `lib/hooks/useAiAction.ts` | Handle `AI_LIMIT_REACHED` error specifically (no toast for this code) |
| `components/ai/AiCommandPalette.test.tsx` | Add tests for remaining count, exhausted gate, upgrade prompt, error handling |

### Project Structure Notes

- `components/auth/UpgradePrompt.tsx` matches architecture's planned file at `components/auth/UpgradePrompt.tsx` exactly
- Tests co-located next to source files per project convention
- No new UI dependencies needed — uses existing `Button` component and `sonner` toast
- `convex/usage.ts` already has the internal queries — adding a public wrapper is a natural extension

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `UpgradePrompt` |
| Convex queries | get/list prefix, camelCase | `getMyMonthlyUsage` |
| Props | camelCase | `variant`, `className` |
| Event handlers | `handle` prefix | `handleUpgrade` |
| CSS classes | Tailwind logical properties | `ms-2`, `me-4`, `text-start` |
| Hebrew UI text | Direct string | "שדרג עכשיו" |
| ARIA labels | Hebrew | "שדרג לגישה בלתי מוגבלת ל-AI" |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `convex` | ^1.32.0 | `query`, `useQuery` | Already installed |
| `sonner` | ^2.0.7 | Toast for Phase 1 upgrade placeholder | Already installed |
| `react` | ^19.0.0 | Component rendering | Already installed |
| No new dependencies | — | This story uses only existing packages | — |

### Previous Story Intelligence

**From Story 6.1 (done/review — backend):**
- `callAnthropicApi` already enforces `FREE_MONTHLY_AI_LIMIT` and throws `AI_LIMIT_REACHED`
- Usage is logged to `aiUsage` table automatically after every successful call
- `getMonthlyUsageCount` is `internalQuery` — counts records for a userId in current month
- `user._id` (Convex ID) is stored as `userId` in `aiUsage` — match this in the public query

**From Story 6.2 (ready-for-dev — AI UI):**
- AiCommandPalette dispatches actions via `handleAction(actionType)` function
- `useAiAction` hook wraps `useAction(api.ai.callAnthropicApi)` with loading/error/result state
- Story 6.2 AC #4 defines basic quota gate — Story 6.4 provides the actual implementation with UpgradePrompt
- Story 6.2 AC #13 defines remaining count — Story 6.4 provides the data source (`getMyMonthlyUsage`)
- Story 6.2's "Future Story Awareness" explicitly says: "Story 6.4 extends it with payment links"

**From Story 6.3 (ready-for-dev — disclosure):**
- Disclosure is independent of limits — they don't interact
- Story 6.3 creates `useAiDisclosure` hook — unrelated to usage tracking
- The disclosure flow happens BEFORE usage checks (disclosure → then action → then backend checks limits)

**From Story 5.3 (done — authorization):**
- `TierCapabilities` includes `hasAiLimit: boolean` and `maxMonthlyAiCalls: number | null`
- Free tier: `hasAiLimit = true`, `maxMonthlyAiCalls = 10`
- Paid tier: `hasAiLimit = false`, `maxMonthlyAiCalls = null`
- These can be used for frontend display logic, but the authoritative limit check is backend-enforced

**Code review lessons to apply:**
- Use logical CSS properties everywhere (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Include Hebrew ARIA labels on all interactive elements
- Mock at highest-level abstraction in tests
- Don't show error toasts for expected limit scenarios — handle contextually

### Git Intelligence

Recent commits:
```
d396b5f Implement Story 5.3: Three-tier authorization and account deletion
32281fb Implement Story 5.2: Anonymous and authenticated editor experience
a489249 Implement Story 5.1: Clerk auth integration and Convex user sync
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
d16e68a Implement Story 4.1: Per-sentence BiDi detection engine
```

Story 6.1 is in the working tree (not yet committed to main) with status `review`.

**Expected commit:** `Implement Story 6.4: AI usage limits and upgrade prompts`

### Anti-Patterns to AVOID

- **Do NOT create a separate banner component for limits** — The UX spec is explicit: "No toolbar banner, no blocking modal, no toast." Limits are communicated inside the command palette only.
- **Do NOT show error toast for `AI_LIMIT_REACHED`** — This is an expected scenario, not an error. Handle it contextually in the palette.
- **Do NOT block non-AI features** — Hitting the AI limit affects ONLY AI actions. Editing, exporting, theming, presentation mode must remain fully functional.
- **Do NOT implement a full payment flow** — Phase 1 uses a toast placeholder. Payment is Phase 2 (Epic 9).
- **Do NOT create a pricing page or modal** — Story 6.4 only adds the upgrade button with placeholder behavior.
- **Do NOT duplicate usage counting logic** — Reuse `FREE_MONTHLY_AI_LIMIT` from `convex/lib/tierLimits.ts`. Don't hardcode "10" anywhere.
- **Do NOT use `ml-*`, `mr-*`, `pl-*`, `pr-*`** — Always use logical properties for RTL compatibility.
- **Do NOT use `text-left` or `text-right`** — Use `text-start` and `text-end`.
- **Do NOT add Opus model access for paid users yet** — Phase 1 routes all actions to Sonnet. Opus access requires payment flow (Epic 9).
- **Do NOT show upgrade prompts to paid users** — Paid users should never see limit-related UI.
- **Do NOT create a per-session rate limiter** — Rate limiting is per-account in Convex (backend-enforced). No client-side rate limiting.

### Future Story Awareness

**Epic 9 (Payments & Subscription) will:**
- Replace the `toast.info("שדרוג יהיה זמין בקרוב!")` placeholder with actual payment navigation
- The `UpgradePrompt` component is designed for this: only the `handleUpgrade` function body needs to change
- Payment flow will redirect to Stripe/local Israeli provider

**Epic 8 (Analytics) will:**
- Add event tracking for: upgrade button clicks, limit-reached events, usage patterns
- Story 6.4's `UpgradePrompt` is a natural analytics tracking point

**No future story in Epic 6 modifies this feature** — Story 6.4 is the last story in Epic 6. The upgrade prompt evolves in Epic 9.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.4]
- [Source: _bmad-output/planning-artifacts/prd.md — FR30 (AI usage limits by tier), FR31 (Limit banner with upgrade)]
- [Source: _bmad-output/planning-artifacts/architecture.md — AI Proxy Architecture, Three-Tier Authorization]
- [Source: _bmad-output/planning-artifacts/architecture.md — components/auth/UpgradePrompt.tsx]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture: AI usage tracking, AI rate limits]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "Upgrade inside palette only"]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "respect over persuasion" principle]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 3: Registration → AI First Use → Conversion]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Flow 3: AI Action, gate check states]
- [Source: _bmad-output/implementation-artifacts/6-1-ai-proxy-backend-and-model-routing.md — Backend: AI_LIMIT_REACHED, usage logging]
- [Source: _bmad-output/implementation-artifacts/6-2-ai-actions-ui-and-document-interactions.md — AiCommandPalette, useAiAction, gate checks]
- [Source: _bmad-output/implementation-artifacts/6-3-ai-privacy-disclosure.md — Disclosure independence from limits]
- [Source: convex/usage.ts — internalQuery getMonthlyUsageCount, internalQuery getUserUsageSummary]
- [Source: convex/lib/tierLimits.ts — FREE_MONTHLY_AI_LIMIT = 10, PAID_DAILY_OPUS_LIMIT = 5]
- [Source: lib/auth/capabilities.ts — TierCapabilities: hasAiLimit, maxMonthlyAiCalls]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- UpgradePrompt test initially failed due to `vi.mock` hoisting issue — fixed by using `vi.hoisted()` for the mock function

### Completion Notes List

- Fixed `getMyMonthlyUsage` query: unauthenticated returns `{count:0, limit:0}` (was returning `FREE_MONTHLY_AI_LIMIT`), paid users return `{limit: null}` (was returning `FREE_MONTHLY_AI_LIMIT`)
- Added `UpgradePrompt` component with Phase 1 toast placeholder, RTL layout, ARIA accessibility
- Integrated UpgradePrompt into AiCommandPalette gate section
- Added `aria-live="polite"` on remaining count section
- Added `aria-disabled="true"` and title on disabled action items
- Modified `useAiAction` to suppress toast for `AI_LIMIT_REACHED` error code
- Created 5 new tests for public usage query, 6 tests for UpgradePrompt, 5 new tests for AiCommandPalette, 1 new test for useAiAction
- All 437 tests pass across 44 test files with zero regressions

### Change Log

- 2026-03-08: Implemented Story 6.4 — AI usage limits and upgrade prompts. Fixed public usage query for paid/unauthenticated users, created UpgradePrompt component, integrated into command palette, added AI_LIMIT_REACHED error handling, added comprehensive accessibility attributes, created tests.
- 2026-03-08: Code review fixes — (1) AC #4: Added useEffect in EditorPage to reopen palette on AI_LIMIT_REACHED, (2) Removed dual source of truth: palette now uses backend `usage.limit` instead of frontend `capabilities.maxMonthlyAiCalls`, removed useCapabilities dependency, (3) Fixed paid user test mock from `limit: 0` to `limit: null`, (4) Added query parameter assertions to usage query tests, (5) Added loading state guard: actions disabled while usage query loads, (6) Fixed stale closure: useRef for loading guard in useAiAction, (7) Added useQuery skip/args verification tests. All 440 tests pass.

### File List

**New files:**
- `components/auth/UpgradePrompt.tsx` — Reusable upgrade CTA component (Phase 1: toast placeholder)
- `components/auth/UpgradePrompt.test.tsx` — Tests for UpgradePrompt component
- `convex/__tests__/usagePublicQuery.test.ts` — Tests for getMyMonthlyUsage public query

**Modified files:**
- `convex/usage.ts` — Fixed getMyMonthlyUsage: paid users return null limit, unauthenticated return limit 0
- `components/ai/AiCommandPalette.tsx` — Added UpgradePrompt in gate section, aria-live on remaining count, aria-disabled on limited actions; uses backend `usage.limit` as single source of truth; added loading state guard
- `lib/hooks/useAiAction.ts` — Suppress toast for AI_LIMIT_REACHED error code; useRef for loading guard
- `components/ai/AiCommandPalette.test.tsx` — Added Story 6.4 tests: UpgradePrompt, aria-disabled, aria-live, paid user, loading state, useQuery skip/args verification
- `lib/hooks/useAiAction.test.ts` — Added AI_LIMIT_REACHED no-toast test
- `app/editor/page.tsx` — Reopen palette on AI_LIMIT_REACHED error (AC #4)
