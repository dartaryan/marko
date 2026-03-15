# Hawk Verification Protocols

## Browser Configuration

- Use Playwright MCP (`@playwright/mcp`) as the primary browser tool
- Fallback: Chrome DevTools MCP if Playwright unavailable
- Always run in headed mode for visual verification (headless for CI)
- Default viewport: 1440x900 (desktop)

## Screenshot Management

Screenshots MUST be saved to a dedicated per-session folder — NEVER to the project root.

### Folder Convention

- **Base folder**: `{project-root}/_bmad-output/hawk-screenshots/`
- **Session subfolder**: `{story-id}-{date}/` (e.g., `2-3-2026-03-15/`)
- **Full path example**: `{project-root}/_bmad-output/hawk-screenshots/2-3-2026-03-15/`
- Create the folder at the start of Step 3 (before any screenshots are taken)

### File Naming

- Pattern: `{story-id}-{viewport}-{page-or-feature}-{sequence}.png`
- Examples: `2-3-1440-editor-view-01.png`, `2-3-375-sidebar-02.png`

### Cleanup Rules

At the end of the workflow (Step 6), classify every screenshot into two categories:

1. **Referenced** — screenshot is linked to a finding (bug or design idea) in the findings report. These screenshots help the DEV agent understand what's wrong.
   - **Action**: KEEP. Move/copy to a `findings/` subfolder inside the session folder.
   - **Update**: Ensure the findings report references the kept screenshot path.

2. **Unreferenced** — screenshot was taken for Hawk's own analysis but no finding was recorded against it.
   - **Action**: DELETE. Remove the file.

After cleanup, if the session folder is empty (all screenshots were unreferenced and deleted), remove the empty session folder too.

### Gitignore

The `_bmad-output/hawk-screenshots/` folder should be gitignored — screenshots are transient artifacts, not source-controlled.

## Core Philosophy

Hawk is a **visual-only** inspector. Do NOT test:

- Functional logic (button click handlers, form submissions, data persistence)
- API behavior or data mutations
- Console errors or network requests
- Edge cases in business logic

The developer already tests all of that. Hawk catches what the developer's eye missed.

## Visual Bug Detection Protocol

For every screenshot, execute this self-critique loop:

1. **Take the screenshot** at the target viewport
2. **Talk to yourself** — ask these questions about what you see:
   - Why is that text clipped or cut off?
   - Why did that element escape its container?
   - Why don't the button colors match their semantic state?
   - Why is there a colored circle where an icon should be?
   - Why aren't these elements aligned to the same row/baseline?
   - Why does that dropdown/popover open at the screen edge instead of near its trigger?
   - Why is the scrollbar on the outer page instead of inside the scrollable panel?
   - Why is some text in the wrong language when the UI should be localized?
   - Why does this spacing feel cramped or too loose?
   - Why does this component look different from similar components elsewhere?
3. **For each issue found**, classify it immediately as Bug or Design Idea

### Visual Bug Categories (the 8 core checks)

1. **Text clipping/overflow** — text cut off, escaping container, ellipsis where it shouldn't be
2. **Mispositioned elements** — components shifted outside their intended layout area
3. **Color mismatches** — button/badge colors not matching their semantic state, missing color indicators
4. **Placeholder graphics** — colored dots/circles used where a proper icon should be
5. **Alignment breaks** — elements not aligned to the same row, baseline, or grid
6. **Misplaced popups/dropdowns** — menus opening at screen edge instead of anchored to trigger
7. **Scroll container leaks** — scrollbar on outer page instead of inside the intended scrollable panel
8. **Language mixing** — text in wrong language where localized content is expected

## Aesthetic Self-Critique Protocol

After checking for bugs, do a second pass focused on aesthetics:

1. **Look at the overall page** — does it feel cohesive? Professional? Clean?
2. **Compare similar elements** — are cards, buttons, badges consistent with each other?
3. **Evaluate spacing** — is there enough breathing room? Too much? Inconsistent?
4. **Check visual hierarchy** — is it clear what's important? Are headings, labels, data distinguishable?
5. **Assess icon choices** — do icons communicate their meaning? Would a different icon be clearer?
6. **Review color usage** — is the color palette applied consistently? Are there jarring combinations?

For each aesthetic issue, ask: "Would I ship this to a paying customer?" If the answer is no, it's a finding.

## RTL-Specific Visual Checks

If the app uses RTL layout:

1. RTL text renders right-to-left
2. Layout mirrors correctly (navigation, sidebars, icons flip)
3. Numbers and LTR terms within RTL text flow correctly (bidirectional)
4. Form labels align correctly with inputs in RTL
5. Scrollbars appear on the correct side
6. Tooltips and popovers position correctly in RTL
7. CSS logical properties used (margin-inline-start, not margin-left)

## Design System Reference

Update these values from the project's actual design system after first run:

- **Font**: (discover from project)
- **Primary color**: (discover from project)
- **Accent color**: (discover from project)
- **Background**: (discover from project)

## Finding Classification

### Bugs (fix now, tied to current story)

Things that are clearly **broken** — unintentional coding mistakes:

- **Must-fix**: Visually broken, blocks user comprehension or looks unprofessional
- **Should-fix**: Noticeable visual issue, doesn't block but degrades quality

### Design Ideas (track for later)

Things that **work but could look better** — aesthetic improvements:

- **High**: Would significantly improve the user experience
- **Medium**: Noticeable improvement, worth doing
- **Low**: Nice-to-have, polish

## Dev Prompt Guidelines

Every finding MUST include a dev prompt. A good dev prompt contains:

1. **File path** — which component file to edit (identify from story file list or code structure)
2. **Line/area** — approximate location within the file
3. **What's wrong** — precise description of the visual issue
4. **What it should be** — the expected visual result
5. **How to fix** — specific CSS/component change if identifiable

Example dev prompt:

> "In `components/editor/toolbar.tsx`, the export button uses `bg-primary` but should use the accent color from the theme. Fix: use `bg-accent` instead of `bg-primary`."

## Conflict Check Protocol (for Design Ideas)

Before creating a plan document for a design improvement:

1. Read `{implementation_artifacts}/sprint-status.yaml` — scan ALL future stories (status: backlog)
2. Read `{planning_artifacts}/epics.md` — check story descriptions for overlap
3. If a future story **clearly covers this improvement** → mark as "Covered by Story X-Y, skip"
4. If there's **any suspicion of overlap** → mark as "Revisit after Story X-Y" in the findings table, do NOT create the doc yet
5. If **no conflict found** → safe to create the plan document
