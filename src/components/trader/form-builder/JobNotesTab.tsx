import { useState } from "react";
import { Plus, StickyNote, Calendar, FileText, Star, Image as ImageIcon, ChevronRight } from "lucide-react";
import { adminTemplates, initialNotes, JobNote, FormTemplate } from "./schema";
import { FormLibrarySheet } from "./FormLibrarySheet";
import { FormBuilderSheet } from "./FormBuilderSheet";
import { FormFillerSheet } from "./FormFillerSheet";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface JobNotesTabProps {
  jobId: string;
}

export const JobNotesTab = ({ jobId }: JobNotesTabProps) => {
  const [notes, setNotes] = useState<JobNote[]>(initialNotes.filter(n => n.jobId === jobId));
  const [templates, setTemplates] = useState<FormTemplate[]>(adminTemplates);
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isFillerOpen, setIsFillerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const handleAddNote = () => setIsLibraryOpen(true);

  const handleCreateNewTemplate = () => {
    setIsLibraryOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsLibraryOpen(false);
    setIsFillerOpen(true);
  };

  const handleSaveTemplate = (template: FormTemplate) => {
    setTemplates([...templates, template]);
    setIsBuilderOpen(false);
    setSelectedTemplate(template);
    setIsFillerOpen(true);
    toast.success("Template saved to your library!");
  };

  const handleSaveNote = (data: Record<string, any>) => {
    if (!selectedTemplate) return;

    const newNote: JobNote = {
      id: generateId(),
      jobId,
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      createdAt: new Date().toISOString(),
      data,
    };

    setNotes([newNote, ...notes]);
    setIsFillerOpen(false);
    setSelectedTemplate(null);
    toast.success("Note saved successfully!");
  };

  return (
    <div className="flex flex-col gap-6 pb-20 pt-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Internal Notes</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Capture structured data for this job</p>
        </div>
        <button
          onClick={handleAddNote}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 bg-muted/20 rounded-2xl border border-dashed border-border/50">
          <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center shadow-sm">
            <StickyNote className="h-7 w-7 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">No notes yet</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1 line-clamp-2">
              Add inspection reports, material requests, or custom checklists.
            </p>
          </div>
          <button
            onClick={handleAddNote}
            className="text-[11px] font-bold text-primary px-4 py-2 bg-primary/10 rounded-full active:bg-primary/20 transition-all"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden group">
              <div className="bg-muted/30 px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-background shadow-sm">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-foreground">{note.templateTitle}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                       <Calendar className="h-3 w-3" />
                       {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button className="text-muted-foreground/40 hover:text-foreground active:scale-90 transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                {Object.entries(note.data).slice(0, 3).map(([fieldId, value], i) => {
                  // We'd ideally look up the field label from the template
                  // For the MVP preview, just showing the value with a placeholder label
                  return (
                    <div key={i} className="flex flex-col gap-1">
                       <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Detail {i+1}</p>
                       <div className="text-[12px] text-foreground font-medium">
                          {typeof value === 'number' ? (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className={`h-3 w-3 ${idx < value ? 'fill-star text-star' : 'text-muted-foreground/20'}`} />
                              ))}
                            </div>
                          ) : typeof value === 'string' && value.startsWith('http') ? (
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border mt-1">
                               <img src={value} alt="Attachment" className="h-full w-full object-cover" />
                               <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-center text-[8px] text-white font-bold backdrop-blur-sm">
                                  <ImageIcon className="h-2 w-2 inline mr-1" /> PHOTO
                               </div>
                            </div>
                          ) : (
                            <p className="line-clamp-2 leading-relaxed">{String(value)}</p>
                          )}
                       </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet Components orchestrated here */}
      <FormLibrarySheet
        isOpen={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onCreateNew={handleCreateNewTemplate}
      />

      <FormBuilderSheet
        isOpen={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onSave={handleSaveTemplate}
      />

      <FormFillerSheet
        isOpen={isFillerOpen}
        onOpenChange={setIsFillerOpen}
        template={selectedTemplate}
        onSubmit={handleSaveNote}
      />
    </div>
  );
};

export default JobNotesTab;
