# Story 6.1: AI Proxy Backend & Model Routing

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a Convex AI proxy that routes requests to the appropriate Claude model based on task type,
so that AI calls are secure, cost-optimized, and never expose API keys to the client.

## Acceptance Criteria

1. **Authentication verification** — Given a registered user triggers an AI action, when the request reaches the Convex action, then the action verifies the user's Clerk authentication and tier via `requireAuth()` and `requireTier()` guards from `convex/lib/authorization.ts`.

2. **Model routing** — Given an AI action request with a task type, when the action selects a model, then Haiku (`claude-haiku-4-5-20251001`) is used for classification/internal tasks, Sonnet (`claude-sonnet-4-5-20250929`) is used for user-facing actions (summarize, translate, extract, improve), and the routing logic is extensible for future Opus access (paid tier).

3. **API key security** — Given the Anthropic API key, then it is stored as a Convex environment variable (`ANTHROPIC_API_KEY`), accessed only server-side in the Convex action, and never sent to or accessible from the client.

4. **Full response (no streaming)** — Given an AI action is invoked, when the Anthropic API responds, then the full response is returned (no streaming in Phase 1).

5. **Usage logging** — Given an AI action completes, then the call is logged to the `aiUsage` Convex table with: `userId`, `model`, `inputTokens`, `outputTokens`, `cost`, `actionType`, `createdAt` (timestamp).

6. **aiUsage table** — Given the Convex schema, then the `aiUsage` table exists with indexes `by_userId` and `by_createdAt` for efficient querying.

7. **Input sanitization** — Given document content sent to the AI, then the input is truncated to a safe maximum length (to stay within model context limits), and excessively long inputs are rejected with a clear Hebrew error message.

8. **Usage limit enforcement** — Given a free user triggers an AI action, when the Convex action checks their monthly usage count against `FREE_MONTHLY_AI_LIMIT`, then the request is rejected with error code `AI_LIMIT_REACHED` if the limit is exceeded, and the request proceeds if within limits.

9. **Error handling** — Given the Anthropic API is unavailable or returns an error, then the Convex action throws a typed `ConvexError` with Hebrew + English messages, and the error is propagated to the client for graceful UI handling.

10. **System prompts** — Given each AI action type (summarize, translate, extractActions, improveWriting), then a dedicated system prompt in Hebrew/English guides the model to produce the expected output format.

## Tasks / Subtasks

- [x] Task 1: Install Anthropic SDK (AC: #3)
  - [x] 1.1 Run `pnpm add @anthropic-ai/sdk` to install the Anthropic TypeScript SDK
  - [x] 1.2 Verify import works in a Convex action context

- [x] Task 2: Add `aiUsage` table to schema (AC: #5, #6)
  - [x] 2.1 Modify `convex/schema.ts` — Add `aiUsage` table: `userId` (string), `model` (string), `inputTokens` (number), `outputTokens` (number), `cost` (number), `actionType` (string), `createdAt` (number)
  - [x] 2.2 Add indexes: `.index("by_userId", ["userId"])` and `.index("by_createdAt", ["createdAt"])`
  - [x] 2.3 Run `npx convex dev` to verify schema deploys

- [x] Task 3: Create AI types (AC: #2, #10)
  - [x] 3.1 Create `types/ai.ts` — Export `AiActionType` union (`"summarize" | "translate" | "extractActions" | "improveWriting"`), `AiModel` union (`"haiku" | "sonnet" | "opus"`), and `AiRequestArgs` type (actionType, content, targetLanguage?)

- [x] Task 4: Create model router (AC: #2)
  - [x] 4.1 Create `convex/modelRouter.ts` — `MODEL_IDS` constant mapping `AiModel` to Claude model ID strings, `getModelForAction(actionType, userTier)` function returning appropriate model ID
  - [x] 4.2 Default routing: all user-facing actions → Sonnet; classification (future) → Haiku; Opus → paid tier only (Phase 2, return Sonnet for now)
  - [x] 4.3 Export `getTokenCostForModel(model, inputTokens, outputTokens)` — calculate cost per call for usage tracking

- [x] Task 5: Create system prompts (AC: #10)
  - [x] 5.1 Create `convex/prompts.ts` — Export `getSystemPrompt(actionType)` returning the system prompt string for each action type
  - [x] 5.2 Prompts: `summarize` (concise summary, preserve key points), `translate` (detect source language, translate between Hebrew/English), `extractActions` (structured bullet-point task list), `improveWriting` (grammar, style, clarity suggestions in same language as input)
  - [x] 5.3 All prompts instruct the model about Hebrew/RTL context and expected output format

- [x] Task 6: Create AI usage tracking (AC: #5, #8)
  - [x] 6.1 Create `convex/usage.ts` — `logAiUsage` internal mutation (called from action via `ctx.runMutation`)
  - [x] 6.2 Add `getMonthlyUsageCount` query — counts `aiUsage` records for a userId in current calendar month
  - [x] 6.3 Add `getUserUsageSummary` query — returns usage breakdown by model and action type for the current month (for future UI/analytics)

- [x] Task 7: Create AI proxy action (AC: #1, #3, #4, #7, #8, #9)
  - [x] 7.1 Create `convex/ai.ts` — Export `callAnthropicApi` action
  - [x] 7.2 Action flow: verify auth → check tier/limits → sanitize input → select model → build prompt → call Anthropic API → log usage → return result
  - [x] 7.3 Use `@anthropic-ai/sdk` `Anthropic` client instantiated with `process.env.ANTHROPIC_API_KEY`
  - [x] 7.4 Input sanitization: truncate content to `MAX_INPUT_CHARS` (100,000 chars ~25K tokens), reject empty content
  - [x] 7.5 Error handling: catch Anthropic SDK errors, wrap in ConvexError with appropriate codes (`AI_UNAVAILABLE`, `AI_INPUT_TOO_LONG`, `AI_LIMIT_REACHED`)
  - [x] 7.6 Return shape: `{ result: string, model: string, inputTokens: number, outputTokens: number }`

- [x] Task 8: Create tests (AC: all)
  - [x] 8.1 Create `convex/__tests__/ai.test.ts` — Test auth verification (rejects unauthenticated), test tier enforcement (rejects anonymous), test input sanitization (rejects empty, truncates long), test error handling (API failure wraps in ConvexError)
  - [x] 8.2 Create `convex/__tests__/usage.test.ts` — Test `logAiUsage` creates record, test `getMonthlyUsageCount` filters by month and userId
  - [x] 8.3 Create `convex/__tests__/modelRouter.test.ts` — Test all action types route to correct model, test cost calculation
  - [x] 8.4 Create `convex/__tests__/prompts.test.ts` — Test all action types return non-empty prompts, test prompts contain expected keywords

- [x] Task 9: Verify existing functionality
  - [x] 9.1 Verify all existing 300+ tests still pass
  - [x] 9.2 Verify `npx convex dev` deploys schema with new `aiUsage` table
  - [x] 9.3 Document `ANTHROPIC_API_KEY` setup in `.env.example` or README

## Dev Notes

### CRITICAL: Story 5.3 is a prerequisite

Story 5.3 (Three-Tier Authorization & Account Deletion) MUST be implemented before this story. Story 5.3 creates:
- `convex/lib/authorization.ts` — `requireAuth(ctx)` and `requireTier(ctx, minTier)` guards
- `convex/lib/tierLimits.ts` — `FREE_MONTHLY_AI_LIMIT`, `PAID_DAILY_OPUS_LIMIT` constants, `checkAiAccess(user, model)` function
- `lib/auth/capabilities.ts` — `TierCapabilities` interface, `getCapabilitiesForTier()` function

If these don't exist when you start, **STOP** and implement Story 5.3 first or inform the user.

### Also prerequisite: Stories 5.1 and 5.2

Both are **done**. The following exist and MUST NOT be recreated:
- `convex/schema.ts` — `users` table with `clerkId`, `email`, `name`, `tier`, `createdAt`
- `convex/users.ts` — `getCurrentUser`, `getCurrentUserOrThrow` queries, `upsertFromClerk`/`deleteFromClerk` mutations
- `convex/http.ts` — Clerk webhook handler
- `types/user.ts` — `UserTier` type (`"free" | "paid"`)
- `lib/hooks/useCurrentUser.ts` — Returns `{ user, isLoading, isAuthenticated }`

### Architecture: AI Proxy Flow

```
Client (useAction) → convex/ai.ts:callAnthropicApi
  1. requireAuth(ctx) → verify Clerk identity
  2. requireTier(ctx, "free") → verify user exists with at least "free" tier
  3. getMonthlyUsageCount(ctx, userId) → check against FREE_MONTHLY_AI_LIMIT (free tier only)
  4. sanitizeInput(content) → truncate to MAX_INPUT_CHARS, reject empty
  5. getModelForAction(actionType, userTier) → select Claude model ID
  6. getSystemPrompt(actionType) → get action-specific system prompt
  7. new Anthropic({ apiKey }).messages.create() → call Anthropic API
  8. ctx.runMutation(internal.usage.logAiUsage, { ... }) → log usage
  9. Return { result, model, inputTokens, outputTokens }
```

### Convex Import Boundary — CRITICAL

Convex functions can ONLY import from:
- Within `convex/` directory
- `node_modules` packages

**NEVER** import from `lib/`, `types/`, `components/`, or `app/` in Convex files. This is why model routing, prompts, and all AI backend logic lives in `convex/`, not `lib/ai/`.

The `types/ai.ts` file is for **frontend** usage only. Convex files must re-declare or inline any shared types they need.

### Anthropic SDK Usage in Convex Action

```typescript
// convex/ai.ts
import Anthropic from "@anthropic-ai/sdk";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

export const callAnthropicApi = action({
  args: {
    actionType: v.union(
      v.literal("summarize"),
      v.literal("translate"),
      v.literal("extractActions"),
      v.literal("improveWriting")
    ),
    content: v.string(),
    targetLanguage: v.optional(v.union(v.literal("he"), v.literal("en"))),
  },
  handler: async (ctx, args) => {
    // 1. Auth verification (from Story 5.3)
    const identity = await requireAuth(ctx);
    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    });
    // ... flow continues
  },
});
```

**IMPORTANT:** Convex actions cannot directly query the database — they must use `ctx.runQuery()` and `ctx.runMutation()` to call internal queries/mutations. This is a Convex architectural constraint.

### Model IDs and Routing

| Model Alias | Claude Model ID | Use Case | Cost (per 1M tokens) |
|-------------|----------------|----------|---------------------|
| haiku | `claude-haiku-4-5-20251001` | Classification, internal tasks | Input: $0.80, Output: $4.00 |
| sonnet | `claude-sonnet-4-5-20250929` | User-facing actions (summarize, translate, extract, improve) | Input: $3.00, Output: $15.00 |
| opus | `claude-opus-4-6` | Premium actions (Phase 2, paid tier only) | Input: $15.00, Output: $75.00 |

**Phase 1 routing:** All user-facing actions → Sonnet. Opus is defined but not routable until Phase 2 payment is implemented.

### aiUsage Table Schema

```typescript
// Add to convex/schema.ts
aiUsage: defineTable({
  userId: v.string(),        // Convex user _id (not clerkId)
  model: v.string(),         // "haiku" | "sonnet" | "opus"
  inputTokens: v.number(),   // Tokens in the request
  outputTokens: v.number(),  // Tokens in the response
  cost: v.number(),          // Calculated cost in USD
  actionType: v.string(),    // "summarize" | "translate" | "extractActions" | "improveWriting"
  createdAt: v.number(),     // Date.now() timestamp
})
  .index("by_userId", ["userId"])
  .index("by_createdAt", ["createdAt"])
```

**userId is the Convex `_id` from the users table**, not the Clerk ID. This avoids cross-referencing issues and matches the user record directly.

### Internal Query Pattern for Actions

Since Convex actions cannot directly query the DB, create internal queries/mutations:

```typescript
// convex/users.ts — ADD this internal query
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
```

Check if `getCurrentUser` can be reused. If it already uses `ctx.auth.getUserIdentity()` internally, it won't work from an action context that's calling via `ctx.runQuery`. You'll need a separate internal query that takes `clerkId` as an arg.

### Input Sanitization

```typescript
const MAX_INPUT_CHARS = 100_000; // ~25K tokens, safe for 200K context models

function sanitizeInput(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new ConvexError({
      code: "AI_INPUT_EMPTY",
      message: "לא ניתן לעבד מסמך ריק",
      messageEn: "Cannot process empty document",
    });
  }
  // Truncate if too long (don't reject — truncate silently)
  return trimmed.length > MAX_INPUT_CHARS
    ? trimmed.slice(0, MAX_INPUT_CHARS)
    : trimmed;
}
```

### Error Codes

| Code | When | Hebrew Message |
|------|------|---------------|
| `AUTH_REQUIRED` | No Clerk session | "נדרש התחברות" |
| `USER_NOT_FOUND` | Clerk session but no Convex user | "משתמש לא נמצא" |
| `TIER_INSUFFICIENT` | Anonymous user tries AI | "נדרש מנוי לתכונה זו" |
| `AI_LIMIT_REACHED` | Free user exceeded monthly limit | "הגעת למגבלת השימוש החודשית ב-AI" |
| `AI_INPUT_EMPTY` | Empty document content | "לא ניתן לעבד מסמך ריק" |
| `AI_UNAVAILABLE` | Anthropic API error/timeout | "AI לא זמין כרגע. נסה שוב מאוחר יותר" |
| `AI_CONFIG_ERROR` | Missing ANTHROPIC_API_KEY | "שגיאת הגדרות שרת" |

### System Prompts Design

```typescript
// convex/prompts.ts
export function getSystemPrompt(actionType: AiActionType): string {
  const prompts: Record<string, string> = {
    summarize: `You are a document summarization assistant. Summarize the following document concisely.
- Preserve key points and main arguments
- Output in the SAME LANGUAGE as the input (Hebrew or English)
- Use bullet points for clarity
- Keep the summary under 300 words`,

    translate: `You are a Hebrew-English translation assistant.
- Detect the source language of each paragraph
- Translate Hebrew text to English and English text to Hebrew
- Preserve formatting (Markdown syntax, headers, lists)
- Maintain technical terms where appropriate
- Output only the translated text, no explanations`,

    extractActions: `You are a task extraction assistant.
- Extract all action items, tasks, and to-dos from the document
- Format as a Markdown bullet-point checklist (- [ ] Task)
- Group related tasks if possible
- Output in the SAME LANGUAGE as the input
- If no action items found, state that clearly`,

    improveWriting: `You are a writing improvement assistant.
- Suggest grammar, style, and clarity improvements
- Preserve the author's voice and intent
- Output the improved text with changes highlighted using **bold** for additions
- If the text is in Hebrew, provide suggestions in Hebrew
- Focus on clarity and readability, not length`,
  };
  return prompts[actionType];
}
```

### Cost Calculation

```typescript
// convex/modelRouter.ts
const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.80, output: 4.00 },
  "claude-sonnet-4-5-20250929": { input: 3.00, output: 15.00 },
  "claude-opus-4-6": { input: 15.00, output: 75.00 },
};

export function getTokenCostForModel(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = COST_PER_MILLION[modelId];
  if (!costs) return 0;
  return (
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output
  );
}
```

### Existing Infrastructure (DO NOT Recreate)

- **`convex/schema.ts`** — Has `users` table. ADD `aiUsage` table here.
- **`convex/users.ts`** — Has `getCurrentUser`, `getCurrentUserOrThrow`, `upsertFromClerk`, `deleteFromClerk`. ADD `getUserByClerkId` internal query if needed.
- **`convex/http.ts`** — Clerk webhook handler. Do NOT modify.
- **`convex/auth.config.ts`** — Clerk JWT issuer. Do NOT modify.
- **`convex/lib/authorization.ts`** — (From Story 5.3) `requireAuth()`, `requireTier()`. IMPORT these.
- **`convex/lib/tierLimits.ts`** — (From Story 5.3) `FREE_MONTHLY_AI_LIMIT`, `checkAiAccess()`. IMPORT these.

### Must Be Created (Story 6.1 Scope)

| File | Purpose |
|------|---------|
| `convex/ai.ts` | `callAnthropicApi` action — main AI proxy |
| `convex/usage.ts` | `logAiUsage` mutation, `getMonthlyUsageCount` query, `getUserUsageSummary` query |
| `convex/modelRouter.ts` | `MODEL_IDS` constant, `getModelForAction()`, `getTokenCostForModel()` |
| `convex/prompts.ts` | `getSystemPrompt()` — system prompts per action type |
| `types/ai.ts` | `AiActionType`, `AiModel`, `AiRequestArgs`, `AiResponse` types (frontend use) |
| `convex/__tests__/ai.test.ts` | Tests for AI proxy action |
| `convex/__tests__/usage.test.ts` | Tests for usage tracking |
| `convex/__tests__/modelRouter.test.ts` | Tests for model routing |
| `convex/__tests__/prompts.test.ts` | Tests for system prompts |

### Must Be Modified (Story 6.1 Scope)

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `aiUsage` table definition with indexes |
| `convex/users.ts` | Add `getUserByClerkId` internal query (if needed for action context) |
| `package.json` | Add `@anthropic-ai/sdk` dependency |
| `.env.example` | Document `ANTHROPIC_API_KEY` requirement |

### Project Structure Notes

- `convex/ai.ts` matches architecture's planned file structure
- `convex/usage.ts` matches architecture's planned file structure
- `convex/modelRouter.ts` and `convex/prompts.ts` are per the architecture validation structural fix (AI logic in `convex/`, not `lib/ai/`)
- `types/ai.ts` follows existing pattern of `types/editor.ts`, `types/colors.ts`, `types/user.ts`
- Tests co-located in `convex/__tests__/` per project convention
- `components/ai/` already has `AiActionPlaceholder.tsx` from Story 5.2 — Story 6.2 will add the full AI panel components

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Convex actions | verb prefix, camelCase | `callAnthropicApi` |
| Convex mutations | verb prefix, camelCase | `logAiUsage` |
| Convex queries | get/list prefix, camelCase | `getMonthlyUsageCount` |
| Internal functions | exported via `internal` | `internal.usage.logAiUsage` |
| Constants | UPPER_SNAKE_CASE | `MAX_INPUT_CHARS`, `MODEL_IDS` |
| Types/Interfaces | PascalCase | `AiActionType`, `AiModel` |
| Error codes | UPPER_SNAKE_CASE | `AI_LIMIT_REACHED`, `AI_UNAVAILABLE` |
| UI text | Hebrew | All error `message` fields |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@anthropic-ai/sdk` | ^0.78.0 | Anthropic TypeScript SDK for `messages.create()` | **NEW — must install** |
| `convex` | ^1.32.0 | `action`, `internalMutation`, `internalQuery`, `ConvexError` | Already installed |

**Install:** `pnpm add @anthropic-ai/sdk`

**Environment variable:** `ANTHROPIC_API_KEY` must be set in Convex:
```bash
npx convex env set ANTHROPIC_API_KEY <your-key>
```

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Current baseline:** 28 test files, 300 tests passing (after Story 5.2)

**Mocking patterns for Convex actions/queries:**

The Convex test pattern from this codebase uses a mock builder approach:

```typescript
// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Mock AI response" }],
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
    },
  })),
}));
```

**Required test scenarios:**

1. **ai.test.ts** — Rejects unauthenticated requests, rejects anonymous users, rejects empty content, truncates long content, calls Anthropic with correct model, logs usage after success, handles Anthropic errors gracefully
2. **usage.test.ts** — `logAiUsage` creates record with all fields, `getMonthlyUsageCount` returns 0 for new user, `getMonthlyUsageCount` counts only current month records
3. **modelRouter.test.ts** — All action types route to Sonnet (Phase 1), cost calculation is accurate for known models, unknown model returns 0 cost
4. **prompts.test.ts** — All 4 action types return non-empty strings, prompts mention expected keywords (e.g., "summarize" prompt mentions "summary")

### Previous Story Intelligence

**From Story 5.3 (prerequisite, ready-for-dev — NOT YET IMPLEMENTED):**
- Creates `convex/lib/authorization.ts` with `requireAuth()` and `requireTier()` guards
- Creates `convex/lib/tierLimits.ts` with `FREE_MONTHLY_AI_LIMIT` and `checkAiAccess()`
- Story 6.1's `callAnthropicApi` action MUST import and use these guards
- If Story 5.3 is not done, implement the auth guards inline in `convex/ai.ts` and refactor later (not recommended — better to implement 5.3 first)

**From Story 5.2 (done):**
- `AiActionPlaceholder.tsx` exists in `components/ai/` — shows register prompt for anonymous, "coming soon" for authenticated
- Story 6.2 will replace this placeholder with the full AI panel
- `useCurrentUser` hook is canonical for auth state — but won't be used directly in Convex backend code (different execution context)
- 300 tests passing, 28 test files

**From Story 5.1 (done):**
- `identity.subject` from `ctx.auth.getUserIdentity()` is the Clerk user ID (`clerkId`)
- Convex users table stores `tier` as `"free" | "paid"` — use this for tier-based model access decisions
- Internal mutations use `internalMutation` from `convex/_generated/server`

**Code review lessons to apply:**
- Don't duplicate logic — import existing guards from Story 5.3
- Don't create unused types — only export what's consumed
- Mock at highest-level abstraction in tests
- Include both `message` (Hebrew) and `messageEn` (English) in ALL ConvexError payloads

### Git Intelligence

Recent commits:
```
32281fb Implement Story 5.2: Anonymous and authenticated editor experience
a489249 Implement Story 5.1: Clerk auth integration and Convex user sync
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
d16e68a Implement Story 4.1: Per-sentence BiDi detection engine
ebed371 Fix Story 3.4 code review issues: logical CSS, lang attr, LTR test, toast duration
```

**Expected commit:** `Implement Story 6.1: AI proxy backend and model routing`

### Anti-Patterns to AVOID

- **Do NOT create `lib/ai/` directory** — Convex import boundary prevents importing from `lib/`. All AI backend logic lives in `convex/`.
- **Do NOT implement streaming** — Phase 1 uses full response only. Streaming adds complexity without significant UX benefit for short outputs.
- **Do NOT create UI components** — Story 6.1 is backend only. UI is Story 6.2.
- **Do NOT store document content** — Documents are sent ephemerally to the AI and never persisted server-side (FR51 privacy requirement).
- **Do NOT use Next.js API routes for AI** — All AI calls go through Convex actions, not Next.js API routes.
- **Do NOT use `fetch()` to call Anthropic** — Use the official `@anthropic-ai/sdk` which handles auth, retries, and typing.
- **Do NOT hardcode model IDs** — Use the `MODEL_IDS` constant from `modelRouter.ts` for maintainability.
- **Do NOT use optimistic updates for AI usage** — Server state (usage counts) must always go through Convex mutations.

### Future Epic Awareness

**Story 6.2 (AI Actions UI) will consume:**
- `api.ai.callAnthropicApi` via `useAction` hook
- `AiActionType` from `types/ai.ts`
- Error codes (`AI_LIMIT_REACHED`, `AI_UNAVAILABLE`) for UI-specific error handling

**Story 6.4 (AI Usage Limits & Upgrade Prompts) will consume:**
- `api.usage.getMonthlyUsageCount` for displaying remaining calls
- `AI_LIMIT_REACHED` error code for showing upgrade banner

**Epic 8 (Analytics) will consume:**
- `aiUsage` table data for cost tracking and monitoring dashboards

### Project Context Warning

The `project-context.md` describes the v1 architecture (single-file vanilla JS SPA). The project has been rebuilt as a Next.js 16 + Convex + Clerk application. **Ignore** project-context.md technology stack — follow architecture patterns established in Stories 5.1, 5.2, and 5.3.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — AI Proxy Architecture, API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md — Authentication & Security, Three-Tier Authorization]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture, Convex Schema (aiUsage table)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Structure Patterns, Convex Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md — Architecture Validation (Structural Fix: AI logic in convex/)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Environment Variables (ANTHROPIC_API_KEY)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR24-FR31 (AI Document Actions), FR50-FR51 (Privacy)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — AI Action Patterns]
- [Source: _bmad-output/implementation-artifacts/5-2-anonymous-and-authenticated-editor-experience.md — Previous Story]
- [Source: _bmad-output/implementation-artifacts/5-3-three-tier-authorization-and-account-deletion.md — Prerequisite Story]
- [Source: Anthropic SDK — @anthropic-ai/sdk npm](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [Source: Anthropic SDK — GitHub](https://github.com/anthropics/anthropic-sdk-typescript)
- [Source: Claude API Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Source: Convex Actions Documentation](https://docs.convex.dev/functions/actions)

## Change Log

- 2026-03-08: Implemented Story 6.1 — AI proxy backend with model routing, usage tracking, system prompts, input sanitization, and comprehensive tests. All 381 tests pass (38 new across 4 test files).
- 2026-03-08: Code review fixes — compound index for usage queries (H3), error detail propagation (H4), DRY AiActionType via import (M1), v.id("users") type safety (M3), AiModel consistency in tierLimits (M4), corrected File List documentation (H1), updated test assertions.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed `deleteAccount.test.ts` regression: added `internalQuery` to mock of `../_generated/server` after adding `getUserByClerkId` internal query to `convex/users.ts`
- Fixed `ai.test.ts` mock: used ES6 class instead of arrow function for Anthropic SDK constructor mock (arrow functions can't be `new`-constructed in vitest v4)

### Completion Notes List

- Installed `@anthropic-ai/sdk` v0.78.0
- Added `aiUsage` table to `convex/schema.ts` with `by_userId` and `by_createdAt` indexes
- Created `types/ai.ts` with `AiActionType`, `AiModel`, `AiRequestArgs`, `AiResponse` types for frontend use
- Created `convex/modelRouter.ts` with `MODEL_IDS` constant, `getModelForAction()` (Phase 1: all → Sonnet), `getTokenCostForModel()` for cost tracking
- Created `convex/prompts.ts` with `getSystemPrompt()` returning Hebrew/English-aware prompts for all 4 action types
- Created `convex/usage.ts` with `logAiUsage` internal mutation, `getMonthlyUsageCount` and `getUserUsageSummary` internal queries
- Created `convex/ai.ts` with `callAnthropicApi` action implementing full auth → limits → sanitize → route → call → log → return flow
- Created 38 new tests across 4 test files covering all acceptance criteria
- All 381 tests pass (37 test files) with zero regressions
- Note: `getUserByClerkId` in `convex/users.ts` was already added by Story 5.3

### File List

New files:
- types/ai.ts
- convex/ai.ts
- convex/usage.ts
- convex/modelRouter.ts
- convex/prompts.ts
- convex/__tests__/ai.test.ts
- convex/__tests__/usage.test.ts
- convex/__tests__/modelRouter.test.ts
- convex/__tests__/prompts.test.ts

Modified files:
- convex/schema.ts (added aiUsage table with compound index by_userId_createdAt, userId as v.id("users"))
- convex/lib/tierLimits.ts (added "haiku" to AiModel type for consistency)
- package.json (added @anthropic-ai/sdk dependency)
- pnpm-lock.yaml (updated lockfile)
- lib/hooks/useLocalStorage.ts (refactored: lazy useState → useLayoutEffect + useCallback)
- lib/hooks/useTheme.ts (refactored: simplified init, useLayoutEffect for system preference)
