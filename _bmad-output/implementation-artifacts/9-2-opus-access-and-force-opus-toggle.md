# Story 9.2: Opus Access & Force-Opus Toggle

Status: ready-for-dev

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

- [ ] Task 1: Add daily Opus usage tracking to `convex/usage.ts` (AC: #2, #4)
  - [ ] Add `getDailyOpusUsageCount` internalQuery — counts today's aiUsage records where model = Opus model ID for given userId
  - [ ] Add `getMyDailyOpusUsage` public query — returns `{ count, limit }` for current user's daily Opus usage (analogous to `getMyMonthlyUsage`)
  - [ ] Add helper `getStartOfDay()` function for UTC day boundary calculation
- [ ] Task 2: Update `convex/modelRouter.ts` to support force-Opus model selection (AC: #3)
  - [ ] Update `getModelForAction()` to accept `forceOpus: boolean` parameter
  - [ ] When `forceOpus === true` AND `userTier === "paid"`, return `MODEL_IDS.opus`
  - [ ] When `forceOpus === true` AND `userTier === "free"`, ignore forceOpus (return Sonnet) — defense-in-depth
  - [ ] Default behavior (forceOpus false): continue returning Sonnet for all actions
- [ ] Task 3: Update `convex/ai.ts` to handle Opus daily limits and forceOpus (AC: #1, #2, #3, #4, #5)
  - [ ] Add `forceOpus: v.optional(v.boolean())` to `callAnthropicApi` args
  - [ ] For paid users: skip monthly limit check (unlimited Sonnet)
  - [ ] When `forceOpus` is true and user is paid: check daily Opus count via `getDailyOpusUsageCount`
  - [ ] If daily Opus limit reached: fall back to Sonnet, include `opusFallback: true` in response
  - [ ] Pass `forceOpus` to `getModelForAction()` for model selection
  - [ ] Log analytics event `"ai.opus_used"` when Opus is selected
  - [ ] Log analytics event `"ai.opus_fallback"` when Opus falls back to Sonnet
- [ ] Task 4: Update `types/ai.ts` to include forceOpus in request/response types (AC: #3, #5)
  - [ ] Add `forceOpus?: boolean` to `AiRequestArgs`
  - [ ] Add `opusFallback?: boolean` to `AiResponse`
- [ ] Task 5: Update `lib/hooks/useAiAction.ts` to pass forceOpus parameter (AC: #3)
  - [ ] Add `forceOpus` parameter to `executeAction()` function signature
  - [ ] Pass `forceOpus` through to the Convex action call
  - [ ] When response includes `opusFallback: true`, show Hebrew toast: "מכסת Opus היומית נוצלה, משתמש ב-Sonnet"
- [ ] Task 6: Add "Deep Analysis" toggle to `components/ai/AiCommandPalette.tsx` (AC: #3, #6, #7)
  - [ ] Add `forceOpus` state (boolean, default false) within the palette
  - [ ] Query `api.usage.getMyDailyOpusUsage` for paid users
  - [ ] Render toggle row ONLY when user tier is "paid" (use `useCapabilities` hook)
  - [ ] Toggle label: "ניתוח מעמיק" (Deep Analysis) with remaining count badge (e.g., "3/5")
  - [ ] Pass `forceOpus` state to `onAction` callback
  - [ ] Disable toggle when daily Opus is exhausted (show "0/5" in muted style)
  - [ ] Reset `forceOpus` to false when palette closes
- [ ] Task 7: Update `app/editor/page.tsx` to wire forceOpus through the AI flow (AC: #3, #5)
  - [ ] Update `AiCommandPalette` `onAction` callback to receive `forceOpus` parameter
  - [ ] Pass `forceOpus` to `executeAction()` in `runAiAction`
  - [ ] Handle `opusFallback` in response (toast is handled in the hook)
- [ ] Task 8: Write tests (AC: all)
  - [ ] `convex/__tests__/usage.test.ts` — test `getDailyOpusUsageCount` and `getMyDailyOpusUsage`
  - [ ] `convex/__tests__/modelRouter.test.ts` — update tests for `forceOpus` parameter
  - [ ] `convex/__tests__/ai.test.ts` — test paid user unlimited Sonnet, Opus daily limit, fallback behavior
  - [ ] `components/ai/AiCommandPalette.test.tsx` — test toggle visibility per tier, toggle interaction, remaining count
  - [ ] `lib/hooks/useAiAction.test.ts` — test forceOpus passthrough, fallback toast

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

### Debug Log References

### Completion Notes List

### File List
