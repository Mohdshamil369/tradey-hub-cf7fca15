import { Drawer } from "vaul";
import { X, ArrowLeft, MoreHorizontal, Plus, GripVertical, Type, List, Star, Camera, AlignLeft, Eye, Send, Mail } from "lucide-react";
import { FormTemplate, FormField, FieldType } from "./schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FormBuilderSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate: FormTemplate | null;
  onSave: (template: FormTemplate) => void;
}

export const FormBuilderSheet = ({
  isOpen,
  onOpenChange,
  initialTemplate,
  onSave,
}: FormBuilderSheetProps) => {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isFieldTypePickerOpen, setIsFieldTypePickerOpen] = useState(false);

  useEffect(() => {
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
        fields: []
      });
    }
  }, [initialTemplate, isOpen]);

  const addField = (type: FieldType) => {
    if (!template) return;
    const newField: FormField = {
      id: generateId(),
      type,
      label: type === "email" ? "Email Address" : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: true,
      description: getFieldTypeDescription(type),
    };
    setTemplate({
      ...template,
      fields: [...template.fields, newField]
    });
    setIsFieldTypePickerOpen(false);
  };

  const getFieldTypeDescription = (type: FieldType) => {
    switch (type) {
      case "text": return "Short text · Required";
      case "textarea": return "Long text · Optional";
      case "select": return "Dropdown · Required";
      case "rating": return "Rating (1-5) · Required";
      case "file": return "File/Photo · Required";
      case "email": return "Email · Required";
      default: return "";
    }
  };

  const removeField = (id: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.filter(f => f.id !== id)
    });
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
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex h-[95%] max-h-[96%] w-full flex-col rounded-t-[32px] bg-[#f9f9f9] outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          {/* Header */}
          <div className="bg-white shrink-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-4">
                <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-foreground active:scale-95 transition-transform">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-extrabold text-foreground truncate max-w-[200px]">{template.title}</h3>
              </div>
              <button className="rounded-full p-2 text-muted-foreground/40 active:scale-95">
                <MoreHorizontal className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-muted-foreground/50">{template.fields.length} of {Math.max(template.fields.length, 12)} fields</p>
              </div>
              <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#37b24d] transition-all duration-500" 
                  style={{ width: `${(template.fields.length / Math.max(template.fields.length, 12)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
            {template.fields.map((field, i) => (
              <div
                key={field.id}
                className="bg-white rounded-[24px] p-5 shadow-sm border border-border/40 flex items-center gap-4 group active:scale-[0.99] transition-all"
              >
                <div className="cursor-grab active:cursor-grabbing p-1">
                  <div className="grid grid-cols-2 gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="h-1 w-1 rounded-full bg-black" />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-foreground mb-0.5">{field.label}</h4>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight opacity-60">
                    {field.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                   <div className="px-3 py-1.5 rounded-full bg-[#edf2ff] text-[#4c6ef5] text-[10px] font-bold">
                      {field.type.charAt(0).toUpperCase() + field.type.slice(1)} input
                   </div>
                   <button 
                     onClick={() => removeField(field.id)}
                     className="p-1 text-muted-foreground/20 hover:text-destructive transition-colors shrink-0"
                   >
                     <X className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))}

            {/* Drop Zones / Add Field Action */}
            <button
               onClick={() => setIsFieldTypePickerOpen(true)}
               className="w-full py-8 border-2 border-dashed border-muted-foreground/10 rounded-[24px] flex items-center justify-center gap-2 group hover:border-black/10 transition-colors active:bg-black/5"
            >
               <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-black/40" />
               <span className="text-[13px] font-bold text-muted-foreground/40 group-hover:text-black/40">Tap to add a field</span>
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 p-5 bg-white border-t border-border/40 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <button
              onClick={() => setIsFieldTypePickerOpen(true)}
              className="flex-1 py-4 bg-black text-white rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
            <button
              onClick={() => handleAction("draft")}
              className="px-6 py-4 bg-[#f4f4f4] text-foreground rounded-2xl text-[13px] font-bold active:bg-muted transition-all"
            >
              Preview
            </button>
            <button
              onClick={() => handleAction("published")}
              className="px-8 py-4 bg-[#37b24d] text-white rounded-2xl text-[13px] font-bold active:scale-95 transition-all shadow-md shadow-green-200"
            >
              Publish
            </button>
          </div>

          {/* Field Type Picker Drawer */}
          <Drawer.Root open={isFieldTypePickerOpen} onOpenChange={setIsFieldTypePickerOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="!absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
              <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-[60] mx-auto flex max-h-[80%] w-full flex-col rounded-t-[32px] bg-white outline-none overflow-hidden">
                <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
                <div className="p-6">
                   <h4 className="text-lg font-bold mb-6">Choose Field Type</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <FieldOption icon={<Type className="h-5 w-5" />} label="Short Text" onClick={() => addField('text')} />
                      <FieldOption icon={<AlignLeft className="h-5 w-5" />} label="Long Text" onClick={() => addField('textarea')} />
                      <FieldOption icon={<Mail className="h-5 w-5" />} label="Email" onClick={() => addField('email')} />
                      <FieldOption icon={<List className="h-5 w-5" />} label="Select" onClick={() => addField('select')} />
                      <FieldOption icon={<Star className="h-5 w-5" />} label="Rating" onClick={() => addField('rating')} />
                      <FieldOption icon={<Camera className="h-5 w-5" />} label="Photo" onClick={() => addField('file')} />
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

const FieldOption = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-[#f9f9f9] border border-border/40 active:scale-95 active:bg-[#f0f0f0] transition-all"
  >
    <div className="text-foreground/40">{icon}</div>
    <span className="text-[13px] font-bold">{label}</span>
  </button>
);

export default FormBuilderSheet;
