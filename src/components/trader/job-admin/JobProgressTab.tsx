import { useEffect } from "react";
import { CheckCircle2, Circle, Clock, Calendar, Plus, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { useJobMilestonesStore } from "@/stores/jobMilestonesStore";

interface JobProgressTabProps {
  jobId: string;
}

const JobProgressTab = ({ jobId }: JobProgressTabProps) => {
  const ensureJob = useJobMilestonesStore((s) => s.ensureJob);
  const items = useJobMilestonesStore((s) => s.milestonesByJob[jobId] ?? []);
  const subtasks = useJobMilestonesStore((s) => s.subtasksByJob[jobId] ?? []);
  const completeMilestone = useJobMilestonesStore((s) => s.completeMilestone);

  useEffect(() => {
    ensureJob(jobId);
  }, [jobId, ensureJob]);

  const done = items.filter((m) => m.status === "done").length;
  const total = items.length;
  const overall = total === 0 ? 0 : Math.round((done / total) * 100);

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
        onClick={() => toast.info("Add milestone — coming soon")}
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
                  {linked.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <ListChecks className="h-3 w-3" />
                      <span>{doneCount}/{linked.length} subtasks</span>
                      <div className="ml-1 h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${isDone ? "bg-[hsl(142,70%,45%)]" : "bg-[hsl(25,90%,55%)]"}`}
                          style={{ width: `${linked.length === 0 ? 0 : Math.round((doneCount / linked.length) * 100)}%` }}
                        />
                      </div>
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
    </div>
  );
};

export default JobProgressTab;
