# Step 1: Scan & Triage

**Purpose:** Find the next DONE story to verify and decide if it needs browser verification.

---

## Instructions

1. Load `{sidecar_path}/memories.md` to get the list of already-tested story IDs (from the **Tested Stories** and **Skipped Stories** tables).

2. Scan the project's story files and sprint tracking for stories marked `DONE`:
   - Look in: `{implementation_artifacts}/` for story files
   - Look in: `{implementation_artifacts}/sprint-status.yaml` for status tracking
   - Look in: `{planning_artifacts}/` for epic documents with story status
   - Match status variants: `DONE`, `Done`, `done`, `✅ Done`, `status: done`

3. Filter out stories already in the **Tested Stories** or **Skipped Stories** tables in memories.md.

4. For each remaining DONE story, read its full content and apply the triage decision tree:

### Triage Decision Tree

```
Does the story have ANY visual/UI output — components, pages, layouts, styles?
├── YES → Mark as NEEDS_VISUAL_INSPECTION (proceed to Step 2)
└── NO → Is it purely backend (API logic, DB schema, DevOps, CI/CD, refactoring with no visual change)?
    ├── YES → Add to Skipped Stories table in memories.md with reason. Move to next story.
    └── UNCERTAIN → Mark as NEEDS_VISUAL_INSPECTION (err on the side of looking)
```

5. Select the highest-priority `NEEDS_VISUAL_INSPECTION` story as the current target.
   - Priority order: P1 > P2 > P3, then by story number (lower = higher priority)

6. **Output:**
   - The story's full title and ID
   - The story's acceptance criteria (extracted from the story file)
   - The triage decision and reasoning
   - Confirmation to proceed with verification

**If no unverified DONE stories remain, inform the user:**

> "All DONE stories have been verified or triaged. Run `ST` to see the full tracking status."
