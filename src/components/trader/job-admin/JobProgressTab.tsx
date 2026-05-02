import { useState } from "react";
import { CheckCircle2, Circle, Clock, Calendar, Plus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: "done" | "current" | "upcoming";
  pct?: number;
}

const defaultMilestones: Milestone[] = [
  { id: "ms1", title: "Site survey & colour confirmation", description: "Walk-through with customer, finalise palette.", date: "13 Mar", status: "done" },
  { id: "ms2", title: "Prep & masking", description: "Cover floors, mask trims and outlets.", date: "14 Mar", status: "done" },
  { id: "ms3", title: "First coat — all rooms", description: "Roller and cut-in across 4 bedrooms + hallway.", date: "16 – 19 Mar", status: "current", pct: 60 },
  { id: "ms4", title: "Second coat & touch-ups", date: "21 – 25 Mar", status: "upcoming" },
  { id: "ms5", title: "Trim, doors & skirting", date: "28 Mar – 1 Apr", status: "upcoming" },
  { id: "ms6", title: "Final walk-through & sign-off", date: "4 Apr", status: "upcoming" },
];

const seed: Record<string, Milestone[]> = {
  j5: defaultMilestones,
  j4: defaultMilestones,
};

interface JobProgressTabProps {
  jobId: string;
}

const JobProgressTab = ({ jobId }: JobProgressTabProps) => {
  const [items, setItems] = useState<Milestone[]>(seed[jobId] ?? []);

  const done = items.filter((m) => m.status === "done").length;
  const total = items.length;
  const overall = total === 0 ? 0 : Math.round((done / total) * 100);

  const advance = (id: string) => {
    setItems((prev) => {
      const next = [...prev];
      const idx = next.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      next[idx] = { ...next[idx], status: "done" };
      // promote next upcoming → current
      const nextIdx = next.findIndex((m, i) => i > idx && m.status === "upcoming");
      if (nextIdx > -1) next[nextIdx] = { ...next[nextIdx], status: "current", pct: 0 };
      return next;
    });
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
                  {isCurrent && typeof m.pct === "number" && (
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
