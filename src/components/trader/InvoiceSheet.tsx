import React from "react";
import { Drawer } from "vaul";
import { Send, X, Receipt, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { InvoiceData } from "@/data/jobWorkflowState";

interface InvoiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  customerName: string;
  invoiceData: InvoiceData | null;
  onSend: () => void;
}

const InvoiceSheet = ({ isOpen, onOpenChange, jobTitle, customerName, invoiceData, onSend }: InvoiceSheetProps) => {
  if (!invoiceData) return null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">Invoice Preview</h2>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{jobTitle}</p>
              </div>
              <button onClick={() => onOpenChange(false)} className="rounded-full bg-muted p-2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-2">
            {/* Invoice card */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">Invoice #{invoiceData.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-muted-foreground">To: {customerName} · {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2 mb-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Items</p>
                {invoiceData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                    <span className="text-[11px] text-foreground">{item.label}</span>
                    <span className="text-[11px] font-bold text-foreground">£{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Subtotal</span>
                  <span className="text-[12px] font-bold text-foreground">£{invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[hsl(142,70%,45%)]">Advance Paid</span>
                  <span className="text-[12px] font-bold text-[hsl(142,70%,45%)]">−£{invoiceData.advancePaid.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-foreground">Remaining Balance</span>
                  <span className="text-[16px] font-extrabold text-primary">£{invoiceData.remaining.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 flex items-center gap-2.5 mb-4">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The customer will receive this invoice and can pay the remaining balance of £{invoiceData.remaining.toFixed(2)} directly through the platform.
              </p>
            </div>
          </ScrollArea>

          <div className="px-6 py-5 bg-background border-t border-border/50">
            <div className="flex gap-3">
              <button onClick={() => onOpenChange(false)} className="flex-1 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => { onSend(); onOpenChange(false); }}
                className="flex-[2.5] rounded-xl bg-primary py-3.5 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Send Invoice
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default InvoiceSheet;
