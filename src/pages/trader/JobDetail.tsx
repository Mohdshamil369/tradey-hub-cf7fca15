import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ArrowLeft, MapPin, Clock, Star, Play, Info, ChevronRight, ChevronLeft,
  ShieldCheck, Timer, MessageCircle, XCircle, FileText, StickyNote,
  Image, Mic, ClipboardList, Package, Wrench, Ban, RotateCcw, Plus, Sparkles,
  Camera, Calendar, User, Briefcase, Heart, Share2,
  Image as ImageIcon,
} from "lucide-react";
import Avatar from "boring-avatars";
import { toast } from "sonner";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";
import QuoteSheet, { type QuoteSheetData } from "@/components/trader/QuoteSheet";
import JobNotesTab from "@/components/trader/form-builder/JobNotesTab";

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
  status?: string;
  committedStatus?: string;
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
  jobRating?: number;
  jobReview?: string;
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
  const [activeTab, setActiveTab] = useState<"details" | "quotes" | "attachments" | "notes">(initialTab as any);
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);
  const [showQuoteOptions, setShowQuoteOptions] = useState(false);
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<"fixed" | "estimate" | "inspection">("estimate");
  const [heroIndex, setHeroIndex] = useState(0);

  const stored = sessionStorage.getItem(`job_detail_${jobId}`);
  const job: JobDetailPageData | null = stored ? JSON.parse(stored) : null;

  if (!job) {
    return (
      <MobileLayout role="trader">
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-muted-foreground">Job not found</p>
          <button onClick={() => navigate("/trader/jobs")} className="text-sm font-bold text-primary">Back to Jobs</button>
        </div>
      </MobileLayout>
    );
  }

  const cat = categoryConfig[job.category];
  const showQuotesTab = job.category !== "fixed";
  const photos = job.media?.photos?.filter(p => p && p !== "/placeholder.svg") ?? [];
  const hasPhotos = photos.length > 0;
  const hasVoice = !!job.media?.voiceNote;
  const isCommitted = !!job.committedStatus;
  const hasAttachments = hasPhotos || hasVoice || isCommitted;

  const tabs: { key: "details" | "quotes" | "attachments"; label: string; icon: any }[] = [
    { key: "details", label: "Details", icon: ClipboardList },
    ...(showQuotesTab ? [{ key: "quotes" as const, label: "Quote", icon: FileText }] : []),
    ...(hasAttachments ? [{ key: "attachments" as const, label: "Attachments", icon: Image }] : []),
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
    toast.success("Quote sent successfully!");
    setShowQuoteSheet(false);
    navigate("/trader/jobs");
  };

  const renderDetailsTab = () => {
    const isCompleted = job.status === "completed" || job.committedStatus === "completed";

    return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Completed Status / Rating Header */}
      {isCompleted && (
        <div className="rounded-2xl bg-[hsl(142,70%,45%)]/5 border border-[hsl(142,70%,45%)]/20 p-5 mb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center text-[hsl(142,70%,45%)]">
                 <CheckCircle2 className="h-4 w-4" />
               </div>
               <span className="text-[14px] font-bold text-[hsl(142,70%,45%)]">Job Completed</span>
            </div>
            {job.jobRating && (
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-border/40 text-sm font-bold">
                <Star className="h-3.5 w-3.5 fill-[#fab005] text-[#fab005]" />
                {job.jobRating.toFixed(1)}
              </div>
            )}
          </div>
          
          {job.jobReview ? (
            <div className="bg-white rounded-xl p-4 border border-border/30 relative">
               <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Customer Feedback</div>
               <p className="text-[12px] text-foreground italic leading-relaxed">"{job.jobReview}"</p>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center">No feedback provided yet by the customer.</p>
          )}
        </div>
      )}

      {/* Title + Category + Price */}
      <div className="px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cat.className}`}>
            {cat.emoji} {cat.label}
          </span>
          {job.postedAgo && <span className="text-[10px] text-muted-foreground">{job.postedAgo}</span>}
        </div>
        <h2 className="text-lg font-bold text-foreground leading-tight">{job.title}</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3" />{job.location}
        </p>
      </div>

      {/* Key metrics — 3 column grid */}
      <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-border/30 bg-border/20">
        <div className="bg-card flex flex-col items-center py-3">
          {job.price ? (
            <>
              <span className="text-[15px] font-extrabold text-primary">£{job.price}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Fixed Price</span>
            </>
          ) : job.inspectionFee ? (
            <>
              <span className="text-[14px] font-bold text-[hsl(25,90%,55%)]">£{job.inspectionFee}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Inspection</span>
            </>
          ) : (
            <>
              <span className="text-[13px] font-bold text-blue-600">TBD</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Quote Req.</span>
            </>
          )}
        </div>
        <div className="bg-card flex flex-col items-center py-3">
          <span className="text-[13px] font-bold text-foreground">{job.distance}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">Distance</span>
        </div>
        <div className="bg-card flex flex-col items-center py-3">
          <span className="text-[12px] font-bold text-foreground">{job.timeWindow.split(",")[0] || "—"}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">Schedule</span>
        </div>
      </div>

      {/* Overview section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2 px-1">Overview</h3>
        <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-border/30 bg-border/20">
          <div className="bg-card flex items-center gap-2.5 px-3 py-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground/50" />
            <div>
              <p className="text-[11px] font-semibold text-foreground">{job.timeWindow}</p>
              <p className="text-[9px] text-muted-foreground">Time Window</p>
            </div>
          </div>
          <div className="bg-card flex items-center gap-2.5 px-3 py-2.5">
            <MapPin className="h-4 w-4 text-muted-foreground/50" />
            <div>
              <p className="text-[11px] font-semibold text-foreground truncate">{job.location}</p>
              <p className="text-[9px] text-muted-foreground">Location</p>
            </div>
          </div>
          <div className="bg-card flex items-center gap-2.5 px-3 py-2.5">
            <Timer className="h-4 w-4 text-muted-foreground/50" />
            <div>
              <p className="text-[11px] font-semibold text-foreground">{job.distance}</p>
              <p className="text-[9px] text-muted-foreground">From You</p>
            </div>
          </div>
          <div className="bg-card flex items-center gap-2.5 px-3 py-2.5">
            <Briefcase className="h-4 w-4 text-muted-foreground/50" />
            <div>
              <p className="text-[11px] font-semibold text-foreground">{job.category === "fixed" ? "Immediate" : "Flexible"}</p>
              <p className="text-[9px] text-muted-foreground">Availability</p>
            </div>
          </div>
        </div>
      </div>


      {/* Job Description */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2 px-1">Description</h3>
        <div className="rounded-xl bg-card p-4 border border-border/30">
          <p className="text-[12px] text-foreground leading-relaxed">{job.description}</p>
        </div>
      </div>

      {/* Customer */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2 px-1">Customer</h3>
        <div className="rounded-xl bg-card border border-border/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-background">
                <Avatar name={job.customer.name} variant="beam" size={40} colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-[13px] font-bold text-foreground">{job.customer.name}</h3>
                  {job.customer.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground">Since {job.customer.memberSince}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 justify-end">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-bold text-foreground">{job.customer.rating}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{job.customer.reviews} reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-border/20 border-t border-border/30">
            <div className="bg-card py-2.5 text-center">
              <p className="text-[12px] font-bold text-foreground">{job.customer.jobsCompleted ?? 12}</p>
              <p className="text-[8px] text-muted-foreground">Jobs Done</p>
            </div>
            <div className="bg-card py-2.5 text-center">
              <p className="text-[12px] font-bold text-foreground">{job.customer.responseRate ?? "95%"}</p>
              <p className="text-[8px] text-muted-foreground">Response</p>
            </div>
            <div className="bg-card py-2.5 text-center">
              <p className="text-[12px] font-bold text-foreground">{job.customer.repeatHireRate ?? "40%"}</p>
              <p className="text-[8px] text-muted-foreground">Repeat Hire</p>
            </div>
          </div>

          {job.customer.recentReview && (
            <div className="border-t border-border/30 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex">
                  {Array.from({ length: job.customer.recentReview.rating }).map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-[9px] text-muted-foreground">by {job.customer.recentReview.workerName}</span>
              </div>
              <p className="text-[10px] text-foreground leading-relaxed">"{job.customer.recentReview.text}"</p>
            </div>
          )}

          <div className="flex gap-2 px-4 py-3 border-t border-border/30">
            <button
              onClick={() => toast.info("Full customer profile coming soon")}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted/50 border border-border/30 py-2 text-[10px] font-bold text-foreground active:bg-muted"
            >
              <Info className="h-3 w-3" /> Full Profile
            </button>
            <button
              onClick={() => toast.info("Chat feature coming soon!")}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted/50 border border-border/30 py-2 text-[10px] font-bold text-foreground active:bg-muted"
            >
              <MessageCircle className="h-3 w-3" /> Message
            </button>
          </div>
        </div>
      </div>

      {/* Secure payment */}
      <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/30 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] font-bold text-foreground">Tradey Secure</p>
          <p className="text-[9px] text-muted-foreground">Payment protected & insured</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
      </div>
    </div>
  );

  const renderQuotesTab = () => {
    if (job.quote) {
      const q = job.quote;
      const materialsTotal = q.materials ? q.materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0) : 0;
      const labourTotal = (q.labourHours ?? 0) * (q.labourRate ?? 0);
      const isPending = q.status === "pending";
      const isWithdrawable = q.status === "pending" || q.status === "accepted";

      return (
        <div className="flex flex-col gap-4 pb-4">
          {/* Status Banner */}
          <div className={`rounded-xl p-4 border ${
            q.status === "pending" ? "bg-[hsl(25,90%,55%)]/5 border-[hsl(25,90%,55%)]/20" :
            q.status === "accepted" ? "bg-[hsl(142,70%,45%)]/5 border-[hsl(142,70%,45%)]/20" :
            q.status === "declined" ? "bg-destructive/5 border-destructive/20" :
            "bg-muted/50 border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Quote Status</p>
                <p className={`mt-1 text-sm font-bold ${
                  q.status === "pending" ? "text-[hsl(25,90%,55%)]" :
                  q.status === "accepted" ? "text-[hsl(142,70%,45%)]" :
                  q.status === "declined" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {q.status === "pending" ? "Awaiting Response" : q.status === "accepted" ? "Accepted" : q.status === "declined" ? "Declined" : "Expired"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sent {q.sentAt}</p>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£{q.total.toFixed(0)}</p>
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Package className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Materials ({q.materialsCount})</h3>
            </div>
            {q.materials && q.materials.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {q.materials.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/30 bg-card px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{item.description || `Item ${idx + 1}`}</p>
                        <p className="text-[10px] text-muted-foreground">{item.quantity} × £{item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="text-[12px] font-bold text-foreground">£{(item.quantity * item.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Subtotal</p>
                  <p className="text-[12px] font-bold text-foreground">£{materialsTotal.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/30 bg-muted/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{q.materialsCount} items included</p>
              </div>
            )}
          </div>

          {/* Labour */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Wrench className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Labour</h3>
            </div>
            {q.labourTypes && q.labourTypes.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {q.labourTypes.map((line, index) => (
                  <div key={index} className="rounded-xl border border-border/30 bg-card px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{line.role}</p>
                        <p className="text-[10px] text-muted-foreground">{line.count}× {line.hours}h @ £{line.rate}/hr</p>
                      </div>
                      <p className="text-[12px] font-bold text-foreground">£{(line.count * line.hours * line.rate).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/30 bg-card px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">Labour</p>
                    <p className="text-[10px] text-muted-foreground">{q.labourHours ?? 0}h @ £{q.labourRate ?? 0}/hr</p>
                  </div>
                  <p className="text-[12px] font-bold text-foreground">£{labourTotal.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Total Quote</span>
              <span className="text-xl font-extrabold text-primary">£{q.total.toFixed(2)}</span>
            </div>
          </div>

          {q.assignedTo && typeof q.assignedTo === "object" && "name" in q.assignedTo && (
            <div className="rounded-xl border border-border/30 bg-card px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground mb-1">Assigned To</p>
              <p className="text-[11px] font-semibold text-foreground">{(q.assignedTo as any).name}</p>
              <p className="text-[10px] text-muted-foreground">{(q.assignedTo as any).type} • {(q.assignedTo as any).memberCount} members</p>
            </div>
          )}

          {q.message && (
            <div className="rounded-xl border border-border/30 bg-card px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground mb-1">Notes</p>
              <p className="text-[11px] text-foreground leading-relaxed">{q.message}</p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2 mt-1">
            {isWithdrawable && (
              <button
                onClick={() => { toast("Quote withdrawn"); navigate("/trader/jobs"); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3 text-[12px] font-bold text-destructive active:scale-[0.98] transition-all"
              >
                <Ban className="h-3.5 w-3.5" /> Withdraw Quote
              </button>
            )}
            <button
              onClick={() => setShowQuoteSheet(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Create New Quote
            </button>
          </div>
        </div>
      );
    }

    // Read only view for completed jobs
    if (job.status === "completed" || job.committedStatus === "completed") {
      return (
        <div className="flex flex-col gap-6 py-4">
           <div className="rounded-xl bg-muted/20 border border-border/30 p-5 text-center">
              <h4 className="text-[13px] font-extrabold text-foreground mb-1">Price History</h4>
              <p className="text-[11px] text-muted-foreground">Original agreed price for this job</p>
              <div className="mt-4 text-3xl font-black text-foreground">£{job.price ? job.price.toFixed(0) : "0"}</div>
           </div>
           
           <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground px-1">Timeline</h3>
              <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
                 <div className="px-4 py-3 flex items-center justify-between border-b border-border/20">
                    <span className="text-[11px] text-muted-foreground">Posted</span>
                    <span className="text-[11px] font-bold text-foreground">{job.postedAgo || "5 days ago"}</span>
                 </div>
                 <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Completed</span>
                    <span className="text-[11px] font-bold text-foreground">{(job as any).completedDate || "Just now"}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => toast.info("Dispute center coming soon")}
             className="text-[11px] font-bold text-primary text-center underline underline-offset-4 active:opacity-60"
           >
              Having issues? Contact Resolution Center
           </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
          <FileText className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground mb-1">
            {job.category === "inspection" ? "Create Inspection Quote" : "Create an Estimate"}
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto">
            {job.category === "inspection"
              ? "Set your inspection fee and add any material/labour costs after visiting the site."
              : "Add materials, labour costs, and notes to send a detailed estimate to the customer."}
          </p>
        </div>
        <button
          onClick={() => setShowQuoteSheet(true)}
          className={`mt-2 flex items-center gap-2 rounded-xl px-5 py-3 text-[12px] font-bold shadow-lg active:scale-[0.98] transition-all ${
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
    if (!hasPhotos && !hasVoice && !isCommitted) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
            <Image className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">No attachments</p>
          <p className="text-[11px] text-muted-foreground">No photos, voice notes, or internal notes available.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 pb-4">
        {/* Voice note */}
        {hasVoice && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2 px-1">Voice Note</h3>
            <div className="rounded-xl bg-primary/5 p-3 border border-primary/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.info("Playing voice note...")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md active:scale-95 transition-transform"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground">Customer Voice Message</p>
                  <div className="flex items-center gap-0.5 h-4 mt-0.5">
                    {[4, 7, 3, 9, 6, 8, 4, 7, 5, 8, 3, 6, 9, 4, 7].map((h, i) => (
                      <div key={i} className="flex-1 rounded-full bg-primary/30" style={{ height: `${h * 1.5}px` }} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary font-mono">{job.media!.voiceNote!.duration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Photos grid would go here if implemented in this component */}

        {/* Internal Notes */}
        {isCommitted && (
          <div className="mt-2 border-t border-border/30 pt-4">
             <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-4 px-1">Notes [internal]</h3>
             <JobNotesTab jobId={job.id} isInline={true} />
          </div>
        )}

      </div>
    );
  };

  const quoteOptions = (() => {
    const recommended = job.category;
    const options = [
      {
        key: "fixed" as const,
        label: "Pick Up Job",
        description: "Accept the job at the customer's fixed price",
        icon: Package,
        price: job.price,
      },
      {
        key: "estimate" as const,
        label: "Generate Estimate",
        description: "Send a detailed cost breakdown for the work",
        icon: FileText,
      },
      {
        key: "inspection" as const,
        label: "Generate Inspection Quote",
        description: "Propose an on-site inspection before quoting",
        icon: ClipboardList,
      },
    ];
    return options.map((o) => ({ ...o, isRecommended: o.key === recommended }));
  })();

  const handleQuoteOptionSelect = (key: "fixed" | "estimate" | "inspection") => {
    setShowQuoteOptions(false);
    if (key === "fixed") {
      handleAction("accept");
    } else {
      setSelectedQuoteCategory(key);
      setActiveTab("quotes");
      setShowQuoteSheet(true);
    }
  };

  const renderFooter = () => {
    const isCompleted = job.status === "completed" || job.committedStatus === "completed";
    
    if (isCompleted) {
      return (
        <div className="p-4 bg-background border-t border-border/40">
           <button
             onClick={() => toast.info("Viewing invoice feature coming soon")}
             className="w-full py-4 bg-black text-white rounded-2xl text-[14px] font-bold active:scale-95 transition-all shadow-md"
           >
             View Invoice & Receipt
           </button>
        </div>
      );
    }

    return (
      <div className="flex gap-3 p-4 bg-background border-t border-border/40">
        <button
          onClick={() => handleAction("decline")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted"
        >
          <XCircle className="h-4 w-4" /> Decline
        </button>
        <button
          onClick={() => setShowQuoteOptions(true)}
          className="flex-[2] rounded-xl bg-primary py-3.5 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <FileText className="h-4 w-4" /> Generate Quote
        </button>
      </div>
    );
  };

  return (
    <MobileLayout role="trader" hideNav>
      <div className="flex h-full flex-col">
        {/* Hero Image / Header area */}
        <div className="relative bg-muted/30 shrink-0">
          {/* Back + actions overlay */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 pt-3">
            <button
              onClick={() => navigate("/trader/jobs")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm active:bg-background shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const shareData = {
                    title: job.title,
                    text: `Check out this job: ${job.title} — ${job.location}`,
                    url: window.location.href,
                  };
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch (err) {
                      // User cancelled or share failed silently
                    }
                  } else {
                    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                    toast.success("Link copied to clipboard!");
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm active:bg-background"
              >
                <Share2 className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={() => toast.success("Job saved!")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm active:bg-background"
              >
                <Heart className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>

          {hasPhotos ? (
            <div className="relative h-[200px]">
              <img
                src={photos[heroIndex]}
                alt={job.title}
                className="h-full w-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setHeroIndex(i => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/40 text-background active:bg-foreground/60"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setHeroIndex(i => (i + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/40 text-background active:bg-foreground/60"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                    {photos.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === heroIndex ? "w-4 bg-background" : "w-1.5 bg-background/50"}`} />
                    ))}
                  </div>
                </>
              )}
              {/* Photo count + request more */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                {photos.length <= 2 && (
                  <button
                    onClick={() => toast.success("Photo request sent to customer!")}
                    className="rounded-lg bg-foreground/60 px-2 py-0.5 text-[9px] font-bold text-background backdrop-blur-sm active:opacity-80 flex items-center gap-1"
                  >
                    <Camera className="h-2.5 w-2.5" /> More Photos
                  </button>
                )}
                <div className="rounded-lg bg-foreground/60 px-2 py-0.5 text-[9px] font-bold text-background backdrop-blur-sm">
                  {heroIndex + 1}/{photos.length}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[180px] flex items-center justify-center">
              <img src={noPhotoPlaceholder} alt="No photo" className="h-full w-full object-contain opacity-30 p-6" />
              <button
                onClick={() => toast.success("Photo request sent!")}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-lg bg-foreground/70 px-3 py-1.5 text-[10px] font-bold text-background backdrop-blur-sm active:opacity-80"
              >
                <Camera className="h-3.5 w-3.5" /> Request Photos
              </button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        {tabs.length > 1 && (
          <div className="flex gap-1 px-4 py-2 border-b border-border/30 bg-background">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1 overflow-y-auto px-4 pt-4">
          {activeTab === "details" && renderDetailsTab()}
          {activeTab === "quotes" && renderQuotesTab()}
          {activeTab === "attachments" && renderAttachmentsTab()}
        </ScrollArea>

        {/* Footer CTA */}
        {activeTab === "details" && renderFooter()}
      </div>

      {/* Quote Options Bottom Sheet */}
      <Sheet open={showQuoteOptions} onOpenChange={setShowQuoteOptions}>
        <SheetContent side="bottom" className="rounded-t-[32px] px-4 pb-8 pt-2 sm:max-w-[420px] sm:mx-auto">
          <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          <h3 className="text-base font-bold text-foreground mb-1">Choose Quote Type</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Select how you'd like to respond to this job
          </p>
          <div className="flex flex-col gap-2.5">
            {quoteOptions
              .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))
              .map((option) => (
              <button
                key={option.key}
                onClick={() => handleQuoteOptionSelect(option.key)}
                className={`relative flex items-start gap-3 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] ${
                  option.isRecommended
                    ? "bg-primary/5 border-2 border-primary/30 shadow-sm"
                    : "bg-muted/50 border border-border/50"
                }`}
              >
                {option.isRecommended && (
                  <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow-sm">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </span>
                )}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  option.isRecommended ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-foreground">{option.label}</span>
                    {option.price && (
                      <span className="text-[11px] font-bold text-primary">£{option.price}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-1" />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <QuoteSheet
        isOpen={showQuoteSheet}
        onOpenChange={setShowQuoteSheet}
        category={selectedQuoteCategory as "estimate" | "inspection"}
        jobTitle={job.title}
        onSubmit={handleQuoteSubmit}
      />
    </MobileLayout>
  );
};

export default JobDetail;
