import { useMemo } from "react";
import { PoundSterling, TrendingUp, TrendingDown, FileText, Plus, Wallet, Receipt } from "lucide-react";
import { toast } from "sonner";

interface JobFinancesTabProps {
  jobId: string;
  budget: number; // total quoted/agreed
}

interface LineItem {
  id: string;
  label: string;
  amount: number;
  date: string;
  category: "materials" | "labour" | "expense" | "payout";
  member?: string;
}

// Mock ledger — keyed per job
const ledger: Record<string, LineItem[]> = {
  j5: [
    { id: "l1", label: "Paint (20L matt white)", amount: 320, date: "14 Mar", category: "materials" },
    { id: "l2", label: "Premium trim paint (5L)", amount: 95, date: "14 Mar", category: "materials" },
    { id: "l3", label: "Brushes & rollers", amount: 48, date: "14 Mar", category: "materials" },
    { id: "l4", label: "Lena K. — 22h prep & first coat", amount: 660, date: "16 Mar", category: "labour", member: "Lena K." },
    { id: "l5", label: "Tom B. — 18h trim & doors", amount: 540, date: "18 Mar", category: "labour", member: "Tom B." },
    { id: "l6", label: "Site parking", amount: 24, date: "18 Mar", category: "expense" },
    { id: "l7", label: "Customer 50% deposit", amount: 2400, date: "13 Mar", category: "payout" },
  ],
};

const catStyle: Record<LineItem["category"], string> = {
  materials: "bg-blue-500/10 text-blue-600",
  labour: "bg-primary/10 text-primary",
  expense: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",
  payout: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
};

const JobFinancesTab = ({ jobId, budget }: JobFinancesTabProps) => {
  const items = ledger[jobId] ?? [];

  const { spent, paid, profit, byCat } = useMemo(() => {
    const spent = items
      .filter((i) => i.category !== "payout")
      .reduce((s, i) => s + i.amount, 0);
    const paid = items
      .filter((i) => i.category === "payout")
      .reduce((s, i) => s + i.amount, 0);
    const profit = budget - spent;
    const byCat: Record<string, number> = { materials: 0, labour: 0, expense: 0 };
    items.forEach((i) => {
      if (i.category !== "payout") byCat[i.category] = (byCat[i.category] || 0) + i.amount;
    });
    return { spent, paid, profit, byCat };
  }, [items, budget]);

  const spentPct = Math.min(100, Math.round((spent / Math.max(budget, 1)) * 100));

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Budget overview */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Budget</p>
            <p className="text-xl font-extrabold text-foreground">£{budget.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spent</p>
            <p className="text-xl font-extrabold text-foreground">£{spent.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${spentPct > 90 ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">{spentPct}% of budget used</span>
          <span className={`flex items-center gap-1 font-bold ${profit >= 0 ? "text-[hsl(142,70%,45%)]" : "text-destructive"}`}>
            {profit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            £{Math.abs(profit).toLocaleString()} {profit >= 0 ? "margin" : "over"}
          </span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border/30 bg-card p-2.5 text-center">
          <p className="text-[14px] font-extrabold text-blue-600">£{byCat.materials || 0}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Materials</p>
        </div>
        <div className="rounded-xl border border-border/30 bg-card p-2.5 text-center">
          <p className="text-[14px] font-extrabold text-primary">£{byCat.labour || 0}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Labour</p>
        </div>
        <div className="rounded-xl border border-border/30 bg-card p-2.5 text-center">
          <p className="text-[14px] font-extrabold text-[hsl(25,90%,55%)]">£{byCat.expense || 0}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Expenses</p>
        </div>
      </div>

      {/* Customer payments */}
      <div className="rounded-2xl border border-[hsl(142,70%,45%)]/20 bg-[hsl(142,70%,45%)]/5 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[hsl(142,70%,45%)]" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Customer payments</p>
              <p className="text-[10px] text-muted-foreground">£{paid.toLocaleString()} of £{budget.toLocaleString()} received</p>
            </div>
          </div>
          <button
            onClick={() => toast.success("Invoice sent to customer")}
            className="rounded-lg bg-[hsl(142,70%,45%)] px-2.5 py-1.5 text-[10px] font-bold text-white"
          >
            Send Invoice
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Receipt className="h-3 w-3" /> Ledger
          </h3>
          <button
            onClick={() => toast.info("Add expense — coming soon")}
            className="flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-bold text-foreground active:bg-muted"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-[11px] text-muted-foreground">No financial entries yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {items.map((i) => (
              <div key={i.id} className="rounded-xl border border-border/30 bg-card px-3 py-2.5 flex items-center gap-3">
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${catStyle[i.category]}`}>
                  {i.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{i.label}</p>
                  <p className="text-[9px] text-muted-foreground">{i.date}</p>
                </div>
                <p className={`text-[12px] font-extrabold ${i.category === "payout" ? "text-[hsl(142,70%,45%)]" : "text-foreground"}`}>
                  {i.category === "payout" ? "+" : "−"}£{i.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFinancesTab;
