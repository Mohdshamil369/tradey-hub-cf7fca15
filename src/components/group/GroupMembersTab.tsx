import { useState } from "react";
import { Mail, Plus, Trash2, ShieldCheck, X, Send, Clock, CheckCircle2 } from "lucide-react";
import { GroupConversation, GroupMember } from "@/data/messaging";
import { GroupViewMode } from "@/pages/GroupConversation";
import { toast } from "sonner";

const InviteBadge = ({ status }: { status: GroupMember["inviteStatus"] }) => {
  if (!status || status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-online/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-online">
        <CheckCircle2 className="h-2.5 w-2.5" /> Joined
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
      <Clock className="h-2.5 w-2.5" /> Pending
    </span>
  );
};

const GroupMembersTab = ({ group, viewMode }: { group: GroupConversation; viewMode: GroupViewMode }) => {
  const [members, setMembers] = useState<GroupMember[]>(group.members);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const isAdmin = viewMode === "admin";

  const pendingCount = members.filter((m) => m.inviteStatus === "pending").length;

  const handleInvite = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === trimmed)) {
      toast.error("Already invited");
      return;
    }
    const newMember: GroupMember = {
      id: `inv-${Date.now()}`,
      name: trimmed.split("@")[0],
      initial: trimmed[0].toUpperCase(),
      role: "user",
      email: trimmed,
      inviteStatus: "pending",
      invitedAt: Date.now(),
    };
    setMembers((prev) => [...prev, newMember]);
    setEmail("");
    setShowInvite(false);
    toast.success(`Invite sent to ${newMember.email}`);
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Removed");
  };

  const handleResend = (m: GroupMember) => {
    toast.success(`Invite resent to ${m.email}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Members ({members.length})</h3>
          {pendingCount > 0 && (
            <p className="text-[10px] font-semibold text-warning">
              {pendingCount} pending invite{pendingCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            <Plus className="h-3 w-3" />Invite
          </button>
        )}
      </div>

      {showInvite && (
        <div className="rounded-2xl bg-card card-shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">Invite by email</span>
            <button onClick={() => setShowInvite(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none"
            />
            <button onClick={handleInvite} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Send</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {members.map((m) => {
          const isPending = m.inviteStatus === "pending";
          return (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                isPending
                  ? "border border-dashed border-primary/30 bg-primary/5"
                  : "bg-card card-shadow"
              }`}
            >
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isPending ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"}`}>
                {isPending ? <Mail className="h-4 w-4" /> : m.initial}
                {!isPending && m.online && <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-online" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                  {m.role === "admin" && <ShieldCheck className="h-3 w-3 text-primary" />}
                </div>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                  <Mail className="h-3 w-3" />{m.email}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <InviteBadge status={m.inviteStatus} />
                {isAdmin && isPending && (
                  <button
                    onClick={() => handleResend(m)}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary"
                  >
                    <Send className="h-2.5 w-2.5" /> Resend
                  </button>
                )}
              </div>
              {isAdmin && m.id !== "u-self" && m.id !== "me" && (
                <button onClick={() => handleRemove(m.id)} className="rounded-full bg-destructive/10 p-2 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupMembersTab;
