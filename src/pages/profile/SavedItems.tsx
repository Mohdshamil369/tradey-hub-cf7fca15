import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, Bookmark, MapPin, Clock, Trash2, Briefcase } from "lucide-react";
import noPhotoPlaceholder from "@/assets/no-photo-placeholder.png";
import jobTapImg from "@/assets/job-tap-repair.jpg";
import jobBathroomImg from "@/assets/job-bathroom-reno.jpg";
import { toast } from "sonner";

interface SavedItem {
  id: string;
  type: "job" | "trader";
  title: string;
  subtitle: string;
  image?: string;
  distance?: string;
  price?: string;
  savedAt: string;
}

const initialSavedItems: SavedItem[] = [
  {
    id: "s1",
    type: "job",
    title: "Tap Repair",
    subtitle: "Emily R. · Amsterdam Centrum",
    image: jobTapImg,
    distance: "2.3 km",
    price: "£65",
    savedAt: "2 hours ago",
  },
  {
    id: "s2",
    type: "job",
    title: "Full Bathroom Renovation",
    subtitle: "Sarah L. · Jordaan",
    image: jobBathroomImg,
    distance: "1.8 km",
    price: "Quote TBD",
    savedAt: "1 day ago",
  },
  {
    id: "s3",
    type: "job",
    title: "Wall Damp Inspection",
    subtitle: "Mark van B. · De Pijp",
    distance: "3.1 km",
    price: "£45 inspect",
    savedAt: "3 days ago",
  },
];

const SavedItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialSavedItems);

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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-0 rounded-2xl bg-card border border-border overflow-hidden active:scale-[0.99] transition-transform"
                >
                  {/* Thumbnail */}
                  <div className="w-[90px] shrink-0 bg-muted/30">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full flex items-center justify-center p-2">
                        <img src={noPhotoPlaceholder} alt="" className="w-full opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase">Job</span>
                        </div>
                        <h4 className="text-[13px] font-bold text-foreground truncate mt-0.5">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 active:bg-destructive/20"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>

                    <div className="mt-1.5 flex items-center gap-3 text-[10px]">
                      {item.price && (
                        <span className="font-bold text-primary">{item.price}</span>
                      )}
                      {item.distance && (
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          <MapPin className="h-3 w-3" />{item.distance}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-muted-foreground/60">
                        <Clock className="h-3 w-3" />{item.savedAt}
                      </span>
                    </div>
                  </div>
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
