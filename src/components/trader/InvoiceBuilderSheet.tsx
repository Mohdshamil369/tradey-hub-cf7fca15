import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { Send, X, Receipt, Plus, Trash2, ChevronDown, FileText, PoundSterling } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface InvoiceLineItem {
  id: string;
  label: string;
  amount: number;
}

export interface InvoiceSubmitData {
  id: string;
  items: InvoiceLineItem[];
  subtotal: number;
  advancePaid: number;
  remaining: number;
  notes?: string;
}

interface InvoiceBuilderSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  customerName: string;
  /** Quote total previously agreed — seeds the invoice subtotal. */
  quoteTotal?: number;
  /** Advance the customer already paid against the quote. */
  advancePaid?: number;
  /** Optional pre-filled line items from the quote (labour, materials, etc.). */
  seedItems?: InvoiceLineItem[];
  onSend: (data: InvoiceSubmitData) => void;
}

const newItem = (): InvoiceLineItem => ({
  id: crypto.randomUUID(),
  label: "",
  amount: 0,
});

const InvoiceBuilderSheet = ({
  isOpen,
  onOpenChange,
  jobTitle,
  customerName,
  quoteTotal = 0,
  advancePaid = 0,
  seedItems,
  onSend,
}: InvoiceBuilderSheetProps) => {
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Seed items when sheet opens
  useEffect(() => {
    if (isOpen) {
      if (seedItems && seedItems.length > 0) {
        setItems(seedItems.map((i) => ({ ...i, id: crypto.randomUUID() })));
      } else if (quoteTotal > 0) {
        setItems([
          { id: crypto.randomUUID(), label: "Agreed quote total", amount: quoteTotal },
        ]);
      } else {
        setItems([newItem()]);
      }
      setNotes("");
      setShowPreview(false);
    }
  }, [isOpen, quoteTotal, seedItems]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [items]
  );
  const remaining = Math.max(0, subtotal - advancePaid);
  const canPreview = items.length > 0 && items.every((i) => i.label.trim().length > 0 && i.amount > 0);

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const handleSend = () => {
    const data: InvoiceSubmitData = {
      id: crypto.randomUUID(),
      items: items.map(({ id, label, amount }) => ({ id, label, amount: Number(amount) || 0 })),
      subtotal,
      advancePaid,
      remaining,
      notes: notes.trim() || undefined,
    };
    onSend(data);
    onOpenChange(false);
  };

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

          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">Raise Invoice</h2>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 truncate">
                  {jobTitle} · {customerName}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-muted p-2 text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Builder */}
          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[1.5px] text-muted-foreground">Line Items</p>

              {items.map((it, idx) => (
                <div key={it.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== it.id))}
                        className="rounded-md p-1 text-destructive active:bg-destructive/10"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={it.label}
                    onChange={(e) => updateItem(it.id, { label: e.target.value })}
                    placeholder="Description (e.g. Labour, Materials)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mb-2"
                  />
                  <div className="relative">
                    <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={it.amount || ""}
                      onChange={(e) => updateItem(it.id, { amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-[12px] font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setItems((prev) => [...prev, newItem()])}
                className="w-full rounded-xl border border-dashed border-border py-2.5 text-[11px] font-bold text-muted-foreground active:bg-muted flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </button>

              {/* Notes */}
              <div className="pt-2">
                <p className="text-[9px] font-black uppercase tracking-[1.5px] text-muted-foreground mb-2">
                  Notes (optional)
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, thanks, etc."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Live totals */}
              <div className="rounded-2xl bg-muted/40 p-4 space-y-2 mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground tabular-nums">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[hsl(142,70%,45%)]">Advance paid</span>
                  <span className="font-bold text-[hsl(142,70%,45%)] tabular-nums">−£{advancePaid.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                  <span className="text-[12px] font-black text-foreground uppercase tracking-wider">Due now</span>
                  <span className="text-[16px] font-extrabold text-primary tabular-nums">£{remaining.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-5 bg-background border-t border-border/50">
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPreview(true)}
                disabled={!canPreview}
                className="flex-[2.5] rounded-xl bg-primary py-3.5 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileText className="h-4 w-4" /> Preview Invoice
              </button>
            </div>
          </div>

          {/* PDF-style preview overlay */}
          {showPreview && (
            <div className="absolute inset-0 z-[10] flex flex-col bg-background animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Preview header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-card">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground active:scale-95"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Back to Edit
                </button>
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary">Invoice Preview</span>
                </div>
              </div>

              {/* PDF "page" */}
              <ScrollArea className="flex-1 bg-muted/30 px-4 py-5">
                <div className="mx-auto max-w-md rounded-lg bg-white shadow-xl border border-border/40 overflow-hidden">
                  {/* Letterhead */}
                  <div className="px-6 pt-6 pb-4 border-b-2 border-foreground">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[2px] text-muted-foreground">Invoice</p>
                        <h3 className="mt-1 text-[18px] font-black text-foreground leading-tight">{jobTitle}</h3>
                        <p className="mt-1 text-[10px] text-muted-foreground">Bill to: {customerName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                        <p className="text-[10px] font-bold text-foreground">
                          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Due</p>
                        <p className="text-[10px] font-bold text-foreground">On receipt</p>
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="px-6 py-4">
                    <p className="text-[9px] font-black uppercase tracking-[1.5px] text-muted-foreground mb-3">
                      Charges
                    </p>
                    <div className="border border-border/60 rounded-md overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/40 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-9">Description</div>
                        <div className="col-span-3 text-right">Amount</div>
                      </div>
                      <div className="divide-y divide-border/40">
                        {items.map((it) => (
                          <div key={it.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 text-[10px]">
                            <div className="col-span-9 font-bold text-foreground">{it.label}</div>
                            <div className="col-span-3 text-right font-bold text-foreground tabular-nums">
                              £{(Number(it.amount) || 0).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="mt-4 space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="tabular-nums">£{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[hsl(142,70%,45%)]">
                        <span className="font-bold">Advance paid</span>
                        <span className="font-bold tabular-nums">−£{advancePaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-foreground">
                        <span className="font-black text-foreground uppercase tracking-wider text-[10px]">
                          Balance due
                        </span>
                        <span className="font-black text-foreground tabular-nums text-[14px]">
                          £{remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {notes.trim() && (
                      <div className="mt-5 pt-4 border-t border-border/60">
                        <p className="text-[9px] font-black uppercase tracking-[1.5px] text-muted-foreground mb-1.5">
                          Notes
                        </p>
                        <p className="text-[10px] text-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-muted/30 border-t border-border/40">
                    <p className="text-[8px] text-center text-muted-foreground/70 leading-relaxed">
                      Pay securely through the platform. Thank you for your business.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Send / Back actions */}
              <div className="px-6 py-4 bg-background border-t border-border/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-[2] rounded-xl bg-primary py-3.5 text-[12px] font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send to Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default InvoiceBuilderSheet;
