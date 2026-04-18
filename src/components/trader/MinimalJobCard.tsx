import { ChevronRight, Clock, MapPin, Users, Star } from "lucide-react";
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
    rating?: number;
  };
  onClick?: () => void;
};

export const MinimalJobCard = ({ job, onClick }: MinimalJobCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-card p-3.5 border border-border card-shadow active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3">
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

          {/* Customer & Location Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/60 text-[10px] font-medium text-muted-foreground max-w-[100px] truncate">
              {job.customer}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 text-[10px] font-medium text-muted-foreground/80">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate max-w-[100px]">{job.location.split(",")[0]}</span>
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 mt-1 text-[10.5px] text-muted-foreground/70">
            <Clock className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{job.timeWindow}</span>
          </div>

          {/* Assign label (optional) */}
          {job.assignLabel && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground/60">
              <Users className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate font-medium">{job.assignLabel}</span>
            </div>
          )}
        </div>

        {/* Right Column: Price + Chevron */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
          {job.price && (
            <span className="text-[13px] font-extrabold text-foreground">£{job.price}</span>
          )}
        </div>
      </div>

      {/* Footer: Rating bottom-right */}
      {job.rating && (
        <div className="flex justify-end mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-star text-star" />
            <span className="text-[11px] font-extrabold text-foreground">{job.rating.toFixed(1)}</span>
          </div>
        </div>
      )}
    </button>
  );
};

export default MinimalJobCard;

