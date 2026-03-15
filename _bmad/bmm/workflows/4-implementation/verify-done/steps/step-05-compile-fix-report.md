# Step 5: Compile Findings Report

**Purpose:** Merge all visual bugs (Step 3) and design ideas (Step 4) into a single structured findings report with dev-ready prompts. For design ideas, handle the conflict-check and plan document workflow.

---

## Instructions

### Part A: Build the Findings Report

1. Collect all findings from Step 3 (visual bugs) and Step 4 (design ideas).

2. Determine overall visual result:
   - `PASS` — no bugs found (design ideas are fine, they don't block a PASS)
   - `FAIL` — one or more Must-fix bugs found
   - `PARTIAL` — only Should-fix bugs, no Must-fix

3. **If no bugs AND no design ideas (clean PASS):**
   - Output a brief congratulations message
   - Skip report generation, proceed to Step 6

4. **Generate the findings report using this template:**

## Findings Report Template

```markdown
# Hawk Findings Report: {story_id} — {story_title}

**Date:** {date}
**Inspected by:** Hawk (Visual QA & Aesthetic Inspector)
**Visual Result:** {PASS | FAIL | PARTIAL}

---

## DEV Agent Instructions

Read the findings table below. For each task:

- **Ready for Quick Dev** → implement the fix directly, no approval needed
- **Plan Mode** → explain what you intend to develop, then wait for user approval before writing any code

---

## Summary

| Metric                   | Count               |
| ------------------------ | ------------------- |
| Visual Bugs (Must-fix)   | {must_fix_count}    |
| Visual Bugs (Should-fix) | {should_fix_count}  |
| Design Ideas             | {design_idea_count} |

## Findings Table

| #   | Finding       | Type        | Priority   | Story      | Dev Prompt     | Status                            |
| --- | ------------- | ----------- | ---------- | ---------- | -------------- | --------------------------------- |
| 1   | {description} | Bug         | Must-fix   | {story_id} | "{dev prompt}" | Ready for Quick Dev               |
| 2   | {description} | Bug         | Should-fix | {story_id} | "{dev prompt}" | Ready for Quick Dev               |
| 3   | {description} | Design Idea | Medium     | —          | "{dev prompt}" | Pending Review                    |
| 4   | {description} | Design Idea | Low        | —          | "{dev prompt}" | Deferred: Revisit after Story X-Y |

## Bug Details

### Bug 1: {short_title}

- **Priority:** Must-fix / Should-fix
- **Viewport:** {breakpoint where observed}
- **What's Wrong:** {precise visual description}
- **Expected:** {what it should look like}
- **Screenshot:** {path to screenshot in session folder — this screenshot will be KEPT for DEV agent reference}
- **Dev Prompt:**
  > {Full dev-ready instruction with file path, what to change, and how}
- **Files Likely Involved:** {component file paths}

### Bug 2: ...

## Design Ideas

### Idea 1: {short_title}

- **Priority:** High / Medium / Low
- **Why It's Ugly:** {what makes it look wrong}
- **Suggestion:** {concrete improvement recommendation}
- **Dev Prompt:**
  > {Full dev-ready instruction}
- **Conflict Check:** {No conflict / Covered by Story X-Y / Revisit after Story X-Y}

### Idea 2: ...
```

### Part B: Design Ideas — User Review & Plan Documents

5. **Present all Design Ideas to the user** and ask:

   > "I found {N} design improvement ideas. Would you like me to prepare plan documents for any of these so a DEV agent can implement them?"

6. **If the user says yes** (for specific items or all):

   a. **Run conflict check** for each approved idea:
   - Read `{implementation_artifacts}/sprint-status.yaml` — scan all `backlog` stories
   - Read `{planning_artifacts}/epics.md` — check story descriptions
   - **Clearly covered** by a future story → mark as "Covered by Story X-Y, skip" in the table
   - **Suspicion of overlap** → mark as "Revisit after Story X-Y" — do NOT create doc
   - **No conflict** → proceed to create plan document

   b. **Create plan document** for each non-conflicting approved idea:

   Save to: `{implementation_artifacts}/hawk-plan-{short-kebab-name}.md`

   Plan document template:

   ```markdown
   # Hawk Design Improvement Plan: {title}

   **Source:** Hawk findings report for Story {story_id}
   **Date:** {date}
   **Priority:** {High / Medium / Low}

   ---

   ## DEV Agent Instructions

   Read the tasks table below. For each task:

   - **Ready for Quick Dev** → implement directly, no approval needed
   - **Plan Mode** → explain what you intend to develop, then WAIT for user approval before writing any code

   ## Tasks

   | #   | Task               | Dev Prompt     | Status                          |
   | --- | ------------------ | -------------- | ------------------------------- |
   | 1   | {task description} | "{dev prompt}" | Ready for Quick Dev / Plan Mode |

   ## Context

   **Why this matters:** {why the current UI is problematic}
   **Expected outcome:** {what it should look like after the fix}
   **Design system reference:** {relevant colors, fonts, spacing from the design system}

   ## Files Likely Involved

   - {file paths}
   ```

   c. **Update the findings report table** — change Status from "Pending Review" to "Plan Created: `hawk-plan-{name}.md`"

7. **Build the referenced screenshots list:**
   - Collect all screenshot file paths that appear in bug details or design idea sections
   - These are the "referenced" screenshots — they will be kept for the DEV agent
   - Pass this list to Step 6 for cleanup

8. **Save the findings report** to: `{implementation_artifacts}/hawk-findings-{story-id}.md`

9. **Output:** The complete findings report content to the user.
