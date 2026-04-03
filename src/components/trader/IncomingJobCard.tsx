import { MapPin, Clock, Eye, Camera, Calendar, PoundSterling, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";

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
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <div
      className="rounded-2xl bg-card overflow-hidden border border-border card-shadow transition-all active:scale-[0.99]"
      onClick={onViewDetail}
    >
      {/* Photo area on top — full width */}
      <div className="relative w-full h-[160px] bg-muted/30">
        {hasPhotos ? (
          <>
            <img
              src={photos[photoIndex]}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Carousel controls */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/50 text-background active:bg-foreground/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/50 text-background active:bg-foreground/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                  {photos.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-4 bg-background" : "w-1.5 bg-background/50"}`} />
                  ))}
                </div>
              </>
            )}
            {/* Photo count badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-foreground/60 px-2 py-1 text-[10px] font-bold text-background">
              <Camera className="h-3 w-3" />
              {photos.length}
            </div>
            {/* Request more photos when only 1-2 */}
            {photos.length <= 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoRequested(true);
                  onRequestPhotos?.(job.id);
                }}
                disabled={photoRequested}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-foreground/70 px-2 py-1 text-[9px] font-bold text-background active:opacity-80 disabled:opacity-50"
              >
                <Camera className="h-3 w-3" />
                {photoRequested ? "Requested" : "More Photos"}
              </button>
            )}
          </>
        ) : (
          <div className="relative flex items-center justify-center h-full bg-muted/20">
            <img src={noPhotoPlaceholder} alt="No photo" className="h-20 w-20 object-contain opacity-30" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoRequested(true);
                onRequestPhotos?.(job.id);
              }}
              disabled={photoRequested}
              className="absolute bottom-3 inset-x-4 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold active:opacity-80 disabled:opacity-50 bg-card text-primary"
            >
              <Camera className="h-3.5 w-3.5 text-primary" />
              {photoRequested ? "Request Sent" : "Request Photos"}
            </button>
          </div>
        )}
        {/* Category badge over photo */}
        {cat && (
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur-sm ${cat.className} bg-opacity-90`}>
              {cat.emoji} {cat.label}
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{job.icon}</span>
            <h4 className="text-[15px] font-bold text-foreground leading-snug truncate">{job.title}</h4>
          </div>
          {job.price ? (
            <span className="font-extrabold text-primary text-[16px] shrink-0">£{job.price}</span>
          ) : job.inspectionFee ? (
            <span className="font-bold text-[hsl(25,90%,55%)] text-[14px] shrink-0">£{job.inspectionFee} <span className="text-[10px] font-medium">inspect</span></span>
          ) : (
            <span className="font-bold text-blue-600 text-[12px] shrink-0">Quote TBD</span>
          )}
        </div>

        <p className="mt-1 text-[12px] text-muted-foreground">{job.customer} · {job.location}</p>

        {/* Description preview */}
        <p className="mt-2 text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">{job.description}</p>

        {/* Metrics row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {estDuration && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary rounded-lg px-2 py-1">
              <Clock className="h-3 w-3" />{estDuration}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary rounded-lg px-2 py-1">
            <MapPin className="h-3 w-3" />{job.distance}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary rounded-lg px-2 py-1">
            <Calendar className="h-3 w-3" />{job.timeWindow}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {onShowSchedule && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowSchedule(job);
              }}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground active:opacity-70"
            >
              <Clock className="h-3 w-3" />
              My Schedule
            </button>
          )}
          <span className="text-[10px] text-muted-foreground/60">{job.postedAgo || "Just now"}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground active:scale-[0.97] transition-transform"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default IncomingJobCard;
