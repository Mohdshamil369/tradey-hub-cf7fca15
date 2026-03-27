import { MapPin, Clock, Eye, Camera, Calendar, Timer, PoundSterling, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export interface CustomerRequestMeta {
  photos?: string[];
  expectedDuration?: string;
  expectedBudget?: number;
}

export type JobCategory = "fixed" | "estimate" | "inspection";

export interface IncomingJobData {
  id: string;
  type: "catA" | "catB";
  category?: JobCategory;
  title: string;
  icon: string;
  customer: string;
  location: string;
  distance: string;
  price: number | null;
  timeWindow: string;
  estimatedDuration?: string;
  postedAgo: string;
  description: string;
  hasVoiceNote?: boolean;
  voiceDuration?: string;
  customerRequest?: CustomerRequestMeta;
  inspectionFee?: number;
}

export type JobCardViewMode = "individual" | "agency" | "agency-worker";

interface IncomingJobCardProps {
  job: IncomingJobData;
  onViewDetail: () => void;
  viewMode?: JobCardViewMode;
  onRequestPhotos?: (id: string) => void;
  /** Worker's existing schedule items near this job's time */
  nearbySchedule?: { time: string; title: string }[];
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const IncomingJobCard = ({ job, onViewDetail, viewMode = "individual", onRequestPhotos, nearbySchedule }: IncomingJobCardProps) => {
  const cat = job.category ? categoryConfig[job.category] : null;
  const photos = job.customerRequest?.photos?.filter(p => p && p !== "/placeholder.svg") ?? [];
  const hasPhotos = photos.length > 0;
  const estDuration = job.customerRequest?.expectedDuration || job.estimatedDuration;
  const estBudget = job.customerRequest?.expectedBudget;
  const [photoRequested, setPhotoRequested] = useState(false);

  return (
    <div
      className="rounded-2xl bg-card overflow-hidden border border-border"
    >
      {/* Title row */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl">
            {job.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[14px] font-bold text-foreground leading-snug truncate">{job.title}</h4>
              {cat && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${cat.className}`}>
                  {cat.emoji} {cat.label}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground truncate">{job.customer} · {job.location}</p>
          </div>
        </div>
      </div>

      {/* Photo area */}
      <div className="mx-4 mb-2.5 relative rounded-xl overflow-hidden bg-muted border border-border h-[120px]">
        {hasPhotos ? (
          <div className="flex h-full">
            {photos.slice(0, 3).map((src, i) => (
              <img key={i} src={src} alt="" className="h-full flex-1 object-cover" />
            ))}
            {photos.length > 3 && (
              <div className="absolute right-2 top-2 rounded-lg bg-foreground/70 px-2 py-0.5 text-[10px] font-bold text-background">
                +{photos.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1.5">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-[10px] text-muted-foreground/50 font-medium">No photos available</p>
          </div>
        )}
        {/* Request Photos button */}
        {!hasPhotos && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPhotoRequested(true);
              onRequestPhotos?.(job.id);
            }}
            disabled={photoRequested}
            className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-foreground/80 px-2.5 py-1.5 text-[10px] font-bold text-background backdrop-blur-sm active:opacity-80 disabled:opacity-50"
          >
            <Camera className="h-3 w-3" />
            {photoRequested ? "Requested" : "Request Photos"}
          </button>
        )}
      </div>

      {/* Details grid */}
      <div className="mx-4 mb-2.5 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-border bg-border">
        {/* Price / Quote */}
        <div className="bg-card flex flex-col items-center justify-center py-2.5 px-1">
          {job.price ? (
            <>
              <span className="text-[14px] font-extrabold text-primary">£{job.price}</span>
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Fixed Price</span>
            </>
          ) : job.inspectionFee ? (
            <>
              <span className="text-[13px] font-bold text-[hsl(25,90%,55%)]">£{job.inspectionFee}</span>
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Inspection</span>
            </>
          ) : (
            <>
              <span className="text-[12px] font-bold text-blue-600">TBD</span>
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Quote Req.</span>
            </>
          )}
        </div>
        {/* Est. Duration */}
        <div className="bg-card flex flex-col items-center justify-center py-2.5 px-1">
          <span className="text-[12px] font-bold text-foreground">{estDuration || "—"}</span>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Est. Duration</span>
        </div>
        {/* Distance */}
        <div className="bg-card flex flex-col items-center justify-center py-2.5 px-1">
          <span className="text-[12px] font-bold text-foreground">{job.distance}</span>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Distance</span>
        </div>
      </div>

      {/* Secondary details row */}
      <div className="mx-4 mb-2.5 grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-border bg-border">
        <div className="bg-card flex items-center gap-2 py-2 px-3">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">{job.timeWindow}</p>
            <p className="text-[9px] text-muted-foreground">Requested Time</p>
          </div>
        </div>
        <div className="bg-card flex items-center gap-2 py-2 px-3">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">{job.location}</p>
            <p className="text-[9px] text-muted-foreground">Location</p>
          </div>
        </div>
      </div>

      {estBudget && (
        <div className="mx-4 mb-2.5 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <PoundSterling className="h-3.5 w-3.5 text-muted-foreground/70" />
          <p className="text-[11px] text-muted-foreground">
            Customer budget: <span className="font-bold text-foreground">£{estBudget}</span>
          </p>
        </div>
      )}

      {/* Nearby schedule — helps worker plan */}
      {nearbySchedule && nearbySchedule.length > 0 && (
        <div className="mx-4 mb-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-[10px] font-bold text-primary mb-1.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Your Nearby Schedule
          </p>
          <div className="flex flex-col gap-1">
            {nearbySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="font-semibold text-foreground w-[90px] shrink-0">{s.time}</span>
                <span className="text-muted-foreground truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer — View CTA */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{job.postedAgo || "Just now"}</span>
        </div>
        <button
          onClick={onViewDetail}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-[0.97] transition-transform"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </div>
    </div>
  );
};

export default IncomingJobCard;
