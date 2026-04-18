import { Drawer } from "vaul";
import { X, Save, Camera, Star, ChevronDown } from "lucide-react";
import { FormTemplate } from "./schema";
import { useState } from "react";
import { toast } from "sonner";

interface FormFillerSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: FormTemplate | null;
  onSubmit: (data: Record<string, any>) => void;
}

export const FormFillerSheet = ({
  isOpen,
  onOpenChange,
  template,
  onSubmit,
}: FormFillerSheetProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    if (!template) return;
    
    // Basic validation
    for (const field of template.fields) {
      if (field.required && !formData[field.id]) {
        toast.error(`Please fill out the required field: ${field.label}`);
        return;
      }
    }

    onSubmit(formData);
    // Reset state after saving
    setFormData({});
  };

  if (!template) return null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setFormData({}); // Reset on close
        onOpenChange(open);
      }}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex h-[85%] max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/40 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-bold text-foreground truncate">{template.title}</h3>
              {template.description ? (
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{template.description}</p>
              ) : (
                <p className="text-[11px] font-semibold text-primary mt-0.5 uppercase tracking-wider">New Entry</p>
              )}
            </div>
            <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors active:scale-95 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-24">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </label>
                
                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Enter value"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Enter details..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50 resize-none"
                  />
                )}

                {field.type === "select" && (
                  <div className="relative">
                    <select
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    >
                      <option value="" disabled>Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                )}

                {field.type === "rating" && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleFieldChange(field.id, star)}
                        className="p-1 active:scale-90 transition-transform"
                      >
                        <Star className={`h-8 w-8 ${
                          (formData[field.id] || 0) >= star 
                            ? "fill-star text-star" 
                            : "text-muted-foreground/30 fill-transparent"
                        }`} />
                      </button>
                    ))}
                  </div>
                )}

                {field.type === "file" && (
                  <button
                    onClick={() => {
                      toast.success("Opening camera...");
                      // Mock file upload
                      handleFieldChange(field.id, "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300&h=300");
                    }}
                    className="w-full rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center p-6 bg-card active:bg-muted transition-colors gap-2"
                  >
                    {formData[field.id] ? (
                      <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-border">
                        <img src={formData[field.id]} alt="Uploaded" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                           <p className="text-white text-[10px] font-bold">Retake</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Camera className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Attach Photo</p>
                        <p className="text-[11px] text-muted-foreground">Tap to take a photo or upload from library</p>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/40">
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
            >
              <Save className="h-4 w-4" />
              Save Note
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormFillerSheet;
