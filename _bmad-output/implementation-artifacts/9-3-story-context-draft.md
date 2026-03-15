# Story 9.3 Creation Context — Israeli Tax Compliance & Sumit Receipts

> This file contains ALL context needed to create and implement Story 9.3.
> It was compiled during create-story workflow execution before context compression.

---

## 1. STORY IDENTITY

- **Story Key:** 9-3-israeli-tax-compliance-and-sumit-receipts
- **Story ID:** 9.3
- **Epic:** 9 — Payments & Subscription (Phase 2)
- **Output File:** `_bmad-output/implementation-artifacts/9-3-israeli-tax-compliance-and-sumit-receipts.md`
- **Sprint Status:** Currently `backlog` → will become `ready-for-dev`
- **Date:** 2026-03-09

---

## 2. STORY FROM EPICS FILE

```
### Story 9.3: Israeli Tax Compliance & Sumit Receipts

As a paying user,
I want to receive a valid Israeli tax invoice/receipt for each transaction,
So that I have proper documentation for my records and tax compliance.

**Acceptance Criteria:**

**Given** a payment transaction completes
**When** the payment webhook fires
**Then** a Convex action calls the Sumit API to generate a valid Israeli tax invoice/receipt
**And** the receipt includes: amount, VAT breakdown, date, and transaction reference
**And** the receipt is associated with the user's subscription record in Convex
**And** the user can access their receipt (via email or account page)
```

### CRITICAL CORRECTION FROM USER:
- Ben is **Osek Patur** (עוסק פטור — VAT-exempt sole proprietor)
- Business number: **305065575**
- **NO VAT applies** — the amount charged by Stripe IS the final amount
- The epics mention "17% VAT breakdown" but this is WRONG for Osek Patur — no VAT line needed
- Document type must be **3 (חשבון/קבלה — Invoice/Receipt)** — NOT type 1 or 5 (tax invoice)

---

## 3. SUMIT API INTEGRATION SPEC

### Base URL
```
https://api.sumit.co.il/billing/v1/
```

API docs: https://app.sumit.co.il/developers/api/

### Authentication
Sumit uses **CompanyID + APIKey** passed in the **request body** (NOT headers):
```json
{
  "CompanyID": "<from Sumit settings>",
  "APIKey": "<from Sumit settings>"
}
```

### Create Document Endpoint
```
POST https://api.sumit.co.il/billing/v1/documents/create
Content-Type: application/json
```

### Document Type for Osek Patur
| DocumentType | Name (Hebrew) | Name (English)  | Use |
|:---:|---|---|---|
| **3** | חשבון/קבלה | Invoice/Receipt | **PRIMARY — use this** |
| 2 | קבלה | Receipt only | Alternative |

**DO NOT USE:** Type 1 (חשבונית מס) or Type 5 (חשבונית מס/קבלה) — these require VAT registration (Osek Murshe).

### Required Request Body
```json
{
  "CompanyID": "env-var",
  "APIKey": "env-var",
  "Document": {
    "Type": 3,
    "Description": "Monthly Subscription - Marko Pro",
    "Customer": {
      "Name": "Customer Full Name",
      "EmailAddress": "customer@email.com"
    },
    "Items": [
      {
        "Description": "Subscription - Marko Pro - [Month/Year]",
        "Price": 99.00,
        "Quantity": 1,
        "Currency": "ILS"
      }
    ],
    "Payment": [
      {
        "Type": 4,
        "Amount": 99.00,
        "Currency": "ILS"
      }
    ],
    "SendDocumentByEmail": true,
    "Language": "he"
  }
}
```

### Field Reference
| Field | Type | Required | Description |
|---|---|:---:|---|
| `Document.Type` | number | YES | 3 = Invoice/Receipt (Osek Patur) |
| `Document.Description` | string | no | General description shown on document |
| `Document.Customer.Name` | string | YES | Customer full name |
| `Document.Customer.EmailAddress` | string | YES | Customer email |
| `Document.Items[]` | array | YES | Line items (at least one) |
| `Document.Items[].Description` | string | YES | Item/service description |
| `Document.Items[].Price` | number | YES | Unit price (ILS) |
| `Document.Items[].Quantity` | number | YES | Quantity |
| `Document.Items[].Currency` | string | no | ILS, USD, EUR (default: account currency) |
| `Document.Payment[]` | array | YES | Payment method details |
| `Document.Payment[].Type` | number | YES | 4 = Credit Card, 3 = Bank Transfer, 10 = Other |
| `Document.Payment[].Amount` | number | YES | Payment amount |
| `Document.SendDocumentByEmail` | boolean | no | true = Sumit emails the document to customer |
| `Document.Language` | string | no | "he" (Hebrew) or "en" (English) |

### Success Response
```json
{
  "DocumentNumber": "0042",
  "DocumentID": "abc123-def456",
  "DocumentURL": "https://app.sumit.co.il/...",
  "PdfURL": "https://...",
  "Status": 0
}
```

### Error Response
```json
{
  "Status": 1,
  "ErrorMessage": "Description of what went wrong",
  "UserErrorMessage": "..."
}
```

### Email Delivery
Sumit handles email delivery automatically when `SendDocumentByEmail: true`. No separate email logic needed.

### Testing
- No dedicated sandbox. Use free Sumit account (10 docs/month free)
- Can create documents with `Draft: true` for testing
- Use own email as customer email for testing

---

## 4. INTEGRATION FLOW

```
Stripe webhook (checkout.session.completed / invoice.paid)
    │
    ▼
Existing fulfillStripeWebhook in convex/stripe.ts
    │
    ├── Extract: customer email, amount (cents → ILS /100), currency, session metadata
    │
    ▼
NEW: Call Sumit API via Convex internalAction (needs "use node" for fetch)
    │
    ├── DocumentType: 3 (חשבון/קבלה)
    ├── Customer: { Name, Email from Stripe }
    ├── Items: [{ Description, Price, Quantity }]
    ├── Payment: [{ Type: 4 (credit card), Amount }]
    ├── SendDocumentByEmail: true
    │
    ▼
Store Sumit DocumentNumber + DocumentID in receipts table
Log analytics event
```

---

## 5. EXISTING CODEBASE CONTEXT

### Story 9.1 (DONE — code review fixes applied)
- `convex/stripe.ts` — Stripe checkout session + webhook fulfillment + cancel subscription
- `convex/subscriptions.ts` — Subscription CRUD mutations/queries
- `convex/schema.ts` — Has `users`, `aiUsage`, `subscriptions`, `analyticsEvents` tables
- `convex/http.ts` — Has `/clerk-users-webhook` and `/stripe-webhook` routes
- `convex/analytics.ts` — Event logging with `logEvent` internalMutation

### Key Code Review Fixes in 9.1 (already applied):
- `getSubscriptionByStripeId` changed from `internalMutation` to `internalQuery`
- Stripe API version updated to `2026-02-25.clover`
- Added idempotency check for `checkout.session.completed` webhook
- Added user existence validation in checkout webhook
- Webhook now uses `clerkId` (not `convexUserId`) from metadata to look up user

### Story 9.2 (ready-for-dev, NOT yet implemented)
- Opus access and force-Opus toggle — independent of 9.3

### Current Stripe Webhook Handler (convex/stripe.ts)
The `fulfillStripeWebhook` internalAction handles:
- `checkout.session.completed` — creates subscription, updates tier, logs analytics
- `invoice.paid` — updates subscription status to active, refreshes period end
- `invoice.payment_failed` — updates subscription to past_due
- `customer.subscription.deleted` — cancels subscription, reverts tier to free

**Story 9.3 must hook into `checkout.session.completed` and `invoice.paid` events** to trigger Sumit receipt generation.

### Existing Convex Schema (convex/schema.ts)
```typescript
users: defineTable({ clerkId, email, name, tier, createdAt, flagged, flagReason, flaggedAt })
  .index("by_clerkId")
aiUsage: defineTable({ userId, model, inputTokens, outputTokens, cost, actionType, createdAt })
  .index("by_userId").index("by_userId_createdAt").index("by_createdAt")
subscriptions: defineTable({ userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd, createdAt })
  .index("by_userId").index("by_stripeCustomerId").index("by_stripeSubscriptionId")
analyticsEvents: defineTable({ userId, event, metadata, createdAt })
  .index("by_userId").index("by_event").index("by_createdAt")
```

**New table needed:** `receipts` — to store Sumit document references

### Architecture Constraints
- **Convex is the ONLY backend** — No Next.js API routes
- **Convex import boundary** — Files in `convex/` can ONLY import from `convex/` or `node_modules`
- **"use node" required** for external API calls (fetch to Sumit)
- **Actions can't query DB directly** — Use `ctx.runQuery()` and `ctx.runMutation()` from actions
- **Error format** — All ConvexError: `{ code: "UPPER_SNAKE", message: "Hebrew", messageEn: "English" }`
- **All user-facing text in Hebrew**
- **Logical CSS properties only** — ms-, me-, ps-, pe- (not ml-, mr-)

### Convex Function Naming Conventions
- Queries: `get` or `list` prefix
- Mutations: verb prefix — `createReceipt`, `updateReceipt`
- Actions: verb prefix — `generateSumitReceipt`
- HTTP actions: `handle` prefix

### Testing Standards
- **Framework:** Vitest (co-located test files)
- **Convex tests:** `convex/__tests__/` directory
- **Mock pattern:** `vi.mock()` — mock external dependencies (fetch for Sumit API)
- **Error code testing:** Verify all ConvexError codes are thrown correctly
- **Do NOT test Sumit internals** — only test that code calls Sumit correctly and handles responses

### Git Commit Pattern
- Commits follow: `Implement Story X.Y: <description>`
- All tests co-located and written alongside implementation

---

## 6. ENVIRONMENT VARIABLES NEEDED

```bash
SUMIT_COMPANY_ID=<from Sumit settings>
SUMIT_API_KEY=<from Sumit settings>
```
Set via: `npx convex env set SUMIT_COMPANY_ID ...` / Convex Dashboard

---

## 7. CRITICAL ANTI-PATTERNS TO AVOID

1. **DO NOT use DocumentType 1 or 5** — Ben is Osek Patur, NOT Osek Murshe
2. **DO NOT calculate or add VAT** — Osek Patur is VAT-exempt
3. **DO NOT create Next.js API routes** — use Convex actions exclusively
4. **DO NOT send emails manually** — Sumit handles email delivery with SendDocumentByEmail: true
5. **DO NOT store Sumit API credentials in code** — use Convex environment variables
6. **DO NOT skip idempotency** — use Stripe session/invoice ID to prevent duplicate receipts
7. **DO NOT block the webhook response** — if Sumit call fails, log error but don't fail the webhook
8. **DO NOT use `as any`** — use proper Convex Id<"users"> types
9. **DO NOT use physical CSS properties** (ml-, mr-) — use logical (ms-, me-, ps-, pe-)
10. **Stripe amounts are in cents** — divide by 100 before sending to Sumit

---

## 8. PROPOSED TASKS OUTLINE

### Task 1: Add `receipts` table to Convex schema
- Fields: userId, subscriptionId, stripeSessionId (or stripeInvoiceId), sumitDocumentId, sumitDocumentNumber, sumitDocumentUrl, sumitPdfUrl, amount, currency, status, createdAt
- Indexes: by_userId, by_stripeSessionId (for idempotency), by_subscriptionId

### Task 2: Create `convex/sumit.ts` with Sumit API integration
- `"use node"` directive for fetch access
- `generateReceipt` internalAction — calls Sumit API to create document
- Handle success response (store document details)
- Handle error response (log, don't crash webhook)
- Idempotency: check if receipt already exists for this Stripe session/invoice

### Task 3: Create `convex/receipts.ts` with receipt CRUD
- `createReceipt` internalMutation — stores receipt record in DB
- `getReceiptsByUserId` query — returns user's receipts (for future account page)
- `getReceiptByStripeSessionId` internalQuery — idempotency check
- `deleteByUserId` internalMutation — cascade delete for account deletion

### Task 4: Hook receipt generation into Stripe webhook flow
- In `convex/stripe.ts` `fulfillStripeWebhook`:
  - After `checkout.session.completed` processing → call Sumit to generate receipt
  - After `invoice.paid` processing → call Sumit to generate receipt (renewals)
- Need Stripe customer email and name from the session/invoice
- Use `ctx.runAction()` to call the Sumit action from within the webhook action
- **Important:** Sumit call should NOT block/fail the webhook — wrap in try/catch, log errors

### Task 5: Update `convex/users.ts` deleteMyAccount to cascade receipt deletion
- Add receipt deletion to the account deletion flow (like subscriptions and analytics)

### Task 6: Write tests
- `convex/__tests__/sumit.test.ts` — mock fetch, test API call construction, success/error handling
- `convex/__tests__/receipts.test.ts` — test receipt CRUD operations
- Update `convex/__tests__/stripe.test.ts` — test that receipt generation is triggered from webhook
- Update `convex/__tests__/deleteAccount.test.ts` — test receipt cascade deletion

### Task 7 (optional): Add receipt access to user-facing UI
- This may be deferred to Story 9.4 (Subscription Management) which includes billing history
- If included: add receipt list to subscription management page with links to Sumit PDF URLs

---

## 9. DATA FLOW DIAGRAM

```
checkout.session.completed webhook
    │
    ├── (existing) Create subscription, update tier, log analytics
    │
    ├── (NEW) Retrieve Stripe customer info (email, name)
    ├── (NEW) Check idempotency: receipt already exists for this session?
    ├── (NEW) Call generateReceipt internalAction:
    │   ├── POST to Sumit API
    │   ├── DocumentType: 3, Customer info, Amount (/100), Payment type: 4
    │   └── Return: DocumentNumber, DocumentID, PdfURL, DocumentURL
    ├── (NEW) Store receipt record in receipts table
    └── (NEW) Log analytics: "receipt.generated"

invoice.paid webhook (renewals)
    │
    ├── (existing) Update subscription status
    │
    ├── (NEW) Retrieve Stripe invoice details (customer email, amount)
    ├── (NEW) Check idempotency: receipt already exists for this invoice?
    ├── (NEW) Call generateReceipt internalAction
    ├── (NEW) Store receipt record
    └── (NEW) Log analytics: "receipt.generated"
```

---

## 10. PREVIOUS STORY INTELLIGENCE

### From Story 9.1 (done):
- Stripe webhook pattern is established and working
- `getStripeClient()` helper exists in `convex/stripe.ts`
- Error handling uses ConvexError with Hebrew/English messages
- Analytics logging pattern: `internal.analytics.logEvent` with userId + event + metadata
- Account deletion cascade pattern: each module has `deleteByUserId` internalMutation
- Idempotency was added for `checkout.session.completed` — same pattern needed for receipts
- Webhook uses `clerkId` from metadata to look up user (not convexUserId)

### From Story 9.1 code review fixes:
- Always use `internalQuery` for read-only operations (not `internalMutation`)
- Always verify user existence before processing
- Use proper TypeScript types (no `as any`)

---

## 11. WORKFLOW STATUS

- [x] Step 1: Determine target story (9-3-israeli-tax-compliance-and-sumit-receipts)
- [x] Step 2: Load and analyze core artifacts (epics, architecture, previous stories, git history)
- [x] Step 3: Architecture analysis (Convex patterns, Sumit integration point identified)
- [x] Step 4: Technical research (Sumit API fully documented by user via Kuti agent)
- [ ] Step 5: Create comprehensive story file (template-output sections)
- [ ] Step 6: Update sprint status and finalize

### To resume:
1. Read this context file
2. Read the story template at `_bmad/bmm/workflows/4-implementation/create-story/template.md`
3. Generate the full story file at `_bmad-output/implementation-artifacts/9-3-israeli-tax-compliance-and-sumit-receipts.md`
4. Update sprint-status.yaml: change `9-3-israeli-tax-compliance-and-sumit-receipts` from `backlog` to `ready-for-dev`
5. Epic 9 is already `in-progress` — no change needed
