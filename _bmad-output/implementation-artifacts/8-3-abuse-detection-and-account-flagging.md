# Story 8.3: Abuse Detection & Account Flagging

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an operator,
I want the system to automatically flag accounts exhibiting suspicious usage patterns,
So that I can investigate potential abuse before it impacts costs.

## Acceptance Criteria

1. **Periodic abuse scan** — Given the system monitors account activity, when a Convex scheduled function (cron) runs every hour, then it scans all non-flagged free-tier users for suspicious patterns.

2. **New account burst detection** — Given a user account was created less than 24 hours ago, when the account has made more than 8 AI calls within that window, then the account is flagged with reason `new_account_burst` including call count and account age.

3. **Hourly burst detection** — Given a user has made AI calls in the last hour, when the count exceeds 20 calls within a single hour, then the account is flagged with reason `hourly_burst` including the call count.

4. **Monthly cost threshold detection** — Given a free-tier user's AI usage in the current month, when their total API cost exceeds $1.00 USD, then the account is flagged with reason `high_monthly_cost` including the actual cost.

5. **Flagged field on users table** — Given a user is flagged, then the `users` table record is updated with `flagged: true`, `flagReason` (descriptive string), and `flaggedAt` (timestamp).

6. **Operator query for flagged accounts** — Given flagged accounts exist, when the operator runs `getFlaggedUsers` via the Convex dashboard, then they receive a list of flagged users sorted by most recently flagged, including userId, email, tier, flagReason, and flaggedAt.

7. **No automatic blocking** — Given a user is flagged for abuse, then they can still use the system normally. Flagging only surfaces accounts for manual operator review — it does NOT restrict access.

8. **Operator unflag capability** — Given an operator has reviewed a flagged account, when they run `unflagUser` with the userId, then the flagged status, reason, and timestamp are cleared from the user record.

9. **Cron job in convex/crons.ts** — Given the cron infrastructure, when `convex/crons.ts` is deployed, then it registers an hourly interval cron job that calls the abuse detection function.

## Tasks / Subtasks

- [x] Task 1: Add flagged fields to users table schema (AC: #5)
  - [x] 1.1 Add `flagged: v.optional(v.boolean())` to users table in `convex/schema.ts`
  - [x] 1.2 Add `flagReason: v.optional(v.string())` to users table
  - [x] 1.3 Add `flaggedAt: v.optional(v.number())` to users table
  - [x] 1.4 Verify `npx convex dev` accepts the schema change

- [x] Task 2: Create `convex/abuse.ts` with detection logic (AC: #1, #2, #3, #4, #5)
  - [x] 2.1 Create `ABUSE_THRESHOLDS` config object with `NEW_ACCOUNT_WINDOW_MS` (24h), `NEW_ACCOUNT_MAX_AI_CALLS` (8), `HOURLY_BURST_MAX_CALLS` (20), `MONTHLY_COST_SOFT_LIMIT` (1.0)
  - [x] 2.2 Create `detectAbuse` as `internalMutation` — scans all non-flagged free-tier users, checks each against abuse patterns, flags matches
  - [x] 2.3 Implement Pattern 1 (new account burst): account age < `NEW_ACCOUNT_WINDOW_MS` AND AI calls since creation > `NEW_ACCOUNT_MAX_AI_CALLS`. Uses `by_userId_createdAt` index on `aiUsage`.
  - [x] 2.4 Implement Pattern 2 (hourly burst): AI calls in last hour > `HOURLY_BURST_MAX_CALLS`. Uses `by_userId_createdAt` index.
  - [x] 2.5 Implement Pattern 3 (monthly cost): total cost this month > `MONTHLY_COST_SOFT_LIMIT` for free-tier users. Uses `by_userId_createdAt` index.
  - [x] 2.6 Flag matching users via `ctx.db.patch(userId, { flagged: true, flagReason, flaggedAt: Date.now() })`

- [x] Task 3: Create operator queries in `convex/abuse.ts` (AC: #6, #8)
  - [x] 3.1 Create `getFlaggedUsers` as `internalQuery` — returns all flagged users sorted by `flaggedAt` descending, with optional `limit` arg (default 50)
  - [x] 3.2 Create `unflagUser` as `internalMutation` — clears `flagged`, `flagReason`, `flaggedAt` on a user record. Args: `userId: v.id("users")`

- [x] Task 4: Create `convex/crons.ts` (AC: #9)
  - [x] 4.1 Create `convex/crons.ts` with `cronJobs()` setup
  - [x] 4.2 Register hourly interval: `crons.interval("abuse detection scan", { hours: 1 }, internal.abuse.detectAbuse)`
  - [x] 4.3 Export default crons

- [x] Task 5: Create tests (AC: all)
  - [x] 5.1 Create `convex/__tests__/abuse.test.ts`
  - [x] 5.2 Test `detectAbuse`: no users → no flags
  - [x] 5.3 Test `detectAbuse`: new account with few AI calls → not flagged
  - [x] 5.4 Test `detectAbuse`: new account burst pattern → flagged with correct reason
  - [x] 5.5 Test `detectAbuse`: hourly burst pattern → flagged with correct reason
  - [x] 5.6 Test `detectAbuse`: monthly cost threshold exceeded → flagged with correct reason
  - [x] 5.7 Test `detectAbuse`: already-flagged users are skipped
  - [x] 5.8 Test `detectAbuse`: paid-tier users are skipped
  - [x] 5.9 Test `getFlaggedUsers`: returns flagged users sorted by flaggedAt desc
  - [x] 5.10 Test `getFlaggedUsers`: respects limit parameter
  - [x] 5.11 Test `unflagUser`: clears flag fields from user record

- [x] Task 6: Verify integration and existing tests (AC: all)
  - [x] 6.1 Run full test suite — all existing tests must pass
  - [x] 6.2 Verify `npx convex dev` accepts all changes (schema + crons + new module)
  - [x] 6.3 Verify cron registration is accepted by Convex runtime

## Dev Notes

### CRITICAL: Prerequisites — ALL implemented and MUST NOT be recreated

| File | Exports | Purpose |
|------|---------|---------|
| `convex/schema.ts` | `defineSchema({ users, aiUsage })` | Schema — ADD `flagged`, `flagReason`, `flaggedAt` optional fields to `users` table |
| `convex/usage.ts` | `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary`, `getMyMonthlyUsage` | AI usage tracking — reference only, DO NOT modify |
| `convex/users.ts` | `upsertFromClerk`, `deleteFromClerk`, `getCurrentUser`, `deleteMyAccount` | User management — reference only, DO NOT modify |
| `convex/ai.ts` | `callAnthropicApi` action | AI proxy — already logs to `aiUsage` via `logAiUsage` |
| `convex/modelRouter.ts` | `MODEL_IDS`, `getModelForAction`, `getTokenCostForModel` | Model IDs and cost calculation — reference only |
| `convex/lib/tierLimits.ts` | `FREE_MONTHLY_AI_LIMIT`, `checkAiAccess` | Tier config — reference only |
| `convex/lib/authorization.ts` | `requireAuth`, `requireTier` | Auth helpers — reference only |
| `convex/_generated/api` | `api`, `internal` | Auto-generated bindings — import `internal.abuse.detectAbuse` |

### Existing users Table Schema (MODIFY — add optional fields)

```typescript
// Current in convex/schema.ts — ADD flagged fields
users: defineTable({
  clerkId: v.string(),
  email: v.optional(v.string()),
  name: v.optional(v.string()),
  tier: v.union(v.literal("free"), v.literal("paid")),
  createdAt: v.number(),
  // ADD these three fields:
  flagged: v.optional(v.boolean()),
  flagReason: v.optional(v.string()),
  flaggedAt: v.optional(v.number()),
}).index("by_clerkId", ["clerkId"]),
```

Using `v.optional()` ensures backward compatibility — existing user records remain valid without these fields. No data migration needed.

### Existing aiUsage Table Schema (DO NOT MODIFY)

```typescript
// Already in convex/schema.ts — no changes needed
aiUsage: defineTable({
  userId: v.id("users"),
  model: v.string(),
  inputTokens: v.number(),
  outputTokens: v.number(),
  cost: v.number(),
  actionType: v.string(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_createdAt", ["userId", "createdAt"])
  .index("by_createdAt", ["createdAt"]),
```

The `by_userId_createdAt` compound index is critical — it enables efficient per-user time-range queries for abuse pattern detection without full table scans.

### Abuse Detection Thresholds

```typescript
// convex/abuse.ts — configurable thresholds
export const ABUSE_THRESHOLDS = {
  NEW_ACCOUNT_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  NEW_ACCOUNT_MAX_AI_CALLS: 8,                  // Max calls for new accounts
  HOURLY_BURST_MAX_CALLS: 20,                   // Max calls per hour
  MONTHLY_COST_SOFT_LIMIT: 1.0,                 // $1.00 USD per month
};
```

**Threshold rationale:**
- `FREE_MONTHLY_AI_LIMIT` is 10 calls/month (from `tierLimits.ts`). A new account making 8 calls in 24h is using 80% of the monthly limit in one day — suspicious.
- 20 calls/hour far exceeds normal usage patterns (even paid users). Indicates automated/scripted behavior.
- $1.00/month cost for free tier is generous given Haiku costs ~$0.001/call. Reaching $1 means either high volume or Sonnet-heavy usage patterns.

### detectAbuse Design

```typescript
import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const ABUSE_THRESHOLDS = {
  NEW_ACCOUNT_WINDOW_MS: 24 * 60 * 60 * 1000,
  NEW_ACCOUNT_MAX_AI_CALLS: 8,
  HOURLY_BURST_MAX_CALLS: 20,
  MONTHLY_COST_SOFT_LIMIT: 1.0,
};

export const detectAbuse = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all non-flagged free-tier users
    const allUsers = await ctx.db.query("users").collect();
    const candidates = allUsers.filter(
      (u) => u.tier === "free" && !u.flagged
    );

    let flaggedCount = 0;

    for (const user of candidates) {
      let reason: string | null = null;

      // Pattern 1: New account burst
      const accountAge = now - user.createdAt;
      if (accountAge < ABUSE_THRESHOLDS.NEW_ACCOUNT_WINDOW_MS) {
        const usage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", user.createdAt)
          )
          .collect();

        if (usage.length > ABUSE_THRESHOLDS.NEW_ACCOUNT_MAX_AI_CALLS) {
          reason = `new_account_burst: ${usage.length} AI calls within ${Math.round(accountAge / 3600000)}h of creation`;
        }
      }

      // Pattern 2: Hourly burst (skip if already flagged by pattern 1)
      if (!reason) {
        const oneHourAgo = now - 60 * 60 * 1000;
        const hourlyUsage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", oneHourAgo)
          )
          .collect();

        if (hourlyUsage.length > ABUSE_THRESHOLDS.HOURLY_BURST_MAX_CALLS) {
          reason = `hourly_burst: ${hourlyUsage.length} AI calls in last hour`;
        }
      }

      // Pattern 3: Monthly cost threshold (skip if already flagged)
      if (!reason) {
        const startOfMonth = new Date(now);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyUsage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", startOfMonth.getTime())
          )
          .collect();

        const monthlyCost = monthlyUsage.reduce((sum, r) => sum + r.cost, 0);
        if (monthlyCost > ABUSE_THRESHOLDS.MONTHLY_COST_SOFT_LIMIT) {
          reason = `high_monthly_cost: $${monthlyCost.toFixed(4)} exceeds $${ABUSE_THRESHOLDS.MONTHLY_COST_SOFT_LIMIT} threshold`;
        }
      }

      // Flag user if any pattern matched
      if (reason) {
        await ctx.db.patch(user._id, {
          flagged: true,
          flagReason: reason,
          flaggedAt: now,
        });
        flaggedCount++;
      }
    }

    return { flaggedCount };
  },
});
```

**Key design decision:** Using `internalMutation` (not `internalAction`) keeps the abuse detection atomic — all reads and writes happen in a single transaction. For Phase 1 with a small user base, this stays well within the Convex mutation time limit. If the user base grows significantly, refactor to `internalAction` that orchestrates separate query + mutation calls.

### getFlaggedUsers Design

```typescript
export const getFlaggedUsers = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const flagged = allUsers
      .filter((u) => u.flagged === true)
      .map((u) => ({
        userId: u._id,
        email: u.email,
        name: u.name,
        tier: u.tier,
        createdAt: u.createdAt,
        flagged: u.flagged,
        flagReason: u.flagReason,
        flaggedAt: u.flaggedAt,
      }))
      .sort((a, b) => (b.flaggedAt ?? 0) - (a.flaggedAt ?? 0));

    const resultLimit = args.limit ?? 50;
    return flagged.slice(0, resultLimit);
  },
});
```

**Note:** No index on `flagged` field is needed in Phase 1. Filtering in memory is efficient for small user tables. If the user base grows to thousands, add `.index("by_flagged", ["flagged"])` to optimize.

### unflagUser Design

```typescript
export const unflagUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      flagged: undefined,
      flagReason: undefined,
      flaggedAt: undefined,
    });
  },
});
```

**Note:** Setting fields to `undefined` in Convex removes them from the document (since they're `v.optional()`). This cleanly clears the flag state.

### convex/crons.ts Design

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "abuse detection scan",
  { hours: 1 },
  internal.abuse.detectAbuse,
);

export default crons;
```

**Convex cron behavior:**
- At most one run executes at any time — no duplicate scans
- First run occurs when deployed
- If a run takes too long, following runs may be skipped (safe for abuse detection — next run catches up)
- Interval uses seconds-level precision internally

### Project Structure Notes

- `convex/abuse.ts` — NEW file. Contains all abuse detection logic, operator queries, and flagging mutations
- `convex/crons.ts` — NEW file. Contains cron job definitions (architecture specifies this location)
- `convex/schema.ts` — MODIFIED. Three optional fields added to `users` table
- No UI components — operator uses Convex dashboard to run `internalQuery` and `internalMutation` functions
- No new dependencies — uses only Convex built-in primitives

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Convex module | lowercase | `abuse.ts`, `crons.ts` |
| Internal mutations | camelCase verb | `detectAbuse`, `flagUser`, `unflagUser` |
| Internal queries | `get` prefix, camelCase | `getFlaggedUsers` |
| Config constants | SCREAMING_SNAKE_CASE | `ABUSE_THRESHOLDS`, `NEW_ACCOUNT_WINDOW_MS` |
| Flag reasons | snake_case prefix: description | `new_account_burst: ...`, `hourly_burst: ...` |
| Cron job names | lowercase descriptive | `"abuse detection scan"` |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `convex` | ^1.32.0 | Backend — internalMutation, internalQuery, cronJobs | Already installed |
| `convex/server` | (bundled) | `cronJobs` for cron setup | Already installed |
| No new dependencies | — | This story uses only existing packages | — |

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Test baseline:** All existing tests must continue passing.

**Follow existing pattern from `convex/__tests__/usage.test.ts`:**

```typescript
function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockQueryCtx(records: unknown[] = []) {
  const mockWithIndex = vi.fn().mockReturnThis();
  return {
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: mockWithIndex,
        collect: vi.fn().mockResolvedValue(records),
      }),
    },
    _mockWithIndex: mockWithIndex,
  };
}

function createMockMutationCtx(userRecords: unknown[] = [], usageRecords: unknown[] = []) {
  // Need to mock both user queries and aiUsage queries
  // Track which table is being queried to return appropriate records
  const patchFn = vi.fn();
  let queryCount = 0;

  return {
    db: {
      query: vi.fn().mockImplementation((table: string) => {
        const records = table === "users" ? userRecords : usageRecords;
        return {
          withIndex: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue(records),
        };
      }),
      patch: patchFn,
    },
    _patchFn: patchFn,
  };
}
```

**Required test file: `convex/__tests__/abuse.test.ts`**

1. **`detectAbuse` tests:**
   - Returns `{ flaggedCount: 0 }` when no users exist
   - Returns `{ flaggedCount: 0 }` when all users are paid tier
   - Returns `{ flaggedCount: 0 }` when all users are already flagged
   - Returns `{ flaggedCount: 0 }` when free users have normal usage
   - Flags new account with burst AI usage (> 8 calls in < 24h)
   - Flags user with hourly burst (> 20 calls in 1 hour)
   - Flags user exceeding monthly cost threshold (> $1.00)
   - Does not flag new account with 8 or fewer calls
   - Does not flag user with exactly 20 hourly calls
   - Calls `ctx.db.patch` with correct `flagged`, `flagReason`, `flaggedAt` fields
   - Flag reason includes descriptive metrics (call count, cost amount, hours)

2. **`getFlaggedUsers` tests:**
   - Returns empty array when no users are flagged
   - Returns flagged users sorted by `flaggedAt` descending
   - Respects `limit` parameter (default 50)
   - Returns user details: userId, email, tier, flagReason, flaggedAt

3. **`unflagUser` tests:**
   - Calls `ctx.db.patch` with `flagged: undefined`, `flagReason: undefined`, `flaggedAt: undefined`
   - Uses correct userId argument

**Test data patterns:**

```typescript
const mockFreeUser = {
  _id: "user_1" as Id<"users">,
  clerkId: "clerk_1",
  email: "test@example.com",
  name: "Test User",
  tier: "free" as const,
  createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago (new account)
};

const mockPaidUser = {
  _id: "user_2" as Id<"users">,
  clerkId: "clerk_2",
  email: "paid@example.com",
  name: "Paid User",
  tier: "paid" as const,
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
};

const mockAiUsageRecord = {
  userId: "user_1" as Id<"users">,
  model: "claude-haiku-4-5-20251001",
  inputTokens: 500,
  outputTokens: 200,
  cost: 0.0012,
  actionType: "summarize",
  createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
};
```

### Previous Story Intelligence

**From Story 8.2 (ready-for-dev — previous in epic):**
- 8.2 adds `getCostSummary`, `getCostByUser`, `getTimePeriodCosts` to `convex/usage.ts`
- 8.2 explicitly notes: "Story 8.3 (Abuse Detection & Account Flagging) will use: The cost queries from this story to identify high-cost users for abuse detection. `getCostByUser` results feed into abuse pattern detection logic. Cron jobs in `convex/crons.ts` will call these queries periodically."
- However, story 8.3 queries `aiUsage` directly rather than depending on 8.2's aggregation queries — this keeps 8.3 independent and allows parallel implementation within Epic 8
- The `by_userId_createdAt` compound index on `aiUsage` is already available and sufficient for all abuse detection queries

**From Story 8.1 (ready-for-dev):**
- 8.1 creates `analyticsEvents` table and `convex/analytics.ts` — separate concern from abuse detection
- 8.1's future story awareness notes: "Story 8.3 will add `convex/crons.ts` with scheduled functions for periodic abuse detection, `flagged` field on `users` table, queries against both `aiUsage` and `analyticsEvents` for pattern detection"
- Story 8.3 focuses on `aiUsage` data only for Phase 1. Future iterations can add `analyticsEvents` signals (e.g., `ai.limit_reached` events as an abuse indicator)

**From Story 6.4 (done — most recent implemented):**
- 420+ tests passing baseline
- `FREE_MONTHLY_AI_LIMIT` = 10 calls/month — the abuse thresholds must be calibrated relative to this limit
- AI usage limits are already enforced in `convex/ai.ts` — abuse detection is a complementary layer for pattern detection, not rate enforcement

**Code review lessons to apply:**
- Mock at highest-level abstraction in tests (mock `ctx.db.query` and `ctx.db.patch`)
- Don't import `internal` in test files — test handler functions directly via `getHandler()`
- Ensure all queries use exact expected index names (`by_userId_createdAt`)

### Git Intelligence

Recent commits (patterns to follow):
```
c417246 Implement Story 6.4: AI usage limits and upgrade prompts
fad3bf0 Implement Story 6.3: AI privacy disclosure
8468fce Implement Story 6.2: AI actions UI and document interactions
778c339 Implement Story 6.1: AI proxy backend and model routing
d396b5f Implement Story 5.3: Three-tier authorization and account deletion
```

**Expected commit:** `Implement Story 8.3: Abuse detection and account flagging`

**Patterns from recent commits:**
- Each story is one commit with descriptive message
- Schema changes, backend logic, and tests all in one commit
- Tests included in same commit as implementation

### Anti-Patterns to AVOID

- **Do NOT automatically block or restrict flagged users** — Flagging is for operator review ONLY. Do NOT add any access checks against the `flagged` field in `requireAuth`, `requireTier`, or `callAnthropicApi`. Users must continue to function normally when flagged.
- **Do NOT create an admin UI or dashboard page** — Operator uses Convex dashboard to run `internalQuery`/`internalMutation` functions directly. No React components, no pages, no routes.
- **Do NOT modify `convex/ai.ts` or `convex/usage.ts`** — Abuse detection reads from `aiUsage` but does NOT change the AI call flow. The existing rate limiting in `ai.ts` is separate from abuse flagging.
- **Do NOT add indexes for flagged users in Phase 1** — Filtering `users.flagged === true` in memory is efficient for small user tables. Premature index optimization adds schema complexity for no benefit.
- **Do NOT depend on Story 8.1 or 8.2 being implemented** — Query `aiUsage` table directly for all abuse detection. The `aiUsage` table and its indexes already exist from Epic 6.
- **Do NOT use `internalAction` for detectAbuse** — Use `internalMutation` to keep reads and writes in a single transaction. Only refactor to action if user base grows beyond mutation time limits.
- **Do NOT send notifications or emails when flagging** — Phase 1 is silent flagging only. Operator checks the Convex dashboard manually.
- **Do NOT track flagging history** — Only store the current flag state. If a user is unflagged and re-flagged, the previous flag data is overwritten. History tracking is a future enhancement.
- **Do NOT create separate abuse threshold configuration table** — Use exported constants in `abuse.ts`. Adjusting thresholds requires a code deploy, which is acceptable for Phase 1.
- **Do NOT run abuse detection on paid-tier users** — Phase 1 focuses on free-tier abuse (account farming). Paid user abuse is a Phase 2 concern with different patterns.
- **Do NOT modify the `users` table `upsertFromClerk` function** — The new optional fields don't need to be set during user creation. They default to `undefined` (not present in document).

### Future Story Awareness

**Story 9.x (Payments & Subscriptions) may add:**
- Paid-tier abuse patterns (different thresholds)
- Cost-per-user tracking integration with billing
- Automatic tier downgrade for flagged accounts (with operator approval)

**Potential Phase 2 enhancements:**
- Add `analyticsEvents` signals to abuse detection (e.g., `ai.limit_reached` frequency)
- Add a `by_flagged` index on `users` table if user base grows
- Refactor `detectAbuse` to `internalAction` for scalability
- Add notification system (email operator when accounts are flagged)
- Track flag history in a separate `abuseFlags` table
- Add more sophisticated patterns: IP-based clustering, content analysis, temporal patterns

### Scope Summary

| Action | Files |
|--------|-------|
| **Must Create** | `convex/abuse.ts` — abuse detection mutation, operator query, unflag mutation |
| **Must Create** | `convex/crons.ts` — hourly cron job for abuse detection |
| **Must Create** | `convex/__tests__/abuse.test.ts` — tests for all abuse detection functions |
| **Must Modify** | `convex/schema.ts` — add `flagged`, `flagReason`, `flaggedAt` optional fields to `users` table |
| **Must NOT Modify** | `convex/ai.ts`, `convex/usage.ts`, `convex/users.ts`, `convex/modelRouter.ts`, any UI files |

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.3]
- [Source: _bmad-output/planning-artifacts/prd.md — FR46 (System flags accounts exhibiting potential abuse patterns)]
- [Source: _bmad-output/planning-artifacts/prd.md — Anti-abuse design: account farming detection, per-account rate limiting]
- [Source: _bmad-output/planning-artifacts/architecture.md — Rate Limiting: Abuse detection via Convex scheduled function]
- [Source: _bmad-output/planning-artifacts/architecture.md — Source Tree: convex/crons.ts planned location]
- [Source: _bmad-output/planning-artifacts/architecture.md — FR42-46 mapping to convex/analytics.ts, convex/crons.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture: users table extended from Clerk]
- [Source: _bmad-output/planning-artifacts/architecture.md — Cost Observability: feeds into abuse detection]
- [Source: convex/schema.ts — Current users and aiUsage table definitions]
- [Source: convex/usage.ts — Existing AI usage tracking patterns]
- [Source: convex/lib/tierLimits.ts — FREE_MONTHLY_AI_LIMIT = 10]
- [Source: _bmad-output/implementation-artifacts/8-1-analytics-event-pipeline.md — Future Story Awareness section]
- [Source: _bmad-output/implementation-artifacts/8-2-ai-cost-tracking-and-monitoring.md — Future Story Awareness section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered during implementation.

### Completion Notes List

- Added `flagged`, `flagReason`, `flaggedAt` optional fields to `users` table schema (backward compatible)
- Created `convex/abuse.ts` with `detectAbuse` internalMutation implementing 3 abuse patterns: new_account_burst (>8 calls in <24h), hourly_burst (>20 calls/hour), high_monthly_cost (>$1.00/month)
- Created `getFlaggedUsers` internalQuery returning flagged users sorted by flaggedAt desc with optional limit (default 50)
- Created `unflagUser` internalMutation clearing flag fields by setting to undefined
- Created `convex/crons.ts` with hourly interval cron job calling detectAbuse
- All 17 new tests pass covering detection patterns, edge cases, operator queries, and unflag functionality
- Full regression suite: 534 tests pass across 55 test files — zero regressions
- No new dependencies added — uses only Convex built-in primitives
- No UI components — operator uses Convex dashboard for internal queries/mutations
- Flagging is informational only — no access restrictions on flagged users

### Change Log

- 2026-03-09: Implemented abuse detection and account flagging (Story 8.3)

### File List

- `convex/schema.ts` — MODIFIED: Added `flagged`, `flagReason`, `flaggedAt` optional fields to `users` table
- `convex/abuse.ts` — NEW: Abuse detection mutation, operator query, unflag mutation
- `convex/crons.ts` — NEW: Hourly cron job for abuse detection scan
- `convex/__tests__/abuse.test.ts` — NEW: 17 tests for all abuse detection functions
