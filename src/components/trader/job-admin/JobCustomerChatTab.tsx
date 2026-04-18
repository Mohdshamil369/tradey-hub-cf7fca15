import { useState } from "react";
import { Send, Paperclip, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import Avatar from "boring-avatars";

interface ChatMsg {
  id: string;
  text: string;
  sender: "trader" | "customer";
  time: string;
}

const seed: Record<string, ChatMsg[]> = {
  j5: [
    { id: "c1", sender: "trader", time: "13 Mar 09:12", text: "Morning Hannah — quote v2 attached. Let me know if the colour split per room is right." },
    { id: "c2", sender: "customer", time: "13 Mar 10:04", text: "Looks great, signed and returned. We can hand over keys on the 14th." },
    { id: "c3", sender: "trader", time: "16 Mar 17:20", text: "First coat done in two bedrooms today, photos in Docs tab." },
    { id: "c4", sender: "customer", time: "16 Mar 18:01", text: "Lovely, the colour really pops. Any chance we can add the study to scope?" },
  ],
};

interface JobCustomerChatTabProps {
  jobId: string;
  customerName: string;
}

const JobCustomerChatTab = ({ jobId, customerName }: JobCustomerChatTabProps) => {
  const [messages, setMessages] = useState<ChatMsg[]>(seed[jobId] ?? []);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    const msg: ChatMsg = {
      id: `c${Date.now()}`,
      sender: "trader",
      time: "Now",
      text: draft.trim(),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3 pb-6">
      <div className="rounded-xl border border-border/30 bg-muted/20 p-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-snug">
          Chat thread is scoped to this job — separate from your global inbox.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-[11px] text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {messages.map((m) => {
            const isTrader = m.sender === "trader";
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isTrader ? "flex-row-reverse" : ""}`}>
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                  <Avatar
                    name={isTrader ? "You" : customerName}
                    variant="beam"
                    size={28}
                    colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
                  />
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  isTrader ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  <p className="text-[12px] leading-relaxed">{m.text}</p>
                  <p className={`mt-0.5 text-[9px] ${isTrader ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border/40 bg-background px-4 py-2.5">
        <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-3 py-1.5">
          <button
            onClick={() => toast.info("Attach file — coming soon")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            aria-label="Attach"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${customerName}…`}
            className="flex-1 bg-transparent py-1.5 text-[12px] outline-none placeholder:text-muted-foreground/60"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCustomerChatTab;
