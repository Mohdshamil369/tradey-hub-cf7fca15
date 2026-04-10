import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Clock, MapPin, MessageCircle, Users, UserCheck, Bell, Navigation,
  ChevronDown, Wrench,
  MapPinCheck, CircleCheck,
} from "lucide-react";
import Avatar from "boring-avatars";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

type MemberStatus = "en_route" | "arrived" | "working" | "done";

export interface CrewMember {
  id: string;
  name: string;
  avatar: string;
  status: MemberStatus;
  updatedAt: string;
}

interface ActiveJobCardProps {
  job: {
    id: string;
    title: string;
    icon: string;
    customer: string;
    date?: string;
    timeWindow?: string;
    location: string;
    distance?: string;
    status: string;
    price?: number | null;
    crew?: CrewMember[];
    crewTotal?: number;
    crewArrived?: number;
  };
  isUpNext?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  description?: string;
  viewMode?: "agency" | "individual";
}

const memberStatusMeta: Record<MemberStatus, { icon: typeof MapPinCheck; label: string; color: string; bg: string }> = {
  en_route: { icon: Navigation, label: "En Route", color: "text-[hsl(var(--chart-4))]", bg: "bg-[hsl(var(--chart-4))]/10" },
  arrived: { icon: MapPinCheck, label: "Arrived", color: "text-primary", bg: "bg-primary/10" },
  working: { icon: Wrench, label: "Working", color: "text-[hsl(var(--chart-2))]", bg: "bg-[hsl(var(--chart-2))]/10" },
  done: { icon: CircleCheck, label: "Done", color: "text-[hsl(var(--chart-1))]", bg: "bg-[hsl(var(--chart-1))]/10" },
};

const ActiveJobCard = ({ job, isUpNext = false, expanded = false, onToggleExpand, description, viewMode = "agency" }: ActiveJobCardProps) => {
  const navigate = useNavigate();
  const isIndividual = viewMode === "individual";

  const crewTotal = job.crewTotal ?? job.crew?.length ?? 0;
  const crewArrived = job.crewArrived ?? job.crew?.filter((m) => m.status === "arrived" || m.status === "working" || m.status === "done").length ?? 0;
  const crewPending = crewTotal - crewArrived;
  const progressPct = crewTotal > 0 ? (crewArrived / crewTotal) * 100 : 0;
  const timeDisplay = job.date || job.timeWindow || "";

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-border card-shadow">
      {/* Up Next banner */}
      {isUpNext && (
        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20">
              <Navigation className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-[11px] font-bold text-primary-foreground uppercase tracking-wider">Up Next</span>
          </div>
          {job.price && (
            <span className="text-sm font-extrabold text-primary-foreground">£{job.price}</span>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="px-4 py-3.5" onClick={onToggleExpand}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[14px] font-bold text-foreground truncate">{job.title}</h4>
              <div className="flex items-center gap-1.5 shrink-0">
                {!isUpNext && job.price && (
                  <span className="text-[15px] font-extrabold text-primary">£{job.price}</span>
                )}
                {onToggleExpand && (
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                )}
              </div>
            </div>

            {/* Individual: highlight time prominently, show location separately */}
            {isIndividual ? (
              <div className="mt-1.5 flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5 shrink-0" />{timeDisplay}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />{job.location.replace(/,\s*[\d.]+\s*km/, '')}
                </span>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 truncate">
                  <Clock className="h-3 w-3 shrink-0 text-muted-foreground/60" />{timeDisplay}
                </span>
                <span className="text-border shrink-0">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />{job.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Crew progress bar — agency only */}
        {!isIndividual && crewTotal > 0 && (
          <div className="mt-3 rounded-xl bg-accent/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground">{crewArrived}/{crewTotal} arrived</span>
              </div>
              {crewPending > 0 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {crewPending} pending
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          {description && (
            <div className="mb-3 pb-3 border-b border-border">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="text-xs font-semibold text-foreground">{job.customer}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
            </div>
          )}
          {/* Crew Status — agency only */}
          {!isIndividual && job.crew && job.crew.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Crew Status</p>
              <div className="flex flex-col gap-1.5">
                {job.crew.map((member) => {
                  const meta = memberStatusMeta[member.status];
                  const Icon = meta.icon;
                  return (
                    <div key={member.id} className="flex items-center gap-2.5 rounded-xl bg-card border border-border px-3 py-2">
                      <Avatar size={28} name={member.name} variant="beam" colors={avatarPalette} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{member.name}</p>
                        <p className="text-[9px] text-muted-foreground">{member.updatedAt}</p>
                      </div>
                      <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 ${meta.bg}`}>
                        <Icon className={`h-3 w-3 ${meta.color}`} />
                        <span className={`text-[9px] font-bold ${meta.color}`}>{meta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-border px-4 py-2.5 flex items-center gap-2">
        {isIndividual ? (
          <>
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
              <MapPin className="h-3 w-3" />
              {job.location.match(/[\d.]+\s*km/)?.[0] || job.distance || ""}
            </span>
            <div className="flex flex-1 justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-[11px] font-bold text-foreground active:scale-[0.97] transition-transform"
              >
                <MessageCircle className="h-3.5 w-3.5" />Message Customer
              </button>
            </div>
          </>
        ) : (
          <>
            {!isUpNext && job.distance && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
                <MapPin className="h-3 w-3" />{job.distance}
              </span>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-[11px] font-bold text-foreground active:scale-[0.97] transition-transform"
              >
                <Users className="h-3.5 w-3.5" />Message Team
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toast.success("Reminder sent to team! 🔔"); }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-bold text-primary-foreground active:scale-[0.97] transition-transform"
              >
                <Bell className="h-3.5 w-3.5" />Remind
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveJobCard;
