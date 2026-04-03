import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, Bookmark, BookmarkX } from "lucide-react";
import IncomingJobCard, { IncomingJobData } from "@/components/trader/IncomingJobCard";
import jobTapImg from "@/assets/job-tap-repair.jpg";
import jobBathroomImg from "@/assets/job-bathroom-reno.jpg";
import { toast } from "sonner";

const initialSavedJobs: IncomingJobData[] = [
  {
    id: "s1",
    type: "catA",
    category: "fixed",
    title: "Tap Repair",
    icon: "🔧",
    customer: "Emily R.",
    location: "Amsterdam Centrum",
    distance: "2.3 km",
    price: 65,
    timeWindow: "Mon 28 Jul, 9:00–12:00",
    estimatedDuration: "1–2 hrs",
    postedAgo: "2 hours ago",
    description: "Kitchen tap is leaking and needs replacement.",
    customerRequest: { photos: [jobTapImg] },
  },
  {
    id: "s2",
    type: "catB",
    category: "estimate",
    title: "Full Bathroom Renovation",
    icon: "🛁",
    customer: "Sarah L.",
    location: "Jordaan",
    distance: "1.8 km",
    price: null,
    timeWindow: "Flexible — within 2 weeks",
    estimatedDuration: "Multi-day",
    postedAgo: "1 day ago",
    description: "Complete bathroom reno including tiling and plumbing.",
    customerRequest: { photos: [jobBathroomImg] },
  },
  {
    id: "s3",
    type: "catA",
    category: "inspection",
    title: "Wall Damp Inspection",
    icon: "🔍",
    customer: "Mark van B.",
    location: "De Pijp",
    distance: "3.1 km",
    price: null,
    inspectionFee: 45,
    timeWindow: "This week",
    postedAgo: "3 days ago",
    description: "Damp patches appearing on interior wall, need inspection.",
  },
];

const SavedItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialSavedJobs);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast("Item removed from saved");
  };

  return (
    <MobileLayout role="trader" hideNav>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">Saved Items</h1>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {items.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
                <Bookmark className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground">No saved items</p>
              <p className="text-[11px] text-muted-foreground text-center max-w-[200px]">
                Tap the bookmark icon on jobs to save them here for later
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {items.map((job) => (
                <div key={job.id} className="relative">
                  {/* Gradient overlay behind unsave button */}
                  <div className="absolute top-0 right-0 z-10 h-16 w-24 rounded-tr-2xl pointer-events-none"
                    style={{ background: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.35) 100%)" }}
                  />
                  {/* Unsave button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(job.id); }}
                    className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground active:scale-95 transition-transform shadow-md"
                    title="Remove from saved"
                  >
                    <BookmarkX className="h-4 w-4" />
                  </button>
                  <IncomingJobCard
                    job={job}
                    onViewDetail={() => navigate(`/trader/jobs/${job.id}`)}
                    onRequestPhotos={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default SavedItems;
