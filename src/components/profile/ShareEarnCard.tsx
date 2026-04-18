import { Gift, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Gold-glowing referral card shown right under the avatar.
const ShareEarnCard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/profile/refer")}
      className="group relative mb-6 mt-4 w-full overflow-hidden rounded-2xl bg-card text-left transition-transform active:scale-[0.99]"
      style={{
        // Outer gold glow + warm gradient ring
        boxShadow:
          "0 0 0 1.5px hsl(45 95% 55% / 0.9), 0 8px 24px -6px hsl(45 95% 55% / 0.55), 0 0 32px hsl(45 95% 55% / 0.35)",
      }}
    >
      {/* subtle warm gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(135deg, hsl(45 95% 55% / 0.10) 0%, hsl(35 90% 60% / 0.06) 50%, transparent 100%)",
        }}
      />
      <div className="relative flex items-center gap-3 p-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, hsl(45 95% 55%), hsl(35 90% 55%))",
            boxShadow: "0 4px 12px -2px hsl(45 95% 55% / 0.6)",
          }}
        >
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold text-foreground">Share &amp; Earn</p>
            <span className="rounded-full bg-[hsl(45,95%,55%)]/15 px-1.5 py-0.5 text-[9px] font-bold text-[hsl(35,90%,40%)]">
              REWARDS
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Invite friends to truFindo and earn rewards when they join.
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
};

export default ShareEarnCard;
