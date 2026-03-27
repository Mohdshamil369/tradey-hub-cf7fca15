import { MapPin, Clock, Eye, Camera, Calendar, PoundSterling, Image as ImageIcon, X, Car } from "lucide-react";
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
  nearbySchedule?: NearbyScheduleItem[];
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
  const [showSchedule, setShowSchedule] = useState(false);
  const hasSchedule = nearbySchedule && nearbySchedule.length > 0;

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-border relative">
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
      <div className="mx-4 mb-2.5 relative rounded-xl overflow-hidden bg-muted/50 border border-border/40 h-[120px]">
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
            <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-[10px] text-muted-foreground/40 font-medium">No photos available</p>
          </div>
        )}
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

      {/* Details grid — subtle dividers */}
      <div className="mx-4 mb-2.5 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-border/30 bg-border/30">
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
        <div className="bg-card flex flex-col items-center justify-center py-2.5 px-1">
          <span className="text-[12px] font-bold text-foreground">{estDuration || "—"}</span>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Est. Duration</span>
        </div>
        <div className="bg-card flex flex-col items-center justify-center py-2.5 px-1">
          <span className="text-[12px] font-bold text-foreground">{job.distance}</span>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Distance</span>
        </div>
      </div>

      {/* Secondary details — subtle dividers */}
      <div className="mx-4 mb-2.5 grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-border/30 bg-border/30">
        <div className="bg-card flex items-center gap-2 py-2 px-3">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">{job.timeWindow}</p>
            <p className="text-[9px] text-muted-foreground">Requested Time</p>
          </div>
        </div>
        <div className="bg-card flex items-center gap-2 py-2 px-3">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">{job.location}</p>
            <p className="text-[9px] text-muted-foreground">Location</p>
          </div>
        </div>
      </div>

      {estBudget && (
        <div className="mx-4 mb-2.5 flex items-center gap-2 rounded-xl border border-border/30 bg-card px-3 py-2">
          <PoundSterling className="h-3.5 w-3.5 text-muted-foreground/50" />
          <p className="text-[11px] text-muted-foreground">
            Customer budget: <span className="font-bold text-foreground">£{estBudget}</span>
          </p>
        </div>
      )}

      {/* Footer — Schedule button + View CTA */}
      <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {hasSchedule && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSchedule(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground active:opacity-70"
            >
              <Clock className="h-3 w-3" />
              My Schedule
            </button>
          )}
          <span className="text-[11px] text-muted-foreground">{job.postedAgo || "Just now"}</span>
        </div>
        <button
          onClick={onViewDetail}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-[0.97] transition-transform"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </div>

      {/* Schedule bottom sheet */}
      {showSchedule && (
        <>
          <div
            className="absolute inset-0 z-40 bg-foreground/40"
            onClick={() => setShowSchedule(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-background shadow-2xl border-t border-border/40 animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-sm font-bold text-foreground">Your Nearby Schedule</h3>
              <button onClick={() => setShowSchedule(false)} className="rounded-full p-1 active:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Job reference */}
            <div className="mx-5 mb-3 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2">
              <p className="text-[10px] font-bold text-primary mb-0.5">This Job</p>
              <p className="text-[11px] font-semibold text-foreground">{job.timeWindow} · {job.location}</p>
            </div>

            {/* Schedule items */}
            <div className="px-5 pb-6 flex flex-col gap-2 max-h-[260px] overflow-y-auto">
              {nearbySchedule!.map((s, i) => (
                <div key={i} className="rounded-xl border border-border/30 bg-card px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[12px] font-bold text-foreground">{s.title}</p>
                    <span className="text-[11px] font-semibold text-primary shrink-0">{s.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {s.location && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />{s.location}
                      </span>
                    )}
                    {s.distanceFromJob && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />{s.distanceFromJob} from this job
                      </span>
                    )}
                    {s.driveTime && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Car className="h-3 w-3" />{s.driveTime} drive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomingJobCard;
