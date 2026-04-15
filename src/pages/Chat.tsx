import MobileLayout from "@/components/layout/MobileLayout";
import { MessageCircle, Send, ArrowLeft, Phone, MoreVertical, Calendar, Check, CheckCheck, ShieldAlert, Flag, Ban, Trash2, VolumeX, User, MapPin, Clock, Forward, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EmojiIcon, getEmojiIconColors } from "@/lib/icons";
import Avatar from "boring-avatars";
import { toast } from "sonner";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

interface ChatThread {
  id: string;
  contactId: string;
  contactName: string;
  contactInitial: string;
  service: string;
  serviceIcon: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
  // Job context (for trader view)
  jobLocation?: string;
  jobDistance?: string;
  jobSchedule?: string;
  jobPrice?: number | null;
  jobStatus?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  time: string;
  status?: "sent" | "delivered" | "read";
}

/* ── Customer chats (talking to traders) ── */
const customerChats: ChatThread[] = [
  {
    id: "c1",
    contactId: "t1",
    contactName: "John Smith",
    contactInitial: "J",
    service: "Tap Repair",
    serviceIcon: "🔧",
    lastMessage: "I'll be there at 10am sharp. See you then!",
    time: "2m ago",
    unread: 2,
    online: true,
    messages: [
      { id: "m1", text: "Hi John, I've booked the tap repair for Thursday.", sender: "user", time: "09:30", status: "read" },
      { id: "m2", text: "Great! Can you let me know which tap is causing issues?", sender: "other", time: "09:32" },
      { id: "m3", text: "It's the kitchen mixer tap, it's been dripping non-stop.", sender: "user", time: "09:35", status: "read" },
      { id: "m4", text: "No problem, I'll bring the right parts. Might be a cartridge issue.", sender: "other", time: "09:38" },
      { id: "m5", text: "I'll be there at 10am sharp. See you then!", sender: "other", time: "09:40" },
    ],
  },
  {
    id: "c2",
    contactId: "t2",
    contactName: "Sophie Baker",
    contactInitial: "S",
    service: "Light Installation",
    serviceIcon: "💡",
    lastMessage: "Sure, I can install dimmer switches too.",
    time: "1h ago",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "Hi Sophie, just wanted to check about the light fitting.", sender: "user", time: "08:15", status: "read" },
      { id: "m2", text: "Hi! Yes, I've got all the fixtures ready for your booking.", sender: "other", time: "08:20" },
      { id: "m3", text: "Can you also install dimmer switches?", sender: "user", time: "08:22", status: "delivered" },
      { id: "m4", text: "Sure, I can install dimmer switches too.", sender: "other", time: "08:25" },
    ],
  },
  {
    id: "c3",
    contactId: "t6",
    contactName: "Sarah Chen",
    contactInitial: "S",
    service: "Wall Painting",
    serviceIcon: "🎨",
    lastMessage: "The paint colour you chose looks lovely!",
    time: "3h ago",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Hi Sarah, I was wondering about the paint brands you use?", sender: "user", time: "06:10", status: "read" },
      { id: "m2", text: "I use Farrow & Ball and Dulux Trade — both excellent coverage.", sender: "other", time: "06:15" },
      { id: "m3", text: "The paint colour you chose looks lovely!", sender: "other", time: "06:18" },
    ],
  },
];

/* ── Trader chats (talking to customers) ── */
const traderChats: ChatThread[] = [
  {
    id: "tc1",
    contactId: "cust1",
    contactName: "Emily R.",
    contactInitial: "E",
    service: "Tap Repair",
    serviceIcon: "🔧",
    lastMessage: "Thanks! The kitchen tap is the one dripping.",
    time: "5m ago",
    unread: 1,
    online: true,
    jobLocation: "Amsterdam Centrum",
    jobDistance: "2.3 km",
    jobSchedule: "Today, 14:00 – 16:00",
    jobPrice: 65,
    jobStatus: "Confirmed",
    messages: [
      { id: "m1", text: "Hi Emily, I saw your job request for the tap repair. I'm available today at 2pm.", sender: "user", time: "10:15", status: "read" },
      { id: "m2", text: "That would be perfect! Can you come to Amsterdam Centrum?", sender: "other", time: "10:18" },
      { id: "m3", text: "Absolutely. Can you tell me which tap is causing issues?", sender: "user", time: "10:20", status: "read" },
      { id: "m4", text: "Thanks! The kitchen tap is the one dripping.", sender: "other", time: "10:22" },
    ],
  },
  {
    id: "tc2",
    contactId: "cust2",
    contactName: "David K.",
    contactInitial: "D",
    service: "Drain Unblocking",
    serviceIcon: "🚿",
    lastMessage: "I'm on my way now, should be there in 20 minutes.",
    time: "1h ago",
    unread: 0,
    online: false,
    jobLocation: "Oud-West",
    jobDistance: "3.0 km",
    jobSchedule: "Today, 10:00 – 12:00",
    jobPrice: 75,
    jobStatus: "In Progress",
    messages: [
      { id: "m1", text: "Hi, I'll be at your place in Oud-West around 10am.", sender: "user", time: "09:30", status: "read" },
      { id: "m2", text: "Great, I'll make sure to be home. The kitchen sink is completely blocked.", sender: "other", time: "09:32" },
      { id: "m3", text: "I'm on my way now, should be there in 20 minutes.", sender: "user", time: "09:40", status: "delivered" },
    ],
  },
  {
    id: "tc3",
    contactId: "cust3",
    contactName: "Sarah L.",
    contactInitial: "S",
    service: "Bathroom Renovation",
    serviceIcon: "🛁",
    lastMessage: "I'd love to discuss the tile options with you.",
    time: "2h ago",
    unread: 0,
    online: true,
    jobLocation: "Jordaan",
    jobDistance: "1.8 km",
    jobSchedule: "Flexible",
    jobPrice: null,
    jobStatus: "Quote Sent",
    messages: [
      { id: "m1", text: "Hi Sarah, thanks for accepting my quote for the bathroom renovation.", sender: "user", time: "08:00", status: "read" },
      { id: "m2", text: "Thank you! When can you start?", sender: "other", time: "08:05" },
      { id: "m3", text: "I can start next Monday. Shall we do a site visit first?", sender: "user", time: "08:08", status: "read" },
      { id: "m4", text: "I'd love to discuss the tile options with you.", sender: "other", time: "08:12" },
    ],
  },
];


/* ── Trader team chats (talking to assigned workers) ── */
const traderTeamChats: ChatThread[] = [
  {
    id: "team1",
    contactId: "w1",
    contactName: "Mike's Plumbing Crew",
    contactInitial: "M",
    service: "Tap Repair",
    serviceIcon: "🔧",
    lastMessage: "Got it, I'll bring the extra parts.",
    time: "10m ago",
    unread: 1,
    online: true,
    jobLocation: "Amsterdam Centrum",
    jobDistance: "2.3 km",
    jobSchedule: "Today, 14:00 – 16:00",
    jobPrice: 65,
    jobStatus: "Confirmed",
    messages: [
      { id: "m1", text: "Team, new job assigned — Tap Repair at Amsterdam Centrum.", sender: "user", time: "10:25", status: "read" },
      { id: "m2", text: "Got it, I'll bring the extra parts.", sender: "other", time: "10:30" },
    ],
  },
  {
    id: "team2",
    contactId: "w2",
    contactName: "Drainage Team",
    contactInitial: "D",
    service: "Drain Unblocking",
    serviceIcon: "🚿",
    lastMessage: "On site now, starting work.",
    time: "45m ago",
    unread: 0,
    online: true,
    jobLocation: "Oud-West",
    jobDistance: "3.0 km",
    jobSchedule: "Today, 10:00 – 12:00",
    jobPrice: 75,
    jobStatus: "In Progress",
    messages: [
      { id: "m1", text: "Heads up — David's drain is completely blocked. Kitchen sink.", sender: "user", time: "09:35", status: "read" },
      { id: "m2", text: "On site now, starting work.", sender: "other", time: "10:05" },
    ],
  },
  {
    id: "team3",
    contactId: "w3",
    contactName: "Tom & Alex",
    contactInitial: "T",
    service: "Bathroom Renovation",
    serviceIcon: "🛁",
    lastMessage: "We can start Monday as planned.",
    time: "3h ago",
    unread: 0,
    online: false,
    jobLocation: "Jordaan",
    jobDistance: "1.8 km",
    jobSchedule: "Flexible",
    jobPrice: null,
    jobStatus: "Quote Sent",
    messages: [
      { id: "m1", text: "New bathroom reno in Jordaan — Sarah wants to discuss tiles.", sender: "user", time: "08:10", status: "read" },
      { id: "m2", text: "We can start Monday as planned.", sender: "other", time: "08:20" },
    ],
  },
];


const Chat = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isTrader = true; // Strictly forced to trader flow
  const traderType = profile?.trader_type ?? "individual";
  const isAgencyOwner = isTrader && traderType === "agency";
  const isIndividualTrader = isTrader && !isAgencyOwner;

  // Individual traders see a single unified list of all chats (customer + agency messages mixed)
  const individualTraderChats: ChatThread[] = [
    ...traderChats,
    ...traderTeamChats.map((tc) => ({ ...tc, contactName: `${tc.contactName} (Company)` })),
  ].sort((a, b) => (a.unread > b.unread ? -1 : 1));

  const [showData, setShowData] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState(isIndividualTrader ? individualTraderChats : isTrader ? traderChats : customerChats);
  const [teamChats, setTeamChats] = useState(traderTeamChats);
  const [traderTab, setTraderTab] = useState<"customers" | "team">("customers");
  const [blockedWarning, setBlockedWarning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const allTraderChats = traderTab === "customers" ? chats : teamChats;
  const currentChat = chats.find((c) => c.id === activeChat) || teamChats.find((c) => c.id === activeChat);

  const containsPersonalInfo = (text: string): boolean => {
    const phoneRegex = /(\+?\d[\d\s\-().]{5,}\d)/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const socialRegex = /(?:instagram|whatsapp|telegram|snapchat|facebook|ig|wa)\s*[:\-@]\s*\S+/i;
    return phoneRegex.test(text) || emailRegex.test(text) || socialRegex.test(text);
  };

  // Forward a customer message to the team chat for this job
  const forwardToTeam = (msg: Message) => {
    // Find matching team chat by service
    if (!currentChat) return;
    const matchingTeam = teamChats.find((tc) => tc.service === currentChat.service);
    if (matchingTeam) {
      const forwarded: Message = {
        id: `m${Date.now()}`,
        text: `📨 Forwarded from ${currentChat.contactName}:\n"${msg.text}"`,
        sender: "user",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setTeamChats((prev) =>
        prev.map((tc) =>
          tc.id === matchingTeam.id
            ? { ...tc, lastMessage: forwarded.text, time: "Just now", messages: [...tc.messages, forwarded] }
            : tc
        )
      );
      toast.success(`Forwarded to ${matchingTeam.contactName}`);
    } else {
      toast.error("No team chat found for this job");
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;

    if (containsPersonalInfo(newMessage)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 4000);
      return;
    }

    const newMsg = {
      id: `m${Date.now()}`,
      text: newMessage,
      sender: "user" as const,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent" as const,
    };

    const updater = (prev: ChatThread[]) =>
      prev.map((c) =>
        c.id === activeChat
          ? { ...c, lastMessage: newMessage, time: "Just now", messages: [...c.messages, newMsg] }
          : c
      );

    setChats(updater);
    setTeamChats(updater);
    setNewMessage("");
  };

  // Chat detail view
  if (currentChat) {
    return (
      <MobileLayout role={isTrader ? "trader" : "customer"}>
        <div className="flex h-full flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-border bg-card/70 backdrop-blur-xl px-4 py-3">
            <button onClick={() => setActiveChat(null)}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="relative shrink-0">
              <Avatar
                size={40}
                name={currentChat.contactName}
                variant="beam"
                colors={avatarPalette}
              />
              {currentChat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-online" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{currentChat.contactName}</h3>
              <p className="text-[10px] text-muted-foreground">
                {currentChat.online ? "Online" : "Offline"} · {currentChat.service}
              </p>
            </div>
            <button className="rounded-full bg-muted p-2">
              <Phone className="h-4 w-4 text-foreground" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="rounded-full bg-muted p-2">
                <MoreVertical className="h-4 w-4 text-foreground" />
              </button>

              {showMenu && (
                <>
                  <div className="absolute inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-card border border-border card-shadow overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground active:bg-muted/60 border-b border-border"
                    >
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      Mute Notifications
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground active:bg-muted/60 border-b border-border"
                    >
                      <Ban className="h-4 w-4 text-muted-foreground" />
                      Block User
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive active:bg-muted/60 border-b border-border"
                    >
                      <Flag className="h-4 w-4" />
                      Report
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive active:bg-muted/60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Chat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/trader/jobs")}
            className="w-full border-b border-border bg-accent/40 px-4 py-3 text-left active:bg-accent/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border`}>
                <EmojiIcon emoji={currentChat.serviceIcon} size={20} weight="regular" colorize />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-foreground truncate">{currentChat.service}</p>
                  <div className="flex items-center gap-2">
                    {currentChat.jobPrice ? (
                      <span className="text-sm font-extrabold text-primary shrink-0">£{currentChat.jobPrice}</span>
                    ) : (
                      <span className="shrink-0 rounded-md bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[10px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
                    )}
                    <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">
                      <Calendar className="h-3 w-3" />
                      View Job
                    </span>
                  </div>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  {currentChat.jobSchedule && (
                    <span className="inline-flex items-center gap-0.5 truncate">
                      <Clock className="h-3 w-3 shrink-0" />{currentChat.jobSchedule}
                    </span>
                  )}
                  {currentChat.jobDistance && (
                    <>
                      <span className="text-border shrink-0">·</span>
                      <span className="inline-flex items-center gap-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />{currentChat.jobDistance}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {currentChat.jobStatus && (
              <div className="mt-2 ml-[52px]">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${currentChat.jobStatus === "In Progress"
                    ? "bg-primary/10 text-primary"
                    : currentChat.jobStatus === "Confirmed"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                  {currentChat.jobStatus}
                </span>
              </div>
            )}
          </button>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="mx-auto mb-2 rounded-full bg-muted px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                <EmojiIcon emoji={currentChat.serviceIcon} size={12} weight="regular" colorize /> {currentChat.service} — Chat started
              </div>

              {currentChat.messages.map((msg) => {
                const isCustomerChat = isTrader && traderTab === "customers" || chats.some(c => c.id === activeChat);
                const isIncomingCustomerMsg = isTrader && isCustomerChat && msg.sender === "other";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${msg.sender === "user"
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-card card-shadow text-foreground"
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                        <div className="mt-1 flex items-center gap-1 justify-end">
                          <span
                            className={`text-[10px] ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                              }`}
                          >
                            {msg.time}
                          </span>
                          {msg.sender === "user" && (
                            <span className="flex items-center">
                              {msg.status === "sent" && <Check className="h-3.5 w-3.5 text-primary-foreground/50" />}
                              {msg.status === "delivered" && <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/50" />}
                              {msg.status === "read" && <CheckCheck className="h-3.5 w-3.5 text-info" />}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Forward to team button — only for agency owners on incoming customer messages */}
                      {isAgencyOwner && isIncomingCustomerMsg && (
                        <button
                          onClick={() => forwardToTeam(msg)}
                          className="flex items-center gap-1.5 self-start rounded-lg bg-accent px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                        >
                          <Forward className="h-3 w-3" />
                          Ping to Team
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked warning */}
          {blockedWarning && (
            <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 animate-in slide-in-from-bottom-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs font-semibold text-destructive">
                Sharing personal information (phone numbers, emails, social handles) is not allowed on this platform.
              </p>
            </div>
          )}

          {/* Message input */}
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
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform active:scale-95 ${newMessage.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Chat list view
  const emptyMessage = "Chats appear here once you receive job requests";
  const emptyAction = { label: "View Active Jobs", route: "/trader/jobs" };

  return (
    <MobileLayout role={isTrader ? "trader" : "customer"}>
      <div className="px-4 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-foreground font-heading">Messages</h1>
          <button
            onClick={() => setShowData(!showData)}
            className={`relative h-7 w-12 rounded-full transition-colors ${showData ? "bg-primary" : "bg-muted"
              }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${showData ? "translate-x-5" : "translate-x-0.5"
                }`}
            />
          </button>
        </div>

        {/* Trader tabs: Customers / Team — only for agency owners */}
        {isAgencyOwner && showData && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTraderTab("customers")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${traderTab === "customers" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
            >
              <User className="h-3.5 w-3.5" />
              Customers
            </button>
            <button
              onClick={() => setTraderTab("team")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${traderTab === "team" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
            >
              <Users className="h-3.5 w-3.5" />
              Team
              {teamChats.reduce((sum, tc) => sum + tc.unread, 0) > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {teamChats.reduce((sum, tc) => sum + tc.unread, 0)}
                </span>
              )}
            </button>
          </div>
        )}

        {showData ? (
          <div className="flex flex-col gap-3">
            {(isAgencyOwner ? allTraderChats : chats).map((chat) => {
              const hasJobContext = isTrader && (chat.jobSchedule || chat.jobDistance || chat.jobPrice);
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className="rounded-2xl bg-card card-shadow transition-all active:scale-[0.98] text-left overflow-hidden"
                >
                  {/* Job context bar for traders */}
                  {hasJobContext && (
                    <div className="flex items-center justify-between gap-2 border-b border-border bg-accent/50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${getEmojiIconColors(chat.serviceIcon).bg} bg-opacity-40`}><EmojiIcon emoji={chat.serviceIcon} size={14} weight="regular" colorize /></div>
                        <span className="text-xs font-bold text-foreground truncate">{chat.service}</span>
                        {chat.jobStatus && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${chat.jobStatus === "In Progress" || chat.jobStatus === "Confirmed"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground"
                            }`}>
                            {chat.jobStatus}
                          </span>
                        )}
                      </div>
                      {chat.jobPrice ? (
                        <span className="text-sm font-extrabold text-primary shrink-0">£{chat.jobPrice}</span>
                      ) : (
                        <span className="shrink-0 rounded-md bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[9px] font-bold text-[hsl(25,90%,55%)]">Quote</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3">
                    <div className="relative shrink-0">
                      {isAgencyOwner && traderTab === "team" ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <Avatar
                          size={48}
                          name={chat.contactName}
                          variant="beam"
                          colors={avatarPalette}
                        />
                      )}
                      {chat.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-online" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground truncate">{chat.contactName}</h3>
                        <span className="text-[10px] text-muted-foreground shrink-0">{chat.time}</span>
                      </div>
                      {/* Customer view: show service inline */}
                      {!isTrader && (
                        <div className="flex items-center gap-1.5">
                          <EmojiIcon emoji={chat.serviceIcon} size={12} weight="regular" colorize />
                          <span className="text-[10px] font-semibold text-primary">{chat.service}</span>
                        </div>
                      )}
                      {/* Trader view: show schedule & distance */}
                      {isTrader && (chat.jobSchedule || chat.jobDistance) && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {chat.jobSchedule && (
                            <span className="inline-flex items-center gap-0.5 truncate">
                              <Clock className="h-3 w-3 shrink-0" />{chat.jobSchedule}
                            </span>
                          )}
                          {chat.jobSchedule && chat.jobDistance && <span className="text-border">·</span>}
                          {chat.jobDistance && (
                            <span className="inline-flex items-center gap-0.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />{chat.jobDistance}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{chat.lastMessage}</p>
                    </div>

                    {chat.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="font-bold text-foreground">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
            <button
              onClick={() => navigate(emptyAction.route)}
              className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
            >
              {emptyAction.label}
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Chat;
