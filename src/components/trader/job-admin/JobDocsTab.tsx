import { FileText, Image as ImageIcon, Download, Eye, Plus, FileSignature } from "lucide-react";
import { toast } from "sonner";

interface DocItem {
  id: string;
  name: string;
  type: "quote" | "contract" | "invoice" | "photo" | "permit";
  size: string;
  date: string;
}

const seed: Record<string, DocItem[]> = {
  j5: [
    { id: "d1", name: "Quote v2 — Full Repaint.pdf", type: "quote", size: "184 KB", date: "12 Mar" },
    { id: "d2", name: "Signed Contract.pdf", type: "contract", size: "92 KB", date: "13 Mar" },
    { id: "d3", name: "Deposit Invoice #1024.pdf", type: "invoice", size: "44 KB", date: "13 Mar" },
    { id: "d4", name: "Site photos — pre-work (12).zip", type: "photo", size: "8.2 MB", date: "14 Mar" },
    { id: "d5", name: "Bedroom 1 — first coat.jpg", type: "photo", size: "1.4 MB", date: "16 Mar" },
  ],
};

const typeStyle: Record<DocItem["type"], { bg: string; icon: any; label: string }> = {
  quote:    { bg: "bg-blue-500/10 text-blue-600",                      icon: FileText,      label: "Quote" },
  contract: { bg: "bg-primary/10 text-primary",                        icon: FileSignature, label: "Contract" },
  invoice:  { bg: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",  icon: FileText,      label: "Invoice" },
  photo:    { bg: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]",    icon: ImageIcon,     label: "Photo" },
  permit:   { bg: "bg-muted text-muted-foreground",                    icon: FileText,      label: "Permit" },
};

interface JobDocsTabProps {
  jobId: string;
}

const JobDocsTab = ({ jobId }: JobDocsTabProps) => {
  const items = seed[jobId] ?? [];

  return (
    <div className="flex flex-col gap-3 pb-6">
      <button
        onClick={() => toast.info("Upload document — coming soon")}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-[12px] font-bold text-primary active:bg-primary/10"
      >
        <Plus className="h-4 w-4" /> Upload document
      </button>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-[11px] text-muted-foreground">No documents attached yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((d) => {
            const t = typeStyle[d.type];
            const Icon = t.icon;
            return (
              <div key={d.id} className="rounded-xl border border-border/30 bg-card p-3 flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{d.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {t.label} · {d.size} · {d.date}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toast.info(`Previewing ${d.name}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground active:bg-muted/70"
                    aria-label="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toast.success(`Downloading ${d.name}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground active:bg-muted/70"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobDocsTab;
