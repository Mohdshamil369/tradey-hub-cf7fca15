// Multi-step "Create new group" bottom sheet, contained inside the device mockup.
// Step 1: Name + description
// Step 2: Add members (search + multi-select from a mock pool)
// Step 3: Review + confirm
import { useMemo, useState } from "react";
import { Drawer } from "vaul";
import {
  ArrowLeft, Check, Search, Users, X, Plus, ShieldCheck, Mail, Send,
} from "lucide-react";
import BoringAvatar from "boring-avatars";
import { GroupConversation, GroupMember } from "@/data/messaging";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

// Mock pool of teammates the admin can invite. In production this would be the
// trader's saved contacts / org workers.
const memberPool: Omit<GroupMember, "role">[] = [
  { id: "u1", name: "Alex Turner",   initial: "A", email: "alex@buildright.com",   online: true  },
  { id: "u2", name: "James Cooper",  initial: "J", email: "james@buildright.com",  online: false },
  { id: "u3", name: "Lena K.",       initial: "L", email: "lena@swiftlogi.com",    online: true  },
  { id: "u4", name: "Tom Baker",     initial: "T", email: "tom@swiftlogi.com",     online: false },
  { id: "u5", name: "Sara Mendez",   initial: "S", email: "sara@buildright.com",   online: true  },
  { id: "u6", name: "Pieter D.",     initial: "P", email: "pieter@nordhaus.com",   online: false },
  { id: "u7", name: "Sophie Baker",  initial: "S", email: "sophie@buildright.com", online: true  },
  { id: "u8", name: "Manu R.",       initial: "M", email: "manu@swiftlogi.com",    online: false },
];

type Step = "details" | "members" | "review";

interface CreateGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (group: GroupConversation) => void;
}

const CreateGroupSheet = ({ open, onOpenChange, onCreated }: CreateGroupSheetProps) => {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return memberPool;
    return memberPool.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [search]);

  const reset = () => {
    setStep("details");
    setName("");
    setDescription("");
    setSearch("");
    setSelected(new Set());
    setInviteEmail("");
    setInvitedEmails([]);
    setEmailError(null);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 250);
  };

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
    // Basic RFC-ish email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (invitedEmails.includes(trimmed) || memberPool.some((m) => m.email.toLowerCase() === trimmed)) {
      setEmailError("Already added");
      return;
    }
    setInvitedEmails((prev) => [...prev, trimmed]);
    setInviteEmail("");
    setEmailError(null);
  };

  const removeInviteEmail = (e: string) =>
    setInvitedEmails((prev) => prev.filter((x) => x !== e));

  const handleCreate = () => {
    const now = Date.now();
    const members: GroupMember[] = [
      // Current user is the admin (auto-accepted)
      {
        id: "me",
        name: "You",
        initial: "Y",
        email: "you@tradey.app",
        role: "admin",
        online: true,
        inviteStatus: "accepted",
      },
      // Pool members — assumed inside the org so auto-accepted
      ...memberPool
        .filter((m) => selected.has(m.id))
        .map<GroupMember>((m) => ({ ...m, role: "user", inviteStatus: "accepted" })),
      // Email invites — pending until the recipient accepts
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

    onCreated(group);
    close();
  };

  const totalAdded = selected.size + invitedEmails.length;

  const canAdvanceFromDetails = name.trim().length >= 2;
  const canCreate = canAdvanceFromDetails;

  const stepNumber = step === "details" ? 1 : step === "members" ? 2 : 3;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : close())}
      container={
        typeof document !== "undefined"
          ? document.getElementById("mobile-device-content")
          : null
      }
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[92%] w-full flex-col rounded-t-[28px] bg-background outline-none overflow-hidden">
          <Drawer.Title className="sr-only">Create new group</Drawer.Title>
          <Drawer.Description className="sr-only">
            Set group details, add members and confirm.
          </Drawer.Description>

          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            {step !== "details" ? (
              <button
                onClick={() => setStep(step === "review" ? "members" : "details")}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Step {stepNumber} of 3
              </p>
              <h2 className="text-base font-extrabold text-foreground">
                {step === "details" && "Group details"}
                {step === "members" && "Add members"}
                {step === "review" && "Review & confirm"}
              </h2>
            </div>
            <button
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-4 pb-3">
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
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {step === "details" && (
              <div className="flex flex-col gap-4 pt-1">
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
                    Description{" "}
                    <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What's this group for?"
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/15 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[11px] leading-snug text-foreground/80">
                    You'll be the admin of this group and can manage members,
                    assign jobs and create subtasks.
                  </p>
                </div>
              </div>
            )}

            {step === "members" && (
              <div className="flex flex-col gap-3 pt-1">
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
                            isSelected
                              ? "border-primary/40 bg-primary/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <BoringAvatar
                              size={36}
                              name={m.name}
                              variant="beam"
                              colors={avatarPalette}
                            />
                            {m.online && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-online" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-bold text-foreground">
                              {m.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {m.email}
                            </p>
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
              <div className="flex flex-col gap-4 pt-1">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <BoringAvatar
                      size={44}
                      name={name || "Group"}
                      variant="marble"
                      colors={avatarPalette}
                    />
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
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Members ({selected.size + 1})
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
                            <p className="truncate text-[12px] font-bold text-foreground">
                              {m.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {m.email}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleMember(m.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground active:bg-destructive/10 active:text-destructive"
                            aria-label={`Remove ${m.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    {selected.size === 0 && (
                      <p className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
                        No additional members. You can add them later from the
                        group settings.
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
                  Review ({selected.size} added)
                </button>
              </div>
            )}
            {step === "review" && (
              <button
                onClick={() => canCreate && handleCreate()}
                disabled={!canCreate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[13px] font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Create group
              </button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CreateGroupSheet;
