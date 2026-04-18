import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { X, HelpCircle, Gift, UserCheck, Rocket, Users, Wallet, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    Icon: Gift,
    title: "Share your referral link",
    body: "Invite tradies and customers who are new or returning to truFindo.",
  },
  {
    Icon: UserCheck,
    title: "Your friend activates their account",
    body: "They sign up using your link and complete the basic profile setup.",
  },
  {
    Icon: Rocket,
    title: "They're ready to start earning",
    body: "Once they accept their first job or booking, your reward is unlocked.",
  },
];

const ReferFriends = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"active" | "past">("active");
  const referralCode = "TRU-7Q4X9P";
  const referralUrl = `https://trufindo.app/r/${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on truFindo",
          text: "Sign up with my link and we both earn rewards.",
          url: referralUrl,
        });
      } catch {
        // user dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <MobileLayout role="trader">
      <div className="flex h-full flex-col">
        {/* Top bar (warm peach background — matches reference) */}
        <div
          className="relative px-4 pt-6 pb-8"
          style={{
            background: "linear-gradient(180deg, hsl(20 80% 95%) 0%, hsl(20 80% 97%) 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/60 text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/profile/help")}
              aria-label="Help"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-foreground font-heading leading-tight">
            Refer friends
          </h1>
          <div
            aria-hidden
            className="absolute right-0 top-0 h-full w-32 opacity-90"
            style={{
              background:
                "radial-gradient(circle at 80% 40%, hsl(45 95% 60% / 0.35), transparent 70%)",
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-sm leading-relaxed text-foreground">
              Earn rewards every time a friend joins truFindo with your link and completes their first job.
              Rewards may vary based on your city and current promotions.
            </p>
          </div>

          {/* Vertical timeline */}
          <div className="px-4 py-4">
            <div className="relative pl-12">
              <span
                aria-hidden
                className="absolute left-[18px] top-4 bottom-4 w-px bg-border"
              />
              {steps.map(({ Icon, title, body }, i) => (
                <div key={i} className="relative mb-6 last:mb-0">
                  <div className="absolute -left-12 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-foreground">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border mx-4" />

          {/* Status section */}
          <div className="px-4 py-5">
            <h2 className="text-xl font-extrabold text-foreground font-heading">Status</h2>

            <div className="mt-4 rounded-2xl border border-border p-4">
              <div className="flex">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />Invitees
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">0</p>
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1 pl-4">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" />You earned
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">£0</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex border-b border-border">
                <button
                  onClick={() => setTab("active")}
                  className={`flex-1 pb-2 text-[13px] font-bold transition-colors ${
                    tab === "active" ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"
                  }`}
                >
                  Active Invites
                </button>
                <button
                  onClick={() => setTab("past")}
                  className={`flex-1 pb-2 text-[13px] font-bold transition-colors ${
                    tab === "past" ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"
                  }`}
                >
                  Past Invites
                </button>
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(220,90%,60%)]/10">
                  <Gift className="h-7 w-7 text-[hsl(220,90%,55%)]" />
                </div>
                <p className="mt-3 text-[15px] font-extrabold text-foreground">
                  {tab === "active" ? "No active invitations" : "No past invitations"}
                </p>
                <p className="mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted-foreground">
                  Invite your friends and earn. When your friends sign up, they'll show up here.
                </p>
                <button
                  onClick={() => navigate("/profile/help")}
                  className="mt-4 rounded-full bg-muted px-5 py-2 text-[13px] font-bold text-foreground"
                >
                  Learn more
                </button>
              </div>
            </div>

            {/* Referral link card */}
            <div className="mt-4 rounded-2xl bg-card card-shadow p-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Your referral link</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-muted px-2.5 py-2 text-[12px] font-semibold text-foreground">
                  {referralUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground"
                  aria-label="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky invite button */}
        <div className="border-t border-border bg-card/80 backdrop-blur-xl px-4 py-3 pb-7">
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-sm font-extrabold text-background transition-transform active:scale-[0.99]"
          >
            <Share2 className="h-4 w-4" />
            Invite
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ReferFriends;
