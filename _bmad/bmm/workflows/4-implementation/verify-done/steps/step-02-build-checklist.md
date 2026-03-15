# Step 2: Build Visual Inspection Checklist

**Purpose:** Generate a visual-only checklist for the target story. No functional checks — only what can be verified by looking at screenshots.

---

## Instructions

1. Read the story's acceptance criteria, description, and any linked design specs from the story file.

2. Classify the story type using the templates in `{knowledge_path}/checklist-templates.md`:
   - **New UI Component** — new visual element added to the app
   - **Form / Data Entry** — form with inputs, validation, display
   - **Dashboard / Data Display** — charts, tables, cards, data visualization
   - **Navigation / Routing Change** — new routes, links, navigation structure
   - **Bug Fix / Minor Change** — fixing a reported visual issue
   - **Mixed** — combine multiple templates if the story spans types

3. Assess story complexity using the sizing guide:

| Story Complexity          | Total Visual Items | Breakpoints | RTL Items |
| ------------------------- | ------------------ | ----------- | --------- |
| Simple (bug fix, tweak)   | 2-4                | 1-2         | 0-1       |
| Medium (new component)    | 5-8                | 3           | 1-3       |
| Complex (new module/page) | 8-12               | 3-4         | 2-4       |

4. Generate the checklist with items from the appropriate template(s), **customized to match the specific story's acceptance criteria**. Every acceptance criterion that has a visual aspect MUST have at least one checklist item.

5. All checklist items are visual (V-xx prefix). For each item, specify:

| Field                      | Description                                       |
| -------------------------- | ------------------------------------------------- |
| **ID**                     | `V-01`, `V-02`, `V-03`...                         |
| **Description**            | What to visually inspect — specific to this story |
| **Viewport(s)**            | Which breakpoints to check, or `all`              |
| **Expected visual result** | What it should look like when correct             |

6. **Output:** The complete numbered checklist formatted as a table, ready for Steps 3 and 4.

### Example Checklist Output

```
| ID   | Description                                       | Viewport(s) | Expected Visual Result                              |
|------|---------------------------------------------------|-------------|-----------------------------------------------------|
| V-01 | Editor toolbar renders at desktop                 | 1440px      | Full toolbar visible, buttons aligned, no overflow  |
| V-02 | Editor adapts to tablet                           | 768px       | Toolbar wraps or scrolls, no clipping               |
| V-03 | Preview pane renders markdown correctly            | 1440px      | Formatted text, headings, code blocks visible       |
| V-04 | RTL layout — Hebrew text right-aligned            | all         | Labels right-aligned, layout mirrored               |
| V-05 | Export dropdown positioned near trigger            | 1440px      | Dropdown opens adjacent to button                   |
| V-06 | Empty state displays when no content              | 1440px      | Placeholder message visible, centered               |
| V-07 | Mobile layout stacks components vertically        | 375px       | Editor and preview stack, readable text              |
```
