import React from "react";
import { Drawer } from "vaul";
import {
  MapPin, Clock, FileText, Send, X, Eye,
  PoundSterling, Users, UsersRound, RotateCcw,
  ShieldCheck, ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Avatar from "boring-avatars";
import { toast } from "sonner";

export interface SentQuoteData {
  id: string;
  jobTitle: string;
  icon: string;
  customer: string;
  location: string;
  distance: string;
  sentAt: string;
  quoteTotal: number;
  materialsCount: number;
  labourHours?: number;
  labourRate?: number;
  labourTypes?: { role: string; count: number; hours: number; rate: number }[];
  status: "pending" | "accepted" | "declined" | "expired";
  assignedTo?: { type: "group" | "individual" | "individuals"; name: string; memberCount: number };
}

interface QuoteDetailSheetProps {
  quote: SentQuoteData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAgency: boolean;
  onRemind: (id: string) => void;
  onWithdraw: (id: string) => void;
  onRequote: (id: string) => void;
  onViewJob: (id: string) => void;
}

const statusConfig: Record<SentQuoteData["status"], { label: string; className: string }> = {
  pending: { label: "Awaiting Response", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
  accepted: { label: "Accepted", className: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
};

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

const QuoteDetailSheet = ({
  quote,
  isOpen,
  onOpenChange,
  isAgency,
  onRemind,
  onWithdraw,
  onRequote,
  onViewJob,
}: QuoteDetailSheetProps) => {
  if (!quote) return null;

  const sc = statusConfig[quote.status];
  const materialsAmount = quote.quoteTotal - (quote.labourHours && quote.labourRate ? quote.labourHours * quote.labourRate : 0);

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={onOpenChange}
      container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] max-w-[430px] flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          <ScrollArea className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sc.className}`}>
                    {sc.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground leading-tight">{quote.jobTitle}</h2>
                <p className="text-xs text-muted-foreground mt-1">Sent {quote.sentAt}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-2xl bg-accent/30 p-4 mb-5 border border-border/50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-background">
                <Avatar name={quote.customer} variant="beam" size={40} colors={avatarPalette} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{quote.customer}</p>
                <p className="text-[11px] text-muted-foreground">{quote.location}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />{quote.distance}
              </span>
            </div>

            {/* Quote Breakdown */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Quote Breakdown</h3>
              <div className="rounded-2xl bg-accent/50 p-4 border border-border/50 space-y-2.5">
                {/* Materials */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Materials ({quote.materialsCount} items)
                  </span>
                  <span className="font-semibold text-foreground">£{materialsAmount.toFixed(2)}</span>
                </div>

                {/* Agency labour types */}
                {isAgency && quote.labourTypes && quote.labourTypes.map((lt, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {lt.count}× {lt.role} ({lt.hours}h × £{lt.rate}/hr)
                    </span>
                    <span className="font-semibold text-foreground">£{(lt.count * lt.hours * lt.rate).toFixed(2)}</span>
                  </div>
                ))}

                {/* Individual labour */}
                {!isAgency && quote.labourHours && quote.labourRate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Labour ({quote.labourHours}h × £{quote.labourRate}/hr)
                    </span>
                    <span className="font-semibold text-foreground">£{(quote.labourHours * quote.labourRate).toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-border pt-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-lg font-extrabold text-primary flex items-center gap-0.5">
                    <PoundSterling className="h-4 w-4" />
                    {quote.quoteTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned To — agency only */}
            {isAgency && quote.assignedTo && (
              <div className="mb-5">
                <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 px-1">Assigned To</h3>
                <div className="rounded-2xl bg-accent/30 p-4 border border-border/50 flex items-center gap-3">
                  {quote.assignedTo.type === "group" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <UsersRound className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-foreground">{quote.assignedTo.name}</p>
                    <p className="text-[11px] text-muted-foreground">{quote.assignedTo.memberCount} workers</p>
                  </div>
                </div>
              </div>
            )}

            {/* Secure badge */}
            <div className="mb-10 p-5 rounded-[24px] bg-muted/30 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Tradey Secure</p>
                  <p className="text-[10px] text-muted-foreground">Payment protected & insured</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            {quote.status === "pending" && (
              <>
                <button
                  onClick={() => { onWithdraw(quote.id); onOpenChange(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-destructive/20 py-4 text-sm font-bold text-destructive active:bg-destructive/5"
                >
                  <X className="h-4 w-4" />
                  Withdraw
                </button>
                <button
                  onClick={() => { onRemind(quote.id); }}
                  className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Reminder
                </button>
              </>
            )}
            {quote.status === "declined" && (
              <button
                onClick={() => { onRequote(quote.id); onOpenChange(false); }}
                className="flex-1 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Send New Quote
              </button>
            )}
            {quote.status === "accepted" && (
              <button
                onClick={() => { onViewJob(quote.id); onOpenChange(false); }}
                className="flex-1 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Active Job
              </button>
            )}
            {quote.status === "expired" && (
              <button
                onClick={() => { onRequote(quote.id); onOpenChange(false); }}
                className="flex-1 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Requote
              </button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default QuoteDetailSheet;
