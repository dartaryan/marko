# Story 6.2r: AI Actions UI Revision — 4 Entry Points

Status: review

## Story

As a registered user,
I want multiple ways to invoke AI actions — header button, slash command, text-selection toolbar, and keyboard shortcut,
So that I can discover and use AI features naturally regardless of my workflow preference.

## Acceptance Criteria

### AC1: Header AI Button (Primary Entry Point)

- Given the user is on the editor page
- When the page loads
- Then a prominent AI button is visible in the editor toolbar zone with:
  - Sparkles icon + label "עוזר AI"
  - Emerald gradient background (`from-emerald-500 to-emerald-600`), pill-shaped, 44px height
  - Subtle animated border glow (replaces current dashed pulse)
  - Most visually prominent element in the toolbar
- When clicked, opens the AI command bar (inline, not modal)

### AC2: Slash Command Entry Point

- Given the user is typing in the editor textarea
- When they type `/ai` or `/בינה` followed by space or Enter
- Then the AI command bar appears inline above the cursor position
- And the slash command text is removed from the editor content
- And the command bar shows all available AI action chips

### AC3: Floating Selection Toolbar Entry Point

- Given the user selects text in the editor textarea
- When the selection is non-empty (>0 characters)
- Then a floating toolbar appears near the selection with a sparkle (✨) button
- When the sparkle button is clicked
- Then the AI command bar opens with the selected text as context
- And the available actions are contextual (e.g., Translate and Improve Writing are prominent for text selections)

### AC4: Keyboard Shortcut Entry Point

- Given the user is on the editor page
- When they press `Ctrl+J` (Windows/Linux) or `Cmd+J` (Mac)
- Then the AI command bar opens
- And if text is selected, it's used as context; otherwise the full document is context
- Note: Current `Ctrl+K` shortcut is removed (conflicts with common editor shortcuts)

### AC5: Inline Command Bar UI

- Given the AI command bar is triggered from any entry point
- When it appears
- Then it renders as an inline dropdown/bar (NOT a full-screen modal):
  - Drops down from header area (for header button / keyboard shortcut)
  - Or appears above selection (for selection toolbar / slash command)
- And shows action chips: `סכם` | `תרגם` | `צור תרשים` | `הרחב` | `שכתב` | free-text input
- And each chip has a Hebrew label + icon
- And chips are keyboard-navigable (arrow keys + Enter)
- And `Esc` closes the command bar
- And the bar has `dir="rtl"` and full Hebrew accessibility labels

### AC6: Inline Result Display (Suggestion Cards)

- Given the user selects an AI action and the response is returned
- When the result is ready
- Then it appears as an inline suggestion card (NOT in a separate panel):
  - Gradient left-border in RTL (right-border visually, using `border-inline-start`)
  - Card appears below/near the action context area
  - Contains: rendered Markdown result, Accept button, Discard button, Regenerate option
- And Accept inserts/replaces content in the editor
- And Discard removes the suggestion card
- And Regenerate re-runs the same action

### AC7: Updated Paywall — "Gift, Not Gate" Pattern

- Given a free user invokes an AI action
- When the action completes successfully
- Then a subtle toast shows usage: "✨ פעולת AI {used} מתוך {limit} החודש"
- And the monthly limit is 5 (changed from 10)
- When the free user has exhausted their limit
- Then partial results are shown (first sentence visible, rest blurred with CSS `filter: blur()`)
- And a friendly upsell appears: "רוצה עוד? שדרג לפרימיום" (not blocking, not angry)
- And no lock icons are used anywhere

### AC8: Backwards Compatibility

- Given the existing AI backend (Story 6.1), disclosure flow (Story 6.3), and limits logic (Story 6.4)
- When 6-2r is implemented
- Then all backend contracts remain unchanged (`callAnthropicApi` action, `getMyMonthlyUsage` query)
- And `AiDisclosure` flow still triggers on first AI action per session
- And error codes (`AI_LIMIT_REACHED`, `AI_UNAVAILABLE`, etc.) still map correctly
- And the `useAiAction` hook is reused or extended (not replaced)

## Tasks / Subtasks

- [x] Task 1: Redesign AI header button (AC: #1)
  - [x] Replace current sparkle `FormatButton` in `EditorToolbar.tsx` with prominent pill-shaped AI button
  - [x] Apply emerald gradient, 44px height, "עוזר AI" label + Sparkles icon
  - [x] Replace dashed pulse CSS animation with smooth border glow animation
  - [x] Update `.marko-toolbar-btn--ai` styles in `globals.css`
- [x] Task 2: Create inline AI command bar component (AC: #5)
  - [x] Create `AiCommandBar.tsx` in `components/ai/` — inline dropdown replacing `AiCommandPalette.tsx` modal
  - [x] Implement action chips UI: `סכם` | `תרגם` | `צור תרשים` | `שכתב` + free-text input
  - [x] Support two positioning modes: below-header and above-selection
  - [x] Ensure RTL layout, Hebrew labels, keyboard navigation (arrows + Enter + Esc)
  - [x] Wire gate checks: anonymous → register prompt, at-limit → upgrade gate, within-quota → show remaining
- [x] Task 3: Implement slash command detection (AC: #2)
  - [x] Add slash command detection in `EditorTextarea.tsx` or editor input handler
  - [x] Detect `/ai` and `/בינה` patterns followed by space/Enter
  - [x] On detection: remove slash text, open command bar positioned at cursor
  - [x] Pass cursor position for command bar placement
- [x] Task 4: Implement floating selection toolbar (AC: #3)
  - [x] Create `SelectionToolbar.tsx` in `components/editor/` — floating toolbar on text selection
  - [x] Show sparkle button when editor textarea has non-empty selection
  - [x] Position toolbar near selection using `window.getSelection()` coordinates
  - [x] On sparkle click: open command bar with selected text as context
  - [x] Auto-hide toolbar when selection is cleared
- [x] Task 5: Update keyboard shortcut (AC: #4)
  - [x] Change global shortcut from `Ctrl+K`/`Cmd+K` to `Ctrl+J`/`Cmd+J` in `app/editor/page.tsx`
  - [x] Remove old Ctrl+K handler (lines 138-149 of editor page)
  - [x] New shortcut opens inline command bar (not modal palette)
  - [x] If text selected, pass selection as context
- [x] Task 6: Create inline result suggestion cards (AC: #6)
  - [x] Create `AiSuggestionCard.tsx` in `components/ai/` — replaces `AiResultPanel.tsx` as primary display
  - [x] Render Markdown result with gradient `border-inline-start`
  - [x] Add Accept (inserts into editor), Discard (removes card), Regenerate buttons
  - [x] Position card inline near the context area
  - [x] Maintain loading skeleton shimmer during processing
- [x] Task 7: Update paywall to "Gift, Not Gate" (AC: #7)
  - [x] Update `FREE_MONTHLY_AI_LIMIT` from 10 to 5 in `convex/lib/tierLimits.ts`
  - [x] Implement partial-result blur: first sentence visible, rest `filter: blur(4px)`
  - [x] Add usage toast after each successful action: "✨ פעולת AI {used} מתוך {limit} החודש"
  - [x] Replace hard limit block with blurred partial result + friendly upsell
  - [x] Remove any lock icons from AI UI
- [x] Task 8: Wire all entry points in EditorPage (AC: #1-4, #8)
  - [x] Update `app/editor/page.tsx` to coordinate all 4 entry points
  - [x] Manage state: `aiTriggerSource` (header | slash | selection | keyboard), `selectedText`, `commandBarPosition`
  - [x] Preserve `useAiAction` hook, `useAiDisclosure` flow, error code handling
  - [x] Remove old `AiCommandPalette` modal imports and replace with `AiCommandBar`
  - [x] Keep `AiResultPanel` available as fallback but default to `AiSuggestionCard`
- [x] Task 9: Tests (AC: all)
  - [x] Update `AiCommandPalette.test.tsx` → rename/refactor for `AiCommandBar.test.tsx`
  - [x] Add tests for slash command detection and cleanup
  - [x] Add tests for selection toolbar show/hide behavior
  - [x] Add tests for Ctrl+J shortcut (replaces Ctrl+K tests)
  - [x] Add tests for suggestion card Accept/Discard/Regenerate
  - [x] Add tests for partial blur paywall behavior
  - [x] Verify disclosure flow still works with new command bar

## Dev Notes

### Critical: What This Story Changes vs. Keeps

**KEEP (do not modify):**
- `convex/ai.ts` — backend action contract unchanged
- `convex/usage.ts` — usage queries unchanged
- `convex/modelRouter.ts` — model routing unchanged
- `convex/prompts.ts` — system prompts unchanged
- `convex/schema.ts` — database schema unchanged
- `lib/hooks/useAiAction.ts` — reuse this hook (extend if needed, don't replace)
- `lib/hooks/useAiDisclosure.ts` — disclosure flow stays
- `components/ai/AiDisclosure.tsx` — privacy dialog unchanged
- `types/ai.ts` — types unchanged
- Error code handling pattern: catch `ConvexError`, extract `.data.code`, map to Hebrew message

**MODIFY:**
- `components/editor/EditorToolbar.tsx` — redesign AI button (lines ~170-177)
- `app/editor/page.tsx` — new state management, 4 entry points, remove Ctrl+K, add Ctrl+J
- `app/globals.css` — new AI button styles, suggestion card styles, blur styles (lines ~696-710)
- `convex/lib/tierLimits.ts` — change `FREE_MONTHLY_AI_LIMIT` from 10 to 5

**CREATE:**
- `components/ai/AiCommandBar.tsx` — inline command bar (replaces modal palette)
- `components/ai/AiSuggestionCard.tsx` — inline result cards
- `components/editor/SelectionToolbar.tsx` — floating toolbar on text selection
- Test files for new components

**DEPRECATE (keep file but stop importing in EditorPage):**
- `components/ai/AiCommandPalette.tsx` — replaced by `AiCommandBar.tsx`
- `components/ai/AiResultPanel.tsx` — replaced by `AiSuggestionCard.tsx` as primary display

### Architecture Compliance

- **Component location:** All new AI components go in `components/ai/`. Selection toolbar in `components/editor/`.
- **Styling:** Tailwind CSS v4 + logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `border-inline-start`). No physical `left`/`right` — always logical for RTL.
- **State:** React `useState` in EditorPage for UI state. No new stores needed. `useAiAction` hook remains the API interface.
- **Convex boundary:** All backend interaction through existing hooks (`useAction`, `useQuery`). No direct API calls.
- **shadcn/ui:** Use Radix primitives (Popover, DropdownMenu) for positioning. Command bar can extend `cmdk` or use custom implementation.
- **RTL:** All new components must have `dir="rtl"`. Hebrew labels throughout. `aria-label` in Hebrew.
- **Accessibility:** All interactive elements keyboard-accessible. ARIA roles on command bar (`role="listbox"` for chips), suggestion card (`role="complementary"`). Focus management: command bar traps focus when open, returns focus on close.

### Library & Framework Requirements

| Library | Version | Usage |
|---------|---------|-------|
| React | 19.x | Components, hooks, state |
| Next.js | 16.x | App Router, CSR editor page |
| cmdk | latest | Command bar foundation (extend or replace existing usage) |
| Tailwind CSS | v4 | Styling with logical properties |
| shadcn/ui | latest | Radix primitives (Popover for positioning) |
| lucide-react | latest | Icons: Sparkles, Languages, FileText, ListChecks, RefreshCw |
| Convex | latest | `useAction(api.ai.callAnthropicApi)`, `useQuery(api.usage.getMyMonthlyUsage)` |

### File Structure

```
components/
  ai/
    AiCommandBar.tsx          ← NEW: inline command bar with action chips
    AiCommandBar.test.tsx     ← NEW: tests
    AiSuggestionCard.tsx      ← NEW: inline result card
    AiSuggestionCard.test.tsx ← NEW: tests
    AiCommandPalette.tsx      ← KEEP but stop importing (deprecated by AiCommandBar)
    AiResultPanel.tsx         ← KEEP but stop importing (deprecated by AiSuggestionCard)
    AiDisclosure.tsx          ← UNCHANGED
  editor/
    EditorToolbar.tsx         ← MODIFY: AI button redesign
    SelectionToolbar.tsx      ← NEW: floating toolbar on selection
    SelectionToolbar.test.tsx ← NEW: tests
    EditorPanel.tsx           ← MINOR: pass selection state down
app/
  editor/
    page.tsx                  ← MODIFY: 4 entry points, new state, Ctrl+J
  globals.css                 ← MODIFY: AI button glow, suggestion card, blur styles
convex/
  lib/
    tierLimits.ts             ← MODIFY: FREE_MONTHLY_AI_LIMIT = 5
```

### Previous Story Intelligence

**From Story 6.2 (original):**
- cmdk `CommandDialog` works well with `dir="rtl"` and logical CSS — reuse RTL patterns
- Gate checks (anonymous/limit) are in the palette component — move to `AiCommandBar`
- Loading skeleton shimmer improves perceived performance — keep pattern for suggestion cards
- Error codes from backend map to Hebrew messages — preserve mapping

**From Story 6.4 (limits):**
- `getMyMonthlyUsage` is a public query — keep using it for remaining count display
- `AI_LIMIT_REACHED` error should NOT toast — handle contextually in command bar/suggestion card
- Backend is single source of truth for `limit` value — don't hardcode 5 in frontend, read from query
- Loading state guard needed: disable actions while usage query is loading

**Cross-cutting from Epic 6:**
- All Hebrew ARIA labels critical for accessibility
- Logical CSS properties mandatory (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Error handling pattern: `catch ConvexError` → extract `.data.code` → map to Hebrew message
- Mock at highest abstraction level in tests (`useQuery`, `useAction`)

### Git Intelligence

Recent commits focus on Epic 10 (RTL) and Epic 11 (visual polish):
- RTL logical properties are fully migrated in `globals.css` — follow established patterns
- BULK pass increased CSS specificity/weight — be aware of specificity when adding new styles
- All components now use logical properties — new components MUST follow this convention

### Key Implementation Patterns

**Slash Command Detection Pattern:**
```typescript
// In editor input handler — detect /ai or /בינה
const SLASH_COMMANDS = ['/ai', '/בינה'];
const handleInput = (value: string, cursorPos: number) => {
  for (const cmd of SLASH_COMMANDS) {
    if (value.slice(cursorPos - cmd.length - 1, cursorPos).startsWith(cmd + ' ')) {
      // Remove command text, trigger command bar at cursor position
    }
  }
};
```

**Selection Toolbar Positioning Pattern:**
```typescript
// Use getSelection() for floating toolbar position
const selection = window.getSelection();
if (selection && !selection.isCollapsed) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  // Position toolbar above selection: { top: rect.top - toolbarHeight, left: rect.left }
}
```

**Partial Blur for Paywall:**
```css
.ai-result-blurred {
  position: relative;
}
.ai-result-blurred::after {
  content: '';
  position: absolute;
  inset-block-start: 2em; /* blur after first line */
  inset-block-end: 0;
  inset-inline: 0;
  backdrop-filter: blur(4px);
  background: linear-gradient(to bottom, transparent, var(--background));
}
```

**Usage Toast Pattern:**
```typescript
// After successful AI action
toast.success(`✨ פעולת AI ${used} מתוך ${limit} החודש`);
```

### Anti-Patterns to Avoid

- **DO NOT** create a new Convex action or modify `callAnthropicApi` — the backend is stable
- **DO NOT** use physical CSS properties (`left`, `right`, `margin-left`) — use logical only
- **DO NOT** create a chatbot-style thread UI — AI is an action system, not a conversation
- **DO NOT** add full-screen modals — everything should be inline and contextual
- **DO NOT** hardcode the limit number (5) in frontend components — read from `getMyMonthlyUsage` query
- **DO NOT** block the user with a modal on limit reach — show partial results + friendly upsell
- **DO NOT** remove `AiCommandPalette.tsx` or `AiResultPanel.tsx` files — just stop importing them

### Testing Standards

- **Unit tests:** Vitest, co-located with components (`.test.tsx`)
- **Mock pattern:** Mock `useQuery` and `useAction` from Convex, not the underlying API
- **RTL testing:** Use `@testing-library/react` with RTL-aware queries
- **Key test scenarios:**
  - Command bar opens from each of the 4 entry points
  - Slash command removes trigger text from editor
  - Selection toolbar appears/disappears with text selection
  - Action chips are keyboard navigable
  - Suggestion card Accept inserts content, Discard removes card
  - Blur effect applies when at limit
  - Usage toast shows correct count after action
  - Disclosure flow still triggers on first action per session

### Dependencies & Sequencing Note

This story is scheduled for **WS3-P2**. By implementation time:
- **E10 (RTL)** — DONE: all components use logical properties
- **E11/S11.1 (BULK)** — in review: CSS weight increase is applied
- **E12/S12.1 (Header redesign)** — may or may not be done

**If E12/S12.1 is done before this story:** integrate the AI button into the new 7-zone header layout.
**If E12/S12.1 is NOT yet done:** implement the AI button in the current `EditorToolbar`. E12 will later relocate it to the header. Design the button as a self-contained component that can be moved easily.

### Project Structure Notes

- Alignment with feature-based component organization (ai/, editor/, layout/)
- New components follow existing naming conventions (PascalCase, `.tsx`)
- Test files co-located with components
- CSS in `globals.css` using existing `.marko-*` class naming convention
- Convex changes minimal (single constant update)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.2 revised]
- [Source: _bmad-output/benakiva-feedback-round1.md — Item U1: Header Button Reorganization, 4 AI entry points]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-16.md — S6.2r definition]
- [Source: _bmad-output/planning-artifacts/architecture.md — AI proxy architecture, component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — AI command palette design, gate checks]
- [Source: _bmad-output/planning-artifacts/prd.md — FR24-FR31 AI requirements]
- [Source: _bmad-output/implementation-artifacts/6-2-ai-actions-ui-and-document-interactions.md — original S6.2 learnings]
- [Source: _bmad-output/implementation-artifacts/6-4-ai-usage-limits-and-upgrade-prompts.md — limits integration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Redesigned AI header button from a simple FormatButton to a prominent pill-shaped emerald gradient button with "עוזר AI" label, smooth glow animation, and responsive behavior (icon-only on mobile).
- Created AiCommandBar.tsx inline dropdown with action chips (סכם, תרגם, צור תרשים, שכתב), free-text input, keyboard navigation (arrows + Enter + Esc), RTL layout, and gate checks (anonymous/limit/quota).
- Added slash command detection in EditorTextarea.tsx for `/ai` and `/בינה` — removes command text and opens command bar at cursor position.
- Created SelectionToolbar.tsx floating toolbar that appears near text selection with sparkle button to invoke AI with selected text as context.
- Changed keyboard shortcut from Ctrl+K/Cmd+K to Ctrl+J/Cmd+J; passes selected text as context when available.
- Created AiSuggestionCard.tsx inline result card with gradient border-inline-start, Accept/Discard/Regenerate buttons, and partial blur (paywall) support.
- Updated FREE_MONTHLY_AI_LIMIT from 10 to 5 in tierLimits.ts. Added usage toast "✨ פעולת AI {used} מתוך {limit} החודש" after successful actions.
- Rewired EditorPage.tsx with 4 entry points (header, slash, selection, keyboard), new state management (aiTriggerSource, selectedText, commandBarPosition), AiCommandBar replacing AiCommandPalette, AiSuggestionCard replacing AiResultPanel as primary display.
- All existing hooks (useAiAction, useAiDisclosure) preserved. Backend contracts unchanged.
- Updated existing tests (EditorToolbar, useAiAction, usagePublicQuery) to match new behavior. Created 3 new test files (AiCommandBar, AiSuggestionCard, SelectionToolbar).
- 666 tests pass, 2 pre-existing failures in Header.test.tsx/layout.test.ts unrelated to this story.

### Change Log

- 2026-03-19: Story 6.2r implemented — 4 AI entry points, inline command bar, suggestion cards, Gift-Not-Gate paywall (Claude Opus 4.6)

### File List

**New files:**
- components/ai/AiCommandBar.tsx
- components/ai/AiCommandBar.test.tsx
- components/ai/AiSuggestionCard.tsx
- components/ai/AiSuggestionCard.test.tsx
- components/editor/SelectionToolbar.tsx
- components/editor/SelectionToolbar.test.tsx

**Modified files:**
- app/editor/page.tsx — 4 entry points, new state, AiCommandBar/AiSuggestionCard replacing old components
- app/globals.css — AI button glow, command bar, suggestion card, selection toolbar, blur styles
- components/editor/EditorToolbar.tsx — AI button redesign (pill, emerald gradient, label)
- components/editor/EditorPanel.tsx — slash command and selection toolbar wiring
- components/editor/EditorTextarea.tsx — slash command detection (/ai, /בינה)
- components/editor/EditorToolbar.test.tsx — updated tests for new AI button
- convex/lib/tierLimits.ts — FREE_MONTHLY_AI_LIMIT 10→5
- lib/hooks/useAiAction.ts — removed generic toast (now in EditorPage)
- lib/hooks/useAiAction.test.ts — updated toast expectations
- convex/__tests__/usagePublicQuery.test.ts — updated limit expectations 10→5
- _bmad-output/implementation-artifacts/sprint-status.yaml — story status tracking
