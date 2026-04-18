import { Drawer } from "vaul";
import { X, FileText, Plus, Library } from "lucide-react";
import { FormTemplate } from "./schema";

interface FormLibrarySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templates: FormTemplate[];
  onSelectTemplate: (template: FormTemplate) => void;
  onCreateNew: () => void;
}

export const FormLibrarySheet = ({
  isOpen,
  onOpenChange,
  templates,
  onSelectTemplate,
  onCreateNew,
}: FormLibrarySheetProps) => {
  const customTemplates = templates.filter((t) => t.isCustom);
  const adminTemplates = templates.filter((t) => !t.isCustom);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      container={typeof document !== "undefined" ? document.getElementById("mobile-device-content") : null}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex h-[85%] max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
          
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/40 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-foreground">Form Library</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Select a template or build a new one</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors active:scale-95">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-20">
            
            {/* Create New Action */}
            <button
              onClick={onCreateNew}
              className="w-full flex items-center justify-between rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-left active:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">Build Custom Form</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Start from scratch and add your own fields</p>
                </div>
              </div>
            </button>

            {/* Custom Libary (If exists) */}
            {customTemplates.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Library className="h-3.5 w-3.5" /> My Templates
                </h4>
                <div className="grid gap-2">
                  {customTemplates.map((t) => (
                     <button
                       key={t.id}
                       onClick={() => onSelectTemplate(t)}
                       className="w-full flex items-center gap-3 rounded-xl bg-card p-3 border border-border/50 shadow-sm active:scale-[0.98] transition-all text-left"
                     >
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                         <FileText className="h-4 w-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[12px] font-bold text-foreground truncate">{t.title}</p>
                         {t.description && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t.description}</p>}
                       </div>
                     </button>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Library */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">Admin Templates</h4>
              <div className="grid gap-2">
                {adminTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectTemplate(t)}
                      className="w-full flex items-start gap-3 rounded-xl bg-card p-3 border border-border/50 shadow-sm active:scale-[0.98] transition-all text-left"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-foreground">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                           <span className="text-[9px] font-semibold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                             {t.fields.length} Fields
                           </span>
                           {t.fields.slice(0, 3).map((f, i) => (
                             <span key={i} className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded truncate shrink-0 max-w-[80px]">
                               {f.label}
                             </span>
                           ))}
                        </div>
                      </div>
                    </button>
                ))}
              </div>
            </div>

          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormLibrarySheet;
