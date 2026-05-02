## Restore the Milestones tab on committed job details

### Context
The `JobProgressTab` component (the milestone timeline with done / current / upcoming items, overall progress %, and "Add milestone" CTA) still exists at `src/components/trader/job-admin/JobProgressTab.tsx` and is still wired in `JobDetail.tsx` at line 1304 (`activeTab === "progress"`).

However, the tab is currently **only rendered in the trigger list when `showAdminTabs` is true** — i.e. only for long-term, agency-admin, committed, non-completed jobs (line 166). For a normal committed card (like committed item 1 / `j2`), the tabs array on lines 183–189 doesn't include `progress`, so the trigger never appears even though the rendering branch is alive.

The user wants this tab visible on standard committed job detail pages too, without deleting any existing tabs or logic.

### Change

In `src/pages/trader/JobDetail.tsx`, in the non-admin `tabs` array (lines 183–189), add a Milestones entry that is shown whenever the job is committed. Nothing else is removed.

```text
tabs (non-admin branch) becomes:
  Details
  Quote            (if showQuotesTab)
  Subtasks         (if showSubtasksTab)
  Purchase List    (if showPurchaseListTab)
  Milestones       ← NEW, shown when isCommitted
  Attachments      (if hasAttachments)
```

- Label: **"Milestones"** (clearer than "Progress" and matches what the user originally called it).
- Key: reuse existing `"progress"` TabKey so the render branch on line 1304 (`<JobProgressTab />`) and the footer-visibility check on line 1311 keep working untouched.
- Icon: keep `PlayCircle` (already imported).
- Visibility rule: `isCommitted && !isCancelled` — so it never appears on Incoming cards (PRD: incoming is neutral, response-only) and is hidden on cancelled jobs. It appears on every committed flow (Fixed / Estimate / Inspection) at every stage from Assigned onward.
- The admin (`showAdminTabs`) branch already has Progress and is left exactly as-is.

### Seed data
`JobProgressTab` only seeds milestones for `j5`. For `j2` (committed item 1) and other committed jobs, the timeline currently renders empty with just the "Add milestone" CTA — that empty state is fine and the user didn't ask for seeded data. No changes to the component.

### Files touched
- `src/pages/trader/JobDetail.tsx` — single edit to the non-admin `tabs` array to conditionally include the Milestones trigger.

### Memory
Update `mem://features/trader/job-details` to record: "Milestones tab (key `progress`, component `JobProgressTab`) is visible on all committed job detail pages, hidden on incoming and cancelled jobs."

### Out of scope
- No changes to `JobProgressTab` itself.
- No changes to the admin-mode tab list.
- No deletions of any existing tab, route, CTA, or workflow logic.
- No seed data added.
