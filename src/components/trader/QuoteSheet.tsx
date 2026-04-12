import React, { useState } from "react";
import { Drawer } from "vaul";
import { Plus, Trash2, Mic, Send, PoundSterling } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export interface MaterialItem {
  id: string;
  name: string;
  cost: number;
}

export interface QuoteSheetData {
  materials: MaterialItem[];
  labourCharge: number;
  notes: string;
  total: number;
  inspectionFee?: number;
}

interface QuoteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: "estimate" | "inspection";
  jobTitle: string;
  onSubmit: (data: QuoteSheetData) => void;
}

const QuoteSheet = ({ isOpen, onOpenChange, category, jobTitle, onSubmit }: QuoteSheetProps) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialCost, setNewMaterialCost] = useState("");
  const [labourCharge, setLabourCharge] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Reset state when sheet closes
  React.useEffect(() => {
    if (!isOpen) {
      setMaterials([]);
      setNewMaterialName("");
      setNewMaterialCost("");
      setLabourCharge("");
      setInspectionFee("");
      setNotes("");
      setIsRecording(false);
    }
  }, [isOpen]);

  const addMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialCost) return;
    setMaterials(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newMaterialName.trim(),
      cost: parseFloat(newMaterialCost) || 0,
    }]);
    setNewMaterialName("");
    setNewMaterialCost("");
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const materialsTotal = materials.reduce((s, m) => s + m.cost, 0);
  const labour = parseFloat(labourCharge) || 0;
  const inspection = parseFloat(inspectionFee) || 0;
  const total = materialsTotal + labour + (category === "inspection" ? inspection : 0);

  const canSubmit = category === "inspection"
    ? inspection > 0
    : (materials.length > 0 || labour > 0);

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={onOpenChange}
      container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-lg font-bold text-foreground">
              {category === "inspection" ? "Inspection Quote" : "Send Estimate"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{jobTitle}</p>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto px-5 pb-2">
            {/* Inspection Fee — inspection only */}
            {category === "inspection" && (
              <div className="mb-5">
                <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
                  Your Inspection Fee
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
                  <PoundSterling className="h-4 w-4 text-primary shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inspectionFee}
                    onChange={(e) => setInspectionFee(e.target.value)}
                    className="flex-1 bg-transparent text-lg font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            )}

            {/* Materials */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
                Materials {materials.length > 0 && `(${materials.length})`}
              </label>

              {materials.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {materials.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2.5">
                      <span className="text-xs font-medium text-foreground truncate flex-1 mr-2">{m.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-foreground">£{m.cost.toFixed(2)}</span>
                        <button onClick={() => removeMaterial(m.id)} className="text-muted-foreground active:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Material name"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50"
                />
                <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 w-24 shrink-0">
                  <PoundSterling className="h-3 w-3 text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={newMaterialCost}
                    onChange={(e) => setNewMaterialCost(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
                <button
                  onClick={addMaterial}
                  disabled={!newMaterialName.trim() || !newMaterialCost}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Labour Charge */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
                Labour Charge
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
                <PoundSterling className="h-4 w-4 text-primary shrink-0" />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={labourCharge}
                  onChange={(e) => setLabourCharge(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
                Notes to Customer
              </label>
              <textarea
                placeholder="Add any notes about the job, timeline, or conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-xs text-foreground leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 resize-none"
              />
            </div>

            {/* Voice Note */}
            <div className="mb-6">
              <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 block px-1">
                Voice Message (optional)
              </label>
              <button
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (isRecording) toast.success("Voice note recorded!");
                  else toast.info("Recording started... (demo)");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all active:scale-[0.98] ${
                  isRecording
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-card"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isRecording ? "bg-destructive animate-pulse" : "bg-primary"
                }`}>
                  <Mic className={`h-4 w-4 ${isRecording ? "text-white" : "text-primary-foreground"}`} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">
                    {isRecording ? "Recording… Tap to stop" : "Record Voice Note"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRecording ? "Tap to finish recording" : "Explain the quote to the customer"}
                  </p>
                </div>
              </button>
            </div>

            {/* Quote Summary */}
            {(materialsTotal > 0 || labour > 0 || inspection > 0) && (
              <div className="mb-6 rounded-2xl bg-accent/50 p-4 border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3">Quote Summary</p>
                <div className="space-y-2">
                  {category === "inspection" && inspection > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Inspection Fee</span>
                      <span className="font-semibold text-foreground">£{inspection.toFixed(2)}</span>
                    </div>
                  )}
                  {materialsTotal > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Materials ({materials.length} items)</span>
                      <span className="font-semibold text-foreground">£{materialsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {labour > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Labour</span>
                      <span className="font-semibold text-foreground">£{labour.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <span className="text-sm font-extrabold text-primary">£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Submit Footer */}
          <div className="flex gap-3 p-4 bg-background border-t border-border">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ materials, labourCharge: labour, notes, total, inspectionFee: category === "inspection" ? inspection : undefined })}
              disabled={!canSubmit}
              className={`flex-[2] rounded-2xl py-4 text-sm font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                category === "inspection"
                  ? "bg-[hsl(25,90%,55%)] text-white shadow-orange-500/20"
                  : "bg-primary text-primary-foreground shadow-primary/20"
              }`}
            >
              <Send className="h-4 w-4" />
              Send Quote • £{total.toFixed(2)}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default QuoteSheet;
