import MobileLayout from "@/components/layout/MobileLayout";
import { useState } from "react";
import jobTapImg from "@/assets/job-tap-repair.jpg";
import jobBathroomImg from "@/assets/job-bathroom-reno.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin, Clock, Calendar, CheckCircle2, X, ChevronDown,
  Star, MessageCircle, Users, X as XIcon,
  UserCheck, User, UsersRound, Timer, Building2,
  Send, PoundSterling, FileText, Eye, RotateCcw, Car,
  Search, SlidersHorizontal, Filter,
} from "lucide-react";
import Avatar from "boring-avatars";
import IncomingJobCard from "@/components/trader/IncomingJobCard";
import ActiveJobCard from "@/components/trader/ActiveJobCard";
import CompanyJobCard, { type CompanyJobData } from "@/components/trader/CompanyJobCard";
import CollaborativeQuote from "@/components/trader/CollaborativeQuote";
import WorkerQuoteRequest from "@/components/trader/WorkerQuoteRequest";
import CalendarDayView from "@/components/home/CalendarDayView";

import JobDetailSheet, { type JobDetailData, type JobCategory } from "@/components/trader/JobDetailSheet";
import QuoteDetailSheet, { type SentQuoteData } from "@/components/trader/QuoteDetailSheet";

type JobStatus = "incoming" | "quotes" | "active" | "completed";

type MemberStatus = "en_route" | "arrived" | "working" | "done";

interface CrewMember {
  id: string;
  name: string;
  avatar: string;
  status: MemberStatus;
  updatedAt: string;
}

interface Assignment {
  type: "group" | "individuals" | "individual";
  groupName?: string;
  members: { id: string; name: string; role: string; hours?: number; earnings?: number }[];
}

interface Job {
  id: string;
  type: "catA" | "catB"; // Internal grouping
  category: JobCategory;
  title: string;
  icon: string;
  customer: string;
  location: string;
  distance: string;
  price: number | null;
  inspectionFee?: number;
  timeWindow: string;
  description: string;
  postedAgo: string;
  status: JobStatus;
  committedStatus?: "upcoming" | "in_progress" | "completed" | "cancelled";
  hasVoiceNote?: boolean;
  voiceDuration?: string;
  crew?: CrewMember[];
  assignment?: Assignment;
  completedDate?: string;
  duration?: string;
  customerRequest?: {
    photos?: string[];
    expectedDuration?: string;
    expectedBudget?: number;
  };
  customerData?: {
    rating: number;
    reviews: number;
    isVerified: boolean;
    memberSince: string;
  };
}

const initialJobs: Job[] = [
  { 
    id: "j1", 
    type: "catA", 
    category: "fixed",
    title: "Tap Repair", 
    icon: "🔧", 
    customer: "Emily R.", 
    location: "Amsterdam Centrum", 
    distance: "2.3 km", 
    price: 65, 
    timeWindow: "Today, 14:00 – 16:00", 
    description: "Kitchen tap is dripping constantly. Standard single-lever mixer tap. I have the replacement part already.", 
    postedAgo: "5 min ago", 
    status: "incoming", 
    hasVoiceNote: true, 
    voiceDuration: "0:23", 
    customerRequest: { expectedDuration: "1–2 hours", expectedBudget: 80, photos: [jobTapImg, jobTapImg] },
    customerData: { rating: 4.8, reviews: 12, isVerified: true, memberSince: "Jan 2024" }
  },
  { 
    id: "j3", 
    type: "catB", 
    category: "estimate",
    title: "Full Bathroom Renovation", 
    icon: "🛁", 
    customer: "Sarah L.", 
    location: "Jordaan", 
    distance: "1.8 km", 
    price: null, 
    timeWindow: "Mon, 10:00 – 12:00", 
    description: "Complete bathroom renovation including tiling, plumbing, and fixtures. Approx 6m² bathroom. Looking for a high-end finish.", 
    postedAgo: "1 hour ago", 
    status: "incoming", 
    hasVoiceNote: true, 
    voiceDuration: "1:12", 
    customerRequest: { expectedDuration: "2–3 days", expectedBudget: 1200, photos: [jobBathroomImg, jobBathroomImg, jobBathroomImg] },
    customerData: { rating: 4.9, reviews: 34, isVerified: true, memberSince: "Mar 2023" }
  },
  { 
    id: "j9", 
    type: "catB", 
    category: "inspection",
    title: "Wall Damp Inspection", 
    icon: "🏠", 
    customer: "Mark van B.", 
    location: "De Pijp", 
    distance: "3.1 km", 
    price: null, 
    inspectionFee: 45,
    timeWindow: "Fri, 10:00 – 12:00", 
    description: "There is some dampness on the living room wall. Need a professional to check the source and provide a solution.", 
    postedAgo: "15 min ago", 
    status: "incoming", 
    hasVoiceNote: false, 
    customerRequest: { expectedDuration: "1 hour" },
    customerData: { rating: 4.5, reviews: 8, isVerified: false, memberSince: "Feb 2025" }
  },
  { id: "j2", type: "catA", category: "fixed", title: "Light Switch Replacement", icon: "💡", customer: "Mark T.", location: "De Pijp", distance: "4.1 km", price: 55, timeWindow: "Tomorrow, 09:00 – 11:00", description: "2 light switches need replacing in the hallway. Standard switches.", postedAgo: "12 min ago", status: "incoming", hasVoiceNote: false, customerRequest: { expectedDuration: "30 min – 1 hour" }, customerData: { rating: 4.2, reviews: 5, isVerified: true, memberSince: "Nov 2024" } },
  { id: "j4", type: "catA", category: "fixed", title: "Drain Unblocking", icon: "🚿", customer: "David K.", location: "Oud-West", distance: "3.0 km", price: 75, timeWindow: "Today, 10:00 – 12:00", description: "Kitchen sink is completely blocked. Tried plunger, no luck.", postedAgo: "", status: "active", committedStatus: "in_progress", crew: [
    { id: "m1", name: "Jan V.", avatar: "JV", status: "arrived", updatedAt: "2 min ago" },
    { id: "m2", name: "Pieter D.", avatar: "PD", status: "en_route", updatedAt: "8 min ago" },
  ] },
  { id: "j5", type: "catA", category: "fixed", title: "Wall Painting (1 room)", icon: "🎨", customer: "Hannah P.", location: "Amstelveen", distance: "8.5 km", price: 120, timeWindow: "14 Mar, 09:00 – 14:00", description: "Living room walls need repainting. White to light grey.", postedAgo: "", status: "active", committedStatus: "upcoming", crew: [
    { id: "m3", name: "Lena K.", avatar: "LK", status: "working", updatedAt: "15 min ago" },
    { id: "m4", name: "Tom B.", avatar: "TB", status: "arrived", updatedAt: "5 min ago" },
    { id: "m5", name: "Sara M.", avatar: "SM", status: "en_route", updatedAt: "12 min ago" },
  ] },
  {
    id: "j6", type: "catA", category: "fixed", title: "Toilet Repair", icon: "🔧", customer: "Lisa M.", location: "Oost", distance: "5.2 km", price: 55, timeWindow: "10 Mar, 11:00", description: "Flush mechanism not working properly.", postedAgo: "", status: "completed", committedStatus: "completed",
    completedDate: "10 Mar 2025", duration: "1h 45m",
    assignment: {
      type: "group", groupName: "Plumbing Squad",
      members: [
        { id: "m1", name: "Alex Turner", role: "Plumber", hours: 1.75, earnings: 26.25 },
        { id: "m2", name: "James Cooper", role: "Plumber", hours: 1.75, earnings: 26.25 },
      ],
    },
  },
  {
    id: "j7", type: "catA", category: "fixed", title: "Boiler Service", icon: "🔥", customer: "Peter W.", location: "Centrum", distance: "1.5 km", price: 95, timeWindow: "8 Mar, 10:00", description: "Annual boiler service and safety check.", postedAgo: "", status: "completed", committedStatus: "completed",
    completedDate: "8 Mar 2025", duration: "2h 10m",
    assignment: {
      type: "individual",
      members: [{ id: "m4", name: "Sophie Baker", role: "Electrician", hours: 2.15, earnings: 32.25 }],
    },
  },
  {
    id: "j8", type: "catA", category: "fixed", title: "Kitchen Tiling", icon: "🧱", customer: "Anna J.", location: "Westerpark", distance: "3.8 km", price: 210, timeWindow: "5 Mar, 09:00 – 15:00", description: "Re-tile kitchen backsplash, approx 4m².", postedAgo: "", status: "completed", committedStatus: "completed",
    completedDate: "5 Mar 2025", duration: "5h 30m",
    assignment: {
      type: "individuals",
      members: [
        { id: "m1", name: "Manu R.", role: "Tiler", hours: 5.5, earnings: 82.50 },
        { id: "m3", name: "Lena K.", role: "Tiler", hours: 5.5, earnings: 82.50 },
        { id: "m6", name: "Erik D.", role: "Helper", hours: 3, earnings: 36 },
        { id: "m7", name: "Jos V.", role: "Helper", hours: 3, earnings: 36 },
      ],
    },
  },
  {
    id: "j10", type: "catA", category: "fixed", title: "Radiator Replacement", icon: "🔥", customer: "Mike S.", location: "Bos en Lommer", distance: "4.0 km", price: 180, timeWindow: "15 Mar, 09:00 – 12:00", description: "Replace old radiator in bedroom. Standard panel radiator.", postedAgo: "", status: "active", committedStatus: "cancelled",
    completedDate: "Cancelled on 14 Mar",
  },
];

const companyJobs: CompanyJobData[] = [
  {
    id: "cj1",
    type: "company",
    title: "Office Plumbing Overhaul",
    icon: "🏢",
    companyName: "BuildRight Ltd.",
    distance: "6.2 km",
    price: null,
    timeWindow: "Next week, Mon – Wed",
    description: "Full plumbing inspection and repair across 3 office floors. Includes bathroom fixtures, kitchen area, and water heater.",
    postedAgo: "30 min ago",
    customerRequest: {
      expectedDuration: "2–3 days",
      photos: ["/placeholder.svg", "/placeholder.svg"],
      hasVoiceNote: true,
      voiceDuration: "0:45",
    },
  },
  {
    id: "cj2",
    type: "company",
    title: "Warehouse Electrical Check",
    icon: "⚡",
    companyName: "Swift Logistics",
    distance: "4.8 km",
    price: 320,
    timeWindow: "Tomorrow, 08:00 – 12:00",
    description: "Annual electrical safety inspection for warehouse. Includes panel check, emergency lighting, and certificate issuance.",
    postedAgo: "1 hr ago",
    customerRequest: {
      expectedDuration: "4 hours",
    },
  },
];

interface SentQuote {
  id: string;
  jobTitle: string;
  icon: string;
  customer: string;
  location: string;
  distance: string;
  sentAt: string;
  quoteTotal: number;
  materialsCount: number;
  labourHours?: number;
  labourRate?: number;
  labourTypes?: { role: string; count: number; rate: number; hours: number }[];
  status: "pending" | "accepted" | "declined" | "expired";
  assignedTo?: { type: "group" | "individuals"; name: string; memberCount: number };
}

const initialSentQuotes: SentQuote[] = [
  {
    id: "sq1",
    jobTitle: "Kitchen Renovation",
    icon: "🍳",
    customer: "Anna B.",
    location: "Centrum",
    distance: "3.2 km",
    sentAt: "2 hours ago",
    quoteTotal: 1850,
    materialsCount: 8,
    labourHours: 6,
    labourRate: 45,
    labourTypes: [{ role: "Plumber", count: 2, rate: 18, hours: 6 }, { role: "Helper", count: 1, rate: 12, hours: 6 }],
    status: "pending",
    assignedTo: { type: "group", name: "Plumbing Squad", memberCount: 2 },
  },
  {
    id: "sq2",
    jobTitle: "Office Rewiring",
    icon: "⚡",
    customer: "TechCorp B.V.",
    location: "Zuidas",
    distance: "5.1 km",
    sentAt: "1 day ago",
    quoteTotal: 2400,
    materialsCount: 12,
    labourHours: 8,
    labourRate: 50,
    labourTypes: [{ role: "Electrician", count: 2, rate: 22, hours: 8 }],
    status: "accepted",
    assignedTo: { type: "individuals", name: "Sophie, Liam", memberCount: 2 },
  },
  {
    id: "sq3",
    jobTitle: "Roof Repair",
    icon: "🏠",
    customer: "Jan V.",
    location: "Oud-West",
    distance: "2.8 km",
    sentAt: "3 days ago",
    quoteTotal: 950,
    materialsCount: 5,
    labourHours: 4,
    labourRate: 40,
    labourTypes: [{ role: "Roofer", count: 1, rate: 20, hours: 4 }, { role: "Helper", count: 1, rate: 12, hours: 4 }],
    status: "declined",
    assignedTo: { type: "group", name: "Electrical Team", memberCount: 2 },
  },
  {
    id: "sq4",
    jobTitle: "Garden Landscaping",
    icon: "🌿",
    customer: "Maria K.",
    location: "Amstelveen",
    distance: "7.4 km",
    sentAt: "5 days ago",
    quoteTotal: 780,
    materialsCount: 6,
    labourHours: 3,
    labourRate: 45,
    labourTypes: [{ role: "Landscaper", count: 2, rate: 16, hours: 3 }],
    status: "expired",
    assignedTo: { type: "individuals", name: "Alex, James", memberCount: 2 },
  },
];

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

// Mock schedule data with rich details for nearby bookings
import type { NearbyScheduleItem } from "@/components/trader/IncomingJobCard";

const mockNearbySchedules: Record<string, NearbyScheduleItem[]> = {
  "j1": [
    { time: "12:00 – 13:00", title: "Lunch break", location: "Home", distanceFromJob: "4.2 km", driveTime: "12 min" },
    { time: "16:30 – 17:30", title: "Boiler check", location: "Oud-West, Bilderdijkstraat", distanceFromJob: "1.8 km", driveTime: "7 min" },
  ],
  "j3": [
    { time: "Mon 08:00–09:30", title: "Pipe fitting", location: "Centrum, Damrak", distanceFromJob: "2.1 km", driveTime: "9 min" },
    { time: "Mon 13:00–15:00", title: "Valve replacement", location: "De Pijp, Ferdinand Bol", distanceFromJob: "0.8 km", driveTime: "4 min" },
  ],
  "j9": [
    { time: "Fri 08:30–09:30", title: "Drain clearing", location: "Oost, Linnaeusstraat", distanceFromJob: "1.2 km", driveTime: "5 min" },
    { time: "Fri 12:00–14:00", title: "Kitchen install", location: "Oost, Middenweg", distanceFromJob: "0.5 km", driveTime: "3 min" },
  ],
  "j2": [
    { time: "Tomorrow 07:30–08:30", title: "Morning prep", location: "Workshop, Sloterdijk", distanceFromJob: "6.3 km", driveTime: "18 min" },
  ],
};

const statusConfig: Record<SentQuote["status"], { label: string; className: string }> = {
  pending: { label: "Awaiting Response", className: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
  accepted: { label: "Accepted", className: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
};

const TraderJobs = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const traderType = profile?.trader_type ?? "individual";
  const isAgencyProfile = traderType === "agency";
  const isIndividual = traderType === "individual";

  const baseTabs: { label: string; status: JobStatus }[] = [
    { label: "Incoming", status: "incoming" },
    { label: "Quotes", status: "quotes" as JobStatus },
    { label: "Active", status: "active" },
    { label: "Completed", status: "completed" },
  ];

  const [activeTab, setActiveTab] = useState<JobStatus>("incoming");
  const [jobs, setJobs] = useState(initialJobs);
  const [companyJobList, setCompanyJobList] = useState(companyJobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobSection, setJobSection] = useState<"incoming" | "committed">("incoming");
  const [committedFilter, setCommittedFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  
  // Quote detail sheet state
  const [selectedQuote, setSelectedQuote] = useState<SentQuoteData | null>(null);
  const [isQuoteDetailOpen, setIsQuoteDetailOpen] = useState(false);
  const [sentQuotes, setSentQuotes] = useState(initialSentQuotes);
  
  // Detail sheet state
  const [selectedJob, setSelectedJob] = useState<JobDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Collaborative quote state
  const [collabQuoteJobId, setCollabQuoteJobId] = useState<string | null>(null);
  const [collabMembers, setCollabMembers] = useState<{ id: string; name: string; role: string }[]>([]);

  // Schedule bottom sheet state
  const [scheduleJob, setScheduleJob] = useState<Job | null>(null);

  const [dispatchJobId, setDispatchJobId] = useState<string | null>(null);
  const [assignStep, setAssignStep] = useState<"choose" | "select-members" | "confirm">("choose");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectedIndividual, setSelectedIndividual] = useState<{ id: string; name: string } | null>(null);
  const [selectedIndividuals, setSelectedIndividuals] = useState<{ id: string; name: string; role: string }[]>([]);
  const [individualSearch, setIndividualSearch] = useState("");


  const mockGroups = [
    { id: "g1", name: "Plumbing Squad", members: [
      { id: "m1", name: "Alex Turner", role: "Plumber" },
      { id: "m2", name: "James Cooper", role: "Plumber" },
    ]},
    { id: "g2", name: "Electrical Team", members: [
      { id: "m4", name: "Sophie Baker", role: "Electrician" },
      { id: "m5", name: "Liam Wright", role: "Electrician" },
    ]},
  ];

  const mockIndividuals = [
    { id: "m1", name: "Alex Turner", role: "Plumber" },
    { id: "m2", name: "James Cooper", role: "Plumber" },
    { id: "m4", name: "Sophie Baker", role: "Electrician" },
    { id: "m5", name: "Liam Wright", role: "Electrician" },
  ];

  const resetAssignFlow = () => {
    setDispatchJobId(null);
    setAssignStep("choose");
    setSelectedGroupId(null);
    setSelectedMemberIds(new Set());
    setSelectedIndividual(null);
    setSelectedIndividuals([]);
    setIndividualSearch("");
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };


  const searchLower = searchQuery.toLowerCase();
  const filteredJobs = jobs.filter((j) => {
    // Section filter
    if (jobSection === "incoming") {
      if (j.status !== "incoming") return false;
    } else {
      // committed — exclude incoming jobs
      if (j.status === "incoming") return false;
      if (committedFilter === "active" && j.committedStatus !== "in_progress" && j.committedStatus !== "upcoming") return false;
      if (committedFilter === "completed" && j.committedStatus !== "completed") return false;
      if (committedFilter === "cancelled" && j.committedStatus !== "cancelled") return false;
    }
    // Search filter
    if (searchQuery && !j.title.toLowerCase().includes(searchLower) && !j.customer.toLowerCase().includes(searchLower) && !j.location.toLowerCase().includes(searchLower)) return false;
    return true;
  });

  const committedStatusConfig: Record<string, { label: string; className: string }> = {
    upcoming: { label: "Upcoming", className: "bg-blue-500/10 text-blue-600" },
    in_progress: { label: "In Progress", className: "bg-primary/10 text-primary" },
    completed: { label: "Completed", className: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" },
    cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  };

  const renderCommittedJobCard = (job: Job) => {
    const statusTag = job.committedStatus ? committedStatusConfig[job.committedStatus] : null;

    if (job.status === "active" && job.committedStatus !== "cancelled") {
      return (
        <div key={job.id} className="rounded-2xl bg-card overflow-hidden border border-border card-shadow">
          {/* Status banner */}
          {statusTag && (
            <div className={`flex items-center justify-between px-4 py-1.5 ${statusTag.className.replace(/text-\S+/, '')} border-b border-border/40`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${statusTag.className.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                {statusTag.label}
              </span>
              {job.price && (
                <span className="text-sm font-extrabold text-foreground">£{job.price}</span>
              )}
            </div>
          )}
          <ActiveJobCard
            job={{
              id: job.id,
              title: job.title,
              icon: job.icon,
              customer: job.customer,
              timeWindow: job.timeWindow,
              location: job.location,
              distance: job.distance,
              status: job.status,
              price: statusTag ? null : job.price,
              crew: job.crew,
            }}
            expanded={false}
            onToggleExpand={() => openJobDetail(job)}
            description={job.description}
            viewMode={isIndividual ? "individual" : "agency"}
          />
        </div>
      );
    }

    // Completed / cancelled cards
    const a = job.assignment;
    let assignLabel = "";
    let AssignIcon = User;
    if (a) {
      if (a.type === "group") { assignLabel = a.groupName || "Group"; AssignIcon = UsersRound; }
      else if (a.type === "individual") { assignLabel = a.members[0]?.name || "Individual"; AssignIcon = User; }
      else { const shown = a.members.slice(0, 2).map((m) => m.name.split(" ")[0]); const extra = a.members.length - 2; assignLabel = extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", "); AssignIcon = Users; }
    }

    return (
      <div key={job.id} className="rounded-2xl bg-card overflow-hidden border border-border">
        {/* Status banner */}
        {statusTag && (
          <div className={`flex items-center justify-between px-4 py-1.5 ${statusTag.className.replace(/text-\S+/, '')} border-b border-border/40`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusTag.className.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
              {statusTag.label}
            </span>
            <span className="text-sm font-extrabold text-foreground">{job.price ? `£${job.price}` : "—"}</span>
          </div>
        )}
        <button onClick={() => openJobDetail(job)} className="w-full px-4 py-3.5 text-left">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl mt-0.5">{job.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
              <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.location}</span>
                <span className="text-border shrink-0">·</span>
                <span className="inline-flex items-center gap-1 truncate"><Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.timeWindow}</span>
              </div>
              {!isIndividual && a && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <AssignIcon className="h-3 w-3" />{assignLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            {job.committedStatus === "completed" && <><Star className="h-3.5 w-3.5 fill-star text-star" /><span className="text-xs font-bold text-foreground">5.0</span></>}
            <span className="text-[11px] text-muted-foreground">{job.customer}</span>
          </div>
          {job.completedDate && (
            <span className="text-[11px] text-muted-foreground">{job.completedDate}</span>
          )}
        </div>
      </div>
    );
  };


  const acceptJob = (id: string, assignTo?: { type: "group" | "individual"; name: string; memberNames?: string[] }) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "active" as JobStatus } : j)));
    if (assignTo) {
      if (assignTo.type === "group" && assignTo.memberNames) {
        toast.success(`Assigned to ${assignTo.name} (${assignTo.memberNames.join(", ")})! ✅`);
      } else {
        toast.success(`Assigned to ${assignTo.name}! ✅`);
      }
    } else {
      toast.success("Job accepted!");
    }
    resetAssignFlow();
  };

  const handleDispatch = (jobId: string, isCatB: boolean) => {
    if (isIndividual) {
      acceptJob(jobId);
      return;
    }

    if (isCatB && isAgencyProfile) {
      // Agency flow: collaborative quote with member assignment
      setCollabQuoteJobId(jobId);
      setCollabMembers(mockIndividuals);
      return;
    }

    setDispatchJobId(jobId);
  };

  const declineJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast("Job declined");
  };

  const completeJob = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "completed" as JobStatus } : j)));
    toast.success("Job marked as complete! 🎉");
  };

  const openJobDetail = (job: Job) => {
    // Store job data in sessionStorage for the detail page
    const detailData = {
      id: job.id,
      category: job.category,
      title: job.title,
      icon: job.icon,
      description: job.description,
      location: job.location,
      distance: job.distance,
      timeWindow: job.timeWindow,
      price: job.price ?? undefined,
      inspectionFee: job.inspectionFee,
      postedAgo: job.postedAgo,
      customer: {
        name: job.customer,
        rating: job.customerData?.rating ?? 5.0,
        reviews: job.customerData?.reviews ?? 0,
        isVerified: job.customerData?.isVerified ?? false,
        memberSince: job.customerData?.memberSince ?? "Recently",
      },
      media: {
        photos: job.customerRequest?.photos,
        voiceNote: job.hasVoiceNote ? {
          url: "#",
          duration: job.voiceDuration || "0:15",
        } : undefined,
      }
    };
    sessionStorage.setItem(`job_detail_${job.id}`, JSON.stringify(detailData));
    navigate(`/trader/jobs/${job.id}`);
  };

  const handleDetailAction = (jobId: string, action: string, data?: any) => {
    switch (action) {
      case "accept":
        acceptJob(jobId);
        break;
      case "send_estimate":
        // For individual, just accept/move to quotes. For agency, maybe more complex.
        // For now, let's treat it as a sent quote
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          setSentQuotes(prev => [{
            id: crypto.randomUUID(),
            jobTitle: job.title,
            icon: job.icon,
            customer: job.customer,
            location: job.location,
            distance: job.distance,
            sentAt: "Just now",
            quoteTotal: 0, // In reality, this would come from the 'data' param
            materialsCount: 0,
            status: "pending" as const,
          }, ...prev]);
          setJobs(prev => prev.filter(j => j.id !== jobId));
          toast.success("Estimate sent to customer!");
        }
        break;
      case "approve_inspection":
        toast.success("Inspection approved! We've notified the customer.");
        acceptJob(jobId);
        break;
      case "decline":
        declineJob(jobId);
        break;
      default:
        console.warn("Unknown job action:", action);
    }
    setIsDetailOpen(false);
  };

  return (
    <MobileLayout role="trader">
      {/* Quote Detail Sheet */}
      <QuoteDetailSheet
        quote={selectedQuote}
        isOpen={isQuoteDetailOpen}
        onOpenChange={setIsQuoteDetailOpen}
        isAgency={isAgencyProfile}
        onRemind={(id) => toast(`Reminder sent to ${sentQuotes.find(q => q.id === id)?.customer}`)}
        onWithdraw={(id) => {
          setSentQuotes(prev => prev.map(q => q.id === id ? { ...q, status: "declined" as const } : q));
          toast("Quote withdrawn");
        }}
        onRequote={(id) => toast("Requote flow would open here")}
        onViewJob={(id) => toast("Navigating to active job...")}
      />
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-6 pb-1">
          <h1 className="mb-3 text-2xl font-extrabold text-foreground font-heading">Jobs</h1>
          
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, customers, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Incoming / Committed switch */}
          <div className="flex gap-1 rounded-xl bg-muted p-1 mb-2">
            <button
              onClick={() => setJobSection("incoming")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all relative ${
                jobSection === "incoming" ? "bg-card text-foreground card-shadow" : "text-muted-foreground"
              }`}
            >
              Incoming
              {jobs.filter(j => j.status === "incoming").length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {jobs.filter(j => j.status === "incoming").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setJobSection("committed")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all relative ${
                jobSection === "committed" ? "bg-card text-foreground card-shadow" : "text-muted-foreground"
              }`}
            >
              Committed
              {jobs.filter(j => j.status === "active").length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {jobs.filter(j => j.status === "active").length}
                </span>
              )}
            </button>
          </div>

          {/* Status filters for committed section */}
          {jobSection === "committed" && (
            <div className="flex gap-2 mb-1 overflow-x-auto no-scrollbar">
              {(["all", "active", "completed", "cancelled"] as const).map((filter) => {
                const labels: Record<typeof filter, string> = { all: "All", active: "Active", completed: "Completed", cancelled: "Cancelled" };
                return (
                  <button
                    key={filter}
                    onClick={() => setCommittedFilter(filter)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 ${
                      committedFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
              <button
                key="quotes"
                onClick={() => { setJobSection("committed"); setCommittedFilter("all"); }}
                className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-secondary text-muted-foreground shrink-0"
              >
                Quotes ({sentQuotes.filter(q => q.status === "pending").length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-2 pb-6">
        {filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">
              {searchQuery ? "No matching jobs" : jobSection === "incoming" ? "No incoming jobs" : "No committed jobs"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search" : "Your jobs will show up here"}
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-3 ${isAgencyProfile && jobSection === "incoming" ? "max-h-[calc(100vh-200px)] overflow-y-auto pr-1" : ""}`}>
          {/* When committed + "All" filter, group by status with section headers */}
          {jobSection === "committed" && committedFilter === "all" && (() => {
            const statusOrder: Array<{ key: string; label: string; icon: typeof Clock; color: string }> = [
              { key: "in_progress", label: "In Progress", icon: Clock, color: "text-primary" },
              { key: "upcoming", label: "Upcoming", icon: Calendar, color: "text-blue-600" },
              { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-[hsl(142,70%,45%)]" },
              { key: "cancelled", label: "Cancelled", icon: X, color: "text-destructive" },
            ];
            const groupedJobs = statusOrder
              .map((s) => ({ ...s, jobs: filteredJobs.filter((j) => j.committedStatus === s.key) }))
              .filter((g) => g.jobs.length > 0);

            return groupedJobs.map((group) => (
              <div key={group.key} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 mt-1">
                  <group.icon className={`h-4 w-4 ${group.color}`} />
                  <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {group.jobs.length}
                  </span>
                </div>
                {group.jobs.map((job) => renderCommittedJobCard(job))}
              </div>
            ));
          })()}
          {/* Render jobs that aren't handled by grouped view above */}
          {(jobSection !== "committed" || committedFilter !== "all") && filteredJobs.map((job) => {
            // Use shared IncomingJobCard for incoming section
            if (job.status === "incoming") {
              return (
                <div key={job.id} className="flex flex-col gap-2">
                  {/* Agency collaborative quote — replaces the job card */}
                  {collabQuoteJobId === job.id && isAgencyProfile ? (
                    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
                      {/* Job header summary */}
                      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">{job.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate">{job.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{job.customer} · {job.location}</p>
                        </div>
                        <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Quote</span>
                      </div>
                      <div className="p-4">
                        <CollaborativeQuote
                          groups={mockGroups}
                          individuals={mockIndividuals}
                          onSendQuote={(data) => {
                            // Add to sent quotes
                            setSentQuotes(prev => [{
                              id: crypto.randomUUID(),
                              jobTitle: job.title,
                              icon: job.icon,
                              customer: job.customer,
                              location: job.location,
                              distance: job.distance,
                              sentAt: "Just now",
                              quoteTotal: data.total,
                              materialsCount: data.materials.length,
                              labourTypes: data.labourLines.map(l => ({ role: l.role, count: l.count, rate: 15, hours: 1 })),
                              status: "pending" as const,
                              assignedTo: { type: "group", name: "Assigned Team", memberCount: data.labourLines.reduce((s, l) => s + l.count, 0) },
                            }, ...prev]);
                            setJobs((prev) => prev.filter((j) => j.id !== job.id));
                            setCollabQuoteJobId(null);
                            setCollabMembers([]);
                            toast.success(`Quote sent to customer: £${data.total.toFixed(2)}`, {
                              description: `${data.materials.length} item(s) + £${data.labourTotal.toFixed(2)} labour`,
                            });
                          }}
                          onCancel={() => { setCollabQuoteJobId(null); setCollabMembers([]); }}
                        />
                      </div>
                    </div>
                  ) : (
                    <IncomingJobCard
                      job={job}
                      onViewDetail={() => openJobDetail(job)}
                      viewMode={isIndividual ? "individual" : "agency"}
                      onRequestPhotos={(id) => toast.success("Photo request sent to customer!")}
                      onShowSchedule={() => setScheduleJob(job)}
                    />
                  )}
                </div>
              );
            }

            return renderCommittedJobCard(job);
          })}

        </div>
      </div>

      {/* Accept & Assign Multi-Step Modal */}
      {dispatchJobId && (() => {
        const job = jobs.find((j) => j.id === dispatchJobId);
        if (!job) return null;
        const selectedGroup = mockGroups.find((g) => g.id === selectedGroupId);

        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
            <div className="w-full max-w-[390px] rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                {assignStep !== "choose" ? (
                  <button
                    onClick={() => {
                      if (assignStep === "confirm") {
                        setAssignStep(selectedGroupId ? "select-members" : "choose");
                      } else {
                        setAssignStep("choose");
                        setSelectedGroupId(null);
                        setSelectedMemberIds(new Set());
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
                  >
                    <ChevronDown className="h-4 w-4 text-foreground rotate-90" />
                  </button>
                ) : <div />}
                <h2 className="text-lg font-extrabold text-foreground font-heading">
                  {assignStep === "choose" ? "Pickup" : assignStep === "select-members" ? "Select Members" : "Confirm Assignment"}
                </h2>
                <button onClick={resetAssignFlow} className="rounded-full bg-muted p-2">
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Job info */}
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">{job.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                  <p className="text-xs text-muted-foreground">{job.customer} · {job.location}</p>
                </div>
              </div>

              {/* Step 1: Choose group or individual */}
              {assignStep === "choose" && (
                <>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assign to a Group</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {mockGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setSelectedMemberIds(new Set(group.members.map((m) => m.id)));
                          setAssignStep("select-members");
                        }}
                        className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow transition-all active:scale-[0.98]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-foreground">{group.name}</p>
                          <p className="text-[11px] text-muted-foreground">{group.members.length} members</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                      </button>
                    ))}
                  </div>

                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Or Assign to Individuals</p>

                  {/* Selected tags */}
                  {selectedIndividuals.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {selectedIndividuals.map((person) => (
                        <span
                          key={person.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary"
                        >
                          {person.name}
                          <button
                            onClick={() => setSelectedIndividuals((prev) => prev.filter((p) => p.id !== person.id))}
                            className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search input */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search workers..."
                      value={individualSearch}
                      onChange={(e) => setIndividualSearch(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  {/* Dropdown results */}
                  {(() => {
                    const query = individualSearch.toLowerCase();
                    const filtered = mockIndividuals.filter(
                      (p) =>
                        !selectedIndividuals.some((s) => s.id === p.id) &&
                        (p.name.toLowerCase().includes(query) || p.role.toLowerCase().includes(query))
                    );
                    if (filtered.length === 0 && individualSearch) {
                      return (
                        <p className="py-4 text-center text-xs text-muted-foreground">No workers found</p>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto rounded-xl border border-border bg-card">
                        {filtered.map((person) => (
                          <button
                            key={person.id}
                            onClick={() => {
                              setSelectedIndividuals((prev) => [...prev, person]);
                              setIndividualSearch("");
                            }}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-accent active:bg-accent"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground">
                              {person.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{person.name}</p>
                              <p className="text-[10px] text-muted-foreground">{person.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Bottom actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={resetAssignFlow}
                      className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors active:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedIndividuals.length > 0) {
                          setSelectedGroupId(null);
                          setSelectedIndividual(selectedIndividuals[0]);
                          setAssignStep("confirm");
                        }
                      }}
                      disabled={selectedIndividuals.length === 0}
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
                    >
                      Continue ({selectedIndividuals.length})
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Select members from group */}
              {assignStep === "select-members" && selectedGroup && (
                <>
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2.5">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-primary">{selectedGroup.name}</span>
                    <span className="text-[10px] text-muted-foreground">· {selectedMemberIds.size} selected</span>
                  </div>

                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select workers for this job</p>
                  <div className="flex flex-col gap-2">
                    {selectedGroup.members.map((member) => {
                      const isSelected = selectedMemberIds.has(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMember(member.id)}
                          className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all active:scale-[0.98] ${
                            isSelected ? "bg-primary/5 border-2 border-primary" : "bg-card border-2 border-transparent card-shadow"
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                          }`}>
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-foreground">{member.name}</p>
                            <p className="text-[11px] text-muted-foreground">{member.role}</p>
                          </div>
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            isSelected ? "bg-primary" : "border-2 border-border"
                          }`}>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => selectedMemberIds.size > 0 && setAssignStep("confirm")}
                    disabled={selectedMemberIds.size === 0}
                    className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
                  >
                    Continue ({selectedMemberIds.size} selected)
                  </button>
                </>
              )}

              {/* Step 3: Confirm */}
              {assignStep === "confirm" && (
                <>
                  <div className="mb-3 rounded-2xl bg-accent/50 border border-border p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Assignment Summary</p>
                    {selectedGroup ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-bold text-foreground">{selectedGroup.name}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 pl-6">
                          {selectedGroup.members
                            .filter((m) => selectedMemberIds.has(m.id))
                            .map((m) => (
                              <div key={m.id} className="flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                                  {m.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <span className="text-xs font-semibold text-foreground">{m.name}</span>
                                <span className="text-[10px] text-muted-foreground">{m.role}</span>
                              </div>
                            ))}
                        </div>
                      </>
                    ) : selectedIndividuals.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {selectedIndividuals.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-xs font-semibold text-foreground">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground">{p.role}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={resetAssignFlow}
                      className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-muted-foreground transition-colors active:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedGroup) {
                          const memberNames = selectedGroup.members
                            .filter((m) => selectedMemberIds.has(m.id))
                            .map((m) => m.name);
                          acceptJob(dispatchJobId, { type: "group", name: selectedGroup.name, memberNames });
                        } else if (selectedIndividuals.length > 0) {
                          acceptJob(dispatchJobId, { type: "individual", name: selectedIndividuals.map((p) => p.name).join(", "), memberNames: selectedIndividuals.map((p) => p.name) });
                        }
                      }}
                      className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
                      Confirm
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Schedule bottom sheet — calendar day view */}
      {scheduleJob && (
        <>
          <div
            className="absolute inset-0 z-40 bg-foreground/40"
            onClick={() => setScheduleJob(null)}
          />
          <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-background shadow-2xl border-t border-border/40 animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex items-center justify-between px-5 pb-2">
              <h3 className="text-sm font-bold text-foreground">My Schedule</h3>
              <button onClick={() => setScheduleJob(null)} className="rounded-full p-1 active:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {/* This job reference */}
            <div className="mx-4 mb-2 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2">
              <p className="text-[10px] font-bold text-primary mb-0.5">Viewing schedule for</p>
              <p className="text-[11px] font-semibold text-foreground">{scheduleJob.icon} {scheduleJob.title} · {scheduleJob.timeWindow}</p>
              <p className="text-[10px] text-muted-foreground">{scheduleJob.location} · {scheduleJob.distance}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-6">
              <CalendarDayView />
            </div>
          </div>
        </>
      )}

    </MobileLayout>
  );
};

export default TraderJobs;
