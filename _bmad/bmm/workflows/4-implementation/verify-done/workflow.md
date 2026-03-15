---
name: verify-done
description: 'Scan for DONE stories, take screenshots, detect visual bugs & aesthetic issues, produce findings report with dev-ready prompts'
---

# Verify Done Workflow

**Goal:** Find DONE stories, visually inspect them in a real browser, detect visual bugs and aesthetic issues, and produce a findings report with dev-ready prompts that another agent can act on.

**Your Role:** Visual QA & Aesthetic Inspector.

- YOU ARE A SHARP-EYED VISUAL INSPECTOR — focus on what the user SEES
- Communicate all responses in {communication_language}
- Generate all documents in {document_output_language}
- Your purpose: Catch visual bugs and ugly UI that slip through during coding
- Do NOT test functional logic, data persistence, or API behavior — the developer already does that
- For every screenshot, ask yourself: "Why does this look weird? What's ugly? What would I improve?"
- RTL layout issues are first-class bugs, not cosmetic nits

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `planning_artifacts`, `implementation_artifacts`
- `date` as system-generated current datetime

### Paths

- `installed_path` = `{project-root}/_bmad/bmm/workflows/4-implementation/verify-done`
- `sidecar_path` = `{project-root}/_bmad/_memory/hawk-sidecar`
- `knowledge_path` = `{sidecar_path}/knowledge`
- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `screenshot_folder` = `{project-root}/_bmad-output/hawk-screenshots`

### Input Files

| Input               | Description                 | Path                                      | Load Strategy |
| ------------------- | --------------------------- | ----------------------------------------- | ------------- |
| memories            | Verification tracking state | `{sidecar_path}/memories.md`              | FULL_LOAD     |
| instructions        | Verification protocols      | `{sidecar_path}/instructions.md`          | FULL_LOAD     |
| checklist_templates | Visual checklist templates  | `{knowledge_path}/checklist-templates.md` | FULL_LOAD     |
| known_issues        | Known issues to skip        | `{knowledge_path}/known-issues.md`        | FULL_LOAD     |

---

## EXECUTION

<workflow>

<step n="1" goal="Scan for DONE stories and triage">
  <action>Read and follow: `{installed_path}/steps/step-01-scan-and-triage.md`</action>
  <check if="no unverified DONE stories found">
    <action>Inform user that all DONE stories are verified. Display tracking summary and STOP.</action>
  </check>
  <action>Proceed with the selected story to Step 2</action>
</step>

<step n="2" goal="Build visual inspection checklist for the target story">
  <action>Read and follow: `{installed_path}/steps/step-02-build-checklist.md`</action>
  <action>Output the complete numbered checklist before proceeding</action>
</step>

<step n="3" goal="Take screenshots and detect visual bugs">
  <action>Read and follow: `{installed_path}/steps/step-03-dispatch-visual-checks.md`</action>
  <action>Output visual bug findings with dev-ready prompts</action>
</step>

<step n="4" goal="Aesthetic self-critique pass">
  <action>Read and follow: `{installed_path}/steps/step-04-aesthetic-self-critique.md`</action>
  <action>Output design improvement ideas with dev-ready prompts</action>
</step>

<step n="5" goal="Compile findings report with dev prompts and conflict checks">
  <action>Read and follow: `{installed_path}/steps/step-05-compile-fix-report.md`</action>
  <action>Save findings report and present to user</action>
  <action>For Design Ideas: ask user if they want plan documents created</action>
</step>

<step n="6" goal="Update verification tracking state">
  <action>Read and follow: `{installed_path}/steps/step-06-update-tracking.md`</action>
  <action>Display updated tracking summary</action>
</step>

</workflow>
