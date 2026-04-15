import React, { useState } from "react";
import { Drawer } from "vaul";
import { 
  MapPin, Clock, Star, Play, 
  Info, ChevronRight, 
  ShieldCheck, Timer,
  MessageCircle, XCircle, FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Avatar from "boring-avatars";
import { toast } from "sonner";
import QuoteSheet, { type QuoteSheetData } from "./QuoteSheet";

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

const categoryConfig: Record<JobCategory, { label: string; className: string }> = {
  fixed: { label: "Fixed Rate", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate Required", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Site Inspection", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const JobDetailSheet = ({ job, isOpen, onOpenChange, onAction }: JobDetailSheetProps) => {
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);

  React.useEffect(() => {
    if (!isOpen) setShowQuoteSheet(false);
  }, [isOpen]);

  if (!job) return null;

  const cat = categoryConfig[job.category];
  const showMessageCTA = job.category !== "fixed";

  const handleQuoteSubmit = (data: QuoteSheetData) => {
    const action = job.category === "inspection" ? "approve_inspection" : "send_estimate";
    onAction(job.id, action, data);
    setShowQuoteSheet(false);
    onOpenChange(false);
    toast.success("Quote sent successfully!");
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
              onClick={() => setShowQuoteSheet(true)}
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
              onClick={() => setShowQuoteSheet(true)}
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
    <>
      <Drawer.Root 
        open={isOpen} 
        onOpenChange={onOpenChange}
        container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

            <ScrollArea className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.className}`}>
                      {cat.label}
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

              {/* Customer Section */}
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
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Quote Sheet — separate bottom sheet */}
      {job.category !== "fixed" && (
        <QuoteSheet
          isOpen={showQuoteSheet}
          onOpenChange={setShowQuoteSheet}
          category={job.category}
          jobTitle={job.title}
          onSubmit={handleQuoteSubmit}
        />
      )}
    </>
  );
};

export default JobDetailSheet;
