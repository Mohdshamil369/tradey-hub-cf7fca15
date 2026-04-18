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
      className="w-full text-left rounded-[20px] bg-card p-4 flex items-start gap-4 border border-border card-shadow active:scale-[0.99] transition-all"
    >
      <div className="h-14 w-14 shrink-0 rounded-2xl bg-muted/30 overflow-hidden flex items-center justify-center border border-border/50">
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
            className="h-8 w-8 object-contain opacity-30"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-[14px] font-bold text-foreground truncate">{job.title}</h4>
          {job.statusLabel && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground whitespace-nowrap">
              {job.statusLabel}
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground mb-2">{job.customer}</p>
        
        <div className="flex flex-col gap-1 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{job.timeWindow}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.assignLabel && (
             <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate text-[11px] font-semibold">{job.assignLabel}</span>
             </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0 self-center">
        {job.price && (
          <span className="text-sm font-extrabold text-foreground">£{job.price}</span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 mt-1" />
      </div>
    </button>
  );
};

export default MinimalJobCard;
