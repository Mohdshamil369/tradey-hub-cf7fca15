import { MapPin, Clock, Eye } from "lucide-react";

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
}

const categoryConfig: Record<JobCategory, { label: string; emoji: string; className: string }> = {
  fixed: { label: "Fixed Rate", emoji: "⚡", className: "bg-primary/10 text-primary" },
  estimate: { label: "Estimate", emoji: "📝", className: "bg-blue-500/10 text-blue-600" },
  inspection: { label: "Inspection", emoji: "🔍", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
};

const IncomingJobCard = ({ job, onViewDetail, viewMode = "individual" }: IncomingJobCardProps) => {
  const cat = job.category ? categoryConfig[job.category] : null;

  return (
    <div
      className="rounded-2xl bg-card overflow-hidden border border-border active:scale-[0.99] transition-transform cursor-pointer"
      onClick={onViewDetail}
    >
      {/* Header */}
      <div className="px-4 py-3.5">
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl mt-0.5">
            {job.icon}
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
              {job.price ? (
                <span className="text-[15px] font-extrabold text-primary shrink-0">£{job.price}</span>
              ) : job.inspectionFee ? (
                <span className="text-[13px] font-bold text-[hsl(25,90%,55%)] shrink-0">Inspect £{job.inspectionFee}</span>
              ) : (
                <span className="text-[13px] font-bold text-blue-600 shrink-0">Quote TBD</span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.timeWindow}
              </span>
            </div>

            {/* Category badge */}
            {cat && (
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cat.className}`}>
                  {cat.emoji} {cat.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer — distance + View CTA */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />{job.distance}
          </span>
          <span className="text-border">·</span>
          <span>{job.postedAgo || "Just now"}</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          <Eye className="h-3.5 w-3.5" />
          View
        </span>
      </div>
    </div>
  );
};

export default IncomingJobCard;
