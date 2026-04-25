import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import {
  Clock, MapPin, MessageCircle, Users, UserCheck, Bell, Navigation,
  ChevronDown, Wrench, Calendar, Camera, ChevronLeft, ChevronRight,
  MapPinCheck, CircleCheck,
} from "lucide-react";
import Avatar from "boring-avatars";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";

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
    photos?: string[];
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

  const photos = job.photos?.filter(p => p && p !== "/placeholder.svg") ?? [];
  const hasPhotos = photos.length > 0;
  const [photoRequested, setPhotoRequested] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <div className="rounded-[32px] bg-card overflow-hidden border border-border/50 card-shadow transition-all group">
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

      {/* Photo Area */}
      <div className="relative w-full h-[180px] bg-[#F8F9FB] cursor-pointer" onClick={onToggleExpand}>
        {hasPhotos ? (
          <>
            <img
              src={photos[photoIndex]}
              alt={job.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {photos.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <div className="contents pointer-events-auto">
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
                toast.success("Photo request sent to customer");
              }}
              disabled={photoRequested}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E2E8F0] px-6 py-2.5 text-xs font-bold text-[#1E293B] shadow-sm active:scale-95 disabled:opacity-50 transition-all hover:border-primary/30"
            >
              <Camera className="h-4 w-4" />
              {photoRequested ? "Request Sent" : "Request Photos"}
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-5 pt-4 pb-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight flex-1 mr-4">{job.title}</h4>
          <div className="text-right shrink-0 flex items-center gap-2">
            {!isUpNext && job.price && (
              <span className="text-[17px] font-extrabold text-[#1E293B]">£{job.price}</span>
            )}
            {onToggleExpand && (
              <ChevronDown className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            )}
          </div>
        </div>

        <p className="text-[13px] font-medium text-[#64748B] mb-3">
          {job.customer} · {job.location.split(',')[0]}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold text-[#475569]">
                {job.distance || job.location.match(/[\d.]+\s*km/)?.[0] || 'Nearby'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8]">Just now</span>
        </div>

        {/* Crew progress bar — agency only */}
        {!isIndividual && crewTotal > 0 && (
          <div className="mt-4 rounded-xl bg-accent/60 p-3">
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
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-5 py-4">
          {description && (
            <div className="mb-4 pb-4 border-b border-[#E2E8F0] border-dashed">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Details</p>
              <p className="text-xs text-[#475569] leading-relaxed">{description}</p>
            </div>
          )}
          {/* Crew Status — agency only */}
          {!isIndividual && job.crew && job.crew.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">Crew Status</p>
              <div className="flex flex-col gap-2">
                {job.crew.map((member) => {
                  const meta = memberStatusMeta[member.status];
                  const Icon = meta.icon;
                  return (
                    <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-white border border-[#F1F5F9] px-3.5 py-2.5 shadow-sm">
                      <Avatar size={32} name={member.name} variant="beam" colors={avatarPalette} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#1E293B] truncate">{member.name}</p>
                        <p className="text-[10px] text-[#64748B]">{member.updatedAt}</p>
                      </div>
                      <div className={`flex items-center gap-1 rounded-lg px-2 py-1 ${meta.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                        <span className={`text-[10px] font-bold ${meta.color}`}>{meta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-[#F8FAFC] border-t border-[#F1F5F9] px-5 py-3.5 flex items-center justify-between" onClick={expanded ? onToggleExpand : undefined}>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-bold text-[#1E293B]">{timeDisplay}</span>
        </div>
        
        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
          {isIndividual ? (
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
              className="flex items-center justify-center gap-1.5 rounded-full bg-white border border-[#E2E8F0] px-3.5 py-1.5 text-[11px] font-bold text-[#1E293B] shadow-sm active:scale-95 transition-all hover:border-primary/30"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Message
            </button>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
                className="flex items-center justify-center gap-1.5 rounded-full bg-white border border-[#E2E8F0] px-3.5 py-1.5 text-[11px] font-bold text-[#1E293B] shadow-sm active:scale-95 transition-all hover:border-primary/30"
              >
                <Users className="h-3.5 w-3.5 text-[#64748B]" /> Team
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toast.success("Reminder sent to team! 🔔"); }}
                className="flex items-center justify-center gap-1.5 rounded-full bg-primary/10 text-primary px-3.5 py-1.5 text-[11px] font-bold active:scale-95 transition-all"
              >
                <Bell className="h-3.5 w-3.5" /> Remind
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveJobCard;
