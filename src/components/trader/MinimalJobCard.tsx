import { ChevronRight, Clock, MapPin, Users } from "lucide-react";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";

type MinimalJobCardProps = {
  job: {
    id: string;
    title: string;
    customer: string;
    timeWindow: string;
    location: string;
    image?: string;
    statusLabel?: string;
    assignLabel?: string;
    price?: number | null;
  };
  onClick?: () => void;
};

export const MinimalJobCard = ({ job, onClick }: MinimalJobCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-card p-3.5 flex items-center gap-3 border border-border card-shadow active:scale-[0.99] transition-all"
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 rounded-xl bg-muted/30 overflow-hidden flex items-center justify-center border border-border/40">
        {job.image ? (
          <img
            src={job.image}
            alt={job.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = noPhotoPlaceholder;
            }}
          />
        ) : (
          <img
            src={noPhotoPlaceholder}
            alt="Placeholder"
            className="h-7 w-7 object-contain opacity-25"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title + Badge */}
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
          {job.statusLabel && (
            <span className="shrink-0 rounded-md bg-secondary px-1.5 py-px text-[9px] font-semibold text-muted-foreground whitespace-nowrap">
              {job.statusLabel}
            </span>
          )}
        </div>
        {/* Customer */}
        <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">{job.customer}</p>
        {/* Meta row: time · location */}
        <div className="flex items-center gap-1 mt-1 text-[10.5px] text-muted-foreground/70">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate max-w-[45%]">{job.timeWindow}</span>
          <span className="opacity-40">·</span>
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        {/* Assign label (optional) */}
        {job.assignLabel && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground/60">
            <Users className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate font-medium">{job.assignLabel}</span>
          </div>
        )}
      </div>

      {/* Right: price + chevron */}
      <div className="flex items-center gap-1 shrink-0">
        {job.price && (
          <span className="text-[13px] font-extrabold text-foreground mr-0.5">£{job.price}</span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
      </div>
    </button>
  );
};

export default MinimalJobCard;
