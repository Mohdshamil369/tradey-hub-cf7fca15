import { Drawer } from "vaul";
import { X, Search, ChevronRight, Layout, Briefcase, Users, Calendar, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { FormTemplate } from "./schema";

interface FormLibrarySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templates: FormTemplate[];
  onSelectTemplate: (template: FormTemplate) => void;
  onCreateNew: () => void;
}

const CATEGORIES = ["All", "Business", "HR", "Events", "Other"];

export const FormLibrarySheet = ({
  isOpen,
  onOpenChange,
  templates,
  onSelectTemplate,
  onCreateNew,
}: FormLibrarySheetProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          
          <div className="flex items-center gap-4 px-5 pt-4 pb-2 border-b border-border/40 bg-white shrink-0">
            <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-foreground active:scale-95 transition-transform">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <h3 className="text-lg font-bold text-foreground">Templates</h3>
          </div>

          <div className="bg-white px-5 py-4 border-b border-border/30 shrink-0">
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-[#f4f4f4] rounded-2xl py-3.5 pl-11 pr-4 text-[13px] outline-none placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-black text-white"
                      : "bg-[#f4f4f4] text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-[24px] border border-border/40 shadow-sm overflow-hidden"
              >
                <div className="h-20 bg-[#edf2ff] w-full relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Layout className="h-10 w-10 text-[#4c6ef5]" />
                   </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-[15px] font-bold text-foreground mb-1 truncate">{t.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t.fields.length} fields · {t.stepsCount} steps
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectTemplate(t)}
                    className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-[12px] font-bold active:scale-95 transition-all shadow-sm"
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[13px] text-muted-foreground">No templates found matches your search.</p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormLibrarySheet;
