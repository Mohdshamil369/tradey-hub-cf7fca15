import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Users, ChevronRight, ChevronDown, X, ShieldCheck, Search, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export interface AssignGroup {
  id: string;
  name: string;
  members: { id: string; name: string; role: string }[];
}

export interface AssignIndividual {
  id: string;
  name: string;
  role: string;
}

export interface AssignmentResult {
  type: "group" | "individuals";
  groupId?: string;
  groupName?: string;
  memberIds: string[];
  memberNames: string[];
}

interface AssignSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  jobSubtitle?: string;
  jobAmount?: number;
  groups: AssignGroup[];
  individuals: AssignIndividual[];
  onConfirm: (result: AssignmentResult) => void;
  /** Label for the final confirm button. Defaults to "Send Quote & Assign". */
  confirmLabel?: string;
  /** Helper text shown above the Confirm Assignment header. */
  confirmHelperText?: string;
}

type Step = "choose" | "select-members" | "confirm";

const AssignSheet = ({
  isOpen,
  onOpenChange,
  jobTitle,
  jobSubtitle,
  jobAmount,
  groups,
  individuals,
  onConfirm,
  confirmLabel = "Send Quote & Assign",
  confirmHelperText = "The quote will be sent to the customer and the job will be dispatched to the selected team.",
}: AssignSheetProps) => {
  const [step, setStep] = useState<Step>("choose");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectedIndividuals, setSelectedIndividuals] = useState<AssignIndividual[]>([]);
  const [individualSearch, setIndividualSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setTimeout(() => {
        setStep("choose");
        setSelectedGroupId(null);
        setSelectedMemberIds(new Set());
        setSelectedIndividuals([]);
        setIndividualSearch("");
      }, 300);
    }
  }, [isOpen]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleIndividual = (ind: AssignIndividual) => {
    setSelectedIndividuals(prev => {
      const exists = prev.find(p => p.id === ind.id);
      if (exists) return prev.filter(p => p.id !== ind.id);
      return [...prev, ind];
    });
  };

  const filteredIndividuals = individuals.filter(i =>
    i.name.toLowerCase().includes(individualSearch.toLowerCase()) ||
    i.role.toLowerCase().includes(individualSearch.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedGroup && selectedMemberIds.size > 0) {
      const members = selectedGroup.members.filter(m => selectedMemberIds.has(m.id));
      onConfirm({
        type: "group",
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        memberIds: members.map(m => m.id),
        memberNames: members.map(m => m.name),
      });
    } else if (selectedIndividuals.length > 0) {
      onConfirm({
        type: "individuals",
        memberIds: selectedIndividuals.map(i => i.id),
        memberNames: selectedIndividuals.map(i => i.name),
      });
    } else {
      toast.error("Please select at least one member");
      return;
    }
  };

  const stepTitle = step === "choose"
    ? "Assign to Team"
    : step === "select-members"
      ? "Select Members"
      : "Confirm Assignment";

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              {step !== "choose" && (
                <button
                  onClick={() => {
                    if (step === "confirm") setStep(selectedGroup ? "select-members" : "choose");
                    else setStep("choose");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
              )}
              <h2 className="text-lg font-bold text-foreground">{stepTitle}</h2>
            </div>
            <button onClick={() => onOpenChange(false)} className="rounded-full bg-muted p-2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 px-5 pb-6">
            <div className="mb-4 rounded-2xl bg-accent/30 p-4 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-foreground truncate flex-1">{jobTitle}</h4>
                {jobAmount !== undefined && (
                  <span className="text-primary font-bold text-xs ml-2 shrink-0">£{jobAmount.toFixed(2)}</span>
                )}
              </div>
              {jobSubtitle && <p className="text-[11px] text-muted-foreground">{jobSubtitle}</p>}
            </div>

            {step === "choose" && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Assign to a Group</p>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setSelectedMemberIds(new Set(group.members.map(m => m.id)));
                      setSelectedIndividuals([]);
                      setStep("select-members");
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members.length} members available</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                  </button>
                ))}

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Or Assign Individuals</p>

                  {selectedIndividuals.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {selectedIndividuals.map(ind => (
                        <span key={ind.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                          {ind.name}
                          <button onClick={() => toggleIndividual(ind)} className="hover:bg-primary/20 rounded-full">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={individualSearch}
                      onChange={e => setIndividualSearch(e.target.value)}
                      placeholder="Search individuals..."
                      className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                    {filteredIndividuals.map(ind => {
                      const selected = selectedIndividuals.some(s => s.id === ind.id);
                      return (
                        <button
                          key={ind.id}
                          onClick={() => {
                            setSelectedGroupId(null);
                            setSelectedMemberIds(new Set());
                            toggleIndividual(ind);
                          }}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                            selected ? "border-primary bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-foreground">
                            {ind.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{ind.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{ind.role}</p>
                          </div>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          }`}>
                            {selected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedIndividuals.length > 0 && (
                    <button
                      onClick={() => setStep("confirm")}
                      className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.98]"
                    >
                      Continue with {selectedIndividuals.length} {selectedIndividuals.length === 1 ? "person" : "people"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === "select-members" && selectedGroup && (
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  {selectedGroup.name} · {selectedMemberIds.size}/{selectedGroup.members.length} selected
                </p>
                {selectedGroup.members.map(m => {
                  const selected = selectedMemberIds.has(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        selected ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">
                        {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.role}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    if (selectedMemberIds.size === 0) { toast.error("Select at least one member"); return; }
                    setStep("confirm");
                  }}
                  className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Confirm Assignment</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                    The quote will be sent to the customer and the job will be dispatched to the selected team.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {selectedGroup ? "Group · Selected Members" : "Selected Individuals"}
                  </p>
                  {selectedGroup ? (
                    <>
                      <p className="text-sm font-bold text-foreground mb-2">{selectedGroup.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedGroup.members.filter(m => selectedMemberIds.has(m.id)).map(m => (
                          <span key={m.id} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIndividuals.map(i => (
                        <span key={i.id} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                          {i.name} · {i.role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(selectedGroup ? "select-members" : "choose")}
                    className="flex-1 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    Send Quote & Assign
                  </button>
                </div>
              </div>
            )}
          </ScrollArea>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default AssignSheet;
