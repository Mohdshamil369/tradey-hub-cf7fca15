/* ─── Job Workflow State ─── */

export type FixedStage = "incoming" | "unassigned" | "assigned" | "active" | "completed" | "cancelled";

export type EstimateStage =
  | "incoming"
  | "estimate_sent"
  | "estimate_approved"
  | "subtasks_created"
  | "quote_sent"
  | "quote_accepted"
  | "purchasing"
  | "work_in_progress"
  | "invoice_sent"
  | "completed";

export type InspectionStage =
  | "incoming"
  | "fee_set"
  | "fee_paid"
  | "worker_assigned"
  | "inspected"
  // After inspection, merges into estimate flow
  | "estimate_sent"
  | "estimate_approved"
  | "subtasks_created"
  | "quote_sent"
  | "quote_accepted"
  | "purchasing"
  | "work_in_progress"
  | "invoice_sent"
  | "completed";

export type WorkflowStage = FixedStage | EstimateStage | InspectionStage;

export interface EstimateData {
  title: string;
  minPrice: number;
  maxPrice: number;
  description: string;
  hasVoiceNote: boolean;
  sentAt: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  expectedPrice: number;
  status: "pending" | "purchased";
  buyer: "customer" | "admin";
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
  type: "group" | "individual";
  groupName?: string;
  memberNames: string[];
}

export interface JobWorkflowState {
  stage: WorkflowStage;
  estimateData?: EstimateData;
  inspectionFee?: number;
  inspectionMin?: number;
  inspectionMax?: number;
  inspectionFeePaid?: boolean;
  advanceAmount?: number;
  purchaseItems: PurchaseItem[];
  invoiceData?: InvoiceData;
  assignment?: JobAssignment;
  pickedUpAt?: string;
}

/* ─── Stage Labels ─── */

export const stageLabel: Record<string, string> = {
  incoming: "New Job",
  unassigned: "Assignment Pending",
  assigned: "Assigned",
  active: "Active",
  completed: "Completed",
  estimate_sent: "Estimate Sent — Awaiting Approval",
  estimate_approved: "Estimate Approved",
  subtasks_created: "Subtasks Created",
  quote_sent: "Quote Sent — Awaiting Customer",
  quote_accepted: "Quote Accepted",
  purchasing: "Purchasing Materials",
  work_in_progress: "Work In Progress",
  invoice_sent: "Invoice Sent — Awaiting Payment",
  fee_set: "Inspection Fee Set — Awaiting Payment",
  fee_paid: "Fee Paid — Assign Worker",
  worker_assigned: "Worker Assigned — Inspection",
  inspected: "Inspection Complete",
};

export const stageColor: Record<string, { bg: string; text: string }> = {
  incoming: { bg: "bg-blue-500/10", text: "text-blue-600" },
  assigned: { bg: "bg-primary/10", text: "text-primary" },
  active: { bg: "bg-primary/10", text: "text-primary" },
  completed: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  estimate_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  estimate_approved: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  subtasks_created: { bg: "bg-blue-500/10", text: "text-blue-600" },
  quote_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  quote_accepted: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  purchasing: { bg: "bg-blue-500/10", text: "text-blue-600" },
  work_in_progress: { bg: "bg-primary/10", text: "text-primary" },
  invoice_sent: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  fee_set: { bg: "bg-[hsl(25,90%,55%)]/10", text: "text-[hsl(25,90%,55%)]" },
  fee_paid: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
  worker_assigned: { bg: "bg-primary/10", text: "text-primary" },
  inspected: { bg: "bg-[hsl(142,70%,45%)]/10", text: "text-[hsl(142,70%,45%)]" },
};

/* ─── Default states ─── */

export const createDefaultWorkflowState = (category: "fixed" | "estimate" | "inspection"): JobWorkflowState => ({
  stage: "incoming",
  purchaseItems: [],
  inspectionFee: category === "inspection" ? undefined : undefined,
});
