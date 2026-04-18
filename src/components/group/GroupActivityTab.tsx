import { useMemo } from "react";
import { Activity, Star, CheckCircle2 } from "lucide-react";
import {
  getActivityForGroup, getJobsForGroup, getSubtasksForJob, jobProgress, groupConversations,
} from "@/data/messaging";

const GroupActivityTab = ({ groupId }: { groupId: string }) => {
  const entries = useMemo(() => getActivityForGroup(groupId), [groupId]);
  const jobs = useMemo(() => getJobsForGroup(groupId), [groupId]);
  const group = groupConversations.find((g) => g.id === groupId);

  // Tracking metrics
  const allSubs = jobs.flatMap((j) => getSubtasksForJob(j.id));
  const acceptanceRate = allSubs.length === 0 ? 0 :
    Math.round((allSubs.filter((s) => s.status !== "pending").length / allSubs.length) * 100);
  const completionRate = allSubs.length === 0 ? 0 :
    Math.round((allSubs.filter((s) => s.status === "completed").length / allSubs.length) * 100);
  const avgJobProgress = jobs.length === 0 ? 0 :
    Math.round(jobs.reduce((s, j) => s + jobProgress(j.id), 0) / jobs.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Acceptance" value={`${acceptanceRate}%`} />
        <MetricCard label="Completion" value={`${completionRate}%`} />
        <MetricCard label="Avg. progress" value={`${avgJobProgress}%`} />
      </div>

      <div className="rounded-2xl bg-card card-shadow p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Group profile</h3>
          {group?.customerRating && (
            <span className="flex items-center gap-1 text-xs font-bold text-foreground">
              <Star className="h-3.5 w-3.5 fill-[hsl(45,95%,55%)] text-[hsl(45,95%,55%)]" />
              {group.customerRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {jobs.filter((j) => j.status === "completed").length} jobs completed · {jobs.filter((j) => j.status === "active").length} active
        </p>
      </div>

      <div className="rounded-2xl bg-card card-shadow p-3">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Activity className="h-3.5 w-3.5" />Recent activity
        </h3>
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-start gap-2 rounded-xl bg-muted/50 p-2.5">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[12px] text-foreground">
                    <span className="font-bold">{e.actorName}</span> {e.text}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-card card-shadow p-3">
    <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
    <p className="mt-1 text-base font-extrabold text-foreground">{value}</p>
  </div>
);

export default GroupActivityTab;
