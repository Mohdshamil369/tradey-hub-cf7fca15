import { useState } from "react";
import { CheckCircle2, ShoppingCart, User, UserCog, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseItem, PurchaseItemStatus } from "@/data/jobWorkflowState";

interface PurchaseListTabProps {
  items: PurchaseItem[];
  onUpdateItems: (items: PurchaseItem[]) => void;
  onAllPurchased?: () => void;
}

const isPurchased = (s: PurchaseItemStatus) =>
  s === "purchased_by_customer" || s === "purchased_by_admin";

const PurchaseListTab = ({ items, onUpdateItems, onAllPurchased }: PurchaseListTabProps) => {
  const purchased = items.filter((i) => isPurchased(i.status)).length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((purchased / total) * 100);
  const totalCost = items.reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const purchasedCost = items.filter((i) => isPurchased(i.status)).reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const allDone = total > 0 && purchased === total;

  const toggleStatus = (id: string) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      const next: PurchaseItemStatus = isPurchased(item.status)
        ? "not_purchased"
        : item.buyer === "admin"
          ? "purchased_by_admin"
          : "purchased_by_customer";
      return { ...item, status: next };
    });
    onUpdateItems(updated);
    const item = updated.find((i) => i.id === id);
    if (item && isPurchased(item.status)) toast.success(`${item.name} marked as purchased`);
    if (updated.every((i) => isPurchased(i.status)) && onAllPurchased) {
      setTimeout(() => onAllPurchased(), 500);
    }
  };

  const toggleBuyer = (id: string) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      const nextBuyer: PurchaseItem["buyer"] = item.buyer === "customer" ? "admin" : "customer";
      // If item already purchased, swap bucket too
      let nextStatus = item.status;
      if (isPurchased(item.status)) {
        nextStatus = nextBuyer === "admin" ? "purchased_by_admin" : "purchased_by_customer";
      } else if (nextBuyer === "admin") {
        nextStatus = "requested_admin_purchase";
      } else {
        nextStatus = "not_purchased";
      }
      return { ...item, buyer: nextBuyer, status: nextStatus };
    });
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
        <div className="rounded-2xl border border-dashed border-border/40 bg-muted/20 p-8 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-[12px] font-bold text-foreground">No items yet</p>
          <p className="text-[10px] text-muted-foreground mt-1">Materials added to the quote will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const done = isPurchased(item.status);
            return (
              <div key={item.id} className={`rounded-xl border p-3 ${done ? "border-[hsl(142,70%,45%)]/30 bg-[hsl(142,70%,45%)]/5" : "border-border/40 bg-card"}`}>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => toggleStatus(item.id)} className="flex items-start gap-2.5 flex-1 min-w-0 text-left active:scale-[0.99]">
                    <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${done ? "bg-[hsl(142,70%,45%)] border-[hsl(142,70%,45%)]" : "border-muted-foreground/30"}`}>
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Qty {item.quantity} · £{item.expectedPrice} each · £{(item.expectedPrice * item.quantity).toLocaleString()}
                      </p>
                      {item.status === "requested_admin_purchase" && (
                        <p className="mt-1 text-[10px] font-semibold text-[hsl(25,90%,55%)] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Admin purchase requested
                        </p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => toggleBuyer(item.id)}
                    className={`shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
                      item.buyer === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {item.buyer === "admin" ? <UserCog className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {item.buyer === "admin" ? "Admin" : "Customer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PurchaseListTab;
