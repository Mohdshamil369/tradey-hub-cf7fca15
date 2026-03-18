import React, { useState } from "react";
import { Drawer } from "vaul";
import { 
  MapPin, Clock, Star, Play, 
  Info, ChevronRight, 
  ShieldCheck, Timer,
  MessageCircle, XCircle, Send, Plus, Trash2, Mic, FileText,
  PoundSterling, ArrowLeft
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Avatar from "boring-avatars";
import { toast } from "sonner";

export type JobCategory = "fixed" | "estimate" | "inspection";

export interface JobDetailData {
  id: string;
  category: JobCategory;
  title: string;
  icon: string;
  description: string;
  location: string;
  distance: string;
  timeWindow: string;
  price?: number;
  inspectionFee?: number;
  customer: {
    name: string;
    rating: number;
    reviews: number;
    isVerified: boolean;
    memberSince: string;
    jobsCompleted?: number;
    responseRate?: string;
    repeatHireRate?: string;
    recentReview?: {
      workerName: string;
      text: string;
      rating: number;
      date: string;
    };
  };
  media?: {
    photos?: string[];
    voiceNote?: {
      url: string;
      duration: string;
    };
  };
}

interface JobDetailSheetProps {
  job: JobDetailData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (jobId: string, action: string, data?: any) => void;
}

interface MaterialItem {
  id: string;
  name: string;
  cost: number;
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate Required", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Site Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const QuoteBuilder = ({ 
  category, 
  onSubmit, 
  onBack 
}: { 
  category: "estimate" | "inspection"; 
  onSubmit: (data: { materials: MaterialItem[]; labourCharge: number; notes: string; total: number; inspectionFee?: number }) => void;
  onBack: () => void;
}) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialCost, setNewMaterialCost] = useState("");
  const [labourCharge, setLabourCharge] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const addMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialCost) return;
    setMaterials(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newMaterialName.trim(),
      cost: parseFloat(newMaterialCost) || 0,
    }]);
    setNewMaterialName("");
    setNewMaterialCost("");
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const materialsTotal = materials.reduce((s, m) => s + m.cost, 0);
  const labour = parseFloat(labourCharge) || 0;
  const inspection = parseFloat(inspectionFee) || 0;
  const total = materialsTotal + labour + (category === "inspection" ? inspection : 0);

  const canSubmit = category === "inspection" 
    ? inspection > 0 
    : (materials.length > 0 || labour > 0);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">
            {category === "inspection" ? "Inspection Quote" : "Send Estimate"}
          </h2>
        </div>

        {/* Inspection Fee — inspection only */}
        {category === "inspection" && (
          <div className="mb-5">
            <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
              Your Inspection Fee
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
              <PoundSterling className="h-4 w-4 text-primary shrink-0" />
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={inspectionFee}
                onChange={(e) => setInspectionFee(e.target.value)}
                className="flex-1 bg-transparent text-lg font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        )}

        {/* Materials */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
            Materials {materials.length > 0 && `(${materials.length})`}
          </label>

          {/* Existing materials */}
          {materials.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2.5">
                  <span className="text-xs font-medium text-foreground truncate flex-1 mr-2">{m.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-foreground">£{m.cost.toFixed(2)}</span>
                    <button onClick={() => removeMaterial(m.id)} className="text-muted-foreground active:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add material */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Material name"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50"
            />
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 w-24">
              <PoundSterling className="h-3 w-3 text-muted-foreground shrink-0" />
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={newMaterialCost}
                onChange={(e) => setNewMaterialCost(e.target.value)}
                className="w-full bg-transparent py-2.5 text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <button
              onClick={addMaterial}
              disabled={!newMaterialName.trim() || !newMaterialCost}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Labour Charge */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
            Labour Charge
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <PoundSterling className="h-4 w-4 text-primary shrink-0" />
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={labourCharge}
              onChange={(e) => setLabourCharge(e.target.value)}
              className="flex-1 bg-transparent text-lg font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
            Notes to Customer
          </label>
          <textarea
            placeholder="Add any notes about the job, timeline, or conditions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-xs text-foreground leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 resize-none"
          />
        </div>

        {/* Voice Note */}
        <div className="mb-6">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
            Voice Message (optional)
          </label>
          <button
            onClick={() => {
              setIsRecording(!isRecording);
              if (isRecording) toast.success("Voice note recorded!");
              else toast.info("Recording started... (demo)");
            }}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all active:scale-[0.98] ${
              isRecording 
                ? "border-destructive/30 bg-destructive/5" 
                : "border-border bg-card"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isRecording ? "bg-destructive animate-pulse" : "bg-primary"
            }`}>
              <Mic className={`h-4 w-4 ${isRecording ? "text-white" : "text-primary-foreground"}`} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">
                {isRecording ? "Recording… Tap to stop" : "Record Voice Note"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRecording ? "Tap to finish recording" : "Explain the quote to the customer"}
              </p>
            </div>
          </button>
        </div>

        {/* Quote Summary */}
        {(materialsTotal > 0 || labour > 0 || inspection > 0) && (
          <div className="mb-6 rounded-2xl bg-accent/50 p-4 border border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3">Quote Summary</p>
            <div className="space-y-2">
              {category === "inspection" && inspection > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Inspection Fee</span>
                  <span className="font-semibold text-foreground">£{inspection.toFixed(2)}</span>
                </div>
              )}
              {materialsTotal > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Materials ({materials.length} items)</span>
                  <span className="font-semibold text-foreground">£{materialsTotal.toFixed(2)}</span>
                </div>
              )}
              {labour > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Labour</span>
                  <span className="font-semibold text-foreground">£{labour.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-sm font-extrabold text-primary">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Submit Footer */}
      <div className="flex gap-3 p-4 bg-background border-t border-border">
        <button
          onClick={onBack}
          className="flex-1 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ materials, labourCharge: labour, notes, total, inspectionFee: category === "inspection" ? inspection : undefined })}
          disabled={!canSubmit}
          className={`flex-[2] rounded-2xl py-4 text-sm font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
            category === "inspection" 
              ? "bg-[hsl(25,90%,55%)] text-white shadow-orange-500/20" 
              : "bg-primary text-primary-foreground shadow-primary/20"
          }`}
        >
          <Send className="h-4 w-4" />
          Send Quote • £{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

const JobDetailSheet = ({ job, isOpen, onOpenChange, onAction }: JobDetailSheetProps) => {
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);

  // Reset quote builder when sheet closes
  React.useEffect(() => {
    if (!isOpen) setShowQuoteBuilder(false);
  }, [isOpen]);

  if (!job) return null;

  const cat = categoryConfig[job.category];
  const showMessageCTA = job.category !== "fixed";

  const handleQuoteSubmit = (data: { materials: MaterialItem[]; labourCharge: number; notes: string; total: number; inspectionFee?: number }) => {
    const action = job.category === "inspection" ? "approve_inspection" : "send_estimate";
    onAction(job.id, action, data);
    setShowQuoteBuilder(false);
  };

  const renderFooter = () => {
    switch (job.category) {
      case "fixed":
        return (
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            <button
              onClick={() => { onAction(job.id, "decline"); onOpenChange(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => onAction(job.id, "accept")}
              className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              Pickup Job • £{job.price}
            </button>
          </div>
        );
      case "estimate":
        return (
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            <button
              onClick={() => { onAction(job.id, "decline"); onOpenChange(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => setShowQuoteBuilder(true)}
              className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Create Estimate
            </button>
          </div>
        );
      case "inspection":
        return (
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            <button
              onClick={() => { onAction(job.id, "decline"); onOpenChange(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => setShowQuoteBuilder(true)}
              className="flex-[2] rounded-2xl bg-[hsl(25,90%,55%)] py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Create Inspection Quote
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] max-w-[430px] flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          {/* Quote Builder View */}
          {showQuoteBuilder && job.category !== "fixed" ? (
            <QuoteBuilder 
              category={job.category} 
              onSubmit={handleQuoteSubmit} 
              onBack={() => setShowQuoteBuilder(false)} 
            />
          ) : (
            <>
              <ScrollArea className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-accent text-[32px] shadow-sm">
                    {job.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.className}`}>
                        {cat.emoji} {cat.label}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground leading-tight">{job.title}</h2>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{job.distance}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-primary" />{job.timeWindow}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-2xl bg-accent/30 p-4 mb-6 border border-border/50 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Location</p>
                    <p className="text-[11px] text-muted-foreground">{job.location}</p>
                  </div>
                </div>

                {/* Customer Section with ratings */}
                <div className="rounded-[28px] bg-accent/30 p-5 mb-6 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-background">
                        <Avatar name={job.customer.name} variant="beam" size={48} colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-foreground">{job.customer.name}</h3>
                          {job.customer.isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium">Customer since {job.customer.memberSince}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-bold text-foreground">{job.customer.rating}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{job.customer.reviews} worker reviews</p>
                    </div>
                  </div>

                  {/* Customer quality stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-xl bg-background/60 p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">{job.customer.jobsCompleted ?? 12}</p>
                      <p className="text-[9px] text-muted-foreground font-medium">Jobs Done</p>
                    </div>
                    <div className="rounded-xl bg-background/60 p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">{job.customer.responseRate ?? "95%"}</p>
                      <p className="text-[9px] text-muted-foreground font-medium">Response</p>
                    </div>
                    <div className="rounded-xl bg-background/60 p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">{job.customer.repeatHireRate ?? "40%"}</p>
                      <p className="text-[9px] text-muted-foreground font-medium">Repeat Hire</p>
                    </div>
                  </div>

                  {/* Recent worker review about this customer */}
                  {job.customer.recentReview && (
                    <div className="rounded-xl bg-background/60 p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: job.customer.recentReview.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">by {job.customer.recentReview.workerName}</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">"{job.customer.recentReview.text}"</p>
                      <p className="text-[9px] text-muted-foreground mt-1">{job.customer.recentReview.date}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toast.info("Full customer profile coming soon")}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-background/50 border border-border py-2 text-[11px] font-bold text-foreground active:bg-background transition-colors"
                    >
                      <Info className="h-3.5 w-3.5" />
                      Full Profile
                    </button>
                    {showMessageCTA && (
                      <button 
                        onClick={() => toast.info("Chat feature coming soon!")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-background/50 border border-border py-2 text-[11px] font-bold text-foreground active:bg-background transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Job Details</h3>
                  <div className="rounded-[24px] bg-card p-5 border border-border border-dashed">
                    <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
                  </div>
                </div>

                {/* Media Section */}
                {(job.media?.voiceNote || (job.media?.photos && job.media.photos.length > 0)) && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Attachments</h3>
                    <div className="flex flex-col gap-4">
                      {job.media?.voiceNote && (
                        <div className="relative overflow-hidden rounded-[24px] bg-primary/5 p-4 border border-primary/10">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toast.info("Playing voice note...")}
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                            >
                              <Play className="h-5 w-5 fill-current ml-0.5" />
                            </button>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-foreground mb-1">Customer Voice Message</p>
                              <div className="flex items-center gap-1 h-6">
                                {[4, 7, 3, 9, 6, 8, 4, 7, 5, 8, 3, 6, 9, 4, 7].map((h, i) => (
                                  <div key={i} className="flex-1 rounded-full bg-primary/40" style={{ height: `${h * 2}px` }} />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-primary font-mono">{job.media.voiceNote.duration}</span>
                          </div>
                        </div>
                      )}

                      {job.media?.photos && job.media.photos.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                          {job.media.photos.map((photo, i) => (
                            <div key={i} className="snap-start relative h-40 w-40 shrink-0 rounded-[20px] overflow-hidden border border-border shadow-sm group">
                              <img src={photo} alt={`Job detail ${i}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Secure payment badge */}
                <div className="mb-10 p-5 rounded-[24px] bg-muted/30 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Tradey Secure</p>
                      <p className="text-[10px] text-muted-foreground">Payment protected & insured</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                </div>
              </ScrollArea>

              {renderFooter()}
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default JobDetailSheet;
