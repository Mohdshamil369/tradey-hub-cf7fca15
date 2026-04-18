import { Drawer } from "vaul";
import { X, Save, Plus, Trash2, GripVertical, Type, List, Star, Camera, AlignLeft } from "lucide-react";
import { FormTemplate, FormField, FieldType } from "./schema";
import { useState } from "react";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FormBuilderSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: FormTemplate) => void;
}

export const FormBuilderSheet = ({
  isOpen,
  onOpenChange,
  onSave,
}: FormBuilderSheetProps) => {
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      options: type === "select" ? ["Option 1", "Option 2"] : undefined,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    const newTemplate: FormTemplate = {
      id: generateId(),
      title,
      description,
      isCustom: true,
      fields,
    };

    onSave(newTemplate);
    reset();
  };

  const reset = () => {
    setTitle("Untitled Form");
    setDescription("");
    setFields([]);
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) reset();
        onOpenChange(open);
      }}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex h-[90%] max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/40 shrink-0">
            <h3 className="text-lg font-bold text-foreground">Build Custom Form</h3>
            <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors active:scale-95">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-24">
            {/* Header info */}
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form Title"
                className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 px-0"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form description (optional)"
                className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 px-0 resize-none h-12"
              />
            </div>

            {/* Field List */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Fields</h4>
              {fields.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">Add your first field below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-card border border-border/60 rounded-xl p-3 shadow-sm group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                          <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded uppercase">Field {index + 1}</span>
                        </div>
                        <button onClick={() => removeField(field.id)} className="text-muted-foreground/40 hover:text-destructive active:scale-90 transition-all p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Field Label"
                          className="w-full text-sm font-semibold bg-transparent border-b border-border/30 focus:border-primary outline-none py-1 transition-colors"
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                              {field.type === 'text' && <Type className="h-2.5 w-2.5" />}
                              {field.type === 'textarea' && <AlignLeft className="h-2.5 w-2.5" />}
                              {field.type === 'select' && <List className="h-2.5 w-2.5" />}
                              {field.type === 'rating' && <Star className="h-2.5 w-2.5" />}
                              {field.type === 'file' && <Camera className="h-2.5 w-2.5" />}
                              {field.type}
                            </span>
                          </div>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] text-muted-foreground">Required</span>
                            <div 
                              onClick={() => updateField(field.id, { required: !field.required })}
                              className={`w-7 h-4 rounded-full relative transition-colors ${field.required ? 'bg-primary' : 'bg-muted'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${field.required ? 'left-3.5' : 'left-0.5'}`} />
                            </div>
                          </label>
                        </div>

                        {field.type === "select" && (
                          <div className="pt-2 space-y-2">
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Options (comma separated)</p>
                            <input
                              type="text"
                              value={field.options?.join(", ")}
                              onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(o => o.trim()) })}
                              placeholder="Red, Green, Blue"
                              className="w-full text-[11px] bg-muted/40 rounded-lg px-3 py-2 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/40 space-y-3">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button onClick={() => addField('text')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all">
                  <Type className="h-3 w-3" /> Text
                </button>
                <button onClick={() => addField('textarea')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all">
                  <AlignLeft className="h-3 w-3" /> Area
                </button>
                <button onClick={() => addField('select')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all">
                  <List className="h-3 w-3" /> List
                </button>
                <button onClick={() => addField('rating')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all">
                  <Star className="h-3 w-3" /> Stars
                </button>
                <button onClick={() => addField('file')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all">
                  <Camera className="h-3 w-3" /> Photo
                </button>
             </div>
             
             <div className="flex gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl text-[13px] font-bold active:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  Save Template
                </button>
             </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormBuilderSheet;
