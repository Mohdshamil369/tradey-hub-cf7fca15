import React, { useState } from "react";
import { Drawer } from "vaul";
import { Plus, Trash2, Mic, Send, PoundSterling, Search, Edit3, Check, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { catAServices, type Service } from "@/data/services";

export interface QuoteItem {
  id: string;
  name: string;
  cost: number;
  description?: string;
  type: "service" | "material" | "labour";
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
  const [showServices, setShowServices] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setNewMaterialName("");
      setNewMaterialCost("");
      setInspectionFee("");
      setNotes("");
      setIsRecording(false);
      setShowServices(false);
    }
  }, [isOpen]);

  const addItem = (item: Omit<QuoteItem, "id">) => {
    setItems(prev => [...prev, { ...item, id: crypto.randomUUID() }]);
    toast.success(`'${item.name}' added`);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const itemsTotal = items.reduce((s, i) => s + i.cost, 0);
  const inspection = parseFloat(inspectionFee) || 0;
  const total = itemsTotal + (category === "inspection" ? inspection : 0);

  const canSubmit = category === "inspection" ? inspection > 0 : total > 0;

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={onOpenChange}
      container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-white outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-xl font-extrabold text-[#1E293B]">
              {category === "inspection" ? "Inspection Offer" : "Build Quote"}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">{jobTitle}</p>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-2">
            {/* Inspection Fee Section */}
            {category === "inspection" && (
              <div className="mt-4 mb-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 block">
                  Visiting & Inspection Fee
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 group focus-within:border-orange-500/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Fee Amount</p>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-[#1E293B] mr-1">£</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={inspectionFee}
                        onChange={(e) => setInspectionFee(e.target.value)}
                        className="bg-transparent text-xl font-extrabold text-[#1E293B] outline-none placeholder:text-[#CBD5E1] w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Add Services Component */}
            <div className="mb-6">
              <button 
                onClick={() => setShowServices(!showServices)}
                className="w-full flex items-center justify-between py-2 border-b border-[#F1F5F9]"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Associated Services</span>
                {showServices ? <ChevronUp className="h-4 w-4 text-[#94A3B8]" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8]" />}
              </button>
              
              {showServices && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {catAServices.slice(0, 6).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => addItem({ name: service.name, cost: service.price || 0, type: "service", description: service.description })}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[#F1F5F9] bg-white hover:border-primary/30 transition-all text-left group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">{service.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#1E293B] truncate">{service.name}</p>
                        <p className="text-[10px] font-bold text-primary">£{service.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quote Items Section */}
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-4 block">
                Line Items {items.length > 0 && `(${items.length})`}
              </label>

              {items.length > 0 && (
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl border border-[#F1F5F9] bg-white p-4 transition-all hover:border-[#E2E8F0] shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
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
                            <h4 className="text-sm font-bold text-[#1E293B] truncate">{item.name}</h4>
                          )}
                          <p className="text-[10px] text-[#64748B] mt-0.5">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm font-extrabold text-[#1E293B]">£</span>
                            {editingId === item.id ? (
                              <input
                                autoFocus
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

              {/* Custom Add Component */}
              <div className="rounded-[24px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 border-dashed">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Copper Pipe, Labour)"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
                  />
                  <div className="flex items-center justify-between gap-4">
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
                          addItem({ name: newMaterialName, cost: parseFloat(newMaterialCost), type: "material" });
                          setNewMaterialName("");
                          setNewMaterialCost("");
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-[#1E293B] shadow-sm border border-[#E2E8F0] active:scale-95 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      Add Item
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
                  <p className="text-[10px] text-[#64748B]">{isRecording ? "Tap to stop" : "Better for Cat-B custom requests"}</p>
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
                  category === "inspection" ? "bg-orange-500 shadow-orange-500/20" : "bg-primary shadow-primary/20"
                }`}
              >
                <Send className="h-4 w-4" />
                {category === "inspection" ? "Send Inspection Offer" : "Submit Quote Offer"}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default QuoteSheet;
