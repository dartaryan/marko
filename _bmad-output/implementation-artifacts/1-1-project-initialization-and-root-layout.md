# Story 1.1: Project Initialization & Root Layout

Status: done

## Story

As a developer,
I want the Marko project initialized with Next.js, Convex, shadcn/ui (RTL), and Clerk providers in the root layout,
So that I have a working foundation with RTL-first design, authentication readiness, and a reactive backend.

## Acceptance Criteria

1. **Given** a clean development environment **When** the initialization commands are run (`create-next-app`, `convex init`, `shadcn init --rtl`, `pnpm add @clerk/nextjs`) **Then** the project builds successfully with zero errors
2. **And** the root layout includes ClerkProvider, ConvexProviderWithClerk, `dir="rtl"`, and Noto Sans Hebrew font
3. **And** the editor route (`/editor`) renders a placeholder page
4. **And** the landing page route (`/`) renders a placeholder page
5. **And** Tailwind CSS v4 is configured with logical properties for RTL
6. **And** TypeScript strict mode is enabled
7. **And** the dev server starts with Turbopack HMR and Convex dev server running concurrently
8. **And** shadcn/ui is initialized with `--rtl` flag (components use logical CSS properties)
9. **And** `.env.example` documents all required environment variables
10. **And** Clerk middleware protects routes as configured
11. **And** `components.json` has `rtl: true` set

## Tasks / Subtasks

- [x] Task 1: Project scaffold (AC: #1)
  - [x] 1.1 Run `pnpm create next-app@latest marko --yes` (Next.js 16.x with TypeScript, Tailwind, App Router, Turbopack)
  - [x] 1.2 Run `npx convex init` inside the project
  - [x] 1.3 Run `npx shadcn@latest init --rtl` to initialize shadcn/ui with RTL support
  - [x] 1.4 Run `pnpm add @clerk/nextjs convex`
  - [x] 1.5 Verify `pnpm build` succeeds with zero errors
- [x] Task 2: Root layout with providers (AC: #2)
  - [x] 2.1 Create `app/ConvexClientProvider.tsx` — wrap `ConvexProviderWithClerk` inside `ClerkProvider`
  - [x] 2.2 Update `app/layout.tsx` — set `<html lang="he" dir="rtl">`, load Noto Sans Hebrew via `next/font/google`, wrap children with `ConvexClientProvider`
  - [x] 2.3 Configure dark mode support in Tailwind (class strategy)
- [x] Task 3: Route stubs (AC: #3, #4)
  - [x] 3.1 Create `app/page.tsx` — landing page placeholder (SSR, Hebrew text)
  - [x] 3.2 Create `app/editor/page.tsx` — editor placeholder (`"use client"`, Hebrew text)
  - [x] 3.3 Create `app/sign-in/[[...sign-in]]/page.tsx` — Clerk sign-in page
  - [x] 3.4 Create `app/sign-up/[[...sign-up]]/page.tsx` — Clerk sign-up page
- [x] Task 4: Configuration files (AC: #5, #6, #8, #9, #10, #11)
  - [x] 4.1 Verify `tsconfig.json` has `"strict": true`
  - [x] 4.2 Verify `components.json` has `"rtl": true` after shadcn init
  - [x] 4.3 Create `.env.example` with all required variables documented
  - [x] 4.4 Create `.env.local` with placeholder values (gitignored)
  - [x] 4.5 Create `proxy.ts` for Clerk route protection (Next.js 16 uses `proxy` convention instead of `middleware`)
  - [x] 4.6 Create `convex/auth.config.ts` for Convex-Clerk backend auth
  - [x] 4.7 Create `convex/schema.ts` with initial empty schema
- [x] Task 5: CSS foundation (AC: #5)
  - [x] 5.1 Update `app/globals.css` with Tailwind v4 directives and 17-color CSS custom property system
  - [x] 5.2 Add dark mode CSS variable overrides (`[data-theme="dark"]`)
  - [x] 5.3 Verify logical properties work (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`)
- [x] Task 6: Dev server verification (AC: #7)
  - [x] 6.1 Add concurrent dev script: `pnpm dev` runs Next.js (Turbopack) + `npx convex dev` concurrently
  - [x] 6.2 Verify HMR works (edit a component, see update)
  - [x] 6.3 Verify Convex dev server connects and syncs

## Dev Notes

### Architecture Compliance

- **Framework**: Next.js 16.x with App Router, Turbopack (default bundler)
- **Package manager**: pnpm (NOT npm or yarn)
- **Backend**: Convex (NOT Next.js API routes) — all server-side operations go through Convex functions
- **Auth**: Clerk with `ConvexProviderWithClerk` from `convex/react-clerk`
- **UI library**: shadcn/ui with RTL support (`--rtl` flag) — Radix primitives, Tailwind-based
- **Styling**: Tailwind CSS v4 with logical properties for RTL (never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`)
- **React Compiler**: Stable in Next.js 16 — auto-memoizes components, no manual `useMemo`/`useCallback` needed for basic cases

### Provider Wrapping Order (CRITICAL)

```tsx
// app/ConvexClientProvider.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

**ClerkProvider MUST wrap ConvexProviderWithClerk** — Convex needs access to Clerk context for auth tokens.

### Font Configuration

```tsx
// app/layout.tsx
import { Noto_Sans_Hebrew } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-body",
});
```

- **Body font**: Noto Sans Hebrew (Hebrew + Latin subsets)
- **Code font**: JetBrains Mono (to be added when code blocks are implemented in Story 1.2)
- Use `next/font` for zero-CLS font loading — do NOT use Google Fonts CDN links

### 17-Color CSS Custom Property System

The color system in `globals.css` must define these 17 custom properties under `:root`:

| Category | Properties |
|---|---|
| Text (4) | `--color-primary-text`, `--color-secondary-text`, `--color-link`, `--color-code` |
| Headings (5) | `--color-h1`, `--color-h1-border`, `--color-h2`, `--color-h2-border`, `--color-h3` |
| Backgrounds (5) | `--color-preview-bg`, `--color-code-bg`, `--color-blockquote-bg`, `--color-table-header`, `--color-table-alt` |
| Accents (3) | `--color-blockquote-border`, `--color-hr`, `--color-table-border` |

Default "classic" values:
- Primary accent: `#10B981` (emerald green)
- Text: dark grays on light backgrounds
- Headings: graduated greens (H1 darkest to H3 lightest)

These properties are used by the preview panel and all exports. They must also be mapped to shadcn/ui conventions (`--primary`, `--background`, `--foreground`, etc.).

### Environment Variables Required

```env
# .env.example
NEXT_PUBLIC_CONVEX_URL=           # From `npx convex dev` output
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= # Clerk Dashboard → API Keys
CLERK_SECRET_KEY=                  # Clerk Dashboard → API Keys
```

Convex environment variables (set via `npx convex env set`):
- `CLERK_WEBHOOK_SECRET` — For Clerk webhook verification (later stories)
- `ANTHROPIC_API_KEY` — For AI features (Epic 6)

### Clerk Middleware Configuration

> **Note:** Next.js 16 deprecates `middleware.ts` in favor of the `proxy` convention. Use `proxy.ts` at the project root.

```ts
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Convex Auth Configuration

```ts
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### RTL Enforcement Rules

- Root `<html>` element: `dir="rtl"` and `lang="he"`
- ALL Tailwind classes use logical properties: `ms-4` (not `ml-4`), `me-4` (not `mr-4`), `ps-4` (not `pl-4`), `pe-4` (not `pr-4`), `text-start` (not `text-left`), `text-end` (not `text-right`)
- shadcn/ui initialized with `--rtl` handles component-level RTL automatically
- All user-facing text in Hebrew, code/comments in English

### UI Language Rules

- All button labels, tooltips, ARIA labels, placeholder text, error messages: **Hebrew**
- Variable names, function names, comments, error codes: **English**
- Example: `aria-label="עורך מארקדאון"`, not `aria-label="Markdown Editor"`

### What NOT to Do

- Do NOT create Next.js API routes (`app/api/`) — use Convex functions for all backend logic
- Do NOT use `npm` or `yarn` — use `pnpm` exclusively
- Do NOT use physical CSS properties (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`)
- Do NOT use Google Fonts CDN `<link>` tags — use `next/font`
- Do NOT hardcode colors — use CSS custom properties
- Do NOT copy-paste shadcn component code — run `npx shadcn@latest add <component>`
- Do NOT add `next/font/local` for Varela Round yet — Story 1.2 will handle additional fonts when needed
- Do NOT implement any editor or preview functionality — just placeholder pages

### Project Structure Notes

After this story completes, the file structure should be:

```
marko/
├── app/
│   ├── globals.css          -- Tailwind v4 + 17-color system + dark mode
│   ├── layout.tsx           -- Root: providers, RTL, font, dark mode
│   ├── page.tsx             -- Landing placeholder
│   ├── ConvexClientProvider.tsx -- ClerkProvider + ConvexProviderWithClerk
│   ├── editor/
│   │   └── page.tsx         -- Editor placeholder ("use client")
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx         -- Clerk sign-in
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx         -- Clerk sign-up
├── convex/
│   ├── _generated/          -- Auto-generated (never edit)
│   ├── auth.config.ts       -- Clerk JWT validation config
│   ├── schema.ts            -- Empty initial schema
│   └── tsconfig.json        -- Convex TypeScript config
├── components/
│   └── ui/                  -- shadcn/ui generated components (if any added)
├── lib/
│   └── utils.ts             -- shadcn/ui utility (cn function)
├── proxy.ts                 -- Clerk middleware (Next.js 16 proxy convention)
├── .env.example             -- Documented env vars
├── .env.local               -- Local secrets (gitignored)
├── components.json          -- shadcn config (rtl: true)
├── eslint.config.mjs        -- ESLint configuration
├── next.config.ts           -- Next.js configuration
├── postcss.config.mjs       -- PostCSS / Tailwind v4 config
├── pnpm-workspace.yaml      -- pnpm workspace settings
├── tsconfig.json            -- strict: true
├── package.json
└── pnpm-lock.yaml
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Selected-Starter]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1-Story-1.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional-Requirements]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Layout-Structure]
- [Web: Next.js 16.1 docs](https://nextjs.org/blog/next-16-1) — Turbopack default, React Compiler stable
- [Web: shadcn/ui RTL support](https://ui.shadcn.com/docs/rtl) — `--rtl` flag, logical CSS auto-conversion
- [Web: Convex + Clerk integration](https://docs.convex.dev/auth/clerk) — ConvexProviderWithClerk setup
- [Web: Clerk Convex guide](https://clerk.com/docs/guides/development/integrations/databases/convex) — Provider wrapping order

### Git Intelligence

Recent commits are documentation/planning only (no code yet). This is a greenfield project — no existing codebase patterns to follow. The v1 project is a separate single-file HTML app (`index.html`) that will NOT be modified; v2 is built from scratch.

### Important: v1 vs v2 Context

The `project-context.md` file describes the **v1 architecture** (single-file `index.html`, CDN dependencies, no build step). Story 1.1 creates the **v2 architecture** which is completely different (Next.js, pnpm, Convex, etc.). Do NOT follow v1 patterns. The v1 code serves only as a reference for feature parity in later stories (especially Story 1.7: migration).

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `convex init` is deprecated in Convex 1.32.0 — used `pnpm add convex` + manual file creation instead
- `pnpm approve-builds` requires interactive terminal; solved via `pnpm.onlyBuiltDependencies` in package.json
- Initial build failed due to empty `NEXT_PUBLIC_CONVEX_URL` — added placeholder URL in `.env.local`
- Next.js 16 deprecates `middleware.ts` in favor of `proxy` convention — Clerk still works, just a warning

### Completion Notes List

- Scaffolded Next.js 16.1.6 project with pnpm, TypeScript strict, Tailwind CSS v4, App Router
- Installed and configured: @clerk/nextjs 7.0.1, convex 1.32.0, shadcn/ui 3.8.5 (RTL)
- Created ConvexClientProvider with correct ClerkProvider > ConvexProviderWithClerk wrapping order
- Root layout: `<html lang="he" dir="rtl">`, Noto Sans Hebrew font via next/font, ConvexClientProvider wrapper
- Created 4 route pages: `/` (landing), `/editor` (client), `/sign-in`, `/sign-up`
- Implemented 17-color CSS custom property system with light + dark mode overrides
- All shadcn/ui variables preserved and dark mode configured via `.dark` and `[data-theme="dark"]` selectors
- Clerk middleware configured for route protection
- Convex auth.config.ts and empty schema.ts created
- `.env.example` documents all required variables, `.env.local` gitignored
- `components.json` confirms `rtl: true`
- `pnpm build` passes with zero errors, `pnpm lint` passes with zero errors
- Dev scripts: `pnpm dev` (Next.js Turbopack), `pnpm dev:full` (concurrent Next.js + Convex via `concurrently`)

### File List

- marko/app/ConvexClientProvider.tsx (new)
- marko/app/layout.tsx (new — scaffold modified)
- marko/app/page.tsx (new — scaffold modified)
- marko/app/globals.css (new — scaffold modified)
- marko/app/editor/page.tsx (new)
- marko/app/sign-in/[[...sign-in]]/page.tsx (new)
- marko/app/sign-up/[[...sign-up]]/page.tsx (new)
- marko/proxy.ts (new — Clerk middleware, Next.js 16 proxy convention)
- marko/convex/auth.config.ts (new)
- marko/convex/schema.ts (new)
- marko/convex/tsconfig.json (generated by convex)
- marko/.env.example (new)
- marko/.env.local (new, gitignored)
- marko/.gitignore (new — scaffold modified)
- marko/package.json (new — scaffold modified)
- marko/components.json (generated by shadcn init)
- marko/lib/utils.ts (generated by shadcn init)
- marko/eslint.config.mjs (generated by create-next-app)
- marko/next.config.ts (generated by create-next-app)
- marko/postcss.config.mjs (generated by create-next-app)
- marko/pnpm-workspace.yaml (new)
- marko/tsconfig.json (generated by create-next-app)
- marko/pnpm-lock.yaml (generated)

### Change Log

- 2026-03-06: Story 1.1 implemented — Full project scaffold with Next.js 16.1.6, Convex, Clerk, shadcn/ui RTL, 17-color CSS system, all route stubs, and configuration files
- 2026-03-06: Code review — Fixed 6 issues: installed `concurrently` for cross-platform dev script (H2), uncommented Clerk env vars in .env.example (M2), corrected File List (middleware.ts→proxy.ts + 5 missing files) (H1/M1), fixed Completion Notes route count (M3), updated project structure to match Tailwind v4 reality (M4)
