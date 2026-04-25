import {
  UserPlus, FileText, CheckCircle2, Receipt, ListChecks, PlayCircle,
  Hammer, Users, Clock, ShoppingCart, Package, type LucideIcon,
} from "lucide-react";
import type { WorkflowStage, JobCategory } from "@/data/jobWorkflowState";

/** Single source of truth for stage CTA — used by both the list card and detail footer. */
export type StageCtaTone = "primary" | "warning" | "success" | "info";

export interface StageCta {
  /** Status pill text under the title. */
  label: string;
  /** Tailwind classes for the pill (semantic-token friendly). */
  pillClass: string;
  /** Footer button label. */
  cta: string;
  /** Footer button icon. */
  ctaIcon: LucideIcon;
  /** Visual tone for the footer button. */
  tone: StageCtaTone;
  /** Short explanatory subtitle under the pill. */
  hint?: string;
  /** When true, the CTA is informational only (e.g. waiting on customer). */
  awaiting?: boolean;
}

export const stageCtaMap: Partial<Record<WorkflowStage, StageCta>> = {
  // ─── Fixed flow ───────────────────────────────────────────
  assigned: {
    label: "Assigned",
    pillClass: "bg-primary/10 text-primary",
    cta: "Start Work",
    ctaIcon: PlayCircle,
    tone: "primary",
  },
  in_progress: {
    label: "In Progress",
    pillClass: "bg-primary/10 text-primary",
    cta: "Mark Completed",
    ctaIcon: Hammer,
    tone: "primary",
  },
  completed: {
    label: "Completed",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "Create Invoice",
    ctaIcon: Receipt,
    tone: "primary",
  },
  invoice_sent: {
    label: "Invoice Sent",
    pillClass: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",
    cta: "Awaiting Payment",
    ctaIcon: Clock,
    tone: "info",
    awaiting: true,
  },
  paid: {
    label: "Paid",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "View Summary",
    ctaIcon: CheckCircle2,
    tone: "success",
  },

  // ─── Estimate flow ────────────────────────────────────────
  estimate_sent: {
    label: "Estimate Sent",
    pillClass: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",
    cta: "Await Approval",
    ctaIcon: Clock,
    tone: "info",
    awaiting: true,
  },
  estimate_approved: {
    label: "Estimate Approved",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "Create Subtasks",
    ctaIcon: ListChecks,
    tone: "primary",
    hint: "Break the work into subtasks before assigning.",
  },
  subtasks_created: {
    label: "Subtasks Ready",
    pillClass: "bg-blue-500/10 text-blue-600",
    cta: "Assign Work",
    ctaIcon: Users,
    tone: "primary",
  },
  // estimate-flow "assigned" reuses fixed.assigned label but shows Create Quote.
  // We override below in getStageCta when category === "estimate" or "inspection".

  quote_sent: {
    label: "Quote Sent",
    pillClass: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",
    cta: "Await Approval",
    ctaIcon: Clock,
    tone: "info",
    awaiting: true,
  },
  quote_approved: {
    label: "Quote Approved",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "Await Advance Payment",
    ctaIcon: Clock,
    tone: "info",
    awaiting: true,
  },
  advance_paid: {
    label: "Advance Paid",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "View Purchase List",
    ctaIcon: ShoppingCart,
    tone: "primary",
  },
  purchases_ongoing: {
    label: "Purchases Ongoing",
    pillClass: "bg-blue-500/10 text-blue-600",
    cta: "Manage Purchases",
    ctaIcon: ShoppingCart,
    tone: "primary",
    hint: "Track items as they're purchased.",
  },
  ready_to_start: {
    label: "Ready to Start",
    pillClass: "bg-primary/10 text-primary",
    cta: "Start Work",
    ctaIcon: PlayCircle,
    tone: "primary",
  },

  // ─── Inspection flow ──────────────────────────────────────
  inspection_proposal_sent: {
    label: "Inspection Proposal Sent",
    pillClass: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",
    cta: "Await Payment",
    ctaIcon: Clock,
    tone: "info",
    awaiting: true,
  },
  inspection_fee_paid: {
    label: "Inspection Fee Paid",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "Assign for Inspection",
    ctaIcon: Users,
    tone: "primary",
  },
  inspection_assigned: {
    label: "Inspection Assigned",
    pillClass: "bg-primary/10 text-primary",
    cta: "Start Inspection",
    ctaIcon: PlayCircle,
    tone: "primary",
  },
  inspection_completed: {
    label: "Inspection Completed",
    pillClass: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    cta: "Create Subtasks",
    ctaIcon: ListChecks,
    tone: "primary",
  },
};

/** Returns CTA for a stage, applying category-specific overrides where the same
 *  stage label means different things (e.g. "assigned" in estimate flow → "Create Quote"). */
export const getStageCta = (
  stage: WorkflowStage,
  category: JobCategory,
): StageCta => {
  // Estimate / inspection flow: stage "assigned" comes after subtasks → next CTA is Create Quote.
  if (stage === "assigned" && category !== "fixed") {
    return {
      label: "Worker Assigned",
      pillClass: "bg-primary/10 text-primary",
      cta: "Create Quote",
      ctaIcon: FileText,
      tone: "primary",
    };
  }
  return stageCtaMap[stage] ?? {
    label: stage,
    pillClass: "bg-muted text-muted-foreground",
    cta: "View Job",
    ctaIcon: Package,
    tone: "primary",
  };
};
