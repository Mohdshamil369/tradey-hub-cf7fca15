import { PoundSterling } from "lucide-react";

interface AdvancePaymentFieldProps {
  /** Bill subtotal used for the % computation. Pass quote/estimate total. */
  total: number;
  mode: "percent" | "amount";
  percent: number;
  amount: string;
  onModeChange: (m: "percent" | "amount") => void;
  onPercentChange: (p: number) => void;
  onAmountChange: (a: string) => void;
  /** Quick-pick values for the percentage mode. Defaults to [0, 20, 30, 50]. */
  presets?: number[];
  /** Optional helper text under the title. */
  hint?: string;
  /** Defaults to "Advance Payment". */
  label?: string;
}

/**
 * Reusable advance-payment input.
 * Used by EstimateSheet and QuoteSheet so the UI + maths are identical.
 * Add changes (presets, range bounds, currency) here once — they propagate everywhere.
 */
const AdvancePaymentField = ({
  total,
  mode,
  percent,
  amount,
  onModeChange,
  onPercentChange,
  onAmountChange,
  presets = [0, 20, 30, 50],
  hint,
  label = "Advance Payment",
}: AdvancePaymentFieldProps) => {
  const computed = mode === "percent"
    ? +(total * percent / 100).toFixed(2)
    : (parseFloat(amount) || 0);
  const remaining = Math.max(0, total - computed);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="min-w-0">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
          {hint && (
            <p className="text-[9.5px] text-muted-foreground/80 mt-0.5">{hint}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onModeChange("percent")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              mode === "percent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => onModeChange("amount")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              mode === "amount" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            £
          </button>
        </div>
      </div>

      {mode === "percent" ? (
        <>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPercentChange(p)}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  percent === p
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-foreground active:bg-muted"
                }`}
              >
                {p === 0 ? "None" : `${p}%`}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={percent}
            onChange={(e) => onPercentChange(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 focus-within:border-primary/50 transition-colors">
          <PoundSterling className="h-4 w-4 text-primary shrink-0" />
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="flex-1 bg-transparent text-[15px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      )}

      {computed > 0 && (
        <div className="mt-2 rounded-xl bg-primary/5 border border-primary/10 p-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Advance{mode === "percent" ? ` (${percent}%)` : ""}
            </span>
            <span className="text-[12px] font-extrabold text-primary">£{computed.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Remaining on completion</span>
            <span className="text-[11px] font-bold text-foreground">£{remaining.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePaymentField;
