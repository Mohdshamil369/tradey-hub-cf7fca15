import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  FileText, Sparkles, ChevronRight, 
  Package, Wrench, Tag, Users, ClipboardList,
  Search, ShieldCheck, MapPin, Timer, CheckCircle2
} from "lucide-react";
import QuoteSheet, { type QuoteSheetData } from "./QuoteSheet";
import { toast } from "sonner";

export interface ResponseJobData {
  id: string;
  category: "fixed" | "estimate" | "inspection";
  title: string;
  price?: number;
  inspectionFee?: number;
}

interface ResponseWorkflowSheetProps {
  job: ResponseJobData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (jobId: string, data: QuoteSheetData) => void;
}

const ResponseWorkflowSheet = ({ job, isOpen, onOpenChange, onSubmit }: ResponseWorkflowSheetProps) => {
  const [showQuoteOptions, setShowQuoteOptions] = useState(true);
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"estimate" | "inspection" | "fixed">("fixed");

  React.useEffect(() => {
    if (isOpen) {
      setShowQuoteOptions(true);
      setShowQuoteSheet(false);
    }
  }, [isOpen]);

  if (!job) return null;

  const quoteOptions = [
    {
      key: "fixed",
      label: "Pick Up (Fixed)",
      description: "Accept the customer's fixed price and schedule the job immediately.",
      icon: CheckCircle2,
      price: job.price,
      isRecommended: job.category === "fixed",
    },
    {
      key: "estimate",
      label: "Send Estimate",
      description: "Provide a price range. Best for renovations or complex repairs.",
      icon: ClipboardList,
      isRecommended: job.category === "estimate",
    },
    {
      key: "inspection",
      label: "Site Inspection",
      description: "Charge a small fee to visit and provide an accurate quote.",
      icon: Search,
      price: job.inspectionFee,
      isRecommended: job.category === "inspection",
    },
  ];

  const handleOptionSelect = (key: string) => {
    if (key === "fixed") {
      // Direct pickup flow
      onSubmit(job.id, { 
        items: [], 
        notes: "Picked up at fixed price", 
        total: job.price ?? 0 
      });
      onOpenChange(false);
      return;
    }
    
    setSelectedCategory(key as "estimate" | "inspection");
    setShowQuoteOptions(false);
    setShowQuoteSheet(true);
  };

  const handleQuoteSubmit = (data: QuoteSheetData) => {
    onSubmit(job.id, data);
    setShowQuoteSheet(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={isOpen && showQuoteOptions} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-[32px] px-6 pb-10 pt-2 sm:max-w-[420px] sm:mx-auto border-none z-[60]">
          <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          <h3 className="text-[22px] font-black text-[#1A1C1E] mb-1 tracking-tight">Choose Quote Type</h3>
          <p className="text-[14px] font-medium text-muted-foreground mb-8">
            Select how you'd like to respond to this job
          </p>
          <div className="flex flex-col gap-4">
            {quoteOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleOptionSelect(option.key)}
                className={`group relative flex items-center gap-4 rounded-[24px] p-4 text-left transition-all active:scale-[0.98] border-2 ${
                  option.isRecommended
                    ? "bg-primary/5 border-[#1A2B4C] shadow-[0_8px_24px_-12px_rgba(26,43,76,0.15)]"
                    : "bg-[#F8F9FB] border-transparent hover:border-border/50"
                }`}
              >
                {option.isRecommended && (
                  <span className="absolute -top-3.5 right-6 flex items-center gap-1.5 rounded-full bg-[#0F172A] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </span>
                )}
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] ${
                  option.isRecommended ? "bg-[#DDE2EE] text-[#1A2B4C]" : "bg-[#E9ECEF] text-[#495057]"
                }`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-black text-[#1A1C1E]">{option.label}</span>
                    {option.price && (
                      <span className="text-[15px] font-black text-[#1A2B4C]">£{option.price}</span>
                    )}
                  </div>
                  <p className="text-[12px] font-medium text-muted-foreground mt-0.5 leading-snug opacity-80">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                  option.isRecommended ? "text-[#1A2B4C]" : "text-[#ADB5BD]"
                }`} />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <QuoteSheet
        isOpen={isOpen && showQuoteSheet}
        onOpenChange={(open) => {
          if (!open) {
            setShowQuoteSheet(false);
            setShowQuoteOptions(true);
          }
        }}
        category={selectedCategory === "inspection" ? "inspection" : "estimate"}
        jobTitle={job.title}
        onSubmit={handleQuoteSubmit}
      />
    </>
  );
};

export default ResponseWorkflowSheet;
