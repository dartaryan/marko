# Story 2.5: Dark/Light Mode Toggle

Status: done

## Story

As a user,
I want to toggle between dark and light UI modes,
so that I can use Marko comfortably in different lighting conditions.

## Acceptance Criteria

1. **AC1: Toggle behavior** — Given the user clicks the dark/light mode toggle in the header, when the mode switches, then the UI updates to dark or light theme using Tailwind `dark:` classes following shadcn conventions. The `.dark` class is added to / removed from `document.documentElement`.

2. **AC2: Accessibility** — The toggle button has a Hebrew `aria-label` (`'עבור למצב כהה'` in light mode, `'עבור למצב בהיר'` in dark mode) and is keyboard accessible (receives focus, activates on Enter/Space).

3. **AC3: Persistence** — The mode preference persists to localStorage under key `marko-v2-ui-mode` (boolean, JSON-serialized) across page reloads and sessions.

4. **AC4: System preference** — On first visit (no saved preference), the system respects `window.matchMedia('(prefers-color-scheme: dark)').matches` as the initial default. The system preference is only checked when `localStorage.getItem('marko-v2-ui-mode')` is `null`.

5. **AC5: No FOUC** — The `.dark` class is applied before React hydration (via an inline `<script>` in `<head>`) so there is no flash of unstyled content for returning dark-mode users.

6. **AC6: Color theme independence** — The user's 17-property color theme (managed by `useColorTheme`) is not altered when toggling dark/light mode. The dark mode toggle only affects UI chrome (shadcn variables). This is inherently guaranteed because `applyColorTheme()` sets inline styles on `document.documentElement.style`, which have higher CSS specificity than `.dark` class rules.

## Tasks / Subtasks

- [x] Task 1: Create `lib/hooks/useTheme.ts` (AC: #1, #3, #4)
  - [x] 1.1: Export `export const UI_MODE_KEY = 'marko-v2-ui-mode'`
  - [x] 1.2: Implement `export function useTheme(): [isDark: boolean, toggleTheme: () => void]`
  - [x] 1.3: Use `useLocalStorage<boolean>(UI_MODE_KEY, false)` for state — SSR default is `false` (light)
  - [x] 1.4: `useEffect` #1 (deps: `[]`) — on mount, read `window.localStorage.getItem(UI_MODE_KEY)` directly (raw, not via hook); if `null`, call `setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)` to apply system preference
  - [x] 1.5: `useEffect` #2 (deps: `[isDark]`) — sync DOM: `document.documentElement.classList.toggle('dark', isDark)`
  - [x] 1.6: Return `[isDark, () => setIsDark(v => !v)]`

- [x] Task 2: Create `components/theme/ThemeToggle.tsx` (AC: #1, #2, #5, #6)
  - [x] 2.1: `'use client'` directive; import `Moon, Sun` from `lucide-react`; import `useTheme` from `@/lib/hooks/useTheme`
  - [x] 2.2: Render `<button type="button">` with `suppressHydrationWarning` (required — SSR renders `isDark=false`, client may differ)
  - [x] 2.3: `aria-label` and `title`: `isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'`
  - [x] 2.4: Icon: show `<Moon className="size-4" aria-hidden="true" />` when `!isDark` (click → go dark), `<Sun className="size-4" aria-hidden="true" />` when `isDark` (click → go light)
  - [x] 2.5: Button className matches existing Header utility buttons exactly: `"flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"`

- [x] Task 3: Update `app/layout.tsx` — FOUC prevention (AC: #5)
  - [x] 3.1: Inside the `<html>` tag but before `<body>`, add a `<head>` element (if not already present) with an inline `<script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />`
  - [x] 3.2: Define `FOUC_SCRIPT` as a constant outside the component (for SSR safety): reads `localStorage.getItem('marko-v2-ui-mode')`, parses it; if `null` falls back to `matchMedia('(prefers-color-scheme: dark)').matches`; if dark adds `'dark'` class to `document.documentElement` — wrap entire script in `try{}catch(e){}`
  - [x] 3.3: `suppressHydrationWarning` is already on `<html>` — do NOT remove it; the script causes a `.dark` class difference between SSR and client, which is expected and suppressed

- [x] Task 4: Update `components/layout/Header.tsx` (AC: #1, #2)
  - [x] 4.1: Add import: `import { ThemeToggle } from '@/components/theme/ThemeToggle'`
  - [x] 4.2: Remove `onOpenColorPanel` prop and the inline Palette button — **NO**, keep them. Add `<ThemeToggle />` as a new element inside the `<div className="flex items-center gap-1">` utility buttons group, placed between the Palette button and `<DirectionToggle />`

- [x] Task 5: Create `components/theme/ThemeToggle.test.tsx` (AC: #1, #2, #3)
  - [x] 5.1: Test: renders button with `aria-label="עבור למצב כהה"` in initial light mode (default)
  - [x] 5.2: Test: clicking the button adds `'dark'` class to `document.documentElement` and updates `localStorage['marko-v2-ui-mode']` to `true`
  - [x] 5.3: Test: clicking the button a second time removes `'dark'` class and sets localStorage to `false`
  - [x] 5.4: Test (SSR): `renderToStaticMarkup(<ThemeToggle />)` contains `aria-label="עבור למצב כהה"` (light-mode default, no localStorage on server)

## Dev Notes

### Critical: No `next-themes` — Custom Implementation

**Do NOT install `next-themes`** — it is not in `package.json` and not part of the architecture. The existing `globals.css` already defines all dark-mode CSS variables under `.dark, [data-theme="dark"]`. The implementation is a thin custom hook.

### Dark Mode CSS Mechanism

`app/globals.css` uses:
```css
@custom-variant dark (&:is(.dark *));  /* Tailwind dark: prefix activates */
.dark, [data-theme="dark"] { ... }     /* All shadcn + Marko 17-color overrides */
```
Adding `.dark` to `<html>` activates Tailwind `dark:` prefixed classes everywhere AND switches the shadcn CSS variables. No other change to `globals.css` is needed.

### Why Color Theme Is Already Independent (AC6)

`applyColorTheme()` in `lib/colors/apply-colors.ts` calls `root.style.setProperty(cssVar, value)` — this sets **inline styles** on `document.documentElement`. Inline styles have higher CSS specificity than class-based rules. Therefore `useColorTheme`'s applied values always win over `.dark` class CSS. AC6 requires no additional code.

### `useTheme` Hook — Complete Implementation

```typescript
'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const UI_MODE_KEY = 'marko-v2-ui-mode';

export function useTheme(): [isDark: boolean, toggleTheme: () => void] {
  const [isDark, setIsDark] = useLocalStorage<boolean>(UI_MODE_KEY, false);

  // On first mount: if no saved preference, apply system preference.
  // Cannot do this in useLocalStorage lazy init — matchMedia requires browser.
  // Read localStorage raw to detect "no saved preference" state.
  useEffect(() => {
    const saved = window.localStorage.getItem(UI_MODE_KEY);
    if (saved === null) {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync .dark class on <html> whenever isDark changes.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return [isDark, () => setIsDark((v) => !v)];
}
```

**Why read localStorage raw in Effect #1:** `useLocalStorage` lazy initializer already returns the stored value (or `false` if absent). We need to distinguish "stored as `false`" vs "not stored at all". The raw `localStorage.getItem` check for `null` is the correct way to detect "no saved preference".

**Why `useEffect` for system check (not lazy init):** `window.matchMedia` is unavailable on server (SSR would throw). All `window`/`document` access must be inside `useEffect` or guarded by `typeof window !== 'undefined'`.

### `ThemeToggle.tsx` — Complete Implementation

```tsx
'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';

export function ThemeToggle() {
  const [isDark, toggleTheme] = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      title={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      suppressHydrationWarning
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                 hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
```

**Why `suppressHydrationWarning` on the button:** SSR renders with `isDark=false` (server has no localStorage). Client may have `isDark=true` from localStorage. The `aria-label`, `title`, and child icon differ. `suppressHydrationWarning` suppresses this single-element mismatch. This is the same pattern used in `ViewModeToggle.tsx` (line 53, commit `83f4806`).

### `app/layout.tsx` — FOUC Prevention Script

```tsx
const FOUC_SCRIPT = `try{var s=localStorage.getItem('marko-v2-ui-mode');var d=s!==null?JSON.parse(s):window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`;

// In RootLayout, add <head> before <body>:
return (
  <html lang="he" dir="rtl" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
    </head>
    <body className={`${notoSansHebrew.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </body>
  </html>
);
```

**Why minified:** The script runs on every page load in the critical rendering path. Minimizing it reduces parse time. The try/catch prevents any localStorage error (private mode, quota, etc.) from breaking page load.

**Why `dangerouslySetInnerHTML`:** Next.js requires this for inline scripts. The string contains no user input — it's a static constant. No XSS risk.

**Why `suppressHydrationWarning` stays on `<html>`:** The inline script modifies the DOM (adds `.dark`) before React hydrates. React will see `.dark` on `<html>` when it was not in the server-rendered HTML. `suppressHydrationWarning` on `<html>` (already present) suppresses this mismatch. Do NOT remove it.

### `Header.tsx` — Placement of ThemeToggle

Add `<ThemeToggle />` between the Palette button and `<DirectionToggle />`:

```tsx
// In Header.tsx, add import:
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// In the utility buttons <div className="flex items-center gap-1">:
<button onClick={onOpenColorPanel} ...><Palette .../></button>
<ThemeToggle />                          {/* ADD HERE */}
<DirectionToggle value={docDirection} onChange={onDirectionChange} />
// ... rest of buttons
```

`Header.tsx` receives no new props. `ThemeToggle` manages its own state via `useTheme`.

### `ThemeToggle.test.tsx` — Full Test File

Use the `createRoot` + `act` pattern from `ColorPanel.test.tsx`. Tests run in jsdom (vitest config: `environment: 'jsdom'`).

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ThemeToggle } from './ThemeToggle';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  act(() => { root?.unmount(); });
  document.body.removeChild(container);
});

describe('ThemeToggle', () => {
  it('renders with aria-label "עבור למצב כהה" in light mode (default)', () => {
    act(() => { root = createRoot(container); root.render(<ThemeToggle />); });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('עבור למצב כהה');
  });

  it('clicking adds .dark class to documentElement', () => {
    act(() => { root = createRoot(container); root.render(<ThemeToggle />); });
    act(() => { container.querySelector('button')!.click(); });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('clicking persists isDark=true to localStorage', () => {
    act(() => { root = createRoot(container); root.render(<ThemeToggle />); });
    act(() => { container.querySelector('button')!.click(); });
    expect(JSON.parse(localStorage.getItem('marko-v2-ui-mode')!)).toBe(true);
  });

  it('clicking twice removes .dark class', () => {
    act(() => { root = createRoot(container); root.render(<ThemeToggle />); });
    act(() => { container.querySelector('button')!.click(); });
    act(() => { container.querySelector('button')!.click(); });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('SSR renders with light-mode aria-label (no localStorage on server)', () => {
    const html = renderToStaticMarkup(<ThemeToggle />);
    expect(html).toContain('aria-label="עבור למצב כהה"');
  });
});
```

### Architecture Compliance

| Rule | Compliance |
|---|---|
| `dark:` via Tailwind `dark:` prefix | ThemeToggle toggles `.dark` on `<html>` — all shadcn `dark:` classes activate |
| No external state library | Custom `useTheme` hook with `useLocalStorage` — no Redux, no Zustand |
| localStorage key naming `marko-v2-*` | `UI_MODE_KEY = 'marko-v2-ui-mode'` |
| `'use client'` on interactive components | ThemeToggle and useTheme both marked `'use client'` |
| Hebrew `aria-label` on all interactive elements | `'עבור למצב כהה'` / `'עבור למצב בהיר'` |
| PascalCase component files in `components/theme/` | `ThemeToggle.tsx` |
| Hook files: `use` prefix, camelCase, in `lib/hooks/` | `useTheme.ts` |
| `suppressHydrationWarning` pattern for localStorage-driven UI | Same pattern as `ViewModeToggle.tsx` |

### Anti-Patterns to Avoid

- **Do NOT** install `next-themes` — not in architecture, not needed.
- **Do NOT** use `[data-theme="dark"]` attribute approach — the project uses `.dark` class. `globals.css` has both selectors (`.dark, [data-theme="dark"]`) but classList manipulation is the standard approach.
- **Do NOT** call `applyColorTheme()` from `useTheme` — dark mode must NOT reset the user's color theme. Color theme independence is already guaranteed by CSS specificity.
- **Do NOT** add the 17-color Marko CSS variables to the `.dark` scope again — they are already in `globals.css` lines 150–174. Do not duplicate.
- **Do NOT** add dark mode overrides for the 17-color Marko CSS vars in the inline script — those vars are always controlled by `applyColorTheme()` inline styles. The FOUC script only needs to set the `.dark` class.
- **Do NOT** use `document.body.className` — class must go on `document.documentElement` (`<html>`) so Tailwind `dark:` prefix activates everywhere (it checks ancestor chain via `@custom-variant dark (&:is(.dark *))`).
- **Do NOT** add `ThemeToggle` as a new prop to `Header` component — `ThemeToggle` manages its own state internally. `Header.tsx` needs no new props.
- **Do NOT** use `useEffect` with `isDark` dependency to set localStorage — `useLocalStorage` setter already handles persistence.
- **Do NOT** read `prefers-color-scheme` in `useLocalStorage` lazy initializer — it requires `window` which is unavailable on SSR.

### Previous Story Intelligence

From Story 2.1:
- `useLocalStorage<T>(key, initialValue)` — lazy init reads from localStorage on client; server returns `initialValue`. `suppressHydrationWarning` pattern for components that read localStorage.
- `COLOR_THEME_KEY = 'marko-v2-color-theme'` — follow same naming convention for `UI_MODE_KEY = 'marko-v2-ui-mode'`.

From Story 2.2:
- `ACTIVE_PRESET_KEY = 'marko-v2-active-preset'` — confirms `marko-v2-*` namespace for all localStorage keys.
- `motion-safe:` prefix for animations — not needed here (simple transition-colors).

From git history (commits `83f4806`, `122c645`):
- Project has had recurring hydration mismatches with localStorage-driven state. The established fix is `suppressHydrationWarning` on the element that shows different content server vs client.
- Never render computed-from-localStorage values in SSR without `suppressHydrationWarning` on that element.

### Project Structure Notes

**Files to CREATE (new in Story 2.5):**
- `lib/hooks/useTheme.ts` — custom dark mode hook
- `components/theme/ThemeToggle.tsx` — toggle button component
- `components/theme/ThemeToggle.test.tsx` — unit tests

**Files to MODIFY (existing):**
- `app/layout.tsx` — add `<head>` with FOUC prevention script
- `components/layout/Header.tsx` — import `ThemeToggle`, render in utility buttons group

**Files NOT to touch:**
- `app/globals.css` — dark CSS already defined; no changes needed
- `lib/hooks/useLocalStorage.ts` — reused as-is
- `lib/hooks/useColorTheme.ts` — color system is independent; do NOT modify
- `lib/colors/apply-colors.ts` — unchanged; CSS specificity guarantees independence
- `components/theme/ColorPanel.tsx` — no changes needed for dark mode
- `components/theme/PresetGrid.tsx` — finalized; do NOT touch
- Any Epic 1 components — no changes needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.5 acceptance criteria](_bmad-output/planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/architecture.md — ThemeToggle.tsx in components/theme/, useTheme.ts hook, dark mode: Tailwind dark: prefix following shadcn conventions](_bmad-output/planning-artifacts/architecture.md)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Toggle (shadcn) for dark/light mode, icon-based, dark/light mode via CSS variable sets](_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: app/globals.css — @custom-variant dark (&:is(.dark *)); .dark, [data-theme="dark"] { } with all shadcn + 17-color overrides already defined](app/globals.css)
- [Source: app/layout.tsx — suppressHydrationWarning on html, existing layout structure for FOUC script placement](app/layout.tsx)
- [Source: lib/colors/apply-colors.ts — root.style.setProperty() for inline styles; guarantees color theme independence from dark mode](lib/colors/apply-colors.ts)
- [Source: lib/hooks/useLocalStorage.ts — existing hook to reuse; lazy init pattern; SSR guard](lib/hooks/useLocalStorage.ts)
- [Source: components/layout/ViewModeToggle.tsx — suppressHydrationWarning pattern (line 53, commit 83f4806)](components/layout/ViewModeToggle.tsx)
- [Source: components/theme/ColorPanel.test.tsx — test pattern: createRoot + act; beforeEach localStorage.clear()](components/theme/ColorPanel.test.tsx)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

- jsdom does not implement `window.matchMedia` — added mock in `ThemeToggle.test.tsx` `beforeEach` returning `{ matches: false }`. SSR test passed without the mock since it uses `renderToStaticMarkup` (no effects run).

### Completion Notes List

- Implemented `useTheme` hook with two effects: (1) system preference detection on mount when no saved preference, (2) `.dark` class sync on `<html>` whenever `isDark` changes.
- `ThemeToggle` component uses `suppressHydrationWarning` on the button, matching the pattern established in `ViewModeToggle.tsx` (commit `83f4806`).
- FOUC prevention script added to `app/layout.tsx` as a minified inline `<script>` in `<head>`, wrapped in `try/catch` for private-mode safety.
- `ThemeToggle` inserted in `Header.tsx` between the Palette button and `DirectionToggle` — no new props added to Header.
- 5 unit tests: 4 DOM interaction tests + 1 SSR test. All pass (157/157 total suite).
- AC6 confirmed: color theme independence guaranteed by CSS specificity (inline styles vs class rules) — no code changes needed.

### File List

- `lib/hooks/useTheme.ts` (new)
- `components/theme/ThemeToggle.tsx` (new)
- `components/theme/ThemeToggle.test.tsx` (new)
- `app/layout.tsx` (modified — added FOUC_SCRIPT constant and `<head>` with inline script)
- `components/layout/Header.tsx` (modified — added ThemeToggle import and element)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — status updated)
- `_bmad-output/implementation-artifacts/2-5-dark-light-mode-toggle.md` (new — story file)

## Senior Developer Review (AI)

**Reviewer:** BenAkiva on 2026-03-07
**Outcome:** Changes Requested → Fixed

### Findings

#### 🔴 HIGH — Fixed

**H1: FOUC for first-time dark-system-preference users (AC5 partial)**
`lib/hooks/useTheme.ts`
Effect #2 (DOM sync) ran with `isDark=false` on first render, removing the `.dark` class the FOUC script had set — then Effect #1 triggered a re-render to add it back. Visible flash for first-time visitors with dark system preference. Fixed by computing `systemDefault = matchMedia.matches` (with SSR guard) before `useLocalStorage`, so `isDark` is correct from the first render and Effect #2 keeps `.dark`.

**H2: AC4 not covered by tests**
`components/theme/ThemeToggle.test.tsx`
The `matchMedia` mock always returned `matches: false`. The dark-system-preference path in Effect #1 was never exercised. Added test: set `matchMedia.matches = true`, clear localStorage, render, assert `.dark` class is present.

#### 🟡 MEDIUM — Fixed

**M1: Task 5.3 test incomplete**
`components/theme/ThemeToggle.test.tsx`
"Clicking twice" test only checked DOM class, not localStorage. Updated to also assert `localStorage['marko-v2-ui-mode'] === false` after second click.

**M2: `project-context.md` is for wrong project (action item)**
`_bmad-output/project-context.md` describes `hebrew-markdown-export` (vanilla JS, index.html) not this Next.js app. Not fixed in this story — requires full project re-documentation.

#### 🟢 LOW — Fixed

**L1: Story File List labeled new file as "modified"**
`2-5-dark-light-mode-toggle.md` listed as "(modified)" in File List but was untracked (new) in git. Corrected to "(new)".

### Review Follow-ups (AI)
- [ ] [AI-Review][MEDIUM] Regenerate `_bmad-output/project-context.md` for the marko Next.js project — current file describes `hebrew-markdown-export` and will mislead future AI agents.

## Change Log

- 2026-03-07: Implemented Story 2.5 — Dark/Light Mode Toggle. Created useTheme hook, ThemeToggle component, FOUC prevention script, integrated into Header. 5 unit tests added. (claude-sonnet-4-6[1m])
- 2026-03-07: Code review — fixed FOUC bug for first-time dark-system users (H1), added AC4 test (H2), completed 5.3 test assertion (M1), corrected File List entry (L1). (claude-sonnet-4-6[1m])