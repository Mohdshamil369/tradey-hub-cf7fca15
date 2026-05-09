import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Users, Star, Clock, BarChart3, TrendingUp,
  PoundSterling, CheckCircle2, ChevronDown, Mail, Trash2,
  UserPlus, X, ChevronRight, MapPin, Calendar, Briefcase, Save, Undo2,
  ArrowDownLeft, ArrowUpRight, Wallet, Search, Plus,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import AssignmentCard from "@/components/trader/AssignmentCard";
import Avatar from "boring-avatars";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { serviceCategories, catAServices, catBServices } from "@/data/services";
import { EmojiIcon, getEmojiIconColors } from "@/lib/icons";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

/* ── Mock data ── */
const mockGroups: Record<string, {
  name: string;
  members: { id: string; name: string; email: string; status: "active" | "pending"; totalJobs: number; totalHours: number; totalEarned: number; avgRating: number; completionRate: number }[];
  stats: { totalJobs: number; totalHours: number; totalPaid: number; avgRating: number };
  assignments: { id: string; title: string; date: string; status: "completed" | "cancelled" | "in_progress"; worker: string; workerId: string; amount: number; hours: number; address: string }[];
}> = {
  g1: {
    name: "Plumbing Squad",
    members: [
      { id: "m1", name: "Alex Turner", email: "alex@example.com", status: "active", totalJobs: 28, totalHours: 84, totalEarned: 2520, avgRating: 4.9, completionRate: 96 },
      { id: "m2", name: "James Cooper", email: "james@example.com", status: "active", totalJobs: 19, totalHours: 58, totalEarned: 1740, avgRating: 4.7, completionRate: 92 },
    ],
    stats: { totalJobs: 47, totalHours: 142, totalPaid: 4260, avgRating: 4.8 },
    assignments: [
      { id: "a1", title: "Tap Repair - 12 Oak Lane", date: "5 Mar 2026", status: "completed", worker: "Alex Turner", workerId: "m1", amount: 65, hours: 1.5, address: "12 Oak Lane, SW1" },
      { id: "a2", title: "Drain Unblocking - 8 Elm St", date: "3 Mar 2026", status: "completed", worker: "James Cooper", workerId: "m2", amount: 75, hours: 2, address: "8 Elm Street, E1" },
      { id: "a3", title: "Toilet Repair - 22 Pine Rd", date: "28 Feb 2026", status: "completed", worker: "Alex Turner", workerId: "m1", amount: 55, hours: 1, address: "22 Pine Road, N1" },
      { id: "a4", title: "Boiler Service - 5 Maple Ave", date: "25 Feb 2026", status: "cancelled", worker: "James Cooper", workerId: "m2", amount: 0, hours: 0, address: "5 Maple Avenue, SE1" },
      { id: "a5", title: "Tap Repair - 3 Birch Close", date: "20 Feb 2026", status: "completed", worker: "Alex Turner", workerId: "m1", amount: 65, hours: 1.5, address: "3 Birch Close, W1" },
    ],
  },
  g2: {
    name: "Electrical Team",
    members: [
      { id: "m4", name: "Sophie Baker", email: "sophie@example.com", status: "active", totalJobs: 18, totalHours: 54, totalEarned: 1890, avgRating: 4.8, completionRate: 98 },
      { id: "m5", name: "Liam Wright", email: "liam@example.com", status: "pending", totalJobs: 13, totalHours: 42, totalEarned: 1230, avgRating: 4.5, completionRate: 88 },
    ],
    stats: { totalJobs: 31, totalHours: 96, totalPaid: 3120, avgRating: 4.7 },
    assignments: [
      { id: "a6", title: "Socket Installation - 11 High St", date: "6 Mar 2026", status: "completed", worker: "Sophie Baker", workerId: "m4", amount: 85, hours: 2, address: "11 High Street, W2" },
      { id: "a7", title: "Light Fitting - 4 Park Ln", date: "2 Mar 2026", status: "completed", worker: "Sophie Baker", workerId: "m4", amount: 45, hours: 1, address: "4 Park Lane, EC1" },
      { id: "a8", title: "Rewiring - 6 Queen's Rd", date: "5 Mar 2026", status: "in_progress", worker: "Liam Wright", workerId: "m5", amount: 350, hours: 8, address: "6 Queen's Road, SE5" },
    ],
  },
};

interface BasePayEntry {
  serviceId: string;
  name: string;
  icon: string;
  categoryId: string;
  basePay: number;
}

const categories = serviceCategories.filter((c) => c.id !== "all");

const defaultBasePay: BasePayEntry[] = [
  ...catAServices.map((s) => ({ serviceId: s.id, name: s.name, icon: s.icon, categoryId: s.categoryId, basePay: 30 })),
  ...catBServices.map((s) => ({ serviceId: s.id, name: s.name, icon: s.icon, categoryId: s.categoryId, basePay: 25 })),
];

const statusColors: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  in_progress: "bg-amber-500/10 text-amber-600",
};

const GroupDetail = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const group = mockGroups[groupId || ""] || mockGroups.g1;

  const [activeTab, setActiveTab] = useState("performance");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showPickExisting, setShowPickExisting] = useState(false);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pickSearch, setPickSearch] = useState("");
  const [members, setMembers] = useState(group.members);
  const [invites, setInvites] = useState<{id: string; email: string; status: "sent" | "accepted" | "declined" | "expired"; date: string}[]>([
    { id: "inv1", email: "pending-worker@example.com", status: "sent", date: "2 hours ago" },
    { id: "inv2", email: "another-one@example.com", status: "expired", date: "1 day ago" },
    { id: "inv3", email: "accepted-user@example.com", status: "accepted", date: "3 days ago" },
    { id: "inv4", email: "declined-user@example.com", status: "declined", date: "2 days ago" },
  ]);

  // Roster of members already added to other groups / trader profile
  const existingRoster = Object.entries(mockGroups)
    .filter(([gid]) => gid !== groupId)
    .flatMap(([gid, g]) => g.members.map((m) => ({ ...m, fromGroup: g.name, fromGroupId: gid })));
  const dedupedRoster = Array.from(new Map(existingRoster.map((m) => [m.id, m])).values())
    .filter((m) => !members.some((cm) => cm.id === m.id));

  const togglePicked = (id: string) =>
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const addPicked = () => {
    const toAdd = dedupedRoster.filter((m) => pickedIds.includes(m.id));
    if (toAdd.length === 0) return;
    setMembers((prev) => [...prev, ...toAdd.map(({ fromGroup, fromGroupId, ...rest }) => rest)]);
    toast.success(`Added ${toAdd.length} member${toAdd.length !== 1 ? "s" : ""}`);
    setPickedIds([]);
    setShowPickExisting(false);
  };

  // Base pay state
  const [useUniversal, setUseUniversal] = useState(true);
  const [entries, setEntries] = useState(defaultBasePay);
  const [savedEntries, setSavedEntries] = useState(defaultBasePay);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const hasChanges = JSON.stringify(entries) !== JSON.stringify(savedEntries);

  const handleToggleUniversal = (checked: boolean) => {
    setUseUniversal(checked);
    if (checked) {
      setEntries(savedEntries);
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleSave = () => {
    setSavedEntries(entries);
    setEditingId(null);
    setEditValue("");
    toast.success("Custom base pay saved");
  };

  const handleDiscard = () => {
    setEntries(savedEntries);
    setEditingId(null);
    setEditValue("");
    toast("Changes discarded");
  };

  const bulkUpdate = (categoryId: string, amount: number) => {
    setEntries((prev) => prev.map((e) => (e.categoryId === categoryId ? { ...e, basePay: amount } : e)));
  };

  const inviteWorker = () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    // Check for duplicate
    if (invites.some(inv => inv.email.toLowerCase() === inviteEmail.toLowerCase() && inv.status === "sent")) {
      toast.error("An invite is already pending for this email");
      return;
    }
    const newInvite = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      status: "sent" as const,
      date: "Just now"
    };
    setInvites([newInvite, ...invites]);
    setInviteEmail("");
    toast.success(`Invite sent to ${inviteEmail}`);
  };

  const resendInvite = (invId: string) => {
    setInvites(prev => prev.map(inv => 
      inv.id === invId ? { ...inv, status: "sent" as const, date: "Just now" } : inv
    ));
    toast.success("Invite resent");
  };

  const pendingCount = invites.filter(i => i.status === "sent").length;

  const inviteStatusConfig: Record<string, { bg: string; dot: string; label: string }> = {
    sent: { bg: "bg-amber-500/10 text-amber-600", dot: "bg-amber-500", label: "Pending" },
    accepted: { bg: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500", label: "Accepted" },
    declined: { bg: "bg-red-500/10 text-red-600", dot: "bg-red-500", label: "Declined" },
    expired: { bg: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", label: "Expired" },
  };

  const deleteMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success(`${member?.name || "Member"} removed from group`);
  };

  return (
    <MobileLayout role="trader">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button onClick={() => navigate("/trader/groups")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground font-heading">{group.name}</h1>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full rounded-xl bg-muted p-1">
          <TabsTrigger value="performance" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Members
          </TabsTrigger>
          <TabsTrigger value="basepay" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Base Pay
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            History
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* ── Performance Tab (default) ── */}
        <TabsContent value="performance" className="pb-6">
          <div className="mt-4 grid grid-cols-2 gap-2.5 mb-4">
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Jobs Done</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{group.stats.totalJobs}</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hours</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{group.stats.totalHours}h</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 fill-star text-star" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rating</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{group.stats.avgRating}</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paid</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£{group.stats.totalPaid}</p>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Individual Performance</p>
          <div className="flex flex-col gap-2.5">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => navigate(`/trader/workers/${member.id}?group=${groupId}`)}
                className="rounded-2xl bg-card p-4 card-shadow text-left transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Avatar size={40} name={member.name} variant="beam" colors={avatarPalette} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{member.name}</h4>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-star text-star" />{member.avgRating}</span>
                      <span>·</span>
                      <span>{member.completionRate}% completion</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-accent/50 px-2 py-1.5 text-center">
                    <p className="text-xs font-extrabold text-foreground">{member.totalJobs}</p>
                    <p className="text-[9px] text-muted-foreground">Jobs</p>
                  </div>
                  <div className="rounded-xl bg-accent/50 px-2 py-1.5 text-center">
                    <p className="text-xs font-extrabold text-foreground">{member.totalHours}h</p>
                    <p className="text-[9px] text-muted-foreground">Hours</p>
                  </div>
                  <div className="rounded-xl bg-accent/50 px-2 py-1.5 text-center">
                    <p className="text-xs font-extrabold text-foreground">£{member.totalEarned}</p>
                    <p className="text-[9px] text-muted-foreground">Earned</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ── Members Tab ── */}
        <TabsContent value="members" className="pb-6">
          <div className="flex flex-col gap-2.5 mt-4">
            {members.map((member) => (
              <div key={member.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <Avatar size={40} name={member.name} variant="beam" colors={avatarPalette} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{member.name || "Pending invite"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    member.status === "active" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {member.status === "active" ? "Active" : "Pending"}
                  </span>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 transition-colors active:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
                {/* Member quick actions */}
                <div className="border-t border-border flex">
                  <button
                    onClick={() => navigate(`/trader/workers/${member.id}?group=${groupId}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground border-r border-border transition-colors active:bg-muted/50"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Performance
                  </button>
                  <button
                    onClick={() => navigate(`/trader/member-payouts/${member.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors active:bg-muted/50"
                  >
                    <PoundSterling className="h-3 w-3" />
                    Payouts
                  </button>
                </div>
              </div>
            ))}

            {/* ── Sent Invites Section ── */}
            {invites.length > 0 && (
              <div className="mt-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sent Invites</p>
                    {pendingCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{invites.length} total</p>
                </div>
                {invites.map((inv) => {
                  const cfg = inviteStatusConfig[inv.status];
                  return (
                    <div key={inv.id} className={`rounded-2xl border p-3.5 transition-all ${
                      inv.status === "sent" ? "bg-amber-500/[0.03] border-amber-500/20" :
                      inv.status === "accepted" ? "bg-emerald-500/[0.03] border-emerald-500/20" :
                      inv.status === "declined" ? "bg-red-500/[0.03] border-red-500/20" :
                      "bg-muted/30 border-dashed border-border"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          inv.status === "sent" ? "bg-amber-500/10" :
                          inv.status === "accepted" ? "bg-emerald-500/10" :
                          inv.status === "declined" ? "bg-red-500/10" :
                          "bg-muted"
                        }`}>
                          <Mail className={`h-4 w-4 ${
                            inv.status === "sent" ? "text-amber-600" :
                            inv.status === "accepted" ? "text-emerald-600" :
                            inv.status === "declined" ? "text-red-600" :
                            "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-foreground truncate">{inv.email}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${cfg.bg}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">· {inv.date}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {inv.status === "sent" && (
                            <button 
                              onClick={() => {
                                setInvites(prev => prev.filter(i => i.id !== inv.id));
                                toast("Invite cancelled");
                              }}
                              className="rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-1 text-[10px] font-bold text-destructive active:opacity-70 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                          {(inv.status === "expired" || inv.status === "declined") && (
                            <button 
                              onClick={() => resendInvite(inv.id)}
                              className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary active:opacity-70 transition-all"
                            >
                              Resend
                            </button>
                          )}
                          {inv.status === "accepted" && (
                            <span className="text-[10px] font-semibold text-emerald-600">✓ Joined</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Add / Invite Buttons ── */}
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => setShowPickExisting(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-4 text-sm font-bold text-primary transition-all active:scale-[0.98]"
              >
                <Users className="h-4 w-4" /> Add from Existing
              </button>
              <Drawer open={showInvite} onOpenChange={setShowInvite}>
                <DrawerTrigger asChild>
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card py-4 text-sm font-bold text-foreground transition-all active:scale-[0.98]">
                    <Plus className="h-4 w-4" /> Invite via Email
                  </button>
                </DrawerTrigger>
                <DrawerContent className="mx-auto max-w-[390px]">
                  <DrawerHeader>
                    <DrawerTitle>Invite New Worker</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col gap-5 px-4 pb-10">
                    {/* Send invite input */}
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="teammate@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && inviteWorker()}
                          className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button 
                          onClick={inviteWorker}
                          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground active:scale-95 transition-transform"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Recent invites inside drawer */}
                    {invites.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent Invites</p>
                          <p className="text-[10px] text-muted-foreground">{pendingCount} pending</p>
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                          {invites.slice(0, 5).map((inv) => {
                            const cfg = inviteStatusConfig[inv.status];
                            return (
                              <div key={inv.id} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card p-2.5">
                                <span className={`flex h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-foreground truncate">{inv.email}</p>
                                  <p className="text-[9px] text-muted-foreground">{inv.date}</p>
                                </div>
                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${cfg.bg}`}>
                                  {cfg.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          {/* Pick existing members sheet */}
          {showPickExisting && (
            <>
              <div
                className="absolute inset-0 z-40 bg-black/40"
                onClick={() => { setShowPickExisting(false); setPickedIds([]); }}
              />
              <div className="absolute inset-x-0 bottom-0 z-50 max-h-[85%] overflow-hidden rounded-t-3xl bg-card shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Add existing members</p>
                    <p className="text-[11px] text-muted-foreground">From your other groups</p>
                  </div>
                  <button
                    onClick={() => { setShowPickExisting(false); setPickedIds([]); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="px-3 pt-3">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={pickSearch}
                      onChange={(e) => setPickSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    {pickSearch && (
                      <button onClick={() => setPickSearch("")} className="text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto p-3 flex flex-col gap-2 max-h-[320px]">
                  {(() => {
                    const q = pickSearch.trim().toLowerCase();
                    const filtered = q
                      ? dedupedRoster.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
                      : dedupedRoster;
                    if (filtered.length === 0) {
                      return (
                        <p className="text-center text-xs text-muted-foreground py-8">
                          {dedupedRoster.length === 0 ? "No other members available" : "No matches"}
                        </p>
                      );
                    }
                    return filtered.map((m) => {
                      const checked = pickedIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => togglePicked(m.id)}
                          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                            checked ? "border-primary bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <Avatar size={36} name={m.name} variant="beam" colors={avatarPalette} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">From {m.fromGroup}</p>
                          </div>
                          <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                            checked ? "border-primary bg-primary" : "border-border"
                          }`}>
                            {checked && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
                <div className="border-t border-border p-3">
                  <button
                    onClick={addPicked}
                    disabled={pickedIds.length === 0}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    Add {pickedIds.length > 0 ? `${pickedIds.length} ` : ""}member{pickedIds.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Base Pay Tab ── */}
        <TabsContent value="basepay" className="pb-6">
          {/* Toggle */}
          <div className="mt-3 mb-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-primary/30 bg-card p-4 card-shadow">
            <div>
              <p className="text-sm font-bold text-foreground">Use Universal Rates</p>
              <p className="text-[11px] text-muted-foreground">{useUniversal ? "Applying universal base pay rates" : "Custom rates for this group"}</p>
            </div>
            <Switch checked={useUniversal} onCheckedChange={handleToggleUniversal} />
          </div>

          {!useUniversal && (
            <>
              <div className="mb-3 rounded-2xl bg-primary/5 border border-primary/10 p-3.5">
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-bold">Custom rates</span> override universal base pay. Edit rates below then save.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {categories.map((cat) => {
                  const catEntries = entries.filter((e) => e.categoryId === cat.id);
                  if (catEntries.length === 0) return null;
                  const avgPay = Math.round(catEntries.reduce((s, e) => s + e.basePay, 0) / catEntries.length);
                  const isExpanded = expandedCat === cat.id;

                  return (
                    <div key={cat.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                      <button
                        onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                        className="flex w-full items-center gap-3 p-4 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
                          <p className="text-[11px] text-muted-foreground">{catEntries.length} services · avg £{avgPay}/hr</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border">
                          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Set all to:</span>
                            {[20, 25, 30, 35].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => bulkUpdate(cat.id, amt)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                                  avgPay === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                £{amt}
                              </button>
                            ))}
                          </div>

                          {catEntries.map((entry) => (
                            <div key={entry.serviceId} className="flex items-center gap-3 border-b border-border last:border-0 px-4 py-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getEmojiIconColors(entry.icon).bg} bg-opacity-40`}>
                                <EmojiIcon emoji={entry.icon} size={16} weight="regular" colorize />
                              </div>
                              <span className="flex-1 text-xs font-semibold text-foreground truncate">{entry.name}</span>
                              <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
                                <span className="text-xs font-bold text-muted-foreground">£</span>
                                <input
                                  type="number"
                                  value={editingId === entry.serviceId ? editValue : entry.basePay}
                                  onFocus={() => { setEditingId(entry.serviceId); setEditValue(String(entry.basePay)); }}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => {
                                    if (editingId === entry.serviceId) {
                                      const val = parseFloat(editValue);
                                      if (!isNaN(val) && val > 0) {
                                        setEntries((prev) => prev.map((x) => (x.serviceId === entry.serviceId ? { ...x, basePay: val } : x)));
                                      }
                                      setEditingId(null);
                                      setEditValue("");
                                    }
                                  }}
                                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                  className="w-12 bg-transparent text-xs font-bold text-foreground outline-none"
                                />
                                <span className="text-[10px] text-muted-foreground">/hr</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save / Discard */}
              {hasChanges && (
                <div className="mt-4 flex gap-2.5">
                  <button
                    onClick={handleDiscard}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-border bg-card py-3 text-sm font-bold text-muted-foreground transition-colors active:bg-accent"
                  >
                    <Undo2 className="h-4 w-4" /> Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors active:bg-primary/90"
                  >
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Assignments History Tab ── */}
        <TabsContent value="assignments" className="pb-6">
          <div className="mt-4 flex flex-col gap-2.5">
            {group.assignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} showWorker />
            ))}
            {group.assignments.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No past assignments.</p>
            )}
          </div>
        </TabsContent>

        {/* ── Payouts Tab ── */}
        <TabsContent value="payouts" className="pb-6">
          {/* Overview cards */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 mb-5">
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Income</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£6,840</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">From customers</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Payouts</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£{group.stats.totalPaid}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">To workers</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net Profit</span>
              </div>
              <p className="text-2xl font-extrabold text-primary">£{6840 - group.stats.totalPaid}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">After payouts</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{Math.round(((6840 - group.stats.totalPaid) / 6840) * 100)}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Profit margin</p>
            </div>
          </div>

          {/* Transactions */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Transactions</p>
          <div className="flex flex-col gap-2">
            {[
              { id: "t1", label: "Tap Repair — Emily R.", type: "income" as const, amount: 65, date: "5 Mar 2026", tag: "Job Payment" },
              { id: "t2", label: "Alex Turner", type: "expense" as const, amount: 45, date: "5 Mar 2026", tag: "Salary" },
              { id: "t3", label: "Drain Unblocking — David K.", type: "income" as const, amount: 75, date: "3 Mar 2026", tag: "Job Payment" },
              { id: "t4", label: "James Cooper", type: "expense" as const, amount: 50, date: "3 Mar 2026", tag: "Salary" },
              { id: "t5", label: "Alex Turner", type: "expense" as const, amount: 450, date: "1 Mar 2026", tag: "Salary" },
              { id: "t6", label: "James Cooper", type: "expense" as const, amount: 320, date: "1 Mar 2026", tag: "Salary" },
              { id: "t7", label: "Toilet Repair — Lisa M.", type: "income" as const, amount: 55, date: "28 Feb 2026", tag: "Job Payment" },
              { id: "t8", label: "Alex Turner", type: "expense" as const, amount: 480, date: "15 Feb 2026", tag: "Salary" },
              { id: "t9", label: "James Cooper", type: "expense" as const, amount: 290, date: "15 Feb 2026", tag: "Salary" },
              { id: "t10", label: "Tap Repair — Tom H.", type: "income" as const, amount: 65, date: "20 Feb 2026", tag: "Job Payment" },
              { id: "t11", label: "Alex Turner", type: "expense" as const, amount: 520, date: "1 Feb 2026", tag: "Salary" },
            ].map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 card-shadow">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  tx.type === "income" ? "bg-[hsl(142,70%,45%)]/10" : "bg-destructive/10"
                }`}>
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-4 w-4 text-[hsl(142,70%,45%)]" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground truncate">{tx.label}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      tx.tag === "Salary" 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]"
                    }`}>
                      {tx.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tx.date}</p>
                </div>
                <span className={`text-sm font-extrabold shrink-0 ${
                  tx.type === "income" ? "text-[hsl(142,70%,45%)]" : "text-destructive"
                }`}>
                  {tx.type === "income" ? "+" : "−"}£{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
};

export default GroupDetail;
