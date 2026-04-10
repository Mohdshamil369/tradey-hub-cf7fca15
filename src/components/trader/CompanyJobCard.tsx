import { useState } from "react";
import {
  MapPin, Clock, CheckCircle2, XCircle, ChevronDown, Building2, Shield, Send,
  Plus, Trash2, Wrench, Image as ImageIcon, Hourglass, PoundSterling,
} from "lucide-react";

export interface CompanyJobData {
  id: string;
  type: "company";
  title: string;
  icon: string;
  companyName: string;
  companyLogo?: string;
  distance: string;
  price: number | null;
  timeWindow: string;
  description: string;
  postedAgo: string;
  basePayRate?: number;
  customerRequest?: {
    photos?: string[];
    expectedDuration?: string;
    expectedBudget?: number;
    hasVoiceNote?: boolean;
    voiceDuration?: string;
  };
}

interface CompanyJobCardProps {
  job: CompanyJobData;
  expanded: boolean;
  onToggleExpand: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onSubmitEstimate?: (data: { materials: { description: string; quantity: number; unitPrice: number }[]; materialsTotal: number; labourHours: number; labourTotal: number; grandTotal: number }) => void;
}

interface MaterialItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CompanyJobCard = ({ job, expanded, onToggleExpand, onAccept, onDecline, onSubmitEstimate }: CompanyJobCardProps) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [estimatedHours, setEstimatedHours] = useState(1);
  const isQuote = !job.price;
  const baseRate = job.basePayRate ?? 45;

  const addItem = () => setMaterials((prev) => [...prev, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => { if (materials.length > 1) setMaterials((prev) => prev.filter((m) => m.id !== id)); };
  const updateItem = (id: string, field: keyof MaterialItem, value: string | number) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const materialsTotal = materials.reduce((s, m) => s + m.quantity * m.unitPrice, 0);
  const labourTotal = estimatedHours * baseRate;
  const grandTotal = materialsTotal + labourTotal;

  const handleSubmitEstimate = () => {
    const validItems = materials.filter((m) => m.description.trim() && m.unitPrice > 0);
    onSubmitEstimate?.({
      materials: validItems,
      materialsTotal,
      labourHours: estimatedHours,
      labourTotal,
      grandTotal,
    });
  };

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-primary/20">
      {/* Company proxy banner */}
      <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 border-b border-primary/10">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Company Assignment</span>
        <div className="ml-auto flex items-center gap-1">
          <Shield className="h-3 w-3 text-primary/60" />
          <span className="text-[9px] text-primary/60 font-semibold">Proxy</span>
        </div>
      </div>

      {/* Header */}
      <button onClick={onToggleExpand} className="w-full px-4 py-3.5 text-left">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
                <p className="text-[11px] font-semibold text-primary truncate">{job.companyName}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                {job.price ? (
                  <span className="text-[15px] font-extrabold text-primary">£{job.price}</span>
                ) : (
                  <span className="rounded-lg bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[10px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.timeWindow}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-border bg-muted/30">
          <div className="px-4 py-3 border-b border-border">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />{job.distance} away
            </span>
          </div>

          {/* Proxy notice */}
          <div className="px-4 py-2.5 border-b border-border bg-primary/5">
            <p className="text-[10px] text-primary/80 leading-relaxed flex items-start gap-1.5">
              <Shield className="h-3 w-3 shrink-0 mt-0.5" />
              You'll be working as a representative of <strong>{job.companyName}</strong>. No direct customer contact info provided.
            </p>
          </div>

          {job.description && (
            <div className="px-4 py-3.5 border-b border-border">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Details</p>
              <p className="text-xs text-foreground leading-relaxed">{job.description}</p>
            </div>
          )}

          {/* Customer request metadata — no customer name/address for proxy workers */}
          {job.customerRequest && (
            <div className="px-4 py-3 border-b border-border space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Request Details</p>
              {job.customerRequest.expectedDuration && (
                <div className="flex items-center gap-2 text-[11px]">
                  <Hourglass className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Expected duration:</span>
                  <span className="font-semibold text-foreground">{job.customerRequest.expectedDuration}</span>
                </div>
              )}
              {job.customerRequest.photos && job.customerRequest.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ImageIcon className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-semibold">{job.customerRequest.photos.length} photo(s)</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {job.customerRequest.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`Job photo ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-border shrink-0" />
                    ))}
                  </div>
                </div>
              )}
              {job.customerRequest.hasVoiceNote && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">🎤 Voice note:</span>
                  <span className="font-semibold text-foreground">{job.customerRequest.voiceDuration || "0:15"}</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground italic">Customer name & address hidden — proxy assignment via {job.companyName}</p>
            </div>
          )}

          {/* Inline estimate form for quote jobs */}
          {isQuote && (
            <div className="px-4 py-3.5 space-y-3">
              {/* Labour — base pay from agency */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Labour Cost</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Base Pay Rate (set by {job.companyName})</span>
                    <span className="text-xs font-bold text-foreground">£{baseRate.toFixed(2)}/hr</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">Estimated Hours</label>
                    <input
                      type="number" min={0.5} step={0.5} value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Math.max(0.5, Number(e.target.value)))}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground">Labour Subtotal</span>
                    <span className="text-xs font-bold text-primary">£{labourTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Materials & Items</p>
                {materials.map((item, idx) => (
                  <div key={item.id} className="rounded-xl border border-border bg-card p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Item #{idx + 1}</span>
                      {materials.length > 1 && (
                        <button onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text" placeholder="e.g. Copper pipes (2m)" value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] text-muted-foreground">Qty</label>
                        <input type="number" min={1} value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Math.max(1, Number(e.target.value)))}
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-muted-foreground">Unit £</label>
                        <input type="number" min={0} step={0.01} value={item.unitPrice || ""}
                          onChange={(e) => updateItem(item.id, "unitPrice", Math.max(0, Number(e.target.value)))}
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-muted-foreground">Subtotal</label>
                        <div className="rounded-lg border border-border bg-accent/40 px-2.5 py-1.5 text-xs font-semibold text-foreground">
                          £{(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addItem}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </button>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-accent/50 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Labour ({estimatedHours}h × £{baseRate}/hr)</span>
                  <span className="font-semibold text-foreground">£{labourTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Materials & Items</span>
                  <span className="font-semibold text-foreground">£{materialsTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Estimated Total</span>
                    <span className="text-sm font-extrabold text-primary">£{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center border-t border-border px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
          <MapPin className="h-3.5 w-3.5" />{job.distance}
        </span>
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            onClick={onDecline}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground transition-colors active:bg-muted"
          >
            <XCircle className="h-3.5 w-3.5" />Decline
          </button>
          {isQuote && expanded ? (
            <button
              onClick={handleSubmitEstimate}
              disabled={grandTotal <= 0}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors active:opacity-90 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />Send Estimate
            </button>
          ) : (
            <button
              onClick={isQuote ? onToggleExpand : onAccept}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors active:opacity-90"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />{isQuote ? "Send Estimate" : "Accept"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyJobCard;
