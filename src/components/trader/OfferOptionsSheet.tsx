import React from "react";
import { Drawer } from "vaul";
import { Search, MapPin, Sparkles, ChevronRight, X } from "lucide-react";

interface OfferOptionsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (option: "inspection" | "quote") => void;
  jobTitle: string;
}

const OfferOptionsSheet = ({ isOpen, onOpenChange, onSelect, jobTitle }: OfferOptionsSheetProps) => {
  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={onOpenChange}
      container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Choose Offer Type</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{jobTitle}</p>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-4">
            {/* Site Inspection Option */}
            <button
              onClick={() => onSelect("inspection")}
              className="group relative flex w-full items-center gap-4 rounded-[24px] border border-border bg-card p-5 text-left transition-all active:scale-[0.98] hover:border-orange-500/30 hover:bg-orange-500/[0.02]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-200">
                <Search className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-foreground">Site Inspection</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Visit the site to assess the work and provide an accurate quote later.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Direct Quote Option */}
            <button
              onClick={() => onSelect("quote")}
              className="group relative flex w-full items-center gap-4 rounded-[24px] border border-border bg-card p-5 text-left transition-all active:scale-[0.98] hover:border-primary/30 hover:bg-primary/[0.02]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-foreground">Direct Quote</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Send a full itemized quote with materials and labor charges right now.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Hint */}
            <div className="bg-muted/30 rounded-2xl p-4 flex items-start gap-3 border border-border/50 mt-4">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                Tip: Site inspections are great for complex Cat-B jobs. Direct quotes are faster for well-defined small tasks.
              </p>
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              Back to Job Details
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default OfferOptionsSheet;
