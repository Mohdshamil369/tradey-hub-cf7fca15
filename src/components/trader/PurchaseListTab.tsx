import { CheckCircle2, ShoppingCart, User, UserCog, AlertCircle, Clock, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseItem, PurchaseItemStatus } from "@/data/jobWorkflowState";

interface PurchaseListTabProps {
  items: PurchaseItem[];
  onUpdateItems: (items: PurchaseItem[]) => void;
  onAllPurchased?: () => void;
  /**
   * Who is viewing this list. Drives permissions:
   *   - admin → can tick admin-owned items, can request items back from customer, can NOT tick customer items.
   *   - customer → can tick customer-owned items, can request admin purchase, can NOT tick admin items.
   * Defaults to "admin" (this app is currently the admin/trader workspace).
   */
  viewerRole?: "admin" | "customer";
}

const isPurchased = (s: PurchaseItemStatus) =>
  s === "purchased_by_customer" || s === "purchased_by_admin";

/** Resolve the effective buyer of an item (legacy items may not carry `buyer`). */
const buyerOf = (item: PurchaseItem): "admin" | "customer" => {
  if (item.buyer) return item.buyer;
  if (item.status === "purchased_by_admin" || item.status === "requested_admin_purchase") return "admin";
  return "customer";
};

const PurchaseListTab = ({ items, onUpdateItems, onAllPurchased, viewerRole = "admin" }: PurchaseListTabProps) => {
  const purchased = items.filter((i) => isPurchased(i.status)).length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((purchased / total) * 100);
  const totalCost = items.reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const purchasedCost = items.filter((i) => isPurchased(i.status)).reduce((s, i) => s + i.expectedPrice * i.quantity, 0);
  const allDone = total > 0 && purchased === total;

  /** Toggle the purchased state — only allowed when viewer matches buyer. */
  const toggleStatus = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const buyer = buyerOf(item);
    if (buyer !== viewerRole) {
      toast.error(buyer === "customer"
        ? "Only the customer can mark this as purchased."
        : "Only the admin can mark this as purchased.");
      return;
    }
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      const next: PurchaseItemStatus = isPurchased(it.status)
        ? buyer === "admin" ? "requested_admin_purchase" : "not_purchased"
        : buyer === "admin" ? "purchased_by_admin" : "purchased_by_customer";
      return { ...it, status: next };
    });
    onUpdateItems(updated);
    const next = updated.find((i) => i.id === id)!;
    if (isPurchased(next.status)) toast.success(`${next.name} marked as purchased`);
    if (updated.every((i) => isPurchased(i.status)) && onAllPurchased) {
      setTimeout(() => onAllPurchased(), 500);
    }
  };

  /** Hand an item across to the other side (admin ⇄ customer). Allowed for both roles. */
  const transferBuyer = (id: string) => {
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      const currentBuyer = buyerOf(it);
      const nextBuyer: "admin" | "customer" = currentBuyer === "customer" ? "admin" : "customer";
      // If item already purchased, swap into the matching purchased bucket.
      let nextStatus: PurchaseItemStatus = it.status;
      if (isPurchased(it.status)) {
        nextStatus = nextBuyer === "admin" ? "purchased_by_admin" : "purchased_by_customer";
      } else if (nextBuyer === "admin") {
        // Customer is asking admin to take care of this item.
        nextStatus = "requested_admin_purchase";
      } else {
        nextStatus = "not_purchased";
      }
      return { ...it, buyer: nextBuyer, status: nextStatus };
    });
    onUpdateItems(updated);
    const it = updated.find((i) => i.id === id)!;
    const newBuyer = buyerOf(it);
    toast(newBuyer === "admin"
      ? viewerRole === "admin" ? "You'll purchase this item" : "Admin asked to purchase this"
      : viewerRole === "admin" ? "Handed back to customer" : "You'll purchase this item");
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
            const buyer = buyerOf(item);
            const done = isPurchased(item.status);
            const canTick = buyer === viewerRole;
            const requested = item.status === "requested_admin_purchase";

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-3 transition-colors ${
                  done
                    ? "border-[hsl(142,70%,45%)]/30 bg-[hsl(142,70%,45%)]/5"
                    : requested
                      ? "border-[hsl(25,90%,55%)]/30 bg-[hsl(25,90%,55%)]/5"
                      : "border-border/40 bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Tick area — disabled when viewer is not the buyer */}
                  <button
                    onClick={() => toggleStatus(item.id)}
                    disabled={!canTick}
                    className={`flex items-start gap-2.5 flex-1 min-w-0 text-left transition-transform ${canTick ? "active:scale-[0.99]" : "cursor-not-allowed"}`}
                  >
                    <div
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
                        done
                          ? "bg-[hsl(142,70%,45%)] border-[hsl(142,70%,45%)]"
                          : canTick
                            ? "border-muted-foreground/30"
                            : "border-muted-foreground/15 bg-muted/40"
                      }`}
                    >
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Qty {item.quantity} · £{item.expectedPrice} each · £{(item.expectedPrice * item.quantity).toLocaleString()}
                      </p>

                      {/* Status chip */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {requested && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(25,90%,55%)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[hsl(25,90%,55%)]">
                            <AlertCircle className="h-2.5 w-2.5" />
                            Customer requested admin to buy
                          </span>
                        )}
                        {!done && !canTick && !requested && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            Awaiting {buyer === "customer" ? "customer" : "admin"}
                          </span>
                        )}
                        {done && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(142,70%,45%)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[hsl(142,70%,45%)]">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Purchased by {item.status === "purchased_by_admin" ? "admin" : "customer"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Right column: buyer chip + transfer */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        buyer === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {buyer === "admin" ? <UserCog className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {buyer === "admin" ? "Admin" : "Customer"}
                    </span>
                    {!done && (
                      <button
                        onClick={() => transferBuyer(item.id)}
                        className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground hover:text-foreground active:scale-95"
                      >
                        <ArrowRightLeft className="h-2.5 w-2.5" />
                        {buyer === "admin"
                          ? viewerRole === "admin" ? "Hand back" : "Take back"
                          : viewerRole === "admin" ? "Take over" : "Ask admin"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend — clarifies the per-buyer ownership rule */}
      {items.length > 0 && (
        <div className="rounded-xl bg-muted/30 border border-border/30 px-3 py-2.5 text-[9.5px] leading-relaxed text-muted-foreground">
          <p>
            <span className="font-bold text-foreground">Note:</span> only the assigned buyer can tick an item off.
            Admin handles items marked <span className="font-bold text-primary">Admin</span>; the rest are completed by the customer.
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchaseListTab;
