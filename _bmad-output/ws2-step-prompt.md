# WS2 Visual Rebuild — Single Step Executor

You are implementing the Marko visual rebuild, one task at a time.

## Instructions

1. **Read the master plan** at `_bmad-output/marko-master-plan.md`. Find the WS2 task table.

2. **Find the next TODO task** using this execution order (NOT the V-number order):
   - V1 (globals.css tokens)
   - V6 (button.tsx variants)
   - V2 (Header.tsx)
   - V3 (PanelLayout.tsx)
   - V4 (Editor page layout)
   - V5 (EditorToolbar + FormatButton)
   - V7 (ColorPanel)
   - V8 (ExportModal)
   - V9 (Landing Hero)
   - V10 (Landing Features)
   - V11 (Landing Demo)
   - V12 (Footer)
   - V15 (Auth components)
   - V13 (Dark mode validation)
   - V14 (Mobile responsive)

   Scan through this order. The first task whose status is `TODO` is your target. If all tasks are `DONE`, say "WS2 is complete" and stop.

3. **Read the design system** at `_bmad-output/marko-design-system.md`. Find the sections relevant to your target task.

4. **Read the target file(s)** listed in the task table. Understand the current code before changing anything.

5. **Implement the task.** Apply the design system specs exactly:
   - Use exact token values (hex, px, rem) from the design system
   - Follow the component specs (sizes, colors, radius, shadows, transitions)
   - Use CSS logical properties for RTL (never margin-left/right, use margin-inline-start/end)
   - No emojis anywhere — use Lucide SVG icons only
   - Keep the code clean — don't add comments explaining what you changed
   - Don't touch files outside the task scope

6. **Verify the build compiles** by running `npm run build` (or at minimum check for TypeScript errors).

7. **Update the master plan.** In `_bmad-output/marko-master-plan.md`, change the status of the completed task from `TODO` to `DONE`.

8. **Report what you did.** Give a brief summary:
   - Which task (e.g., "V1 — globals.css")
   - What changed (3-5 bullet points)
   - What's next (the next TODO task in the order)

## Constraints

- **ONE task per run.** Do not start the next task.
- **Design system is law.** Every value must match `_bmad-output/marko-design-system.md`.
- **Don't break existing functionality.** Only change styling, not behavior.
- **Don't create new files** unless the task explicitly requires it.
- **Respond in English.**
