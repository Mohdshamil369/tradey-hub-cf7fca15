import { useState } from "react";
import { Plus, Search, FileText, ChevronRight, LayoutGrid, CheckCircle2, MoreVertical } from "lucide-react";
import { adminTemplates, FormTemplate, JobNote } from "./schema";
import { FormLibrarySheet } from "./FormLibrarySheet";
import { FormBuilderSheet } from "./FormBuilderSheet";
import { FormFillerSheet } from "./FormFillerSheet";
import { CreateFormSheet } from "./CreateFormSheet";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface JobNotesTabProps {
  jobId: string;
  isInline?: boolean;
}

export const JobNotesTab = ({ jobId, isInline = false }: JobNotesTabProps) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([
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
      fields: [{ id: "f1", type: "text", label: "Name", required: true }]
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
      fields: [{ id: "f1", type: "text", label: "Email", required: true }]
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
      fields: [{ id: "f1", type: "text", label: "Department", required: true }]
    }
  ]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Published" | "Drafts">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setNavTab] = useState<"Forms" | "Analytics" | "Settings">("Forms");
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isFillerOpen, setIsFillerOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "Published") return matchesSearch && t.status === "published";
    if (activeFilter === "Drafts") return matchesSearch && t.status === "draft";
    return matchesSearch;
  });

  const handleCreateNew = () => setIsCreateSheetOpen(true);

  const handleContinueCreation = (draft: Partial<FormTemplate>, source: "blank" | "template") => {
    setIsCreateSheetOpen(false);
    if (source === "template") {
      setIsLibraryOpen(true);
      setSelectedTemplate(draft as any);
    } else {
      setSelectedTemplate({
        id: generateId(),
        title: draft.title || "Untitled Form",
        description: draft.description,
        tags: draft.tags || [],
        status: "draft",
        responsesCount: 0,
        stepsCount: 1,
        category: "General",
        isCustom: true,
        fields: []
      });
      setIsBuilderOpen(true);
    }
  };

  const handleSelectTemplateFromLibrary = (template: FormTemplate) => {
    const userDraft = selectedTemplate;
    setSelectedTemplate({
      ...template,
      id: generateId(),
      title: userDraft?.title || template.title,
      description: userDraft?.description || template.description,
      tags: userDraft?.tags || template.tags,
      isCustom: true,
      status: "draft"
    });
    setIsLibraryOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSaveTemplate = (template: FormTemplate) => {
    const exists = templates.find(t => t.id === template.id);
    if (exists) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([template, ...templates]);
    }
    setIsBuilderOpen(false);
    toast.success(template.status === "published" ? "Form published!" : "Draft saved!");
  };

  return (
    <div className={`flex flex-col h-full bg-[#fcfcfc] ${isInline ? "" : "-mx-4 -mt-4"}`}>
      {/* Search & Tabs Header */}
      {!isInline && (
        <div className="bg-white px-5 pt-6 pb-2 border-b border-border/30">
          <h2 className="text-[28px] font-extrabold text-foreground mb-5">Forms</h2>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-[#f4f4f4] rounded-2xl py-3.5 pl-11 pr-4 text-[13px] outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {["All Forms", "Published", "Drafts"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter.split(" ")[0] as any)}
                className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                  (activeFilter === filter.split(" ")[0] || (activeFilter === "All" && filter === "All Forms"))
                    ? "bg-black text-white shadow-md"
                    : "bg-[#f4f4f4] text-muted-foreground hover:bg-[#ececec]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${isInline ? "py-2" : "px-5 py-6"}`}>
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-32 w-32 rounded-full bg-[#f4f4f4] flex items-center justify-center mb-8">
              <div className="relative">
                <FileText className="h-14 w-14 text-muted-foreground/30" />
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Plus className="h-3 w-3 text-black" />
                </div>
              </div>
            </div>
            
            <h3 className="text-[20px] font-bold text-foreground mb-2">No forms yet</h3>
            <p className="text-[13px] text-muted-foreground mb-8 text-center max-w-[240px] leading-relaxed">
              Create your first form to start collecting responses.
            </p>

            <button
              onClick={handleCreateNew}
              className="px-8 py-3.5 bg-black text-white rounded-2xl text-[14px] font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              + Create Your First Form
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  setIsBuilderOpen(true);
                }}
                className={`w-full bg-white p-5 rounded-[24px] border border-border/40 shadow-sm text-left active:scale-[0.99] transition-all flex flex-col gap-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-[15px] font-bold text-foreground mb-1 truncate">{t.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t.fields.length} fields · {t.responsesCount} responses
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                   <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                     t.status === "published" 
                       ? "bg-[#e3f9f0] text-[#0ca678]" 
                       : "bg-[#fff4e6] text-[#f08c3a]"
                   }`}>
                     {t.status === "published" ? "Published" : "Draft"}
                   </div>
                   <div className="flex -space-x-1.5 overflow-hidden">
                      {t.tags?.slice(0, 2).map((tag, i) => (
                        <div key={i} className="h-5 w-5 rounded-full border border-white bg-secondary/40 flex items-center justify-center">
                          <span className="text-[7px] font-bold text-muted-foreground">{tag.charAt(0)}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - Only show if not inline OR if specifically needed */}
      {templates.length > 0 && (
        <button
          onClick={handleCreateNew}
          className={`${isInline ? "mt-4 relative left-0 bottom-0 mb-6 w-full py-4 rounded-2xl" : "absolute bottom-6 right-6 h-14 w-14 rounded-full"} bg-black shadow-xl flex items-center justify-center text-white active:scale-95 transition-all z-10`}
        >
          <Plus className={`${isInline ? "h-4 w-4 mr-2" : "h-6 w-6"}`} />
          {isInline && <span className="text-[13px] font-bold">Add Note</span>}
        </button>
      )}

      {/* Mock Bottom Navigation - matches Screen 1 - Only show if not inline */}
      {!isInline && (
        <div className="shrink-0 bg-white border-t border-border/30 px-6 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          {[
            { id: "Forms", icon: LayoutGrid },
            { id: "Analytics", icon: CheckCircle2 },
            { id: "Settings", icon: MoreVertical }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setNavTab(item.id as any)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                activeTab === item.id ? "text-black" : "text-muted-foreground/30"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className={`text-[10px] font-bold ${activeTab === item.id ? "opacity-100" : "opacity-60"}`}>{item.id}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sheet Components */}
      <CreateFormSheet isOpen={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen} onContinue={handleContinueCreation} />
      <FormLibrarySheet isOpen={isLibraryOpen} onOpenChange={setIsLibraryOpen} templates={adminTemplates} onSelectTemplate={handleSelectTemplateFromLibrary} onCreateNew={handleCreateNew} />
      <FormBuilderSheet isOpen={isBuilderOpen} onOpenChange={setIsBuilderOpen} initialTemplate={selectedTemplate} onSave={handleSaveTemplate} />
      <FormFillerSheet isOpen={isFillerOpen} onOpenChange={setIsFillerOpen} template={selectedTemplate} onSubmit={() => { toast.success("Response recorded!"); setIsFillerOpen(false); }} />
    </div>
  );
};

export default JobNotesTab;
