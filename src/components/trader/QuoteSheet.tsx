import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  Plus, Trash2, Mic, Send, PoundSterling, Edit3, Package, Wrench,
  Save, FolderOpen, ChevronDown, X, Copy, FileText, Layers, Hash,
  Clock, Tag, GripVertical, Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

/* ─── Types ─── */
export type QuoteItemType = "material" | "labour" | "custom";

export interface QuoteItem {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  type: QuoteItemType;
  unit?: string; // e.g. "hrs", "pcs", "m²"
}

export interface QuoteSheetData {
  items: QuoteItem[];
  notes: string;
  total: number;
  inspectionFee?: number;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  category: "estimate" | "inspection";
  items: Omit<QuoteItem, "id">[];
  inspectionFee?: number;
  notes?: string;
  createdAt: string;
}

interface QuoteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: "estimate" | "inspection";
  jobTitle: string;
  onSubmit: (data: QuoteSheetData) => void;
}

/* ─── Helpers ─── */
const TEMPLATES_KEY = "quote_templates";

const loadTemplates = (): QuoteTemplate[] => {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveTemplates = (templates: QuoteTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

const itemTypeConfig: Record<QuoteItemType, { label: string; icon: typeof Package; color: string; bg: string }> = {
  material: { label: "Material", icon: Package, color: "text-blue-600", bg: "bg-blue-500/10" },
  labour:   { label: "Labour",   icon: Wrench,  color: "text-primary",   bg: "bg-primary/10" },
  custom:   { label: "Custom",   icon: Tag,     color: "text-[hsl(25,90%,55%)]", bg: "bg-[hsl(25,90%,55%)]/10" },
};

const unitOptions: Record<QuoteItemType, string[]> = {
  material: ["pcs", "m", "m²", "kg", "box", "roll"],
  labour:   ["hrs", "days"],
  custom:   ["pcs", "hrs", "each", "lot"],
};

/* ─── Component ─── */
const QuoteSheet = ({ isOpen, onOpenChange, category, jobTitle, onSubmit }: QuoteSheetProps) => {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [inspectionFee, setInspectionFee] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New item form
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newType, setNewType] = useState<QuoteItemType>("material");
  const [newUnit, setNewUnit] = useState("pcs");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTemplates(loadTemplates());
    } else {
      // Reset on close
      setItems([]);
      setInspectionFee("");
      setNotes("");
      setIsRecording(false);
      setEditingId(null);
      setNewName("");
      setNewCost("");
      setNewQty("1");
      setNewType("material");
      setNewUnit("pcs");
      setShowTemplates(false);
      setShowSaveTemplate(false);
      setTemplateName("");
    }
  }, [isOpen]);

  // Update default unit when type changes
  useEffect(() => {
    setNewUnit(unitOptions[newType][0]);
  }, [newType]);

  const addItem = () => {
    if (!newName || !newCost) return;
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newName,
      cost: parseFloat(newCost) || 0,
      quantity: parseInt(newQty) || 1,
      type: newType,
      unit: newUnit,
    }]);
    setNewName("");
    setNewCost("");
    setNewQty("1");
    toast.success("Item added");
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(m => m.id !== id));

  const updateItem = (id: string, updates: Partial<QuoteItem>) =>
    setItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

  const itemsTotal = items.reduce((s, m) => s + m.cost * m.quantity, 0);
  const inspection = parseFloat(inspectionFee) || 0;
  const total = itemsTotal + (category === "inspection" ? inspection : 0);
  const canSubmit = category === "inspection" ? inspection > 0 : items.length > 0;

  // Template actions
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const tmpl: QuoteTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      category,
      items: items.map(({ id, ...rest }) => rest),
      inspectionFee: category === "inspection" ? inspection : undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [...loadTemplates(), tmpl];
    saveTemplates(updated);
    setTemplates(updated);
    setShowSaveTemplate(false);
    setTemplateName("");
    toast.success("Template saved!");
  };

  const handleLoadTemplate = (tmpl: QuoteTemplate) => {
    setItems(tmpl.items.map(item => ({ ...item, id: crypto.randomUUID() })));
    if (tmpl.inspectionFee) setInspectionFee(String(tmpl.inspectionFee));
    if (tmpl.notes) setNotes(tmpl.notes);
    setShowTemplates(false);
    toast.success(`Loaded "${tmpl.name}"`);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
    setTemplates(updated);
    toast("Template removed");
  };

  const filteredTemplates = templates.filter(t => t.category === category);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                  {category === "inspection" ? "Inspection Offer" : "Build Quote"}
                </h2>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{jobTitle}</p>
              </div>
              {/* Template actions */}
              <div className="flex items-center gap-1.5">
                {filteredTemplates.length > 0 && (
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[10px] font-bold text-foreground active:scale-95 transition-all"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Templates
                  </button>
                )}
                {items.length > 0 && (
                  <button
                    onClick={() => setShowSaveTemplate(true)}
                    className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold text-primary active:scale-95 transition-all"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Template picker overlay */}
          {showTemplates && (
            <div className="px-6 pb-3 animate-in slide-in-from-top-2 duration-200">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
                  <p className="text-[11px] font-bold text-foreground">Your Templates</p>
                  <button onClick={() => setShowTemplates(false)} className="text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  {filteredTemplates.map(tmpl => (
                    <div key={tmpl.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0">
                      <button
                        onClick={() => handleLoadTemplate(tmpl)}
                        className="flex-1 min-w-0 text-left active:opacity-70"
                      >
                        <p className="text-[12px] font-bold text-foreground truncate">{tmpl.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {tmpl.items.length} items · {new Date(tmpl.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleLoadTemplate(tmpl)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary active:scale-95"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive active:scale-95"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save template dialog */}
          {showSaveTemplate && (
            <div className="px-6 pb-3 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[11px] font-bold text-foreground mb-2">Save as Template</p>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Template name (e.g. Standard Plumbing)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground active:scale-95 disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }}
                    className="rounded-xl bg-muted px-3 py-2 text-[11px] font-bold text-muted-foreground active:scale-95"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-2">
            {/* Inspection Fee */}
            {category === "inspection" && (
              <div className="mb-6">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Your Inspection Fee
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 focus-within:border-[hsl(25,90%,55%)]/50 transition-colors">
                  <PoundSterling className="h-5 w-5 text-[hsl(25,90%,55%)] shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inspectionFee}
                    onChange={(e) => setInspectionFee(e.target.value)}
                    className="flex-1 bg-transparent text-xl font-black text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            )}

            {/* Quote Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quote Items {items.length > 0 && `(${items.length})`}
                </label>
                {items.length > 0 && (
                  <span className="text-[10px] font-bold text-primary">
                    Subtotal: £{itemsTotal.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Existing items */}
              {items.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {items.map((item) => {
                    const cfg = itemTypeConfig[item.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={item.id} className="group rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20">
                        <div className="flex items-start gap-2.5">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingId === item.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                onBlur={() => setEditingId(null)}
                                className="w-full bg-transparent text-[12px] font-bold text-foreground outline-none border-b border-primary/30"
                              />
                            ) : (
                              <p className="text-[12px] font-bold text-foreground truncate">{item.name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {item.quantity} {item.unit || "pcs"} × £{item.cost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[12px] font-extrabold text-foreground">
                              £{(item.cost * item.quantity).toFixed(2)}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingId(item.id)} className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                                <Edit3 className="h-2.5 w-2.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => removeItem(item.id)} className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="h-2.5 w-2.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Item Form */}
              <div className="rounded-2xl border border-dashed border-border bg-accent/30 p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Add New Item
                </p>

                {/* Type selector chips */}
                <div className="flex gap-1.5 mb-3">
                  {(Object.keys(itemTypeConfig) as QuoteItemType[]).map((type) => {
                    const cfg = itemTypeConfig[type];
                    const Icon = cfg.icon;
                    const isActive = newType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95 ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} ring-1 ring-current/20`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Name */}
                <input
                  type="text"
                  placeholder={
                    newType === "material"
                      ? "e.g. Copper pipe 15mm"
                      : newType === "labour"
                      ? "e.g. Senior plumber"
                      : "e.g. Site cleanup"
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-transparent text-[12px] font-bold text-foreground outline-none placeholder:text-muted-foreground/50 mb-3"
                />

                {/* Cost + Quantity + Unit row */}
                <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                  <div className="flex items-center gap-1 flex-1">
                    <PoundSterling className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Price"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-full bg-transparent text-[12px] font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="Qty"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-12 bg-transparent text-[12px] font-bold text-foreground outline-none placeholder:text-muted-foreground/50 text-center"
                    />
                  </div>

                  {/* Unit picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTypeMenu(!showTypeMenu)}
                      className="flex items-center gap-0.5 rounded-lg bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground"
                    >
                      {newUnit}
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                    {showTypeMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTypeMenu(false)} />
                        <div className="absolute right-0 bottom-full mb-1 z-20 rounded-xl bg-card border border-border shadow-lg overflow-hidden min-w-[80px]">
                          {unitOptions[newType].map(u => (
                            <button
                              key={u}
                              onClick={() => { setNewUnit(u); setShowTypeMenu(false); }}
                              className={`w-full px-3 py-1.5 text-[10px] font-bold text-left hover:bg-accent transition-colors ${
                                u === newUnit ? "text-primary bg-primary/5" : "text-foreground"
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={addItem}
                    disabled={!newName || !newCost}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground active:scale-95 disabled:opacity-40 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Notes & Voice */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Notes</label>
                <textarea
                  placeholder="Explain the work, timeline or warranty..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card p-3 text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground/50 resize-none focus:border-primary/30"
                />
              </div>

              <button
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (isRecording) toast.success("Voice note attached!");
                  else toast.info("Listening... (Speak now)");
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all active:scale-[0.98] ${
                  isRecording ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isRecording ? "bg-destructive animate-pulse" : "bg-primary"}`}>
                  <Mic className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-foreground">{isRecording ? "Recording..." : "Add Voice Message"}</p>
                  <p className="text-[9px] text-muted-foreground">{isRecording ? "Tap to stop" : "Explain quote to customer"}</p>
                </div>
              </button>
            </div>
          </ScrollArea>

          {/* Summary & Submit */}
          <div className="px-6 py-5 bg-background border-t border-border/50 shadow-[0_-8px_16px_-12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-foreground">£{total.toFixed(2)}</span>
              </div>
              <div className="text-right">
                {items.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                )}
                {category === "inspection" && inspection > 0 && (
                  <p className="text-[10px] font-bold text-[hsl(25,90%,55%)]">Inc. £{inspection.toFixed(2)} inspection</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border border-border py-3.5 text-[12px] font-bold text-muted-foreground active:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit({ items, total, notes, inspectionFee: category === "inspection" ? inspection : undefined })}
                disabled={!canSubmit}
                className={`flex-[2.5] rounded-xl py-3.5 text-[12px] font-bold text-primary-foreground shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
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
