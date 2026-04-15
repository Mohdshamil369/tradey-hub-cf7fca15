import { useState, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PoundSterling, ChevronDown, Save, Undo2 } from "lucide-react";
import { serviceCategories, catAServices, catBServices } from "@/data/services";
import { EmojiIcon, getEmojiIconColors } from "@/lib/icons";
import { toast } from "sonner";

interface BasePayEntry {
  serviceId: string;
  name: string;
  icon: string;
  categoryId: string;
  basePay: number;
}

const categories = serviceCategories.filter((c) => c.id !== "all");

const buildInitial = (): BasePayEntry[] => [
  ...catAServices.map((s) => ({ serviceId: s.id, name: s.name, icon: s.icon, categoryId: s.categoryId, basePay: 30 })),
  ...catBServices.map((s) => ({ serviceId: s.id, name: s.name, icon: s.icon, categoryId: s.categoryId, basePay: 25 })),
];

const BasePayConfig = () => {
  const navigate = useNavigate();
  const [savedEntries, setSavedEntries] = useState(buildInitial);
  const [entries, setEntries] = useState(buildInitial);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const hasChanges = useMemo(
    () => JSON.stringify(entries) !== JSON.stringify(savedEntries),
    [entries, savedEntries]
  );

  const updateEntry = (serviceId: string, value: string) => {
    const num = value === "" ? 0 : parseFloat(value);
    if (isNaN(num)) return;
    setEntries((prev) =>
      prev.map((e) => (e.serviceId === serviceId ? { ...e, basePay: num } : e))
    );
  };

  const bulkUpdate = (categoryId: string, amount: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.categoryId === categoryId ? { ...e, basePay: amount } : e))
    );
  };

  const handleSave = () => {
    const invalid = entries.some((e) => e.basePay <= 0);
    if (invalid) {
      toast.error("All rates must be greater than £0");
      return;
    }
    setSavedEntries([...entries]);
    toast.success("All base pay rates saved!");
  };

  const handleDiscard = () => {
    setEntries([...savedEntries]);
    toast("Changes discarded");
  };

  return (
    <MobileLayout role="trader">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button onClick={() => navigate("/trader/services")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground font-heading">Base Pay Rates</h1>
          <p className="text-xs text-muted-foreground">Set hourly rates per service for your workers</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mb-4 rounded-2xl bg-primary/5 border border-primary/10 p-3.5">
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-bold">How it works:</span> Base pay is the hourly rate paid to your team members.
          Worker pay = <span className="font-bold text-primary">Base Pay × Hours Worked</span>.
          Each service category can have different rates.
        </p>
      </div>

      <div className="px-4 pb-24">
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => {
            const catEntries = entries.filter((e) => e.categoryId === cat.id);
            if (catEntries.length === 0) return null;
            const isExpanded = expandedCat === cat.id;
            const avgPay = Math.round(catEntries.reduce((s, e) => s + e.basePay, 0) / catEntries.length);

            return (
              <div key={cat.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
                    <p className="text-[11px] text-muted-foreground">{catEntries.length} services · avg £{avgPay}/hr</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Bulk update */}
                    <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Set all to:</span>
                      {[20, 25, 30, 35].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => bulkUpdate(cat.id, amt)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                            avgPay === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          £{amt}
                        </button>
                      ))}
                    </div>

                    {catEntries.map((entry) => (
                      <div key={entry.serviceId} className="flex items-center gap-3 border-b border-border last:border-0 px-4 py-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getEmojiIconColors(entry.icon).bg} bg-opacity-40`}>
                          <EmojiIcon emoji={entry.icon} size={16} weight="regular" colorize />
                        </div>
                        <span className="flex-1 text-xs font-semibold text-foreground truncate">{entry.name}</span>
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5">
                          <PoundSterling className="h-3 w-3 text-primary" />
                          <input
                            type="number"
                            value={entry.basePay || ""}
                            onChange={(e) => updateEntry(entry.serviceId, e.target.value)}
                            className="w-12 bg-transparent text-xs font-bold text-foreground outline-none"
                          />
                          <span className="text-[10px] text-muted-foreground">/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Universal Save / Discard bar */}
      {hasChanges && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center">
          <div className="w-full border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-bold text-foreground transition-all active:scale-95"
            >
              <Undo2 className="h-4 w-4" />
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all active:scale-95"
            >
              <Save className="h-4 w-4" />
              Save All
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default BasePayConfig;
