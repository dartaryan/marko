# Step 4: Aesthetic Self-Critique

**Purpose:** After checking for bugs, do a second pass focused on aesthetics — things that work but look ugly, inconsistent, or could be significantly better.

---

## Instructions

1. **Review all screenshots from Step 3** with fresh eyes focused on aesthetics, not bugs.

2. **For each page/view, ask yourself:**
   - Does this look **professional**? Would I show this to a paying customer?
   - Does the **spacing** feel right? Too cramped? Too loose? Inconsistent?
   - Is there clear **visual hierarchy**? Can I tell what's important at a glance?
   - Are **similar elements consistent**? Do all cards look like cards? Do all buttons match?
   - Are the **icon choices intuitive**? Would a different icon communicate better?
   - Is the **color usage harmonious**? Any jarring combinations or missing accents?
   - Does the **typography** feel balanced? Are font sizes and weights creating clear hierarchy?
   - Are there **empty areas** that feel awkward or unfinished?
   - Does the **overall composition** feel balanced or lopsided?

3. **For each aesthetic issue found**, record:
   - **What you see** — specific description of the aesthetic problem
   - **Why it bothers you** — what makes it look wrong or unprofessional
   - **Suggestion** — concrete UX/UI improvement recommendation
   - **Dev Prompt** — actionable instruction for a DEV agent
   - **Priority** — High (significant UX impact) / Medium (noticeable) / Low (polish)

4. **Output:** Design improvement ideas table:

```
| # | Finding | Why It's Ugly | Suggestion | Priority | Dev Prompt |
|---|---------|---------------|------------|----------|------------|
| 1 | Card spacing feels cramped | 8px gap between cards makes them look squeezed together | Increase gap to 16px, add subtle border-radius shadow | Medium | "In `components/document-list.tsx`, change `gap-2` to `gap-4` on the card grid container. Consider adding `shadow-sm rounded-lg` to each card for depth." |
| 2 | Export icon confusing | Download icon used for "export" doesn't communicate the concept | Replace with `FileOutput` or `Share` icon from lucide-react | Low | "In `components/export-menu.tsx`, replace `<Download />` icon with `<FileOutput />` from lucide-react. The download icon suggests saving, not exporting." |
```

## Important

- This step is about **aesthetic judgment**, not bugs. Bugs were caught in Step 3.
- Be opinionated — if something looks ugly, say so and explain why.
- Suggest concrete improvements, not vague "make it better."
- Every suggestion must include a dev-ready prompt.
- Consider the project's design system — are elements consistent with it?
- Think about what a UX designer would say looking at this screen.
