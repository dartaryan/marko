---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-06'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-context.md'
  - 'docs/index.md'
  - 'docs/project-overview.md'
  - 'docs/architecture.md'
  - 'docs/component-inventory.md'
  - 'docs/source-tree-analysis.md'
  - 'docs/development-guide.md'
  - 'docs/hebrew-markdown-export-improvements.md'
workflowType: 'architecture'
project_name: 'hebrew-markdown-export'
user_name: 'BenAkiva'
date: '2026-03-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (52 FRs in 9 categories):**

| Category | FRs | Architectural Impact |
|---|---|---|
| Document Editing & Rendering | FR1-10 | Client-side rendering pipeline, BiDi auto-detection engine, presentation mode |
| Export & Output | FR11-17 | PDF generation (html2pdf.js), HTML/MD export, clipboard APIs, progress indicators |
| Color Theming & Customization | FR18-23 | 17-property color model, persistence, image extraction, dark/light modes |
| AI Document Actions | FR24-31 | Backend AI proxy, model routing, tier enforcement, rate limiting, usage tracking |
| User Accounts & Authentication | FR32-36 | Auth service, tier management, v1 settings migration |
| Payments & Subscription (Phase 2) | FR37-41 | Payment provider integration, Sumit receipts, Israeli tax compliance |
| Analytics & Operator Tools | FR42-46 | Event pipeline, AI cost tracking, abuse detection |
| SEO & Discovery | FR47-49 | SSR landing page, structured data, sitemap |
| Privacy & Compliance | FR50-52 | AI disclosure UI, no server-side document storage, account deletion |

**Non-Functional Requirements:**

| NFR Domain | Key Constraints | Architectural Driver |
|---|---|---|
| Performance | Editor load <2s, paste-to-render <100ms, AI <10s Sonnet / <20s Opus, PDF <5s | Client-side rendering, async AI proxy, streaming consideration |
| Security | HTTPS, server-side auth tokens, AI keys never on client, CSRF, rate limiting, input sanitization | Backend proxy mandatory, no client-side API keys |
| Scalability | 1,000 concurrent Phase 1, 5x burst on AI proxy, 10K events/min analytics | Horizontal scaling design, queue-based AI proxy, async analytics |
| Accessibility | WCAG AA, Hebrew ARIA labels, keyboard nav, 4.5:1 contrast, RTL-aware assistive tech | Semantic HTML, ARIA throughout, focus management system |
| Integration | Anthropic API, payment provider, Sumit, analytics service, future Mike deep links | API abstraction layer, webhook/callback patterns |
| Reliability | Offline editor, auto-save, graceful AI degradation, exports work offline | Service worker, localStorage fallbacks, network-aware UI |

**Scale & Complexity:**

- Primary domain: Full-stack web application (SPA + SSR + API backend)
- Complexity level: Medium-High
- Estimated architectural components: ~12-15 major components (editor, preview, AI panel, auth, AI proxy, payment service, analytics pipeline, export engine, color system, landing page, admin tools, PWA shell, BiDi engine)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|---|---|---|
| Brownfield migration from single-file SPA | Existing v1.3.0 codebase | Must port rendering pipeline (Marked.js, Mermaid, Highlight.js); cannot start clean |
| Solo developer + AI-assisted | Resource constraint | Architecture must be simple enough for one person to maintain; avoid over-engineering |
| v1 backward compatibility | Trust-first principle | localStorage migration, feature parity, no login for existing features |
| Hebrew RTL-first | Domain requirement | Default direction is RTL; every component must respect this |
| No document storage on server | Privacy requirement (FR51) | Documents live in browser only; AI calls send content ephemerally |
| Israeli tax compliance (Phase 2) | Regulatory | Payment architecture must support VAT, Sumit receipt generation |
| CDN dependencies in v1 | Existing pattern | Migration decision: bundle via npm or keep CDN loading |
| GitHub Pages current hosting | Existing infrastructure | Need to migrate to hosting that supports SSR + backend |

### Cross-Cutting Concerns Identified

1. **RTL/BiDi Pervasion** — Text direction affects: editor input, preview rendering, toolbar layout, export output (PDF/HTML/Word), accessibility announcements, presentation mode. The per-sentence auto-detection (FR7) is a novel algorithm that must be integrated into the rendering pipeline.

2. **Authentication State Propagation** — User tier (anonymous/free/paid) gates: AI access, model selection, rate limits, upgrade prompts, analytics tracking. Auth state must be accessible to frontend components and enforced on the backend.

3. **Color Theme Synchronization** — The 17-property color system must stay synchronized across 5 output targets: live preview, PDF export, HTML export, Word copy, and Mermaid diagrams. Any architecture must preserve this sync.

4. **Offline/Online Boundary** — Clear separation needed between features that work offline (editing, rendering, exports, theming) and features requiring network (AI, auth, analytics, payments). The PWA service worker must manage this boundary.

5. **Cost Observability** — Every AI API call must be tracked with: model used, token count, calculated cost, user ID, action type. This data feeds into billing logic, abuse detection, and operator dashboards.

6. **Phased Delivery Architecture** — The architecture must support incremental delivery: Phase 1 (no payments) -> Phase 2 (add payments) -> Phase 3 (advanced features) -> Phase 4 (ecosystem). Each phase adds capabilities without architectural rework.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SPA + SSR + reactive backend) based on project requirements analysis. The application requires client-side rendering for the editor experience, server-side rendering for SEO landing pages, and a backend for authentication, AI proxy, payments, and analytics.

### Technical Preferences Established

| Preference | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety, better AI agent consistency, Convex is TypeScript-native |
| Framework | Next.js 16.x | SSR/SSG for landing page + CSR for editor, Vercel ecosystem, largest community |
| Backend | Convex | Reactive database, serverless functions, real-time sync, TypeScript-native |
| Authentication | Clerk | Production-ready, pre-built UI components, free up to 10K MAUs, official Convex integration |
| UI Components | shadcn/ui with RTL | First-class Hebrew/RTL support (Jan 2026), Radix primitives, Tailwind-based |
| Styling | Tailwind CSS | Default with Next.js and shadcn/ui, logical properties for RTL |
| Deployment | Vercel | Natural Next.js host, edge functions, preview deployments |

### Starter Options Considered

| Option | Description | Verdict |
|---|---|---|
| A: Clean Composition | create-next-app + convex init + shadcn init --rtl + Clerk | **Selected** -- RTL from day one, deliberate layer additions |
| B: template-nextjs-clerk-shadcn | Official Convex template with Clerk + shadcn | Rejected -- no RTL pre-configured, retrofitting is messier than init --rtl |
| C: Convex Ents SaaS Starter | Full SaaS starter with entity layer | Rejected -- too opinionated for solo dev, unnecessary complexity |

### Selected Starter: Clean Composition with Clerk

**Rationale for Selection:**

- RTL support configured at initialization via shadcn's `--rtl` flag
- Clerk provides battle-tested auth with pre-built UI components (SignIn, SignUp, UserButton), saving significant development effort for a solo developer
- Clerk's free tier (10K MAUs) covers Phase 1 and Phase 2 comfortably
- Official Convex + Clerk integration is well-documented and maintained
- Clean foundation where each layer is added deliberately

**Initialization Command:**

```bash
pnpm create next-app@latest marko --yes
cd marko
npx convex init
npx shadcn@latest init --rtl
pnpm add @clerk/nextjs
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript (strict mode), Node.js runtime, React 19.x with Next.js 16.x App Router

**Styling Solution:**
Tailwind CSS v4 with shadcn/ui component library. RTL support via logical CSS properties (ms-\*, me-\*, ps-\*, pe-\*, start-\*, end-\*). Noto Sans Hebrew font.

**Authentication:**
Clerk with Next.js middleware for route protection. Convex integration via Clerk JWT template for backend auth context. Pre-built components for sign-in, sign-up, and user management.

**Build Tooling:**
Turbopack (stable, default in Next.js 16), pnpm package manager, ESLint default config

**Testing Framework:**
Not included by default -- to be decided as an architecture decision

**Code Organization:**
Next.js App Router file-based routing, `convex/` directory for backend functions, `components/ui/` for shadcn components

**Development Experience:**
Turbopack HMR with filesystem cache, Convex dev server with hot-reload backend, TypeScript autocomplete across frontend and backend

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
Data residency split (localStorage vs Convex), three-tier authorization pattern, AI proxy architecture, Markdown rendering pipeline port, page structure, v1 migration strategy

**Important Decisions (Shape Architecture):**
Editor component choice, state management approach, error handling patterns, analytics strategy, testing strategy, PWA/offline approach

**Deferred Decisions (Post-MVP):**
Payment provider selection (Phase 2), Sumit API integration (Phase 2), advanced analytics/PostHog (Phase 2+), AI streaming (if needed), editor upgrade to CodeMirror (if needed)

### Data Architecture

**Data Residency Split:**

| Data | Storage | Rationale |
|---|---|---|
| Document content | localStorage only | Privacy requirement (FR51), no server storage |
| Color themes & presets | localStorage + optional Convex sync | Works offline, sync for logged-in users possible later |
| User account & tier | Convex (via Clerk) | Server-side auth, tier enforcement |
| AI usage tracking | Convex | Per-call logging: model, tokens, cost, user ID |
| AI rate limits | Convex | Server-enforced, per-account |
| Analytics events | Convex | Feature usage, conversion tracking |
| Payment records (Phase 2) | Convex | Transaction history, Sumit integration |

**Convex Schema (Core Tables):**

- `users` -- Extended from Clerk webhook (tier, subscription status, createdAt)
- `aiUsage` -- Every AI call logged (userId, model, tokens, cost, action, timestamp)
- `analyticsEvents` -- Feature usage events (userId, event, metadata, timestamp)
- `subscriptions` (Phase 2) -- Payment status, Sumit receipt references

No document content tables. Database stays lean and focused on operations.

**v1 localStorage Migration:**
Silent migration approach. Detect v1 keys (`mdEditorContent`, `mdEditorColors`, `mdEditorCustomPreset`, `mdEditorLastVersion`), transform to v2 format, delete v1 keys. One-time migration function runs on first v2 visit.

**Caching Strategy:**

- localStorage for offline-critical data (document, colors, editor state)
- Convex real-time queries for server data (user tier, usage counts) -- no manual caching, Convex handles reactive subscriptions
- No external cache layer (Redis etc.) -- Convex built-in caching sufficient for target scale

### Authentication & Security

**Three-Tier Authorization Pattern:**

| Tier | Identification | Capabilities |
|---|---|---|
| Anonymous | No Clerk session | Full editor, exports, theming -- no AI, no analytics |
| Free Registered | Clerk session, no subscription | Editor + limited AI (Sonnet), tracked usage |
| Paid (Phase 2) | Clerk session + active subscription | Unlimited Sonnet + daily Opus allocation |

**Enforcement Architecture:**

- Frontend: Clerk session check for UI gating (show/hide AI button, upgrade prompts). Convenience layer only.
- Backend (Convex): Every AI action verifies user tier and checks usage limits before calling Anthropic. This is the security boundary.

**AI API Key Security:**
Anthropic API key stored as Convex environment variable. All AI calls go through Convex actions (server-side). Key never reaches client. Next.js API routes not needed for AI.

**Rate Limiting:**

- Per-account: Convex mutation checks usage count before allowing AI call
- Per-IP: Not needed Phase 1 -- Clerk auth + account-based limits sufficient
- Abuse detection: Convex scheduled function runs periodically, flags accounts with suspicious patterns

### API & Communication Patterns

**Convex Function Types:**

| Pattern | Use Case | Example |
|---|---|---|
| `query` | Real-time reads | Get user tier, get AI usage count |
| `mutation` | Database writes | Log AI usage, update user tier |
| `action` | External API calls | Call Anthropic API, call Sumit API (Phase 2) |
| `httpAction` | Webhooks/callbacks | Clerk webhook for user events, payment webhooks (Phase 2) |

**AI Proxy Architecture:**

1. Client sends request to Convex action (document content + action type)
2. Convex action: verify auth (Clerk), check tier/limits (query usage table), select model (Haiku/Sonnet/Opus based on task)
3. Convex action: call Anthropic API
4. Convex action: log usage (mutation), return result to client
5. Client displays result

**AI Response Strategy:**
Full response (no streaming) for Phase 1. AI document actions (summarize, translate, extract) produce short outputs where streaming adds complexity without significant UX benefit. Streaming can be added later if needed.

**Error Handling:**

- Convex functions throw typed errors (`ConvexError`) with error codes
- Frontend catches and shows localized Hebrew error messages
- AI failures show graceful degradation banner ("AI temporarily unavailable")
- Network failures handled by Convex built-in retry + offline detection

### Frontend Architecture

**Markdown Rendering Pipeline:**
Port existing v1 pipeline into React components:

- Marked.js -- parse Markdown to HTML (keep existing GFM config)
- Highlight.js -- code syntax highlighting (keep github-dark theme)
- Mermaid.js -- diagram rendering (keep loose security, themed with app colors)
- All three bundled via npm (version pinning, tree-shaking) instead of CDN
- Pipeline runs client-side with `useMemo` for performance. 150ms debounce preserved.

**Editor Component:**
Plain `<textarea>` for Phase 1. Matches v1 behavior, smallest bundle, simplest to port. Upgrade to CodeMirror 6 deferred to Phase 3+ if users request editor-side syntax highlighting.

**State Management:**

| State Type | Solution | Scope |
|---|---|---|
| Server state (user, AI usage) | Convex real-time queries | Global, reactive |
| Auth state | Clerk React hooks | Global |
| Document content | React state + localStorage | Editor component |
| Color theme | React context + localStorage | Global |
| UI state (view mode, panels) | React state (useState) | Component-local |
| Editor preferences (direction, dark mode) | React context + localStorage | Global |

No external state library (Redux, Zustand). Convex handles server state, React handles UI state.

**Page Structure (Next.js App Router):**

```
app/
  layout.tsx            -- Root layout (Clerk, Convex, RTL, fonts)
  page.tsx              -- Landing page (SSR, SEO)
  editor/
    page.tsx            -- Editor page (CSR, "use client")
  sign-in/[[...sign-in]]/
    page.tsx            -- Clerk sign-in
  sign-up/[[...sign-up]]/
    page.tsx            -- Clerk sign-up
convex/
  schema.ts             -- Database schema
  users.ts              -- User queries/mutations
  ai.ts                 -- AI actions (Anthropic proxy)
  analytics.ts          -- Analytics mutations
  usage.ts              -- AI usage tracking
components/
  editor/               -- Editor panel, toolbar, textarea
  preview/              -- Preview panel, rendering pipeline
  ai/                   -- AI panel, action buttons, results
  theme/                -- Color panel, presets, extraction
  export/               -- Export modals, PDF/HTML/MD generators
  ui/                   -- shadcn/ui components
  layout/               -- Header, footer, panels
lib/
  markdown/             -- Marked.js config, Mermaid setup, highlight setup
  bidi/                 -- BiDi auto-detection engine
  colors/               -- 17-property color system, preset definitions
  migration/            -- v1 localStorage migration
  export/               -- PDF, HTML, MD export logic
```

**Offline/PWA Strategy:**

- Next.js PWA via next-pwa or Serwist
- Service worker caches: app shell, static assets, fonts
- Editor works fully offline (content in localStorage, rendering is client-side)
- AI/auth features show "requires connection" state when offline
- Export works offline (client-side generation)

### Infrastructure & Deployment

**Vercel Configuration:**

- Production branch: `main`
- Preview deployments on PRs
- Environment variables: Convex deployment URL, Clerk keys
- Edge runtime for landing page (fast TTFB)

**CI/CD:**
Vercel auto-deploys from GitHub. Convex auto-deploys with `npx convex deploy` in Vercel build step. No separate CI pipeline needed initially.

**Analytics Strategy (Phase 1):**
Convex-native analytics. Log events directly to Convex `analyticsEvents` table. Build custom operator queries. Keeps stack minimal, all data in one place. Upgrade to PostHog or similar in Phase 2+ if funnels/cohorts needed.

**Testing Strategy:**

- Vitest for unit tests (fast, TypeScript-native)
- Playwright for E2E tests (cross-browser, good for RTL testing)
- Critical path tests: rendering pipeline, export, AI proxy auth checks
- Testing infrastructure in place from start; comprehensive coverage grows over time

### Decision Impact Analysis

**Implementation Sequence:**

1. Project initialization (create-next-app + Convex + shadcn RTL + Clerk)
2. Root layout with providers (Clerk, Convex, RTL, fonts, dark mode)
3. Convex schema + Clerk webhook for user sync
4. Markdown rendering pipeline port (Marked.js, Highlight.js, Mermaid.js)
5. Editor component with localStorage persistence
6. Color system port (17 properties, presets, CSS custom properties)
7. Export system port (PDF via html2pdf.js, HTML, MD, Word copy)
8. v1 localStorage migration
9. BiDi auto-detection engine
10. AI proxy (Convex action + Anthropic integration)
11. AI UI (action buttons, results display, usage tracking)
12. Landing page (SSR, SEO, structured data)
13. PWA configuration
14. Analytics events

**Cross-Component Dependencies:**

- Color system must be ready before exports (exports depend on resolved colors)
- Clerk must be configured before AI proxy (AI requires auth verification)
- Convex schema must be defined before any backend functions
- Rendering pipeline must be ported before preview, exports, and AI actions (all depend on rendered output)
- BiDi engine integrates into the rendering pipeline (Marked.js post-processing)

## Implementation Patterns & Consistency Rules

### Critical Conflict Points

12 areas identified where AI agents could make different choices if not specified. Patterns below eliminate ambiguity.

### Naming Patterns

**Convex Database Naming:**

- Tables: plural camelCase -- `users`, `aiUsage`, `analyticsEvents`, `subscriptions`
- Fields: camelCase -- `userId`, `tokenCount`, `createdAt`
- Indexes: `by_` prefix -- `by_userId`, `by_createdAt`
- No abbreviations in field names -- `subscriptionStatus` not `subStatus`

```typescript
// Good
defineTable({ userId: v.string(), tokenCount: v.number(), createdAt: v.number() })
  .index("by_userId", ["userId"])

// Bad
defineTable({ user_id: v.string(), tkn_cnt: v.number() })
```

**Convex Function Naming:**

- Queries: `get` or `list` prefix -- `getUser`, `listAiUsage`
- Mutations: verb prefix -- `createUser`, `updateTier`, `logAiUsage`
- Actions: verb prefix -- `callAnthropicApi`, `generateSumitReceipt`
- HTTP actions: `handle` prefix -- `handleClerkWebhook`, `handlePaymentCallback`

**Component & File Naming:**

- React components: PascalCase files -- `EditorPanel.tsx`, `ColorPicker.tsx`
- Component directories: kebab-case -- `components/editor/`, `components/ai/`
- Utility files: kebab-case -- `lib/bidi/detect-direction.ts`, `lib/colors/presets.ts`
- Hooks: `use` prefix, camelCase file -- `useTheme.ts`, `useAiAction.ts`
- Types: PascalCase, co-located or in `types/` -- `types/ai.ts`, `types/colors.ts`
- Constants: UPPER_SNAKE_CASE -- `MAX_FREE_AI_CALLS`, `DEBOUNCE_MS`
- shadcn components: keep shadcn default naming in `components/ui/`

**CSS & Styling:**

- Always use Tailwind logical properties for RTL: `ms-4` not `ml-4`, `ps-4` not `pl-4`, `text-start` not `text-left`
- Custom CSS classes (rare): kebab-case BEM-like -- `.preview-content`, `.mermaid-container`
- CSS custom properties for the 17-color system: `--color-primary-text`, `--color-h1`, `--color-preview-bg`
- Dark mode: Tailwind `dark:` prefix, following shadcn conventions

### Structure Patterns

**Project Organization (by feature, not by type):**

```
components/
  editor/               -- EditorPanel.tsx, EditorToolbar.tsx, FormatButton.tsx
  preview/              -- PreviewPanel.tsx, MarkdownRenderer.tsx
  ai/                   -- AiPanel.tsx, AiActionButton.tsx, AiResultDisplay.tsx
  theme/                -- ColorPanel.tsx, ColorPicker.tsx, PresetGrid.tsx
  export/               -- ExportModal.tsx, PdfProgress.tsx
  layout/               -- Header.tsx, Footer.tsx, PanelLayout.tsx
  landing/              -- Hero.tsx, Features.tsx, Pricing.tsx
  ui/                   -- (shadcn generated, do not manually edit)
```

**Test Organization (co-located):**

- Unit tests next to source: `lib/bidi/detect-direction.test.ts`
- Component tests next to component: `components/editor/EditorPanel.test.tsx`
- E2E tests in dedicated folder: `e2e/editor-flow.spec.ts`, `e2e/export-flow.spec.ts`
- Convex function tests: `convex/__tests__/ai.test.ts`

**Convex Organization (by entity/domain):**

```
convex/
  schema.ts             -- Single source of truth for all tables
  users.ts              -- User queries, mutations, Clerk webhook handler
  ai.ts                 -- AI actions (Anthropic proxy, model routing)
  usage.ts              -- AI usage tracking queries and mutations
  analytics.ts          -- Analytics event mutations and queries
  subscriptions.ts      -- Phase 2: payment/subscription logic
  _generated/           -- Convex auto-generated (never edit)
```

### Format Patterns

Convex handles API format -- no REST endpoints to design. Standardized internal patterns:

**Error Format:**

```typescript
// Convex errors use ConvexError with typed payloads
throw new ConvexError({
  code: "AI_LIMIT_REACHED",
  message: "הגעת למגבלת השימוש החודשית ב-AI",
  messageEn: "Monthly AI usage limit reached",
})
```

Error codes: UPPER_SNAKE_CASE. Every error includes Hebrew message (`message`) and English fallback (`messageEn`).

**Date/Time:**

- Storage: Unix timestamp (number) in Convex -- `Date.now()`
- Display: Format with `Intl.DateTimeFormat` using `he-IL` locale
- Never store formatted date strings in the database

**Analytics Event Format:**

```typescript
// Standard event shape
{ userId: string, event: string, metadata: Record<string, any>, timestamp: number }

// Event naming: domain.action (lowercase, dot-separated)
"ai.call", "ai.limit_reached", "export.pdf", "export.html",
"theme.preset_applied", "auth.signup", "auth.login"
```

### Communication Patterns

**Convex Reactive Queries (no manual pub/sub):**

- UI subscribes to Convex queries -- updates are automatic and real-time
- No manual WebSocket setup, no polling, no cache invalidation
- Components use `useQuery(api.users.getUser)` pattern -- Convex handles reactivity

**State Update Patterns:**

- Server state: always via Convex mutations (never optimistic client-side updates for critical data like AI usage)
- Client state: React setState with immutable patterns (spread operator)
- localStorage: read on mount, write on change via `useEffect`
- No direct localStorage.setItem calls scattered in components -- centralize in custom hooks (`useLocalStorage`, `useEditorContent`, `useColorTheme`)

### Process Patterns

**Error Handling:**

- Convex action errors: caught in the calling component, displayed as Hebrew toast
- Network errors: Convex handles reconnection; UI shows offline banner via network status hook
- AI errors: show specific banner "AI is temporarily unavailable" with retry option
- Export errors: show toast with error details, never silently fail
- Never use `console.log` for error handling -- use structured error handling

**Loading States:**

- Convex queries return `undefined` while loading -- check with `if (data === undefined)` not `if (!data)`
- AI actions: show loading spinner in AI panel with Hebrew text
- Exports: show progress modal (especially PDF generation)
- Page loads: use Next.js `loading.tsx` for route-level loading
- Skeleton components (shadcn `Skeleton`) for content loading

**Validation:**

- User input validated on the frontend (immediate feedback, Hebrew error messages)
- All validation re-checked in Convex mutations/actions (security boundary)
- Use Convex schema validators (`v.string()`, `v.number()`) -- they auto-validate
- No separate validation library needed

### UI Language Rules

All user-facing text in Hebrew. Code identifiers in English.

- Button labels, tooltips, toasts, modals, error messages: Hebrew
- ARIA labels: Hebrew (`aria-label="סגור"` not `aria-label="Close"`)
- Placeholder text: Hebrew
- Console logs, error codes, variable names, comments: English

### Enforcement Guidelines

**All AI Agents MUST:**

1. Run `npx shadcn@latest add <component>` to add new shadcn components -- never copy-paste component code
2. Use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) -- never physical (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`)
3. Store all user-facing strings as Hebrew in the component -- no i18n abstraction in Phase 1
4. Use Convex functions for all server-side operations -- never use Next.js API routes
5. Use `useQuery`/`useMutation`/`useAction` from Convex -- never fetch() to external APIs from the client
6. Include both `message` (Hebrew) and `messageEn` (English) in all ConvexError payloads
7. Co-locate tests with source files
8. Use the 17-property color system via CSS custom properties -- never hardcode colors in components

## Project Structure & Boundaries

### Complete Project Directory Structure

```
marko/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json                  -- shadcn/ui config (rtl: true)
├── .env.local                       -- Clerk keys, Convex URL (gitignored)
├── .env.example                     -- Template for env vars
├── .gitignore
├── middleware.ts                     -- Clerk auth middleware
├── vitest.config.ts
├── playwright.config.ts
│
├── convex/
│   ├── _generated/                  -- Auto-generated (never edit)
│   ├── schema.ts                    -- All table definitions
│   ├── users.ts                     -- getUser, createUser, updateTier
│   ├── ai.ts                        -- callAnthropicApi (action), model routing logic
│   ├── usage.ts                     -- logAiUsage, getUsageCount, checkLimit
│   ├── analytics.ts                 -- logEvent, listEvents, getEventCounts
│   ├── subscriptions.ts             -- Phase 2: subscription CRUD
│   ├── http.ts                      -- httpAction routes (Clerk webhook, payment webhook)
│   ├── crons.ts                     -- Scheduled jobs (abuse detection)
│   └── __tests__/
│       ├── ai.test.ts
│       ├── usage.test.ts
│       └── analytics.test.ts
│
├── app/
│   ├── globals.css                  -- Tailwind directives, CSS custom properties (17-color system)
│   ├── layout.tsx                   -- Root: ClerkProvider, ConvexProvider, RTL dir, fonts, dark mode
│   ├── page.tsx                     -- Landing page (SSR, SEO, structured data)
│   ├── loading.tsx                  -- Root loading skeleton
│   ├── not-found.tsx                -- 404 page (Hebrew)
│   ├── sitemap.ts                   -- Dynamic sitemap generation
│   ├── robots.ts                    -- Robots.txt generation
│   ├── manifest.ts                  -- PWA manifest generation
│   ├── editor/
│   │   ├── page.tsx                 -- Editor page ("use client", main app)
│   │   └── loading.tsx              -- Editor loading skeleton
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx                 -- Clerk sign-in
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx                 -- Clerk sign-up
│
├── components/
│   ├── ui/                          -- shadcn/ui (generated, do not manually edit)
│   ├── layout/
│   │   ├── Header.tsx               -- Logo, view toggles, action buttons
│   │   ├── Footer.tsx               -- Credits, version
│   │   └── PanelLayout.tsx          -- CSS Grid two-panel layout
│   ├── editor/
│   │   ├── EditorPanel.tsx          -- Panel wrapper with header
│   │   ├── EditorToolbar.tsx        -- Formatting buttons, dropdowns
│   │   ├── EditorTextarea.tsx       -- Textarea with RTL, auto-save
│   │   ├── FormatButton.tsx         -- Individual toolbar button
│   │   ├── ToolbarDropdown.tsx      -- Heading, code, mermaid dropdowns
│   │   └── EditorPanel.test.tsx
│   ├── preview/
│   │   ├── PreviewPanel.tsx         -- Panel wrapper with header
│   │   ├── MarkdownRenderer.tsx     -- Rendering pipeline (Marked + hljs + Mermaid)
│   │   ├── PresentationMode.tsx     -- Full-screen distraction-free view
│   │   └── MarkdownRenderer.test.tsx
│   ├── ai/
│   │   ├── AiPanel.tsx              -- AI action container
│   │   ├── AiActionButton.tsx       -- Individual AI action trigger
│   │   ├── AiResultDisplay.tsx      -- AI response output
│   │   ├── AiLimitBanner.tsx        -- Usage limit notification
│   │   ├── AiDisclosure.tsx         -- Privacy notice (FR50)
│   │   └── AiPanel.test.tsx
│   ├── theme/
│   │   ├── ColorPanel.tsx           -- Slide-out color customization
│   │   ├── ColorPicker.tsx          -- Individual color picker row
│   │   ├── PresetGrid.tsx           -- 15 theme preset buttons
│   │   ├── ImageColorExtractor.tsx  -- Upload image, k-means, preview
│   │   ├── ColorPreviewModal.tsx    -- Preview extracted colors
│   │   ├── ThemeToggle.tsx          -- Dark/light mode toggle
│   │   └── ColorPanel.test.tsx
│   ├── export/
│   │   ├── ExportModal.tsx          -- Filename picker + format selection
│   │   └── PdfProgress.tsx          -- PDF generation progress indicator
│   ├── landing/
│   │   ├── Hero.tsx                 -- Hero section with CTA
│   │   ├── Features.tsx             -- Feature showcase
│   │   ├── Demo.tsx                 -- Interactive preview demo
│   │   └── Seo.tsx                  -- JSON-LD structured data
│   ├── auth/
│   │   ├── UserButton.tsx           -- Clerk UserButton wrapper
│   │   ├── AuthGate.tsx             -- Conditional render by tier
│   │   └── UpgradePrompt.tsx        -- Gentle upgrade CTA
│   └── shared/
│       ├── DirectionToggle.tsx      -- RTL/LTR toggle button
│       ├── OfflineBanner.tsx        -- Network status indicator
│       └── Toast.tsx                -- Hebrew toast notifications
│
├── lib/
│   ├── markdown/
│   │   ├── config.ts               -- Marked.js configuration (GFM, breaks)
│   │   ├── mermaid-setup.ts         -- Mermaid init with theme colors
│   │   ├── highlight-setup.ts       -- Highlight.js configuration
│   │   ├── render-pipeline.ts       -- Full render: parse -> mermaid detect -> highlight
│   │   └── render-pipeline.test.ts
│   ├── bidi/
│   │   ├── detect-direction.ts      -- Per-sentence Hebrew/English detection
│   │   ├── unicode-ranges.ts        -- Hebrew/Arabic/Latin character ranges
│   │   └── detect-direction.test.ts
│   ├── colors/
│   │   ├── types.ts                 -- ColorTheme type (17 properties)
│   │   ├── presets.ts               -- 15 built-in color presets
│   │   ├── defaults.ts              -- Default "classic" color scheme
│   │   ├── apply-colors.ts          -- Generate CSS custom properties from ColorTheme
│   │   └── image-extraction.ts      -- k-means clustering, color mapping
│   ├── export/
│   │   ├── pdf-generator.ts         -- html2pdf.js wrapper with RTL + colors
│   │   ├── html-generator.ts        -- Styled HTML export with inline styles
│   │   ├── md-generator.ts          -- Raw Markdown download
│   │   ├── word-copy.ts             -- Clipboard with inline RTL styles for Word
│   │   └── pdf-generator.test.ts
│   ├── migration/
│   │   ├── v1-migration.ts          -- Detect and migrate v1 localStorage keys
│   │   └── v1-migration.test.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts       -- Generic localStorage hook
│   │   ├── useEditorContent.ts      -- Document content with auto-save
│   │   ├── useColorTheme.ts         -- 17-property color state + persistence
│   │   ├── useAiAction.ts           -- AI call with loading/error state
│   │   ├── useNetworkStatus.ts      -- Online/offline detection
│   │   ├── useViewMode.ts           -- Editor/preview/split state
│   │   └── useDebounce.ts           -- Debounce utility hook (150ms default)
│   ├── ai/
│   │   ├── model-router.ts          -- Task-to-model mapping (Haiku/Sonnet/Opus)
│   │   ├── prompts.ts               -- System prompts per action type
│   │   └── model-router.test.ts
│   └── utils.ts                     -- cn() helper (shadcn), small shared utilities
│
├── types/
│   ├── ai.ts                        -- AiAction, AiResponse, ModelTier types
│   ├── colors.ts                    -- ColorTheme, ColorPreset types
│   ├── editor.ts                    -- ViewMode, ExportType types
│   └── user.ts                      -- UserTier, UserProfile types
│
├── public/
│   ├── pen.png                      -- App icon (512x512, from v1)
│   ├── og-image.png                 -- Open Graph social preview image
│   └── fonts/                       -- Self-hosted Noto Sans Hebrew (optional)
│
├── e2e/
│   ├── editor-flow.spec.ts          -- Editor paste, render, view modes
│   ├── export-flow.spec.ts          -- PDF, HTML, MD export
│   ├── theme-flow.spec.ts           -- Color presets, dark mode
│   ├── ai-flow.spec.ts              -- AI actions, limit handling
│   └── auth-flow.spec.ts            -- Sign up, sign in, tier gating
│
└── docs/                            -- Project documentation (gitignored from deploy)
```

### Architectural Boundaries

**Frontend/Backend Boundary:**

- Frontend (Next.js): UI rendering, user interactions, localStorage, client-side exports
- Backend (Convex): Auth verification, AI proxy, usage tracking, analytics, abuse detection
- Boundary enforced by Convex's `useQuery`/`useMutation`/`useAction` hooks -- no direct API calls

**Offline/Online Boundary:**

| Feature | Offline | Online Required |
|---|---|---|
| Editor (type, paste, format) | Yes | No |
| Preview rendering | Yes | No |
| Color theming | Yes | No |
| Export (PDF, HTML, MD, Word) | Yes | No |
| Dark/light mode | Yes | No |
| AI document actions | No | Yes |
| Sign in/sign up | No | Yes |
| Analytics tracking | No | Yes (queued) |
| Usage limit checks | No | Yes |

**Auth Boundary:**

- Public routes: `/` (landing), `/editor` (anonymous use)
- Auth-optional routes: `/editor` (enhanced with AI when logged in)
- Auth-required routes: `/sign-in`, `/sign-up`
- Clerk middleware protects no routes by default -- all editor features work anonymously
- AI Convex actions check Clerk identity internally

**Data Boundary:**

- Client-only data: document content, color theme, UI preferences (localStorage)
- Server-only data: user records, AI usage logs, analytics events (Convex)
- Ephemeral data: document content sent to AI (not stored, passed in action call and discarded)

### Requirements to Structure Mapping

**FR1-10 (Document Editing & Rendering):**
`components/editor/`, `components/preview/`, `lib/markdown/`, `lib/bidi/`

**FR11-17 (Export & Output):**
`lib/export/`, `components/export/`

**FR18-23 (Color Theming):**
`lib/colors/`, `components/theme/`, `app/globals.css`

**FR24-31 (AI Document Actions):**
`convex/ai.ts`, `convex/usage.ts`, `lib/ai/`, `components/ai/`

**FR32-36 (User Accounts & Auth):**
`convex/users.ts`, `convex/http.ts` (Clerk webhook), `components/auth/`, `middleware.ts`

**FR37-41 (Payments, Phase 2):**
`convex/subscriptions.ts`, `convex/http.ts` (payment webhook)

**FR42-46 (Analytics & Operator Tools):**
`convex/analytics.ts`, `convex/crons.ts`

**FR47-49 (SEO & Discovery):**
`app/page.tsx` (landing), `app/sitemap.ts`, `app/robots.ts`, `components/landing/`

**FR50-52 (Privacy & Compliance):**
`components/ai/AiDisclosure.tsx`, `convex/users.ts` (account deletion)

**Cross-Cutting: v1 Migration:** `lib/migration/v1-migration.ts`

**Cross-Cutting: RTL/BiDi:** `lib/bidi/`, `components.json` (rtl: true), all components use logical Tailwind properties

**Cross-Cutting: Color Sync (5 targets):** `lib/colors/apply-colors.ts` -> preview, `lib/export/pdf-generator.ts`, `lib/export/html-generator.ts`, `lib/export/word-copy.ts`, `lib/markdown/mermaid-setup.ts`

### Integration Points

**External Integrations:**

| Service | Integration Point | Direction |
|---|---|---|
| Anthropic API | `convex/ai.ts` (action) | Outbound: send prompt, receive response |
| Clerk | `middleware.ts` + `convex/http.ts` | Inbound: webhook; Outbound: session verification |
| Vercel | `next.config.ts` + build step | Deploy pipeline |
| Sumit (Phase 2) | `convex/subscriptions.ts` (action) | Outbound: generate receipt |
| Payment provider (Phase 2) | `convex/http.ts` (webhook) | Inbound: payment events |

### Data Flow

**Rendering Flow:**
User types/pastes -> EditorTextarea -> useEditorContent (localStorage + React state) -> useDebounce(150ms) -> MarkdownRenderer -> render-pipeline.ts (Marked -> Mermaid detect -> hljs) -> PreviewPanel (rendered HTML) -> export targets (pdf-generator, html-generator, word-copy)

**AI Flow:**
User clicks AI action -> AiActionButton -> useAiAction hook -> useAction(api.ai.callAnthropicApi) -> convex/ai.ts (verify auth -> check limits -> select model -> call Anthropic) -> convex/usage.ts (logAiUsage) -> AiResultDisplay (rendered response)

### Development Workflow

**Development Servers:**
Terminal 1: `pnpm dev` (Next.js with Turbopack)
Terminal 2: `npx convex dev` (Convex dev server with hot-reload)

**Build & Deploy:**
Vercel build command: `npx convex deploy && pnpm build`
Auto-deploys on push to `main`. Preview deployments on PRs.

**Environment Variables:**

| Variable | Where Set | Purpose |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Vercel env vars | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel env vars | Client-side Convex URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel env vars | Clerk public key |
| `CLERK_SECRET_KEY` | Vercel env vars | Clerk server key |
| `CLERK_WEBHOOK_SECRET` | Convex env vars | Clerk webhook verification |
| `ANTHROPIC_API_KEY` | Convex env vars | Anthropic API access |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices (Next.js 16 + Convex + Clerk + shadcn/ui RTL + Tailwind + Vercel) have official integrations and are compatible. TypeScript end-to-end ensures type safety across frontend and backend.

**Pattern Consistency:** Naming conventions (camelCase for Convex, PascalCase for components, kebab-case for directories) are consistent and follow each technology's conventions. RTL patterns (logical Tailwind properties + shadcn RTL flag) are unified.

**Structure Alignment:** Project structure supports all decisions. One structural fix applied: AI model routing and prompts must live in `convex/` directory (not `lib/ai/`) due to Convex's import boundary -- Convex functions can only import from within `convex/` or `node_modules`.

**Structural Fix Applied:**

- `lib/ai/` directory removed from project structure
- `convex/modelRouter.ts` -- task-to-model mapping logic (Haiku/Sonnet/Opus)
- `convex/prompts.ts` -- system prompts per AI action type
- Reason: Convex functions cannot import from `lib/` -- all backend logic must reside in `convex/`

### Requirements Coverage Validation

**Functional Requirements:** All 52 FRs mapped to specific architectural components. Phase 2 FRs (FR37-41) deferred with placeholder architecture (convex/subscriptions.ts).

**Non-Functional Requirements:** All 6 NFR domains (Performance, Security, Scalability, Accessibility, Integration, Reliability) have explicit architectural support documented.

**Cross-Cutting Concerns:** All 6 cross-cutting concerns (RTL/BiDi, Auth State, Color Sync, Offline/Online, Cost Observability, Phased Delivery) are architecturally addressed with specific patterns and file locations.

### Implementation Readiness Validation

**Decision Completeness:** All critical and important decisions documented with technology choices, versions, and rationale. Deferred decisions explicitly listed with triggers for when they should be addressed.

**Structure Completeness:** Complete project tree with ~60 specific files. Every file has a documented purpose. All component boundaries defined.

**Pattern Completeness:** 12 conflict areas addressed. 8 enforcement rules for AI agents. Concrete code examples for naming, error handling, and data patterns.

### Gap Analysis Results

**Critical Gaps:** None remaining (Convex import boundary fixed)

**Important Notes:**
- v1 to v2 URL redirect needed (GitHub Pages -> Vercel domain). Implementation detail, not architectural.
- PWA library choice (next-pwa vs Serwist) left as implementation decision -- either works with the architecture.

**Deferred Items (by design):**
- Payment provider selection (Phase 2 trigger: analytics show conversion demand)
- Sumit API integration (Phase 2)
- AI streaming (deferred until user feedback indicates need)
- CodeMirror editor upgrade (Phase 3+)
- PostHog analytics (Phase 2+ if custom analytics insufficient)

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (52 FRs, 6 NFR domains)
- [x] Scale and complexity assessed (Medium-High, ~12-15 components)
- [x] Technical constraints identified (8 constraints documented)
- [x] Cross-cutting concerns mapped (6 concerns with patterns)

**Architectural Decisions**
- [x] Critical decisions documented with versions (Next.js 16, Convex, Clerk, shadcn RTL)
- [x] Technology stack fully specified (7 key choices with rationale)
- [x] Integration patterns defined (5 external integrations mapped)
- [x] Performance considerations addressed (debounce, CSR/SSR split, edge runtime)

**Implementation Patterns**
- [x] Naming conventions established (database, functions, components, CSS)
- [x] Structure patterns defined (feature-based organization, co-located tests)
- [x] Communication patterns specified (Convex reactive queries, state management)
- [x] Process patterns documented (error handling, loading states, validation)

**Project Structure**
- [x] Complete directory structure defined (~60 files)
- [x] Component boundaries established (frontend/backend, offline/online, auth)
- [x] Integration points mapped (5 external services with directions)
- [x] Requirements to structure mapping complete (all FRs mapped)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clean separation: client-side editor (offline-capable) + Convex backend (auth, AI, analytics)
- RTL-first from initialization (shadcn --rtl flag)
- Convex eliminates API design complexity -- TypeScript end-to-end with reactive queries
- Solo-dev-friendly: minimal services (Convex + Clerk + Vercel), no infrastructure to manage
- Phased architecture: each phase adds capabilities without rework

**Areas for Future Enhancement:**
- AI response streaming (when/if needed for longer outputs)
- Cross-device sync for color themes and preferences (logged-in users)
- Advanced analytics (PostHog) for funnel analysis
- Editor upgrade to CodeMirror 6 for in-editor syntax highlighting

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries (especially Convex import boundary)
- Refer to this document for all architectural questions
- When in doubt, prefer the simpler approach aligned with solo-dev constraint

**First Implementation Priority:**

```bash
pnpm create next-app@latest marko --yes
cd marko
npx convex init
npx shadcn@latest init --rtl
pnpm add @clerk/nextjs
```
