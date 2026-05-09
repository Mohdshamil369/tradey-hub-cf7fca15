import { useState, useEffect } from "react";
import { Plus, Search, FileText, Eye, Edit3, Send, MoreVertical } from "lucide-react";
import { adminTemplates, FormTemplate } from "./schema";
import { FormLibrarySheet } from "./FormLibrarySheet";
import { FormBuilderSheet } from "./FormBuilderSheet";
import { FormFillerSheet } from "./FormFillerSheet";
import { CreateFormSheet } from "./CreateFormSheet";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface JobNotesTabProps {
  jobId: string;
  isInline?: boolean;
  forceOpenCreate?: number; // Increment to force open
}

const SEED_TEMPLATES: FormTemplate[] = [
  {
    id: "demo-1",
    title: "Customer Feedback",
    description: "Measure satisfaction and gather insights.",
    status: "published",
    tags: ["Feedback", "Survey"],
    responsesCount: 234,
    stepsCount: 3,
    category: "Business",
    isCustom: true,
    fields: [{ id: "f1", type: "text", label: "Name", required: true }],
  },
  {
    id: "demo-2",
    title: "Event Registration",
    description: "Collect attendee details and preferences.",
    status: "published",
    tags: ["Events", "Registration"],
    responsesCount: 56,
    stepsCount: 4,
    category: "Events",
    isCustom: true,
    fields: [{ id: "f1", type: "text", label: "Email", required: true }],
  },
  {
    id: "demo-3",
    title: "Employee Survey",
    description: "Internal pulse check for team morale.",
    status: "draft",
    tags: ["HR", "Internal"],
    responsesCount: 0,
    stepsCount: 2,
    category: "HR",
    isCustom: true,
    fields: [{ id: "f1", type: "text", label: "Department", required: true }],
  },
];

export const JobNotesTab = ({ jobId, isInline = false, forceOpenCreate }: JobNotesTabProps) => {
  const [templates, setTemplates] = useState<FormTemplate[]>(SEED_TEMPLATES);
  const [activeFilter, setActiveFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isFillerOpen, setIsFillerOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Partial<FormTemplate> | null>(null);

  useEffect(() => {
    if (forceOpenCreate && forceOpenCreate > 0) {
      handleCreateNew();
    }
  }, [forceOpenCreate]);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "published") return matchesSearch && t.status === "published";
    if (activeFilter === "draft") return matchesSearch && t.status === "draft";
    return matchesSearch;
  });

  // ── Flow handlers ────────────────────────────────────────
  const handleCreateNew = () => {
    setPendingDraft(null);
    setIsCreateSheetOpen(true);
  };

  const handleContinueCreation = (
    draft: Partial<FormTemplate>,
    source: "blank" | "template"
  ) => {
    setIsCreateSheetOpen(false);
    // Template is now picked dynamically inside the create sheet itself,
    // so the draft already carries the chosen fields when source === "template".
    if (source === "template" && (!draft.fields || draft.fields.length === 0)) {
      setPendingDraft(draft);
      setIsLibraryOpen(true);
      return;
    }
    setSelectedTemplate({
      id: generateId(),
      title: draft.title || "Untitled Form",
      description: draft.description,
      tags: draft.tags || [],
      status: "draft",
      responsesCount: 0,
      stepsCount: draft.stepsCount ?? 1,
      category: draft.category || "General",
      isCustom: true,
      fields: draft.fields || [],
    });
    setIsBuilderOpen(true);
  };

  const handleSelectTemplateFromLibrary = (template: FormTemplate) => {
    setSelectedTemplate({
      ...template,
      id: generateId(),
      title: pendingDraft?.title || template.title,
      description: pendingDraft?.description || template.description,
      tags: pendingDraft?.tags || template.tags,
      isCustom: true,
      status: "draft",
    });
    setPendingDraft(null);
    setIsLibraryOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSaveTemplate = (template: FormTemplate) => {
    const exists = templates.find((t) => t.id === template.id);
    if (exists) {
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
    } else {
      setTemplates([template, ...templates]);
    }
    setIsBuilderOpen(false);
    setSelectedTemplate(null);
    toast.success(template.status === "published" ? "Form published!" : "Draft saved!");
  };

  const handlePreview = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
    setIsFillerOpen(true);
  };

  const handleEditTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsBuilderOpen(true);
  };

  const handleFillTemplate = (template: FormTemplate) => {
    // Track usage so it can surface in "frequent forms"
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id
          ? {
              ...t,
              usageCount: (t.usageCount ?? 0) + 1,
              lastUsedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setSelectedTemplate(template);
    setPreviewMode(false);
    setIsFillerOpen(true);
  };

  const frequentForms = templates
    .filter((t) => t.isCustom && (t.usageCount ?? 0) > 0)
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, 6);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">
      {/* Compact header (inline mode) */}
      <div className="flex flex-col gap-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-muted rounded-xl py-2 pl-8 pr-3 text-[12px] outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="shrink-0 rounded-xl bg-muted px-3 py-2 text-[11px] font-bold text-foreground active:opacity-80"
          >
            Library
          </button>
          <button
            onClick={handleCreateNew}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground flex items-center gap-1 active:opacity-90"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize transition-colors ${
                activeFilter === f
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredTemplates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-card">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[12px] font-bold text-foreground">No forms yet</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Create a form or pick from the template library.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-3 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground active:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Create form
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-card border border-border p-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-foreground truncate">
                      {t.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        t.status === "published"
                          ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]"
                          : "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t.fields.length} field{t.fields.length === 1 ? "" : "s"} ·{" "}
                    {t.responsesCount ?? 0} response
                    {(t.responsesCount ?? 0) === 1 ? "" : "s"}
                  </p>

                  {/* Action row */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleFillTemplate(t)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-[10px] font-bold text-primary-foreground active:opacity-90"
                    >
                      <Send className="h-3 w-3" /> Fill
                    </button>
                    <button
                      onClick={() => handlePreview(t)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[10px] font-bold text-foreground active:opacity-80"
                      aria-label="Preview"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(t)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[10px] font-bold text-foreground active:opacity-80"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet Components */}
      <CreateFormSheet
        isOpen={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onContinue={handleContinueCreation}
        templates={adminTemplates}
        frequentForms={frequentForms}
      />
      <FormLibrarySheet
        isOpen={isLibraryOpen}
        onOpenChange={(o) => {
          setIsLibraryOpen(o);
          if (!o) setPendingDraft(null);
        }}
        templates={adminTemplates}
        onSelectTemplate={handleSelectTemplateFromLibrary}
        onCreateNew={handleCreateNew}
      />
      <FormBuilderSheet
        isOpen={isBuilderOpen}
        onOpenChange={(o) => {
          setIsBuilderOpen(o);
          if (!o) setSelectedTemplate(null);
        }}
        initialTemplate={selectedTemplate}
        onSave={handleSaveTemplate}
        onPreview={handlePreview}
      />
      <FormFillerSheet
        isOpen={isFillerOpen}
        onOpenChange={(o) => {
          setIsFillerOpen(o);
          if (!o) setPreviewMode(false);
        }}
        template={selectedTemplate}
        previewMode={previewMode}
        onSubmit={() => {
          toast.success("Response recorded!");
          setIsFillerOpen(false);
          setPreviewMode(false);
        }}
      />
    </div>
  );
};

export default JobNotesTab;
