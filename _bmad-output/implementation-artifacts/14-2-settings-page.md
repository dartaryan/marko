# Story 14.2: Settings Page

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a settings page where I can configure my preferences,
So that Marko remembers how I like to work.

## Acceptance Criteria

1. **AC1: Settings page renders with 3 sections** — Given the `/settings` page, When rendered, Then it shows 3 sections: "עריכה" (Editing), "מראה" (Appearance), and "חשבון" (Account — logged-in only). Each section has a Hebrew heading and a visual card container.

2. **AC2: Editing section — text direction** — Given the "עריכה" section, When the user selects a direction option from the radio group, Then the selected value (auto/rtl/ltr) is persisted to `marko-v2-doc-direction` in localStorage, And the change is applied immediately to the editor (no page reload required). Default: auto (BiDi). Labels: "אוטומטי (BiDi)" | "ימין לשמאל" | "שמאל לימין".

3. **AC3: Editing section — auto-save toggle** — Given the "עריכה" section, When the user toggles auto-save, Then the value is persisted to `marko-v2-auto-save` in localStorage. Default: true (on). Label: "שמירה אוטומטית". This is a new localStorage key — the editor currently always auto-saves. This toggle controls whether future document management (E15) auto-saves content.

4. **AC4: Appearance section — default color theme** — Given the "מראה" section, When the user selects a curated theme from the theme picker grid, Then the selected theme ID is persisted to `marko-v2-active-theme` via the existing `useThemeSelection` hook, And the theme colors are applied immediately via `useColorTheme`. Reuse the existing `PresetGrid` component from `components/theme/PresetGrid.tsx`.

5. **AC5: Appearance section — dark/light mode preference** — Given the "מראה" section, When the user selects a mode from the radio group "מערכת" | "אור" | "אפל", Then the preference is persisted to `marko-v2-ui-mode-pref` in localStorage. "מערכת" follows `prefers-color-scheme`, "אור" forces light, "אפל" forces dark. Current behavior: `useTheme` already supports system detection on first visit and manual toggle — extend this to support explicit 3-way preference.

6. **AC6: Appearance section — font size** — Given the "מראה" section, When the user selects "קטן" | "בינוני" | "גדול" from the radio group, Then the preference is persisted to `marko-v2-font-size` in localStorage, And a CSS class (`font-size-small`/`font-size-medium`/`font-size-large`) is applied to the editor and preview containers. Default: "בינוני" (medium). New localStorage key and hook — no font size control exists yet.

7. **AC7: Account section — only for logged-in users** — Given an anonymous user on `/settings`, When the page renders, Then the "חשבון" section is not shown. Given a logged-in user, Then the "חשבון" section shows: email, name (from Clerk), subscription status ("חינם"/"פרימיום"), and AI usage ("3 מתוך 5 פעולות AI החודש").

8. **AC8: Account section — AI usage display** — Given a logged-in user, When the Account section renders, Then `getMyMonthlyUsage` query is called via `useQuery(api.usage.getMyMonthlyUsage)`, And the result is displayed as "X מתוך Y פעולות AI החודש" with a progress bar. If `limit` is null (paid user), show "שימוש ללא הגבלה".

9. **AC9: Convex userSettings table** — Given a logged-in user changes a setting, When the value is saved, Then it is ALSO synced to the new Convex `userSettings` table via a mutation. On page load for logged-in users, settings are loaded from Convex (overriding localStorage). The `userSettings` table stores: `userId`, `docDirection`, `autoSave`, `activeThemeId`, `darkLightModePref`, `fontSize`, `updatedAt`.

10. **AC10: Navigation and accessibility** — Given the settings page, Then a "חזרה לעורך" link is shown at the top (navigates to `/editor`), And the page is accessible from the user menu "הגדרות" item (already wired in `UserMenu.tsx:88-94`), And all form controls have proper ARIA labels, And the page supports keyboard navigation (Tab between controls, Space/Enter to activate).

## Tasks / Subtasks

- [x] Task 1: Create Convex `userSettings` table and mutations (AC: #9)
  - [x] 1.1 Add `userSettings` table to `convex/schema.ts` with fields: userId (FK users), docDirection, autoSave, activeThemeId, darkLightModePref, fontSize, updatedAt
  - [x] 1.2 Create `convex/userSettings.ts` with:
    - `getMySettings` query — returns settings for current user or null
    - `saveMySettings` mutation — upserts settings for current user
  - [x] 1.3 Add index `by_userId` on the `userSettings` table

- [x] Task 2: Create new hooks for settings that don't exist yet (AC: #3, #5, #6)
  - [x] 2.1 Create `lib/hooks/useAutoSave.ts` — `useLocalStorage<boolean>('marko-v2-auto-save', true)`
  - [x] 2.2 Create `lib/hooks/useFontSize.ts` — `useLocalStorage<'small' | 'medium' | 'large'>('marko-v2-font-size', 'medium')`; applies CSS class to `document.documentElement` via `useEffect`
  - [x] 2.3 Create `lib/hooks/useDarkLightModePref.ts` — `useLocalStorage<'system' | 'light' | 'dark'>('marko-v2-ui-mode-pref', 'system')`; integrates with existing `useTheme` to apply the correct mode
  - [x] 2.4 Add corresponding TypeScript types to `types/editor.ts` if needed

- [x] Task 3: Create `SettingsPage` component replacing the stub (AC: #1, #10)
  - [x] 3.1 Replace `app/settings/page.tsx` content with full settings page
  - [x] 3.2 Layout: RTL `dir="rtl"`, single-column centered layout (max-w-2xl), with "חזרה לעורך" link at top
  - [x] 3.3 Three card sections with Hebrew headings: "עריכה", "מראה", "חשבון"
  - [x] 3.4 Must be a client component (`"use client"`) since it uses hooks
  - [x] 3.5 Add proper ARIA labels to all controls

- [x] Task 4: Implement Editing section (AC: #2, #3)
  - [x] 4.1 Direction radio group using `useDocDirection` hook — 3 options with Hebrew labels
  - [x] 4.2 Auto-save toggle using `useAutoSave` hook — on/off Switch or Checkbox

- [x] Task 5: Implement Appearance section (AC: #4, #5, #6)
  - [x] 5.1 Theme picker — render `PresetGrid` component (from `components/theme/PresetGrid.tsx`) using `useThemeSelection` and `useColorTheme` hooks
  - [x] 5.2 Dark/light mode radio group using `useDarkLightModePref` hook — 3 options
  - [x] 5.3 Font size radio group using `useFontSize` hook — 3 options with Hebrew labels

- [x] Task 6: Implement Account section (AC: #7, #8)
  - [x] 6.1 Conditionally render using `useCurrentUser()` — hide for anonymous users
  - [x] 6.2 Display email, name from `useUser()` (Clerk)
  - [x] 6.3 Subscription status badge using `user.tier` from Convex
  - [x] 6.4 AI usage display via `useQuery(api.usage.getMyMonthlyUsage)` with progress bar

- [x] Task 7: Convex sync integration (AC: #9)
  - [x] 7.1 On settings page load for logged-in users: call `getMySettings` and override localStorage with Convex values
  - [x] 7.2 On any setting change for logged-in users: call `saveMySettings` mutation to sync to Convex
  - [x] 7.3 Debounce Convex saves (500ms) to avoid excessive mutations on rapid changes

- [x] Task 8: Write tests (AC: #1-#10)
  - [x] 8.1 Create `app/settings/page.test.tsx` — test all 3 sections render
  - [x] 8.2 Test: anonymous user does not see Account section
  - [x] 8.3 Test: direction radio group reads/writes `marko-v2-doc-direction`
  - [x] 8.4 Test: auto-save toggle reads/writes `marko-v2-auto-save`
  - [x] 8.5 Test: theme picker selection updates active theme
  - [x] 8.6 Test: dark/light mode radio group persists preference
  - [x] 8.7 Test: font size radio group persists preference
  - [x] 8.8 Test: Account section shows email, tier, AI usage for logged-in user
  - [x] 8.9 Test: keyboard navigation (Tab through controls)
  - [x] 8.10 Create `lib/hooks/useAutoSave.test.ts`, `lib/hooks/useFontSize.test.ts`, `lib/hooks/useDarkLightModePref.test.ts`

## Dev Notes

### Architecture Compliance

- **Framework**: Next.js 16.1 App Router, React 19.2, TypeScript strict mode
- **Rendering**: Settings page should be a `"use client"` component (uses hooks extensively)
- **Styling**: Tailwind v4 with logical CSS properties (RTL-aware). Use `ps-`, `pe-`, `ms-`, `me-` instead of `pl-`, `pr-`, `ml-`, `mr-`
- **Icons**: Lucide React only (already imported in the project)
- **Components**: shadcn/ui for form controls — use existing Button, Switch/Checkbox, RadioGroup if available; otherwise use plain HTML radio inputs styled with Tailwind
- **Testing**: Vitest with co-located `.test.tsx` files
- **Convex patterns**: Follow existing patterns in `convex/users.ts` — use `ctx.auth.getUserIdentity()` for auth, `ConvexError` for errors

### localStorage Key Conventions

All keys use `marko-v2-*` prefix with hyphens:

| Key | Hook | Type | Default | Status |
|-----|------|------|---------|--------|
| `marko-v2-doc-direction` | `useDocDirection` | `"auto" \| "rtl" \| "ltr"` | `"rtl"` | EXISTS |
| `marko-v2-active-theme` | `useThemeSelection` | `string` | `""` | EXISTS |
| `marko-v2-ui-mode` | `useTheme` | `boolean` | `false` | EXISTS |
| `marko-v2-auto-save` | `useAutoSave` | `boolean` | `true` | NEW |
| `marko-v2-font-size` | `useFontSize` | `"small" \| "medium" \| "large"` | `"medium"` | NEW |
| `marko-v2-ui-mode-pref` | `useDarkLightModePref` | `"system" \| "light" \| "dark"` | `"system"` | NEW |

### Existing Components to Reuse — DO NOT Reinvent

1. **`PresetGrid`** (`components/theme/PresetGrid.tsx`) — Full theme picker with curated themes, legacy presets, custom presets. Has keyboard navigation. Pass `activeThemeId`, `onThemeSelect`, `colorTheme`, `onColorChange` props.

2. **`useThemeSelection`** (`lib/hooks/useThemeSelection.ts`) — Returns `{ activeThemeId, activeTheme, setActiveThemeId }`. Manages curated theme selection with `marko-v2-active-theme` key.

3. **`useColorTheme`** (`lib/hooks/useColorTheme.ts`) — Returns `[colorTheme, setColorTheme]`. Manages the 17-property color theme object with `marko-v2-color-theme` key.

4. **`useDocDirection`** (`lib/hooks/useDocDirection.ts`) — Returns `[direction, setDirection]`. Already manages `marko-v2-doc-direction`.

5. **`useTheme`** (`lib/hooks/useTheme.ts`) — Returns `[isDark, toggleTheme]`. Manages dark mode with `marko-v2-ui-mode`. Note: currently a simple boolean toggle — extending to 3-way preference requires coordination with this hook.

6. **`useCurrentUser`** (`lib/hooks/useCurrentUser.ts`) — Returns `{ user, isLoading, isAuthenticated }`. User object has `tier` field.

7. **`useUser`** from `@clerk/nextjs` — Returns Clerk user with `primaryEmailAddress`, `firstName`, `lastName`, `imageUrl`.

### Dark/Light Mode 3-Way Preference — Implementation Approach

Current `useTheme` hook stores a boolean (`isDark`). For 3-way preference ("system" | "light" | "dark"):

**Approach:** Create a new `useDarkLightModePref` hook that stores the 3-way preference to `marko-v2-ui-mode-pref`. On settings page, this hook drives the radio group. The actual dark mode application still goes through `useTheme` / `.dark` class toggling:

- "system" → use `matchMedia('(prefers-color-scheme: dark)')` result
- "light" → force `isDark = false`
- "dark" → force `isDark = true`

When the preference changes, call the existing `useTheme`'s `setIsDark` (or directly set `marko-v2-ui-mode` in localStorage + toggle class). The FOUC script in `layout.tsx` may also need updating to read the new key.

**Alternative (simpler):** Store the 3-way value in `marko-v2-ui-mode-pref` and have `useTheme` read it on mount. If the pref key exists, use it; otherwise fall back to the existing boolean. This keeps backward compatibility.

### Font Size — New Feature

No font size control exists yet. Create a simple hook + CSS approach:

```typescript
// lib/hooks/useFontSize.ts
export type FontSize = 'small' | 'medium' | 'large';
export const FONT_SIZE_KEY = 'marko-v2-font-size';

export function useFontSize(): [FontSize, (size: FontSize) => void] {
  const [fontSize, setFontSize] = useLocalStorage<FontSize>(FONT_SIZE_KEY, 'medium');

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  return [fontSize, setFontSize];
}
```

CSS (in `globals.css`):
```css
[data-font-size="small"] { --editor-font-size: 14px; --preview-font-size: 15px; }
[data-font-size="medium"] { --editor-font-size: 16px; --preview-font-size: 16px; }
[data-font-size="large"] { --editor-font-size: 18px; --preview-font-size: 18px; }
```

Then reference `var(--editor-font-size)` in editor textarea and `var(--preview-font-size)` in preview container.

### Auto-Save Toggle — Forward-Looking

The editor currently always auto-saves to localStorage. The auto-save toggle is forward-looking for E15 (Document Management), where auto-save will persist to IndexedDB/Convex. For now, the toggle value is stored but the editor behavior doesn't change — the toggle provides a setting that E15 will read.

### Convex userSettings Table Schema

```typescript
userSettings: defineTable({
  userId: v.id("users"),
  docDirection: v.union(v.literal("auto"), v.literal("rtl"), v.literal("ltr")),
  autoSave: v.boolean(),
  activeThemeId: v.string(),
  darkLightModePref: v.union(v.literal("system"), v.literal("light"), v.literal("dark")),
  fontSize: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
  updatedAt: v.number(),
}).index("by_userId", ["userId"])
```

Pattern for query/mutation (follow `convex/users.ts`):
```typescript
// convex/userSettings.ts
export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db.query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return ctx.db.query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});
```

### AI Usage Display

Use `useQuery(api.usage.getMyMonthlyUsage)` which returns `{ count: number, limit: number | null }`.

- Free user: "3 מתוך 5 פעולות AI החודש" + progress bar (count/5)
- Paid user (limit=null): "שימוש ללא הגבלה" + no progress bar
- Show with `Sparkles` icon from lucide-react for visual consistency

### Page Layout Pattern

Follow the existing stub pattern and enhance. Single-column, centered, RTL:

```tsx
<main dir="rtl" lang="he" className="min-h-screen bg-[var(--background)] p-6">
  <div className="mx-auto max-w-2xl space-y-6">
    {/* Back link */}
    <Link href="/editor" className="...">← חזרה לעורך</Link>
    <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>

    {/* Section cards */}
    <section className="rounded-lg border p-6 ...">
      <h2>עריכה</h2>
      {/* ... */}
    </section>

    <section className="rounded-lg border p-6 ...">
      <h2>מראה</h2>
      {/* ... */}
    </section>

    {isAuthenticated && (
      <section className="rounded-lg border p-6 ...">
        <h2>חשבון</h2>
        {/* ... */}
      </section>
    )}
  </div>
</main>
```

### Settings Link — Already Done

`UserMenu.tsx:88-94` already has a "הגדרות" menu item linking to `/settings`. No changes needed to the user menu.

### Testing Patterns (from S14.1, S13.3)

- Vitest with co-located test files
- Mock `next/navigation`: `useRouter` returns `{ push: vi.fn(), replace: vi.fn() }`
- Mock `@clerk/nextjs`: `useUser` returns mock user object
- Mock Convex: `useQuery` and `useMutation` from `convex/react`
- Mock `localStorage`: JSDOM provides it by default in Vitest
- Use `act()` wrapper for state updates
- Test structure: describe blocks grouping by AC number

### Project Structure Notes

**New files:**
- `convex/userSettings.ts` — Convex queries and mutations
- `lib/hooks/useAutoSave.ts` — Auto-save preference hook
- `lib/hooks/useAutoSave.test.ts` — Tests
- `lib/hooks/useFontSize.ts` — Font size preference hook
- `lib/hooks/useFontSize.test.ts` — Tests
- `lib/hooks/useDarkLightModePref.ts` — 3-way dark/light preference hook
- `lib/hooks/useDarkLightModePref.test.ts` — Tests
- `app/settings/page.test.tsx` — Settings page tests

**Modified files:**
- `app/settings/page.tsx` — Replace stub with full implementation
- `convex/schema.ts` — Add `userSettings` table
- `app/globals.css` — Add font-size CSS custom properties

**No changes needed:**
- `components/auth/UserMenu.tsx` — Settings link already wired
- `components/theme/PresetGrid.tsx` — Reuse as-is
- `lib/hooks/useDocDirection.ts` — Use existing hook directly
- `lib/hooks/useThemeSelection.ts` — Use existing hook directly

### Previous Story Intelligence (S14.1)

Key patterns from the previous story in this epic:

1. **Client component pattern**: S14.1 created a separate client component (`LandingRedirectGuard`) that wraps server-rendered content. Settings page can be a full client component since it has no SEO requirement.
2. **localStorage try/catch**: Always wrap localStorage access in try/catch for Safari strict privacy mode.
3. **Exported constants**: Export key names (like `SEEN_KEY`) so other stories can import them. Do the same for new settings keys.
4. **Testing approach**: Mock navigation, mock localStorage behavior. Use `vi.mock` for external modules.
5. **S14.1 exported `SEEN_KEY`**: S14.2 could potentially add a "reset first-visit flag" in settings. Not in scope for this story but architecturally prepared.

### Git Intelligence

Recent commits show consistent patterns:
- Single commit per story with "Story X.Y done: description + code review fixes"
- Stories typically touch: component files, hook files, test files, CSS, sprint-status.yaml
- All recent stories (12.x, 13.x, 14.1) follow the same structure
- Tailwind v4 logical properties used consistently
- Co-located test files with Vitest

### References

- [Source: _bmad-output/benakiva-feedback-round1.md#N5] — Original settings page feedback
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-14, lines 1497-1527] — Story 14.2 epic definition
- [Source: _bmad-output/planning-artifacts/architecture.md] — Convex patterns, auth flow, localStorage strategy
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Color system, component strategy, RTL patterns
- [Source: convex/schema.ts] — Current Convex schema (no userSettings table yet)
- [Source: convex/usage.ts:55-82] — `getMyMonthlyUsage` query for AI usage display
- [Source: convex/lib/tierLimits.ts] — FREE_MONTHLY_AI_LIMIT = 5
- [Source: lib/hooks/useTheme.ts] — Current dark mode hook (boolean toggle)
- [Source: lib/hooks/useDocDirection.ts] — Direction hook (auto/rtl/ltr)
- [Source: lib/hooks/useThemeSelection.ts] — Theme selection hook (curated themes)
- [Source: lib/hooks/useLocalStorage.ts] — Generic localStorage hook with SSR-safe defaults
- [Source: lib/hooks/useCurrentUser.ts] — Auth state hook (isAuthenticated, user.tier)
- [Source: components/auth/UserMenu.tsx:88-94] — Settings link already wired
- [Source: components/theme/PresetGrid.tsx] — Theme picker grid component to reuse
- [Source: app/settings/page.tsx] — Current stub (to be replaced)
- [Source: _bmad-output/implementation-artifacts/14-1-skip-landing-for-returning-visitors.md] — Previous story patterns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed pre-existing `app/layout.test.ts` failure: mock used `Noto_Sans_Hebrew` but layout uses `Varela_Round`
- Updated Convex `_generated/api.d.ts` manually (couldn't run `convex codegen` without auth)
- Updated FOUC script to support 3-way dark/light preference and font-size data attribute

### Completion Notes List

- **Task 1**: Created `userSettings` Convex table with all fields, `by_userId` index, `getMySettings` query and `saveMySettings` mutation
- **Task 2**: Created 3 new hooks: `useAutoSave` (boolean toggle), `useFontSize` (data attribute + CSS vars), `useDarkLightModePref` (3-way mode with system media query listener). Types co-located with hooks.
- **Task 3**: Replaced settings stub with full client component. RTL layout, 3 card sections, Hebrew headings, ARIA labels on all controls
- **Task 4**: Direction radio group (auto/rtl/ltr) using `useDocDirection`; auto-save switch using `useAutoSave`
- **Task 5**: Theme picker via `PresetGrid` reuse; dark/light/system radio group; font size (small/medium/large) radio group with CSS custom properties
- **Task 6**: Account section conditionally rendered for logged-in users. Shows email, name (Clerk), tier badge, AI usage with progress bar
- **Task 7**: Convex sync: loads settings from Convex on mount (overrides localStorage), debounced 500ms save on any change
- **Task 8**: 40 tests total — 23 page tests (all ACs), 17 hook tests. All passing. Full suite: 892/892 pass.

### File List

**New files:**
- `convex/userSettings.ts` — Convex getMySettings query + saveMySettings mutation
- `lib/hooks/useAutoSave.ts` — Auto-save boolean preference hook
- `lib/hooks/useAutoSave.test.ts` — Tests (5 tests)
- `lib/hooks/useFontSize.ts` — Font size preference hook with CSS data attribute
- `lib/hooks/useFontSize.test.ts` — Tests (6 tests)
- `lib/hooks/useDarkLightModePref.ts` — 3-way dark/light mode preference hook
- `lib/hooks/useDarkLightModePref.test.ts` — Tests (6 tests)
- `app/settings/page.test.tsx` — Settings page tests (23 tests)
- `app/settings/test-utils.ts` — Test utilities for settings page

**Modified files:**
- `app/settings/page.tsx` — Replaced stub with full settings page implementation
- `convex/schema.ts` — Added `userSettings` table definition
- `convex/_generated/api.d.ts` — Added `userSettings` module import
- `app/globals.css` — Added font-size CSS custom properties (`[data-font-size]`), preview-content font-size var
- `app/layout.tsx` — Updated FOUC script to support 3-way mode pref + font-size
- `app/layout.test.ts` — Fixed pre-existing font mock mismatch (Noto_Sans_Hebrew → Varela_Round)
- `components/editor/EditorTextarea.tsx` — Added `style={{ fontSize: var(--editor-font-size) }}`

## Change Log

- 2026-03-25: Implemented Story 14.2 — Settings page with 3 sections (Editing, Appearance, Account), Convex userSettings table, 3 new hooks, font-size CSS system, FOUC script update, 40 new tests
