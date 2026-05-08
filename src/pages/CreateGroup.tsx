// Full-page "Create new group" flow (replaces the previous bottom sheet).
// Renders inside the device mockup via MobileLayout. Same 3-step UX:
// 1) Details · 2) Add members (search pool + email invites) · 3) Review.
import MobileLayout from "@/components/layout/MobileLayout";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Search, Users, X, Plus, ShieldCheck, Mail, Send,
} from "lucide-react";
import BoringAvatar from "boring-avatars";
import {
  GroupConversation, GroupMember, groupConversations, allMembers
} from "@/data/messaging";
import { toast } from "sonner";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

// Teammates will be pulled from allMembers in messaging.ts

type Step = "details" | "members" | "review";

const CreateGroup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);

  const pool = Object.values(allMembers);

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [search, pool]);

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addInviteEmail = () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (invitedEmails.includes(trimmed) || Object.values(allMembers).some((m) => m.email.toLowerCase() === trimmed)) {
      setEmailError("Already added");
      return;
    }
    setInvitedEmails((prev) => [...prev, trimmed]);
    setInviteEmail("");
    setEmailError(null);
  };

  const removeInviteEmail = (e: string) =>
    setInvitedEmails((prev) => prev.filter((x) => x !== e));

  const totalAdded = selected.size + invitedEmails.length;
  const canAdvanceFromDetails = name.trim().length >= 2;
  const stepNumber = step === "details" ? 1 : step === "members" ? 2 : 3;

  const handleBack = () => {
    if (step === "review") setStep("members");
    else if (step === "members") setStep("details");
    else navigate("/chat");
  };

  const handleCreate = () => {
    const now = Date.now();
    const members: GroupMember[] = [
      {
        id: "me",
        name: "You",
        initial: "Y",
        email: "you@tradey.app",
        role: "admin",
        online: true,
        inviteStatus: "accepted",
      },
      ...memberPool
        .filter((m) => selected.has(m.id))
        .map<GroupMember>((m) => ({ ...m, role: "user", inviteStatus: "accepted" })),
      ...invitedEmails.map<GroupMember>((e) => ({
        id: `inv-${e}`,
        name: e.split("@")[0],
        initial: e[0].toUpperCase(),
        email: e,
        role: "user",
        inviteStatus: "pending",
        invitedAt: now,
      })),
    ];

    const group: GroupConversation = {
      id: `g-${now}`,
      type: "group",
      name: name.trim(),
      lastMessage: "Group created",
      time: "Just now",
      timestamp: now,
      unread: 0,
      members,
      description: description.trim() || undefined,
      messages: [
        {
          id: `m-${now}`,
          text: `${name.trim()} created. ${members.length} member${members.length === 1 ? "" : "s"}${
            invitedEmails.length ? ` · ${invitedEmails.length} invite${invitedEmails.length === 1 ? "" : "s"} pending` : ""
          }.`,
          sender: "other",
          senderName: "System",
          time: "Just now",
        },
      ],
    };

    // Persist into the shared mock store so the inbox shows it next time.
    groupConversations.unshift(group);
    toast.success(`Group "${group.name}" created`, {
      description: `${members.length} member${members.length === 1 ? "" : "s"}${
        invitedEmails.length ? ` · ${invitedEmails.length} pending` : ""
      }`,
    });
    navigate(`/chat/group/${group.id}`);
  };

  return (
    <MobileLayout role="trader">
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border bg-card/70 px-4 py-3 backdrop-blur-xl">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Step {stepNumber} of 3
            </p>
            <h1 className="text-base font-extrabold text-foreground">
              {step === "details" && "Group details"}
              {step === "members" && "Add members"}
              {step === "review" && "Review & confirm"}
            </h1>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-4 pt-3">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  n <= stepNumber ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          {step === "details" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Group name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Plumbing Squad"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Visible to everyone in the group.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's this group for?"
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-[11px] leading-snug text-foreground/80">
                  You'll be the admin of this group and can manage members,
                  assign jobs and create subtasks.
                </p>
              </div>
            </div>
          )}

          {step === "members" && (
            <div className="flex flex-col gap-3">
              {/* Invite by email */}
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3 w-3" /> Invite by email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    inputMode="email"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addInviteEmail();
                      }
                    }}
                    placeholder="name@example.com"
                    className="flex-1 rounded-lg bg-muted px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <button
                    onClick={addInviteEmail}
                    disabled={!inviteEmail.trim()}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" /> Add
                  </button>
                </div>
                {emailError && (
                  <p className="mt-1.5 text-[10px] font-semibold text-destructive">{emailError}</p>
                )}
                {invitedEmails.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {invitedEmails.map((e) => (
                      <span
                        key={e}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pl-2 pr-1 text-[10px] font-semibold text-primary"
                      >
                        {e}
                        <button
                          onClick={() => removeInviteEmail(e)}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary"
                          aria-label={`Remove ${e}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Invitees appear as <span className="font-semibold text-foreground">Pending</span> until they accept.
                </p>
              </div>

              {/* Search teammates */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teammates"
                  className="w-full rounded-xl bg-muted pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              {(selected.size > 0 || invitedEmails.length > 0) && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">
                    {selected.size} selected · {invitedEmails.length} invited
                  </span>
                  <button
                    onClick={() => {
                      setSelected(new Set());
                      setInvitedEmails([]);
                    }}
                    className="font-semibold text-muted-foreground active:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {filteredPool.length === 0 ? (
                  <p className="rounded-xl bg-muted/40 p-6 text-center text-[11px] text-muted-foreground">
                    No matches for "{search}".
                  </p>
                ) : (
                  filteredPool.map((m) => {
                    const isSelected = selected.has(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all active:scale-[0.99] ${
                          isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <BoringAvatar size={36} name={m.name} variant="beam" colors={avatarPalette} />
                          {m.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-online" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold text-foreground">{m.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{m.email}</p>
                        </div>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-3">
                  <BoringAvatar size={44} name={name || "Group"} variant="marble" colors={avatarPalette} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-foreground">
                      {name || "Untitled group"}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      You're admin
                    </p>
                  </div>
                </div>
                {description && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Members ({totalAdded + 1})
                </p>
                <div className="flex flex-col gap-1.5">
                  {/* Self */}
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
                    <BoringAvatar size={32} name="You" variant="beam" colors={avatarPalette} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-foreground">You</p>
                      <p className="text-[10px] text-muted-foreground">you@tradey.app</p>
                    </div>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      Admin
                    </span>
                  </div>

                  {memberPool
                    .filter((m) => selected.has(m.id))
                    .map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5"
                      >
                        <BoringAvatar size={32} name={m.name} variant="beam" colors={avatarPalette} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold text-foreground">{m.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{m.email}</p>
                        </div>
                        <span className="rounded-md bg-online/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-online">
                          Joined
                        </span>
                      </div>
                    ))}

                  {invitedEmails.map((e) => (
                    <div
                      key={e}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-foreground">
                          {e.split("@")[0]}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">{e}</p>
                      </div>
                      <span className="rounded-md bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
                        Pending
                      </span>
                    </div>
                  ))}

                  {totalAdded === 0 && (
                    <p className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
                      No additional members. You can add them later from the group settings.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background p-4 pb-6">
          {step === "details" && (
            <button
              onClick={() => canAdvanceFromDetails && setStep("members")}
              disabled={!canAdvanceFromDetails}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[13px] font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              Continue
            </button>
          )}
          {step === "members" && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep("review")}
                className="flex-1 rounded-xl border border-border bg-card py-3 text-[12px] font-bold text-muted-foreground active:bg-muted"
              >
                Skip
              </button>
              <button
                onClick={() => setStep("review")}
                className="flex-[2] rounded-xl bg-primary py-3 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Review ({totalAdded} added)
              </button>
            </div>
          )}
          {step === "review" && (
            <button
              onClick={handleCreate}
              disabled={!canAdvanceFromDetails}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[13px] font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Create group
            </button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default CreateGroup;
