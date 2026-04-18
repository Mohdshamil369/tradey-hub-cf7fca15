import { Drawer } from "vaul";
import { ArrowLeft, Search, FileText } from "lucide-react";
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
}: FormLibrarySheetProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((t) => {
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
        <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 flex h-[92%] w-full flex-col rounded-t-[28px] bg-background outline-none overflow-hidden">
          <div className="mx-auto mt-2.5 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-2 pb-2.5 border-b border-border bg-card shrink-0">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-foreground active:bg-muted"
              aria-label="Close"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h3 className="text-[15px] font-bold text-foreground">Templates</h3>
          </div>

          {/* Search + filters */}
          <div className="bg-card px-4 py-3 border-b border-border shrink-0">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-muted rounded-xl py-2.5 pl-9 pr-3 text-[12px] outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-muted/20">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-[12px] font-semibold text-foreground">No templates found</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTemplate(t)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border p-3 text-left active:bg-muted/40 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.fields.length} field{t.fields.length === 1 ? "" : "s"}
                      {t.category ? ` · ${t.category}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
                    Use
                  </span>
                </button>
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormLibrarySheet;
