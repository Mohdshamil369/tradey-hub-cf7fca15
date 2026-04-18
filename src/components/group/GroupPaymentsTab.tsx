import { useMemo } from "react";
import { PoundSterling, Wallet, TrendingUp, Send } from "lucide-react";
import {
  getJobsForGroup, getPayoutsForGroup, getRetainersForGroup, allMembers,
} from "@/data/messaging";
import { GroupViewMode } from "@/pages/GroupConversation";
import { toast } from "sonner";

const paymentLabel = (model: string, amount: number) =>
  model === "fixed" ? `£${amount} fixed` :
  model === "hourly" ? `£${amount}/hr` :
  `${amount}% commission`;

const GroupPaymentsTab = ({ groupId, viewMode }: { groupId: string; viewMode: GroupViewMode }) => {
  const isAdmin = viewMode === "admin";
  const jobs = useMemo(() => getJobsForGroup(groupId), [groupId]);
  const payouts = useMemo(() => getPayoutsForGroup(groupId), [groupId]);
  const retainers = useMemo(() => getRetainersForGroup(groupId), [groupId]);

  const myEarnings = payouts.filter((p) => p.memberId === "u-self").reduce((s, p) => s + p.amount, 0);
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-card card-shadow p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <Wallet className="h-3 w-3" />{isAdmin ? "Total paid" : "My earnings"}
          </div>
          <p className="mt-1 text-lg font-extrabold text-foreground">£{(isAdmin ? totalPaid : myEarnings).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-card card-shadow p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <TrendingUp className="h-3 w-3" />Pending
          </div>
          <p className="mt-1 text-lg font-extrabold text-foreground">£{totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Job-level payments */}
      <div className="rounded-2xl bg-card card-shadow p-3">
        <h3 className="mb-2 text-sm font-bold text-foreground">Job payments</h3>
        <div className="flex flex-col gap-2">
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-foreground truncate">{j.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {j.payment ? paymentLabel(j.payment.model, j.payment.amount) : "No payment set"}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => toast.success(`Payout triggered for ${j.title}`)}
                  className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground"
                >
                  <Send className="h-3 w-3" />Pay
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Retainers (group-level, optional) */}
      {retainers.length > 0 && (
        <div className="rounded-2xl bg-card card-shadow p-3">
          <h3 className="mb-2 text-sm font-bold text-foreground">Retainers</h3>
          <div className="flex flex-col gap-2">
            {retainers.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5">
                <div>
                  <p className="text-[13px] font-bold text-foreground">{allMembers[r.memberId]?.name ?? r.memberId}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{r.cadence} retainer</p>
                </div>
                <span className="text-sm font-extrabold text-primary">£{r.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payouts log */}
      <div className="rounded-2xl bg-card card-shadow p-3">
        <h3 className="mb-2 text-sm font-bold text-foreground">Payouts</h3>
        {payouts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No payouts yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5">
                <div>
                  <p className="text-[13px] font-bold text-foreground">{allMembers[p.memberId]?.name ?? p.memberId}</p>
                  <p className="text-[10px] text-muted-foreground">{p.date} · {p.status}</p>
                </div>
                <span className="flex items-center gap-0.5 text-sm font-extrabold text-foreground">
                  <PoundSterling className="h-3.5 w-3.5" />{p.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPaymentsTab;
