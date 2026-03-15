# Step 6: Update Tracking

**Purpose:** Update the sidecar memory with verification results so Hawk maintains persistent state across sessions.

---

## Instructions

1. **Update `{sidecar_path}/memories.md`:**

   a. **Add the story to the Tested Stories table:**

   | Field        | Value                                                                                      |
   | ------------ | ------------------------------------------------------------------------------------------ |
   | Story ID     | The story's identifier                                                                     |
   | Story Title  | The story's title                                                                          |
   | Date Tested  | Today's date                                                                               |
   | Result       | `PASS`, `FAIL`, or `PARTIAL`                                                               |
   | Bugs Found   | Count of visual bugs (Must-fix + Should-fix)                                               |
   | Design Ideas | Count of aesthetic improvement ideas                                                       |
   | Report Ref   | Filename of the findings report (e.g., `hawk-findings-{story-id}.md`) or `—` if clean PASS |

   b. **Remove the story from the Pending Queue** if it was listed there.

   c. **If the story FAILED**, add it to the **Needs Re-Verification** section:

   | Field              | Value                        |
   | ------------------ | ---------------------------- |
   | Story ID           | The story's identifier       |
   | Story Title        | The story's title            |
   | Original Test Date | Today's date                 |
   | Original Issues    | Count of issues found        |
   | Notes              | Brief summary of main issues |

2. **Clean up screenshots:**

   a. **Get the session folder** for this story: `{screenshot_folder}/{story_id}-{date}/`

   b. **Get the referenced screenshots list** from Step 5 — these are screenshots linked to findings.

   c. **If there ARE referenced screenshots (findings exist):**
      - Create a `findings/` subfolder inside the session folder
      - Move all referenced screenshots into the `findings/` subfolder
      - Delete all remaining (unreferenced) screenshots from the session folder
      - The `findings/` subfolder with its screenshots is kept for the DEV agent to review when fixing issues

   d. **If there are NO referenced screenshots (clean PASS):**
      - Delete ALL screenshots in the session folder
      - Remove the empty session folder

   e. **Report cleanup:** briefly note how many screenshots were kept vs deleted (e.g., "Cleaned up 12 screenshots, kept 3 referenced in findings report")

3. **Inform the user of next steps:**
   - If there are more stories in the pending queue:

     > "{X} stories remaining in verification queue. Run `VD` again to verify the next one, or `ST` to see the full tracking status."

   - If the story passed with no visual bugs:

     > "{story_id} looks clean — no visual bugs found. {N} design ideas proposed (if any)."

   - If the story had visual bugs:
     > "{story_id} has {N} visual bugs. Findings report saved to {report_path}. Point a DEV agent to the report — bugs marked 'Ready for Quick Dev' can be fixed immediately."

4. **Output:** Updated tracking summary showing:
   - Total stories tested (with PASS/FAIL breakdown)
   - Stories remaining in queue
   - Stories needing re-verification
