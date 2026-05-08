/* ─── Job Workflow State (PRD-aligned) ─── */
/* Source of truth: admin_job_workflow + PRD docs.
 * One job = one flow. No skipping. No re-merging.
 * All jobs start as "incoming". Selecting a Respond option moves them to Committed. */

export type FixedStage =
  | "incoming"
  | "assigned"
  | "in_progress"
  | "completed"
  | "invoice_sent"
  | "paid";

export type EstimateStage =
  | "incoming"
  | "estimate_sent"
  | "estimate_approved"
  | "subtasks_created"
  | "assigned"               // worker assigned (post-subtasks)
  | "quote_sent"
  | "quote_approved"
  | "advance_paid"
  | "purchases_ongoing"
  | "ready_to_start"
  | "in_progress"
  | "completed"
  | "invoice_sent"
  | "paid";

export type InspectionStage =
  | "incoming"
  | "inspection_proposal_sent"
  | "inspection_fee_paid"
  | "inspection_assigned"
  | "inspection_completed"
  // After inspection completion, joins Estimate flow from "subtasks_created" onward
  | "subtasks_created"
  | "assigned"
  | "quote_sent"
  | "quote_approved"
  | "advance_paid"
  | "purchases_ongoing"
  | "ready_to_start"
  | "in_progress"
  | "completed"
  | "invoice_sent"
  | "paid";

export type WorkflowStage = FixedStage | EstimateStage | InspectionStage;

export type JobCategory = "fixed" | "estimate" | "inspection";

export interface EstimateData {
  title: string;
  minPrice: number;
  maxPrice: number;
  description: string;
  hasVoiceNote: boolean;
  sentAt: string;
  /**
   * Optional advance hint shown to the customer alongside the estimate range.
   * The actual advance is locked in later during Quote (PRD §9), but admins
   * may pre-signal expected upfront so the customer isn't surprised.
   */
  advanceHint?: {
    mode: "percent" | "amount";
    /** Percent of the mid-estimate (when mode=percent) or absolute £ (when mode=amount). */
    value: number;
  };
}

/** Purchase list item statuses per spec. */
export type PurchaseItemStatus =
  | "not_purchased"
  | "purchased_by_customer"
  | "requested_admin_purchase"
  | "purchased_by_admin";

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  expectedPrice: number;
  status: PurchaseItemStatus;
  /** Legacy buyer marker, kept for back-compat with PurchaseListTab UI. */
  buyer?: "customer" | "admin";
  /** Which purchase batch (quote round) this item belongs to. Undefined = legacy / initial. */
  batchId?: string;
}

/** A purchase batch represents one quote-round of items the trader sent to the customer. */
export interface PurchaseBatch {
  id: string;
  /** Human label shown in UI, e.g. "Initial Quote", "Quote #2". */
  label: string;
  /** ISO timestamp when the batch was created (quote sent). */
  createdAt: string;
  /** Optional total of materials in this batch at the time of sending. */
  total?: number;
  /** Optional note from the trader about why the new quote was raised. */
  note?: string;
}

export interface InvoiceData {
  id: string;
  items: { label: string; amount: number }[];
  subtotal: number;
  advancePaid: number;
  remaining: number;
  sentAt?: string;
}

export interface JobAssignment {
  type: "group" | "individual" | "self";
  groupName?: string;
  memberNames: string[];
}

export interface JobWorkflowState {
  stage: WorkflowStage;
  estimateData?: EstimateData;
  inspectionFee?: number;
  inspectionFeePaid?: boolean;
  advanceAmount?: number;
  purchaseItems: PurchaseItem[];
  /** Ordered list of purchase batches; first entry is the initial quote. */
  purchaseBatches?: PurchaseBatch[];
  invoiceData?: InvoiceData;
  assignment?: JobAssignment;
  pickedUpAt?: string;
}

/* ─── Stage labels (status pill text) ─── */
export const stageLabel: Record<string, string> = {
  incoming: "New Job",
  // Fixed
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  invoice_sent: "Invoice Sent — Awaiting Payment",
  paid: "Paid",
  // Estimate
  estimate_sent: "Estimate Sent — Awaiting Approval",
  estimate_approved: "Estimate Approved",
  subtasks_created: "Subtasks Created",
  quote_sent: "Quote Sent — Awaiting Approval",
  quote_approved: "Quote Approved — Awaiting Advance",
  advance_paid: "Advance Paid",
  purchases_ongoing: "Purchases Ongoing",
  ready_to_start: "Ready to Start",
  // Inspection
  inspection_proposal_sent: "Inspection Proposal Sent — Awaiting Payment",
  inspection_fee_paid: "Inspection Fee Paid",
  inspection_assigned: "Inspection Assigned",
  inspection_completed: "Inspection Completed",
};

export const stageColor: Record<string, { bg: string; text: string }> = {
  incoming: { bg: "bg-blue-500/10", text: "text-blue-600" },
  assigned: { bg: "bg-primary/10", text: "text-primary" },
  in_progress: { bg: "bg-primary/10", text: "text-primary" },
  completed: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  invoice_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  paid: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  estimate_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  estimate_approved: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  subtasks_created: { bg: "bg-blue-500/10", text: "text-blue-600" },
  quote_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  quote_approved: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  advance_paid: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  purchases_ongoing: { bg: "bg-blue-500/10", text: "text-blue-600" },
  ready_to_start: { bg: "bg-primary/10", text: "text-primary" },
  inspection_proposal_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  inspection_fee_paid: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  inspection_assigned: { bg: "bg-primary/10", text: "text-primary" },
  inspection_completed: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
};

/* ─── Default state ─── */
export const createDefaultWorkflowState = (_category: JobCategory): JobWorkflowState => ({
  stage: "incoming",
  purchaseItems: [],
});

/* ─── Stages where Purchase List tab is visible ─── */
export const purchaseListVisibleStages: WorkflowStage[] = [
  "quote_sent",
  "quote_approved",
  "advance_paid",
  "purchases_ongoing",
  "ready_to_start",
  "in_progress",
  "completed",
  "invoice_sent",
  "paid",
];

/* ─── Stages where Quote tab is visible ─── */
export const quoteTabVisibleStages: WorkflowStage[] = [
  "subtasks_created",
  "assigned",
  "quote_sent",
  "quote_approved",
  "advance_paid",
  "purchases_ongoing",
  "ready_to_start",
  "in_progress",
  "completed",
  "invoice_sent",
  "paid",
];

/* ─── Stages where Subtasks tab is visible ─── */
export const subtasksTabVisibleStages: WorkflowStage[] = [
  "estimate_approved",
  "inspection_completed", // PRD: post-inspection flow joins estimate at subtasks
  "subtasks_created",
  "assigned",
  "quote_sent",
  "quote_approved",
  "advance_paid",
  "purchases_ongoing",
  "ready_to_start",
  "in_progress",
  "completed",
  "invoice_sent",
  "paid",
];
