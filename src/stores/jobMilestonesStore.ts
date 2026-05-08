// ============================================================
// Shared store mapping subtasks ↔ milestones for a job.
// When all subtasks linked to a milestone are completed, the
// milestone is auto-marked done (and the next upcoming becomes
// current). Manually completing a milestone marks all its linked
// subtasks completed.
// ============================================================
import { create } from "zustand";

export type MilestoneStatus = "done" | "current" | "upcoming";
export type SubStatus = "pending" | "accepted" | "in_progress" | "completed";

export interface MMilestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: MilestoneStatus;
  pct?: number;
}

export interface MSubtask {
  id: string;
  jobId: string;
  /** Optional: subtasks not linked to a milestone are "general". */
  milestoneId?: string;
  title: string;
  description?: string;
  assigneeIds: string[];
  status: SubStatus;
  formId?: string;
}

const SELF_ID = "u-self";

// ── Default seeds (Full House Repaint — j4 / j5) ──────────────
const paintingMilestones: MMilestone[] = [
  { id: "ms1", title: "Site survey & colour confirmation", description: "Walk-through with customer, finalise palette.", date: "13 Mar", status: "done" },
  { id: "ms2", title: "Prep & masking", description: "Cover floors, mask trims and outlets.", date: "14 Mar", status: "done" },
  { id: "ms3", title: "First coat — all rooms", description: "Roller and cut-in across 4 bedrooms + hallway.", date: "16 – 19 Mar", status: "current", pct: 60 },
  { id: "ms4", title: "Second coat & touch-ups", date: "21 – 25 Mar", status: "upcoming" },
  { id: "ms5", title: "Trim, doors & skirting", date: "28 Mar – 1 Apr", status: "upcoming" },
  { id: "ms6", title: "Final walk-through & sign-off", date: "4 Apr", status: "upcoming" },
];

const paintingSubtasks = (jobId: string): MSubtask[] => [
  { id: `${jobId}-st1`, jobId, milestoneId: "ms1", title: "Walk-through with customer", assigneeIds: [SELF_ID], status: "completed" },
  { id: `${jobId}-st2`, jobId, milestoneId: "ms1", title: "Confirm final colour palette", assigneeIds: [SELF_ID], status: "completed" },
  { id: `${jobId}-st3`, jobId, milestoneId: "ms2", title: "Cover floors with drop cloths", assigneeIds: [SELF_ID], status: "completed" },
  { id: `${jobId}-st4`, jobId, milestoneId: "ms2", title: "Mask trims, sockets & switches", assigneeIds: [SELF_ID], status: "completed" },
  { id: `${jobId}-st5`, jobId, milestoneId: "ms3", title: "Cut-in edges (all rooms)", assigneeIds: [SELF_ID], status: "completed" },
  { id: `${jobId}-st6`, jobId, milestoneId: "ms3", title: "Roller first coat — bedrooms", assigneeIds: [SELF_ID], status: "in_progress" },
  { id: `${jobId}-st7`, jobId, milestoneId: "ms3", title: "Roller first coat — hallway", assigneeIds: [], status: "pending" },
  { id: `${jobId}-st8`, jobId, milestoneId: "ms4", title: "Apply second coat", assigneeIds: [], status: "pending" },
  { id: `${jobId}-st9`, jobId, milestoneId: "ms4", title: "Touch-ups & inspection", assigneeIds: [], status: "pending" },
  { id: `${jobId}-st10`, jobId, milestoneId: "ms5", title: "Paint skirting & doors", assigneeIds: [], status: "pending" },
  { id: `${jobId}-st11`, jobId, milestoneId: "ms6", title: "Customer walk-through & sign-off", assigneeIds: [SELF_ID], status: "pending" },
];

const defaultMilestones = (): MMilestone[] => paintingMilestones.map((m) => ({ ...m }));

const defaultSubtasks = (jobId: string): MSubtask[] => [
  { id: `${jobId}-st1`, jobId, milestoneId: "ms1", title: "Site walk-through & measurements", description: "Capture room dimensions and pain points.", assigneeIds: [SELF_ID], status: "pending" },
  { id: `${jobId}-st2`, jobId, milestoneId: "ms1", title: "Photograph existing setup", assigneeIds: [], status: "pending" },
];

const seededJobs: Record<string, { milestones: MMilestone[]; subtasks: MSubtask[] }> = {
  j4: { milestones: paintingMilestones.map((m) => ({ ...m })), subtasks: paintingSubtasks("j4") },
  j5: { milestones: paintingMilestones.map((m) => ({ ...m })), subtasks: paintingSubtasks("j5") },
};

interface State {
  milestonesByJob: Record<string, MMilestone[]>;
  subtasksByJob: Record<string, MSubtask[]>;
  ensureJob: (jobId: string) => void;
  // subtask actions
  setSubtaskStatus: (jobId: string, subtaskId: string, status: SubStatus) => void;
  setSubtaskMilestone: (jobId: string, subtaskId: string, milestoneId: string | undefined) => void;
  setSubtaskAssignees: (jobId: string, subtaskId: string, ids: string[]) => void;
  addSubtask: (jobId: string, s: Omit<MSubtask, "jobId">) => void;
  deleteSubtask: (jobId: string, subtaskId: string) => void;
  // milestone actions
  completeMilestone: (jobId: string, milestoneId: string) => void;
  addMilestone: (jobId: string, m: MMilestone) => void;
}

// Pure reducer: after a subtask change, recompute affected milestone status.
const reconcile = (
  milestones: MMilestone[],
  subtasks: MSubtask[],
  affectedMilestoneId?: string,
): MMilestone[] => {
  if (!affectedMilestoneId) return milestones;
  const linked = subtasks.filter((s) => s.milestoneId === affectedMilestoneId);
  if (linked.length === 0) return milestones;
  const allDone = linked.every((s) => s.status === "completed");
  const next = milestones.map((m) => ({ ...m }));
  const idx = next.findIndex((m) => m.id === affectedMilestoneId);
  if (idx < 0) return milestones;

  if (allDone && next[idx].status !== "done") {
    next[idx] = { ...next[idx], status: "done", pct: 100 };
    // promote next upcoming to current
    const ni = next.findIndex((m, i) => i > idx && m.status === "upcoming");
    if (ni > -1 && !next.some((m) => m.status === "current")) {
      next[ni] = { ...next[ni], status: "current", pct: 0 };
    }
  } else if (!allDone) {
    // compute progress %
    const doneCount = linked.filter((s) => s.status === "completed").length;
    const pct = Math.round((doneCount / linked.length) * 100);
    if (next[idx].status === "current") {
      next[idx] = { ...next[idx], pct };
    } else if (next[idx].status === "done") {
      // a previously-done milestone shouldn't go backwards automatically
      // (only manual edits would undo it). Leave as-is.
    }
  }
  return next;
};

export const useJobMilestonesStore = create<State>((set, get) => ({
  milestonesByJob: {},
  subtasksByJob: {},

  ensureJob: (jobId) => {
    const s = get();
    if (s.milestonesByJob[jobId]) return;
    const seed = seededJobs[jobId];
    set({
      milestonesByJob: {
        ...s.milestonesByJob,
        [jobId]: seed ? seed.milestones : defaultMilestones(),
      },
      subtasksByJob: {
        ...s.subtasksByJob,
        [jobId]: seed ? seed.subtasks : defaultSubtasks(jobId),
      },
    });
  },

  setSubtaskStatus: (jobId, subtaskId, status) => {
    const s = get();
    const subs = (s.subtasksByJob[jobId] ?? []).map((x) =>
      x.id === subtaskId ? { ...x, status } : x,
    );
    const target = subs.find((x) => x.id === subtaskId);
    const milestones = reconcile(s.milestonesByJob[jobId] ?? [], subs, target?.milestoneId);
    set({
      subtasksByJob: { ...s.subtasksByJob, [jobId]: subs },
      milestonesByJob: { ...s.milestonesByJob, [jobId]: milestones },
    });
  },

  setSubtaskMilestone: (jobId, subtaskId, milestoneId) => {
    const s = get();
    const prev = s.subtasksByJob[jobId] ?? [];
    const before = prev.find((x) => x.id === subtaskId)?.milestoneId;
    const subs = prev.map((x) => (x.id === subtaskId ? { ...x, milestoneId } : x));
    let milestones = s.milestonesByJob[jobId] ?? [];
    milestones = reconcile(milestones, subs, before);
    milestones = reconcile(milestones, subs, milestoneId);
    set({
      subtasksByJob: { ...s.subtasksByJob, [jobId]: subs },
      milestonesByJob: { ...s.milestonesByJob, [jobId]: milestones },
    });
  },

  setSubtaskAssignees: (jobId, subtaskId, ids) => {
    const s = get();
    const subs = (s.subtasksByJob[jobId] ?? []).map((x) =>
      x.id === subtaskId ? { ...x, assigneeIds: ids } : x,
    );
    set({ subtasksByJob: { ...s.subtasksByJob, [jobId]: subs } });
  },

  addSubtask: (jobId, sub) => {
    const s = get();
    const subs = [...(s.subtasksByJob[jobId] ?? []), { ...sub, jobId }];
    const milestones = reconcile(s.milestonesByJob[jobId] ?? [], subs, sub.milestoneId);
    set({
      subtasksByJob: { ...s.subtasksByJob, [jobId]: subs },
      milestonesByJob: { ...s.milestonesByJob, [jobId]: milestones },
    });
  },

  deleteSubtask: (jobId, subtaskId) => {
    const s = get();
    const prev = s.subtasksByJob[jobId] ?? [];
    const removed = prev.find((x) => x.id === subtaskId);
    const subs = prev.filter((x) => x.id !== subtaskId);
    const milestones = reconcile(s.milestonesByJob[jobId] ?? [], subs, removed?.milestoneId);
    set({
      subtasksByJob: { ...s.subtasksByJob, [jobId]: subs },
      milestonesByJob: { ...s.milestonesByJob, [jobId]: milestones },
    });
  },

  completeMilestone: (jobId, milestoneId) => {
    const s = get();
    // Mark all linked subtasks as completed
    const subs = (s.subtasksByJob[jobId] ?? []).map((x) =>
      x.milestoneId === milestoneId ? { ...x, status: "completed" as SubStatus } : x,
    );
    let milestones = (s.milestonesByJob[jobId] ?? []).map((m) => ({ ...m }));
    const idx = milestones.findIndex((m) => m.id === milestoneId);
    if (idx > -1) {
      milestones[idx] = { ...milestones[idx], status: "done", pct: 100 };
      const ni = milestones.findIndex((m, i) => i > idx && m.status === "upcoming");
      if (ni > -1 && !milestones.some((m) => m.status === "current")) {
        milestones[ni] = { ...milestones[ni], status: "current", pct: 0 };
      }
    }
    set({
      subtasksByJob: { ...s.subtasksByJob, [jobId]: subs },
      milestonesByJob: { ...s.milestonesByJob, [jobId]: milestones },
    });
  },

  addMilestone: (jobId, m) => {
    const s = get();
    set({
      milestonesByJob: {
        ...s.milestonesByJob,
        [jobId]: [...(s.milestonesByJob[jobId] ?? []), m],
      },
    });
  },
}));
