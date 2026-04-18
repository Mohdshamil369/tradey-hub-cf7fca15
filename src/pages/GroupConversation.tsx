// Group workspace — opened from the unified Messages inbox.
// Tabs: Chat / Jobs / Members / Payments / Activity (default: Chat)
// Includes inline Admin/User view toggle in the header.
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, MoreVertical, Users, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  groupConversations, allMembers, GroupConversation, Message,
} from "@/data/messaging";
import GroupChatTab from "@/components/group/GroupChatTab";
import GroupJobsTab from "@/components/group/GroupJobsTab";
import GroupMembersTab from "@/components/group/GroupMembersTab";
import GroupPaymentsTab from "@/components/group/GroupPaymentsTab";
import GroupActivityTab from "@/components/group/GroupActivityTab";

export type GroupViewMode = "admin" | "user";

const GroupConversationPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const initialGroup = useMemo(
    () => groupConversations.find((g) => g.id === groupId) ?? groupConversations[0],
    [groupId],
  );

  const [group, setGroup] = useState<GroupConversation>(initialGroup);
  const [tab, setTab] = useState("chat");

  // Self is admin in this mock — toggle controls perceived view
  const selfMember = allMembers["u-self"];
  const canBeAdmin = selfMember?.role === "admin";
  const [viewMode, setViewMode] = useState<GroupViewMode>(canBeAdmin ? "admin" : "user");

  const onSendMessage = (text: string) => {
    const msg: Message = {
      id: `m${Date.now()}`,
      text,
      sender: "user",
      senderName: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setGroup((g) => ({
      ...g,
      lastMessage: `You: ${text}`,
      time: "Just now",
      timestamp: Date.now(),
      messages: [...g.messages, msg],
    }));
  };

  return (
    <MobileLayout role="trader">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/70 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/chat")} aria-label="Back">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{group.name}</h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {group.members.length} members · {group.members.filter((m) => m.online).length} online
              </p>
            </div>
            {canBeAdmin && (
              <button
                onClick={() => setViewMode((v) => (v === "admin" ? "user" : "admin"))}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${viewMode === "admin" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                aria-label="Toggle view mode"
              >
                <ShieldCheck className="h-3 w-3" />
                {viewMode === "admin" ? "Admin View" : "User View"}
              </button>
            )}
            <button className="rounded-full bg-muted p-2" aria-label="More">
              <MoreVertical className="h-4 w-4 text-foreground" />
            </button>
          </div>

          {/* Member preview avatars */}
          <div className="mt-2 flex items-center gap-1.5 pl-12">
            {group.members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-card"
                title={m.name}
              >
                {m.initial}
              </div>
            ))}
            {group.members.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{group.members.length - 5}</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 grid w-auto grid-cols-5 gap-1 bg-muted/50">
            <TabsTrigger value="chat" className="text-[11px] data-[state=active]:bg-card">Chat</TabsTrigger>
            <TabsTrigger value="jobs" className="text-[11px] data-[state=active]:bg-card">Jobs</TabsTrigger>
            <TabsTrigger value="members" className="text-[11px] data-[state=active]:bg-card">Members</TabsTrigger>
            <TabsTrigger value="payments" className="text-[11px] data-[state=active]:bg-card">Pay</TabsTrigger>
            <TabsTrigger value="activity" className="text-[11px] data-[state=active]:bg-card">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden mt-2">
            <GroupChatTab group={group} onSend={onSendMessage} />
          </TabsContent>
          <TabsContent value="jobs" className="flex-1 overflow-y-auto mt-2 px-3 pb-6">
            <GroupJobsTab groupId={group.id} viewMode={viewMode} />
          </TabsContent>
          <TabsContent value="members" className="flex-1 overflow-y-auto mt-2 px-3 pb-6">
            <GroupMembersTab group={group} viewMode={viewMode} />
          </TabsContent>
          <TabsContent value="payments" className="flex-1 overflow-y-auto mt-2 px-3 pb-6">
            <GroupPaymentsTab groupId={group.id} viewMode={viewMode} />
          </TabsContent>
          <TabsContent value="activity" className="flex-1 overflow-y-auto mt-2 px-3 pb-6">
            <GroupActivityTab groupId={group.id} />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default GroupConversationPage;
