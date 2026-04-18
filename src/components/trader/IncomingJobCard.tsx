import { MapPin, Clock, Camera, Calendar, ChevronLeft, ChevronRight, Heart, CalendarDays, Users, Building2 } from "lucide-react";
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
  proposalsCount?: number;
  /** Org/agency that forwarded this job to me. Adds a "via {org}" chip on the card. */
  viaOrg?: string;
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
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showCategoryBadge?: boolean;
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const IncomingJobCard = ({ job, onViewDetail, viewMode = "individual", onRequestPhotos, onShowSchedule, isSaved = false, onToggleSave, showCategoryBadge = true }: IncomingJobCardProps) => {
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
      {/* Photo area — reduced height */}
      <div className="relative w-full h-[110px] bg-muted/30">
        {hasPhotos ? (
          <>
            <img
              src={photos[photoIndex]}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length); }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/50 text-background active:bg-foreground/70 opacity-5"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/50 text-background active:bg-foreground/70 opacity-5"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1">
                  {photos.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === photoIndex ? "w-3 bg-background" : "w-1 bg-background/50"}`} />
                  ))}
                </div>
              </>
            )}
            {/* Top-left stickers */}
            <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-1">
              {job.proposalsCount !== undefined && (
                <div className="flex items-center gap-1 rounded-md bg-foreground/60 px-1.5 py-0.5 text-[9px] font-bold text-background backdrop-blur-md shadow-sm">
                  <Users className="h-2.5 w-2.5" />
                  {job.proposalsCount} Proposals
                </div>
              )}
            </div>
            
            {/* Bottom-right photo count sticker */}
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 text-[9px] font-bold text-foreground backdrop-blur-sm shadow-sm ring-1 ring-background/10">
              <Camera className="h-2.5 w-2.5" />
              {photos.length}
            </div>
          </>
        ) : (
          <div className="relative flex items-center justify-center h-full bg-muted/20">
            {job.proposalsCount !== undefined && (
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-foreground/60 px-1.5 py-0.5 text-[9px] font-bold text-background backdrop-blur-md shadow-sm">
                <Users className="h-2.5 w-2.5" />
                {job.proposalsCount} Proposals
              </div>
            )}
            <img src={noPhotoPlaceholder} alt="No photo" className="h-14 w-14 object-contain opacity-30" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoRequested(true);
                onRequestPhotos?.(job.id);
              }}
              disabled={photoRequested}
              className="absolute bottom-2 inset-x-3 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold active:opacity-80 disabled:opacity-50 bg-card border border-primary text-primary mx-[93px]"
            >
              <Camera className="h-3 w-3" />
              {photoRequested ? "Request Sent" : "Request Photos"}
            </button>
          </div>
        )}

        {/* Favorite & Category badges */}
        <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1.5">
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/40 backdrop-blur-sm active:scale-90 transition-transform shadow-sm"
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-red-500 text-red-500" : "text-background"}`} />
            </button>
          )}
          {showCategoryBadge && cat && (
            <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm ${cat.className} bg-opacity-90 shadow-sm whitespace-nowrap opacity-0`}>
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>

      </div>

      {/* Info section */}
      <div className="px-3 pt-2 pb-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-[13px] font-bold text-foreground leading-tight truncate">{job.title}</h4>
          </div>
          {job.price ? (
            <span className="font-extrabold text-primary text-[15px] shrink-0">£{job.price}</span>
          ) : job.inspectionFee ? (
            <span className="font-bold text-[hsl(25,90%,55%)] text-[13px] shrink-0">£{job.inspectionFee} <span className="text-[9px] font-medium">inspect</span></span>
          ) : (
            <span className="font-bold text-blue-600 text-[11px] shrink-0">Quote TBD</span>
          )}
        </div>

        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{job.customer} · {job.location}</p>

        {/* Metrics row */}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {estDuration && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary rounded-md px-1.5 py-0.5">
              <Clock className="h-2.5 w-2.5" />{estDuration}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary rounded-md px-1.5 py-0.5">
            <MapPin className="h-2.5 w-2.5" />{job.distance}
          </span>
          <span className="ml-auto text-[9px] text-muted-foreground/50">{job.postedAgo || "Just now"}</span>
        </div>
      </div>

      {/* Schedule footer */}
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-1.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
          <Calendar className="h-3 w-3 text-primary" />
          {job.timeWindow}
        </span>
        {onShowSchedule && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowSchedule(job);
            }}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary active:bg-primary/20 transition-colors"
          >
            <CalendarDays className="h-3 w-3" />
            My Schedule
          </button>
        )}
      </div>
    </div>
  );
};

export default IncomingJobCard;
