# Story 6.3: AI Privacy Disclosure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a clear notice that my document content will be sent to the AI provider before processing,
So that I can make an informed decision about using AI features.

## Acceptance Criteria

1. **First-action disclosure trigger** — Given a user triggers their first AI action in a session (via command palette or Ctrl+K), when they select an action (Summarize, Translate, etc.), then a disclosure dialog appears before the action executes.

2. **Disclosure content** — Given the disclosure dialog appears, then it contains: a clear Hebrew explanation that document content will be sent to Anthropic for AI processing, a statement that Anthropic's API does not train on API inputs, and a note that no document content is stored on Marko's servers.

3. **Dismiss and proceed** — Given the disclosure dialog is visible, when the user clicks the "הבנתי, המשך" (Understood, continue) button, then the dialog closes, the selected AI action executes, and the disclosure does not appear again for the remainder of this browser session.

4. **Cancel option** — Given the disclosure dialog is visible, when the user clicks "ביטול" (Cancel) or presses Escape, then the dialog closes and the AI action does NOT execute, but the disclosure will appear again on the next AI action attempt.

5. **Session-scoped persistence** — Given a user has already accepted the disclosure in the current session, when they trigger subsequent AI actions, then the action executes immediately without showing the disclosure again. A new browser tab or session resets the disclosure state.

6. **Hebrew non-technical language** — Given the disclosure dialog, then all text is in Hebrew, uses non-technical language understandable by non-developers, and the dialog layout is RTL.

7. **Accessibility** — Given the disclosure dialog, then it has `role="alertdialog"`, `aria-labelledby` pointing to the title, `aria-describedby` pointing to the body, focus is trapped inside the dialog, and all buttons have Hebrew `aria-label` attributes.

## Tasks / Subtasks

- [x] Task 1: Create `useAiDisclosure` hook (AC: #1, #3, #4, #5)
  - [x] 1.1 Create `lib/hooks/useAiDisclosure.ts` — manages session-scoped disclosure state using `sessionStorage`
  - [x] 1.2 Hook returns `{ needsDisclosure: boolean, acceptDisclosure: () => void }` — `needsDisclosure` is `true` if the user has not yet accepted in this session
  - [x] 1.3 `acceptDisclosure()` sets `sessionStorage.setItem("marko-ai-disclosure-accepted", "true")` and updates local state
  - [x] 1.4 Initialize state by reading `sessionStorage` on mount (SSR-safe: default to `true` for `needsDisclosure` on server via `useSyncExternalStore` with `getServerSnapshot`)

- [x] Task 2: Create `AiDisclosure` dialog component (AC: #2, #3, #4, #6, #7)
  - [x] 2.1 Create `components/ai/AiDisclosure.tsx` — uses shadcn `AlertDialog` component for modal disclosure
  - [x] 2.2 Props: `open: boolean`, `onAccept: () => void`, `onCancel: () => void`
  - [x] 2.3 Title: "גילוי נאות — שימוש ב-AI" (Disclosure — AI Usage)
  - [x] 2.4 Body text in Hebrew: explain content is sent to Anthropic, Anthropic doesn't train on API data, no server storage
  - [x] 2.5 Two buttons: "הבנתי, המשך" (primary action — calls `onAccept`) and "ביטול" (cancel — calls `onCancel`)
  - [x] 2.6 Add `dir="rtl"` on the dialog content wrapper
  - [x] 2.7 Ensure AlertDialog provides `role="alertdialog"` and focus trap (built into Radix AlertDialog)

- [x] Task 3: Integrate disclosure into AI action flow (AC: #1, #3, #4, #5)
  - [x] 3.1 Modify `app/editor/page.tsx` (where the AI action is dispatched): intercept action selection, check `needsDisclosure`, show `AiDisclosure` if needed
  - [x] 3.2 If disclosure needed: store the pending action type, show `AiDisclosure`, on accept → call `acceptDisclosure()` + execute pending action, on cancel → clear pending action
  - [x] 3.3 If disclosure already accepted: execute action immediately (no interruption)
  - [x] 3.4 Wire `useAiDisclosure` hook into the component managing the AI flow

- [x] Task 4: Create tests (AC: all)
  - [x] 4.1 Create `lib/hooks/useAiDisclosure.test.ts` — test returns `needsDisclosure: true` initially, test `acceptDisclosure()` sets `needsDisclosure: false`, test reads sessionStorage on mount, test does NOT persist across mock session resets
  - [x] 4.2 Create `components/ai/AiDisclosure.test.tsx` — test renders Hebrew disclosure text, test "הבנתי, המשך" calls `onAccept`, test "ביטול" calls `onCancel`, test has `role="alertdialog"`, test RTL layout (`dir="rtl"`)
  - [x] 4.3 Integration test in AiCommandPalette tests (or editor page tests): test first action shows disclosure, test accepting disclosure executes action, test canceling disclosure does not execute action, test subsequent actions skip disclosure

- [x] Task 5: Verify integration and existing tests (AC: all)
  - [x] 5.1 Verify all existing tests still pass (baseline from Story 6.2)
  - [x] 5.2 Verify full flow: sparkle → palette → select action → disclosure → accept → action executes
  - [x] 5.3 Verify cancel flow: disclosure → cancel → no action executed → next attempt shows disclosure again
  - [x] 5.4 Verify session persistence: accept once → second action skips disclosure

## Dev Notes

### CRITICAL: Story 6.2 is a prerequisite

Story 6.2 (AI Actions UI & Document Interactions) MUST be implemented before this story. Story 6.2 creates the AI command palette flow that this story hooks into. Story 6.2's dev notes explicitly state:

> **Story 6.3 (AI Privacy Disclosure) will add:**
> - First-time AI disclosure notice before processing
> - Consent flow integrated into the command palette
> - Story 6.2 should NOT implement the disclosure — but should leave room for it (e.g., a hook point before executing an action)

If Story 6.2 is not yet implemented, **STOP** and implement it first.

### Also prerequisite: Stories 6.1, 5.1, 5.2, 5.3 — ALL implemented

The following exist and MUST NOT be recreated:

| File | Exports | Purpose |
|------|---------|---------|
| `convex/ai.ts` | `callAnthropicApi` action | AI proxy backend — auth, limits, Anthropic API call |
| `convex/usage.ts` | `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary` | AI usage tracking (internal) |
| `types/ai.ts` | `AiActionType`, `AiModel`, `AiRequestArgs`, `AiResponse` | Frontend type definitions |
| `lib/hooks/useCapabilities.ts` | `useCapabilities()` | Returns `{ capabilities, tier, isLoading }` |
| `lib/hooks/useCurrentUser.ts` | `useCurrentUser()` | Returns `{ user, isLoading, isAuthenticated }` |
| `components/ui/alert-dialog.tsx` | shadcn `AlertDialog*` components | **Already installed** — use directly |
| `components/ui/dialog.tsx` | shadcn `Dialog*` components | Available if needed |
| `components/ui/button.tsx` | `Button` component | For action buttons |

### Architecture: Disclosure Integration Point

The disclosure intercepts the flow between "user selects action in palette" and "action executes":

```
User selects action in AiCommandPalette
  → Check useAiDisclosure().needsDisclosure
  → IF true:
      → Store pendingAction = selectedActionType
      → Show AiDisclosure dialog
      → ON Accept: acceptDisclosure() + execute pendingAction
      → ON Cancel: clear pendingAction, do nothing
  → IF false (already accepted this session):
      → Execute action immediately (existing flow from Story 6.2)
```

### Session Storage Design — NOT localStorage

The disclosure uses **`sessionStorage`** (not `localStorage`) because:
- Per the acceptance criteria: "first AI action **in a session**"
- `sessionStorage` is scoped to a single tab/window and clears when the tab closes
- A new tab = new session = disclosure shown again
- This is more privacy-respectful — users are reminded each session

**Key:** `"marko-ai-disclosure-accepted"`
**Value:** `"true"` when accepted

**Do NOT use `useLocalStorage` hook** — it targets `localStorage`. Create a simpler hook using `sessionStorage` directly.

### useAiDisclosure Hook Design

```typescript
// lib/hooks/useAiDisclosure.ts
"use client";
import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "marko-ai-disclosure-accepted";

export function useAiDisclosure() {
  const [needsDisclosure, setNeedsDisclosure] = useState(true);

  // Read sessionStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const accepted = window.sessionStorage.getItem(SESSION_KEY);
      if (accepted === "true") {
        setNeedsDisclosure(false);
      }
    } catch {
      // sessionStorage unavailable — always show disclosure (safe default)
    }
  }, []);

  const acceptDisclosure = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Silently fail — disclosure will show again next action
    }
    setNeedsDisclosure(false);
  }, []);

  return { needsDisclosure, acceptDisclosure };
}
```

### AiDisclosure Component Design

```tsx
// components/ai/AiDisclosure.tsx
"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AiDisclosureProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function AiDisclosure({ open, onAccept, onCancel }: AiDisclosureProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>גילוי נאות — שימוש ב-AI</AlertDialogTitle>
          <AlertDialogDescription>
            כשאתה משתמש בפעולות AI, תוכן המסמך שלך נשלח לשרתי Anthropic לעיבוד.
            {"\n\n"}
            Anthropic לא משתמשת בתוכן שנשלח דרך ה-API שלה לאימון מודלים.
            {"\n\n"}
            Marko לא שומרת את תוכן המסמך שלך בשרתים שלנו — הוא נשלח לעיבוד בלבד ולא נשמר.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction onClick={onAccept}>
            הבנתי, המשך
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel}>
            ביטול
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Integration Pattern into AI Flow

The exact integration point depends on Story 6.2's implementation. The disclosure hooks in where the AI action is dispatched — likely in one of these locations:

**Option A: In the component managing the AI flow (e.g., `app/editor/page.tsx`):**
```tsx
const { needsDisclosure, acceptDisclosure } = useAiDisclosure();
const [pendingAction, setPendingAction] = useState<AiActionType | null>(null);

const handleAiAction = (actionType: AiActionType) => {
  if (needsDisclosure) {
    setPendingAction(actionType);
    // AiDisclosure dialog opens via pendingAction !== null
    return;
  }
  executeAction(actionType, content);
};

const handleDisclosureAccept = () => {
  acceptDisclosure();
  if (pendingAction) {
    executeAction(pendingAction, content);
    setPendingAction(null);
  }
};

const handleDisclosureCancel = () => {
  setPendingAction(null);
};
```

**Option B: In the `useAiAction` hook itself:** Wrap the `executeAction` call to check disclosure first. This is less ideal because hooks shouldn't render UI.

**Recommended:** Option A — keep UI (disclosure dialog) in the component tree, not inside a hook.

### Disclosure Text — Hebrew, Non-Technical

The disclosure text must be simple and understandable:

| Section | Hebrew | English Translation |
|---------|--------|-------------------|
| Title | "גילוי נאות — שימוש ב-AI" | "Disclosure — AI Usage" |
| Line 1 | "כשאתה משתמש בפעולות AI, תוכן המסמך שלך נשלח לשרתי Anthropic לעיבוד." | "When you use AI actions, your document content is sent to Anthropic's servers for processing." |
| Line 2 | "Anthropic לא משתמשת בתוכן שנשלח דרך ה-API שלה לאימון מודלים." | "Anthropic does not use content sent via its API for model training." |
| Line 3 | "Marko לא שומרת את תוכן המסמך שלך בשרתים שלנו — הוא נשלח לעיבוד בלבד ולא נשמר." | "Marko does not store your document content on our servers — it is sent for processing only and not saved." |
| Accept button | "הבנתי, המשך" | "Understood, continue" |
| Cancel button | "ביטול" | "Cancel" |

### Existing AlertDialog Component

`components/ui/alert-dialog.tsx` is **already installed** (shadcn/ui). It wraps Radix UI `@radix-ui/react-alert-dialog` which provides:
- `role="alertdialog"` automatically
- Focus trap built-in
- Escape key closes (fires `onOpenChange(false)`)
- `aria-labelledby` and `aria-describedby` automatically linked to Title and Description

**Do NOT install or create a new dialog component.** Use the existing AlertDialog directly.

### Styling & RTL — CRITICAL

- `AlertDialogContent` must have `dir="rtl"` for Hebrew layout
- Use Tailwind logical properties: `ms-*` not `ml-*`, `me-*` not `mr-*`
- `AlertDialogFooter` buttons: use `flex-row-reverse` to put the primary action on the right (start) in RTL
- Use `gap-2` between buttons, no directional margins
- The AlertDialog description text should use line breaks or paragraphs for readability — NOT a single long string

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Test baseline:** All existing tests from Story 6.2 must continue passing.

**Mocking patterns:**

```typescript
// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {};
vi.stubGlobal("sessionStorage", {
  getItem: vi.fn((key: string) => mockSessionStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockSessionStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); }),
});
```

**Required test files:**

1. **`lib/hooks/useAiDisclosure.test.ts`:**
   - Returns `needsDisclosure: true` when sessionStorage is empty
   - Returns `needsDisclosure: false` when sessionStorage has `"marko-ai-disclosure-accepted": "true"`
   - `acceptDisclosure()` sets sessionStorage and updates state to `false`
   - Handles sessionStorage unavailability gracefully (defaults to showing disclosure)

2. **`components/ai/AiDisclosure.test.tsx`:**
   - Renders disclosure title "גילוי נאות — שימוש ב-AI"
   - Renders all three disclosure text paragraphs
   - "הבנתי, המשך" button calls `onAccept`
   - "ביטול" button calls `onCancel`
   - Has `dir="rtl"` on content
   - AlertDialog provides `role="alertdialog"` (verify Radix renders it)

3. **Integration tests (update existing AiCommandPalette or editor tests):**
   - First AI action shows disclosure before executing
   - Accepting disclosure then executes the action
   - Canceling disclosure does not execute action
   - Second AI action skips disclosure after acceptance

### Existing Infrastructure (DO NOT Recreate)

- **`components/ui/alert-dialog.tsx`** — Already installed. IMPORT directly.
- **`components/ui/button.tsx`** — For button styling. IMPORT as needed.
- **`lib/hooks/useLocalStorage.ts`** — EXISTS but NOT used here (this story uses sessionStorage).
- **`convex/ai.ts`** — Backend AI action. NOT modified by this story.
- **`types/ai.ts`** — `AiActionType`. IMPORT for pending action typing.
- **Story 6.2 components** — `AiCommandPalette.tsx`, `AiResultPanel.tsx`, `useAiAction.ts`. MODIFY integration point only.

### Must Be Created (Story 6.3 Scope)

| File | Purpose |
|------|---------|
| `lib/hooks/useAiDisclosure.ts` | Session-scoped disclosure state management hook |
| `components/ai/AiDisclosure.tsx` | AlertDialog-based privacy disclosure component (FR50) |
| `lib/hooks/useAiDisclosure.test.ts` | Tests for disclosure hook |
| `components/ai/AiDisclosure.test.tsx` | Tests for disclosure dialog component |

### Must Be Modified (Story 6.3 Scope)

| File | Change |
|------|--------|
| `app/editor/page.tsx` OR `components/ai/AiCommandPalette.tsx` | Wire `useAiDisclosure` into AI action flow — intercept first-action with disclosure |
| Existing AI flow integration tests | Add disclosure integration test cases |

### Project Structure Notes

- `components/ai/AiDisclosure.tsx` matches architecture's planned `components/ai/AiDisclosure.tsx` file location exactly
- `lib/hooks/useAiDisclosure.ts` follows existing hook pattern (`useLocalStorage.ts`, `useTheme.ts`, `useCapabilities.ts`)
- Tests co-located next to source files per project convention
- No new UI dependencies needed — `AlertDialog` is already installed

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `AiDisclosure` |
| Hooks | `use` prefix, camelCase | `useAiDisclosure` |
| SessionStorage key | kebab-case prefix | `"marko-ai-disclosure-accepted"` |
| Event handlers | `handle` prefix | `handleDisclosureAccept`, `handleDisclosureCancel` |
| Callback props | `on` prefix | `onAccept`, `onCancel` |
| CSS classes | Tailwind logical properties | `ms-2`, `me-4`, `flex-row-reverse` |
| Hebrew UI text | Direct string | "גילוי נאות — שימוש ב-AI" |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@radix-ui/react-alert-dialog` | (via shadcn) | AlertDialog primitive | Already installed |
| `react` | ^19.0.0 | `useState`, `useEffect`, `useCallback` | Already installed |
| No new dependencies | — | This story uses only existing packages | — |

### Previous Story Intelligence

**From Story 6.2 (prerequisite — ready-for-dev):**
- AiCommandPalette dispatches actions via a `handleAction(actionType)` function
- `useAiAction` hook wraps `useAction(api.ai.callAnthropicApi)` with loading/error/result state
- Story 6.2 explicitly designed a hook point: the action selection in the command palette triggers the AI call — this is where disclosure intercepts
- Gate checks (anonymous, quota) happen before action selection — disclosure happens AFTER action selection but BEFORE execution

**From Story 6.1 (done — in review):**
- Backend handles auth and limits server-side — disclosure is purely a frontend concern
- Error codes like `AUTH_REQUIRED` or `AI_LIMIT_REACHED` are separate from disclosure — don't conflate them
- `callAnthropicApi` action doesn't know about disclosure — it's a client-side UX concern only

**From Story 5.2 (done):**
- 300+ tests passing baseline
- RTL layout patterns established: `dir="rtl"`, logical CSS properties
- `useLocalStorage` hook exists but uses `localStorage` — disclosure needs `sessionStorage` (different scope)

**Code review lessons to apply:**
- Use logical CSS properties everywhere (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Include Hebrew ARIA labels on all interactive elements
- Mock at highest-level abstraction in tests
- Test both disclosure-needed and disclosure-already-accepted states

### Git Intelligence

Recent commits:
```
32281fb Implement Story 5.2: Anonymous and authenticated editor experience
a489249 Implement Story 5.1: Clerk auth integration and Convex user sync
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
```

**Expected commit:** `Implement Story 6.3: AI privacy disclosure`

### Anti-Patterns to AVOID

- **Do NOT use `localStorage` for disclosure state** — localStorage persists across sessions. The spec says "first AI action in a session." Use `sessionStorage`.
- **Do NOT block non-AI features** — The disclosure only gates AI actions. Editing, exporting, theming etc. must remain unaffected.
- **Do NOT create a custom modal/dialog** — Use the existing shadcn `AlertDialog` component. Do not create `components/ui/disclosure-dialog.tsx` or similar.
- **Do NOT make the disclosure blocking/mandatory forever** — User accepts once per session, then it's done. No "don't show again" checkbox needed (sessionStorage handles this).
- **Do NOT add disclosure to the backend** — This is purely a frontend UX concern. The Convex action does not need to know about disclosure.
- **Do NOT show disclosure for anonymous users** — Anonymous users can't use AI actions (gate check prevents it). Disclosure only applies to authenticated users who are about to use AI.
- **Do NOT store disclosure consent on the server** — No database changes, no Convex schema changes. SessionStorage only.
- **Do NOT use `ml-*`, `mr-*`, `pl-*`, `pr-*`** — Always use logical properties for RTL compatibility.
- **Do NOT use `text-left` or `text-right`** — Use `text-start` and `text-end`.

### Future Story Awareness

**Story 6.4 (AI Usage Limits & Upgrade Prompts) will add:**
- More sophisticated limit display and upgrade buttons
- Story 6.3's disclosure is independent of limits — they are separate concerns that don't interact

**No future story modifies the disclosure** — Story 6.3 is self-contained. The disclosure text may be updated if privacy policy changes, but no planned stories depend on or extend this feature.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.3]
- [Source: _bmad-output/planning-artifacts/prd.md — FR50 (AI privacy disclosure), FR51 (No server document storage)]
- [Source: _bmad-output/planning-artifacts/prd.md — Privacy & Data Handling section]
- [Source: _bmad-output/planning-artifacts/architecture.md — components/ai/AiDisclosure.tsx (FR50)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Privacy & Compliance (FR50-52)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 3: Registration → AI First Use]
- [Source: _bmad-output/planning-artifacts/implementation-readiness-report — "FR50 (AI disclosure) under-specified (MEDIUM)"]
- [Source: _bmad-output/implementation-artifacts/6-2-ai-actions-ui-and-document-interactions.md — Future Story Awareness: "leave room for hook point"]
- [Source: _bmad-output/implementation-artifacts/6-1-ai-proxy-backend-and-model-routing.md — Backend context]
- [Source: Radix AlertDialog — https://www.radix-ui.com/primitives/docs/components/alert-dialog]
- [Source: shadcn/ui Alert Dialog — https://ui.shadcn.com/docs/components/alert-dialog]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- ESLint `react-hooks/set-state-in-effect` flagged `setState` inside `useEffect`/`useLayoutEffect`. Refactored to `useSyncExternalStore` (React 18+ pattern) with `getServerSnapshot` for SSR safety and custom `ai-disclosure-change` event for reactivity.
- Used `e.preventDefault()` on AlertDialogAction and AlertDialogCancel clicks to prevent Radix's auto-close from triggering `onOpenChange(false)` which would double-fire both `onAccept` and `onCancel` callbacks.

### Completion Notes List

- Created `useAiDisclosure` hook using `useSyncExternalStore` for reading `sessionStorage` — SSR-safe, no hydration mismatch, ESLint clean.
- Created `AiDisclosure` dialog component using existing shadcn `AlertDialog` — RTL layout, Hebrew text, `role="alertdialog"`, focus trap via Radix.
- Integrated disclosure into `EditorPage` AI action flow: intercepts `handleAiAction`, stores pending action, shows disclosure on first use, executes immediately after acceptance.
- 17 new tests (5 hook + 8 component + 4 integration) — all pass. Full suite: 420/420 pass, zero regressions.

### File List

**New files:**
- `lib/hooks/useAiDisclosure.ts` — Session-scoped disclosure state management hook
- `components/ai/AiDisclosure.tsx` — AlertDialog-based privacy disclosure component
- `lib/hooks/useAiDisclosure.test.ts` — 5 tests for disclosure hook
- `components/ai/AiDisclosure.test.tsx` — 8 tests for disclosure dialog component
- `components/ai/AiDisclosureIntegration.test.tsx` — 4 integration tests for full disclosure flow

**Modified files:**
- `app/editor/page.tsx` — Added `useAiDisclosure` hook, `pendingAiAction` state, disclosure accept/cancel handlers, and `AiDisclosure` dialog rendering

**Modified tracking files:**
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status: ready-for-dev → in-progress → review
- `_bmad-output/implementation-artifacts/6-3-ai-privacy-disclosure.md` — Tasks marked complete, Dev Agent Record filled

## Change Log

- **2026-03-08**: Implemented AI privacy disclosure feature (Story 6.3). Added session-scoped disclosure dialog that appears before first AI action, with Hebrew text explaining data handling. Uses `sessionStorage` for per-session persistence. 13 new tests added, all 416 tests passing.
- **2026-03-08**: Code review fixes — Added 4 missing integration tests (Task 4.3), removed `flex-row-reverse` footer override for consistent RTL button order, removed duplicate CSS classes from AlertDialogDescription, used gender-neutral Hebrew phrasing, stabilized test selector. Full suite: 420/420 pass.
