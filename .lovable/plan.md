I’ll stop patching symptoms and align the implementation to the two uploaded docs as the source of truth.

## What the docs require

```text
All jobs start as INCOMING.
Incoming CTA/action: Respond to Job only from detail page.
Respond choices: Pick Up Job / Create Estimate / Create Inspection Quote.
Selecting any choice moves the job to COMMITTED.

Committed then follows exactly one flow:

Fixed:
Assigned -> In Progress -> Completed -> Invoice Sent -> Paid

Estimate:
Estimate Sent -> Estimate Approved -> Subtasks Created -> Assigned -> Quote Sent -> Quote Approved -> Advance Paid -> Purchases Ongoing -> Ready to Start -> In Progress -> Completed -> Invoice Sent -> Paid

Inspection:
Inspection Proposal Sent -> Inspection Fee Paid -> Inspection Assigned -> Inspection Completed -> Subtasks Created -> then same as Estimate from Subtasks onward
```

## Plan

1. **Replace the current loose workflow stages with PRD-aligned stages**
   - Update `src/data/jobWorkflowState.ts` so the stage names match the required Fixed / Estimate / Inspection flows.
   - Remove ambiguous/merged states like `quote_accepted`, `purchasing`, and `work_in_progress` where they conflict with the docs, replacing them with `quote_approved`, `advance_paid`, `purchases_ongoing`, `ready_to_start`, `in_progress`, `paid`, etc.
   - Keep one flow per job; no stage skipping.

2. **Fix Incoming vs Committed behavior properly**
   - Incoming tab will only contain jobs with `status: "incoming"`.
   - Incoming cards will not show committed state, assigned state, accepted state, workflow pills, or committed-style CTAs.
   - The list card remains a neutral incoming card with schedule/context only.
   - The only place to respond is the incoming job detail page footer: `Respond to Job`.
   - Once the user selects Pick Up / Estimate / Inspection, the job moves to Committed immediately.

3. **Restore Pick Up Job correctly**
   - `Pick Up Job` will reuse the existing assignment sheet only.
   - The assignment options will be: assign to self, individual, or team/group.
   - After pickup/assignment, fixed jobs enter Committed at `Assigned`.
   - This preserves the fixed-job pickup flow instead of replacing it with quote/estimate behavior.

4. **Make card CTA and detail-page CTA come from the same source**
   - Create one shared CTA mapping for every workflow stage.
   - `StageJobCard` and `JobDetail` footer will both use that same mapping, so labels and actions cannot drift apart again.
   - Examples:
     - Fixed `Assigned`: `Start Work`
     - Fixed `In Progress`: `Mark Completed`
     - Fixed `Completed`: `Create Invoice`
     - Estimate `Estimate Sent`: `Await Approval`
     - Estimate `Subtasks Created`: `Assign Work`
     - Estimate `Assigned`: `Create Quote`
     - Estimate `Quote Sent`: `Await Approval`
     - Estimate `Quote Approved`: `Await Advance Payment`
     - Estimate `Advance Paid`: `View Purchase List`
     - Inspection `Inspection Fee Paid`: `Assign for Inspection`
     - Inspection `Inspection Assigned`: `Start Inspection`
     - Inspection `Inspection Completed`: `Create Subtasks`

5. **Repair Estimate, Quote, Purchase List, and Invoice sequencing**
   - Estimate flow:
     - Create Estimate with min/max/note/voice.
     - Customer approval simulated moves to `Estimate Approved`.
     - Subtasks created before assignment/quote.
   - Quote flow:
     - Quote is only created after subtasks and assignment.
     - Quote includes title, line items, notes, and advance amount.
     - Quote must show PDF-style preview before `Send to Customer`.
     - Purchase list is generated only from quote material items, after quote is sent.
   - Purchase tab:
     - Visible only after quote is sent/approved and later stages.
     - Uses statuses from the docs: not purchased, purchased by customer, requested admin purchase, purchased by admin.
   - Invoice flow:
     - Invoice appears only after work is completed.
     - Invoice has a preview before `Send to Customer`.
     - Sending invoice moves to `Invoice Sent`; customer payment simulation moves to `Paid`.

6. **Fix inspection flow according to the spec**
   - Incoming inspection response creates an inspection proposal, not a normal quote.
   - Inspection proposal sent -> customer pays inspection fee -> assign inspector -> start inspection -> inspection completed.
   - After inspection completion, the next CTA is `Create Subtasks`, then it joins the Estimate flow from `Subtasks Created` onward.
   - Quote preview remains only for quote, not for inspection proposal.

7. **Clean up demo seed data so it demonstrates the correct flow**
   - Remove/adjust seeded cases that currently make incoming jobs look accepted.
   - Seed committed examples at valid states only.
   - Ensure the first Incoming item is not pretending to be assigned/committed unless it has actually moved to Committed.

## Technical notes

- Main files to update:
  - `src/data/jobWorkflowState.ts`
  - `src/components/trader/StageJobCard.tsx`
  - `src/pages/trader/TraderJobs.tsx`
  - `src/pages/trader/JobDetail.tsx`
  - `src/components/trader/PurchaseListTab.tsx` if purchase statuses need renaming
  - Existing quote/invoice/assignment sheets will be reused; no redesign of assignment.
- No database changes are required for this pass because the current prototype stores the demo workflow in local/session state.
- I’ll also update the project memory after implementation so this PRD state machine is not contradicted again.