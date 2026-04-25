import { ChevronRight, Clock, MapPin, Building2, ShoppingCart } from "lucide-react";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";
import type { WorkflowStage, JobCategory } from "@/data/jobWorkflowState";
import { getStageCta } from "@/data/stageCta";

const ctaToneClass = {
  primary: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
  success: "bg-[hsl(142,70%,45%)] text-white",
  info: "bg-secondary text-foreground",
} as const;

interface StageJobCardProps {
  job: {
    id: string;
    title: string;
    customer: string;
    timeWindow: string;
    location: string;
    distance?: string;
    image?: string;
    price?: number | null;
    viaOrg?: string;
    /** Optional progress for purchase-list stages */
    purchaseProgress?: { purchased: number; total: number };
  };
  stage: WorkflowStage;
  category: JobCategory;
  onClick?: () => void;
  onCta?: (jobId: string, stage: WorkflowStage) => void;
}

const StageJobCard = ({ job, stage, category, onClick, onCta }: StageJobCardProps) => {
  const meta = getStageCta(stage, category);
  const Icon = meta.ctaIcon;
  const showProgress = !!job.purchaseProgress && job.purchaseProgress.total > 0;
  const pct = showProgress
    ? Math.round((job.purchaseProgress!.purchased / job.purchaseProgress!.total) * 100)
    : 0;

  return (
    <div className="rounded-2xl bg-card border border-border card-shadow overflow-hidden">
      {/* Header — clickable to open detail */}
      <button onClick={onClick} className="w-full text-left p-3.5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="h-12 w-12 shrink-0 rounded-xl bg-muted/30 overflow-hidden flex items-center justify-center border border-border/40">
            <img
              src={job.image || noPhotoPlaceholder}
              alt={job.title}
              className={`${job.image ? "h-full w-full object-cover" : "h-7 w-7 object-contain opacity-25"}`}
              onError={(e) => { (e.target as HTMLImageElement).src = noPhotoPlaceholder; }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
            </div>

            {/* Stage pill */}
            <div className="mt-1.5">
              <span className={`inline-flex items-center rounded-md px-1.5 py-px text-[9px] font-bold whitespace-nowrap ${meta.pillClass}`}>
                {meta.label}
              </span>
            </div>

            {/* Customer + Location tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/60 text-[10px] font-medium text-muted-foreground max-w-[100px] truncate">
                {job.customer}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 text-[10px] font-medium text-muted-foreground/80">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[100px]">{job.location.split(",")[0]}</span>
              </span>
              {job.viaOrg && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-semibold text-primary max-w-[120px] truncate">
                  <Building2 className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">via {job.viaOrg}</span>
                </span>
              )}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 mt-1 text-[10.5px] text-muted-foreground/70">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{job.timeWindow}</span>
            </div>
          </div>

          {/* Price */}
          {job.price != null && (
            <div className="flex flex-col items-end shrink-0 self-start">
              <span className="text-[13px] font-extrabold text-foreground">£{job.price}</span>
            </div>
          )}
        </div>

        {/* Optional purchase progress bar */}
        {showProgress && (
          <div className="mt-3 rounded-lg bg-muted/40 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <ShoppingCart className="h-2.5 w-2.5" />
                Purchase List
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                {job.purchaseProgress!.purchased}/{job.purchaseProgress!.total} items
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Stage hint */}
        {meta.hint && (
          <p className="mt-2 text-[10.5px] text-muted-foreground leading-relaxed">{meta.hint}</p>
        )}
      </button>

      {/* Dynamic footer CTA */}
      <div className="border-t border-border/50 bg-muted/20 px-3.5 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => onClick?.()}
          className="text-[10.5px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 active:scale-95"
        >
          Details <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (!meta.awaiting) onCta?.(job.id, stage); }}
          disabled={meta.awaiting}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold active:scale-95 transition-all ${ctaToneClass[meta.tone]} ${meta.awaiting ? "opacity-80 cursor-default" : ""}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {meta.cta}
        </button>
      </div>
    </div>
  );
};

export default StageJobCard;
