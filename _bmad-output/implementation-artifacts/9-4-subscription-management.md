# Story 9.4: Subscription Management

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a paid user,
I want to view my subscription status and cancel if needed,
so that I have full control over my billing.

## Acceptance Criteria

1. Given a paid user navigates to `/subscription` or a subscription management page, when the page loads, then they see their current subscription details: plan name, renewal date, payment method summary, and next billing amount
2. Given a paid user views their subscription, when they look at billing history, then they see a list of all past and upcoming invoices with: amount, date, status, and links to receipts (from Story 9.3)
3. Given a paid user clicks "Cancel Subscription", when they confirm cancellation, then the subscription is marked for cancellation at the end of the current billing period in Stripe and Convex
4. Given a subscription is marked for cancellation, when the user views their subscription, then they see: "Your subscription will be canceled on [DATE]" and "Your access expires on [DATE]"
5. Given a billing period expires for a canceled subscription, when the Stripe webhook fires `customer.subscription.deleted`, then the user's tier reverts to "free" in Convex and they receive a Hebrew notification on next login
6. Given a paid user has an unpaid invoice, when they view billing history, then past_due invoices are highlighted and include a retry payment button

## Tasks / Subtasks

- [x] Task 1: Create subscription management page UI (AC: #1, #4, #6)
  - [x] Create `/app/subscription/page.tsx` ("use client" component)
  - [x] Display current plan: "Marko Pro" with renewal date (from `subscriptions` table `currentPeriodEnd`)
  - [x] Payment method summary: "Visa ending in 4242" (retrieve from Stripe via action)
  - [x] Next billing amount display (from Stripe Price object)
  - [x] Show cancellation status if `cancelAtPeriodEnd` is true: "Your subscription will be canceled on [DATE]"
  - [x] "Cancel Subscription" button with confirmation modal
  - [x] Hebrew UI text: "המנוי שלך", "תאריך חידוש", "שיטת תשלום", "בטל מנוי", etc.
- [x] Task 2: Create billing history component (AC: #2, #6)
  - [x] Fetch invoices from Stripe API via new Convex action
  - [x] Display: date, amount, status (paid/open/past_due), receipt link
  - [x] For paid invoices, link to corresponding receipt from `receipts` table (9-3)
  - [x] Highlight past_due invoices in red/orange
  - [x] Add "Retry Payment" button for past_due invoices (Stripe payment_intent update)
  - [x] Handle no invoices case (new subscription without invoices yet)
- [x] Task 3: Create `convex/subscriptionActions.ts` — getSubscriptionDetails action (AC: #1, #2)
  - [x] Fetch current user's subscription from Convex `subscriptions` table
  - [x] Call Stripe API to get current Subscription object (for cancellation status, current_period_end)
  - [x] Combine Convex + Stripe data into unified response
  - [x] Return: tier, subscription (status, currentPeriodEnd, cancelAtPeriodEnd, paymentMethodSummary, nextBillingAmount, currency)
  - [x] Handle no active subscription (user is on free tier) — return empty/free tier response
- [x] Task 4: Create `convex/subscriptionActions.ts` — listInvoices action (AC: #2)
  - [x] Fetch all invoices for current user's Stripe customer
  - [x] Filter: only invoices related to current/past subscriptions
  - [x] Return: date, amount_paid, status, invoice.id, invoice.payment_intent (for retry)
  - [x] Sort by date descending (Stripe default)
  - [x] Handle pagination if many invoices (limit 20)
- [x] Task 5: Create `convex/subscriptionActions.ts` — cancelSubscription action (AC: #3, #4)
  - [x] Verify user owns the subscription (userId check via requireAuth)
  - [x] Call Stripe API: `subscriptions.update(subId, { cancel_at_period_end: true })`
  - [x] Update Convex `subscriptions` table: `cancelAtPeriodEnd = true`
  - [x] Return: new cancellation date
  - [x] Log analytics event: "subscription.cancel_requested" with metadata
  - [x] Error handling: Stripe API errors → ConvexError with Hebrew message
- [x] Task 6: Create `convex/subscriptionActions.ts` — retryPayment action (AC: #6)
  - [x] Verify invoice belongs to current user (customer ownership check)
  - [x] Call Stripe: `invoices.pay(invoiceId)` to retry payment
  - [x] Return payment result (success/status)
  - [x] Log analytics: "subscription.payment_retry"
- [x] Task 7: Update existing `convex/stripe.ts` webhook handler (AC: #5)
  - [x] Verified `customer.subscription.deleted` webhook already handles tier revert
  - [x] Added console.log for subscription deletion events
  - [x] Tier revert to "free" + analytics logging already implemented in 9.1
  - [x] No major code changes needed — validated existing implementation
- [x] Task 8: Create subscription route protection (AC: #1)
  - [x] Added route protection to `/subscription` page via client-side useEffect
  - [x] Redirect free tier users to /editor
  - [x] Redirect anonymous users to /sign-in
- [x] Task 9: Update user profile/account pages to link to subscription management (AC: #1)
  - [x] Added "ניהול מנוי" (Manage Subscription) link in UserMenu for paid users
  - [x] Link navigates to `/subscription` via router.push
- [x] Task 10: Write tests (AC: all)
  - [x] `convex/__tests__/subscriptionDetails.test.ts` — 6 tests for getSubscriptionDetails action
  - [x] `convex/__tests__/listInvoices.test.ts` — 4 tests for listInvoices with receipt matching
  - [x] `convex/__tests__/cancelSubscription.test.ts` — 5 tests for cancelSubscription with ownership verification
  - [x] `app/subscription/__tests__/SubscriptionPage.test.tsx` — 7 tests for page rendering, redirects, Hebrew text
  - [x] Stripe webhook `customer.subscription.deleted` → tier revert already tested in 9.1 tests (validated)

## Dev Notes

### Critical Business Logic: Subscription Lifecycle

**Subscription States:**
1. **Active** — Current user is paid, has access to Opus
   - `subscriptions.status = "active"`, `users.tier = "paid"`
   - `cancelAtPeriodEnd = false`
   - Next renewal: `currentPeriodEnd` + 1 month
2. **Cancellation Requested** — User clicked cancel, but access continues until period end
   - `subscriptions.status = "active"`, `cancelAtPeriodEnd = true`
   - Access expires: `currentPeriodEnd` (unchanged)
   - Stripe: `subscription.cancel_at` is set to period end
3. **Canceled (Expired)** — Billing period ended, subscription deleted
   - `subscriptions.status = "canceled"` OR record deleted from DB
   - `users.tier = "free"` (reverted by webhook)
   - Stripe: `subscription.status = "canceled"`

**Timeline Example:**
```
Day 1: User pays $99 → subscription.active, currentPeriodEnd = Day 31
Day 15: User clicks cancel → cancelAtPeriodEnd = true, Stripe cancel_at = Day 31
Day 31: Stripe webhook fires customer.subscription.deleted → tier = free
Day 32+: User is free tier, can reupgrade
```

### Stripe Integration Details

**Subscription Object Structure (from Stripe API):**
```typescript
{
  id: "sub_...",
  status: "active" | "past_due" | "canceled" | "incomplete",
  current_period_start: 1708560000,
  current_period_end: 1711238400,
  cancel_at: null,  // Set when user requests cancellation
  cancel_at_period_end: true,  // User cancelled, but not yet expired
  customer: "cus_...",
  items: {
    data: [
      {
        id: "si_...",
        price: {
          id: "price_...",
          currency: "ils",
          unit_amount: 9900,  // in cents
          recurring: { interval: "month" }
        }
      }
    ]
  }
}
```

**Invoice Object Structure:**
```typescript
{
  id: "in_...",
  number: "0001",
  status: "paid" | "open" | "draft" | "uncollectible" | "void",
  amount_paid: 9900,  // in cents
  amount_due: 0,
  currency: "ils",
  created: 1708560000,
  due_date: 1708646400,
  payment_intent: "pi_...",
  customer: "cus_...",
  custom_fields: [
    {
      name: "Receipt",
      value: "sumit-doc-id"  // From Story 9.3 — can store in custom_fields
    }
  ]
}
```

### Data Flow: Subscription Management Page

```
User clicks "Manage Subscription" (in user menu)
    │
    ├── /subscription page loads ("use client")
    │   ├── Check auth: Clerk.useAuth()
    │   ├── Check tier: useQuery(internal.users.getCurrentUser)
    │   │   └── If tier !== "paid": redirect to /upgrade with message
    │   │
    │   └── Load subscription details:
    │       ├── Call action: getSubscriptionDetails()
    │       │   ├── Query Convex subscriptions table
    │       │   ├── Call Stripe.subscriptions.retrieve()
    │       │   └── Merge data: { currentPlan, renewalDate, cancelAtPeriodEnd, nextBillingAmount }
    │       │
    │       └── Load invoices:
    │           ├── Call action: listInvoices()
    │           │   ├── Call Stripe.invoices.list({ customer: cus_... })
    │           │   └── For each invoice: find matching receipt from receipts table (9-3)
    │           │
    │           └── Render invoice list with receipt links
    │
    └── User clicks "Cancel Subscription"
        ├── Show modal: "Are you sure? Access expires on [DATE]"
        ├── User confirms
        ├── Call action: cancelSubscription()
        │   ├── Stripe.subscriptions.update(subId, { cancel_at_period_end: true })
        │   ├── Convex: update subscriptions.cancelAtPeriodEnd = true
        │   └── Log analytics: "subscription.cancel_requested"
        │
        └── UI updates to show: "Subscription canceling on [DATE]"
```

### Architecture Patterns & Constraints (from 9.1 & 9.3)

- **Convex is the ONLY backend** — No Next.js API routes
- **"use node" required** for Stripe SDK access in `convex/stripe.ts` or new action files
- **Actions can't query DB directly** — Use `ctx.runQuery()` and `ctx.runMutation()`
- **Stripe API version: 2026-02-25.clover** (established in 9.1)
- **Error format:** All ConvexError: `{ code: "UPPER_SNAKE", message: "Hebrew", messageEn: "English" }`
- **All user-facing text in Hebrew** — Button labels, dates, messages, ARIA labels
- **Logical CSS properties only** — `ms-`, `me-`, `ps-`, `pe-` (not `ml-`, `mr-`)
- **No optimistic updates for payment state** — Always wait for server confirmation

### Existing Code to Reuse / Extend

| File | What exists | How to extend |
|------|-------------|---------------|
| `convex/stripe.ts` | `fulfillStripeWebhook`, `getStripeClient()`, `createCheckoutSession` | Add new actions for subscription retrieval, invoicing, cancellation |
| `convex/schema.ts` | `subscriptions` table (from 9.1) | No schema changes needed — existing fields sufficient |
| `convex/subscriptions.ts` | `getMySubscription`, `updateSubscriptionStatus` | Add subscription listing/filtering queries if needed |
| `convex/receipts.ts` | Receipt CRUD (from 9.3) | Reuse `getReceiptsByUserId` for billing history |
| `app/` route structure | Existing auth'd routes (e.g., `/editor`) | Follow same pattern for `/subscription` page |
| `components/auth/` | Existing auth components | Reference error handling and Hebrew text patterns |
| `lib/hooks/useAiAction.ts` | Error handling for ConvexError | Reuse for subscription page actions |

### Stripe Dashboard: Webhook Verification

From 9.1, the `/stripe-webhook` route is already configured and webhook signing secret is set. No additional Stripe setup needed for Story 9.4 — we only READ subscription/invoice data, not CREATE new products/prices.

**Webhook Already Subscribed to (from 9.1):**
- `checkout.session.completed` — handled
- `invoice.paid` — handled
- `invoice.payment_failed` — handled (past_due flag)
- `customer.subscription.deleted` — handled (tier revert)

No new webhooks needed. Just add logging/tracking if desired.

### Integration with Story 9.3 (Receipts)

When displaying billing history (Task 2):
1. Fetch invoices from Stripe via `listInvoices()`
2. For each invoice, query `receipts` table: `getReceiptByStripeInvoiceId(invoiceId)`
3. If receipt exists, display link: "View Receipt" → `sumit_pdf_url`
4. If no receipt (e.g., old invoice before 9.3 implemented), show "No receipt" gracefully

**Stripe Custom Field Hint:**
When Story 9.3 creates a receipt, optionally store Sumit document ID in Stripe invoice custom_fields:
```typescript
// In convex/sumit.ts when creating receipt for invoice.paid
stripe.invoices.update(invoiceId, {
  custom_fields: [{
    name: "סכום קבלה",  // "Receipt Amount" in Hebrew
    value: sumitDocumentNumber
  }]
});
```
This allows future reconciliation, but is optional — receipts table is the primary store.

### Free Tier Redirect Logic

When user navigates to `/subscription` but is NOT paid:
```typescript
const user = useQuery(api.users.getCurrentUser);
if (!user || user.tier !== "paid") {
  redirect("/upgrade?reason=subscription_management");
}
```

Show message: "כדי לנהל את המנוי שלך, אתה צריך להיות משתמש משלם" (To manage your subscription, you need to be a paid user)

### Previous Story Intelligence (from 9.1, 9.2, 9.3)

**From 9.1 (Payment Integration):**
- Stripe SDK pattern: `"use node"` at top of Convex action files
- Webhook signature verification already implemented
- Error handling with ConvexError + Hebrew/English messages
- `subscriptions` table structure: userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd

**From 9.2 (Opus Access):**
- Tier checks use `requireTier("paid")` helper
- Daily Opus allocation logic in AI actions — no impact on subscription management

**From 9.3 (Tax Compliance):**
- `receipts` table stores: userId, stripeSessionId, stripeInvoiceId, sumitDocumentId, sumitDocumentUrl, sumitPdfUrl
- Receipt generation happens on `checkout.session.completed` and `invoice.paid` webhooks
- **Reuse pattern:** Query receipts by stripeInvoiceId for billing history

### Critical Anti-Patterns to AVOID

1. **DO NOT fetch Stripe data on client** — Always use Convex actions
2. **DO NOT trust client-provided subscription ID** — Always verify ownership in action via Clerk context
3. **DO NOT show Stripe API errors directly to users** — Wrap in Hebrew ConvexError messages
4. **DO NOT hardcode payment amounts** — Always fetch from Stripe Price/Subscription object
5. **DO NOT update user tier directly from page** — Wait for webhook confirmation only
6. **DO NOT skip date formatting for Hebrew users** — Use Hebrew date formatting (e.g., "5 במרץ 2026" not "March 5, 2026")
7. **DO NOT create new Stripe product/price** — Use existing price from 9.1 (STRIPE_PRICE_ID env var)
8. **DO NOT use `as any`** — Use proper TypeScript types from Stripe SDK
9. **DO NOT use physical CSS properties** (ml-, mr-) — use logical (ms-, me-, ps-, pe-)
10. **Cancellation is soft** — User can reupgrade anytime after expiry

### Testing Standards

- **Framework:** Vitest (co-located test files)
- **Stripe API mocking:** Mock `getStripeClient()` or direct Stripe SDK calls
- **Convex action mocking:** `vi.mock("convex/stripe.ts")` to mock getStripeClient()
- **User ownership verification:** Test that non-owner cannot cancel another user's subscription
- **Webhook integration:** Validate that `customer.subscription.deleted` → tier = "free" (may already be tested in 9.1)
- **Component tests:** Test redirect logic, loading states, error boundaries
- **Date formatting:** Test Hebrew date display (use `toLocaleDateString("he-IL")`)
- **Do NOT test Stripe API internals** — Only test that code calls Stripe correctly and handles responses

### Git Commit Pattern

Commit message: `Implement Story 9.4: Subscription management with billing history`

### Project Structure Notes

New files to create:
```
convex/
  actions/getSubscriptionDetails.ts   -- Fetch subscription + invoices from Stripe
  actions/listInvoices.ts            -- List invoices for current user
  actions/cancelSubscription.ts      -- Cancel subscription with confirmation
  actions/retryPayment.ts            -- Retry past_due invoice payment
  __tests__/subscriptionDetails.test.ts
  __tests__/cancelSubscription.test.ts
  __tests__/listInvoices.test.ts

app/subscription/
  page.tsx                           -- Subscription management page ("use client")
  SubscriptionDetails.tsx            -- Component: display current subscription
  BillingHistory.tsx                 -- Component: list invoices + receipts
  CancelModal.tsx                    -- Component: confirmation modal
  __tests__/SubscriptionPage.test.tsx
```

Files to modify:
```
convex/stripe.ts                   -- Optionally add logging to customer.subscription.deleted webhook
app/layout.tsx                     -- Ensure route protection for /subscription (auth check)
components/auth/UserMenu.tsx       -- Add "Manage Subscription" link for paid users
```

### Environment Variables (from 9.1, no new vars needed)

Existing from Story 9.1:
```bash
STRIPE_SECRET_KEY
STRIPE_WEBHOOKS_SECRET
STRIPE_PRICE_ID
NEXT_PUBLIC_APP_URL
```

No new environment variables required.

### References

- [Source: _bmad-output/implementation-artifacts/9-1-payment-provider-integration-and-subscription-flow.md — Stripe webhook patterns, subscription schema]
- [Source: _bmad-output/implementation-artifacts/9-2-opus-access-and-force-opus-toggle.md — Tier checking patterns]
- [Source: _bmad-output/implementation-artifacts/9-3-israeli-tax-compliance-and-sumit-receipts.md — Receipt table structure, analytics logging pattern]
- [Source: convex/stripe.ts — getStripeClient(), fulfillStripeWebhook implementation]
- [Source: convex/subscriptions.ts — subscription table queries and mutations]
- [Source: convex/receipts.ts — receipt lookup queries]
- [Source: Stripe API docs — https://stripe.com/docs/api/subscriptions and invoices]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- All 638 tests pass (63 test files) including 22 new tests for Story 9.4
- Fixed 4 existing test files (UserMenu, AuthGate, Header, auth-persistence) that needed `next/navigation` mock after adding `useRouter` to UserMenu

### Completion Notes List

- Created `convex/subscriptionActions.ts` with all 4 Stripe actions (getSubscriptionDetails, listInvoices, cancelSubscription, retryPayment) using `"use node"` runtime
- Added `getReceiptsByUserIdInternal` internal query to `convex/receipts.ts` for invoice-receipt matching
- Created subscription management page at `/app/subscription/page.tsx` with Hebrew UI, loading states, and client-side route protection
- Created `BillingHistory.tsx` component with invoice display, receipt links (Sumit integration from 9.3), past_due highlighting, and retry payment button
- Created `CancelModal.tsx` with AlertDialog confirmation pattern (consistent with DeleteAccountDialog)
- Added "ניהול מנוי" menu item to UserMenu for paid users with CreditCard icon
- Added `console.log` to `customer.subscription.deleted` webhook handler for operational logging
- Validated existing webhook handler correctly reverts tier to "free" and logs analytics
- All actions verify user ownership via `requireAuth` + `getUserByClerkId` pattern
- All errors use ConvexError with Hebrew + English messages
- Dates displayed using `toLocaleDateString("he-IL")` for Hebrew formatting
- No schema changes needed — existing `subscriptions` and `receipts` tables sufficient
- No new environment variables required

### Change Log

- 2026-03-10: Implemented Story 9.4 — Subscription management page, billing history, cancel flow, retry payment, and comprehensive tests
- 2026-03-11: Code review fixes — Wrapped Stripe API errors in ConvexError, extracted shared getStripeClient, added retryPayment tests (8 tests), added subscription expired notification hook, fixed currency formatting (Intl.NumberFormat), fixed RTL arrow direction, added uncollectible invoice status handling, added BillingHistory refresh after cancel

### File List

New files:
- `convex/subscriptionActions.ts` — All subscription management Convex actions (getSubscriptionDetails, listInvoices, cancelSubscription, retryPayment)
- `app/subscription/page.tsx` — Subscription management page with route protection
- `app/subscription/BillingHistory.tsx` — Billing history component with receipt links and retry
- `app/subscription/CancelModal.tsx` — Cancel subscription confirmation dialog
- `convex/__tests__/subscriptionDetails.test.ts` — Tests for getSubscriptionDetails action
- `convex/__tests__/listInvoices.test.ts` — Tests for listInvoices action
- `convex/__tests__/cancelSubscription.test.ts` — Tests for cancelSubscription action
- `convex/__tests__/retryPayment.test.ts` — Tests for retryPayment action (8 tests)
- `app/subscription/__tests__/SubscriptionPage.test.tsx` — Component tests for subscription page
- `lib/hooks/useSubscriptionExpiredNotification.ts` — Hebrew notification on next login after subscription expires

Modified files:
- `convex/receipts.ts` — Added `getReceiptsByUserIdInternal` internal query
- `convex/stripe.ts` — Exported `getStripeClient`, added console.log to `customer.subscription.deleted` handler
- `components/auth/UserMenu.tsx` — Added "ניהול מנוי" menu item for paid users with useRouter
- `components/auth/UserMenu.test.tsx` — Added `next/navigation` mock
- `components/auth/AuthGate.test.tsx` — Added `next/navigation` mock
- `components/auth/auth-persistence.test.tsx` — Added `next/navigation` mock
- `components/layout/Header.test.tsx` — Added `next/navigation` mock
- `app/editor/page.tsx` — Added `useSubscriptionExpiredNotification` hook
