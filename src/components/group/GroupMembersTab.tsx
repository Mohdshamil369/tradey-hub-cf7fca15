import { useState } from "react";
import { Mail, Plus, Trash2, ShieldCheck, X } from "lucide-react";
import { GroupConversation, GroupMember } from "@/data/messaging";
import { GroupViewMode } from "@/pages/GroupConversation";
import { toast } from "sonner";

const GroupMembersTab = ({ group, viewMode }: { group: GroupConversation; viewMode: GroupViewMode }) => {
  const [members, setMembers] = useState<GroupMember[]>(group.members);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const isAdmin = viewMode === "admin";

  const handleInvite = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    const newMember: GroupMember = {
      id: `u-${Date.now()}`,
      name: email.split("@")[0],
      initial: email[0].toUpperCase(),
      role: "user",
      email: email.trim(),
    };
    setMembers((prev) => [...prev, newMember]);
    setEmail("");
    setShowInvite(false);
    toast.success(`Invite sent to ${newMember.email}`);
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Member removed");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Members ({members.length})</h3>
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
              className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none"
            />
            <button onClick={handleInvite} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Send</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl bg-card card-shadow p-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {m.initial}
              {m.online && <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-online" />}
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
            {isAdmin && m.id !== "u-self" && (
              <button onClick={() => handleRemove(m.id)} className="rounded-full bg-destructive/10 p-2 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupMembersTab;
