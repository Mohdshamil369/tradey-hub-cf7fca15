import { Drawer } from "vaul";
import {
  X, ArrowLeft, Plus, Type, List, Star, Camera, AlignLeft, Mail, Eye, Save, Send,
  GripVertical, Edit3, Check,
} from "lucide-react";
import { FormTemplate, FormField, FieldType } from "./schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FormBuilderSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate: FormTemplate | null;
  onSave: (template: FormTemplate) => void;
  onPreview?: (template: FormTemplate) => void;
}

const FIELD_META: Record<FieldType, { label: string; icon: any; color: string }> = {
  text: { label: "Short text", icon: Type, color: "text-blue-600 bg-blue-500/10" },
  textarea: { label: "Long text", icon: AlignLeft, color: "text-purple-600 bg-purple-500/10" },
  email: { label: "Email", icon: Mail, color: "text-cyan-600 bg-cyan-500/10" },
  select: { label: "Dropdown", icon: List, color: "text-amber-600 bg-amber-500/10" },
  rating: { label: "Rating", icon: Star, color: "text-[hsl(45,90%,50%)] bg-[hsl(45,90%,50%)]/10" },
  file: { label: "Photo / file", icon: Camera, color: "text-pink-600 bg-pink-500/10" },
};

export const FormBuilderSheet = ({
  isOpen,
  onOpenChange,
  initialTemplate,
  onSave,
  onPreview,
}: FormBuilderSheetProps) => {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isFieldTypePickerOpen, setIsFieldTypePickerOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTemplate) {
      setTemplate({ ...initialTemplate });
    } else {
      setTemplate({
        id: generateId(),
        title: "Untitled Form",
        description: "",
        status: "draft",
        tags: [],
        responsesCount: 0,
        stepsCount: 1,
        category: "General",
        isCustom: true,
        fields: [],
      });
    }
    setEditingFieldId(null);
  }, [initialTemplate, isOpen]);

  const addField = (type: FieldType) => {
    if (!template) return;
    const newField: FormField = {
      id: generateId(),
      type,
      label: defaultLabel(type),
      required: true,
      options: type === "select" ? ["Option 1", "Option 2"] : undefined,
    };
    setTemplate({ ...template, fields: [...template.fields, newField] });
    setIsFieldTypePickerOpen(false);
    setEditingFieldId(newField.id);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  };

  const removeField = (id: string) => {
    if (!template) return;
    setTemplate({ ...template, fields: template.fields.filter((f) => f.id !== id) });
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const moveField = (id: string, dir: -1 | 1) => {
    if (!template) return;
    const idx = template.fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= template.fields.length) return;
    const next = [...template.fields];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setTemplate({ ...template, fields: next });
  };

  const handleAction = (status: "published" | "draft") => {
    if (!template) return;
    if (!template.title.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    if (template.fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }
    onSave({ ...template, status });
  };

  if (!template) return null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 flex h-[94%] w-full flex-col rounded-t-[28px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-2.5 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="bg-card border-b border-border shrink-0">
            <div className="flex items-center gap-2 px-4 pt-2 pb-2.5">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1.5 text-foreground active:bg-muted"
                aria-label="Close"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <input
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                className="flex-1 min-w-0 bg-transparent text-[14px] font-bold text-foreground outline-none"
              />
              <button
                onClick={() => handleAction("draft")}
                className="rounded-lg p-1.5 text-muted-foreground active:bg-muted"
                aria-label="Save draft"
                title="Save draft"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
            {/* Progress */}
            <div className="px-4 pb-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-muted-foreground">
                  {template.fields.length} field{template.fields.length === 1 ? "" : "s"}
                </p>
                {template.fields.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {template.fields.filter((f) => f.required).length} required
                  </p>
                )}
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, template.fields.length * 12)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/20">
            {template.fields.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[12px] font-bold text-foreground">Add your first field</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Tap the button below to choose a field type
                </p>
              </div>
            )}

            {template.fields.map((field, i) => {
              const meta = FIELD_META[field.type];
              const Icon = meta.icon;
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  className={`rounded-2xl bg-card border transition-all ${
                    isEditing ? "border-primary shadow-sm" : "border-border"
                  }`}
                >
                  {/* Compact row */}
                  <div className="flex items-center gap-2 p-2.5">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveField(field.id, -1)}
                        disabled={i === 0}
                        className="text-muted-foreground/40 disabled:opacity-20 active:text-foreground"
                        aria-label="Move up"
                      >
                        <GripVertical className="h-3.5 w-3.5 -mb-1.5" />
                      </button>
                      <button
                        onClick={() => moveField(field.id, 1)}
                        disabled={i === template.fields.length - 1}
                        className="text-muted-foreground/40 disabled:opacity-20 active:text-foreground"
                        aria-label="Move down"
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <button
                      onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-[12px] font-bold text-foreground truncate">
                        {field.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {meta.label} · {field.required ? "Required" : "Optional"}
                      </p>
                    </button>
                    <button
                      onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                      className="rounded-lg p-1 text-muted-foreground active:bg-muted"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="rounded-lg p-1 text-muted-foreground hover:text-destructive active:bg-muted"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Expanded editor */}
                  {isEditing && (
                    <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-border/60">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Label
                        </label>
                        <input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary"
                        />
                      </div>

                      {field.type === "select" && (
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Options (one per line)
                          </label>
                          <textarea
                            value={(field.options ?? []).join("\n")}
                            onChange={(e) =>
                              updateField(field.id, {
                                options: e.target.value.split("\n").filter(Boolean),
                              })
                            }
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary resize-none"
                          />
                        </div>
                      )}

                      <label className="flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-[11px] font-semibold text-foreground">Required</span>
                        <button
                          onClick={() => updateField(field.id, { required: !field.required })}
                          className={`relative h-5 w-9 rounded-full transition-colors ${
                            field.required ? "bg-primary" : "bg-muted"
                          }`}
                          aria-label="Toggle required"
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow-sm transition-all ${
                              field.required ? "left-4" : "left-0.5"
                            }`}
                          />
                        </button>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add field button */}
            <button
              onClick={() => setIsFieldTypePickerOpen(true)}
              className="w-full py-3 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-1.5 text-muted-foreground active:bg-muted/50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[12px] font-bold">Add field</span>
            </button>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-3 py-2.5 bg-card border-t border-border flex items-center gap-2">
            <button
              onClick={() => onPreview?.(template)}
              disabled={template.fields.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-muted text-foreground rounded-xl text-[12px] font-bold active:opacity-80 transition-opacity disabled:opacity-40"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => handleAction("published")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[12px] font-bold active:opacity-90 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
              Publish
            </button>
          </div>

          {/* Field Type Picker (nested) */}
          <Drawer.Root
            open={isFieldTypePickerOpen}
            onOpenChange={setIsFieldTypePickerOpen}
            container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="!absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
              <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-[60] flex max-h-[80%] w-full flex-col rounded-t-[28px] bg-background outline-none overflow-hidden">
                <div className="mx-auto mt-2.5 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/20" />
                <div className="px-4 pt-2 pb-4">
                  <h4 className="text-[14px] font-bold text-foreground mb-3">Choose field type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(FIELD_META) as FieldType[]).map((type) => {
                      const meta = FIELD_META[type];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => addField(type)}
                          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-card border border-border active:bg-muted/60 transition-colors"
                        >
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold text-foreground">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const defaultLabel = (type: FieldType) =>
  ({
    text: "Short answer",
    textarea: "Long answer",
    email: "Email address",
    select: "Pick an option",
    rating: "Rating",
    file: "Upload photo",
  }[type]);

export default FormBuilderSheet;
