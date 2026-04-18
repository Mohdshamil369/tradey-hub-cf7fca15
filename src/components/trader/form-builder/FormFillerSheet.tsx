import { Drawer } from "vaul";
import { ArrowLeft, Camera, Star, ChevronDown, CheckCircle2, Mail } from "lucide-react";
import { FormTemplate } from "./schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FormFillerSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: FormTemplate | null;
  onSubmit: (data: Record<string, any>) => void;
  previewMode?: boolean;
}

export const FormFillerSheet = ({
  isOpen,
  onOpenChange,
  template,
  onSubmit,
  previewMode = false,
}: FormFillerSheetProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) setFormData({});
  }, [isOpen, template?.id]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    if (!template) return;
    for (const field of template.fields) {
      if (field.required && !formData[field.id]) {
        toast.error(`Please fill out: ${field.label}`);
        return;
      }
    }
    onSubmit(formData);
    setFormData({});
  };

  if (!template) return null;

  const fields = template.fields ?? [];
  const filled = fields.filter((f) => formData[f.id]).length;
  const progress = fields.length === 0 ? 0 : Math.round((filled / fields.length) * 100);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setFormData({});
        onOpenChange(open);
      }}
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
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-foreground truncate">{template.title}</h3>
                <p className="text-[10px] text-muted-foreground">
                  {previewMode ? "Preview mode" : `${filled} of ${fields.length} filled`}
                </p>
              </div>
              {previewMode && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-600">
                  Preview
                </span>
              )}
            </div>
            {/* Progress */}
            <div className="px-4 pb-2.5">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {template.description && (
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            )}

            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                  />
                )}

                {field.type === "email" && (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <input
                      type="email"
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                    />
                  </div>
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Add details..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 resize-none"
                  />
                )}

                {field.type === "select" && (
                  <div className="relative">
                    <select
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-card pl-3 pr-9 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors"
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                  </div>
                )}

                {field.type === "rating" && (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleFieldChange(field.id, star)}
                        className="active:scale-90 transition-transform p-0.5"
                        aria-label={`Rate ${star}`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            (formData[field.id] || 0) >= star
                              ? "fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]"
                              : "text-muted-foreground/25 fill-transparent"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {field.type === "file" && (
                  <button
                    onClick={() => {
                      toast.success("Camera opened");
                      handleFieldChange(
                        field.id,
                        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300&h=300"
                      );
                    }}
                    className="w-full rounded-xl border border-border border-dashed bg-card p-4 flex flex-col items-center justify-center gap-1.5 active:bg-muted/50 transition-colors"
                  >
                    {formData[field.id] ? (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                        <img src={formData[field.id]} alt="Captured" className="h-full w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[8px] font-bold text-white">
                          RETAKE
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Camera className="h-4 w-4" />
                        </div>
                        <p className="text-[11px] font-bold text-foreground">Take photo</p>
                        <p className="text-[10px] text-muted-foreground">Tap to capture or upload</p>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-3 py-2.5 bg-card border-t border-border flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-2.5 bg-muted text-foreground rounded-xl text-[12px] font-bold active:opacity-80 transition-opacity"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={previewMode}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[12px] font-bold active:opacity-90 transition-opacity disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {previewMode ? "Preview only" : "Submit"}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormFillerSheet;
