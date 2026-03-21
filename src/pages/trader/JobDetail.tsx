import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, MapPin, Clock, Star, Play, Info, ChevronRight,
  ShieldCheck, Timer, MessageCircle, XCircle, FileText,
  Image, Mic, ClipboardList, Package, Wrench, Ban, RotateCcw, Plus,
} from "lucide-react";
import Avatar from "boring-avatars";
import { toast } from "sonner";
import QuoteSheet, { type QuoteSheetData } from "@/components/trader/QuoteSheet";

export type JobCategory = "fixed" | "estimate" | "inspection";

export interface JobDetailPageData {
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
  postedAgo?: string;
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
  quote?: {
    total: number;
    status: "pending" | "accepted" | "declined" | "expired";
    sentAt: string;
    materialsCount: number;
    labourHours?: number;
    labourRate?: number;
    labourTypes?: { role: string; count: number; rate: number; hours: number }[];
    assignedTo?: { type: "group" | "individuals"; name: string; memberCount: number };
    materials?: { description: string; quantity: number; unitPrice: number }[];
    message?: string;
  };
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate Required", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Site Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const JobDetail = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "quotes" ? "quotes" : "details";
  const [activeTab, setActiveTab] = useState<"details" | "quotes" | "attachments">(initialTab as any);
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);

  // In a real app, fetch from store/API. For now, read from sessionStorage.
  const stored = sessionStorage.getItem(`job_detail_${jobId}`);
  const job: JobDetailPageData | null = stored ? JSON.parse(stored) : null;

  if (!job) {
    return (
      <MobileLayout role="trader">
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-muted-foreground">Job not found</p>
          <button onClick={() => navigate("/trader/jobs")} className="text-sm font-bold text-primary">
            Back to Jobs
          </button>
        </div>
      </MobileLayout>
    );
  }

  const cat = categoryConfig[job.category];
  const showQuotesTab = job.category !== "fixed";
  const showMessageCTA = job.category !== "fixed";

  const tabs = [
    { key: "details" as const, label: "Details", icon: ClipboardList },
    ...(showQuotesTab ? [{ key: "quotes" as const, label: "Quote", icon: FileText }] : []),
    { key: "attachments" as const, label: "Attachments", icon: Image },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case "accept":
        toast.success("Job accepted!");
        navigate("/trader/jobs");
        break;
      case "decline":
        toast("Job declined");
        navigate("/trader/jobs");
        break;
    }
  };

  const handleQuoteSubmit = (data: QuoteSheetData) => {
    const action = job.category === "inspection" ? "approve_inspection" : "send_estimate";
    toast.success("Quote sent successfully!");
    setShowQuoteSheet(false);
    navigate("/trader/jobs");
  };

  const renderDetailsTab = () => (
    <div className="flex flex-col gap-5 pb-4">
      {/* Category + Price Header */}
      <div className="flex items-start gap-4">
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
          {job.price && (
            <p className="mt-2 text-lg font-extrabold text-primary">£{job.price}</p>
          )}
          {!job.price && job.inspectionFee && (
            <p className="mt-2 text-base font-bold text-[hsl(25,90%,55%)]">Inspection: £{job.inspectionFee}</p>
          )}
          {!job.price && !job.inspectionFee && (
            <p className="mt-2 text-base font-bold text-blue-600">Quote TBD</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="rounded-2xl bg-accent/30 p-4 border border-border/50 flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-xs font-bold text-foreground">Location</p>
          <p className="text-[11px] text-muted-foreground">{job.location}</p>
        </div>
      </div>

      {/* Job Description */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Job Details</h3>
        <div className="rounded-[24px] bg-card p-5 border border-border border-dashed">
          <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
        </div>
      </div>

      {/* Customer Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Customer</h3>
        <div className="rounded-[28px] bg-accent/30 p-5 border border-border/50">
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
      </div>

      {/* Secure payment badge */}
      <div className="p-5 rounded-[24px] bg-muted/30 border border-border flex items-center justify-between">
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
    </div>
  );

  const renderQuotesTab = () => {
    if (job.quote) {
      const q = job.quote;
      const materialsTotal = q.materials
        ? q.materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0)
        : 0;
      const labourTotal = (q.labourHours ?? 0) * (q.labourRate ?? 0);
      const isPending = q.status === "pending";
      const isWithdrawable = q.status === "pending" || q.status === "accepted";

      return (
        <div className="flex flex-col gap-4 pb-4">
          {/* Status Banner */}
          <div className={`rounded-2xl p-4 border ${
            q.status === "pending" ? "bg-[hsl(25,90%,55%)]/5 border-[hsl(25,90%,55%)]/20" :
            q.status === "accepted" ? "bg-[hsl(142,70%,45%)]/5 border-[hsl(142,70%,45%)]/20" :
            q.status === "declined" ? "bg-destructive/5 border-destructive/20" :
            "bg-muted/50 border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground">Quote Status</p>
                <p className={`mt-1 text-sm font-bold ${
                  q.status === "pending" ? "text-[hsl(25,90%,55%)]" :
                  q.status === "accepted" ? "text-[hsl(142,70%,45%)]" :
                  q.status === "declined" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {q.status === "pending" ? "Awaiting Customer Response" :
                   q.status === "accepted" ? "Quote Accepted" :
                   q.status === "declined" ? "Quote Declined" :
                   "Quote Expired"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Sent {q.sentAt}</p>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£{q.total.toFixed(0)}</p>
            </div>
          </div>

          {/* Materials Line Items */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <Package className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
                Materials & Items ({q.materialsCount})
              </h3>
            </div>
            {q.materials && q.materials.length > 0 ? (
              <div className="flex flex-col gap-2">
                {q.materials.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.description || `Item ${idx + 1}`}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.quantity} × £{item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground shrink-0">
                        £{(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-xs text-muted-foreground">Materials Subtotal</p>
                  <p className="text-sm font-bold text-foreground">£{materialsTotal.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">{q.materialsCount} items included</p>
              </div>
            )}
          </div>

          {/* Labour Breakdown */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <Wrench className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground">Labour</h3>
            </div>

            {q.labourTypes && q.labourTypes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {q.labourTypes.map((line, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{line.role}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {line.count} worker{line.count > 1 ? "s" : ""} × {line.hours}h @ £{line.rate}/hr
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        £{(line.count * line.hours * line.rate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Labour</p>
                    <p className="text-[11px] text-muted-foreground">{q.labourHours ?? 0}h @ £{q.labourRate ?? 0}/hr</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">£{labourTotal.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Total Quote</span>
              <span className="text-xl font-extrabold text-primary">£{q.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Assignment */}
          {q.assignedTo && (
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-1.5">Assigned To</p>
              <p className="text-sm font-bold text-foreground">{q.assignedTo.name}</p>
              <p className="text-[11px] text-muted-foreground">{q.assignedTo.memberCount} member{q.assignedTo.memberCount > 1 ? "s" : ""}</p>
            </div>
          )}

          {/* Message/Notes */}
          {q.message && (
            <div className="rounded-xl border border-border bg-card p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-1.5">Notes to Customer</p>
              <p className="text-sm text-foreground leading-relaxed">{q.message}</p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 mt-2">
            {isWithdrawable && (
              <button
                onClick={() => {
                  toast("Quote withdrawn");
                  navigate("/trader/jobs");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3.5 text-sm font-bold text-destructive active:scale-[0.98] transition-all"
              >
                <Ban className="h-4 w-4" />
                Withdraw Quote
              </button>
            )}
            <button
              onClick={() => setShowQuoteSheet(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create New Quote
            </button>
            {q.status === "declined" || q.status === "expired" ? (
              <button
                onClick={() => setShowQuoteSheet(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3.5 text-sm font-bold text-foreground active:bg-muted transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Revise & Resend
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground mb-1">
            {job.category === "inspection" ? "Create Inspection Quote" : "Create an Estimate"}
          </p>
          <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
            {job.category === "inspection"
              ? "Set your inspection fee and add any material/labour costs after visiting the site."
              : "Add materials, labour costs, and notes to send a detailed estimate to the customer."
            }
          </p>
        </div>
        <button
          onClick={() => setShowQuoteSheet(true)}
          className={`mt-2 flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg active:scale-[0.98] transition-all ${
            job.category === "inspection"
              ? "bg-[hsl(25,90%,55%)] text-white shadow-orange-500/20"
              : "bg-primary text-primary-foreground shadow-primary/20"
          }`}
        >
          <FileText className="h-4 w-4" />
          {job.category === "inspection" ? "Create Inspection Quote" : "Create Estimate"}
        </button>
      </div>
    );
  };

  const renderAttachmentsTab = () => {
    const hasPhotos = job.media?.photos && job.media.photos.length > 0;
    const hasVoice = !!job.media?.voiceNote;

    if (!hasPhotos && !hasVoice) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
            <Image className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">No attachments</p>
          <p className="text-xs text-muted-foreground">The customer hasn't added any photos or voice notes</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 pb-4">
        {hasVoice && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Voice Note</h3>
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
                <span className="text-[10px] font-bold text-primary font-mono">{job.media!.voiceNote!.duration}</span>
              </div>
            </div>
          </div>
        )}

        {hasPhotos && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">
              Photos ({job.media!.photos!.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {job.media!.photos!.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-[20px] overflow-hidden border border-border shadow-sm group">
                  <img src={photo} alt={`Job photo ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    switch (job.category) {
      case "fixed":
        return (
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            <button
              onClick={() => handleAction("decline")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => handleAction("accept")}
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
              onClick={() => handleAction("decline")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => {
                setActiveTab("quotes");
                setShowQuoteSheet(true);
              }}
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
              onClick={() => handleAction("decline")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => {
                setActiveTab("quotes");
                setShowQuoteSheet(true);
              }}
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
    <MobileLayout role="trader" hideNav>
      <div className="flex h-full flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <button
              onClick={() => navigate("/trader/jobs")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70 transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground truncate">{job.title}</h1>
              <p className="text-[11px] text-muted-foreground">{job.customer.name} · {job.distance}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.className}`}>
              {cat.emoji} {cat.label}
            </span>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 px-4 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-y-auto px-4 pt-4">
          {activeTab === "details" && renderDetailsTab()}
          {activeTab === "quotes" && renderQuotesTab()}
          {activeTab === "attachments" && renderAttachmentsTab()}
        </ScrollArea>

        {/* Footer CTA */}
        {activeTab === "details" && renderFooter()}
      </div>

      {/* Quote Sheet */}
      {showQuotesTab && (
        <QuoteSheet
          isOpen={showQuoteSheet}
          onOpenChange={setShowQuoteSheet}
          category={job.category as "estimate" | "inspection"}
          jobTitle={job.title}
          onSubmit={handleQuoteSubmit}
        />
      )}
    </MobileLayout>
  );
};

export default JobDetail;
