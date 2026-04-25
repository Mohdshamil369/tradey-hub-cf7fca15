import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Star, ShieldCheck, MessageCircle, MapPin,
  Briefcase, Clock, Repeat, CalendarClock,
} from "lucide-react";
import Avatar from "boring-avatars";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

interface CustomerProfile {
  name: string;
  memberSince: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  jobsPosted: number;
  responseRate: string;
  repeatHireRate: string;
  city?: string;
  bio?: string;
  reviews: { id: string; workerName: string; jobTitle: string; rating: number; text: string; date: string }[];
  jobHistory: { id: string; title: string; trader: string; status: "completed" | "cancelled"; date: string; amount: number }[];
}

/** Mock directory keyed by url-safe slug of the customer name. */
const mockCustomers: Record<string, CustomerProfile> = {
  default: {
    name: "Customer",
    memberSince: "Jan 2024",
    isVerified: true,
    rating: 4.7,
    reviewsCount: 12,
    jobsPosted: 14,
    responseRate: "95%",
    repeatHireRate: "40%",
    city: "Amsterdam",
    bio: "Verified homeowner. Pays on time, communicates clearly.",
    reviews: [
      { id: "r1", workerName: "Alex Turner", jobTitle: "Tap Repair", rating: 5, text: "Clear instructions, paid promptly, easy to work with.", date: "5 days ago" },
      { id: "r2", workerName: "Sara Wilkins", jobTitle: "Drain Unblocking", rating: 5, text: "Friendly and well-prepared. Would happily return.", date: "2 weeks ago" },
      { id: "r3", workerName: "Mike Reeves", jobTitle: "Boiler Service", rating: 4, text: "Good communication. Site was a little cluttered on arrival.", date: "1 month ago" },
    ],
    jobHistory: [
      { id: "j1", title: "Tap Repair", trader: "Alex Turner", status: "completed", date: "5 Mar 2026", amount: 65 },
      { id: "j2", title: "Drain Unblocking", trader: "Sara Wilkins", status: "completed", date: "20 Feb 2026", amount: 75 },
      { id: "j3", title: "Boiler Service", trader: "Mike Reeves", status: "completed", date: "10 Jan 2026", amount: 95 },
    ],
  },
};

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { customerId = "default" } = useParams();
  const [search] = useSearchParams();

  const profile: CustomerProfile = mockCustomers[customerId] ?? {
    ...mockCustomers.default,
    // Use friendly name from query string when navigating from a job
    name: search.get("name") ?? mockCustomers.default.name,
  };

  return (
    <MobileLayout hideNav>
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold text-foreground">Customer Profile</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-4 py-5 flex items-center gap-3 border-b border-border/30">
            <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-background">
              <Avatar name={profile.name} variant="beam" size={64} colors={avatarPalette} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="text-base font-bold text-foreground truncate">{profile.name}</h2>
                {profile.isVerified && <ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground">Member since {profile.memberSince}</p>
              {profile.city && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {profile.city}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 justify-end">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-base font-bold text-foreground">{profile.rating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{profile.reviewsCount} reviews</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border/20 border-b border-border/30">
            <div className="bg-card py-3 text-center">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{profile.jobsPosted}</p>
              <p className="text-[9px] text-muted-foreground">Jobs Posted</p>
            </div>
            <div className="bg-card py-3 text-center">
              <Clock className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{profile.responseRate}</p>
              <p className="text-[9px] text-muted-foreground">Response</p>
            </div>
            <div className="bg-card py-3 text-center">
              <Repeat className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{profile.repeatHireRate}</p>
              <p className="text-[9px] text-muted-foreground">Repeat Hire</p>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="px-4 py-3 border-b border-border/30">
              <p className="text-[11px] text-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="px-4 pt-3">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="reviews" className="rounded-lg text-[11px] font-semibold data-[state=active]:bg-card">
                Reviews ({profile.reviews.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg text-[11px] font-semibold data-[state=active]:bg-card">
                Job History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="pt-4 pb-6">
              <div className="space-y-3">
                {profile.reviews.length === 0 && (
                  <p className="text-center text-[11px] text-muted-foreground py-8">No reviews yet.</p>
                )}
                {profile.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border/30 bg-card p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[12px] font-bold text-foreground">{r.workerName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1">{r.jobTitle} · {r.date}</p>
                    <p className="text-[11px] text-foreground leading-relaxed">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="pt-4 pb-6">
              <div className="space-y-2">
                {profile.jobHistory.map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-card px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-foreground truncate">{j.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{j.trader} · {j.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-bold text-foreground">£{j.amount}</p>
                      <p className={`text-[9px] font-semibold ${
                        j.status === "completed" ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {j.status === "completed" ? "Completed" : "Cancelled"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 px-4 py-3 bg-card">
          <button
            onClick={() => toast.info("Messaging coming soon")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Message {profile.name.split(" ")[0]}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default CustomerDetail;
