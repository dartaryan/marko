# Story 6.2: AI Actions UI & Document Interactions

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a registered user,
I want to summarize, translate, extract action items, and improve my document using AI,
So that I can quickly get value from my content without manual effort.

## Acceptance Criteria

1. **AI entry point in toolbar** — Given the editor is loaded, then a sparkle icon button (28x28px, primary/green color) appears after the last toolbar separator group with tooltip "שאל את מארקו AI (Ctrl+K)".

2. **Command palette opens** — Given a registered user clicks the sparkle icon OR presses Ctrl+K / Cmd+K, then a cmdk `CommandDialog` opens with RTL layout and Hebrew action labels for: "סכם את המסמך" (Summarize), "תרגם לאנגלית" (Translate to English), "חלץ משימות" (Extract action items), "שפר ניסוח" (Improve writing).

3. **Anonymous gate check** — Given an anonymous user opens the command palette, then AI actions are disabled with an inline prompt "הירשם בחינם כדי להשתמש ב-AI" (Register free to use AI) and a link to sign up.

4. **Free user quota gate** — Given a free user who has exhausted their monthly AI limit opens the command palette, then AI actions appear dimmed/disabled with a gate section at bottom: "ניצלת את כל פעולות ה-AI החינמיות החודש. שדרג לגישה בלתי מוגבלת ל-AI." No toolbar banner, no modal — limit communicated contextually inside the palette only.

5. **Summarize action** — Given a registered user selects "Summarize", then the palette closes, a loading indicator with Hebrew text ("...מעבד") appears in the preview area, the backend `callAnthropicApi` is called with `actionType: "summarize"`, and the AI result appears in an AIResultPanel with accept/dismiss/copy buttons.

6. **Translate action** — Given a registered user selects "Translate", then the AI translates the document between Hebrew and English and displays the result in the AIResultPanel.

7. **Extract action items** — Given a registered user selects "Extract Action Items", then a structured bullet-point task list is generated and displayed in the AIResultPanel.

8. **Improve writing** — Given a registered user selects "Improve Writing", then grammar, style, and clarity suggestions are returned in the AIResultPanel.

9. **AIResultPanel display** — Given an AI action completes, then the result appears in a dedicated panel with `role="complementary"`, `aria-label="תוצאת AI"`, containing: rendered Markdown output, an Accept button (inserts into editor), a Dismiss button (removes panel), and a Copy button. The panel has a loading skeleton state matching expected output shape.

10. **Loading and feedback** — Given an AI action is processing, then: a skeleton shimmer loading state appears, Sonnet responses return in under 10 seconds, and on completion a toast appears: "AI סיים לעבד" (AI finished processing).

11. **Error handling** — Given the AI API returns an error, then the error is displayed as a Hebrew toast message using the error codes from the backend (`AI_UNAVAILABLE`, `AI_INPUT_EMPTY`, `AI_LIMIT_REACHED`, `AI_CONFIG_ERROR`). If AI is unavailable, a Hebrew banner says "AI לא זמין כרגע" with all non-AI features unaffected.

12. **Keyboard accessibility** — Given the command palette is open, then arrow keys navigate actions, Enter selects, Escape closes, and all action buttons have Hebrew ARIA labels.

13. **Remaining quota display** — Given a free user with remaining AI calls opens the palette, then the remaining count is shown: "נותרו X פעולות AI" (X AI actions remaining).

## Tasks / Subtasks

- [ ] Task 1: Install cmdk dependency (AC: #2)
  - [ ] 1.1 Run `pnpm add cmdk` to install the command palette library
  - [ ] 1.2 Add shadcn/ui `Command` component: `npx shadcn@latest add command`

- [ ] Task 2: Create `useAiAction` hook (AC: #5, #6, #7, #8, #10, #11)
  - [ ] 2.1 Create `lib/hooks/useAiAction.ts` — wraps `useAction(api.ai.callAnthropicApi)` with loading/error/result state management
  - [ ] 2.2 Hook returns `{ executeAction, isLoading, result, error, clearResult }` — accepts `AiActionType` and document `content`
  - [ ] 2.3 Error handling: catch ConvexError, extract error code, map to Hebrew toast message using sonner
  - [ ] 2.4 Success handling: set result state, show success toast "AI סיים לעבד"
  - [ ] 2.5 Include `targetLanguage` passthrough for translate action

- [ ] Task 3: Create AI command palette component (AC: #2, #3, #4, #12, #13)
  - [ ] 3.1 Create `components/ai/AiCommandPalette.tsx` — uses cmdk `CommandDialog` with RTL layout
  - [ ] 3.2 List 4 AI actions with Hebrew labels and icons: Summarize (FileText), Translate (Languages), Extract Action Items (ListChecks), Improve Writing (Sparkles)
  - [ ] 3.3 Implement anonymous gate check: if `!isAuthenticated` from `useCurrentUser`, show inline register prompt with link to sign-in instead of action list
  - [ ] 3.4 Implement free user quota gate: if `useCapabilities` returns `canUseAi` but monthly count >= `maxMonthlyAiCalls`, dim actions and show upgrade gate section at bottom of palette
  - [ ] 3.5 Show remaining count for free users: query `getMonthlyUsageCount` via `useQuery` and display "נותרו X פעולות AI"
  - [ ] 3.6 Keyboard navigation: arrow keys, Enter selects, Escape closes (built into cmdk)
  - [ ] 3.7 Support `open` / `onOpenChange` controlled state from parent

- [ ] Task 4: Create AIResultPanel component (AC: #9, #10)
  - [ ] 4.1 Create `components/ai/AiResultPanel.tsx` — displays AI output with accept/dismiss/copy buttons
  - [ ] 4.2 Loading state: skeleton shimmer (3-4 lines for summary, bullet list shape for action items) with "...מעבד" text
  - [ ] 4.3 Result state: render AI response as Markdown using the existing `MarkdownRenderer` or a lightweight `dangerouslySetInnerHTML` with `marked.parse()`
  - [ ] 4.4 Accept button: inserts result text into the editor textarea at cursor or appends to document
  - [ ] 4.5 Dismiss button: clears the panel, original document preserved
  - [ ] 4.6 Copy button: copies result to clipboard using `navigator.clipboard.writeText()`
  - [ ] 4.7 Accessibility: `role="complementary"`, `aria-label="תוצאת AI"`, all buttons with Hebrew `aria-label`

- [ ] Task 5: Add sparkle icon to EditorToolbar (AC: #1)
  - [ ] 5.1 Modify `components/editor/EditorToolbar.tsx` — add AI sparkle button after last toolbar separator
  - [ ] 5.2 Use `lucide-react` `Sparkles` icon, 28x28px, primary/green color, matching existing button sizes
  - [ ] 5.3 Tooltip: "שאל את מארקו AI (Ctrl+K)"
  - [ ] 5.4 onClick opens the AiCommandPalette

- [ ] Task 6: Add Ctrl+K / Cmd+K keyboard shortcut (AC: #2, #12)
  - [ ] 6.1 Add global keyboard listener for Ctrl+K / Cmd+K to open the AI command palette
  - [ ] 6.2 Use `useEffect` with `keydown` listener on `document`, checking `metaKey || ctrlKey` + `k`
  - [ ] 6.3 Prevent default browser behavior (Ctrl+K usually opens address bar)

- [ ] Task 7: Integrate components into editor page (AC: all)
  - [ ] 7.1 Modify `app/editor/page.tsx` — add state for AI palette open/closed and AI result display
  - [ ] 7.2 Wire sparkle button → AiCommandPalette → useAiAction → AiResultPanel flow
  - [ ] 7.3 Pass editor content from EditorTextarea state to `useAiAction` when action is triggered
  - [ ] 7.4 Handle "Accept" action: insert AI result text into the editor textarea
  - [ ] 7.5 Remove or replace `AiActionPlaceholder.tsx` — the placeholder is superseded by the real AI UI

- [ ] Task 8: Create tests (AC: all)
  - [ ] 8.1 Create `lib/hooks/useAiAction.test.ts` — test loading state, success callback, error handling, result clearing
  - [ ] 8.2 Create `components/ai/AiCommandPalette.test.tsx` — test renders 4 actions for authenticated user, shows gate for anonymous, shows limit gate for exhausted user, keyboard navigation
  - [ ] 8.3 Create `components/ai/AiResultPanel.test.tsx` — test loading skeleton, result display, accept/dismiss/copy button actions, accessibility attributes
  - [ ] 8.4 Update `components/editor/EditorToolbar.test.tsx` — test sparkle button renders, click opens palette
  - [ ] 8.5 Test Ctrl+K keyboard shortcut triggers palette open

- [ ] Task 9: Verify integration and existing tests (AC: all)
  - [ ] 9.1 Verify all existing 300+ tests still pass
  - [ ] 9.2 Verify the full flow: sparkle → palette → action → loading → result → accept/dismiss
  - [ ] 9.3 Verify anonymous user sees gate check
  - [ ] 9.4 Verify free user at limit sees dimmed actions + upgrade prompt

## Dev Notes

### CRITICAL: Story 6.1 is implemented and is the backend dependency

Story 6.1 (AI Proxy Backend & Model Routing) is **done**. The following exist and MUST NOT be recreated:

| File | Exports | Purpose |
|------|---------|---------|
| `convex/ai.ts` | `callAnthropicApi` action | Main AI proxy — auth verification → usage limits → input sanitization → model selection → Anthropic API → usage logging |
| `convex/modelRouter.ts` | `getModelForAction()`, `getTokenCostForModel()`, `MODEL_IDS` | Model routing (Phase 1: all → Sonnet) |
| `convex/prompts.ts` | `getSystemPrompt(actionType)` | System prompts per action type |
| `convex/usage.ts` | `logAiUsage`, `getMonthlyUsageCount`, `getUserUsageSummary` | AI usage tracking and querying |
| `convex/schema.ts` | `aiUsage` table | Schema with `by_userId` and `by_createdAt` indexes |
| `types/ai.ts` | `AiActionType`, `AiModel`, `AiRequestArgs`, `AiResponse` | Frontend type definitions |
| `@anthropic-ai/sdk` | — | Already installed (`^0.78.0`) |

### Also prerequisite: Stories 5.1, 5.2, 5.3 — ALL implemented

The following exist and MUST NOT be recreated:

- `convex/users.ts` — `getCurrentUser`, `getCurrentUserOrThrow`, `getUserByClerkId` (internal), `upsertFromClerk`, `deleteFromClerk`
- `convex/lib/authorization.ts` — `requireAuth()`, `requireTier()` guards
- `convex/lib/tierLimits.ts` — `FREE_MONTHLY_AI_LIMIT` (10), `checkAiAccess()`
- `lib/auth/capabilities.ts` — `TierCapabilities` interface, `getCapabilitiesForTier()` function
- `lib/hooks/useCapabilities.ts` — Returns `{ capabilities, tier, isLoading }` — capabilities include `canUseAi`, `canUseSonnet`, `maxMonthlyAiCalls`
- `lib/hooks/useCurrentUser.ts` — Returns `{ user, isLoading, isAuthenticated }`
- `components/ai/AiActionPlaceholder.tsx` — Shows "AI actions coming soon" for authenticated users, register prompt for anonymous. **This is superseded by Story 6.2 UI.**

### Architecture: AI UI Flow

```
User clicks sparkle (toolbar) or Ctrl+K / Cmd+K
  → AiCommandPalette opens (cmdk CommandDialog)
  → Gate check: anonymous? → register prompt | at limit? → upgrade gate
  → User selects action (e.g., "Summarize")
  → Palette closes, loading state shows
  → useAiAction calls: useAction(api.ai.callAnthropicApi)({ actionType, content })
  → Backend flow (Story 6.1): auth → limits → sanitize → model → Anthropic → log → return
  → AiResultPanel shows result (rendered Markdown)
  → User: Accept (insert into editor) | Dismiss | Copy
```

### Command Palette (cmdk) Integration

**Library:** `cmdk` — install via `pnpm add cmdk` OR use shadcn `command` component (`npx shadcn@latest add command`) which wraps cmdk.

**shadcn/ui Command component** provides: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`.

**RTL Requirements:**
- The `CommandDialog` must have `dir="rtl"` for Hebrew layout
- Input placeholder in Hebrew: "...חפש פעולה" (Search action...)
- All action labels in Hebrew
- Arrow key navigation is built into cmdk

**Pattern Example:**
```tsx
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FileText, Languages, ListChecks, Sparkles } from "lucide-react";

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput dir="rtl" placeholder="...חפש פעולה" />
  <CommandList>
    <CommandGroup heading="פעולות AI">
      <CommandItem onSelect={() => handleAction("summarize")}>
        <FileText className="me-2 h-4 w-4" />
        סכם את המסמך
      </CommandItem>
      <CommandItem onSelect={() => handleAction("translate")}>
        <Languages className="me-2 h-4 w-4" />
        תרגם לאנגלית
      </CommandItem>
      <CommandItem onSelect={() => handleAction("extractActions")}>
        <ListChecks className="me-2 h-4 w-4" />
        חלץ משימות
      </CommandItem>
      <CommandItem onSelect={() => handleAction("improveWriting")}>
        <Sparkles className="me-2 h-4 w-4" />
        שפר ניסוח
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

### Convex Client-Side Patterns — CRITICAL

**Calling actions from React:**
```tsx
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const callAi = useAction(api.ai.callAnthropicApi);

// In handler:
const response = await callAi({
  actionType: "summarize",
  content: editorContent,
});
// response: { result: string, model: string, inputTokens: number, outputTokens: number }
```

**Querying usage count (for remaining display):**
```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// NOTE: getMonthlyUsageCount is an internalQuery — not callable from client
// You need to either:
// 1. Create a new public query that wraps it with auth checking, OR
// 2. Use getUserUsageSummary if it's a public query
```

**IMPORTANT:** Check whether `getMonthlyUsageCount` and `getUserUsageSummary` in `convex/usage.ts` are `internalQuery` or `query`. If internal, you'll need to create a public wrapper query for the client to display remaining usage count.

### useAiAction Hook Design

```typescript
// lib/hooks/useAiAction.ts
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { AiActionType, AiResponse } from "@/types/ai";

export function useAiAction() {
  const callAi = useAction(api.ai.callAnthropicApi);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(
    async (actionType: AiActionType, content: string, targetLanguage?: "he" | "en") => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      try {
        const response = await callAi({ actionType, content, targetLanguage });
        setResult(response);
        toast.success("AI סיים לעבד");
        return response;
      } catch (err) {
        // ConvexError has .data with { code, message, messageEn }
        const errorData = (err as any)?.data;
        const message = errorData?.message || "שגיאה בעיבוד AI";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callAi]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { executeAction, isLoading, result, error, clearResult };
}
```

### AIResultPanel Design

- **Position:** Overlay or inline section in the preview area (below the preview panel or as an overlay)
- **States:**
  - `loading` — Skeleton shimmer matching expected output shape, "...מעבד" text
  - `result` — Rendered Markdown content with action buttons
  - `error` — Error message display (though errors go through toasts)
  - `hidden` — No AI result to show
- **Accept action:** Insert result text into the editor textarea. Use the `insertTextAtCursor()` helper from `EditorPanel.tsx` or append to the end of the document.
- **Dismiss action:** Clear result, return to normal preview
- **Copy action:** `navigator.clipboard.writeText(result.result)`

### Existing EditorToolbar Structure

The current toolbar in `components/editor/EditorToolbar.tsx` has 6 groups:
1. Text formatting (bold, italic, strikethrough)
2. Headings dropdown
3. Lists (unordered, ordered, task)
4. Insert (link, image, table, hr)
5. Code dropdown
6. Mermaid diagram dropdown

**Add AI sparkle button as group 7** after the last separator. Use a `FormatButton` or plain `Button` with `Sparkles` icon from lucide-react.

### Gate Check Logic

```tsx
// In AiCommandPalette.tsx
const { isAuthenticated } = useCurrentUser();
const { capabilities, tier } = useCapabilities();

// Anonymous user
if (!isAuthenticated) {
  // Show register prompt instead of actions
}

// Free user at limit
if (tier === "free" && monthlyUsage >= capabilities.maxMonthlyAiCalls) {
  // Dim actions, show upgrade gate
}

// Free user within quota
if (tier === "free" && monthlyUsage < capabilities.maxMonthlyAiCalls) {
  // Show actions + remaining count
}

// Paid user
if (tier === "paid") {
  // All actions enabled, no limit display
}
```

### Monthly Usage Query — IMPORTANT

The `getMonthlyUsageCount` in `convex/usage.ts` is likely an `internalQuery`. To display remaining usage in the command palette, you need a **public query** that returns the count for the authenticated user. Options:

1. **Create `convex/usage.ts:getMyMonthlyUsage` (public query):**
```typescript
export const getMyMonthlyUsage = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { count: 0, limit: 0 };
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { count: 0, limit: 0 };
    // Count this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("createdAt"), startOfMonth.getTime()))
      .collect();
    return { count: records.length, limit: FREE_MONTHLY_AI_LIMIT };
  },
});
```

2. **Then use in React:** `const usage = useQuery(api.usage.getMyMonthlyUsage);`

### Error Codes from Backend

| Code | When | Hebrew Message | UI Treatment |
|------|------|---------------|-------------|
| `AUTH_REQUIRED` | No Clerk session | "נדרש התחברות" | Toast error |
| `USER_NOT_FOUND` | No Convex user | "משתמש לא נמצא" | Toast error |
| `TIER_INSUFFICIENT` | Anonymous tries AI | "נדרש מנוי לתכונה זו" | Gate in palette |
| `AI_LIMIT_REACHED` | Free user exceeded limit | "הגעת למגבלת השימוש החודשית ב-AI" | Gate in palette + toast |
| `AI_INPUT_EMPTY` | Empty document | "לא ניתן לעבד מסמך ריק" | Toast error |
| `AI_UNAVAILABLE` | Anthropic API error | "AI לא זמין כרגע. נסה שוב מאוחר יותר" | Toast error |
| `AI_CONFIG_ERROR` | Missing API key | "שגיאת הגדרות שרת" | Toast error |

### Styling & RTL — CRITICAL

- **Always use Tailwind logical properties:** `ms-*` not `ml-*`, `me-*` not `mr-*`, `ps-*` not `pl-*`, `text-start` not `text-left`
- Command palette must have `dir="rtl"` on the dialog
- All Hebrew text flows right-to-left naturally
- Icons use `me-2` (margin-end) which resolves to margin-left in RTL
- Action buttons in AIResultPanel: use `gap-*` and flexbox, no directional margins

### Testing Requirements

**Framework:** Vitest (configured in `vitest.config.ts`)
**Current baseline:** 300+ tests passing across 28+ test files

**Test patterns from this codebase:**

```typescript
// Mocking Convex hooks
vi.mock("convex/react", () => ({
  useAction: vi.fn(),
  useQuery: vi.fn(),
}));

// Mocking useCurrentUser
vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(() => ({
    user: { _id: "user123", tier: "free" },
    isLoading: false,
    isAuthenticated: true,
  })),
}));

// Mocking useCapabilities
vi.mock("@/lib/hooks/useCapabilities", () => ({
  useCapabilities: vi.fn(() => ({
    capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
    tier: "free",
    isLoading: false,
  })),
}));
```

**Required test files and scenarios:**

1. **`lib/hooks/useAiAction.test.ts`:**
   - Returns loading=true while action is executing
   - Sets result on success
   - Shows success toast on completion
   - Catches ConvexError and sets error state
   - Shows error toast with Hebrew message
   - `clearResult()` resets state

2. **`components/ai/AiCommandPalette.test.tsx`:**
   - Renders 4 action items for authenticated free user with quota
   - Shows register prompt for anonymous user
   - Shows dimmed actions + upgrade gate for user at limit
   - Shows remaining count "נותרו X פעולות AI"
   - Calls onAction callback when action selected
   - Keyboard: Escape closes palette

3. **`components/ai/AiResultPanel.test.tsx`:**
   - Shows skeleton loading state when `isLoading=true`
   - Renders AI result as Markdown when `result` provided
   - Accept button calls `onAccept` callback
   - Dismiss button calls `onDismiss` callback
   - Copy button copies text to clipboard
   - Has correct ARIA attributes (`role="complementary"`, `aria-label="תוצאת AI"`)

4. **`components/editor/EditorToolbar.test.tsx` (update):**
   - Verify sparkle AI button renders
   - Click sparkle calls `onAiClick` callback

### Existing Infrastructure (DO NOT Recreate)

- **`convex/ai.ts`** — Full AI proxy action. IMPORT via `api.ai.callAnthropicApi`.
- **`convex/usage.ts`** — Usage tracking. MAY need to add public `getMyMonthlyUsage` query.
- **`types/ai.ts`** — Types for frontend. IMPORT `AiActionType`, `AiResponse`.
- **`lib/hooks/useCapabilities.ts`** — Tier capabilities. IMPORT for gate checks.
- **`lib/hooks/useCurrentUser.ts`** — Auth state. IMPORT for gate checks.
- **`components/ui/`** — shadcn/ui components (Button, Dialog, etc.). IMPORT as needed.
- **`components/editor/EditorToolbar.tsx`** — MODIFY to add sparkle button.
- **`components/editor/FormatButton.tsx`** — Reusable button component. IMPORT for sparkle.
- **`components/ai/AiActionPlaceholder.tsx`** — REMOVE or replace. Superseded by real AI UI.

### Must Be Created (Story 6.2 Scope)

| File | Purpose |
|------|---------|
| `components/ui/command.tsx` | shadcn/ui Command component (via `npx shadcn@latest add command`) |
| `components/ai/AiCommandPalette.tsx` | cmdk-based command palette with gate checks and 4 AI actions |
| `components/ai/AiResultPanel.tsx` | AI result display with accept/dismiss/copy |
| `lib/hooks/useAiAction.ts` | Hook wrapping Convex AI action with loading/error/result state |
| `components/ai/AiCommandPalette.test.tsx` | Tests for command palette |
| `components/ai/AiResultPanel.test.tsx` | Tests for result panel |
| `lib/hooks/useAiAction.test.ts` | Tests for AI action hook |

### Must Be Modified (Story 6.2 Scope)

| File | Change |
|------|--------|
| `components/editor/EditorToolbar.tsx` | Add AI sparkle button after last separator |
| `app/editor/page.tsx` | Add AI palette state, result panel state, wire the full flow |
| `convex/usage.ts` | Add public `getMyMonthlyUsage` query (if `getMonthlyUsageCount` is internal-only) |
| `package.json` | Add `cmdk` dependency (or use shadcn command which wraps it) |
| `components/editor/EditorToolbar.test.tsx` | Add tests for sparkle button |

### Project Structure Notes

- `components/ai/AiCommandPalette.tsx` matches architecture's planned `components/ai/AiPanel.tsx` (renamed for clarity — it's a command palette, not a sidebar panel)
- `components/ai/AiResultPanel.tsx` matches architecture's `components/ai/AiResultDisplay.tsx` (renamed to match UX spec naming)
- `lib/hooks/useAiAction.ts` matches architecture's planned hook at `lib/hooks/useAiAction.ts`
- Tests co-located next to source files per project convention
- shadcn `command` component goes in `components/ui/command.tsx` per shadcn convention

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `AiCommandPalette`, `AiResultPanel` |
| Hooks | `use` prefix, camelCase | `useAiAction` |
| Types | PascalCase | `AiActionType`, `AiResponse` |
| Event handlers | `handle` prefix | `handleAction`, `handleAccept` |
| Callback props | `on` prefix | `onAction`, `onAccept`, `onDismiss` |
| CSS classes | Tailwind logical properties | `ms-2`, `me-4`, `text-start` |
| Hebrew UI text | Direct string | "סכם את המסמך" |
| Constants | UPPER_SNAKE_CASE | `AI_ACTIONS` |

### Library & Framework Requirements

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `cmdk` | latest | Command palette for AI actions | **NEW — installed via shadcn command component** |
| `convex` | ^1.32.0 | `useAction`, `useQuery` hooks | Already installed |
| `lucide-react` | ^0.577.0 | `Sparkles`, `FileText`, `Languages`, `ListChecks`, `Copy`, `Check`, `X` icons | Already installed |
| `sonner` | ^2.0.7 | Toast notifications | Already installed |
| `@clerk/nextjs` | ^7.0.1 | Auth context | Already installed |

### Previous Story Intelligence

**From Story 6.1 (done — backend):**
- `callAnthropicApi` action returns `{ result: string, model: string, inputTokens: number, outputTokens: number }`
- Error handling uses `ConvexError` with `{ code, message, messageEn }` payload
- Usage is logged automatically by the action — no client-side tracking needed
- `MAX_INPUT_CHARS = 100,000` — input sanitized server-side, no client truncation needed

**From Story 5.3 (done — authorization):**
- `useCapabilities` hook returns `{ capabilities: { canUseAi, canUseSonnet, canUseOpus, maxMonthlyAiCalls }, tier, isLoading }`
- Anonymous tier: `canUseAi = false`, Free: `canUseAi = true, maxMonthlyAiCalls = 10`
- Import from `@/lib/hooks/useCapabilities`

**From Story 5.2 (done — editor experience):**
- `AiActionPlaceholder.tsx` is the current AI slot in the editor — **replace with real UI**
- Editor page (`app/editor/page.tsx`) manages the main layout, content state, view modes
- 300+ tests passing, 28+ test files — maintain this baseline

**Code review lessons to apply:**
- Use logical CSS properties everywhere (ms-*, me-*, ps-*, pe-*)
- Include Hebrew ARIA labels on all interactive elements
- Mock at highest-level abstraction in tests
- Don't duplicate logic — import existing hooks and utilities
- Test both authenticated and anonymous states

### Git Intelligence

Recent commits:
```
32281fb Implement Story 5.2: Anonymous and authenticated editor experience
a489249 Implement Story 5.1: Clerk auth integration and Convex user sync
b2684da Implement Story 4.2: BiDi integration with rendering pipeline
```

**Expected commit:** `Implement Story 6.2: AI actions UI and document interactions`

### Anti-Patterns to AVOID

- **Do NOT create a chat sidebar or message UI** — Marko's AI is a command palette + result panel, NOT a chatbot. No conversation threads.
- **Do NOT show upgrade banners or modals** — Limit communication is ONLY inside the command palette. No toolbar banners, no blocking modals, no preemptive nags.
- **Do NOT implement streaming** — Phase 1 uses full response only. The backend returns complete text.
- **Do NOT store AI results on the server** — Results are displayed client-side only. Accepted results are inserted into the editor (localStorage).
- **Do NOT create duplicate backend logic** — All AI processing, auth checking, and usage tracking happen in the Convex backend (Story 6.1). The frontend only calls `useAction` and displays results.
- **Do NOT use `ml-*`, `mr-*`, `pl-*`, `pr-*`** — Always use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) for RTL compatibility.
- **Do NOT use `text-left` or `text-right`** — Use `text-start` and `text-end`.
- **Do NOT create a custom keyboard shortcut system** — Use a simple `useEffect` with `keydown` listener for Ctrl+K.
- **Do NOT query usage in the editor on every render** — Use `useQuery` which is reactive and efficient. The count updates automatically when usage changes in Convex.

### Future Story Awareness

**Story 6.3 (AI Privacy Disclosure) will add:**
- First-time AI disclosure notice before processing
- Consent flow integrated into the command palette
- Story 6.2 should NOT implement the disclosure — but should leave room for it (e.g., a hook point before executing an action)

**Story 6.4 (AI Usage Limits & Upgrade Prompts) will add:**
- More sophisticated limit display
- Upgrade button linking to payment (Phase 2)
- Story 6.2's gate check sets the foundation — Story 6.4 extends it with payment links

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — AI Proxy Architecture, Frontend Architecture, Data Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md — Structure Patterns (components/ai/), Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component & File Naming, CSS & Styling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Flow 3: AI Action, Journey 3: Registration → AI First Use]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — AI Entry Point: Sparkle icon + command palette]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Component 9: AIResultPanel]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Upgrade Prompt: Inside command palette only]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Feedback Patterns, Loading States]
- [Source: _bmad-output/planning-artifacts/prd.md — FR24-FR31 (AI Document Actions), FR50 (Privacy Disclosure)]
- [Source: _bmad-output/implementation-artifacts/6-1-ai-proxy-backend-and-model-routing.md — Previous Story]
- [Source: _bmad-output/implementation-artifacts/5-3-three-tier-authorization-and-account-deletion.md — Prerequisite Story]
- [Source: cmdk — https://cmdk.paco.me/]
- [Source: shadcn/ui Command — https://ui.shadcn.com/docs/components/command]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
