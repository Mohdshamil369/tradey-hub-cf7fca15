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
  description?: string; // Optional description for each item
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
  inspectionMin?: number;
  inspectionMax?: number;
  advanceAmount?: number;
  quoteTitle?: string;
  hasVoiceNote?: boolean;
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
  const [quoteTitle, setQuoteTitle] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [inspectionMin, setInspectionMin] = useState("");
  const [inspectionMax, setInspectionMax] = useState("");
  const [notes, setNotes] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceMode, setAdvanceMode] = useState<"percent" | "amount">("percent");
  const [advancePercent, setAdvancePercent] = useState<number>(30); // default 30%
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New item form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
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
      setQuoteTitle(`${jobTitle} Quote`); // Default title
    } else {
      // Reset on close
      setItems([]);
      setQuoteTitle("");
      setInspectionFee("");
      setInspectionMin("");
      setInspectionMax("");
      setNotes("");
      setAdvanceAmount("");
      setIsRecording(false);
      setHasVoiceNote(false);
      setEditingId(null);
      setNewName("");
      setNewDesc("");
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
      description: newDesc.trim() || undefined,
      cost: parseFloat(newCost) || 0,
      quantity: parseInt(newQty) || 1,
      type: newType,
      unit: newUnit,
    }]);
    setNewName("");
    setNewDesc("");
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
                {category !== "inspection" && filteredTemplates.length > 0 && (
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[10px] font-bold text-foreground active:scale-95 transition-all"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Templates
                  </button>
                )}
                {category !== "inspection" && items.length > 0 && (
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

          <ScrollArea className="flex-1 w-full px-6 pb-2">
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-[1.5px] text-muted-foreground block px-1 mb-2">
                Quote Title
              </label>
              <input
                type="text"
                placeholder="Quote title"
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-[14px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/40"
              />
            </div>

            {/* Inspection Min-Max Range (Simplified for Inspection Offer) */}
            {category === "inspection" && (
              <div className="mb-6 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[1.5px] text-muted-foreground block px-1">
                  Inspection Price Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:border-[hsl(25,90%,55%)]/50 transition-colors">
                    <span className="text-[14px] font-bold text-muted-foreground shrink-0">Min</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="£0.00"
                      value={inspectionMin}
                      onChange={(e) => setInspectionMin(e.target.value)}
                      className="flex-1 bg-transparent text-[16px] font-black text-foreground outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:border-[hsl(25,90%,55%)]/50 transition-colors">
                    <span className="text-[14px] font-bold text-muted-foreground shrink-0">Max</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="£0.00"
                      value={inspectionMax}
                      onChange={(e) => setInspectionMax(e.target.value)}
                      className="flex-1 bg-transparent text-[16px] font-black text-foreground outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quote Items (Only for Estimates) */}
            {category === "estimate" && (
              <div className="mb-6">
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="text-[10px] font-black uppercase tracking-[1.5px] text-muted-foreground">
                  Quote Items {items.length > 0 && `(${items.length})`}
                </label>
                {items.length > 0 && (
                  <span className="text-[11px] font-black text-primary">
                    Total: £{itemsTotal.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Existing items — fixed-height scrollable list with sticky total */}
              {items.length > 0 && (
                <div className="mb-4 rounded-2xl border border-border/60 bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/40">
                    <span className="text-[10px] font-black uppercase tracking-[1px] text-muted-foreground">
                      {items.length} item{items.length !== 1 ? "s" : ""} added
                    </span>
                    <span className="text-[11px] font-black text-primary">£{itemsTotal.toFixed(2)}</span>
                  </div>
                  <ScrollArea className="h-[220px]">
                    <div className="divide-y divide-border/40">
                    {items.map((item) => {
                      const cfg = itemTypeConfig[item.type];
                      const Icon = cfg.icon;
                      const isEditing = editingId === item.id;
                      return (
                        <div key={item.id} className="group p-2.5 transition-colors hover:bg-muted/30">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                    className="w-full bg-transparent text-[12px] font-bold text-foreground outline-none border-b border-primary/30"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={item.description || ""}
                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                    onBlur={() => setEditingId(null)}
                                    className="w-full bg-transparent text-[10px] text-muted-foreground outline-none border-b border-border/40"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="text-[12px] font-bold text-foreground truncate leading-tight">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                                    {item.quantity} {item.unit || "pcs"} × £{item.cost.toFixed(2)}
                                    {item.description ? ` · ${item.description}` : ""}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <p className="text-[12px] font-extrabold text-foreground tabular-nums">
                                £{(item.cost * item.quantity).toFixed(2)}
                              </p>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button onClick={() => setEditingId(isEditing ? null : item.id)} aria-label="Edit item" className="h-6 w-6 rounded-full bg-accent flex items-center justify-center active:scale-90">
                                  <Edit3 className="h-2.5 w-2.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center active:scale-90">
                                  <Trash2 className="h-2.5 w-2.5 text-destructive" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Add New Item Form (Screenshot 2 Design) */}
              <div className="rounded-[24px] border border-border/50 bg-[#F8F9FB] p-5">
                <p className="text-[10px] font-black uppercase tracking-[1.5px] text-muted-foreground/60 mb-4">
                  Add New Item
                </p>

                {/* Type selector chips */}
                <div className="flex gap-2 mb-6">
                  {(Object.keys(itemTypeConfig) as QuoteItemType[]).map((type) => {
                    const cfg = itemTypeConfig[type];
                    const Icon = cfg.icon;
                    const isActive = newType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-black transition-all active:scale-[0.98] ${
                          isActive
                            ? "bg-[#E0E7FF] text-[#4F46E5] ring-1 ring-[#4F46E5]/10"
                            : "bg-[#E9ECEF] text-[#6C757D]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Name Input */}
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
                  className="w-full bg-transparent text-[15px] font-bold text-[#1A1C1E] outline-none placeholder:text-muted-foreground/40 mb-3 border-b border-border/40 pb-2"
                />

                {/* Description Input */}
                <textarea
                  placeholder="Item description / notes (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground/40 mb-6 border-b border-border/40 pb-2 resize-none"
                />

                {/* Price + Quantity + Unit row */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <PoundSterling className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Price"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-full bg-transparent text-[14px] font-black text-[#1A1C1E] outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[12px] font-black text-muted-foreground">#</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="1"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-8 bg-transparent text-[14px] font-black text-[#1A1C1E] outline-none placeholder:text-muted-foreground/30 text-center"
                    />
                  </div>

                  {/* Unit picker */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setShowTypeMenu(!showTypeMenu)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#E9ECEF] px-3 py-2 text-[11px] font-black text-[#495057]"
                    >
                      {newUnit}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showTypeMenu ? "rotate-180" : ""}`} />
                    </button>
                    {showTypeMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTypeMenu(false)} />
                        <div className="absolute right-0 bottom-full mb-2 z-20 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden min-w-[100px] animate-in fade-in zoom-in-95 duration-200">
                          {unitOptions[newType].map(u => (
                            <button
                              key={u}
                              onClick={() => { setNewUnit(u); setShowTypeMenu(false); }}
                              className={`w-full px-4 py-2.5 text-[11px] font-black text-left hover:bg-accent transition-colors ${
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
                    className="flex items-center gap-1.5 rounded-xl bg-[#A2A9B1] px-5 py-2.5 text-[12px] font-black text-white active:scale-[0.98] disabled:opacity-30 transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Advance Payment (estimate category only) */}
            {category === "estimate" && items.length > 0 && (() => {
              const computedAdvance = advanceMode === "percent"
                ? +(total * advancePercent / 100).toFixed(2)
                : (parseFloat(advanceAmount) || 0);
              const remaining = Math.max(0, total - computedAdvance);
              const presets = [0, 20, 30, 50];

              return (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Advance Payment
                    </label>
                    <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
                      <button
                        type="button"
                        onClick={() => setAdvanceMode("percent")}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          advanceMode === "percent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvanceMode("amount")}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          advanceMode === "amount" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        £
                      </button>
                    </div>
                  </div>

                  {advanceMode === "percent" ? (
                    <>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {presets.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setAdvancePercent(p)}
                            className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                              advancePercent === p
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
                        value={advancePercent}
                        onChange={(e) => setAdvancePercent(parseInt(e.target.value))}
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
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        className="flex-1 bg-transparent text-[15px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                      />
                    </div>
                  )}

                  {computedAdvance > 0 && (
                    <div className="mt-2 rounded-xl bg-primary/5 border border-primary/10 p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Advance{advanceMode === "percent" ? ` (${advancePercent}%)` : ""}</span>
                        <span className="text-[12px] font-extrabold text-primary">£{computedAdvance.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Remaining on completion</span>
                        <span className="text-[11px] font-bold text-foreground">£{remaining.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Notes & Voice */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[1.5px] text-muted-foreground mb-2.5 block px-1">
                  Notes / Scope of Work
                </label>
                <textarea
                  placeholder="Describe the approach, timeline, warranty..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-[14px] font-medium text-foreground outline-none placeholder:text-muted-foreground/40 resize-none focus:border-primary/30"
                />
              </div>

              <button
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setHasVoiceNote(true);
                    toast.success("Voice note attached!");
                  } else {
                    setIsRecording(true);
                    toast.info("Listening... (Speak now)");
                  }
                }}
                className={`flex w-full items-center gap-4 rounded-[24px] border p-4 transition-all active:scale-[0.98] ${
                  isRecording ? "border-destructive/30 bg-destructive/5" : hasVoiceNote ? "border-primary/30 bg-primary/5" : "border-border bg-card shadow-sm"
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isRecording ? "bg-destructive animate-pulse" : hasVoiceNote ? "bg-primary" : "bg-primary"}`}>
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-black text-[#1A1C1E]">
                    {isRecording ? "Recording..." : hasVoiceNote ? "Voice Message Attached ✓" : "Add Voice Message"}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                    {isRecording ? "Tap to stop" : hasVoiceNote ? "Tap to re-record" : "Explain your quote to the customer"}
                  </p>
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
                onClick={() => onSubmit({ 
                  items, 
                  total, 
                  notes, 
                  quoteTitle, 
                  hasVoiceNote,
                  inspectionFee: category === "inspection" ? (parseFloat(inspectionMin) || 0) : undefined,
                  inspectionMin: category === "inspection" ? (parseFloat(inspectionMin) || 0) : undefined,
                  inspectionMax: category === "inspection" ? (parseFloat(inspectionMax) || 0) : undefined,
                  advanceAmount: category === "estimate" ? (parseFloat(advanceAmount) || 0) : undefined 
                })}
                disabled={category === "inspection" ? !inspectionMin || !inspectionMax : !canSubmit}
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
