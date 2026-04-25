import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Send, Mic, PoundSterling, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { EstimateData } from "@/data/jobWorkflowState";

interface EstimateSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  onSubmit: (data: EstimateData) => void;
}

const EstimateSheet = ({ isOpen, onOpenChange, jobTitle, onSubmit }: EstimateSheetProps) => {
  const [title, setTitle] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setMinPrice("");
        setMaxPrice("");
        setDescription("");
        setIsRecording(false);
        setHasVoiceNote(false);
      }, 300);
    }
  }, [isOpen]);

  const min = parseFloat(minPrice) || 0;
  const max = parseFloat(maxPrice) || 0;
  const canSubmit = title.trim().length > 0 && min > 0 && max >= min && description.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      minPrice: min,
      maxPrice: max,
      description: description.trim(),
      hasVoiceNote,
      sentAt: "Just now",
    });
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-[60] flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                  Create Estimate
                </h2>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 truncate max-w-[240px]">{jobTitle}</p>
              </div>
              <button onClick={() => onOpenChange(false)} className="rounded-full bg-muted p-2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 w-full px-4 pb-2">
            {/* Title */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Estimate Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Full Bathroom Renovation Estimate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[13px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/40"
              />
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Estimated Price Range <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 min-w-0 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary/40 transition-colors">
                  <PoundSterling className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
                <span className="text-sm font-bold text-muted-foreground">—</span>
                <div className="flex-1 min-w-0 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary/40 transition-colors">
                  <PoundSterling className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              {/* Visual range bar */}
              {min > 0 && max >= min && (
                <div className="mt-3 rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-blue-600">£{min.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Estimated Range</span>
                    <span className="text-[11px] font-bold text-blue-600">£{max.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: "100%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                    Mid estimate: £{((min + max) / 2).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Scope of Work <span className="text-destructive">*</span>
              </label>
              <textarea
                placeholder="Describe the work that will be done, timeline, approach..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-card p-3 text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground/50 resize-none focus:border-primary/30"
              />
            </div>

            {/* Voice Note */}
            <div className="mb-6">
              <button
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setHasVoiceNote(true);
                    toast.success("Voice note attached!");
                  } else {
                    setIsRecording(true);
                    toast.info("Listening... (Speak now)");
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all active:scale-[0.98] ${
                  isRecording ? "border-destructive/30 bg-destructive/5" : hasVoiceNote ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isRecording ? "bg-destructive animate-pulse" : hasVoiceNote ? "bg-primary" : "bg-primary"}`}>
                  <Mic className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-bold text-foreground">
                    {isRecording ? "Recording..." : hasVoiceNote ? "Voice Note Attached ✓" : "Add Voice Note"}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {isRecording ? "Tap to stop" : hasVoiceNote ? "Tap to re-record" : "Explain the estimate to the customer"}
                  </p>
                </div>
              </button>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-4 py-5 bg-background border-t border-border/50 shadow-[0_-8px_16px_-12px_rgba(0,0,0,0.08)]">
            {min > 0 && max >= min && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Range</span>
                <span className="text-lg font-black text-foreground truncate ml-2">£{min.toLocaleString()} — £{max.toLocaleString()}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-[2.5] rounded-xl bg-blue-600 py-3.5 text-[12px] font-bold text-white shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Send Estimate
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default EstimateSheet;
