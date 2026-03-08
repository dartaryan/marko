# Story 8.2: AI Cost Tracking & Monitoring

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an operator,
I want to see real-time AI API costs broken down by model, action type, and user,
So that I can monitor spending and ensure the business stays cost-efficient.

## Acceptance Criteria

1. **Total cost for any time period** — Given AI calls are logged in the `aiUsage` table, when the operator runs a cost summary query with a `since` timestamp, then they receive total API cost, total calls, and total input/output tokens for that period.

2. **Cost breakdown by model** — Given the operator queries cost data, then costs are broken down by model (Haiku, Sonnet, Opus) showing call count, cost, and token counts per model.

3. **Cost breakdown by action type** — Given the operator queries cost data, then costs are broken down by action type (summarize, translate, extractActions, improveWriting) showing call count and cost per type.

4. **Cost breakdown by user** — Given the operator queries cost data with a time period, then they can see per-user cost and usage sorted by highest cost, with model and action type breakdown per user.

5. **Standard time period overview** — Given the operator wants a quick spending snapshot, then a single query returns total cost and call count for today, this week, and this month.

6. **Token accuracy** — Given each AI call logs inputTokens, outputTokens, and cost, then all summary queries accurately aggregate these values without data loss.

7. **Convex dashboard access** — Given all new queries are `internalQuery` functions, then the operator can run them directly from the Convex dashboard without any custom admin UI.

## Tasks / Subtasks

- [x] Task 1: Add `getCostSummary` internalQuery to `convex/usage.ts` (AC: #1, #2, #3, #6)
  - [x] 1.1 Add `getCostSummary` as `internalQuery` with arg `since: v.number()`. Uses `by_createdAt` index to collect all records from `since` onward.
  - [x] 1.2 Aggregate: totalCalls, totalCost, totalInputTokens, totalOutputTokens
  - [x] 1.3 Group by model: `Record<string, { calls: number; cost: number; inputTokens: number; outputTokens: number }>`
  - [x] 1.4 Group by actionType: `Record<string, { calls: number; cost: number }>`

- [x] Task 2: Add `getCostByUser` internalQuery to `convex/usage.ts` (AC: #4, #6)
  - [x] 2.1 Add `getCostByUser` as `internalQuery` with args `since: v.number()`, `limit: v.optional(v.number())` (default 50)
  - [x] 2.2 Uses `by_createdAt` index, groups by userId in memory
  - [x] 2.3 Per user: totalCost, totalCalls, byModel (call counts), byActionType (call counts)
  - [x] 2.4 Sort results by totalCost descending, apply limit

- [x] Task 3: Add `getTimePeriodCosts` internalQuery to `convex/usage.ts` (AC: #5, #6)
  - [x] 3.1 Add `getTimePeriodCosts` as `internalQuery` with no args
  - [x] 3.2 Calculate time boundaries: startOfToday, startOfWeek (Sunday), startOfMonth
  - [x] 3.3 Load all records from startOfMonth (superset of today/week) via `by_createdAt` index
  - [x] 3.4 Return `{ today: { totalCost, totalCalls }, thisWeek: { totalCost, totalCalls }, thisMonth: { totalCost, totalCalls } }`

- [x] Task 4: Create tests (AC: all)
  - [x] 4.1 Add tests in `convex/__tests__/usage.test.ts` for `getCostSummary`: empty results, single record, multiple records with different models/actions, correct aggregation
  - [x] 4.2 Add tests for `getCostByUser`: empty results, single user, multiple users sorted by cost, limit parameter
  - [x] 4.3 Add tests for `getTimePeriodCosts`: correct time boundary calculation, proper filtering by period

- [x] Task 5: Verify integration and existing tests (AC: all)
  - [x] 5.1 Run full test suite — all existing tests must pass
  - [x] 5.2 Verify `npx convex dev` accepts the unchanged schema (no schema changes in this story)
  - [x] 5.3 Verify queries return correct data shapes for Convex dashboard consumption

## Dev Notes

### CRITICAL: Prerequisites — ALL implemented and MUST NOT be recreated

| File | Exports | Purpose |
|------|---------|---------|
| `convex/schema.ts` | `defineSchema({ users, aiUsage })` | Schema with `aiUsage` table — DO NOT modify |
| `convex/usage.ts` | `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary`, `getMyMonthlyUsage` | Existing AI usage tracking — ADD new queries here |
| `convex/modelRouter.ts` | `MODEL_IDS`, `getModelForAction`, `getTokenCostForModel` | Model IDs and cost calculation — reference only |
| `convex/ai.ts` | `callAnthropicApi` action | AI proxy — already logs to `aiUsage` via `logAiUsage` |
| `convex/lib/tierLimits.ts` | `FREE_MONTHLY_AI_LIMIT`, `checkAiAccess` | Tier config — reference only |
| `convex/_generated/api` | `api`, `internal` | Auto-generated bindings |

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

The `by_createdAt` index enables efficient time-range queries for all three new operator queries. No additional indexes needed.

### Existing Model Pricing (from `convex/modelRouter.ts`)

```typescript
const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-opus-4-6": { input: 15.0, output: 75.0 },
};
```

Cost is already calculated per-call in `getTokenCostForModel()` and stored in the `cost` field. These new queries aggregate the stored `cost` values — they do NOT recalculate from tokens.

### Existing Helper to Reuse

```typescript
// Already in convex/usage.ts — reuse for getTimePeriodCosts
function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}
```

### getCostSummary Design

```typescript
export const getCostSummary = internalQuery({
  args: {
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .collect();

    let totalCost = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const byModel: Record<string, { calls: number; cost: number; inputTokens: number; outputTokens: number }> = {};
    const byActionType: Record<string, { calls: number; cost: number }> = {};

    for (const record of records) {
      totalCost += record.cost;
      totalInputTokens += record.inputTokens;
      totalOutputTokens += record.outputTokens;

      if (!byModel[record.model]) {
        byModel[record.model] = { calls: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
      }
      byModel[record.model].calls++;
      byModel[record.model].cost += record.cost;
      byModel[record.model].inputTokens += record.inputTokens;
      byModel[record.model].outputTokens += record.outputTokens;

      if (!byActionType[record.actionType]) {
        byActionType[record.actionType] = { calls: 0, cost: 0 };
      }
      byActionType[record.actionType].calls++;
      byActionType[record.actionType].cost += record.cost;
    }

    return {
      totalCalls: records.length,
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      byModel,
      byActionType,
    };
  },
});
```

### getCostByUser Design

```typescript
export const getCostByUser = internalQuery({
  args: {
    since: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .collect();

    const userMap: Record<
      string,
      {
        totalCost: number;
        totalCalls: number;
        byModel: Record<string, number>;
        byActionType: Record<string, number>;
      }
    > = {};

    for (const record of records) {
      const uid = record.userId as string;
      if (!userMap[uid]) {
        userMap[uid] = { totalCost: 0, totalCalls: 0, byModel: {}, byActionType: {} };
      }
      userMap[uid].totalCost += record.cost;
      userMap[uid].totalCalls++;
      userMap[uid].byModel[record.model] =
        (userMap[uid].byModel[record.model] || 0) + 1;
      userMap[uid].byActionType[record.actionType] =
        (userMap[uid].byActionType[record.actionType] || 0) + 1;
    }

    const users = Object.entries(userMap)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost);

    const resultLimit = args.limit ?? 50;
    return users.slice(0, resultLimit);
  },
});
```

### getTimePeriodCosts Design

```typescript
export const getTimePeriodCosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekTs = startOfWeek.getTime();

    const monthTs = getStartOfMonth();

    // Load all records for the month (superset of today and week)
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", monthTs))
      .collect();

    function summarize(recs: typeof records) {
      let totalCost = 0;
      for (const r of recs) {
        totalCost += r.cost;
      }
      return { totalCost, totalCalls: recs.length };
    }

    return {
      today: summarize(records.filter((r) => r.createdAt >= todayTs)),
      thisWeek: summarize(records.filter((r) => r.createdAt >= weekTs)),
      thisMonth: summarize(records),
    };
  },
});
```

**Key design decision:** `getTimePeriodCosts` makes a single DB query (month range, the largest superset) and filters in memory for today/week. This avoids three separate index scans for a single operator query.

### Project Structure Notes

- All new functions go in `convex/usage.ts` — the existing home for AI usage queries and mutations
- No new files created — this story adds queries to existing file only
- No schema changes — uses existing `aiUsage` table and indexes
- No UI components — operator uses Convex dashboard to run `internalQuery` functions
- No new dependencies — uses only Convex built-in query primitives

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Internal queries | `get` prefix, camelCase | `getCostSummary`, `getCostByUser`, `getTimePeriodCosts` |
| Query args | camelCase | `since`, `limit` |
| Return fields | camelCase | `totalCost`, `totalCalls`, `byModel`, `byActionType` |
| Aggregation keys | camelCase nested objects | `{ calls: number; cost: number }` |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `convex` | ^1.32.0 | Backend — internalQuery | Already installed |
| No new dependencies | — | This story uses only existing packages | — |

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Test baseline:** All existing tests must continue passing.

**Follow existing pattern from `convex/__tests__/usage.test.ts`:**

```typescript
// Reuse these existing test helpers (already in usage.test.ts):
function getHandler(fn: unknown): Function { ... }
function createMockQueryCtx(records: unknown[] = []) { ... }
```

**Required test additions to `convex/__tests__/usage.test.ts`:**

1. **`getCostSummary` tests:**
   - Returns zeros/empty maps for no records
   - Aggregates totalCost, totalInputTokens, totalOutputTokens correctly
   - Groups by model with correct call count, cost, and token breakdown
   - Groups by actionType with correct call count and cost
   - Uses `by_createdAt` index

2. **`getCostByUser` tests:**
   - Returns empty array for no records
   - Groups records by userId with correct aggregation
   - Sorts users by totalCost descending
   - Respects limit parameter (default 50)
   - Multiple users with different models/actions are correctly separated

3. **`getTimePeriodCosts` tests:**
   - Returns zeros for no records
   - Correctly calculates today/thisWeek/thisMonth totals
   - Today is subset of thisWeek which is subset of thisMonth
   - Uses `by_createdAt` index

**Test data pattern:**

```typescript
const mockRecords = [
  {
    userId: "user_1",
    model: "claude-sonnet-4-5-20250929",
    inputTokens: 500,
    outputTokens: 200,
    cost: 0.0045,
    actionType: "summarize",
    createdAt: Date.now(),
  },
  {
    userId: "user_2",
    model: "claude-haiku-4-5-20251001",
    inputTokens: 300,
    outputTokens: 100,
    cost: 0.0006,
    actionType: "translate",
    createdAt: Date.now(),
  },
];
```

### Previous Story Intelligence

**From Story 8.1 (ready-for-dev — previous in epic):**
- 8.1 creates `analyticsEvents` table and `convex/analytics.ts` — separate from `aiUsage`
- 8.1's `getEventCounts` is a different concept (feature usage events) — NOT the same as AI cost tracking
- AI cost tracking uses the `aiUsage` table which already exists from Epic 6
- Story 8.1 explicitly notes: "Story 8.2 (AI Cost Tracking & Monitoring) will add operator queries for AI cost breakdown by model, action type, and user. Builds on `aiUsage` table data (already exists). May add more `internalQuery` functions to `convex/analytics.ts` or `convex/usage.ts`"

**From Story 6.3 (done — most recent implemented):**
- 420 tests passing baseline
- `getUserUsageSummary` already exists as an `internalQuery` providing per-user breakdown — new queries expand this to cross-user operator views

**Code review lessons to apply:**
- Mock at highest-level abstraction in tests
- Ensure all queries use exact expected index names
- Don't import `internal` in test files — test handler functions directly

### Git Intelligence

Recent commits (patterns to follow):
```
fad3bf0 Implement Story 6.3: AI privacy disclosure
8468fce Implement Story 6.2: AI actions UI and document interactions
778c339 Implement Story 6.1: AI proxy backend and model routing
d396b5f Implement Story 5.3: Three-tier authorization and account deletion
```

**Expected commit:** `Implement Story 8.2: AI cost tracking and monitoring`

**Patterns from recent commits:**
- Each story is one commit with descriptive message
- Tests included in same commit as implementation

### Anti-Patterns to AVOID

- **Do NOT create an admin UI or dashboard page** — Phase 1 uses Convex dashboard queries only. No React components, no pages, no routes for this story.
- **Do NOT recalculate cost from tokens** — The `cost` field is already calculated and stored per-call by `logAiUsage` using `getTokenCostForModel()`. Aggregate the stored `cost` values, never recalculate.
- **Do NOT modify the `aiUsage` schema** — No new fields or indexes needed. The existing `by_createdAt` index supports all time-range queries.
- **Do NOT create a new file** — All queries belong in `convex/usage.ts` alongside existing usage functions.
- **Do NOT make queries public** — These are operator-only queries. Use `internalQuery`, not `query`. Public queries would expose cost data to any authenticated user.
- **Do NOT create real-time subscription endpoints** — The operator runs queries manually in the Convex dashboard. No need for reactive `useQuery` hooks or WebSocket subscriptions.
- **Do NOT add user email/name lookup in cost queries** — Return userId only. The operator can cross-reference with the `users` table in the Convex dashboard separately. Keeping queries focused avoids unnecessary joins.
- **Do NOT duplicate `getUserUsageSummary`** — The existing function provides per-user monthly summary. `getCostByUser` provides cross-user ranking for a given time period. They serve different purposes.
- **Do NOT track costs in a separate table** — The `aiUsage` table is the single source of truth for AI costs. No summary/cache tables.

### Future Story Awareness

**Story 8.3 (Abuse Detection & Account Flagging) will use:**
- The cost queries from this story to identify high-cost users for abuse detection
- `getCostByUser` results feed into abuse pattern detection logic
- Cron jobs in `convex/crons.ts` will call these queries periodically

**Story 9.x (Payments & Subscriptions) will use:**
- Cost data to validate pricing covers API costs
- Per-user cost tracking to set appropriate tier limits

### Scope Summary

| Action | Files |
|--------|-------|
| **Must Modify** | `convex/usage.ts` — add 3 new `internalQuery` functions |
| **Must Modify** | `convex/__tests__/usage.test.ts` — add tests for new queries |
| **Must NOT Modify** | `convex/schema.ts`, `convex/ai.ts`, `convex/modelRouter.ts`, any UI files |

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.2]
- [Source: _bmad-output/planning-artifacts/prd.md — FR43 (log every AI API call with model, token count, cost)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR44 (operator view usage analytics)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR45 (operator monitor AI API costs in real-time)]
- [Source: _bmad-output/planning-artifacts/prd.md — Cost Structure Constraints: trackable cost per call, cost monitoring dashboard]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture: aiUsage table]
- [Source: _bmad-output/planning-artifacts/architecture.md — Analytics Strategy: Convex-native, custom queries]
- [Source: _bmad-output/planning-artifacts/architecture.md — FR42-46 mapping to convex/analytics.ts, convex/usage.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md — Cross-Cutting: Cost Observability]
- [Source: convex/usage.ts — Existing usage queries and mutations]
- [Source: convex/schema.ts — aiUsage table schema with by_createdAt index]
- [Source: convex/modelRouter.ts — COST_PER_MILLION pricing and getTokenCostForModel]
- [Source: _bmad-output/implementation-artifacts/8-1-analytics-event-pipeline.md — Future Story Awareness section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Implemented `getCostSummary` internalQuery: aggregates totalCost, totalCalls, totalInputTokens, totalOutputTokens with breakdowns by model and actionType for any time period via `since` timestamp argument.
- Implemented `getCostByUser` internalQuery: groups AI usage by userId with per-user cost, call counts, and model/actionType breakdowns. Results sorted by totalCost descending with configurable limit (default 50).
- Implemented `getTimePeriodCosts` internalQuery: returns cost/call summaries for today, this week (Sunday start), and this month using a single DB query (month superset) with in-memory filtering.
- All three queries use the existing `by_createdAt` index on the `aiUsage` table. No schema changes required.
- Added 15 new tests covering all three queries: empty results, aggregation correctness, grouping by model/actionType/user, sorting, limit parameter, time period subsetting, deterministic cross-period filtering, and index usage verification.
- Full test suite: 517 tests passing across 54 test files. Zero regressions.

### File List

- `convex/usage.ts` — Modified: added `getCostSummary`, `getTimePeriodCosts`, `getCostByUser` internalQuery functions
- `convex/__tests__/usage.test.ts` — Modified: added 14 tests for the three new queries

### Change Log

- 2026-03-08: Implemented all 3 operator cost queries (`getCostSummary`, `getCostByUser`, `getTimePeriodCosts`) as `internalQuery` functions in `convex/usage.ts`. Added 14 unit tests. All 516 tests passing.
- 2026-03-08: Code review fixes — `getCostByUser` byModel/byActionType now include cost breakdowns (not just counts), added `roundCost()` helper for floating-point precision on all cost aggregations, added timezone comment on `getTimePeriodCosts`, removed unnecessary `as string` type assertion, added deterministic cross-period filtering test. 517 tests passing.
