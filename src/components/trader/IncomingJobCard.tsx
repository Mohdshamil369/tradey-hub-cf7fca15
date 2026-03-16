import {
  MapPin, Clock, CheckCircle2, XCircle, Mic, ChevronDown, Timer, AlertTriangle,
  Image as ImageIcon, Hourglass, PoundSterling,
} from "lucide-react";
import QuoteBreakdown, { type QuoteBreakdownHandle } from "./QuoteBreakdown";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export interface CustomerRequestMeta {
  photos?: string[];
  expectedDuration?: string;
  expectedBudget?: number;
}

export interface IncomingJobData {
  id: string;
  type: "catA" | "catB";
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
}

export type JobCardViewMode = "individual" | "agency" | "agency-worker";

interface IncomingJobCardProps {
  job: IncomingJobData;
  expanded: boolean;
  onToggleExpand: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onPlayVoice?: () => void;
  viewMode?: JobCardViewMode;
}

/** Mask location to area only: "Amsterdam Centrum" → "Amsterdam Centrum", "45 King Street, Manchester" → "Manchester area" */
const maskLocation = (location: string) => {
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length > 1) return `${parts[parts.length - 1]} area`;
  return location;
};

const AutoAcceptTimer = ({ onAutoAccept }: { onAutoAccept: () => void }) => {
  const [seconds, setSeconds] = useState(300); // 5 min

  useEffect(() => {
    if (seconds <= 0) { onAutoAccept(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onAutoAccept]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = (seconds / 300) * 100;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[hsl(25,90%,55%)]/10 px-2.5 py-1.5">
      <Timer className="h-3.5 w-3.5 text-[hsl(25,90%,55%)]" />
      <div className="flex-1">
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-[hsl(25,90%,55%)] transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-bold text-[hsl(25,90%,55%)] tabular-nums">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

const IncomingJobCard = ({
  job, expanded, onToggleExpand, onAccept, onDecline, onPlayVoice, viewMode = "agency",
}: IncomingJobCardProps) => {
  const isAgencyWorker = viewMode === "agency-worker";
  const isIndividual = viewMode === "individual";
  const quoteRef = useRef<QuoteBreakdownHandle>(null);

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-border">
      {/* Header */}
      <button onClick={onToggleExpand} className="w-full px-4 py-3.5 text-left">
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl mt-0.5">
            {job.icon}
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                {job.price ? (
                  <span className="text-[15px] font-extrabold text-primary">£{job.price}</span>
                ) : (
                  <span className="rounded-lg bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[10px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.timeWindow}
              </span>
            </div>
            {/* Agency worker: show masked location + auto-accept badge */}
            {isAgencyWorker && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" />{maskLocation(job.location)}
                </span>
                <span className="rounded-full bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[9px] font-bold text-[hsl(25,90%,55%)]">
                  Auto-accept
                </span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-border bg-muted/30">
          {/* Individual & Agency: show full customer + location */}
          {!isAgencyWorker && (
            <div className="px-4 py-3 flex items-center justify-between border-b border-border">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />{job.location}
              </span>
              <span className="text-xs font-semibold text-foreground shrink-0 ml-3">{job.customer}</span>
            </div>
          )}

          {/* Agency worker: show only area, no customer name */}
          {isAgencyWorker && (
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs text-foreground font-medium">{maskLocation(job.location)}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground italic">Customer details will be shared upon acceptance</p>
            </div>
          )}

          {/* Description — shown for individual and agency, condensed for agency-worker */}
          {job.description && (
            <div className="px-4 py-3.5 border-b border-border">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isAgencyWorker ? "Job Brief" : "Message"}
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                {isAgencyWorker ? job.description.slice(0, 120) + (job.description.length > 120 ? "..." : "") : job.description}
              </p>
            </div>
          )}

          {/* Customer request metadata */}
          {job.customerRequest && (
            <div className="px-4 py-3 border-b border-border space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isAgencyWorker ? "Request Details" : "Customer Request"}
              </p>

              {/* Expected duration */}
              {job.customerRequest.expectedDuration && (
                <div className="flex items-center gap-2 text-[11px]">
                  <Hourglass className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Expected duration:</span>
                  <span className="font-semibold text-foreground">{job.customerRequest.expectedDuration}</span>
                </div>
              )}

              {/* Expected budget — hidden from agency workers */}
              {!isAgencyWorker && job.customerRequest.expectedBudget && (
                <div className="flex items-center gap-2 text-[11px]">
                  <PoundSterling className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Customer budget:</span>
                  <span className="font-semibold text-foreground">£{job.customerRequest.expectedBudget}</span>
                </div>
              )}

              {/* Photos */}
              {job.customerRequest.photos && job.customerRequest.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ImageIcon className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-semibold">{job.customerRequest.photos.length} photo(s)</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {job.customerRequest.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Job photo ${i + 1}`}
                        className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice note — individual and agency only */}
          {!isAgencyWorker && job.hasVoiceNote && (
            <div className="px-4 py-3 border-b border-border">
              <button
                onClick={(e) => { e.stopPropagation(); onPlayVoice?.(); }}
                className="flex w-full items-center gap-3 rounded-xl bg-card border border-border px-3.5 py-3 transition-colors active:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Mic className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[11px] font-semibold text-foreground leading-tight">Voice Note</p>
                  <p className="text-[10px] text-muted-foreground">{job.voiceDuration || "0:15"}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[3, 5, 8, 4, 7, 6, 3, 5, 7, 4, 6, 3].map((h, i) => (
                    <div key={i} className="w-[2px] rounded-full bg-primary/40" style={{ height: `${h * 1.5}px` }} />
                  ))}
                </div>
              </button>
            </div>
          )}

          {/* Quote breakdown for direct customer quote jobs — individual only */}
          {isIndividual && !job.price && (
            <QuoteBreakdown
              ref={quoteRef}
              onSubmitQuote={(data) => {
                toast.success(`Quote sent to customer: £${data.total.toFixed(2)}`, {
                  description: `${data.materials.length} item(s) + ${data.labourHours}h labour`,
                });
                onAccept();
              }}
            />
          )}

          {/* Auto-accept timer for agency workers */}
          {isAgencyWorker && (
            <div className="px-4 py-3">
              <AutoAcceptTimer onAutoAccept={() => {
                toast.info("Job auto-accepted");
                onAccept();
              }} />
            </div>
          )}
        </div>
      )}

      {/* Footer — distance + actions */}
      <div className="flex items-center border-t border-border px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
          <MapPin className="h-3.5 w-3.5" />{job.distance}
        </span>
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            onClick={onDecline}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground transition-colors active:bg-muted"
          >
            <XCircle className="h-3.5 w-3.5" />Decline
          </button>
          <button
            onClick={() => {
              if (isIndividual && job.type === "catB" && !expanded) {
                onToggleExpand();
              } else if (isIndividual && job.type === "catB" && expanded) {
                quoteRef.current?.submit();
              } else {
                onAccept();
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors active:opacity-90"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isAgencyWorker ? "Accept" : (job.type === "catB" ? "Send Estimate" : "Pickup")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingJobCard;
