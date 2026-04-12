import { MapPin, Clock, Camera, Calendar, ChevronLeft, ChevronRight, Heart, Users } from "lucide-react";
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

const IncomingJobCard = ({ job, onViewDetail, viewMode = "individual", onRequestPhotos, onShowSchedule, isSaved = false, onToggleSave }: IncomingJobCardProps) => {
  const photos = job.customerRequest?.photos?.filter(p => p && p !== "/placeholder.svg") ?? [];
  const hasPhotos = photos.length > 0;
  const [photoRequested, setPhotoRequested] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <div
      className="rounded-[32px] bg-card overflow-hidden border border-border/50 card-shadow transition-all active:scale-[0.985] group"
      onClick={onViewDetail}
    >
      {/* Photo area */}
      <div className="relative w-full h-[180px] bg-[#F8F9FB]">
        {hasPhotos ? (
          <>
            <img
              src={photos[photoIndex]}
              alt={job.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {photos.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm active:scale-90"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm active:scale-90"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/10">
              <Camera className="h-3 w-3" />
              {photos.length}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <img src={noPhotoPlaceholder} alt="No photo" className="h-16 w-16 object-contain opacity-[0.15]" />
              <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/30" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoRequested(true);
                onRequestPhotos?.(job.id);
              }}
              disabled={photoRequested}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E2E8F0] px-6 py-2.5 text-xs font-bold text-[#1E293B] shadow-sm active:scale-95 disabled:opacity-50 transition-all hover:border-primary/30"
            >
              <Camera className="h-4 w-4" />
              {photoRequested ? "Request Sent" : "Request Photos"}
            </button>
          </div>
        )}

        {/* Action badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm active:scale-90 transition-all shadow-md hover:bg-white"
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-[#64748B]"}`} />
            </button>
          )}
          {job.proposalsCount !== undefined && job.proposalsCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#64748B] shadow-md border border-white/20">
              <Users className="h-3 w-3 text-primary" />
              {job.proposalsCount} Proposals
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight flex-1 mr-4">{job.title}</h4>
          <div className="text-right shrink-0">
            {job.price ? (
              <span className="text-[17px] font-extrabold text-[#1E293B]">£{job.price}</span>
            ) : job.inspectionFee ? (
              <div className="flex flex-col items-end">
                <span className="text-[17px] font-extrabold text-[#F97316]">£{job.inspectionFee}</span>
                <span className="text-[9px] font-semibold text-orange-500/70 uppercase tracking-wider">Inspect</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-blue-600">Quote Req.</span>
            )}
          </div>
        </div>

        <p className="text-[13px] font-medium text-[#64748B] mb-3">{job.customer} · {job.location}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold text-[#475569]">{job.distance}</span>
            </div>
            {job.estimatedDuration && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
                <Clock className="h-3.5 w-3.5 text-[#475569]" />
                <span className="text-[11px] font-bold text-[#475569]">{job.estimatedDuration}</span>
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8]">{job.postedAgo || "Just now"}</span>
        </div>
      </div>

      {/* Footer / Time Window */}
      <div className="bg-[#F8FAFC] border-t border-[#F1F5F9] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-bold text-[#1E293B]">{job.timeWindow}</span>
        </div>
        {onShowSchedule && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowSchedule(job);
            }}
            className="text-[11px] font-bold text-primary active:opacity-60"
          >
            Schedule →
          </button>
        )}
      </div>
    </div>
  );
};

export default IncomingJobCard;
