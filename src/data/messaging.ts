// ============================================================
// Unified messaging data layer (mock).
// Powers the Messages inbox + group workspace.
// Keep individual-chat shape compatible with the existing Chat detail view.
// ============================================================

export type ConversationType = "individual" | "group";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  senderName?: string; // for groups
  time: string;
  status?: "sent" | "delivered" | "read";
}

// Shared base for both conversation types
interface BaseConversation {
  id: string;
  type: ConversationType;
  name: string;
  lastMessage: string;
  time: string;
  timestamp: number; // for sorting
  unread: number;
  favourite?: boolean;
  messages: Message[];
}

export interface IndividualConversation extends BaseConversation {
  type: "individual";
  contactInitial: string;
  service: string;
  serviceIcon: string;
  online: boolean;
  // Job context
  jobLocation?: string;
  jobDistance?: string;
  jobSchedule?: string;
  jobPrice?: number | null;
  jobStatus?: string;
}

export interface GroupConversation extends BaseConversation {
  type: "group";
  members: GroupMember[];
  description?: string;
  customerRating?: number; // 0-5
}

export type Conversation = IndividualConversation | GroupConversation;

// ── Groups ──────────────────────────────────────────────────

export type GroupRole = "admin" | "user";
export type InviteStatus = "accepted" | "pending" | "declined";

export interface GroupMember {
  id: string;
  name: string;
  initial: string;
  role: GroupRole;
  email: string;
  avatarColor?: string;
  online?: boolean;
  /** Tracks invitation lifecycle. Existing members default to "accepted". */
  inviteStatus?: InviteStatus;
  invitedAt?: number;
}

// ── Jobs (group-scoped) ─────────────────────────────────────

export type JobStatus = "active" | "completed" | "upcoming";
export type SubtaskStatus = "pending" | "accepted" | "in_progress" | "completed";

export interface Subtask {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  assigneeIds: string[];
  status: SubtaskStatus;
  formId?: string; // optional attached form
}

export interface GroupJob {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  status: JobStatus;
  assigneeIds: string[];
  payment?: JobPayment;
  formIds?: string[];
}

// ── Forms ───────────────────────────────────────────────────

export type FormFieldType = "text" | "textarea" | "select" | "rating" | "file" | "email" | "number";

export interface FormFieldDef {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface GroupForm {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  fields: FormFieldDef[];
}

// ── Payments ────────────────────────────────────────────────

export type PaymentModel = "fixed" | "hourly" | "commission";

export interface JobPayment {
  model: PaymentModel;
  amount: number; // £ for fixed/hourly, % for commission
  currency?: "GBP";
}

export interface GroupRetainer {
  id: string;
  groupId: string;
  memberId: string;
  amount: number;
  cadence: "weekly" | "monthly";
}

export interface PayoutRecord {
  id: string;
  groupId: string;
  memberId: string;
  jobId?: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
}

// ── Activity ────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  groupId: string;
  actorName: string;
  text: string;
  time: string;
  timestamp: number;
}

// ============================================================
// Mock data
// ============================================================

const now = Date.now();
const mins = (m: number) => now - m * 60_000;

// Members shared across groups
const members: Record<string, GroupMember> = {
  "u-self": { id: "u-self", name: "You", initial: "Y", role: "admin", email: "you@tradeyhub.app", online: true },
  "u-mike": { id: "u-mike", name: "Mike Reeves", initial: "M", role: "user", email: "mike@tradeyhub.app", online: true },
  "u-alex": { id: "u-alex", name: "Alex Turner", initial: "A", role: "user", email: "alex@tradeyhub.app", online: false },
  "u-sara": { id: "u-sara", name: "Sara Wilkins", initial: "S", role: "user", email: "sara@tradeyhub.app", online: true },
  "u-tom":  { id: "u-tom",  name: "Tom Bates",   initial: "T", role: "user", email: "tom@tradeyhub.app", online: false },
  "u-kim":  { id: "u-kim",  name: "Kim Lo",      initial: "K", role: "admin", email: "kim@tradeyhub.app", online: true },
};

export const allMembers = members;

// ── Individual conversations ────────────────────────────────

export const individualConversations: IndividualConversation[] = [
  {
    id: "i-1",
    type: "individual",
    name: "Emily R.",
    contactInitial: "E",
    service: "Tap Repair",
    serviceIcon: "🔧",
    online: true,
    lastMessage: "Thanks! The kitchen tap is the one dripping.",
    time: "5m ago",
    timestamp: mins(5),
    unread: 1,
    favourite: true,
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
    id: "i-2",
    type: "individual",
    name: "David K.",
    contactInitial: "D",
    service: "Drain Unblocking",
    serviceIcon: "🚿",
    online: false,
    lastMessage: "I'm on my way now, should be there in 20 minutes.",
    time: "1h ago",
    timestamp: mins(60),
    unread: 0,
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
    id: "i-3",
    type: "individual",
    name: "Sarah L.",
    contactInitial: "S",
    service: "Bathroom Renovation",
    serviceIcon: "🛁",
    online: true,
    lastMessage: "I'd love to discuss the tile options with you.",
    time: "2h ago",
    timestamp: mins(120),
    unread: 0,
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

// ── Group conversations ─────────────────────────────────────

export const groupConversations: GroupConversation[] = [
  {
    id: "g-1",
    type: "group",
    name: "Plumbing Crew",
    description: "Core plumbing team — Amsterdam region.",
    lastMessage: "Mike: Got it, I'll bring the extra parts.",
    time: "10m ago",
    timestamp: mins(10),
    unread: 2,
    favourite: true,
    customerRating: 4.8,
    members: [members["u-self"], members["u-mike"], members["u-alex"], members["u-sara"]],
    messages: [
      { id: "m1", text: "Team, new job assigned — Tap Repair at Amsterdam Centrum.", sender: "user", senderName: "You", time: "10:25", status: "read" },
      { id: "m2", text: "Got it, I'll bring the extra parts.", sender: "other", senderName: "Mike", time: "10:30" },
      { id: "m3", text: "I can take the Oud-West drain afterwards.", sender: "other", senderName: "Sara", time: "10:32" },
    ],
  },
  {
    id: "g-2",
    type: "group",
    name: "Bathroom Fitters",
    description: "Specialists for full bathroom renovations.",
    lastMessage: "Tom: We can start Monday as planned.",
    time: "3h ago",
    timestamp: mins(180),
    unread: 0,
    customerRating: 4.6,
    members: [members["u-self"], members["u-tom"], members["u-alex"], members["u-kim"]],
    messages: [
      { id: "m1", text: "New bathroom reno in Jordaan — Sarah wants to discuss tiles.", sender: "user", senderName: "You", time: "08:10", status: "read" },
      { id: "m2", text: "We can start Monday as planned.", sender: "other", senderName: "Tom", time: "08:20" },
    ],
  },
];

// ── Jobs / subtasks ─────────────────────────────────────────

export const groupJobs: GroupJob[] = [
  {
    id: "j-1",
    groupId: "g-1",
    title: "Tap Repair – Amsterdam Centrum",
    description: "Kitchen mixer tap, persistent drip. Customer: Emily R.",
    status: "active",
    assigneeIds: ["u-mike", "u-sara"],
    payment: { model: "fixed", amount: 65, currency: "GBP" },
    formIds: ["f-1"],
  },
  {
    id: "j-2",
    groupId: "g-1",
    title: "Drain Unblocking – Oud-West",
    description: "Fully blocked kitchen sink. Customer: David K.",
    status: "upcoming",
    assigneeIds: ["u-alex"],
    payment: { model: "fixed", amount: 75, currency: "GBP" },
  },
  {
    id: "j-3",
    groupId: "g-2",
    title: "Bathroom Renovation – Jordaan",
    description: "Full reno: tiling, fixtures, lighting.",
    status: "active",
    assigneeIds: ["u-tom", "u-alex"],
    payment: { model: "commission", amount: 15 },
    formIds: ["f-2"],
  },
  {
    id: "j-4",
    groupId: "g-2",
    title: "Shower Replacement – De Pijp",
    description: "Replace existing shower with rainfall unit.",
    status: "completed",
    assigneeIds: ["u-tom"],
    payment: { model: "hourly", amount: 45 },
  },
];

export const subtasks: Subtask[] = [
  { id: "s-1", jobId: "j-1", title: "Bring spare cartridge & seals", assigneeIds: ["u-mike"], status: "accepted" },
  { id: "s-2", jobId: "j-1", title: "Run leak test after install", assigneeIds: ["u-sara"], status: "pending", formId: "f-1" },
  { id: "s-3", jobId: "j-2", title: "Confirm arrival window with customer", assigneeIds: ["u-alex"], status: "pending" },
  { id: "s-4", jobId: "j-3", title: "Pick tile options for customer", assigneeIds: ["u-tom"], status: "in_progress" },
  { id: "s-5", jobId: "j-3", title: "Order grout & adhesive", assigneeIds: ["u-alex"], status: "completed" },
  { id: "s-6", jobId: "j-4", title: "Final handover photos", assigneeIds: ["u-tom"], status: "completed", formId: "f-2" },
];

// ── Forms ───────────────────────────────────────────────────

export const groupForms: GroupForm[] = [
  {
    id: "f-1",
    groupId: "g-1",
    title: "Leak Test Report",
    description: "Submit after running the post-install leak test.",
    fields: [
      { id: "ff1", type: "text", label: "Inspector name", required: true },
      { id: "ff2", type: "select", label: "Result", required: true, options: ["Pass", "Fail", "Needs follow-up"] },
      { id: "ff3", type: "textarea", label: "Notes", required: false },
      { id: "ff4", type: "file", label: "Photo of fitting", required: false },
    ],
  },
  {
    id: "f-2",
    groupId: "g-2",
    title: "Customer Handover Checklist",
    description: "Final sign-off form for completed renovations.",
    fields: [
      { id: "ff1", type: "rating", label: "Customer satisfaction", required: true },
      { id: "ff2", type: "textarea", label: "Customer comments", required: false },
      { id: "ff3", type: "file", label: "Final photos", required: true },
    ],
  },
];

// ── Payments ────────────────────────────────────────────────

export const retainers: GroupRetainer[] = [
  { id: "r-1", groupId: "g-2", memberId: "u-tom", amount: 200, cadence: "weekly" },
];

export const payouts: PayoutRecord[] = [
  { id: "p-1", groupId: "g-1", memberId: "u-mike", jobId: "j-1", amount: 32.5, date: "2024-03-22", status: "paid" },
  { id: "p-2", groupId: "g-1", memberId: "u-sara", jobId: "j-1", amount: 32.5, date: "2024-03-22", status: "pending" },
  { id: "p-3", groupId: "g-2", memberId: "u-tom", jobId: "j-4", amount: 360, date: "2024-03-18", status: "paid" },
];

// ── Activity ────────────────────────────────────────────────

export const activity: ActivityEntry[] = [
  { id: "a-1", groupId: "g-1", actorName: "You", text: "Created job 'Tap Repair – Amsterdam Centrum'", time: "2h ago", timestamp: mins(120) },
  { id: "a-2", groupId: "g-1", actorName: "Mike", text: "Accepted subtask 'Bring spare cartridge & seals'", time: "1h ago", timestamp: mins(60) },
  { id: "a-3", groupId: "g-1", actorName: "Sara", text: "Joined the group", time: "1d ago", timestamp: mins(60 * 24) },
  { id: "a-4", groupId: "g-2", actorName: "Alex", text: "Completed subtask 'Order grout & adhesive'", time: "5h ago", timestamp: mins(300) },
  { id: "a-5", groupId: "g-2", actorName: "You", text: "Created form 'Customer Handover Checklist'", time: "2d ago", timestamp: mins(60 * 48) },
];

// ── Helpers ─────────────────────────────────────────────────

export const getAllConversations = (): Conversation[] =>
  [...individualConversations, ...groupConversations].sort((a, b) => b.timestamp - a.timestamp);

export const getJobsForGroup = (groupId: string) => groupJobs.filter((j) => j.groupId === groupId);
export const getSubtasksForJob = (jobId: string) => subtasks.filter((s) => s.jobId === jobId);
export const getFormsForGroup = (groupId: string) => groupForms.filter((f) => f.groupId === groupId);
export const getFormById = (formId: string) => groupForms.find((f) => f.id === formId);
export const getPayoutsForGroup = (groupId: string) => payouts.filter((p) => p.groupId === groupId);
export const getRetainersForGroup = (groupId: string) => retainers.filter((r) => r.groupId === groupId);
export const getActivityForGroup = (groupId: string) =>
  activity.filter((a) => a.groupId === groupId).sort((a, b) => b.timestamp - a.timestamp);

export const subtaskStatusLabel = (s: SubtaskStatus) =>
  ({ pending: "Pending", accepted: "Accepted", in_progress: "In Progress", completed: "Completed" }[s]);

export const jobProgress = (jobId: string) => {
  const subs = getSubtasksForJob(jobId);
  if (subs.length === 0) return 0;
  const done = subs.filter((s) => s.status === "completed").length;
  return Math.round((done / subs.length) * 100);
};
