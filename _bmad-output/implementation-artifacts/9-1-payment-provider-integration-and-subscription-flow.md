# Story 9.1: Payment Provider Integration & Subscription Flow

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a free registered user,
I want to upgrade to a paid subscription through a secure checkout flow,
so that I can unlock unlimited AI features.

## Acceptance Criteria

1. Given a free registered user clicks "Upgrade", when they are redirected to the Stripe Checkout page, then they can complete payment securely (no card data touches Marko's servers)
2. Given a successful payment, when the Stripe webhook fires `checkout.session.completed`, then the user's tier is updated to "paid" in Convex `users` table
3. Given a successful payment, when the subscription is created, then a `subscriptions` record is created in Convex with: userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd, createdAt
4. Given the checkout page, when the user views pricing, then 17% VAT is clearly displayed and pricing is in NIS (ILS)
5. Given a free user in the AI command palette, when they click the "שדרג עכשיו" button, then they are redirected to the Stripe Checkout page (replacing the current placeholder toast)
6. Given a payment failure or cancellation at checkout, when the user returns to the app, then they see a Hebrew error message and remain on the free tier

## Tasks / Subtasks

- [x] Task 1: Add `subscriptions` table to Convex schema (AC: #3)
  - [x] Define table with fields: userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd, createdAt
  - [x] Add indexes: by_userId, by_stripeCustomerId, by_stripeSubscriptionId
- [x] Task 2: Create `convex/subscriptions.ts` with subscription management functions (AC: #2, #3)
  - [x] `createSubscription` internalMutation — creates subscription record after webhook
  - [x] `updateSubscriptionStatus` internalMutation — updates status and period end
  - [x] `getMySubscription` query — returns current user's active subscription
  - [x] `updateUserTier` internalMutation — updates users.tier to "paid"
- [x] Task 3: Create Stripe checkout session action (AC: #1, #4)
  - [x] `createCheckoutSession` action — creates Stripe Checkout Session with mode="subscription", currency="ils", VAT display
  - [x] Use `"use node"` directive for Stripe SDK access
  - [x] Include success_url and cancel_url with session ID placeholder
  - [x] Create Stripe customer if not exists, store stripeCustomerId
- [x] Task 4: Add Stripe webhook handler to `convex/http.ts` (AC: #2, #3, #6)
  - [x] Add `/stripe-webhook` POST route
  - [x] Verify webhook signature using Stripe SDK
  - [x] Handle `checkout.session.completed` — create subscription, update tier to "paid"
  - [x] Handle `invoice.paid` — confirm subscription renewal
  - [x] Handle `invoice.payment_failed` — flag payment issue
  - [x] Handle `customer.subscription.deleted` — revert tier to "free"
- [x] Task 5: Update `UpgradePrompt.tsx` to trigger real checkout flow (AC: #5)
  - [x] Replace placeholder toast with call to `createCheckoutSession` action
  - [x] Handle loading state during checkout session creation
  - [x] Redirect user to Stripe Checkout URL
  - [x] Handle errors with Hebrew toast messages
- [x] Task 6: Create success/cancel return pages or handling (AC: #6)
  - [x] Handle return from Stripe Checkout (success path — confirm subscription)
  - [x] Handle return from Stripe Checkout (cancel path — show message)
- [x] Task 7: Update `deleteMyAccount` to cancel active subscriptions (AC: related)
  - [x] Before deleting Clerk user, cancel any active Stripe subscription
  - [x] Delete subscription records from Convex
- [x] Task 8: Add Stripe product/price configuration notes (AC: #4)
  - [x] Document Stripe Dashboard setup: product, price in ILS, recurring monthly, tax behavior
- [x] Task 9: Write tests (AC: all)
  - [x] Unit tests for subscription mutations
  - [x] Unit tests for checkout session creation (mocked Stripe)
  - [x] Unit tests for webhook handler (signature verification, event processing)
  - [x] Update existing auth/tier tests if affected

## Dev Notes

### Architecture Patterns & Constraints

- **Convex is the ONLY backend** — No Next.js API routes. All server-side logic lives in `convex/` directory
- **Convex import boundary** — Files in `convex/` can ONLY import from `convex/` or `node_modules`. Never import from `lib/`, `components/`, `app/`
- **Stripe SDK in actions only** — Stripe Node.js SDK requires `"use node"` directive at top of file. Only Convex `action` and `httpAction` support Node.js runtime
- **Actions can't query DB directly** — Use `ctx.runQuery(internal.module.function, args)` and `ctx.runMutation(internal.module.function, args)` from within actions
- **Error format** — All ConvexError must include `{ code: "UPPER_SNAKE", message: "Hebrew", messageEn: "English" }`
- **Payment data NEVER touches Marko's servers** — Stripe Checkout handles all card input (PCI-DSS compliance via Stripe)
- **All user-facing text in Hebrew** — Button labels, toasts, error messages, ARIA labels

### Existing Code to Reuse / Extend

| File | What to reuse | How to extend |
|------|--------------|---------------|
| `convex/schema.ts` | Existing `users` table with `tier` field | Add `subscriptions` table definition |
| `convex/http.ts` | Clerk webhook handler pattern | Add Stripe webhook route alongside Clerk route |
| `convex/users.ts` | `upsertFromClerk`, `getUserByClerkId` | Add `updateTier` internalMutation |
| `convex/lib/authorization.ts` | `requireAuth`, `requireTier` | No changes needed — already supports "paid" tier |
| `convex/lib/tierLimits.ts` | `checkAiAccess` function | No changes needed — already gates Opus for paid only |
| `components/auth/UpgradePrompt.tsx` | Component structure and styling | Replace `toast.info` placeholder with real checkout flow |
| `convex/users.ts:deleteMyAccount` | Account deletion flow | Add subscription cancellation before Clerk deletion (TODO already exists at line 149) |
| `lib/hooks/useAiAction.ts` | Error handling patterns | Reference for how to handle ConvexError in UI |
| `lib/hooks/useCurrentUser.ts` | User state hook | Tier will reactively update when subscription activates |

### Critical Anti-Patterns to AVOID

1. **DO NOT create Next.js API routes** for Stripe — use Convex actions and httpActions exclusively
2. **DO NOT store card data, payment tokens, or PII** in Convex — Stripe handles all payment data
3. **DO NOT use `fetch()` from client** to call Stripe — always go through Convex actions
4. **DO NOT use physical CSS properties** (`ml-`, `mr-`) — use logical (`ms-`, `me-`, `ps-`, `pe-`)
5. **DO NOT use optimistic updates** for payment state — always wait for webhook confirmation
6. **DO NOT hardcode prices** — use Stripe Price ID from environment variable
7. **DO NOT skip webhook signature verification** — always verify with `stripe.webhooks.constructEvent()`

### Project Structure Notes

New files to create:
```
convex/
  subscriptions.ts          -- Subscription queries/mutations/actions
  stripe.ts                 -- Stripe checkout + webhook fulfillment actions ("use node")
```

Files to modify:
```
convex/schema.ts            -- Add subscriptions table
convex/http.ts              -- Add /stripe-webhook route
convex/users.ts             -- Add updateTier internalMutation, update deleteMyAccount
components/auth/UpgradePrompt.tsx  -- Real checkout flow
```

Environment variables to add (Convex env via `npx convex env set`):
```
STRIPE_SECRET_KEY           -- Stripe secret key (sk_live_... or sk_test_...)
STRIPE_WEBHOOKS_SECRET      -- Stripe webhook signing secret (whsec_...)
STRIPE_PRICE_ID             -- Stripe Price ID for monthly subscription (price_...)
NEXT_PUBLIC_APP_URL         -- App URL for Stripe redirect (https://marko.app or http://localhost:3000)
```

### Convex Schema Addition

```typescript
// Add to convex/schema.ts
subscriptions: defineTable({
  userId: v.id("users"),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("incomplete")
  ),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_stripeCustomerId", ["stripeCustomerId"])
  .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),
```

### Stripe Webhook Handler Pattern

Follow the existing Clerk webhook pattern in `convex/http.ts`:
```typescript
// Add to convex/http.ts alongside existing Clerk webhook
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }
    const payload = await request.text();
    const result = await ctx.runAction(internal.stripe.fulfillStripeWebhook, {
      signature,
      payload,
    });
    return new Response(null, { status: result.success ? 200 : 400 });
  }),
});
```

### Stripe Checkout Session Creation Pattern

```typescript
// convex/stripe.ts — "use node" required for Stripe SDK
"use node";
import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});
```

### Stripe Dashboard Setup (Manual Steps)

Before implementation, configure in Stripe Dashboard:
1. Create a Product (e.g., "Marko Pro - מנוי מרקו")
2. Create a Price: recurring, monthly, amount in ILS, tax_behavior: "inclusive" (17% VAT included)
3. Set up webhook endpoint: `https://<deployment>.convex.site/stripe-webhook`
4. Subscribe to events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
5. Copy webhook signing secret to Convex env

### Testing Standards

- **Framework:** Vitest (co-located test files)
- **Convex tests:** `convex/__tests__/subscriptions.test.ts`
- **Component tests:** `components/auth/UpgradePrompt.test.tsx`
- **Mock Stripe SDK:** Mock the Stripe constructor and methods (checkout.sessions.create, webhooks.constructEvent)
- **Mock pattern:** Use `vi.mock("stripe", () => ({ default: class { ... } }))` — match existing Anthropic SDK mock pattern
- **Error code testing:** Verify all ConvexError codes are thrown correctly
- **Do NOT test Stripe internals** — only test that your code calls Stripe correctly and handles responses

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 9, Story 9.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Section 3.2 Authentication & Security, Section 3.3 API Patterns, Section 5.4 Integration Points]
- [Source: _bmad-output/planning-artifacts/prd.md — FR37-FR41, NFR10, NFR27-28]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 3, Upgrade Prompt Design]
- [Source: convex/schema.ts — Current schema (users, aiUsage tables)]
- [Source: convex/http.ts — Clerk webhook handler pattern]
- [Source: convex/users.ts — deleteMyAccount TODO at line 149]
- [Source: convex/lib/tierLimits.ts — Existing tier check functions]
- [Source: components/auth/UpgradePrompt.tsx — Placeholder upgrade button]
- [Source: Stripe Docs — Checkout Sessions API, Subscriptions, Webhooks]
- [Source: Convex Docs — httpAction, Stripe integration pattern (stack.convex.dev)]

### Latest Technical Information (March 2026)

**Stripe:**
- Latest API version: `2026-02-25.clover`
- Stripe supports ILS (Israeli Shekel) currency natively
- Use `stripe.checkout.sessions.create()` with `mode: "subscription"` for recurring billing
- Flexible Billing Mode available via `subscription_data: { billing_mode: { type: "flexible" } }`
- Key webhook events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Stripe Node.js SDK: `npm install stripe` (latest v17.x)

**Convex + Stripe:**
- Use `httpAction` for webhook endpoints (exposed at `<deployment>.convex.site/<path>`)
- Official `@convex-dev/stripe` component available, but custom httpAction is simpler for this use case
- Webhook verification: extract `stripe-signature` header, delegate to action with `"use node"` for Stripe SDK access
- Environment variables set via `npx convex env set STRIPE_SECRET_KEY sk_...`

**Sumit API (NOT in scope for Story 9.1):**
- Sumit receipt generation is Story 9.3 scope
- API available at `api.sumit.co.il`
- Will be called from Convex action after webhook confirms payment

**Israeli Tax Compliance Notes (Story 9.3 scope):**
- From Jan 2026: allocation numbers mandatory for transactions ≥10,000 NIS
- From Jun 2026: threshold drops to ≥5,000 NIS
- Monthly subscription pricing likely below thresholds, but compliance infrastructure should be planned

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed existing webhook.test.ts: updated to capture multiple httpAction handlers (Clerk + Stripe) and mock internal.stripe
- Fixed existing deleteAccount.test.ts: added internal.subscriptions and internal.stripe to mocks, added runAction and subscription query to test contexts
- Fixed ESLint errors in stripe.ts: replaced `as any` casts with proper `Id<"users">` type

### Completion Notes List

- Implemented full Stripe subscription flow: schema, mutations, queries, checkout session, webhook handler
- All payment data stays with Stripe (PCI-DSS compliant) — no card data touches Marko's servers
- Stripe webhook handles 4 events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted
- UpgradePrompt now triggers real checkout with loading state and Hebrew error messages
- Success/cancel redirect handling via useSubscriptionReturn hook with Hebrew toast messages
- Account deletion cascades: cancels Stripe subscription, deletes Convex subscription records
- Stripe Dashboard setup documented in story Dev Notes (manual configuration required)
- 25 new tests added (14 stripe, 11 subscriptions), 8 existing tests updated (UpgradePrompt, webhook, deleteAccount)
- All 563 tests pass, 0 regressions, ESLint clean

### File List

**New files:**
- convex/subscriptions.ts — Subscription CRUD mutations/queries
- convex/stripe.ts — Stripe checkout session action, webhook fulfillment, cancel subscription
- convex/__tests__/subscriptions.test.ts — 11 unit tests for subscription functions
- convex/__tests__/stripe.test.ts — 15 unit tests for Stripe checkout and webhook
- lib/hooks/useSubscriptionReturn.ts — Hook for handling Stripe checkout return URL params

**Modified files:**
- convex/schema.ts — Added subscriptions table with 3 indexes
- convex/http.ts — Added /stripe-webhook POST route
- convex/users.ts — Added subscription cancellation and cleanup to deleteMyAccount
- components/auth/UpgradePrompt.tsx — Replaced placeholder toast with real Stripe checkout flow
- components/auth/UpgradePrompt.test.tsx — Updated tests for new checkout behavior
- convex/__tests__/webhook.test.ts — Fixed handler capture for multiple httpAction routes
- convex/__tests__/deleteAccount.test.ts — Added subscription/stripe mocks to test contexts
- app/editor/page.tsx — Added useSubscriptionReturn hook
- package.json — Added stripe dependency
- pnpm-lock.yaml — Updated lock file

## Change Log

- 2026-03-09: Implemented Story 9.1 — Payment provider integration and subscription flow with Stripe Checkout, webhook handling, subscription management, and real upgrade flow
- 2026-03-09: Code review fixes — H1: getSubscriptionByStripeId changed from internalMutation to internalQuery; H2: Stripe API version updated to 2026-02-25.clover; H3: Added idempotency check for checkout.session.completed webhook; H4: deleteMyAccount now cancels past_due subscriptions; M1: Fixed race condition toast message; M2: Fixed URL param preservation in useSubscriptionReturn; M3: Added user existence validation in checkout webhook
