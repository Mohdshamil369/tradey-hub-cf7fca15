import { Drawer } from "vaul";
import { X, ArrowLeft, Plus, Hash, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormTemplate } from "./schema";

interface CreateFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (formDraft: Partial<FormTemplate>, source: "blank" | "template") => void;
}

export const CreateFormSheet = ({
  isOpen,
  onOpenChange,
  onContinue,
}: CreateFormSheetProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["Feedback", "Survey"]);
  const [newTag, setNewTag] = useState("");
  const [startFrom, setStartFrom] = useState<"blank" | "template">("blank");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    onContinue({ title: name, description, tags, status: "draft" }, startFrom);
  };

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
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground">Create New Form</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Form Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Form Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter form name..."
                className="w-full rounded-2xl border border-border/60 bg-white px-4 py-4 text-[13px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description..."
                rows={4}
                className="w-full rounded-2xl border border-border/60 bg-white px-4 py-4 text-[13px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/40 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground">Tags</label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                className="w-full rounded-2xl border border-border/60 bg-white px-4 py-4 text-[13px] text-foreground outline-none focus:border-black transition-all placeholder:text-muted-foreground/40"
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2ff] px-4 py-2 text-[11px] font-bold text-[#4c6ef5]"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="p-0.5 hover:bg-black/10 rounded-full transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Start From */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground">Start From</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStartFrom("blank")}
                  className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 p-6 transition-all ${
                    startFrom === "blank" ? "border-black bg-white shadow-sm" : "border-transparent bg-white shadow-sm opacity-60"
                  }`}
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#f0f0f0]">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">Blank Form</span>
                </button>
                <button
                  onClick={() => setStartFrom("template")}
                  className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 p-6 transition-all ${
                    startFrom === "template" ? "border-black bg-white shadow-sm" : "border-transparent bg-white shadow-sm opacity-60"
                  }`}
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#f0f0f0]">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">Templates</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-border/40">
            <button
              onClick={handleCreate}
              className="w-full py-4 bg-black text-white rounded-2xl text-[14px] font-bold active:scale-[0.98] transition-all shadow-md"
            >
              Create Form
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CreateFormSheet;
