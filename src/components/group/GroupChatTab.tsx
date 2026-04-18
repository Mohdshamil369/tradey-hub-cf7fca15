import { Send } from "lucide-react";
import { useState } from "react";
import { GroupConversation } from "@/data/messaging";

const GroupChatTab = ({ group, onSend }: { group: GroupConversation; onSend: (text: string) => void }) => {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="mx-auto rounded-full bg-muted px-3 py-1 text-[10px] font-semibold text-muted-foreground">
            Group chat — {group.members.length} members
          </div>
          {group.messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col gap-0.5 max-w-[78%]">
                {m.sender === "other" && m.senderName && (
                  <span className="px-2 text-[10px] font-bold text-primary">{m.senderName}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${m.sender === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-card card-shadow text-foreground"}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
                  <span className={`mt-1 block text-right text-[10px] ${m.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-card/70 backdrop-blur-xl px-4 py-3 pb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message the group..."
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform active:scale-95 ${text.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatTab;
