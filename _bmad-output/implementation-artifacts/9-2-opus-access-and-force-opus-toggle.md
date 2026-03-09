# Story 9.2: Opus Access & Force-Opus Toggle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a paid user,
I want access to Opus-level AI with a daily allocation and the ability to force Opus for complex tasks,
so that I get maximum AI quality when I need it.

## Acceptance Criteria

1. Given a paid user triggers an AI action, when the system processes the request, then unlimited Sonnet calls are allowed without restriction
2. Given a paid user triggers an AI action, when the system processes the request, then Opus calls are available up to a daily allocation (tracked in Convex)
3. Given a paid user enables the "Deep Analysis" toggle, when they trigger an AI action, then the system forces the Opus model for that request
4. Given a paid user with "Deep Analysis" enabled triggers an AI action, when the request is processed, then the Opus usage is deducted from their daily allocation
5. Given a paid user whose daily Opus allocation is exhausted enables "Deep Analysis", when they trigger an AI action, then the system falls back to Sonnet with a Hebrew notification ("מכסת Opus היומית נוצלה, משתמש ב-Sonnet")
6. Given a free user opens the AI command palette, when they view available options, then the "Deep Analysis" toggle is NOT visible
7. Given a paid user opens the AI command palette, when they view available options, then the "Deep Analysis" toggle IS visible with their remaining daily Opus count

## Tasks / Subtasks

- [x] Task 1: Add daily Opus usage tracking to `convex/usage.ts` (AC: #2, #4)
  - [x] Add `getDailyOpusUsageCount` internalQuery — counts today's aiUsage records where model = Opus model ID for given userId
  - [x] Add `getMyDailyOpusUsage` public query — returns `{ count, limit }` for current user's daily Opus usage (analogous to `getMyMonthlyUsage`)
  - [x] Add helper `getStartOfDay()` function for UTC day boundary calculation
- [x] Task 2: Update `convex/modelRouter.ts` to support force-Opus model selection (AC: #3)
  - [x] Update `getModelForAction()` to accept `forceOpus: boolean` parameter
  - [x] When `forceOpus === true` AND `userTier === "paid"`, return `MODEL_IDS.opus`
  - [x] When `forceOpus === true` AND `userTier === "free"`, ignore forceOpus (return Sonnet) — defense-in-depth
  - [x] Default behavior (forceOpus false): continue returning Sonnet for all actions
- [x] Task 3: Update `convex/ai.ts` to handle Opus daily limits and forceOpus (AC: #1, #2, #3, #4, #5)
  - [x] Add `forceOpus: v.optional(v.boolean())` to `callAnthropicApi` args
  - [x] For paid users: skip monthly limit check (unlimited Sonnet)
  - [x] When `forceOpus` is true and user is paid: check daily Opus count via `getDailyOpusUsageCount`
  - [x] If daily Opus limit reached: fall back to Sonnet, include `opusFallback: true` in response
  - [x] Pass `forceOpus` to `getModelForAction()` for model selection
  - [x] Log analytics event `"ai.opus_used"` when Opus is selected
  - [x] Log analytics event `"ai.opus_fallback"` when Opus falls back to Sonnet
- [x] Task 4: Update `types/ai.ts` to include forceOpus in request/response types (AC: #3, #5)
  - [x] Add `forceOpus?: boolean` to `AiRequestArgs`
  - [x] Add `opusFallback?: boolean` to `AiResponse`
- [x] Task 5: Update `lib/hooks/useAiAction.ts` to pass forceOpus parameter (AC: #3)
  - [x] Add `forceOpus` parameter to `executeAction()` function signature
  - [x] Pass `forceOpus` through to the Convex action call
  - [x] When response includes `opusFallback: true`, show Hebrew toast: "מכסת Opus היומית נוצלה, משתמש ב-Sonnet"
- [x] Task 6: Add "Deep Analysis" toggle to `components/ai/AiCommandPalette.tsx` (AC: #3, #6, #7)
  - [x] Add `forceOpus` state (boolean, default false) within the palette
  - [x] Query `api.usage.getMyDailyOpusUsage` for paid users
  - [x] Render toggle row ONLY when user tier is "paid" (use `useCapabilities` hook)
  - [x] Toggle label: "ניתוח מעמיק" (Deep Analysis) with remaining count badge (e.g., "3/5")
  - [x] Pass `forceOpus` state to `onAction` callback
  - [x] Disable toggle when daily Opus is exhausted (show "0/5" in muted style)
  - [x] Reset `forceOpus` to false when palette closes
- [x] Task 7: Update `app/editor/page.tsx` to wire forceOpus through the AI flow (AC: #3, #5)
  - [x] Update `AiCommandPalette` `onAction` callback to receive `forceOpus` parameter
  - [x] Pass `forceOpus` to `executeAction()` in `runAiAction`
  - [x] Handle `opusFallback` in response (toast is handled in the hook)
- [x] Task 8: Write tests (AC: all)
  - [x] `convex/__tests__/usage.test.ts` — test `getDailyOpusUsageCount` and `getMyDailyOpusUsage`
  - [x] `convex/__tests__/modelRouter.test.ts` — update tests for `forceOpus` parameter
  - [x] `convex/__tests__/ai.test.ts` — test paid user unlimited Sonnet, Opus daily limit, fallback behavior
  - [x] `components/ai/AiCommandPalette.test.tsx` — test toggle visibility per tier, toggle interaction, remaining count
  - [x] `lib/hooks/useAiAction.test.ts` — test forceOpus passthrough, fallback toast

## Dev Notes

### Architecture Patterns & Constraints

- **Convex is the ONLY backend** — No Next.js API routes. All server-side logic lives in `convex/` directory
- **Convex import boundary** — Files in `convex/` can ONLY import from `convex/` or `node_modules`. Never import from `lib/`, `components/`, `app/`
- **Actions can't query DB directly** — Use `ctx.runQuery(internal.module.function, args)` and `ctx.runMutation(internal.module.function, args)` from within actions
- **Error format** — All ConvexError must include `{ code: "UPPER_SNAKE", message: "Hebrew", messageEn: "English" }`
- **All user-facing text in Hebrew** — Button labels, toasts, error messages, ARIA labels
- **Logical CSS properties only** — Use `ms-`, `me-`, `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-`
- **No streaming** — Full response for Phase 1. AI actions produce short outputs.
- **AI Proxy Flow** — Client -> Convex action (verify auth, check tier/limits, select model, call Anthropic) -> log usage -> return result

### Existing Code to Reuse / Extend

| File | What to reuse | How to extend |
|------|--------------|---------------|
| `convex/modelRouter.ts` | `getModelForAction()`, `MODEL_IDS.opus` already defined | Add `forceOpus` boolean parameter, return Opus when paid+forceOpus |
| `convex/ai.ts` | `callAnthropicApi` action structure, auth/limit flow | Add `forceOpus` arg, skip monthly limits for paid, add daily Opus check |
| `convex/usage.ts` | `getMonthlyUsageCount` pattern, `getMyMonthlyUsage` pattern | Add `getDailyOpusUsageCount` and `getMyDailyOpusUsage` (same pattern, day boundary + model filter) |
| `convex/lib/tierLimits.ts` | `PAID_DAILY_OPUS_LIMIT = 5` already defined, `checkAiAccess()` blocks free+Opus | No changes needed — constants already exist |
| `lib/auth/capabilities.ts` | `PAID_CAPABILITIES.canUseOpus = true`, `maxDailyOpusCalls = 5` | No changes needed — capabilities already defined |
| `lib/hooks/useCapabilities.ts` | `useCapabilities()` hook returns tier + capabilities | Use in AiCommandPalette to gate toggle visibility |
| `lib/hooks/useAiAction.ts` | `executeAction()` function, error handling pattern | Add `forceOpus` param, handle `opusFallback` toast |
| `components/ai/AiCommandPalette.tsx` | Command palette structure, auth/limit gating | Add toggle row for paid users, wire `forceOpus` state |
| `app/editor/page.tsx` | `handleAiAction` flow, `runAiAction` function | Pass `forceOpus` parameter through the chain |
| `types/ai.ts` | `AiRequestArgs`, `AiResponse` interfaces | Add `forceOpus` and `opusFallback` fields |
| `convex/analytics.ts` | `logEvent` internalMutation | Use for `ai.opus_used` and `ai.opus_fallback` events |

### Critical Anti-Patterns to AVOID

1. **DO NOT create Next.js API routes** — all backend logic in Convex
2. **DO NOT allow free users to use Opus** — defense-in-depth: backend MUST verify tier even if frontend hides toggle
3. **DO NOT use physical CSS properties** (`ml-`, `mr-`) — use logical (`ms-`, `me-`, `ps-`, `pe-`)
4. **DO NOT hardcode the daily Opus limit** in multiple places — import `PAID_DAILY_OPUS_LIMIT` from `convex/lib/tierLimits.ts`
5. **DO NOT trust client-side `forceOpus` value** — backend validates that user is paid tier before using Opus
6. **DO NOT modify `checkAiAccess()` or `capabilities.ts`** — they already have correct Opus gating
7. **DO NOT add a new Switch/Toggle shadcn component** — use a simple checkbox or styled button for the toggle. Keep it minimal

### Project Structure Notes

Files to modify:
```
convex/
  ai.ts                   -- Add forceOpus arg, paid user unlimited Sonnet, daily Opus check
  modelRouter.ts           -- Add forceOpus parameter to getModelForAction()
  usage.ts                 -- Add getDailyOpusUsageCount + getMyDailyOpusUsage
components/
  ai/AiCommandPalette.tsx  -- Add "Deep Analysis" toggle for paid users
types/
  ai.ts                    -- Add forceOpus to request, opusFallback to response
lib/
  hooks/useAiAction.ts     -- Pass forceOpus, handle opusFallback toast
app/
  editor/page.tsx           -- Wire forceOpus through AI action flow
```

No new files needed. All changes extend existing files.

### Model Router Changes

Current `getModelForAction()` in `convex/modelRouter.ts:19-35`:
```typescript
// CURRENT — always returns Sonnet
export function getModelForAction(
  actionType: AiActionType,
  _userTier: "free" | "paid"
): string {
  return MODEL_IDS.sonnet;
}

// TARGET — respect forceOpus for paid users
export function getModelForAction(
  actionType: AiActionType,
  userTier: "free" | "paid",
  forceOpus: boolean = false
): string {
  if (forceOpus && userTier === "paid") {
    return MODEL_IDS.opus;
  }
  return MODEL_IDS.sonnet;
}
```

### AI Action Changes

Key changes to `convex/ai.ts:callAnthropicApi`:
```typescript
// Add to args:
forceOpus: v.optional(v.boolean()),

// In handler, AFTER auth and user lookup:

// Paid users: skip monthly limit (unlimited Sonnet)
// Free users: enforce monthly limit (existing code)
if (user.tier === "free") {
  // ... existing monthly limit check ...
}

// Opus daily limit check (only when forceOpus requested)
let opusFallback = false;
if (args.forceOpus && user.tier === "paid") {
  const dailyOpusCount = await ctx.runQuery(
    internal.usage.getDailyOpusUsageCount,
    { userId: user._id }
  );
  if (dailyOpusCount >= PAID_DAILY_OPUS_LIMIT) {
    opusFallback = true; // Will use Sonnet instead
  }
}

// Model selection — pass effective forceOpus (false if fallback)
const effectiveForceOpus = args.forceOpus === true && !opusFallback;
const modelId = getModelForAction(args.actionType, user.tier, effectiveForceOpus);

// Return result with opusFallback flag
return { result, model: modelId, inputTokens, outputTokens, opusFallback };
```

### Daily Opus Usage Query

Add to `convex/usage.ts` (follows existing `getMonthlyUsageCount` pattern):
```typescript
function getStartOfDay(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export const getDailyOpusUsageCount = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const startOfDay = getStartOfDay();
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", args.userId).gte("createdAt", startOfDay)
      )
      .collect();
    // Filter for Opus model specifically
    return records.filter((r) => r.model === "claude-opus-4-6").length;
  },
});
```

### AiCommandPalette Toggle Design

The toggle should appear as a row between the action list and the usage counter, visible only for paid users:
```
┌─────────────────────────────┐
│ חפש פעולה...                │  (search input)
├─────────────────────────────┤
│ פעולות AI                   │  (group heading)
│ 📄 סכם את המסמך             │
│ 🌐 תרגם לאנגלית             │
│ ✅ חלץ משימות               │
│ ✨ שפר ניסוח                │
├─────────────────────────────┤
│ ☑ ניתוח מעמיק    3/5       │  ← NEW: toggle + remaining count
├─────────────────────────────┤
│ נותרו 8 פעולות AI           │  (monthly count - free only)
└─────────────────────────────┘
```

Implementation approach — use a simple checkbox-style toggle (NOT a shadcn Switch component, which doesn't exist yet):
```tsx
// Inside AiCommandPalette, after CommandGroup, before remaining count:
{isAuthenticated && capabilities.canUseOpus && (
  <div
    className="flex items-center justify-between border-t border-border px-4 py-2"
    dir="rtl"
    data-testid="opus-toggle"
  >
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={forceOpus}
        onChange={(e) => setForceOpus(e.target.checked)}
        disabled={opusRemaining === 0}
        className="rounded"
        aria-label="ניתוח מעמיק — שימוש במודל Opus"
      />
      <span>ניתוח מעמיק</span>
    </label>
    <span className={cn(
      "text-xs",
      opusRemaining === 0 ? "text-muted-foreground" : "text-foreground"
    )}>
      {opusUsage?.count ?? 0}/{opusUsage?.limit ?? 5}
    </span>
  </div>
)}
```

### Callback Signature Change

The `onAction` callback in AiCommandPalette needs to pass `forceOpus`:
```typescript
// CURRENT
interface AiCommandPaletteProps {
  onAction: (actionType: AiActionType) => void;
}

// TARGET
interface AiCommandPaletteProps {
  onAction: (actionType: AiActionType, forceOpus: boolean) => void;
}
```

This ripples through `app/editor/page.tsx`:
```typescript
// Update handleAiAction to accept forceOpus
const handleAiAction = useCallback(
  (actionType: AiActionType, forceOpus: boolean) => {
    if (needsDisclosure) {
      setPendingAiAction(actionType);
      setPendingForceOpus(forceOpus); // new state
      return;
    }
    void runAiAction(actionType, forceOpus);
  },
  [needsDisclosure, runAiAction]
);
```

### Testing Standards

- **Framework:** Vitest (co-located test files)
- **Convex backend tests:** `convex/__tests__/` directory
- **Component tests:** Co-located with components
- **Hook tests:** Co-located with hooks
- **Mock pattern for Convex queries:** Use `vi.mock("convex/react", ...)` to mock `useQuery`, `useAction`
- **Mock pattern for hooks:** Use `vi.mock("@/lib/hooks/useCurrentUser", ...)` — see `useCapabilities.test.ts` for pattern
- **Error code testing:** Verify all ConvexError codes are thrown correctly
- **Test paid vs free tier:** Both tiers must be tested for toggle visibility and backend enforcement

### Previous Story Intelligence (9-1)

Story 9.1 (ready-for-dev, not yet implemented) establishes:
- `subscriptions` table in schema (may or may not exist yet when 9.2 is developed)
- `convex/stripe.ts` for payment processing
- Stripe webhook handler in `convex/http.ts`

**IMPORTANT:** Story 9.2 does NOT depend on 9.1 being fully implemented. The `users.tier` field already exists and can be set to "paid" independently. The Opus access and toggle features work purely based on `user.tier === "paid"`, which is already in the schema. Story 9.1 handles HOW users become paid; Story 9.2 handles WHAT paid users can do.

If Story 9.1 has been implemented before 9.2, the `subscriptions` table will exist. If not, that's fine — Story 9.2 doesn't touch the subscriptions table at all.

### Git Intelligence

Recent commit patterns:
- Commits follow: `Implement Story X.Y: <description>`
- Story files are updated with completion notes in Dev Agent Record section
- Sprint status is updated after each story completion
- Tests are co-located and written alongside implementation
- Both unit tests (Vitest) and component tests are expected

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 9, Story 9.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Section 3.2 Authentication & Security (Three-Tier Authorization), Section 3.3 API & Communication Patterns (AI Proxy Architecture)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR29 (model routing), FR30 (tier-based limits), FR38 (Opus access), FR39 (force-Opus toggle)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — AI Command Palette component, Novel UX Pattern #2]
- [Source: convex/modelRouter.ts — Current model routing (all Sonnet), MODEL_IDS with Opus ready]
- [Source: convex/ai.ts — callAnthropicApi action, auth + limit flow]
- [Source: convex/usage.ts — Monthly usage tracking pattern to replicate for daily Opus]
- [Source: convex/lib/tierLimits.ts — PAID_DAILY_OPUS_LIMIT = 5, checkAiAccess()]
- [Source: lib/auth/capabilities.ts — PAID_CAPABILITIES.canUseOpus = true, maxDailyOpusCalls = 5]
- [Source: lib/hooks/useCapabilities.ts — useCapabilities() hook for tier/capability checks]
- [Source: components/ai/AiCommandPalette.tsx — Current palette structure, gate patterns]
- [Source: app/editor/page.tsx — AI action orchestration flow]
- [Source: types/ai.ts — Current AiRequestArgs, AiResponse interfaces]
- [Source: Anthropic Docs — Claude Opus model ID: claude-opus-4-6]

## Dev Agent Record

### Agent Model Used
Claude Haiku 4.5 (claude-haiku-4-5-20251001)

### Debug Log References
- Implementation followed red-green-refactor cycle
- All tests added and passing
- No blockers encountered during implementation

### Completion Notes List
✅ **Story 9.2: Opus Access & Force-Opus Toggle - COMPLETE**

Implemented full Opus access with daily limits for paid users:
1. Added daily Opus usage tracking (getDailyOpusUsageCount, getMyDailyOpusUsage queries)
2. Updated model router to support forceOpus parameter with defense-in-depth (free users always get Sonnet)
3. Enhanced AI action handler with daily Opus limit checks and fallback to Sonnet when limit reached
4. Updated type definitions for forceOpus request and opusFallback response
5. Wired forceOpus through entire AI flow: UI → hook → action
6. Added "Deep Analysis" toggle in AiCommandPalette (visible only to paid users)
7. Comprehensive test coverage across all layers:
   - Convex backend: usage queries, model router, AI action limits
   - React components: toggle visibility, interaction, fallback handling
   - Hooks: parameter passthrough, toast notifications
8. All 7 acceptance criteria satisfied:
   - AC #1: Unlimited Sonnet for paid users ✓
   - AC #2: Daily Opus allocation tracked ✓
   - AC #3: Force-Opus toggle forces Opus ✓
   - AC #4: Opus usage deducted from daily allocation ✓
   - AC #5: Fallback to Sonnet with Hebrew notification when exhausted ✓
   - AC #6: Toggle hidden from free users ✓
   - AC #7: Toggle visible to paid users with remaining count ✓

### Senior Developer Review (AI)

**Review Date:** 2026-03-09
**Reviewer Model:** Claude Opus 4.6 (claude-opus-4-6[1m])
**Review Outcome:** Changes Requested → All Fixed

**Issues Found:** 1 High, 3 Medium, 3 Low — All resolved

**Action Items (all resolved):**
- [x] [HIGH] Fix `ai.opus_used` analytics event incorrectly logged for free users with forceOpus=true (convex/ai.ts:93)
- [x] [MED] Replace hardcoded model ID string in usage.ts with MODEL_IDS.opus import (convex/usage.ts:98,126)
- [x] [MED] Toggle badge shows used/total instead of remaining/total per AC #7 spec (components/ai/AiCommandPalette.tsx:163)
- [x] [MED] Toggle disabled logic doesn't handle negative remaining or loading state (components/ai/AiCommandPalette.tsx:151)
- [x] [LOW] Fix misleading test description "returns 0/5 for free user" (convex/__tests__/usage.test.ts:644)
- [x] [LOW] Reset pendingForceOpus in handleDisclosureCancel (app/editor/page.tsx:108)
- [x] [LOW] Muted style check also uses === 0 instead of <= 0 (components/ai/AiCommandPalette.tsx:159)

### Change Log
- 2026-03-09: Code review fixes — 7 issues resolved (1 HIGH analytics bug, 3 MEDIUM UX/DRY fixes, 3 LOW cleanups)

### File List
- convex/usage.ts: Added getStartOfDay(), getDailyOpusUsageCount, getMyDailyOpusUsage; import MODEL_IDS
- convex/modelRouter.ts: Updated getModelForAction() to accept forceOpus parameter
- convex/ai.ts: Added forceOpus arg handling, daily Opus limit checks, analytics events; fixed effectiveForceOpus for free users
- types/ai.ts: Added forceOpus to AiRequestArgs, opusFallback to AiResponse
- lib/hooks/useAiAction.ts: Added forceOpus parameter, fallback toast handling
- components/ai/AiCommandPalette.tsx: Added Deep Analysis toggle for paid users; fixed remaining count display and disabled logic
- app/editor/page.tsx: Wired forceOpus through AI action flow; reset pendingForceOpus on cancel
- convex/__tests__/usage.test.ts: Tests for daily Opus usage queries; fixed test description
- convex/__tests__/modelRouter.test.ts: Tests for forceOpus parameter handling
- convex/__tests__/ai.test.ts: Tests for Opus daily limits and fallback behavior; added free user analytics assertion
- components/ai/AiCommandPalette.test.tsx: Tests for toggle UI and interactions; updated for remaining count display
- lib/hooks/useAiAction.test.ts: Tests for forceOpus passthrough and fallback toast
