import { Drawer } from "vaul";
import { X, ArrowLeft, FileText, LayoutGrid, Check } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [startFrom, setStartFrom] = useState<"blank" | "template">("blank");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setTags([]);
      setNewTag("");
      setStartFrom("blank");
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

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    onContinue(
      { title: name.trim(), description: description.trim(), tags, status: "draft" },
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

            {/* Start from */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Start from
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <StartFromCard
                  selected={startFrom === "blank"}
                  onClick={() => setStartFrom("blank")}
                  icon={<FileText className="h-5 w-5" />}
                  label="Blank"
                  desc="Build from scratch"
                />
                <StartFromCard
                  selected={startFrom === "template"}
                  onClick={() => setStartFrom("template")}
                  icon={<LayoutGrid className="h-5 w-5" />}
                  label="Template"
                  desc="Pick a starter"
                />
              </div>
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

const StartFromCard = ({
  selected,
  onClick,
  icon,
  label,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
      selected
        ? "border-primary bg-primary/5"
        : "border-border bg-card active:bg-muted/50"
    }`}
  >
    {selected && (
      <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-2.5 w-2.5" />
      </div>
    )}
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
      {icon}
    </div>
    <span className="text-[12px] font-bold text-foreground">{label}</span>
    <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
  </button>
);

export default CreateFormSheet;
