import MobileLayout from "@/components/layout/MobileLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin, Clock, Calendar, CheckCircle2, X, ChevronDown,
  Star, MessageCircle, Users, X as XIcon,
  UserCheck, User, UsersRound, Timer, Building2,
  Send, PoundSterling, FileText, Eye, RotateCcw,
} from "lucide-react";
import Avatar from "boring-avatars";
import IncomingJobCard from "@/components/trader/IncomingJobCard";
import ActiveJobCard from "@/components/trader/ActiveJobCard";
import CompanyJobCard, { type CompanyJobData } from "@/components/trader/CompanyJobCard";
import CollaborativeQuote from "@/components/trader/CollaborativeQuote";
import WorkerQuoteRequest from "@/components/trader/WorkerQuoteRequest";

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
    customerRequest: { expectedDuration: "1–2 hours", expectedBudget: 80, photos: ["/placeholder.svg"] },
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
    customerRequest: { expectedDuration: "2–3 days", expectedBudget: 1200, photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"] },
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
    customerRequest: { expectedDuration: "1 hour", photos: ["/placeholder.svg"] },
    customerData: { rating: 4.5, reviews: 8, isVerified: false, memberSince: "Feb 2025" }
  },
  { id: "j2", type: "catA", category: "fixed", title: "Light Switch Replacement", icon: "💡", customer: "Mark T.", location: "De Pijp", distance: "4.1 km", price: 55, timeWindow: "Tomorrow, 09:00 – 11:00", description: "2 light switches need replacing in the hallway. Standard switches.", postedAgo: "12 min ago", status: "incoming", hasVoiceNote: false, customerRequest: { expectedDuration: "30 min – 1 hour" }, customerData: { rating: 4.2, reviews: 5, isVerified: true, memberSince: "Nov 2024" } },
  { id: "j4", type: "catA", category: "fixed", title: "Drain Unblocking", icon: "🚿", customer: "David K.", location: "Oud-West", distance: "3.0 km", price: 75, timeWindow: "Today, 10:00 – 12:00", description: "Kitchen sink is completely blocked. Tried plunger, no luck.", postedAgo: "", status: "active", crew: [
    { id: "m1", name: "Jan V.", avatar: "JV", status: "arrived", updatedAt: "2 min ago" },
    { id: "m2", name: "Pieter D.", avatar: "PD", status: "en_route", updatedAt: "8 min ago" },
  ] },
  { id: "j5", type: "catA", category: "fixed", title: "Wall Painting (1 room)", icon: "🎨", customer: "Hannah P.", location: "Amstelveen", distance: "8.5 km", price: 120, timeWindow: "14 Mar, 09:00 – 14:00", description: "Living room walls need repainting. White to light grey.", postedAgo: "", status: "active", crew: [
    { id: "m3", name: "Lena K.", avatar: "LK", status: "working", updatedAt: "15 min ago" },
    { id: "m4", name: "Tom B.", avatar: "TB", status: "arrived", updatedAt: "5 min ago" },
    { id: "m5", name: "Sara M.", avatar: "SM", status: "en_route", updatedAt: "12 min ago" },
  ] },
  {
    id: "j6", type: "catA", category: "fixed", title: "Toilet Repair", icon: "🔧", customer: "Lisa M.", location: "Oost", distance: "5.2 km", price: 55, timeWindow: "10 Mar, 11:00", description: "Flush mechanism not working properly.", postedAgo: "", status: "completed",
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
    id: "j7", type: "catA", category: "fixed", title: "Boiler Service", icon: "🔥", customer: "Peter W.", location: "Centrum", distance: "1.5 km", price: 95, timeWindow: "8 Mar, 10:00", description: "Annual boiler service and safety check.", postedAgo: "", status: "completed",
    completedDate: "8 Mar 2025", duration: "2h 10m",
    assignment: {
      type: "individual",
      members: [{ id: "m4", name: "Sophie Baker", role: "Electrician", hours: 2.15, earnings: 32.25 }],
    },
  },
  {
    id: "j8", type: "catA", category: "fixed", title: "Kitchen Tiling", icon: "🧱", customer: "Anna J.", location: "Westerpark", distance: "3.8 km", price: 210, timeWindow: "5 Mar, 09:00 – 15:00", description: "Re-tile kitchen backsplash, approx 4m².", postedAgo: "", status: "completed",
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
  const [sentQuotes, setSentQuotes] = useState(initialSentQuotes);
  
  // Detail sheet state
  const [selectedJob, setSelectedJob] = useState<JobDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Collaborative quote state
  const [collabQuoteJobId, setCollabQuoteJobId] = useState<string | null>(null);
  const [collabMembers, setCollabMembers] = useState<{ id: string; name: string; role: string }[]>([]);

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


  const filteredJobs = jobs.filter((j) => j.status === activeTab);
  const incomingCount = jobs.filter((j) => j.status === "incoming").length;

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
    setSelectedJob({
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
    });
    setIsDetailOpen(true);
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
      {/* Detail Sheet */}
      <JobDetailSheet 
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        job={selectedJob}
        onAction={handleDetailAction}
      />
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-6 pb-1">
          <h1 className="mb-3 text-2xl font-extrabold text-foreground font-heading">Jobs</h1>
          <div className="mb-3 flex gap-2 rounded-xl bg-muted p-1">
            {baseTabs.map((tab) => (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all relative ${
                  activeTab === tab.status
                    ? "bg-card text-foreground card-shadow"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
                {tab.status === "incoming" && incomingCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {incomingCount}
                  </span>
                )}
                {tab.status === "quotes" && sentQuotes.filter(q => q.status === "pending").length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(25,90%,55%)] text-[9px] font-bold text-white">
                    {sentQuotes.filter(q => q.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-6">
        {/* Quotes tab — agency only */}
        {activeTab === "quotes" && (
          <div className="flex flex-col gap-3">
            {sentQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No sent quotes</p>
                <p className="text-sm text-muted-foreground">Quotes you send to customers will appear here</p>
              </div>
            ) : (
              <>
                {sentQuotes.map((quote) => {
                  const isExpanded = expandedId === quote.id;
                  const sc = statusConfig[quote.status];

                  return (
                    <div key={quote.id} className="rounded-2xl bg-card overflow-hidden border border-border">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : quote.id)}
                        className="w-full px-4 py-3.5 text-left"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl mt-0.5">
                            {quote.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{quote.jobTitle}</h4>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                              <span className="truncate">{quote.customer}</span>
                              <span className="text-border shrink-0">·</span>
                              <span className="truncate">{quote.location}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.className}`}>
                                {sc.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{quote.sentAt}</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border bg-muted/30">
                          {/* Breakdown as a clean summary card */}
                          <div className="px-4 py-3 space-y-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quote Breakdown</p>
                            
                            <div className="rounded-xl bg-accent/40 p-3 space-y-2">
                              {/* Materials line */}
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5 text-primary" />
                                  Materials ({quote.materialsCount} items)
                                </span>
                                <span className="font-semibold text-foreground">
                                  £{(quote.quoteTotal - (quote.labourHours && quote.labourRate ? quote.labourHours * quote.labourRate : 0)).toFixed(2)}
                                </span>
                              </div>

                              {/* Agency: labour roles with pay rates */}
                              {isAgencyProfile && quote.labourTypes && quote.labourTypes.map((lt, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px]">
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5 text-primary" />
                                    {lt.count}× {lt.role} ({lt.hours}h × £{lt.rate}/hr)
                                  </span>
                                  <span className="font-semibold text-foreground">£{(lt.count * lt.hours * lt.rate).toFixed(2)}</span>
                                </div>
                              ))}

                              {/* Individual: labour hours */}
                              {isIndividual && quote.labourHours && quote.labourRate && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Labour ({quote.labourHours}h × £{quote.labourRate}/hr)
                                  </span>
                                  <span className="font-semibold text-foreground">£{(quote.labourHours * quote.labourRate).toFixed(2)}</span>
                                </div>
                              )}

                              {/* Total */}
                              <div className="border-t border-border pt-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Total</span>
                                <span className="text-sm font-extrabold text-primary flex items-center gap-0.5">
                                  <PoundSterling className="h-3.5 w-3.5" />
                                  {quote.quoteTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Assignment info — agency only */}
                          {isAgencyProfile && quote.assignedTo && (
                            <div className="px-4 py-3 border-t border-border">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Assigned To</p>
                              <div className="flex items-center gap-2">
                                {quote.assignedTo.type === "group" ? (
                                  <UsersRound className="h-4 w-4 text-primary" />
                                ) : (
                                  <Users className="h-4 w-4 text-primary" />
                                )}
                                <span className="text-xs font-semibold text-foreground">{quote.assignedTo.name}</span>
                                <span className="text-[10px] text-muted-foreground">· {quote.assignedTo.memberCount} workers</span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="px-4 py-3 border-t border-border flex gap-2">
                            {quote.status === "pending" && (
                              <>
                                <button
                                  onClick={() => toast(`Reminder sent to ${quote.customer}`)}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground active:bg-muted"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  Remind
                                </button>
                                <button
                                  onClick={() => {
                                    setSentQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: "declined" as const } : q));
                                    toast("Quote withdrawn");
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-destructive/20 py-2.5 text-xs font-bold text-destructive active:bg-destructive/5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Withdraw
                                </button>
                              </>
                            )}
                            {quote.status === "declined" && (
                              <button
                                onClick={() => toast("Requote flow would open here")}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground active:scale-95"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Send New Quote
                              </button>
                            )}
                            {quote.status === "accepted" && (
                              <button
                                onClick={() => toast("Navigating to active job...")}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground active:scale-95"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Job
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer — only when collapsed */}
                      {!isExpanded && (
                        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />{quote.distance}
                          </span>
                          <span className="text-[15px] font-extrabold text-primary">£{quote.quoteTotal.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab !== "quotes" && filteredJobs.length === 0 && activeTab !== "incoming" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No {activeTab} jobs</p>
            <p className="text-sm text-muted-foreground">
              Your jobs will show up here
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-3 ${isAgencyProfile && activeTab === "incoming" ? "max-h-[calc(100vh-200px)] overflow-y-auto pr-1" : ""}`}>
          {activeTab === "active" && filteredJobs.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Upcoming</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {filteredJobs.length} jobs
              </span>
            </div>
          )}
          {filteredJobs.map((job) => {
            // Use shared IncomingJobCard for incoming tab
            if (activeTab === "incoming") {
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
                    />
                  )}
                </div>
              );
            }

            const isExpanded = expandedId === job.id;
            const isQuick = job.type === "catA";

            return (
              <div key={job.id}>
                {activeTab === "active" ? (
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
                      price: job.price,
                      crew: job.crew,
                    }}
                    expanded={false}
                    onToggleExpand={() => openJobDetail(job)}
                    description={job.description}
                    viewMode={isIndividual ? "individual" : "agency"}
                  />
                ) : (
                  /* Completed jobs */
                  (() => {
                    const a = job.assignment;
                    // Build collapsed assignment summary
                    let assignLabel = "";
                    let AssignIcon = User;
                    if (a) {
                      if (a.type === "group") {
                        assignLabel = a.groupName || "Group";
                        AssignIcon = UsersRound;
                      } else if (a.type === "individual") {
                        assignLabel = a.members[0]?.name || "Individual";
                        AssignIcon = User;
                      } else {
                        // individuals
                        const shown = a.members.slice(0, 2).map((m) => m.name.split(" ")[0]);
                        const extra = a.members.length - 2;
                        assignLabel = extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", ");
                        AssignIcon = Users;
                      }
                    }

                    return (
                      <div className="rounded-2xl bg-card overflow-hidden border border-border">
                        <button
                          onClick={() => openJobDetail(job)}
                          className="w-full px-4 py-3.5 text-left"
                        >
                          <div className="flex gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl mt-0.5">
                              {job.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-[14px] font-bold text-foreground truncate leading-snug">{job.title}</h4>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.location}
                                </span>
                                <span className="text-border shrink-0">·</span>
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />{job.timeWindow}
                                </span>
                              </div>
                              {/* Assignment summary badge — agency only */}
                              {!isIndividual && a && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    <AssignIcon className="h-3 w-3" />
                                    {assignLabel}
                                  </span>
                                  {a.type === "group" && (
                                    <span className="text-[10px] text-muted-foreground">· {a.members.length} members</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border bg-muted/30">
                            {/* Customer & Job Info */}
                            <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-border">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Customer</p>
                                <p className="text-xs font-semibold text-foreground">{job.customer}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Location</p>
                                <p className="text-xs font-semibold text-foreground">{job.location}</p>
                              </div>
                              {job.completedDate && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Completed</p>
                                  <p className="text-xs font-semibold text-foreground">{job.completedDate}</p>
                                </div>
                              )}
                              {job.duration && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Duration</p>
                                  <p className="text-xs font-semibold text-foreground flex items-center gap-1"><Timer className="h-3 w-3 text-muted-foreground" />{job.duration}</p>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {job.description && (
                              <div className="px-4 py-3 border-b border-border">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Description</p>
                                <p className="text-xs text-foreground leading-relaxed">{job.description}</p>
                              </div>
                            )}

                            {/* Assignment Details — agency only */}
                            {!isIndividual && a && (
                              <div className="px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {a.type === "group" ? "Group Assignment" : a.type === "individual" ? "Individual Assignment" : "Team Assignment"}
                                  </p>
                                  {a.type === "group" && a.groupName && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{a.groupName}</span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {a.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-2.5 rounded-xl bg-card border border-border px-3 py-2">
                                      <Avatar size={28} name={member.name} variant="beam" colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold text-foreground truncate">{member.name}</p>
                                        <p className="text-[9px] text-muted-foreground">{member.role}</p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        {member.hours != null && (
                                          <p className="text-[10px] font-semibold text-foreground">{member.hours}h</p>
                                        )}
                                        {member.earnings != null && (
                                          <p className="text-[9px] text-muted-foreground">£{member.earnings.toFixed(2)}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-star text-star" />
                            <span className="text-xs font-bold text-foreground">5.0</span>
                            <span className="text-[11px] text-muted-foreground">from {job.customer}</span>
                          </div>
                          <span className="text-[15px] font-extrabold text-primary">£{job.price}</span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            );
          })}

          {/* Company-assigned jobs — only in incoming tab */}
          {activeTab === "incoming" && isIndividual && companyJobList.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-4 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">From Your Company</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {companyJobList.length}
                </span>
              </div>
              {companyJobList.map((cj) => (
                <CompanyJobCard
                  key={cj.id}
                  job={cj}
                  expanded={expandedId === cj.id}
                  onToggleExpand={() => setExpandedId(expandedId === cj.id ? null : cj.id)}
                  onAccept={() => {
                    setCompanyJobList((prev) => prev.filter((j) => j.id !== cj.id));
                    toast.success(`Accepted company job from ${cj.companyName}! 🏢`);
                  }}
                  onDecline={() => {
                    setCompanyJobList((prev) => prev.filter((j) => j.id !== cj.id));
                    toast("Company job declined");
                  }}
                  onSubmitEstimate={(data) => {
                    setCompanyJobList((prev) => prev.filter((j) => j.id !== cj.id));
                    toast.success(`Estimate sent to ${cj.companyName}: £${data.grandTotal.toFixed(2)}`, {
                      description: `${data.materials.length} item(s) + ${data.labourHours}h labour`,
                    });
                  }}
                />
              ))}
            </>
          )}
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

    </MobileLayout>
  );
};

export default TraderJobs;
