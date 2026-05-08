import { useEffect, useState } from "react";
import {
  Plus, Users, CheckCircle2, Clock, Play, Circle, Trash2, Edit3,
  ShieldCheck, User as UserIcon, X, Flag,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  allMembers, type SubtaskStatus,
  type GroupMember, subtaskStatusLabel, groupConversations,
} from "@/data/messaging";
import AssignSheet, { type AssignmentResult, type AssignGroup, type AssignIndividual } from "@/components/trader/AssignSheet";
import { useJobMilestonesStore, type MMilestone, type MSubtask } from "@/stores/jobMilestonesStore";

interface JobSubtasksTabProps {
  jobId: string;
  jobTitle: string;
}

const statusOrder: SubtaskStatus[] = ["pending", "accepted", "in_progress", "completed"];

const statusStyles: Record<SubtaskStatus, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-muted text-muted-foreground", text: "text-muted-foreground", icon: Circle },
  accepted: { bg: "bg-blue-500/10 text-blue-600", text: "text-blue-600", icon: CheckCircle2 },
  in_progress: { bg: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]", text: "text-[hsl(25,90%,55%)]", icon: Play },
  completed: { bg: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]", text: "text-[hsl(142,70%,45%)]", icon: CheckCircle2 },
};

// Self-id mirrors messaging.ts ("u-self")
const SELF_ID = "u-self";

const JobSubtasksTab = ({ jobId, jobTitle }: JobSubtasksTabProps) => {
  const ensureJob = useJobMilestonesStore((s) => s.ensureJob);
  const items = useJobMilestonesStore((s) => s.subtasksByJob[jobId] ?? []);
  const milestones = useJobMilestonesStore((s) => s.milestonesByJob[jobId] ?? []);
  const setSubtaskStatus = useJobMilestonesStore((s) => s.setSubtaskStatus);
  const setSubtaskMilestone = useJobMilestonesStore((s) => s.setSubtaskMilestone);
  const setSubtaskAssignees = useJobMilestonesStore((s) => s.setSubtaskAssignees);
  const addSubtask = useJobMilestonesStore((s) => s.addSubtask);
  const removeSubtask = useJobMilestonesStore((s) => s.deleteSubtask);

  useEffect(() => { ensureJob(jobId); }, [jobId, ensureJob]);

  const [isAdminView, setIsAdminView] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<string | null>(null); // subtask id
  const [milestoneFor, setMilestoneFor] = useState<string | null>(null); // subtask id

  // Visible list — user view shows only subtasks assigned to current user
  const visible = isAdminView ? items : items.filter((s) => s.assigneeIds.includes(SELF_ID));

  const memberList: GroupMember[] = Object.values(allMembers);
  const memberById = (id: string) => memberList.find((m) => m.id === id);
  const milestoneById = (id?: string) => milestones.find((m) => m.id === id);

  const total = items.length;
  const done = items.filter((s) => s.status === "completed").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  // ── Mutations ─────────────────────────────────────────────
  const advanceStatus = (id: string) => {
    const s = items.find((x) => x.id === id);
    if (!s) return;
    const i = statusOrder.indexOf(s.status);
    const next = statusOrder[Math.min(i + 1, statusOrder.length - 1)];
    setSubtaskStatus(jobId, id, next);
    if (next === "completed") {
      const ms = milestoneById(s.milestoneId);
      if (ms) toast.success(`Subtask completed · ${ms.title}`);
    }
  };

  const acceptSubtask = (id: string) => {
    setSubtaskStatus(jobId, id, "accepted");
    toast.success("Subtask accepted");
  };

  const completeSubtask = (id: string) => {
    setSubtaskStatus(jobId, id, "completed");
    toast.success("Subtask completed");
  };

  const deleteSubtask = (id: string) => {
    removeSubtask(jobId, id);
    toast("Subtask deleted");
  };

  const createSubtask = (title: string, description: string, assigneeIds: string[], milestoneId?: string) => {
    const id = `${jobId}-s${Date.now()}`;
    addSubtask(jobId, { id, title, description, assigneeIds, status: "pending", milestoneId });
    setCreateOpen(false);
    toast.success("Subtask created");
  };

  const handleAssignmentConfirm = (result: AssignmentResult) => {
    if (!assignFor) return;
    setSubtaskAssignees(jobId, assignFor, result.memberIds);
    setAssignFor(null);
    const who = result.type === "group"
      ? `${result.groupName} (${result.memberNames.length} members)`
      : result.memberNames.join(", ");
    toast.success(`Assigned to ${who}`);
  };

  // Map data for AssignSheet
  const groups: AssignGroup[] = groupConversations.map(g => ({
    id: g.id,
    name: g.name,
    members: g.members.map(m => ({ id: m.id, name: m.name, role: m.role }))
  }));

  const individuals: AssignIndividual[] = Object.values(allMembers).map(m => ({
    id: m.id,
    name: m.name,
    role: m.role
  }));

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header: View toggle (admin only context) */}
      <div className="rounded-2xl border border-border/40 bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Subtasks
            </p>
            <p className="text-[12px] font-semibold text-foreground truncate">
              {done}/{total} completed · {progress}%
            </p>
          </div>
          {/* Admin/User toggle */}
          <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
            <button
              onClick={() => setIsAdminView(true)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                isAdminView ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> Admin
            </button>
            <button
              onClick={() => setIsAdminView(false)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                !isAdminView ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <UserIcon className="h-3 w-3" /> User
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {isAdminView
            ? "Admin view: full control — break down, assign, edit."
            : "User view: subtasks assigned to you."}
        </p>
      </div>

      {/* Admin: Create button */}
      {isAdminView && (
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-[12px] font-bold text-primary active:bg-primary/10"
        >
          <Plus className="h-4 w-4" /> Add Subtask
        </button>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-[12px] font-semibold text-foreground">
            {isAdminView ? "No subtasks yet" : "Nothing assigned to you"}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {isAdminView
              ? `Break "${jobTitle}" into smaller subtasks and assign them to your team.`
              : "When admin assigns subtasks to you, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((s) => {
            const sStyle = statusStyles[s.status];
            const SIcon = sStyle.icon;
            const assignees = s.assigneeIds.map(memberById).filter(Boolean) as GroupMember[];
            const isMine = s.assigneeIds.includes(SELF_ID);

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-border/40 bg-card p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-bold text-foreground leading-snug">
                        {s.title}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sStyle.bg}`}>
                        {subtaskStatusLabel(s.status)}
                      </span>
                    </div>
                    {s.description && (
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        {s.description}
                      </p>
                    )}

                    {/* Milestone link */}
                    <div className="mt-2">
                      {(() => {
                        const ms = milestoneById(s.milestoneId);
                        if (ms) {
                          return (
                            <button
                              onClick={() => isAdminView && setMilestoneFor(s.id)}
                              disabled={!isAdminView}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary"
                            >
                              <Flag className="h-2.5 w-2.5" /> {ms.title}
                            </button>
                          );
                        }
                        return isAdminView ? (
                          <button
                            onClick={() => setMilestoneFor(s.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[9px] font-bold text-muted-foreground"
                          >
                            <Flag className="h-2.5 w-2.5" /> Link to milestone
                          </button>
                        ) : (
                          <span className="text-[9px] italic text-muted-foreground">No milestone</span>
                        );
                      })()}
                    </div>

                    {/* Assignees */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {assignees.length > 0 ? (
                          <>
                            <div className="flex -space-x-1.5">
                              {assignees.slice(0, 3).map((m) => (
                                <div
                                  key={m.id}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary ring-2 ring-card"
                                  title={m.name}
                                >
                                  {m.initial}
                                </div>
                              ))}
                              {assignees.length > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-card">
                                  +{assignees.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="truncate text-[10px] text-muted-foreground">
                              {assignees.map((m) => m.name).join(", ")}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground">Unassigned</span>
                        )}
                      </div>

                      {isAdminView && (
                        <button
                          onClick={() => setAssignFor(s.id)}
                          className="flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[9px] font-bold text-foreground active:bg-muted"
                        >
                          <Users className="h-3 w-3" /> Assign
                        </button>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {isAdminView ? (
                        <>
                          <button
                            onClick={() => advanceStatus(s.id)}
                            disabled={s.status === "completed"}
                            className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary disabled:opacity-40"
                          >
                            <Clock className="h-3 w-3" /> Advance
                          </button>
                          <button
                            onClick={() => toast.info("Edit coming soon")}
                            className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-[10px] font-bold text-foreground"
                          >
                            <Edit3 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => deleteSubtask(s.id)}
                            className="ml-auto flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          {!isMine ? (
                            <span className="text-[10px] italic text-muted-foreground">Not assigned to you</span>
                          ) : s.status === "pending" ? (
                            <button
                              onClick={() => acceptSubtask(s.id)}
                              className="flex-1 rounded-md bg-primary py-1.5 text-[10px] font-bold text-primary-foreground active:opacity-90"
                            >
                              Accept
                            </button>
                          ) : s.status === "completed" ? (
                            <span className="text-[10px] font-bold text-[hsl(142,70%,45%)]">✓ Done</span>
                          ) : (
                            <button
                              onClick={() => completeSubtask(s.id)}
                              className="flex-1 rounded-md bg-[hsl(142,70%,45%)] py-1.5 text-[10px] font-bold text-white active:opacity-90"
                            >
                              Mark Complete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper note about group sync */}
      <p className="px-1 text-center text-[9px] text-muted-foreground">
        Subtasks are synced with the assigned group's workspace.
      </p>

      {/* Create Subtask Sheet */}
      <CreateSubtaskSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        groups={groups}
        individuals={individuals}
        onCreate={createSubtask}
      />

      <AssignSheet
        isOpen={!!assignFor}
        onOpenChange={(o) => !o && setAssignFor(null)}
        jobTitle={items.find(s => s.id === assignFor)?.title ?? "Subtask"}
        jobSubtitle="Select team for this subtask"
        groups={groups}
        individuals={individuals}
        confirmLabel="Assign Subtask"
        confirmHelperText="Selected members will be notified about this subtask."
        onConfirm={handleAssignmentConfirm}
      />
    </div>
  );
};

// ── Create Subtask Sheet ───────────────────────────────────
const CreateSubtaskSheet = ({
  open,
  onOpenChange,
  groups,
  individuals,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  groups: AssignGroup[];
  individuals: AssignIndividual[];
  onCreate: (title: string, description: string, assigneeIds: string[]) => void;
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<"group" | "individual">("group");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDesc("");
    setPicked([]);
    setAssignmentMode("group");
    setSelectedGroupId(null);
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onCreate(title.trim(), desc.trim(), picked);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <SheetContent side="bottom" className="rounded-t-[28px] px-4 pb-6 pt-2 sm:max-w-[420px] sm:mx-auto">
        <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">New Subtask</h3>
          <button onClick={() => onOpenChange(false)} className="rounded-full p-1 active:bg-muted">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Measure window dimensions"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[12px] text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Description (optional)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Add context or instructions..."
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-[12px] text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Assignees with Toggle */}
          <div>
            <p className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Assign to
            </p>
            <div className="flex p-1 bg-muted rounded-xl mb-3">
              <button
                onClick={() => { setAssignmentMode("group"); setPicked([]); setSelectedGroupId(null); }}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                  assignmentMode === "group" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                }`}
              >
                Assign Group
              </button>
              <button
                onClick={() => { setAssignmentMode("individual"); setPicked([]); setSelectedGroupId(null); }}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                  assignmentMode === "individual" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                }`}
              >
                Assign Individuals
              </button>
            </div>

            {assignmentMode === "group" ? (
              <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setPicked(g.members.map(m => m.id));
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      selectedGroupId === g.id ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div>
                      <p className="text-[12px] font-bold text-foreground">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground">{g.members.length} members</p>
                    </div>
                    {selectedGroupId === g.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto pr-1">
                {individuals.map(m => {
                  const checked = picked.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPicked(prev => checked ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                        checked ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-foreground">{m.name}</p>
                        <p className="text-[9px] capitalize text-muted-foreground">{m.role}</p>
                      </div>
                      <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}>
                        {checked && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={submit}
            className="mt-2 w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground active:opacity-90"
          >
            Create Subtask
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JobSubtasksTab;
