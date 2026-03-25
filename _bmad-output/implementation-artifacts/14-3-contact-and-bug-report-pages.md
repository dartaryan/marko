# Story 14.3: Contact & Bug Report Pages

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to contact the team or report a bug directly from the app,
so that I can get help or report issues without leaving Marko.

## Acceptance Criteria

1. **Contact Form** — `/contact` page with required fields: name, email, message. Submit creates a GitHub Issue with label `contact` via server-side API route. Success toast: "ההודעה נשלחה בהצלחה ✓"

2. **Bug Report Form** — `/report-bug` page with structured form:
   - תיאור הבעיה (Description) — required textarea
   - צעדים לשחזור (Steps to reproduce) — optional textarea
   - מה ציפית שיקרה (Expected behavior) — optional text
   - צילום מסך (Screenshot) — optional file upload
   - Auto-collected metadata attached (browser, OS, screen size, URL, dark/light mode, theme, editor content length)

3. **GitHub Issues Integration** — Both forms create issues via `POST /repos/{owner}/{repo}/issues` using `GITHUB_TOKEN` env var. Contact issues get label `contact`, bug reports get label `bug`. Token stays server-side in a Next.js Route Handler.

4. **Navigation** — Both pages accessible from user menu: "צור קשר" (contact) / "דווח על בעיה" (bug report). Navigation links already exist in `AuthButton.tsx` and `MobileUserSheet.tsx`.

5. **Form Validation & UX** — Client-side validation for required fields. Loading state on submit button. Error toast on failure. Disable form during submission to prevent double-submit.

## Tasks / Subtasks

- [x] Task 1: Create GitHub Issues API Route Handler (AC: 3)
  - [x] Create `app/api/github/create-issue/route.ts`
  - [x] Validate request body (title, body, labels)
  - [x] Call GitHub API with server-side `GITHUB_TOKEN`
  - [x] Handle errors (rate limit, auth, validation)
  - [x] Add env vars: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` to `.env.local` / `.env.example`

- [x] Task 2: Build Contact Page (AC: 1, 5)
  - [x] Replace stub in `app/contact/page.tsx` with full form
  - [x] Form fields: name (text), email (email), message (textarea) — all required
  - [x] Client-side validation (required check, email format)
  - [x] Submit handler → `POST /api/github/create-issue` with label `contact`
  - [x] GitHub issue body: formatted markdown with name, email, message
  - [x] Loading/disabled state during submission
  - [x] Success toast (Sonner): "ההודעה נשלחה בהצלחה ✓"
  - [x] Error toast on failure
  - [x] Reset form on success

- [x] Task 3: Build Bug Report Page (AC: 2, 5)
  - [x] Replace stub in `app/report-bug/page.tsx` with full form
  - [x] Form fields: description (required), steps (optional), expected (optional), screenshot (text field "תאר מה אתה רואה" per dev notes recommendation)
  - [x] Auto-collect metadata: `navigator.userAgent`, `screen.width×height`, `window.location.href`, dark/light mode, active theme, editor content length from localStorage
  - [x] Submit handler → `POST /api/github/create-issue` with label `bug`
  - [x] GitHub issue body: structured markdown with all fields + metadata section
  - [x] Screenshot: skipped file upload for MVP, added text field "תאר מה אתה רואה" (per dev notes recommended approach)
  - [x] Loading/disabled/success/error states same as contact

- [x] Task 4: Write Tests (AC: 1-5)
  - [x] `app/api/github/create-issue/route.test.ts` — 13 tests: route handler (mock fetch to GitHub)
  - [x] `app/contact/page.test.tsx` — 10 tests: form rendering, validation, submission, success/error states
  - [x] `app/report-bug/page.test.tsx` — 13 tests: form rendering, metadata collection, submission, success/error states

## Dev Notes

### Architecture Patterns & Constraints

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript strict mode.

**GitHub API Integration — CRITICAL:**
- The GitHub token MUST stay server-side. Create a Next.js Route Handler at `app/api/github/create-issue/route.ts`.
- Client forms POST to `/api/github/create-issue`, the route handler proxies to `https://api.github.com/repos/{owner}/{repo}/issues`.
- Required headers for GitHub API:
  ```
  Authorization: Bearer ${GITHUB_TOKEN}
  Accept: application/vnd.github+json
  X-GitHub-Api-Version: 2022-11-28
  Content-Type: application/json
  ```
- Request body: `{ title: string, body: string, labels: string[] }`
- Response: `201 Created` with `{ number, html_url }` — return only `issueNumber` and `issueUrl` to client.
- Handle 403 rate limit (return 429), 401 auth error, 422 validation error.
- Env vars: `GITHUB_TOKEN` (fine-grained PAT with `Issues: Read and write` scope), `GITHUB_OWNER`, `GITHUB_REPO`.
- Labels `contact` and `bug` must exist on the repo. Document this in the PR.

**Screenshot Upload Decision:**
- GitHub Issues API does NOT support direct file attachments.
- **Recommended approach:** Skip file upload for v1. Replace the file upload field with a text field "תאר מה אתה רואה" (Describe what you see). This avoids complexity of Convex file storage + URL embedding. Can be added in a future story.
- **Alternative (if owner insists):** Upload to Convex file storage (`storage.generateUploadUrl()` + `storage.getUrl()`), embed the serving URL as `![screenshot](url)` in the GitHub issue markdown body.

**No rate limiting on the proxy route for v1** — the app has low traffic. Add rate limiting in a future story if needed.

### Page Layout Pattern — Follow Settings Page

Both pages MUST follow the exact same layout pattern as `app/settings/page.tsx`:

```tsx
"use client";

export default function ContactPage() {
  return (
    <main dir="rtl" lang="he" className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back link */}
        <Link href="/editor" className="inline-flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-foreground">
          <ArrowRight className="size-4" />
          חזרה לעורך
        </Link>

        <h1 className="text-2xl font-bold text-foreground">צור קשר</h1>

        {/* Form section */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          {/* Form fields */}
        </section>
      </div>
    </main>
  );
}
```

### Form Field Styling — Use Existing Patterns

- Use `<input>` and `<textarea>` styled with Tailwind (no shadcn Input component needed, but can use if preferred).
- Pattern from existing code:
  ```tsx
  <input
    type="text"
    required
    dir="auto"
    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
  />
  ```
- Labels: `<label className="block text-sm font-medium text-foreground mb-1.5">שם</label>`
- Required indicator: add `*` or `(חובה)` next to required field labels.
- Textarea: same styling, add `rows={4}` for description, `rows={3}` for steps.

### Submit Button — Use Existing Button Component

```tsx
import { Button } from "@/components/ui/button";

<Button
  type="submit"
  disabled={isSubmitting}
  className="w-full"
>
  {isSubmitting ? "שולח..." : "שלח הודעה"}
</Button>
```

### Toast Notifications — Sonner

```tsx
import { toast } from "sonner";

// Success
toast.success("ההודעה נשלחה בהצלחה ✓");

// Error
toast.error("שגיאה בשליחת ההודעה. נסה שוב.");
```

Toaster is already configured in root layout: `<Toaster dir="rtl" position="bottom-center" duration={3000} />`

### Auto-Collected Metadata (Bug Report Only)

Collect this data client-side, do NOT show to user, attach as a collapsible section in the GitHub issue body:

```tsx
const metadata = {
  browser: navigator.userAgent,
  os: navigator.platform,
  screenSize: `${screen.width}×${screen.height}`,
  windowSize: `${window.innerWidth}×${window.innerHeight}`,
  url: window.location.href,
  darkMode: document.documentElement.classList.contains("dark"),
  theme: localStorage.getItem("marko-v2-active-theme") || "default",
  editorContentLength: (localStorage.getItem("marko-v2-editor-content") || "").length,
  timestamp: new Date().toISOString(),
};
```

Format in GitHub issue as:

```markdown
<details>
<summary>Environment Details</summary>

| Property | Value |
|----------|-------|
| Browser | ${metadata.browser} |
| OS | ${metadata.os} |
| Screen | ${metadata.screenSize} |
| Window | ${metadata.windowSize} |
| URL | ${metadata.url} |
| Dark Mode | ${metadata.darkMode} |
| Theme | ${metadata.theme} |
| Content Length | ${metadata.editorContentLength} chars |
| Timestamp | ${metadata.timestamp} |

</details>
```

### GitHub Issue Body Templates

**Contact Issue:**
```markdown
## Contact Message

**From:** ${name}
**Email:** ${email}

---

${message}
```

**Bug Report Issue:**
```markdown
## Bug Report

### תיאור הבעיה (Description)
${description}

### צעדים לשחזור (Steps to Reproduce)
${steps || "לא צוין"}

### מה ציפית שיקרה (Expected Behavior)
${expected || "לא צוין"}

<details>
<summary>Environment Details</summary>

| Property | Value |
|----------|-------|
| ... metadata table ... |

</details>
```

### Icons — Lucide React

- Contact page: `Phone` icon (already used in nav menu)
- Bug report page: `Bug` icon (already used in nav menu)
- Back arrow: `ArrowRight` (RTL → arrow points left visually)
- Submit: `Send` icon optional

### Navigation — ALREADY DONE

Links to `/contact` and `/report-bug` already exist in:
- `components/auth/AuthButton.tsx` — desktop user menu dropdown
- `components/auth/MobileUserSheet.tsx` — mobile navigation

No changes needed to navigation components.

### RTL & Hebrew — CRITICAL

- ALL UI text in Hebrew (hardcoded, no i18n library)
- `dir="rtl" lang="he"` on `<main>` element
- Use logical CSS properties: `ps-`, `pe-`, `ms-`, `me-` (NOT `pl-`, `pr-`)
- `dir="auto"` on user input fields (they may type in English)
- ArrowRight icon for "back" (visually points left in RTL)

### Project Structure Notes

**Files to create:**
- `app/api/github/create-issue/route.ts` — NEW Route Handler
- `app/api/github/create-issue/route.test.ts` — NEW tests

**Files to modify (replace stubs):**
- `app/contact/page.tsx` — replace stub with full form
- `app/report-bug/page.tsx` — replace stub with full form

**Files to create (tests):**
- `app/contact/page.test.tsx` — NEW
- `app/report-bug/page.test.tsx` — NEW

**Files to update:**
- `.env.example` — add `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`

**Existing files — DO NOT MODIFY:**
- `components/auth/AuthButton.tsx` — nav links already correct
- `components/auth/MobileUserSheet.tsx` — nav links already correct

### Testing Standards

**Framework:** Vitest with co-located `.test.tsx` / `.test.ts` files.

**Route Handler Tests (`route.test.ts`):**
- Mock global `fetch` to simulate GitHub API responses
- Test successful issue creation (201)
- Test missing required fields (400)
- Test GitHub API error (502)
- Test rate limit handling (429)
- Test missing env vars (500)

**Page Tests (`page.test.tsx`):**
- Mock `fetch` for `/api/github/create-issue`
- Mock `sonner` toast functions
- Test form renders with correct fields and labels
- Test required field validation (submit with empty fields)
- Test successful submission flow (loading state → success toast → form reset)
- Test error handling (error toast)
- Test metadata collection (bug report only)
- Use `act()` wrapper for state updates
- Structure: describe blocks grouped by AC number

**Mock patterns from previous stories:**
```tsx
// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();
```

### Previous Story Intelligence

**From Story 14.1 (Skip Landing):**
- `try/catch` all localStorage access for Safari strict privacy mode
- Use `useRef` guards to prevent `useEffect` re-trigger loops
- Client component pattern: `"use client"` at top

**From Story 14.2 (Settings Page):**
- Page layout: `min-h-screen bg-[var(--background)] p-6` + `max-w-2xl mx-auto`
- Section cards: `rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5`
- Back link pattern: `ArrowRight` icon + "חזרה לעורך" text
- Test utilities pattern: see `app/settings/test-utils.ts` for reference
- Total test count at 892 — maintain zero regressions

**From Git History:**
- Recent commits follow pattern: "Story X.Y done: Description + code review fixes"
- All stories pass full test suite before marking done

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-14, lines 1528-1551]
- [Source: _bmad-output/benakiva-feedback-round1.md#N6]
- [Source: _bmad-output/planning-artifacts/architecture.md — API patterns, testing standards]
- [Source: app/settings/page.tsx — page layout reference]
- [Source: components/auth/AuthButton.tsx — existing navigation links]
- GitHub REST API: POST /repos/{owner}/{repo}/issues — requires fine-grained PAT with `Issues: Read and write`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No debug issues encountered. All tests passed on first run.

### Completion Notes List

- Task 1: Created Next.js Route Handler at `app/api/github/create-issue/route.ts` that proxies form submissions to GitHub Issues API. Server-side token handling, proper error mapping (403→429, 401→502, 422→400). Added env vars to `.env.example`.
- Task 2: Replaced contact page stub with full RTL form (name/email/message). Follows settings page layout pattern. Sonner toasts for success/error. Form disables during submission and resets on success.
- Task 3: Replaced bug report page stub with structured form (description required, steps/expected/visual-description optional). Auto-collects browser metadata (UA, OS, screen, theme, etc.) and embeds as collapsible `<details>` section in GitHub issue. Used text field instead of file upload per dev notes recommendation.
- Task 4: 36 new tests — 13 route handler tests (success, validation, error handling, env vars), 10 contact page tests (rendering, submission, loading states), 13 bug report page tests (rendering, metadata, optional fields, submission states).
- Full test suite: 930 tests passing across 87 files, zero regressions.

### Change Log

- 2026-03-25: Story 14.3 implementation complete — contact form, bug report form, GitHub Issues API route, 36 tests

### File List

**New files:**
- `app/api/github/create-issue/route.ts` — Next.js Route Handler for GitHub Issues API proxy
- `app/api/github/create-issue/route.test.ts` — 13 route handler tests
- `app/contact/page.test.tsx` — 10 contact page tests
- `app/report-bug/page.test.tsx` — 13 bug report page tests

**Modified files:**
- `app/contact/page.tsx` — replaced stub with full contact form
- `app/report-bug/page.tsx` — replaced stub with full bug report form
- `.env.example` — added GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
