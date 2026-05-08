import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Users, Mail, Trash2, Pencil, X,
  ChevronDown, CheckCircle2, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { serviceCategories } from "@/data/services";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from "@/components/ui/drawer";
import { categoryIconMap, categoryColorMap, iconMap } from "@/lib/icons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { allMembers } from "@/data/messaging";

interface Worker {
  id: string;
  name: string;
  email: string;
  status: "active" | "pending";
}

interface Team {
  id: string;
  name: string;
  workers: Worker[];
  assignedCategories: string[];
}

const initialTeams: Team[] = [
  {
    id: "g1",
    name: "Plumbing Squad",
    workers: [
      { id: "w1", name: "Alex Turner", email: "alex@example.com", status: "active" },
      { id: "w2", name: "", email: "james@example.com", status: "pending" },
    ],
    assignedCategories: ["plumbing"],
  },
  {
    id: "g2",
    name: "Electrical Team",
    workers: [
      { id: "w3", name: "Sophie Baker", email: "sophie@example.com", status: "active" },
    ],
    assignedCategories: ["electrical", "hvac"],
  },
];

const categories = serviceCategories.filter((c) => c.id !== "all");

const TraderTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [categorySheetTeamId, setCategorySheetTeamId] = useState<string | null>(null);
  const [workerFilter, setWorkerFilter] = useState<"all" | "active" | "pending">("all");
  const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState<string | null>(null);
  const [searchExisting, setSearchExisting] = useState("");

  const createTeam = () => {
    if (!newTeamName.trim()) return;
    const team: Team = {
      id: `g${Date.now()}`,
      name: newTeamName.trim(),
      workers: [],
      assignedCategories: [],
    };
    setTeams((prev) => [...prev, team]);
    setNewTeamName("");
    setShowNewTeam(false);
    setExpandedTeamId(team.id);
    toast.success("Team created!");
  };

  const deleteTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    toast("Team deleted");
  };

  const renameTeam = (teamId: string) => {
    if (!editName.trim()) return;
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: editName.trim() } : t))
    );
    setEditingTeamId(null);
    setEditName("");
    toast.success("Team renamed");
  };

  const inviteWorker = (teamId: string) => {
    if (!inviteEmail.trim()) return;
    const worker: Worker = {
      id: `w${Date.now()}`,
      name: "",
      email: inviteEmail.trim(),
      status: "pending",
    };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, workers: [...t.workers, worker] } : t
      )
    );
    setInviteEmail("");
    setInviteTeamId(null);
    toast.success(`Invite sent to ${worker.email}`);
  };

  const addExistingWorker = (teamId: string, member: any) => {
    const worker: Worker = {
      id: member.id,
      name: member.name,
      email: member.email,
      status: "active",
    };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, workers: [...t.workers, worker] } : t
      )
    );
    toast.success(`Added ${worker.name}`);
  };

  const removeWorker = (teamId: string, workerId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, workers: t.workers.filter((w) => w.id !== workerId) }
          : t
      )
    );
    toast("Worker removed");
  };

  const toggleCategory = (teamId: string, categoryId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const has = t.assignedCategories.includes(categoryId);
        return {
          ...t,
          assignedCategories: has
            ? t.assignedCategories.filter((c) => c !== categoryId)
            : [...t.assignedCategories, categoryId],
        };
      })
    );
  };

  return (
    <MobileLayout role="trader">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground font-heading">My Teams</h1>
          <p className="text-xs text-muted-foreground">{teams.length} team{teams.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowNewTeam(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
        >
          <Plus className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-6 pt-2">
        {/* New team input */}
        {showNewTeam && (
          <div className="rounded-2xl border-2 border-primary bg-card p-4 card-shadow">
            <p className="mb-2 text-xs font-bold text-foreground">New Team</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Plumbing Squad"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && createTeam()}
              />
              <button onClick={createTeam} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                Create
              </button>
              <button onClick={() => setShowNewTeam(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Quick action cards */}
        {teams.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate("/trader/team-performance")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 card-shadow transition-all active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Performance</span>
            </button>
            <button
              onClick={() => navigate("/trader/base-pay")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 card-shadow transition-all active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Base Pay Rates</span>
            </button>
          </div>
        )}

        {teams.length === 0 && !showNewTeam && (
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 card-shadow text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-bold text-foreground">No teams yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create a team and invite your workers</p>
            <button
              onClick={() => setShowNewTeam(true)}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Create First Team
            </button>
          </div>
        )}

        {/* Team cards */}
        {teams.map((team) => {
          const isExpanded = expandedTeamId === team.id;
          const activeCount = team.workers.filter((w) => w.status === "active").length;
          const pendingCount = team.workers.filter((w) => w.status === "pending").length;

          return (
            <div key={team.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
              {/* Team header */}
              <button
                onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{team.name}</h3>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{team.workers.length} worker{team.workers.length !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{team.assignedCategories.length} categories</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingTeamId(team.id); setEditName(team.name); }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTeamId(team.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 text-destructive/70" />
                  </button>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Category assignment - dropdown trigger */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Service Categories
                    </p>
                    <button
                      onClick={() => setCategorySheetTeamId(team.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                    >
                      <div className="flex flex-1 flex-wrap gap-1.5 min-w-0">
                        {team.assignedCategories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Tap to assign categories</span>
                        ) : (
                          team.assignedCategories.map((catId) => {
                            const cat = categories.find((c) => c.id === catId);
                            if (!cat) return null;
                            return (
                              <span key={catId} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {(() => { const n = categoryIconMap[catId] || "wrench"; const I = iconMap[n]; const c = categoryColorMap[catId]; return I ? <I size={10} weight="regular" className={c?.color || "text-primary"} /> : null; })()}
                                {cat.label}
                              </span>
                            );
                          })
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                    </button>
                  </div>

                  {/* Workers list */}
                  <div className="border-b border-border">
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Workers
                      </p>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => setWorkerFilter("all")}
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                            workerFilter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          All ({team.workers.length})
                        </button>
                        <button
                          onClick={() => setWorkerFilter(workerFilter === "active" ? "all" : "active")}
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                            workerFilter === "active" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Active ({activeCount})
                        </button>
                        {pendingCount > 0 && (
                          <button
                            onClick={() => setWorkerFilter(workerFilter === "pending" ? "all" : "pending")}
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                              workerFilter === "pending" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            Pending ({pendingCount})
                          </button>
                        )}
                      </div>
                    </div>
                    {team.workers.length === 0 && (
                      <p className="px-4 pb-3 text-xs text-muted-foreground">No workers yet — invite someone below</p>
                    )}
                    {team.workers.filter((w) => workerFilter === "all" ? true : w.status === workerFilter).map((worker) => (
                      <div key={worker.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-border">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-foreground">
                          {worker.name ? worker.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {worker.name || "Pending invite"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{worker.email}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          worker.status === "active"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {worker.status === "active" ? "Active" : "Pending"}
                        </span>
                        <button
                          onClick={() => removeWorker(team.id, worker.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    ))}

                    {/* Invite below workers */}
                    {inviteTeamId === team.id ? (
                      <div className="border-t border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="worker@email.com"
                              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                              autoFocus
                              onKeyDown={(e) => e.key === "Enter" && inviteWorker(team.id)}
                            />
                          </div>
                          <button
                            onClick={() => inviteWorker(team.id)}
                            disabled={!inviteEmail.trim()}
                            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
                          >
                            Send
                          </button>
                          <button onClick={() => setInviteTeamId(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-bold text-foreground">Or add existing workers</p>
                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder="Search workers..."
                              value={searchExisting}
                              onChange={(e) => setSearchExisting(e.target.value)}
                              className="w-full rounded-xl bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {(() => {
                              const available = Object.values(allMembers).filter(
                                (m) => !team.workers.some((w) => w.id === m.id) &&
                                       (m.name.toLowerCase().includes(searchExisting.toLowerCase()) ||
                                        m.email.toLowerCase().includes(searchExisting.toLowerCase()))
                              );
                              if (available.length === 0) {
                                return <p className="text-xs text-muted-foreground text-center py-2">No workers found.</p>;
                              }
                              return available.map((m) => (
                                <div key={m.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                      {m.initial}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-foreground">{m.name}</span>
                                      <span className="text-[10px] text-muted-foreground">{m.email}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => addExistingWorker(team.id, m)}
                                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                                  >
                                    Add
                                  </button>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setInviteTeamId(team.id)}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-3 text-xs font-semibold text-primary"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Invite Worker
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Category assignment bottom sheet */}
        <Drawer open={!!categorySheetTeamId} onOpenChange={(open) => !open && setCategorySheetTeamId(null)}>
          <DrawerContent className="mx-auto max-w-[390px]">
            <DrawerHeader>
              <DrawerTitle>Assign Categories</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-1 px-4 pb-6 max-h-[60vh] overflow-y-auto">
              {categories.map((cat) => {
                const team = teams.find((t) => t.id === categorySheetTeamId);
                const isAssigned = team?.assignedCategories.includes(cat.id) ?? false;
                return (
                  <button
                    key={cat.id}
                    onClick={() => categorySheetTeamId && toggleCategory(categorySheetTeamId, cat.id)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent"
                  >
                    {(() => { const n = categoryIconMap[cat.id] || "wrench"; const I = iconMap[n]; const c = categoryColorMap[cat.id]; return I ? <I size={18} weight="regular" className={c?.color || "text-muted-foreground"} /> : null; })()}
                    <span className="flex-1 text-sm font-semibold text-foreground">{cat.label}</span>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      isAssigned ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {isAssigned && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Rename bottom sheet */}
        <Drawer open={!!editingTeamId} onOpenChange={(open) => { if (!open) { setEditingTeamId(null); setEditName(""); } }}>
          <DrawerContent className="mx-auto max-w-[390px]">
            <DrawerHeader>
              <DrawerTitle>Rename Team</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Team name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && editingTeamId && renameTeam(editingTeamId)}
              />
            </div>
            <DrawerFooter>
              <button
                onClick={() => editingTeamId && renameTeam(editingTeamId)}
                disabled={!editName.trim()}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingTeamId(null); setEditName(""); }}
                className="w-full rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground"
              >
                Discard
              </button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteConfirmTeamId} onOpenChange={(open) => !open && setDeleteConfirmTeamId(null)}>
          <AlertDialogContent className="max-w-[358px] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the team and all its worker assignments. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (deleteConfirmTeamId) deleteTeam(deleteConfirmTeamId); setDeleteConfirmTeamId(null); }}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileLayout>
  );
};

export default TraderTeams;
