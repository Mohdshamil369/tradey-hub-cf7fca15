import { useMemo, useState } from "react";
import { Plus, ChevronRight, FileText, CheckCircle2, Clock, Play, Trash2, Pencil, X } from "lucide-react";
import {
  GroupJob, JobStatus, Subtask, SubtaskStatus,
  getJobsForGroup, getSubtasksForJob, jobProgress, subtaskStatusLabel,
  allMembers, getFormById,
} from "@/data/messaging";
import { GroupViewMode } from "@/pages/GroupConversation";
import { toast } from "sonner";

const statusStyles: Record<JobStatus, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  upcoming: "bg-secondary text-secondary-foreground",
};

const subStatusIcon = (s: SubtaskStatus) =>
  ({ pending: Clock, accepted: CheckCircle2, in_progress: Play, completed: CheckCircle2 }[s]);

const GroupJobsTab = ({ groupId, viewMode }: { groupId: string; viewMode: GroupViewMode }) => {
  const [jobs, setJobs] = useState<GroupJob[]>(() => getJobsForGroup(groupId));
  const [subs, setSubs] = useState<Subtask[]>(() => jobs.flatMap((j) => getSubtasksForJob(j.id)));
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const openJob = openJobId ? jobs.find((j) => j.id === openJobId) ?? null : null;
  const openJobSubs = openJob ? subs.filter((s) => s.jobId === openJob.id) : [];

  const isAdmin = viewMode === "admin";

  // Active filter — users only see jobs they're assigned to
  const visibleJobs = useMemo(() => {
    if (isAdmin) return jobs;
    return jobs.filter((j) => j.assigneeIds.includes("u-self"));
  }, [jobs, isAdmin]);

  const handleCreateJob = (title: string) => {
    const newJob: GroupJob = {
      id: `j-${Date.now()}`,
      groupId,
      title: title || "Untitled job",
      status: "upcoming",
      assigneeIds: [],
      payment: { model: "fixed", amount: 0, currency: "GBP" },
    };
    setJobs((prev) => [newJob, ...prev]);
    setShowCreate(false);
    toast.success("Job created");
  };

  const handleDeleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSubs((prev) => prev.filter((s) => s.jobId !== id));
    toast.success("Job deleted");
  };

  const handleAddSubtask = (jobId: string, title: string) => {
    const newSub: Subtask = {
      id: `s-${Date.now()}`,
      jobId,
      title: title || "Untitled subtask",
      assigneeIds: ["u-self"],
      status: "pending",
    };
    setSubs((prev) => [...prev, newSub]);
    toast.success("Subtask added");
  };

  const updateSubStatus = (id: string, status: SubtaskStatus) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // ── Job detail view ──
  if (openJob) {
    const progress = (() => {
      const arr = openJobSubs;
      if (arr.length === 0) return 0;
      return Math.round((arr.filter((s) => s.status === "completed").length / arr.length) * 100);
    })();

    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => setOpenJobId(null)} className="self-start text-xs font-bold text-primary">← All jobs</button>

        <div className="rounded-2xl bg-card card-shadow p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-foreground">{openJob.title}</h3>
              {openJob.description && <p className="mt-1 text-xs text-muted-foreground">{openJob.description}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[openJob.status]}`}>
              {openJob.status}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{openJob.assigneeIds.length} assigned</span>
            <span>·</span>
            <span>{progress}% complete</span>
            {openJob.payment && (<><span>·</span><span className="font-bold text-foreground">{paymentLabel(openJob.payment)}</span></>)}
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>

          {isAdmin && (
            <div className="mt-3 flex gap-2">
              <button className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-bold text-foreground"><Pencil className="h-3 w-3" />Edit</button>
              <button onClick={() => { handleDeleteJob(openJob.id); setOpenJobId(null); }} className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[11px] font-bold text-destructive"><Trash2 className="h-3 w-3" />Delete</button>
            </div>
          )}
        </div>

        <SubtaskList
          subtasks={openJobSubs}
          isAdmin={isAdmin}
          onAdd={(title) => handleAddSubtask(openJob.id, title)}
          onStatus={updateSubStatus}
        />
      </div>
    );
  }

  // ── Jobs list view ──
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{isAdmin ? "All jobs" : "My jobs"}</h3>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            <Plus className="h-3 w-3" />New job
          </button>
        )}
      </div>

      {visibleJobs.length === 0 ? (
        <div className="rounded-2xl bg-card card-shadow p-6 text-center">
          <p className="text-sm font-bold text-foreground">No jobs yet</p>
          <p className="mt-1 text-xs text-muted-foreground">{isAdmin ? "Create the first job for this group." : "You haven't been assigned to any jobs yet."}</p>
        </div>
      ) : (
        visibleJobs.map((j) => {
          const progress = jobProgress(j.id);
          return (
            <button key={j.id} onClick={() => setOpenJobId(j.id)} className="rounded-2xl bg-card card-shadow p-3 text-left active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground truncate">{j.title}</h4>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyles[j.status]}`}>{j.status}</span>
                <span>{j.assigneeIds.length} assigned</span>
                <span>·</span>
                <span>{progress}%</span>
                {j.payment && (<><span>·</span><span className="font-bold text-foreground">{paymentLabel(j.payment)}</span></>)}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </button>
          );
        })
      )}

      {showCreate && (
        <CreateJobInline onCancel={() => setShowCreate(false)} onCreate={handleCreateJob} />
      )}
    </div>
  );
};

const paymentLabel = (p: { model: string; amount: number }) =>
  p.model === "fixed" ? `£${p.amount} fixed` :
  p.model === "hourly" ? `£${p.amount}/hr` :
  `${p.amount}% commission`;

const CreateJobInline = ({ onCreate, onCancel }: { onCreate: (title: string) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState("");
  return (
    <div className="rounded-2xl bg-card card-shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">New job</span>
        <button onClick={onCancel} className="text-muted-foreground"><X className="h-4 w-4" /></button>
      </div>
      <input
        autoFocus
        type="text"
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl bg-muted px-3 py-2 text-sm outline-none mb-2"
      />
      <button onClick={() => onCreate(title)} className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground">Create</button>
    </div>
  );
};

const SubtaskList = ({
  subtasks, isAdmin, onAdd, onStatus,
}: {
  subtasks: Subtask[];
  isAdmin: boolean;
  onAdd: (title: string) => void;
  onStatus: (id: string, s: SubtaskStatus) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <div className="rounded-2xl bg-card card-shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-foreground">Subtasks ({subtasks.length})</h4>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-foreground">
            <Plus className="h-3 w-3" />Add
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-2 flex gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subtask title" className="flex-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs outline-none" />
          <button onClick={() => { onAdd(title); setTitle(""); setAdding(false); }} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground">Add</button>
          <button onClick={() => setAdding(false)} className="rounded-lg bg-muted px-2 py-1.5 text-[11px] text-muted-foreground"><X className="h-3 w-3" /></button>
        </div>
      )}

      {subtasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No subtasks yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {subtasks.map((s) => {
            const Icon = subStatusIcon(s.status);
            const form = s.formId ? getFormById(s.formId) : null;
            const assignedToMe = s.assigneeIds.includes("u-self");
            return (
              <div key={s.id} className="rounded-xl bg-muted/50 p-2.5">
                <div className="flex items-start gap-2">
                  <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.status === "completed" ? "text-success" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold ${s.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="rounded-full bg-card px-2 py-0.5 font-bold text-muted-foreground">{subtaskStatusLabel(s.status)}</span>
                      {s.assigneeIds.map((id) => (
                        <span key={id} className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">{allMembers[id]?.name ?? id}</span>
                      ))}
                      {form && (
                        <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-bold text-foreground">
                          <FileText className="h-2.5 w-2.5" />{form.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions for assigned user */}
                {!isAdmin && assignedToMe && s.status !== "completed" && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.status === "pending" && (
                      <>
                        <button onClick={() => onStatus(s.id, "accepted")} className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">Accept</button>
                        <button onClick={() => onStatus(s.id, "completed")} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Reject</button>
                      </>
                    )}
                    {s.status === "accepted" && (
                      <button onClick={() => onStatus(s.id, "in_progress")} className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">Start</button>
                    )}
                    {s.status === "in_progress" && (
                      <button onClick={() => onStatus(s.id, "completed")} className="rounded-full bg-success px-2.5 py-1 text-[10px] font-bold text-success-foreground">Mark complete</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupJobsTab;
