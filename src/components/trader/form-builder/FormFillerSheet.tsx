import { Drawer } from "vaul";
import { X, ArrowLeft, Camera, Star, ChevronDown, CheckCircle2, Mail, Type, AlignLeft } from "lucide-react";
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
        toast.error(`Please fill out: ${field.label}`);
        return;
      }
    }

    onSubmit(formData);
    setFormData({});
  };

  if (!template) return null;

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
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex h-[95%] max-h-[96%] w-full flex-col rounded-t-[32px] bg-[#f9f9f9] outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          {/* Header */}
          <div className="bg-white shrink-0">
            <div className="flex items-center gap-4 px-5 pt-4 pb-4 border-b border-border/40">
              <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-foreground active:scale-95 transition-transform">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-foreground truncate">{template.title}</h3>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight opacity-60">
                   Fill out the form below
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-32">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  {field.label}
                  {field.required && <span className="text-[#fa5252] text-xs">*</span>}
                </label>
                
                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Enter response..."
                    className="w-full rounded-2xl border border-border/60 bg-white px-5 py-4 text-[14px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/30 shadow-sm"
                  />
                )}

                {field.type === "email" && (
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <input
                      type="email"
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder="email@example.com"
                      className="w-full rounded-2xl border border-border/60 bg-white pl-12 pr-5 py-4 text-[14px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/30 shadow-sm"
                    />
                  </div>
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Enter details..."
                    rows={4}
                    className="w-full rounded-2xl border border-border/60 bg-white px-5 py-4 text-[14px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/30 shadow-sm resize-none"
                  />
                )}

                {field.type === "select" && (
                  <div className="relative">
                    <select
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-border/60 bg-white px-5 py-4 text-[14px] text-foreground outline-none focus:border-black transition-all shadow-sm"
                    >
                      <option value="" disabled>Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                )}

                {field.type === "rating" && (
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleFieldChange(field.id, star)}
                        className="active:scale-90 transition-transform p-1"
                      >
                        <Star className={`h-10 w-10 ${
                          (formData[field.id] || 0) >= star 
                            ? "fill-[#fab005] text-[#fab005]" 
                            : "text-muted-foreground/20 fill-transparent"
                        }`} />
                      </button>
                    ))}
                  </div>
                )}

                {field.type === "file" && (
                  <button
                    onClick={() => {
                      toast.success("Opening camera...");
                      handleFieldChange(field.id, "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300&h=300");
                    }}
                    className="w-full rounded-[24px] border border-border/60 border-dashed bg-white p-8 flex flex-col items-center justify-center gap-3 active:bg-black/5 transition-all shadow-sm"
                  >
                    {formData[field.id] ? (
                      <div className="relative h-28 w-28 rounded-2xl overflow-hidden shadow-md">
                        <img src={formData[field.id]} alt="Captured" className="h-full w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1.5 text-center text-[9px] text-white font-bold backdrop-blur-sm">
                           RETAKE PHOTO
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center text-muted-foreground/40">
                          <Camera className="h-7 w-7" />
                        </div>
                        <p className="text-[13px] font-bold text-foreground">Add site photos</p>
                        <p className="text-[11px] text-muted-foreground">Tap to capture or upload</p>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="shrink-0 p-5 bg-white border-t border-border/40 pb-8 flex items-center gap-3">
             <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-4 bg-[#f4f4f4] text-foreground rounded-2xl text-[14px] font-bold active:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-black text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Form
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormFillerSheet;
