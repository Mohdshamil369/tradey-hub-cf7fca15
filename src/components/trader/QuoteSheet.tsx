import React, { useState } from "react";
import { Drawer } from "vaul";
import { Plus, Trash2, Mic, Send, PoundSterling, Edit3, Package, Wrench } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export interface QuoteItem {
  id: string;
  name: string;
  cost: number;
  type: "material" | "labour" | "custom";
}

export interface QuoteSheetData {
  items: QuoteItem[];
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
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialCost, setNewMaterialCost] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Reset state when sheet closes
  React.useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setNewMaterialName("");
      setNewMaterialCost("");
      setInspectionFee("");
      setNotes("");
      setIsRecording(false);
      setEditingId(null);
    }
  }, [isOpen]);

  const addItem = (item: Omit<QuoteItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    toast.success("Item added");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const itemsTotal = items.reduce((s, m) => s + m.cost, 0);
  const inspection = parseFloat(inspectionFee) || 0;
  const total = itemsTotal + (category === "inspection" ? inspection : 0);

  const canSubmit = category === "inspection"
    ? inspection > 0
    : items.length > 0;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden sm:max-w-[420px]">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-[#E2E8F0]" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-extrabold text-[#1E293B] tracking-tight">
              {category === "inspection" ? "Inspection Offer" : "Build Quote Offer"}
            </h2>
            <p className="text-[13px] font-semibold text-[#64748B] mt-1">{jobTitle}</p>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-2">
            {/* Inspection Fee — inspection only */}
            {category === "inspection" && (
              <div className="mb-8">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3 block">
                  Your Inspection Fee
                </label>
                <div className="flex items-center gap-2 rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-sm focus-within:border-orange-500/50 transition-colors">
                  <PoundSterling className="h-5 w-5 text-orange-500 shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inspectionFee}
                    onChange={(e) => setInspectionFee(e.target.value)}
                    className="flex-1 bg-transparent text-2xl font-black text-[#1E293B] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>
            )}

            {/* Custom Key-Value Item Builder */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 mt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Quote Items {items.length > 0 && `(${items.length})`}
                </label>
              </div>

              {items.length > 0 && (
                <div className="mb-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-3 hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          {editingId === item.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, { name: e.target.value })}
                              onBlur={() => setEditingId(null)}
                              className="w-full bg-transparent text-sm font-bold text-[#1E293B] outline-none border-b border-primary/30"
                            />
                          ) : (
                            <p className="text-sm font-bold text-[#1E293B] truncate">{item.name}</p>
                          )}
                          <p className="text-[10px] text-[#64748B] mt-0.5 capitalize">{item.type}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm font-extrabold text-[#1E293B]">£</span>
                            {editingId === item.id ? (
                              <input
                                type="number"
                                value={item.cost}
                                onChange={(e) => updateItem(item.id, { cost: parseFloat(e.target.value) || 0 })}
                                onBlur={() => setEditingId(null)}
                                className="w-16 bg-transparent text-sm font-extrabold text-[#1E293B] outline-none text-right border-b border-primary/30"
                              />
                            ) : (
                              <span className="text-sm font-extrabold text-[#1E293B]">{item.cost.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingId(item.id)} className="h-6 w-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-primary">
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button onClick={() => removeItem(item.id)} className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Field row */}
              <div className="rounded-[24px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 border-dashed relative">
                <p className="absolute -top-2 left-4 bg-[#F8FAFC] px-1 text-[9px] font-bold text-[#64748B] uppercase">Add New Item</p>
                <div className="space-y-3 pt-1">
                  <input
                    type="text"
                    placeholder="Enter item name (e.g., Boiler part, Labour hours)"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
                  />
                  <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] pt-3">
                    <div className="flex items-center gap-2">
                       <PoundSterling className="h-4 w-4 text-[#94A3B8]" />
                       <input
                        type="number"
                        placeholder="Price"
                        value={newMaterialCost}
                        onChange={(e) => setNewMaterialCost(e.target.value)}
                        className="w-24 bg-transparent text-sm font-bold text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (newMaterialName && newMaterialCost) {
                          addItem({ name: newMaterialName, cost: parseFloat(newMaterialCost), type: "custom" });
                          setNewMaterialName("");
                          setNewMaterialCost("");
                        }
                      }}
                      disabled={!newMaterialName || !newMaterialCost}
                      className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-[#1E293B] shadow-sm border border-[#E2E8F0] active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Voice */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 block">Notes</label>
                <textarea
                  placeholder="Explain the work, timeline or warranty..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs font-medium text-[#1E293B] outline-none placeholder:text-[#94A3B8] aspect-video resize-none focus:border-primary/30"
                />
              </div>

              <button
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (isRecording) toast.success("Voice note attached!");
                  else toast.info("Listening... (Speak now)");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 transition-all active:scale-[0.98] ${
                  isRecording ? "border-red-500/30 bg-red-50/50" : "border-[#E2E8F0] bg-[#F8FAFC]"
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-primary"}`}>
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#1E293B]">{isRecording ? "Recording..." : "Add Voice Message"}</p>
                  <p className="text-[10px] text-[#64748B]">{isRecording ? "Tap to stop" : "Explain quote to customer"}</p>
                </div>
              </button>
            </div>
          </ScrollArea>

          {/* Dynamic Summary & Submit */}
          <div className="px-6 py-6 bg-white border-t border-[#F1F5F9] shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Expected Total</span>
                <span className="text-2xl font-black text-[#1E293B]">£{total.toFixed(2)}</span>
              </div>
              {category === "inspection" && inspection > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-orange-500 uppercase">Inc. Inspection</span>
                  <p className="text-xs font-bold text-[#64748B]">£{inspection.toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-2xl border border-[#E2E8F0] py-4 text-xs font-bold text-[#64748B] active:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit({ items, total, notes, inspectionFee: category === "inspection" ? inspection : undefined })}
                disabled={!canSubmit}
                className={`flex-[2.5] rounded-2xl py-4 text-xs font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                  category === "inspection" ? "bg-[hsl(25,90%,55%)] shadow-orange-500/20" : "bg-primary shadow-primary/20"
                }`}
              >
                <Send className="h-4 w-4" />
                {category === "inspection" ? "Send Inspection" : "Submit Quote"}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default QuoteSheet;
