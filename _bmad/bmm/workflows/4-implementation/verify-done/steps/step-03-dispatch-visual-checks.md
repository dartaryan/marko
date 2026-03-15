# Step 3: Visual Bug Detection

**Purpose:** Take screenshots at all breakpoints and identify visual bugs — things that are clearly broken and slipped through during coding.

---

## Prerequisites

- App must be running at the configured Base URL (check `{sidecar_path}/memories.md` → App Configuration)
- Browser MCP must be available (Playwright MCP or Chrome DevTools MCP)

## Instructions

1. **Create screenshot session folder:**
   - Create the folder `{screenshot_folder}/{story_id}-{date}/` (e.g., `_bmad-output/hawk-screenshots/2-3-2026-03-15/`)
   - All screenshots in this session MUST be saved to this folder — NEVER to the project root
   - Use the naming pattern: `{story_id}-{viewport}-{page-or-feature}-{sequence}.png`
   - Maintain a running list of all screenshots taken and which checklist item (V-xx) they correspond to

2. **Verify app is running:**
   - Navigate to `{base_url}` using `browser_navigate` (Playwright) or `navigate_page` (Chrome DevTools)
   - If the page fails to load, alert the user: "⚠️ App is not running at {base_url}. Please start the dev server and try again."
   - STOP if app is not reachable

3. **For each visual checklist item (V-xx):**

   a. Navigate to the relevant page/route

   b. Set the viewport for the required breakpoint:
   - Desktop: 1440x900
   - Tablet: 768x1024
   - Mobile: 375x812

   c. Wait for page load — wait for network idle or specific element to appear

   d. **Take a screenshot** using `browser_take_screenshot` — save to the session folder with the naming pattern from step 1

   e. **Self-critique the screenshot** — look at it and ask yourself these questions:

   | Question                                                               | Bug Category           |
   | ---------------------------------------------------------------------- | ---------------------- |
   | Is any text clipped, cut off, or overflowing its container?            | Text clipping/overflow |
   | Did any element escape or shift outside its intended area?             | Mispositioned elements |
   | Do button/badge colors match their semantic state? Is a color missing? | Color mismatches       |
   | Is there a colored circle/dot where an icon should be?                 | Placeholder graphics   |
   | Are elements that should be on the same row/baseline actually aligned? | Alignment breaks       |
   | Do dropdowns/popovers open near their trigger or at the screen edge?   | Misplaced popups       |
   | Is the scrollbar on the outer page when it should be inside a panel?   | Scroll container leaks |
   | Is any text in the wrong language when it should be localized?         | Language mixing        |

   f. **For each bug found**, record:
   - **What you see** — precise visual description
   - **What it should be** — the expected visual result
   - **Dev Prompt** — actionable fix instruction with file path, what's wrong, and how to fix it
   - **Priority** — Must-fix (visually broken) or Should-fix (noticeable but not critical)

4. **For responsive checks**, repeat at each breakpoint:
   - 375px (mobile)
   - 768px (tablet)
   - 1440px (desktop)

   Pay special attention to:
   - Elements that overflow on smaller screens
   - Text that gets clipped when the viewport shrinks
   - Layout shifts that break alignment
   - Menus/popovers that end up off-screen on mobile

5. **RTL-specific checks** (if app uses RTL):
   - RTL text aligned correctly
   - Layout mirrors (sidebar, navigation, icons)
   - Bidirectional text (numbers/LTR within RTL) flows correctly
   - Scrollbars on correct side
   - Popovers/tooltips positioned correctly in RTL

6. **Output:** Visual bug findings table:

```
| # | Bug | Priority | Viewport | Dev Prompt | Story |
|---|-----|----------|----------|------------|-------|
| 1 | Button color shows blue instead of accent for active state | Must-fix | 1440px | "In `components/editor/toolbar.tsx`, the action button uses `bg-primary` but should use the accent color. Fix: use `bg-accent` instead." | 2-3 |
| 2 | Card right edge clipped at tablet width | Should-fix | 768px | "In `components/preview-pane.tsx`, the container needs `overflow-x-auto` at tablet breakpoint. The last element gets clipped." | 2-3 |
```

## Important

- Do NOT test functional behavior (click handlers, data mutations, API calls)
- Do NOT check console errors or network requests
- ONLY report what you can SEE in the screenshots
- Every bug must have a dev-ready prompt that another agent can execute
