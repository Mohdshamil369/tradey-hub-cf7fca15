// Unified Messages inbox: individual + group conversations.
// - Individual conversations open the existing chat detail view (in this file).
// - Group conversations navigate to /chat/group/:groupId for the workspace.
import MobileLayout from "@/components/layout/MobileLayout";
import {
  MessageCircle, Send, ArrowLeft, Phone, MoreVertical, Calendar, Check, CheckCheck,
  ShieldAlert, Flag, Ban, Trash2, VolumeX, MapPin, Clock, Search, Plus, Star, Users, X,
  UserCog, User as UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmojiIcon, getEmojiIconColors } from "@/lib/icons";
import BoringAvatar from "boring-avatars";
import {
  Conversation, IndividualConversation, GroupConversation, Message,
  individualConversations, groupConversations,
} from "@/data/messaging";
import CreateGroupSheet from "@/components/chat/CreateGroupSheet";
import { toast } from "sonner";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

type FilterChip = "all" | "unread" | "favourites" | "groups";

const Chat = () => {
  const navigate = useNavigate();

  // Conversation state — kept locally since this is mock data.
  const [individuals, setIndividuals] = useState<IndividualConversation[]>(individualConversations);
  const [groups, setGroups] = useState<GroupConversation[]>(groupConversations);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [showCreateGroupSheet, setShowCreateGroupSheet] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(
    new Set([...individuals, ...groups].filter((c) => c.favourite).map((c) => c.id)),
  );

  // Active individual chat (group chats route away)
  const [activeIndividualId, setActiveIndividualId] = useState<string | null>(null);
  const activeIndividual = individuals.find((c) => c.id === activeIndividualId) ?? null;

  // ── Inbox: combined + filtered + searched ──
  const conversations = useMemo<Conversation[]>(() => {
    const merged: Conversation[] = [...individuals, ...groups].map((c) => ({
      ...c,
      favourite: favourites.has(c.id),
    }));
    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }, [individuals, groups, favourites]);

  const visibleConversations = useMemo(() => {
    let list = conversations;
    if (filter === "unread") list = list.filter((c) => c.unread > 0);
    if (filter === "favourites") list = list.filter((c) => c.favourite);
    if (filter === "groups") list = list.filter((c) => c.type === "group");
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    return list;
  }, [conversations, filter, search]);

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Individual chat detail (preserved behaviour from previous Chat.tsx) ──
  const [newMessage, setNewMessage] = useState("");
  const [blockedWarning, setBlockedWarning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const containsPersonalInfo = (text: string): boolean => {
    const phoneRegex = /(\+?\d[\d\s\-().]{5,}\d)/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const socialRegex = /(?:instagram|whatsapp|telegram|snapchat|facebook|ig|wa)\s*[:\-@]\s*\S+/i;
    return phoneRegex.test(text) || emailRegex.test(text) || socialRegex.test(text);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !activeIndividualId) return;
    if (containsPersonalInfo(newMessage)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 4000);
      return;
    }
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: newMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setIndividuals((prev) =>
      prev.map((c) =>
        c.id === activeIndividualId
          ? { ...c, lastMessage: newMessage, time: "Just now", timestamp: Date.now(), messages: [...c.messages, newMsg] }
          : c,
      ),
    );
    setNewMessage("");
  };

  // ────────────────────────────────────────────
  // Individual chat detail view
  // ────────────────────────────────────────────
  if (activeIndividual) {
    const c = activeIndividual;
    return (
      <MobileLayout role="trader">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-card/70 backdrop-blur-xl px-4 py-3">
            <button onClick={() => setActiveIndividualId(null)}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="relative shrink-0">
              <BoringAvatar size={40} name={c.name} variant="beam" colors={avatarPalette} />
              {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-online" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{c.name}</h3>
              <p className="text-[10px] text-muted-foreground">
                {c.online ? "Online" : "Offline"} · {c.service}
              </p>
            </div>
            <button className="rounded-full bg-muted p-2"><Phone className="h-4 w-4 text-foreground" /></button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="rounded-full bg-muted p-2">
                <MoreVertical className="h-4 w-4 text-foreground" />
              </button>
              {showMenu && (
                <>
                  <div className="absolute inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-card border border-border card-shadow overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => setShowMenu(false)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground active:bg-muted/60 border-b border-border"><VolumeX className="h-4 w-4 text-muted-foreground" />Mute Notifications</button>
                    <button onClick={() => setShowMenu(false)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground active:bg-muted/60 border-b border-border"><Ban className="h-4 w-4 text-muted-foreground" />Block User</button>
                    <button onClick={() => setShowMenu(false)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive active:bg-muted/60 border-b border-border"><Flag className="h-4 w-4" />Report</button>
                    <button onClick={() => setShowMenu(false)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive active:bg-muted/60"><Trash2 className="h-4 w-4" />Delete Chat</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Job context */}
          <button
            onClick={() => navigate("/trader/jobs")}
            className="w-full border-b border-border bg-accent/40 px-4 py-3 text-left active:bg-accent/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border">
                <EmojiIcon emoji={c.serviceIcon} size={20} weight="regular" colorize />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-foreground truncate">{c.service}</p>
                  <div className="flex items-center gap-2">
                    {c.jobPrice ? (
                      <span className="text-sm font-extrabold text-primary shrink-0">£{c.jobPrice}</span>
                    ) : (
                      <span className="shrink-0 rounded-md bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[10px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
                    )}
                    <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">
                      <Calendar className="h-3 w-3" />View Job
                    </span>
                  </div>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  {c.jobSchedule && <span className="inline-flex items-center gap-0.5 truncate"><Clock className="h-3 w-3 shrink-0" />{c.jobSchedule}</span>}
                  {c.jobDistance && (<><span className="text-border shrink-0">·</span><span className="inline-flex items-center gap-0.5 truncate"><MapPin className="h-3 w-3 shrink-0" />{c.jobDistance}</span></>)}
                </div>
              </div>
            </div>
          </button>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="mx-auto mb-2 rounded-full bg-muted px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                <EmojiIcon emoji={c.serviceIcon} size={12} weight="regular" colorize /> {c.service} — Chat started
              </div>
              {c.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <div className={`rounded-2xl px-4 py-2.5 ${msg.sender === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card card-shadow text-foreground"}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <div className="mt-1 flex items-center gap-1 justify-end">
                        <span className={`text-[10px] ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</span>
                        {msg.sender === "user" && (
                          <span className="flex items-center">
                            {msg.status === "sent" && <Check className="h-3.5 w-3.5 text-primary-foreground/50" />}
                            {msg.status === "delivered" && <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/50" />}
                            {msg.status === "read" && <CheckCheck className="h-3.5 w-3.5 text-info" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {blockedWarning && (
            <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 animate-in slide-in-from-bottom-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs font-semibold text-destructive">Sharing personal info (phone, email, social handles) is not allowed.</p>
            </div>
          )}

          <div className="border-t border-border bg-card/70 backdrop-blur-xl px-4 py-3 pb-8">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform active:scale-95 ${newMessage.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // ────────────────────────────────────────────
  // Inbox view
  // ────────────────────────────────────────────
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const filterChips: { id: FilterChip; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: totalUnread },
    { id: "favourites", label: "Favourites" },
    { id: "groups", label: "Groups" },
  ];

  return (
    <MobileLayout role="trader">
      <div className="px-4 pt-6 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-foreground font-heading">Messages</h1>
          <div className="flex items-center gap-2">
            {/* Admin / User pill toggle */}
            <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
              <button
                onClick={() => setAdminMode(true)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                  adminMode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={adminMode}
              >
                <UserCog className="h-3 w-3" /> Admin
              </button>
              <button
                onClick={() => setAdminMode(false)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                  !adminMode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={!adminMode}
              >
                <UserIcon className="h-3 w-3" /> User
              </button>
            </div>

            {/* Plus / new conversation */}
            <div className="relative">
              <button
                onClick={() => {
                  if (adminMode) setShowCreateGroupSheet(true);
                  else setShowCreateMenu((v) => !v);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
                aria-label={adminMode ? "Create new group" : "New conversation"}
              >
                <Plus className="h-5 w-5" />
              </button>
              {showCreateMenu && !adminMode && (
                <>
                  <div className="absolute inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-card border border-border card-shadow overflow-hidden">
                    <button
                      onClick={() => { setShowCreateMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground active:bg-muted/60"
                    >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      Start new chat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin banner — only visible in admin mode */}
        {adminMode && (
          <button
            onClick={() => setShowCreateGroupSheet(true)}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-3 text-left transition-all active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-foreground">
                Create a new group
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Add members, give it a name and start collaborating.
              </p>
            </div>
            <Plus className="h-4 w-4 shrink-0 text-primary" />
          </button>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages, groups, users"
            className="w-full rounded-xl bg-muted pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {filterChips.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {f.label}
                {f.count ? (
                  <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                    {f.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Conversation list */}
        {visibleConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="font-bold text-foreground">No messages</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search term." : "Conversations will appear here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleConversations.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                onOpen={() => {
                  if (c.type === "group") navigate(`/chat/group/${c.id}`);
                  else setActiveIndividualId(c.id);
                }}
                onToggleFavourite={() => toggleFavourite(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupSheet
        open={showCreateGroupSheet}
        onOpenChange={setShowCreateGroupSheet}
        onCreated={(g) => {
          setGroups((prev) => [g, ...prev]);
          toast.success(`Group "${g.name}" created`, {
            description: `${g.members.length} member${g.members.length === 1 ? "" : "s"}`,
          });
          // Open the new group's workspace
          navigate(`/chat/group/${g.id}`);
        }}
      />
    </MobileLayout>
  );
};

// ────────────────────────────────────────────
// Conversation row
// ────────────────────────────────────────────
const ConversationListItem = ({
  conversation,
  onOpen,
  onToggleFavourite,
}: {
  conversation: Conversation;
  onOpen: () => void;
  onToggleFavourite: () => void;
}) => {
  const isGroup = conversation.type === "group";

  return (
    <div className="rounded-2xl bg-card card-shadow overflow-hidden">
      {/* Job context header (individual only) */}
      {conversation.type === "individual" && (conversation.jobSchedule || conversation.jobPrice) && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-accent/50 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${getEmojiIconColors(conversation.serviceIcon).bg} bg-opacity-40`}>
              <EmojiIcon emoji={conversation.serviceIcon} size={14} weight="regular" colorize />
            </div>
            <span className="text-xs font-bold text-foreground truncate">{conversation.service}</span>
            {conversation.jobStatus && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${conversation.jobStatus === "In Progress" || conversation.jobStatus === "Confirmed" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                {conversation.jobStatus}
              </span>
            )}
          </div>
          {conversation.jobPrice ? (
            <span className="text-sm font-extrabold text-primary shrink-0">£{conversation.jobPrice}</span>
          ) : (
            <span className="shrink-0 rounded-md bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[9px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
          )}
        </div>
      )}

      <button onClick={onOpen} className="flex w-full items-center gap-3 p-3 text-left transition-all active:scale-[0.98]">
        <div className="relative shrink-0">
          {isGroup ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Users className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <BoringAvatar size={48} name={conversation.name} variant="beam" colors={avatarPalette} />
          )}
          {conversation.type === "individual" && conversation.online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-online" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{conversation.name}</h3>
              {isGroup && (
                <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                  · {(conversation as GroupConversation).members.length} members
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{conversation.time}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {conversation.unread > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {conversation.unread}
            </span>
          )}
        </div>
      </button>

      {/* Favourite toggle (subtle, bottom-right) */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavourite(); }}
        className="absolute"
        style={{ display: "none" }}
        aria-hidden
      />
      <div className="flex justify-end px-3 pb-2 -mt-1">
        <button
          onClick={onToggleFavourite}
          className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={conversation.favourite ? "Unfavourite" : "Favourite"}
        >
          <Star className={`h-3.5 w-3.5 ${conversation.favourite ? "fill-[hsl(45,95%,55%)] text-[hsl(45,95%,55%)]" : ""}`} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
