import { useMemo, useState } from "react";
import {
  Plus, Users, CheckCircle2, Clock, Play, Circle, Trash2, Edit3,
  ShieldCheck, User as UserIcon, X, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  allMembers, subtasks as seedSubtasks, type Subtask, type SubtaskStatus,
  type GroupMember, subtaskStatusLabel,
} from "@/data/messaging";

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
  // Local in-memory list seeded from mock for this job. New subtasks created here
  // also feel "connected" to groups since we use the same shape.
  const initial = useMemo(
    () => seedSubtasks.filter((s) => s.jobId === jobId),
    [jobId]
  );
  const [items, setItems] = useState<Subtask[]>(
    initial.length > 0
      ? initial
      : [
          // Provide a couple of placeholder subtasks for jobs that have none yet
          {
            id: `${jobId}-s1`,
            jobId,
            title: "Site walk-through & measurements",
            description: "Capture room dimensions and pain points before quoting.",
            assigneeIds: [SELF_ID],
            status: "pending",
          },
          {
            id: `${jobId}-s2`,
            jobId,
            title: "Photograph existing setup",
            assigneeIds: [],
            status: "pending",
          },
        ]
  );

  const [isAdminView, setIsAdminView] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<string | null>(null); // subtask id

  // Visible list — user view shows only subtasks assigned to current user
  const visible = isAdminView ? items : items.filter((s) => s.assigneeIds.includes(SELF_ID));

  const memberList: GroupMember[] = Object.values(allMembers);
  const memberById = (id: string) => memberList.find((m) => m.id === id);

  const total = items.length;
  const done = items.filter((s) => s.status === "completed").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  // ── Mutations ─────────────────────────────────────────────
  const advanceStatus = (id: string) => {
    setItems((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const i = statusOrder.indexOf(s.status);
        const next = statusOrder[Math.min(i + 1, statusOrder.length - 1)];
        return { ...s, status: next };
      })
    );
  };

  const acceptSubtask = (id: string) => {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s))
    );
    toast.success("Subtask accepted");
  };

  const completeSubtask = (id: string) => {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "completed" } : s))
    );
    toast.success("Subtask completed");
  };

  const deleteSubtask = (id: string) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
    toast("Subtask deleted");
  };

  const createSubtask = (title: string, description: string, assigneeIds: string[]) => {
    const id = `${jobId}-s${Date.now()}`;
    setItems((prev) => [
      ...prev,
      { id, jobId, title, description, assigneeIds, status: "pending" },
    ]);
    setCreateOpen(false);
    toast.success("Subtask created");
  };

  const toggleAssignee = (subtaskId: string, memberId: string) => {
    setItems((prev) =>
      prev.map((s) => {
        if (s.id !== subtaskId) return s;
        const has = s.assigneeIds.includes(memberId);
        return {
          ...s,
          assigneeIds: has ? s.assigneeIds.filter((x) => x !== memberId) : [...s.assigneeIds, memberId],
        };
      })
    );
  };

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
        members={memberList}
        onCreate={createSubtask}
      />

      {/* Assign Sheet */}
      <Sheet open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
        <SheetContent side="bottom" className="rounded-t-[28px] px-4 pb-6 pt-2 sm:max-w-[420px] sm:mx-auto">
          <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          <h3 className="mb-1 text-base font-bold text-foreground">Assign team members</h3>
          <p className="mb-4 text-[11px] text-muted-foreground">
            Select one or more people for this subtask.
          </p>
          <div className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto">
            {memberList.map((m) => {
              const current = items.find((s) => s.id === assignFor);
              const checked = current?.assigneeIds.includes(m.id) ?? false;
              return (
                <button
                  key={m.id}
                  onClick={() => assignFor && toggleAssignee(assignFor, m.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    checked ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {m.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setAssignFor(null)}
            className="mt-4 w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
          >
            Done
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ── Create Subtask Sheet ───────────────────────────────────
const CreateSubtaskSheet = ({
  open,
  onOpenChange,
  members,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  members: GroupMember[];
  onCreate: (title: string, description: string, assigneeIds: string[]) => void;
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  const reset = () => {
    setTitle("");
    setDesc("");
    setPicked([]);
    setShowMembers(false);
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onCreate(title.trim(), desc.trim(), picked);
    reset();
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

          {/* Assignees */}
          <div>
            <button
              onClick={() => setShowMembers((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-left"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assign to</p>
                <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                  {picked.length === 0 ? "Unassigned" : `${picked.length} member${picked.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showMembers ? "rotate-180" : ""}`} />
            </button>
            {showMembers && (
              <div className="mt-2 flex max-h-[180px] flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-1.5">
                {members.map((m) => {
                  const checked = picked.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() =>
                        setPicked((prev) =>
                          checked ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                        )
                      }
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left ${
                        checked ? "bg-primary/10" : "active:bg-muted"
                      }`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {m.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-foreground">{m.name}</p>
                        <p className="text-[10px] capitalize text-muted-foreground">{m.role}</p>
                      </div>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
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
