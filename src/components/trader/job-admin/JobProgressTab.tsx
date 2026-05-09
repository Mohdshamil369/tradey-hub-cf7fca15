import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Circle, Clock, Calendar, Plus, ListChecks,
  ChevronDown, ChevronRight, Link2, X, Play,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useJobMilestonesStore, type MSubtask, type SubStatus } from "@/stores/jobMilestonesStore";

interface JobProgressTabProps {
  jobId: string;
}

const subStatusStyle: Record<SubStatus, { dot: string; label: string }> = {
  pending: { dot: "bg-muted-foreground/40", label: "Pending" },
  accepted: { dot: "bg-blue-500", label: "Accepted" },
  in_progress: { dot: "bg-[hsl(25,90%,55%)]", label: "In progress" },
  completed: { dot: "bg-[hsl(142,70%,45%)]", label: "Completed" },
};

const JobProgressTab = ({ jobId }: JobProgressTabProps) => {
  const ensureJob = useJobMilestonesStore((s) => s.ensureJob);
  const items = useJobMilestonesStore((s) => s.milestonesByJob[jobId] ?? []);
  const subtasks = useJobMilestonesStore((s) => s.subtasksByJob[jobId] ?? []);
  const completeMilestone = useJobMilestonesStore((s) => s.completeMilestone);
  const addMilestone = useJobMilestonesStore((s) => s.addMilestone);
  const setSubtaskMilestone = useJobMilestonesStore((s) => s.setSubtaskMilestone);

  useEffect(() => { ensureJob(jobId); }, [jobId, ensureJob]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [linkFor, setLinkFor] = useState<string | null>(null); // milestone id

  const done = items.filter((m) => m.status === "done").length;
  const total = items.length;
  const overall = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const advance = (id: string) => {
    completeMilestone(jobId, id);
    toast.success("Milestone marked complete");
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Overall */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overall progress</p>
            <p className="text-lg font-extrabold text-foreground">{done} / {total} milestones</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-[12px] font-extrabold text-primary">{overall}%</span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overall}%` }} />
        </div>
      </div>

      {/* Add milestone */}
      <button
        onClick={() => setCreateOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-2.5 text-[11px] font-bold text-primary active:bg-primary/10"
      >
        <Plus className="h-3.5 w-3.5" /> Add milestone
      </button>

      {/* Timeline */}
      <div className="relative pl-6">
        <div className="absolute left-[10px] top-2 bottom-2 w-px bg-border" />
        <div className="flex flex-col gap-3">
          {items.map((m) => {
            const isDone = m.status === "done";
            const isCurrent = m.status === "current";
            const Icon = isDone ? CheckCircle2 : isCurrent ? Clock : Circle;
            const linked = subtasks.filter((s) => s.milestoneId === m.id);
            const doneCount = linked.filter((s) => s.status === "completed").length;
            const isOpen = !!expanded[m.id];
            return (
              <div key={m.id} className="relative">
                <div
                  className={`absolute -left-[22px] top-3 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background ${
                    isDone ? "bg-[hsl(142,70%,45%)] text-white" : isCurrent ? "bg-[hsl(25,90%,55%)] text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className={`rounded-xl border p-3 ${
                  isCurrent ? "border-[hsl(25,90%,55%)]/40 bg-[hsl(25,90%,55%)]/5" :
                  isDone ? "border-border/30 bg-muted/30" :
                  "border-border/30 bg-card"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold leading-snug ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {m.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> {m.date}
                      </p>
                    </div>
                    {!isDone && (
                      <button
                        onClick={() => advance(m.id)}
                        className="shrink-0 rounded-md bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                  {m.description && (
                    <p className="mt-1.5 text-[11px] text-foreground/80 leading-relaxed">{m.description}</p>
                  )}

                  {/* Subtask summary row (clickable to expand) */}
                  <button
                    onClick={() => toggle(m.id)}
                    className="mt-2 flex w-full items-center gap-1.5 text-left text-[10px] font-semibold text-muted-foreground"
                  >
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    <ListChecks className="h-3 w-3" />
                    <span>{doneCount}/{linked.length} subtasks</span>
                    <div className="ml-1 h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${isDone ? "bg-[hsl(142,70%,45%)]" : "bg-[hsl(25,90%,55%)]"}`}
                        style={{ width: `${linked.length === 0 ? 0 : Math.round((doneCount / linked.length) * 100)}%` }}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {linked.length === 0 && (
                        <p className="text-[10px] italic text-muted-foreground">No subtasks linked yet.</p>
                      )}
                      {linked.map((s) => {
                        const st = subStatusStyle[s.status];
                        return (
                          <div key={s.id} className="flex items-center gap-2 rounded-md border border-border/30 bg-background/60 px-2 py-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            <p className={`flex-1 truncate text-[11px] font-semibold ${s.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {s.title}
                            </p>
                            <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{st.label}</span>
                            <button
                              onClick={() => { setSubtaskMilestone(jobId, s.id, undefined); toast.success("Subtask unlinked"); }}
                              className="rounded p-0.5 text-muted-foreground active:bg-muted"
                              aria-label="Unlink"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => setLinkFor(m.id)}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 py-1.5 text-[10px] font-bold text-primary active:bg-primary/10"
                      >
                        <Link2 className="h-3 w-3" /> Link existing subtasks
                      </button>
                    </div>
                  )}

                  {isCurrent && linked.length === 0 && typeof m.pct === "number" && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-[hsl(25,90%,55%)]" style={{ width: `${m.pct}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Link existing subtasks sheet */}
      <LinkSubtasksSheet
        open={!!linkFor}
        onClose={() => setLinkFor(null)}
        jobId={jobId}
        milestoneId={linkFor}
        subtasks={subtasks}
        onLink={(ids) => {
          if (!linkFor) return;
          ids.forEach((id) => setSubtaskMilestone(jobId, id, linkFor));
          toast.success(`${ids.length} subtask${ids.length === 1 ? "" : "s"} linked`);
          setLinkFor(null);
        }}
      />

      {/* Create milestone sheet */}
      <CreateMilestoneSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        subtasks={subtasks}
        onCreate={(title, date, description, linkedIds) => {
          const newId = `ms-${Date.now()}`;
          addMilestone(jobId, { id: newId, title, date, description, status: "upcoming" });
          linkedIds.forEach((sid) => setSubtaskMilestone(jobId, sid, newId));
          toast.success("Milestone added");
          setCreateOpen(false);
        }}
      />
    </div>
  );
};

// ───────── Link existing subtasks sheet ─────────
const LinkSubtasksSheet = ({
  open, onClose, milestoneId, subtasks, onLink,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  milestoneId: string | null;
  subtasks: MSubtask[];
  onLink: (ids: string[]) => void;
}) => {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  useEffect(() => { if (open) setPicked(new Set()); }, [open, milestoneId]);

  // Show subtasks not currently linked to this milestone
  const candidates = useMemo(
    () => subtasks.filter((s) => s.milestoneId !== milestoneId),
    [subtasks, milestoneId],
  );

  const toggle = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="absolute inset-x-0 bottom-0 max-h-[85%] rounded-t-2xl p-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <h3 className="text-sm font-extrabold text-foreground">Link subtasks</h3>
            <button onClick={onClose} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-[55vh] overflow-y-auto px-4 py-3">
            {candidates.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted-foreground">No other subtasks available.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {candidates.map((s) => {
                  const isPicked = picked.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${
                        isPicked ? "border-primary bg-primary/5" : "border-border/40 bg-card"
                      }`}
                    >
                      <span className={`flex h-4 w-4 items-center justify-center rounded border-2 ${isPicked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {isPicked && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-foreground">{s.title}</p>
                        {s.milestoneId && (
                          <p className="text-[9px] text-muted-foreground">Currently linked to another milestone</p>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        {subStatusStyle[s.status].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="border-t border-border/40 p-3">
            <button
              disabled={picked.size === 0}
              onClick={() => onLink(Array.from(picked))}
              className="w-full rounded-lg bg-primary py-2.5 text-[12px] font-bold text-primary-foreground disabled:opacity-50"
            >
              Link {picked.size} subtask{picked.size === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ───────── Create milestone sheet ─────────
const CreateMilestoneSheet = ({
  open, onClose, subtasks, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  subtasks: MSubtask[];
  onCreate: (title: string, date: string, description: string | undefined, linkedIds: string[]) => void;
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setTitle(""); setDate(""); setDescription(""); setPicked(new Set());
    }
  }, [open]);

  const togglePick = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const canSubmit = title.trim().length > 0 && date.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="absolute inset-x-0 bottom-0 max-h-[90%] rounded-t-2xl p-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <h3 className="text-sm font-extrabold text-foreground">New milestone</h3>
            <button onClick={onClose} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-[65vh] overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Final inspection"
                  className="mt-1 w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-[12px] font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. 12 – 14 Apr"
                  className="mt-1 w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-[12px] font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link subtasks</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Select existing subtasks to associate with this milestone.</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {subtasks.length === 0 && (
                    <p className="py-3 text-center text-[11px] italic text-muted-foreground">No subtasks created yet.</p>
                  )}
                  {subtasks.map((s) => {
                    const isPicked = picked.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => togglePick(s.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${
                          isPicked ? "border-primary bg-primary/5" : "border-border/40 bg-card"
                        }`}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded border-2 ${isPicked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                          {isPicked && <CheckCircle2 className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-foreground">{s.title}</p>
                          {s.milestoneId && (
                            <p className="text-[9px] text-muted-foreground">Will be moved from current milestone</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 p-3">
            <button
              disabled={!canSubmit}
              onClick={() => onCreate(title.trim(), date.trim(), description.trim() || undefined, Array.from(picked))}
              className="w-full rounded-lg bg-primary py-2.5 text-[12px] font-bold text-primary-foreground disabled:opacity-50"
            >
              Create milestone {picked.size > 0 ? `· ${picked.size} subtask${picked.size === 1 ? "" : "s"}` : ""}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JobProgressTab;
