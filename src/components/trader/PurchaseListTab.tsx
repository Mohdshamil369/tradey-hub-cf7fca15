import { useState } from "react";
import { CheckCircle2, ShoppingCart, User, UserCog, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseItem } from "@/data/jobWorkflowState";

interface PurchaseListTabProps {
  items: PurchaseItem[];
  onUpdateItems: (items: PurchaseItem[]) => void;
  onAllPurchased?: () => void;
}

const PurchaseListTab = ({ items, onUpdateItems, onAllPurchased }: PurchaseListTabProps) => {
  const purchased = items.filter((i) => i.status === "purchased").length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((purchased / total) * 100);
  const totalCost = items.reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const purchasedCost = items.filter((i) => i.status === "purchased").reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const allDone = total > 0 && purchased === total;

  const toggleStatus = (id: string) => {
    const updated = items.map((item) =>
      item.id === id
        ? { ...item, status: (item.status === "pending" ? "purchased" : "pending") as PurchaseItem["status"] }
        : item
    );
    onUpdateItems(updated);
    const item = updated.find((i) => i.id === id);
    if (item?.status === "purchased") toast.success(`${item.name} marked as purchased`);
    if (updated.every((i) => i.status === "purchased") && onAllPurchased) {
      setTimeout(() => onAllPurchased(), 500);
    }
  };

  const toggleBuyer = (id: string) => {
    const updated = items.map((item) =>
      item.id === id
        ? { ...item, buyer: (item.buyer === "customer" ? "admin" : "customer") as PurchaseItem["buyer"] }
        : item
    );
    onUpdateItems(updated);
    const item = updated.find((i) => i.id === id);
    toast(item?.buyer === "admin" ? "Admin will purchase this item" : "Customer will purchase this item");
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Progress */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Purchase Progress</p>
            <p className="text-[13px] font-bold text-foreground mt-0.5">{purchased}/{total} items</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Cost</p>
            <p className="text-[13px] font-extrabold text-foreground mt-0.5">£{totalCost.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-all ${allDone ? "bg-[hsl(142,70%,45%)]" : "bg-primary"}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">{progress}% complete</span>
          <span className="font-bold text-primary">£{purchasedCost.toLocaleString()} spent</span>
        </div>
      </div>

      {allDone && (
        <div className="rounded-2xl bg-[hsl(142,70%,45%)]/5 border border-[hsl(142,70%,45%)]/20 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(142,70%,45%)]/10">
            <CheckCircle2 className="h-5 w-5 text-[hsl(142,70%,45%)]" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[hsl(142,70%,45%)]">All Materials Acquired</p>
            <p className="text-[10px] text-muted-foreground">Ready to proceed — all items have been purchased.</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[12px] font-semibold text-foreground">No items yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Items will appear here once a quote is accepted.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const done = item.status === "purchased";
            return (
              <div key={item.id} className={`rounded-2xl border bg-card p-3.5 transition-all ${done ? "border-[hsl(142,70%,45%)]/30 bg-[hsl(142,70%,45%)]/5" : "border-border/40"}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(item.id)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${done ? "border-[hsl(142,70%,45%)] bg-[hsl(142,70%,45%)]" : "border-muted-foreground/30"}`}>
                    {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-bold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>Qty: {item.quantity}</span><span>·</span><span>£{item.expectedPrice.toFixed(2)} each</span>
                    </div>
                    <div className="mt-2">
                      <button onClick={() => toggleBuyer(item.id)} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold transition-all ${item.buyer === "customer" ? "bg-blue-500/10 text-blue-600" : "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]"}`}>
                        {item.buyer === "customer" ? <><User className="h-2.5 w-2.5" /> Customer buys</> : <><UserCog className="h-2.5 w-2.5" /> Admin buys</>}
                      </button>
                    </div>
                  </div>
                  <p className={`text-[12px] font-extrabold shrink-0 ${done ? "text-[hsl(142,70%,45%)]" : "text-foreground"}`}>£{(item.expectedPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && !allDone && (
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            The customer can purchase items themselves or request you to purchase them. Mark items as purchased once acquired.
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchaseListTab;
