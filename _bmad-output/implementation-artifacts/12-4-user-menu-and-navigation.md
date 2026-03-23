# Story 12.4: User Menu & Navigation

Status: review

## Story

As a user,
I want the logo to return me to the landing page and the user menu to provide access to all pages,
so that navigation is intuitive and complete.

## Acceptance Criteria

1. **Logo navigation**: Given the user clicks the logo/brand in the header, When navigating, Then it always navigates to `/` with `?home=true` (bypasses skip-landing redirect from N4/E14).

2. **Logged-in user menu**: Given a logged-in user clicks their avatar, When the dropdown opens, Then it shows:
   - 📄 המסמכים שלי (My Documents)
   - ⚙ הגדרות (Settings)
   - 📞 צור קשר (Contact)
   - 🐛 דווח על בעיה (Report Bug)
   - ─── separator
   - 🚪 התנתק (Sign Out)
   And each item has an icon on the right side (RTL start).

3. **Anonymous user menu**: Given an anonymous user clicks the user area, When the dropdown opens, Then it shows:
   - ⚙ הגדרות (Settings)
   - 📞 צור קשר (Contact)
   - 🐛 דווח על בעיה (Report Bug)
   - ─── separator
   - 🔑 התחבר (Sign In)

4. **Mobile navigation**: Given mobile viewport (<768px), When navigation is needed, Then all user-menu items move into a hamburger/drawer menu.

## Tasks / Subtasks

- [x] Task 1: Update logo Link to include `?home=true` (AC: #1)
  - [x] 1.1 In `Header.tsx`, change `<Link href="/">` to `<Link href="/?home=true">`
  - [x] 1.2 Update Header test to verify the new href

- [x] Task 2: Replace Clerk UserButton with custom dropdown for logged-in users (AC: #2)
  - [x] 2.1 Rewrite `UserMenu.tsx` — replace Clerk's `UserButton` with shadcn/ui `DropdownMenu` (Radix-based)
  - [x] 2.2 Add avatar trigger: user initials in 28×28px emerald circle (use Clerk's `useUser()` for name/imageUrl, or fall back to Convex user data)
  - [x] 2.3 Implement 6 menu items: המסמכים שלי, הגדרות, צור קשר, דווח על בעיה, separator, התנתק
  - [x] 2.4 Each item: icon on inline-end (right in RTL), Hebrew label, keyboard accessible
  - [x] 2.5 Sign-out uses `useClerk().signOut()` (already used in `DeleteAccountDialog`)
  - [x] 2.6 Keep paid-tier badge (emerald dot) on avatar
  - [x] 2.7 Keep subscription management item for paid users (📇 ניהול מנוי → `/subscription`)
  - [x] 2.8 Keep `DeleteAccountDialog` integration (🗑 מחיקת חשבון)

- [x] Task 3: Create dropdown menu for anonymous users (AC: #3)
  - [x] 3.1 Rewrite `AuthButton.tsx` (or create `AnonMenu.tsx`) — replace plain `SignInButton` with a dropdown trigger button labeled "התחבר"
  - [x] 3.2 Implement 4 menu items: הגדרות, צור קשר, דווח על בעיה, separator, התחבר
  - [x] 3.3 "התחבר" item opens Clerk sign-in modal (use `useClerk().openSignIn()` or wrap in `SignInButton`)
  - [x] 3.4 Update `AuthGate.tsx` to render the new anonymous menu component

- [x] Task 4: Mobile hamburger/drawer (AC: #4)
  - [x] 4.1 At `<768px`, replace avatar/login trigger with a hamburger icon (Menu from lucide-react)
  - [x] 4.2 Open a shadcn/ui `Sheet` (side="right" for RTL start-edge) containing all user-menu items
  - [x] 4.3 Sheet should also include overflow-menu items (sample doc, clear, presentation, direction) to unify mobile navigation
  - [x] 4.4 Add CSS/responsive classes to hide desktop dropdown and show mobile sheet trigger

- [x] Task 5: Navigation route handlers (AC: #1, #2, #3)
  - [x] 5.1 "המסמכים שלי" — for now, show a toast "בקרוב" (coming soon) since E15 is in backlog; or link to `/documents` as a placeholder
  - [x] 5.2 "הגדרות" → `router.push('/settings')` — page doesn't exist yet (E14), will 404; acceptable as E14 follows
  - [x] 5.3 "צור קשר" → `router.push('/contact')` — same, E14
  - [x] 5.4 "דווח על בעיה" → `router.push('/report-bug')` — same, E14
  - [x] 5.5 Consider adding placeholder stub pages (just a title + back-to-editor link) so routes don't 404

- [x] Task 6: Add/update tests (AC: #1–#4)
  - [x] 6.1 Update `UserMenu.test.tsx` — test 6 menu items render, sign-out calls `signOut()`, navigation items call `router.push`
  - [x] 6.2 Update `AuthButton.test.tsx` (or create `AnonMenu.test.tsx`) — test 4 menu items, sign-in trigger
  - [x] 6.3 Update `AuthGate.test.tsx` — verify correct component renders per auth state
  - [x] 6.4 Update `Header.test.tsx` — verify logo href is `/?home=true`
  - [x] 6.5 Test mobile sheet rendering at narrow viewport (if feasible with test setup)
  - [x] 6.6 Run full test suite — ensure 0 regressions

- [x] Task 7: CSS and styling (AC: #2, #3, #4)
  - [x] 7.1 Add `.marko-user-menu` dropdown styles in `globals.css` — glassmorphism matching header dropdowns
  - [x] 7.2 Add dark mode styles
  - [x] 7.3 Add mobile sheet styles if needed
  - [x] 7.4 Ensure all logical properties (no left/right), RTL correct

## Dev Notes

### Architecture Compliance

- **Component pattern**: Use shadcn/ui `DropdownMenu` (Radix-based), same as `OverflowMenu` from S12.3. Do NOT use Clerk's built-in `UserButton` for the menu — replace it entirely with a custom implementation.
- **Styling**: Glassmorphism matching all header dropdowns — `backdrop-filter: blur(16px) saturate(1.4)`, `rgba(6, 78, 59, 0.97)` background, emerald hover states.
- **RTL**: All logical properties. Icons go on `inline-end` (right side in RTL). Use `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-` — never `pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`.
- **Radix dropdown**: Same keyboard behavior as OverflowMenu — Arrow keys navigate, Enter selects, Escape closes and returns focus to trigger.
- **Mobile sheet**: Use shadcn/ui `Sheet` with `side="right"` (start edge in RTL). Sheet pattern already used by ColorPanel.

### Key Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `components/layout/Header.tsx` | MODIFY | Change logo `href` to `/?home=true` |
| `components/auth/UserMenu.tsx` | REWRITE | Replace Clerk UserButton with custom DropdownMenu |
| `components/auth/AuthButton.tsx` | REWRITE | Replace plain SignInButton with dropdown (or create AnonMenu.tsx) |
| `components/auth/AuthGate.tsx` | MODIFY | May need to pass additional props or swap to new component names |
| `components/auth/DeleteAccountDialog.tsx` | NO CHANGE | Keep as-is, still used from new UserMenu |
| `app/globals.css` | MODIFY | Add user-menu dropdown + mobile sheet CSS |
| `components/layout/Header.test.tsx` | MODIFY | Update logo href assertion |
| `components/auth/UserMenu.test.tsx` | REWRITE | Test new dropdown menu items |
| `components/auth/AuthButton.test.tsx` | REWRITE | Test new anonymous menu |
| `components/auth/AuthGate.test.tsx` | MODIFY | Verify integration |

### Existing Patterns to Follow

- **OverflowMenu.tsx** (S12.3) — Reference implementation for header zone dropdown. Uses Radix `DropdownMenu*` components, icons with labels, separators, glassmorphism scoped CSS.
- **UnifiedOutputDropdown** in Header.tsx — Another dropdown pattern (custom, non-Radix). Prefer the Radix pattern from OverflowMenu.
- **DeleteAccountDialog** — Shows how to use `useClerk().signOut()`.
- **Subscription page** (`app/subscription/page.tsx`) — Shows protected route pattern with `useCurrentUser()` and `router.push()`.

### Clerk API Usage

```typescript
// For user info (avatar, name):
import { useUser } from "@clerk/nextjs";
const { user } = useUser();
// user.firstName, user.imageUrl, user.primaryEmailAddress

// For sign-out:
import { useClerk } from "@clerk/nextjs";
const { signOut, openSignIn } = useClerk();
// signOut() — logs out
// openSignIn() — opens Clerk modal for anonymous sign-in item

// For modal sign-in (alternative):
import { SignInButton } from "@clerk/nextjs";
// Wrap the menu item in <SignInButton mode="modal">
```

### Navigation Routes (Dependency Awareness)

| Menu Item | Route | Status | Epic |
|-----------|-------|--------|------|
| המסמכים שלי | `/documents` or sidebar | NOT BUILT | E15 (backlog) |
| הגדרות | `/settings` | NOT BUILT | E14/S14.2 (backlog) |
| צור קשר | `/contact` | NOT BUILT | E14/S14.3 (backlog) |
| דווח על בעיה | `/report-bug` | NOT BUILT | E14/S14.3 (backlog) |
| ניהול מנוי | `/subscription` | EXISTS | E9 (done) |
| התנתק | Clerk signOut() | EXISTS | E5 (done) |
| התחבר | Clerk openSignIn() | EXISTS | E5 (done) |

**Decision**: Create minimal stub pages (`/settings`, `/contact`, `/report-bug`) with a Hebrew title and a "חזרה לעורך" (back to editor) link, so navigation doesn't 404. These stubs will be replaced by full implementations in E14. For "המסמכים שלי", show a toast "בקרוב — ניהול מסמכים יגיע בגרסה הבאה" since document management (E15) requires sidebar UI.

### Previous Story Intelligence (S12.3)

- All header dropdown patterns now use shadcn/ui Radix components (UnifiedOutputDropdown, ToolbarDropdown, OverflowMenu) — continue this pattern.
- Header props destructuring is complete — no new props needed for S12.4 (AuthGate is self-contained).
- OverflowMenu CSS class `.marko-overflow-menu` — follow this naming for `.marko-user-menu`.
- 701 tests passing after S12.3. No cleanup needed.
- `shadcn/ui dropdown-menu.tsx` component already installed — no need to `npx shadcn add`.

### Git Intelligence

Recent commits follow pattern: "Story X.Y done: <description> + code review fixes". Last 5 commits are all in Epic 11–12 (header/visual redesign). Code conventions are stable.

### Mobile Drawer Considerations

- At `<768px` the header currently shows: Brand (logo only) + AI + overflow + user.
- The mobile drawer should unify overflow + user menu items into a single sheet for clean mobile UX.
- Alternatively, keep overflow and user menus separate but both as bottom-edge or side-edge sheets.
- The spec says "all items move into a hamburger/drawer menu" — this means the USER MENU items move to a drawer. The overflow menu stays separate (it's already optimized for mobile).
- Use the hamburger icon (lucide `Menu`) at `<768px` to replace the avatar/login button.

### Project Structure Notes

- Alignment with unified project structure: auth components stay in `components/auth/`, layout in `components/layout/`.
- Stub pages go in `app/settings/page.tsx`, `app/contact/page.tsx`, `app/report-bug/page.tsx`.
- No new lib/ files needed — use existing hooks (`useCurrentUser`, `useClerk`, `useUser`).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-12, Story 12.4]
- [Source: _bmad-output/benakiva-feedback-round1.md#U4-Navigation]
- [Source: _bmad-output/benakiva-feedback-round1.md#N4-Skip-Landing]
- [Source: _bmad-output/planning-artifacts/architecture.md#Auth-Components]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Header-Layout]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Dropdown-Patterns]
- [Source: _bmad-output/implementation-artifacts/12-3-overflow-menu-and-bidi-simplification.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Radix DropdownMenu in JSDOM requires: pointerdown event dispatch, ResizeObserver polyfill, getBoundingClientRect mock, and async delay for portal rendering.

### Completion Notes List

- Task 1: Updated logo `<Link href="/">` to `<Link href="/?home=true">` in Header.tsx. Header test updated to verify new href.
- Task 2: Fully rewrote UserMenu.tsx — replaced Clerk's `UserButton` with shadcn/ui Radix `DropdownMenu`. Custom avatar trigger shows user image or initials in emerald circle. 6 menu items: המסמכים שלי, הגדרות, צור קשר, דווח על בעיה, מחיקת חשבון, התנתק. Subscription item for paid users. Icons on inline-end (RTL). DeleteAccountDialog integration preserved. Paid badge preserved.
- Task 3: Rewrote AuthButton.tsx — replaced Clerk's `SignInButton` with Radix `DropdownMenu`. Guest user icon trigger. 4 menu items: הגדרות, צור קשר, דווח על בעיה, התחבר. Sign-in uses `useClerk().openSignIn()`.
- Task 4: Created MobileUserSheet.tsx — at `<768px`, a hamburger `Menu` icon opens shadcn/ui `Sheet` (side="right") with all user-menu items. AuthGate.tsx updated to render both desktop dropdown and mobile sheet containers, toggled via CSS media queries.
- Task 5: Created 3 stub pages: `/settings`, `/contact`, `/report-bug` — each with Hebrew title, description, and "חזרה לעורך" link. "המסמכים שלי" shows toast "בקרוב — ניהול מסמכים יגיע בגרסה הבאה" since E15 is in backlog.
- Task 6: Rewrote all 4 auth test files (UserMenu, AuthButton, AuthGate, auth-persistence) + updated Header test. Used Radix-compatible test patterns (pointerdown events, ResizeObserver polyfill, async portal waits). 710 tests passing, 0 regressions.
- Task 7: Added `.marko-user-menu` CSS in globals.css — glassmorphism matching overflow menu. Added `.marko-mobile-sheet` styles. Added `.marko-user-desktop`/`.marko-user-mobile` responsive toggle at 768px breakpoint. All logical properties used (no left/right).

### Change Log

- 2026-03-22: Story 12.4 implemented — User menu & navigation with custom Radix dropdowns, mobile drawer, stub pages, and full test coverage.

### File List

- components/layout/Header.tsx (MODIFIED — logo href to /?home=true)
- components/auth/UserMenu.tsx (REWRITTEN — custom Radix DropdownMenu)
- components/auth/AuthButton.tsx (REWRITTEN — custom Radix DropdownMenu for anonymous users)
- components/auth/AuthGate.tsx (MODIFIED — desktop/mobile dual rendering)
- components/auth/MobileUserSheet.tsx (NEW — mobile hamburger sheet)
- app/settings/page.tsx (NEW — stub page)
- app/contact/page.tsx (NEW — stub page)
- app/report-bug/page.tsx (NEW — stub page)
- app/globals.css (MODIFIED — user-menu + mobile sheet CSS)
- components/auth/UserMenu.test.tsx (REWRITTEN — Radix-compatible tests)
- components/auth/AuthButton.test.tsx (REWRITTEN — Radix-compatible tests)
- components/auth/AuthGate.test.tsx (REWRITTEN — updated for dual rendering)
- components/auth/auth-persistence.test.tsx (MODIFIED — updated mocks)
- components/layout/Header.test.tsx (MODIFIED — updated mocks + logo href test)
- _bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED — status tracking)
- _bmad-output/implementation-artifacts/12-4-user-menu-and-navigation.md (MODIFIED — story status)
