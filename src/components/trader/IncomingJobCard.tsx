import { MapPin, Clock, Eye, Camera, Calendar, PoundSterling, Image as ImageIcon } from "lucide-react";
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

export interface NearbyScheduleItem {
  time: string;
  title: string;
  location?: string;
  distanceFromJob?: string;
  driveTime?: string;
}

interface IncomingJobCardProps {
  job: IncomingJobData;
  onViewDetail: () => void;
  viewMode?: JobCardViewMode;
  onRequestPhotos?: (id: string) => void;
  onShowSchedule?: (job: IncomingJobData) => void;
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const IncomingJobCard = ({ job, onViewDetail, viewMode = "individual", onRequestPhotos, onShowSchedule }: IncomingJobCardProps) => {
  const cat = job.category ? categoryConfig[job.category] : null;
  const photos = job.customerRequest?.photos?.filter(p => p && p !== "/placeholder.svg") ?? [];
  const hasPhotos = photos.length > 0;
  const estDuration = job.customerRequest?.expectedDuration || job.estimatedDuration;
  const [photoRequested, setPhotoRequested] = useState(false);

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-border">
      {/* Photo + Info side by side */}
      <div className="flex gap-0">
        {/* Photo thumbnail */}
        <div className="relative w-[110px] shrink-0 min-h-[100px] bg-muted/40">
          {hasPhotos ? (
            <>
              <img src={photos[0]} alt="" className="h-full w-full object-cover" />
              {photos.length > 1 && (
                <span className="absolute top-1.5 right-1.5 rounded bg-foreground/60 px-1.5 py-0.5 text-[9px] font-bold text-background">
                  +{photos.length - 1}
                </span>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoRequested(true);
                  onRequestPhotos?.(job.id);
                }}
                disabled={photoRequested}
                className="flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-1 text-[8px] font-bold text-background active:opacity-80 disabled:opacity-50"
              >
                <Camera className="h-2.5 w-2.5" />
                {photoRequested ? "Sent" : "Request Photos"}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-3 py-2.5">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="text-[13px] font-bold text-foreground leading-snug truncate">{job.title}</h4>
            {cat && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold shrink-0 ${cat.className}`}>
                {cat.emoji} {cat.label}
              </span>
            )}
          </div>

          <p className="mt-0.5 text-[10.5px] text-muted-foreground truncate">{job.customer} · {job.location}</p>

          {/* Key metrics row */}
          <div className="mt-2 flex items-center gap-3 text-[10px]">
            {job.price ? (
              <span className="font-extrabold text-primary text-[13px]">£{job.price}</span>
            ) : job.inspectionFee ? (
              <span className="font-bold text-[hsl(25,90%,55%)] text-[12px]">£{job.inspectionFee} <span className="text-[9px] font-medium">inspect</span></span>
            ) : (
              <span className="font-bold text-blue-600 text-[11px]">Quote TBD</span>
            )}
            {estDuration && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-3 w-3" />{estDuration}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="h-3 w-3" />{job.distance}
            </span>
          </div>

          {/* Time window */}
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.timeWindow}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
        <div className="flex items-center gap-2">
          {onShowSchedule && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowSchedule(job);
              }}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2 py-1 text-[9px] font-semibold text-muted-foreground active:opacity-70"
            >
              <Clock className="h-2.5 w-2.5" />
              My Schedule
            </button>
          )}
          <span className="text-[10px] text-muted-foreground/60">{job.postedAgo || "Just now"}</span>
        </div>
        <button
          onClick={onViewDetail}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground active:scale-[0.97] transition-transform"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      </div>
    </div>
  );
};

export default IncomingJobCard;
