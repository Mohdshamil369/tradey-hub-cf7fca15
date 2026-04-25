import { Drawer } from "vaul";
import { X, ArrowLeft, FileText, LayoutGrid, Check, Sparkles, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminTemplates, FormTemplate } from "./schema";

interface CreateFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (formDraft: Partial<FormTemplate>, source: "blank" | "template") => void;
  templates?: FormTemplate[];
  frequentForms?: FormTemplate[];
}

export const CreateFormSheet = ({
  isOpen,
  onOpenChange,
  onContinue,
  templates = adminTemplates,
  frequentForms = [],
}: CreateFormSheetProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [startFrom, setStartFrom] = useState<"blank" | "template">("blank");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setTags([]);
      setNewTag("");
      setStartFrom("blank");
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplateId(template.id);
    setStartFrom("template");
    // Dynamically prefill metadata from template
    setName(template.title);
    setDescription(template.description || "");
    setTags(template.tags || []);
  };

  const handleSelectBlank = () => {
    setStartFrom("blank");
    setSelectedTemplateId(null);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    const selectedTemplate =
      startFrom === "template" && selectedTemplateId
        ? [...frequentForms, ...templates].find((t) => t.id === selectedTemplateId)
        : null;

    onContinue(
      {
        title: name.trim(),
        description: description.trim(),
        tags,
        status: "draft",
        ...(selectedTemplate
          ? {
              fields: selectedTemplate.fields,
              category: selectedTemplate.category,
              stepsCount: selectedTemplate.stepsCount,
            }
          : {}),
      },
      startFrom
    );
  };

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
          <div className="flex items-center gap-2 px-4 pt-2 pb-3 border-b border-border bg-card shrink-0">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-foreground active:bg-muted"
              aria-label="Close"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h3 className="text-[15px] font-bold text-foreground">New Form</h3>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Templates (top) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Start from a template
                </label>
                {selectedTemplateId && (
                  <button
                    onClick={handleSelectBlank}
                    className="text-[10px] font-semibold text-primary active:opacity-70"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                <button
                  onClick={handleSelectBlank}
                  className={`shrink-0 w-[140px] rounded-xl border p-3 text-left transition-all ${
                    startFrom === "blank"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card active:bg-muted/40"
                  }`}
                >
                  <div className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${
                    startFrom === "blank" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[12px] font-bold text-foreground">Blank</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Build from scratch</p>
                </button>

                {templates.map((tpl) => {
                  const selected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`relative shrink-0 w-[160px] rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card active:bg-muted/40"
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                      <div className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${
                        selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[12px] font-bold text-foreground truncate">{tpl.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {tpl.fields.length} field{tpl.fields.length === 1 ? "" : "s"}
                        {tpl.category ? ` · ${tpl.category}` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Form name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Site safety check"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this form for?"
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tags
              </label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-card border-t border-border shrink-0">
            <button
              onClick={handleCreate}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold active:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CreateFormSheet;
