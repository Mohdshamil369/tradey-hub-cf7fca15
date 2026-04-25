import MobileLayout from "@/components/layout/MobileLayout";
import { useEffect, useState } from "react";
import jobTapImg from "@/assets/job-tap-repair.jpg";
import jobBathroomImg from "@/assets/job-bathroom-reno.jpg";
import { useNavigate } from "react-router-dom";
import { Drawer } from "vaul";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin, Clock, Calendar, CheckCircle2, X, ChevronDown,
  Star, MessageCircle, Users, X as XIcon,
  UserCheck, User, UsersRound, Timer, Building2,
  Send, PoundSterling, FileText, Eye, RotateCcw, Car,
  Search, SlidersHorizontal, Filter, Heart, HeartOff,
  Bookmark, ArrowRight, ChevronRight, ShieldCheck,
} from "lucide-react";
import Avatar from "boring-avatars";
import IncomingJobCard from "@/components/trader/IncomingJobCard";
import MinimalJobCard from "@/components/trader/MinimalJobCard";
import ActiveJobCard from "@/components/trader/ActiveJobCard";
import CompanyJobCard, { type CompanyJobData } from "@/components/trader/CompanyJobCard";
import CollaborativeQuote from "@/components/trader/CollaborativeQuote";
import WorkerQuoteRequest from "@/components/trader/WorkerQuoteRequest";
import CalendarDayView from "@/components/home/CalendarDayView";

import JobDetailSheet, { type JobDetailData, type JobCategory } from "@/components/trader/JobDetailSheet";
import QuoteDetailSheet, { type SentQuoteData } from "@/components/trader/QuoteDetailSheet";
import ResponseWorkflowSheet, { type ResponseJobData } from "@/components/trader/ResponseWorkflowSheet";
import QuoteSheet, { type QuoteSheetData } from "@/components/trader/QuoteSheet";
import InvoiceBuilderSheet from "@/components/trader/InvoiceBuilderSheet";
import { type JobWorkflowState, type WorkflowStage } from "@/data/jobWorkflowState";
import StageJobCard from "@/components/trader/StageJobCard";

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
  proposalsCount?: number;
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
  jobRating?: number;
  jobReview?: string;
  /** Where this job came to me from. "direct" = customer found me; "org" = forwarded by an organisation I work with. */
  source?: "direct" | "org";
  orgName?: string;
  /** True if this job was directly assigned to me by my organisation's admin. */
  assignedByAdmin?: boolean;
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
    proposalsCount: 2,
    customerRequest: { expectedDuration: "1–2 hours", expectedBudget: 80, photos: [jobTapImg, jobTapImg] },
    customerData: { rating: 4.8, reviews: 12, isVerified: true, memberSince: "Jan 2024" },
    source: "org", orgName: "BuildRight Ltd.", assignedByAdmin: true
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
    proposalsCount: 12,
    customerRequest: { expectedDuration: "2–3 days", expectedBudget: 1200, photos: [jobBathroomImg, jobBathroomImg, jobBathroomImg] },
    customerData: { rating: 4.9, reviews: 34, isVerified: true, memberSince: "Mar 2023" },
    source: "org", orgName: "Swift Logistics"
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
    proposalsCount: 4,
    customerRequest: { expectedDuration: "1 hour" },
    customerData: { rating: 4.5, reviews: 8, isVerified: false, memberSince: "Feb 2025" }
  },
  { id: "j2", type: "catA", category: "fixed", title: "Light Switch Replacement", icon: "💡", customer: "Mark T.", location: "De Pijp", distance: "4.1 km", price: 55, timeWindow: "Tomorrow, 09:00 – 11:00", description: "2 light switches need replacing in the hallway. Standard switches.", postedAgo: "12 min ago", status: "incoming", hasVoiceNote: false, proposalsCount: 8, customerRequest: { expectedDuration: "30 min – 1 hour" }, customerData: { rating: 4.2, reviews: 5, isVerified: true, memberSince: "Nov 2024" }, source: "org", orgName: "BuildRight Ltd.", assignedByAdmin: true },
  { id: "j4", type: "catA", category: "fixed", title: "Drain Unblocking", icon: "🚿", customer: "David K.", location: "Oud-West", distance: "3.0 km", price: 75, timeWindow: "Today, 10:00 – 12:00", description: "Kitchen sink is completely blocked. Tried plunger, no luck.", postedAgo: "", status: "active", committedStatus: "in_progress", crew: [
    { id: "m1", name: "Jan V.", avatar: "JV", status: "arrived", updatedAt: "2 min ago" },
    { id: "m2", name: "Pieter D.", avatar: "PD", status: "en_route", updatedAt: "8 min ago" },
  ] },
  {
    id: "j5", type: "catA", category: "estimate",
    title: "Full House Repaint & Trim", icon: "🎨",
    customer: "Hannah P.", location: "Amstelveen, Buitenveldert",
    distance: "8.5 km", price: 4800,
    timeWindow: "14 Mar – 4 Apr (3 weeks)",
    description: "Full interior repaint of a 4-bedroom house including ceilings, walls, skirting and doors. Premium matt finish, customer-supplied colours.",
    postedAgo: "", status: "active", committedStatus: "upcoming",
    crew: [
      { id: "m3", name: "Lena K.", avatar: "LK", status: "working", updatedAt: "15 min ago" },
      { id: "m4", name: "Tom B.", avatar: "TB", status: "arrived", updatedAt: "5 min ago" },
      { id: "m5", name: "Sara M.", avatar: "SM", status: "en_route", updatedAt: "12 min ago" },
    ],
  },
  {
    id: "j6", type: "catA", category: "fixed", title: "Toilet Repair", icon: "🔧", customer: "Lisa M.", location: "Oost", distance: "5.2 km", price: 55, timeWindow: "10 Mar, 11:00", description: "Flush mechanism not working properly.", postedAgo: "", status: "completed", committedStatus: "completed",
    completedDate: "10 Mar 2025", duration: "1h 45m",
    jobRating: 5.0,
    jobReview: "Alex and James were fantastic! They fixed the toilet quickly and left the place spotless.",
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
    jobRating: 4.5,
    jobReview: "Great service, very professional. Explained everything clearly.",
    source: "org", orgName: "BuildRight Ltd.",
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
  // Scenario A — Inspection quote just approved → ready to send estimate
  {
    id: "j11", type: "catB", category: "inspection",
    title: "Roof Leak Inspection", icon: "🏚️",
    customer: "Olivia D.", location: "Westerpark", distance: "2.4 km",
    price: null, inspectionFee: 60,
    timeWindow: "Tomorrow, 09:00 – 10:00",
    description: "Inspection complete. Found two cracked tiles and worn flashing — ready to share repair estimate.",
    postedAgo: "", status: "active", committedStatus: "in_progress",
    customerRequest: { photos: [jobBathroomImg] },
    customerData: { rating: 4.7, reviews: 18, isVerified: true, memberSince: "Apr 2024" },
  },
  // Scenario B — Quote sent, customer working through purchase list
  {
    id: "j12", type: "catB", category: "estimate",
    title: "Kitchen Backsplash Refit", icon: "🍳",
    customer: "Daniel P.", location: "Jordaan", distance: "1.6 km",
    price: 420,
    timeWindow: "Thu, 14:00 – 18:00",
    description: "Quote accepted. Customer is purchasing the listed materials before we begin tiling work.",
    postedAgo: "", status: "active", committedStatus: "in_progress",
    customerRequest: { photos: [jobBathroomImg] },
    customerData: { rating: 4.9, reviews: 27, isVerified: true, memberSince: "Sep 2023" },
  },
  // Scenario C — Admin picked up job, not yet assigned to a worker
  {
    id: "j13", type: "catA", category: "fixed",
    title: "Bedroom Light Fitting", icon: "💡",
    customer: "Rachel K.", location: "Oost", distance: "3.5 km",
    price: 70,
    timeWindow: "Sat, 11:00 – 13:00",
    description: "Replace ceiling light fixture in master bedroom. Customer has the new fitting ready.",
    postedAgo: "", status: "active", committedStatus: "upcoming",
    customerData: { rating: 4.6, reviews: 9, isVerified: true, memberSince: "Jun 2024" },
    source: "org", orgName: "BuildRight Ltd.",
  },
  // Scenario D — Work finished on site, ready to bill the customer
  {
    id: "j14", type: "catA", category: "estimate",
    title: "Bathroom Tile Repair", icon: "🛁",
    customer: "Olivia P.", location: "Jordaan", distance: "1.2 km",
    price: 320,
    timeWindow: "Today, 09:00 – 14:00",
    description: "Re-grouted shower wall and replaced 6 cracked tiles. £80 advance already paid.",
    postedAgo: "", status: "active", committedStatus: "in_progress",
    customerData: { rating: 4.8, reviews: 15, isVerified: true, memberSince: "Mar 2024" },
  },
];

/** Pre-seeded workflow stages for demo committed jobs — keyed by job id.
 *  Real flows persist via sessionStorage; these act as defaults when no override exists.
 *  Covers every stage from the PRD so every use case is demonstrable. */
const demoWorkflowStages: Record<string, WorkflowStage> = {
  // Live flows (existing)
  j11: "inspection_completed",   // Inspection done → Create Subtasks
  j12: "quote_sent",             // Quote sent → Await Approval
  j13: "assigned",               // Picked up + assigned → Start Work (reassignable)
  j14: "completed",              // Work done → Create Invoice
  // Extra demo coverage (new)
  j15: "in_progress",            // Fixed in-progress → Mark Completed (reassignable)
  j16: "advance_paid",           // Estimate post-advance → View Purchase List
  j17: "inspection_proposal_sent", // Inspection proposal sent → Await Payment
  j18: "inspection_assigned",    // Inspection assigned → Start Inspection (reassignable)
  j19: "invoice_sent",           // Invoice sent → Awaiting Payment
  j20: "paid",                   // Paid → View Summary
};

/** Optional purchase-list progress for cards that show it inline. */
const demoPurchaseProgress: Record<string, { purchased: number; total: number }> = {
  j12: { purchased: 2, total: 6 },
  j16: { purchased: 0, total: 5 },
};

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
  const [committedFilter, setCommittedFilter] = useState<Set<string>>(new Set(["all"]));
  
  // Quote detail sheet state
  const [selectedQuote, setSelectedQuote] = useState<SentQuoteData | null>(null);
  const [isQuoteDetailOpen, setIsQuoteDetailOpen] = useState(false);
  const [sentQuotes, setSentQuotes] = useState(initialSentQuotes);
  // Post-inspection quote builder (opened from inspected-stage CTA)
  const [postInspectionJob, setPostInspectionJob] = useState<Job | null>(null);
  // Invoice builder (opened from work_in_progress CTA)
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);

  // Seed demo workflow state for committed jobs (one-shot per session).
  // Always re-seed if existing storage uses legacy stage names so older sessions get cleaned.
  useEffect(() => {
    try {
      const validStages = new Set([
        "incoming","assigned","in_progress","completed","invoice_sent","paid",
        "estimate_sent","estimate_approved","subtasks_created",
        "quote_sent","quote_approved","advance_paid","purchases_ongoing","ready_to_start",
        "inspection_proposal_sent","inspection_fee_paid","inspection_assigned","inspection_completed",
      ]);
      const cleanIfLegacy = (key: string) => {
        const raw = sessionStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (!validStages.has(parsed?.stage)) sessionStorage.removeItem(key);
        } catch { sessionStorage.removeItem(key); }
      };
      ["j11","j12","j13","j14"].forEach(id => cleanIfLegacy(`job_workflow_${id}`));

      // j14 — completed with prior advance (Create Invoice CTA)
      if (!sessionStorage.getItem("job_workflow_j14")) {
        sessionStorage.setItem("job_workflow_j14", JSON.stringify({
          stage: "completed",
          advanceAmount: 80,
          purchaseItems: [],
        }));
      }
      // j12 — quote sent, purchase list seeded (2 of 6 items purchased)
      const j12raw = sessionStorage.getItem("job_workflow_j12");
      const j12needsSeed = !j12raw || !(JSON.parse(j12raw)?.purchaseItems?.length);
      if (j12needsSeed) {
        sessionStorage.setItem("job_workflow_j12", JSON.stringify({
          stage: "quote_sent",
          purchaseItems: [
            { id: "p1", name: "Pine planks (2.4m)", quantity: 4, expectedPrice: 28, status: "purchased_by_customer", buyer: "customer" },
            { id: "p2", name: "Wood screws (5×40mm, box)", quantity: 1, expectedPrice: 9, status: "purchased_by_customer", buyer: "customer" },
            { id: "p3", name: "Wall plugs (8mm, pack)", quantity: 2, expectedPrice: 6, status: "not_purchased", buyer: "customer" },
            { id: "p4", name: "Matt white emulsion (2.5L)", quantity: 1, expectedPrice: 22, status: "not_purchased", buyer: "customer" },
            { id: "p5", name: "Sandpaper (P120, pack)", quantity: 1, expectedPrice: 7, status: "not_purchased", buyer: "customer" },
            { id: "p6", name: "Wood filler (250g)", quantity: 1, expectedPrice: 8, status: "not_purchased", buyer: "customer" },
          ],
        }));
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);
  
  // Detail sheet state
  const [selectedJob, setSelectedJob] = useState<JobDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Collaborative quote state
  const [collabQuoteJobId, setCollabQuoteJobId] = useState<string | null>(null);
  const [collabMembers, setCollabMembers] = useState<{ id: string; name: string; role: string }[]>([]);

  // Schedule bottom sheet state
  const [scheduleJob, setScheduleJob] = useState<Job | null>(null);

  // Filter state
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [filterDistanceKm, setFilterDistanceKm] = useState<number>(50); // 50 = any
  const [filterDistanceInput, setFilterDistanceInput] = useState<string>("");
  const [filterPriceMin, setFilterPriceMin] = useState<number>(0);
  const [filterPriceMax, setFilterPriceMax] = useState<number>(500); // 500 = any/max
  const [filterPriceMinInput, setFilterPriceMinInput] = useState<string>("");
  const [filterPriceMaxInput, setFilterPriceMaxInput] = useState<string>("");
  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [filterTimeWindows, setFilterTimeWindows] = useState<Set<string>>(new Set());
  const [filterJobType, setFilterJobType] = useState<Set<string>>(new Set(["any"]));
  const [filterAssignmentSource, setFilterAssignmentSource] = useState<Set<string>>(new Set(["any"]));

  const toggleCommittedFilter = (status: string) => {
    setCommittedFilter(prev => {
      const next = new Set(prev);
      if (status === "all") return new Set(["all"]);
      if (next.has("all")) next.delete("all");
      if (next.has(status)) next.delete(status);
      else next.add(status);
      if (next.size === 0) return new Set(["all"]);
      return next;
    });
  };
  const toggleJobTypeFilter = (type: string) => {
    setFilterJobType(prev => {
      const next = new Set(prev);
      if (type === "any") return new Set(["any"]);
      if (next.has("any")) next.delete("any");
      if (next.has(type)) next.delete(type);
      else next.add(type);
      if (next.size === 0) return new Set(["any"]);
      return next;
    });
  };

  const toggleFilterCategory = (cat: string) => {
    setFilterCategories(prev => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n; });
  };
  const toggleFilterTimeWindow = (tw: string) => {
    setFilterTimeWindows(prev => { const n = new Set(prev); if (n.has(tw)) n.delete(tw); else n.add(tw); return n; });
  };

  const activeFilterCount = (filterDistanceKm < 50 ? 1 : 0) + (filterPriceMin > 0 || filterPriceMax < 500 ? 1 : 0) + (filterCategories.size > 0 ? 1 : 0) + (filterTimeWindows.size > 0 ? 1 : 0) + (!filterJobType.has("any") ? 1 : 0) + (!filterAssignmentSource.has("any") ? 1 : 0) + (!committedFilter.has("all") ? 1 : 0);

  const resetAllFilters = () => {
    setFilterDistanceKm(50); setFilterDistanceInput("");
    setFilterPriceMin(0); setFilterPriceMax(500); setFilterPriceMinInput(""); setFilterPriceMaxInput("");
    setFilterCategories(new Set()); setFilterTimeWindows(new Set()); setFilterJobType(new Set(["any"])); setFilterAssignmentSource(new Set(["any"])); setCommittedFilter(new Set(["all"]));
  };

  const toggleAssignmentSource = (src: string) => {
    setFilterAssignmentSource(prev => {
      const next = new Set(prev);
      if (src === "any") return new Set(["any"]);
      if (next.has("any")) next.delete("any");
      if (next.has(src)) next.delete(src);
      else next.add(src);
      if (next.size === 0) return new Set(["any"]);
      return next;
    });
  };

  const [dispatchJobId, setDispatchJobId] = useState<string | null>(null);
  const [assignStep, setAssignStep] = useState<"choose" | "select-members" | "confirm">("choose");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectedIndividual, setSelectedIndividual] = useState<{ id: string; name: string } | null>(null);
  const [selectedIndividuals, setSelectedIndividuals] = useState<{ id: string; name: string; role: string }[]>([]);
  const [individualSearch, setIndividualSearch] = useState("");
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [activeResponseJob, setActiveResponseJob] = useState<ResponseJobData | null>(null);
  const [showResponseWorkflow, setShowResponseWorkflow] = useState(false);
  const [likedJobIds, setLikedJobIds] = useState<Set<string>>(new Set(["j1", "j3"]));
  const toggleLike = (id: string) => {
    setLikedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
      else { next.add(id); toast.success("Saved!"); }
      return next;
    });
  };


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
      if (!committedFilter.has("all")) {
        const matchesOverall = (committedFilter.has("active") && (j.committedStatus === "in_progress" || j.committedStatus === "upcoming")) ||
                             (committedFilter.has("completed") && j.committedStatus === "completed") ||
                             (committedFilter.has("cancelled") && j.committedStatus === "cancelled");
        if (!matchesOverall) return false;
      }
    }

    // Job Type filter
    if (!filterJobType.has("any") && !filterJobType.has(j.category)) return false;
    // Assignment source filter
    if (!filterAssignmentSource.has("any")) {
      const matchesAdmin = filterAssignmentSource.has("admin") && j.assignedByAdmin;
      const matchesOrg = filterAssignmentSource.has("org") && j.source === "org" && !j.assignedByAdmin;
      const matchesDirect = filterAssignmentSource.has("direct") && j.source !== "org" && !j.assignedByAdmin;
      if (!matchesAdmin && !matchesOrg && !matchesDirect) return false;
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

  /** Resolve current workflow stage for a committed job (sessionStorage override → demo seed). */
  const getJobStage = (jobId: string): WorkflowStage | null => {
    try {
      const raw = sessionStorage.getItem(`job_workflow_${jobId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.stage) return parsed.stage as WorkflowStage;
      }
    } catch {}
    return demoWorkflowStages[jobId] ?? null;
  };

  /** Footer CTA action — routes per stage. Most actions open the job detail page at the right context. */
  const handleStageCta = (jobId: string, stage: WorkflowStage) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    // Inspection: fee paid → assign for inspection
    if (stage === "inspection_fee_paid") {
      setDispatchJobId(jobId);
      toast("Pick an inspector to send on-site.");
      return;
    }
    // Inspection completed → open detail (Create Subtasks)
    if (stage === "inspection_completed") {
      openJobDetail(job, "subtasks");
      return;
    }
    // Estimate workflow stages that need detail page
    if (stage === "estimate_approved" || stage === "subtasks_created") {
      openJobDetail(job, "subtasks");
      return;
    }
    // Estimate "assigned" stage means subtasks done, time to create the quote.
    // Open quote builder via detail page so PDF preview flow runs.
    if (stage === "assigned" && job.category !== "fixed") {
      openJobDetail(job, "quotes");
      return;
    }
    // Quote sent / approved / advance paid / purchases ongoing → Purchase List
    if (stage === "quote_sent" || stage === "quote_approved" || stage === "advance_paid" || stage === "purchases_ongoing" || stage === "ready_to_start") {
      openJobDetail(job, "purchase-list");
      return;
    }
    // Work complete → invoice builder (with PDF preview)
    if (stage === "completed") {
      setInvoiceJob(job);
      return;
    }
    // Default: open job detail — workflow tabs handle the rest.
    openJobDetail(job);
  };

  /** Persist the post-inspection quote and advance the workflow to quote_sent. */
  const handlePostInspectionQuote = (data: QuoteSheetData) => {
    if (!postInspectionJob) return;
    const job = postInspectionJob;
    try {
      const prev = JSON.parse(sessionStorage.getItem(`job_workflow_${job.id}`) || "{}");
      sessionStorage.setItem(`job_workflow_${job.id}`, JSON.stringify({
        ...prev,
        stage: "quote_sent",
        purchaseItems: data.items.filter(i => i.type === "material").map(i => ({
          id: i.id, name: i.name, quantity: i.quantity, expectedPrice: i.cost,
          status: "not_purchased", buyer: "customer",
        })),
      }));
    } catch {}
    setSentQuotes(prev => [{
      id: crypto.randomUUID(),
      jobTitle: job.title,
      icon: job.icon,
      customer: job.customer,
      location: job.location,
      distance: job.distance,
      sentAt: "Just now",
      quoteTotal: data.total,
      materialsCount: data.items.filter(i => i.type === "material").length,
      status: "pending" as const,
    }, ...prev]);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j } : j));
    setPostInspectionJob(null);
    toast.success("Quote sent to customer 📄", { description: `Total £${data.total.toFixed(2)} — purchase list activated.` });
  };

  /** Persist the invoice and advance the workflow to invoice_sent. */
  const handleInvoiceSend = (data: import("@/components/trader/InvoiceBuilderSheet").InvoiceSubmitData) => {
    if (!invoiceJob) return;
    const job = invoiceJob;
    try {
      const prev = JSON.parse(sessionStorage.getItem(`job_workflow_${job.id}`) || "{}");
      sessionStorage.setItem(`job_workflow_${job.id}`, JSON.stringify({
        ...prev,
        stage: "invoice_sent",
        invoiceData: {
          id: data.id,
          items: data.items.map(({ label, amount }) => ({ label, amount })),
          subtotal: data.subtotal,
          advancePaid: data.advancePaid,
          remaining: data.remaining,
          sentAt: new Date().toISOString(),
        },
      }));
    } catch {}
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j } : j));
    setInvoiceJob(null);
    toast.success("Invoice sent 🧾", {
      description: `£${data.remaining.toFixed(2)} due from ${job.customer}.`,
    });
  };


  const renderCommittedJobCard = (job: Job) => {
    const statusTag = job.committedStatus ? committedStatusConfig[job.committedStatus] : null;
    const a = job.assignment;
    let assignLabel = "";
    if (a) {
      if (a.type === "group") { assignLabel = a.groupName || "Group"; }
      else if (a.type === "individual") { assignLabel = a.members[0]?.name || "Individual"; }
      else { const shown = a.members.slice(0, 2).map((m) => m.name.split(" ")[0]); const extra = a.members.length - 2; assignLabel = extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", "); }
    }

    // Stage-aware card for in-progress / upcoming committed jobs
    const stage = getJobStage(job.id);
    const isLiveCommitted = job.committedStatus === "in_progress" || job.committedStatus === "upcoming";
    if (isLiveCommitted && stage) {
      return (
        <StageJobCard
          key={job.id}
          stage={stage}
          category={job.category}
          job={{
            id: job.id,
            title: job.title,
            customer: job.customer,
            timeWindow: job.timeWindow,
            location: `${job.location}${job.distance ? `, ${job.distance}` : ''}`,
            distance: job.distance,
            image: job.customerRequest?.photos?.[0],
            price: job.price,
            viaOrg: job.source === "org" ? job.orgName : undefined,
            purchaseProgress: demoPurchaseProgress[job.id],
          }}
          onClick={() => openJobDetail(job)}
          onCta={handleStageCta}
        />
      );
    }

    const statusLabel = statusTag?.label;

    return (
      <MinimalJobCard
        key={job.id}
        job={{
          id: job.id,
          title: job.title,
          customer: job.customer,
          timeWindow: job.timeWindow,
          location: `${job.location}${job.distance ? `, ${job.distance}` : ''}`,
          image: job.customerRequest?.photos?.[0],
          statusLabel,
          assignLabel: assignLabel || undefined,
          price: job.price,
          rating: job.committedStatus === "completed" ? (job.jobRating || job.customerData?.rating || 5.0) : undefined,
          review: job.committedStatus === "completed" ? job.jobReview : undefined,
          viaOrg: job.source === "org" ? job.orgName : undefined,
        }}
        onClick={() => openJobDetail(job)}
        onReassign={isAgencyProfile ? (id) => setDispatchJobId(id) : undefined}
      />
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
  
  const handleResponseSubmit = (jobId: string, data: QuoteSheetData) => {
    // Determine action based on quote type
    const isPickup = data.items.length === 0 && !data.inspectionMin;
    const isInspection = !!data.inspectionMin;
    
    if (isPickup) {
      if (isAgencyProfile) {
        const pickedUpAt = new Date().toISOString();
        const next: JobWorkflowState = { stage: "assigned", pickedUpAt, purchaseItems: [] };
        sessionStorage.setItem(`job_workflow_${jobId}`, JSON.stringify(next));
        
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "active" as JobStatus, committedStatus: "upcoming" } : j));
        toast.success("Job picked up! ⚡", { description: "You have 4 hours to assign a worker." });
      } else {
        acceptJob(jobId);
      }
    } else if (isInspection) {
      toast.success("Inspection offer sent! 🔍");
      // Advance stage logic here if needed
    } else {
      toast.success("Estimate sent successfully! 📝");
    }
    
    setShowResponseWorkflow(false);
    setActiveResponseJob(null);
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

  const openJobDetail = (job: Job, initialTab?: string) => {
    // Heuristic: any committed job whose schedule spans days/weeks counts as long-term
    const isLongTerm = job.id === "j5" || /week|–\s*\d+\s*(Apr|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(job.timeWindow);
    // Store job data in sessionStorage for the detail page
    const detailData = {
      id: job.id,
      category: job.category,
      title: job.title,
      icon: job.icon,
      status: job.status,
      committedStatus: job.committedStatus,
      description: job.description,
      location: job.location,
      distance: job.distance,
      timeWindow: job.timeWindow,
      price: job.price ?? undefined,
      inspectionFee: job.inspectionFee,
      postedAgo: job.postedAgo,
      isLongTerm,
      crew: job.crew,
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
      },
      jobRating: job.jobRating,
      jobReview: job.jobReview,
    };
    sessionStorage.setItem(`job_detail_${job.id}`, JSON.stringify(detailData));
    navigate(initialTab ? `/trader/jobs/${job.id}?tab=${initialTab}` : `/trader/jobs/${job.id}`);
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
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-extrabold text-foreground font-heading">Jobs</h1>
            <button
              onClick={() => setShowSavedJobs(!showSavedJobs)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                showSavedJobs ? "bg-destructive/10" : "bg-secondary"
              }`}
            >
              <Heart className={`h-5 w-5 transition-all ${showSavedJobs ? "fill-destructive text-destructive" : "text-foreground"}`} />
              {likedJobIds.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground opacity-0">
                  {likedJobIds.size}
                </span>
              )}
            </button>
          </div>
          
          {/* Search bar + filter button */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs, customers, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => setShowFilterSheet(true)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-accent text-muted-foreground active:scale-95 transition-transform relative"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Incoming / Committed switch — hide when showing saved */}
          {!showSavedJobs && (
            <>
              <div className="flex gap-1 rounded-xl bg-muted p-1 mb-2">
                <button
                  onClick={() => setJobSection("incoming")}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all relative ${
                    jobSection === "incoming" ? "bg-card text-foreground card-shadow" : "text-muted-foreground"
                  }`}
                >
                  Incoming ({jobs.filter(j => j.status === "incoming").length})
                </button>
                <button
                  onClick={() => setJobSection("committed")}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all relative ${
                    jobSection === "committed" ? "bg-card text-foreground card-shadow" : "text-muted-foreground"
                  }`}
                >
                  Committed ({jobs.filter(j => j.status !== "incoming").length})
                </button>
              </div>

            </>
          )}
        </div>
      </div>

      <div className="px-4 pt-2 pb-6">
        {/* Saved/Liked jobs view */}
        {showSavedJobs ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4 fill-destructive text-destructive" />
              <h3 className="font-bold text-foreground">Saved Jobs</h3>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {likedJobIds.size}
              </span>
            </div>
            {likedJobIds.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mb-3">
                  <Heart className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="font-semibold text-foreground">No saved jobs yet</p>
                <p className="text-sm text-muted-foreground mt-1">Tap the heart on any job to save it here</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.filter(j => likedJobIds.has(j.id)).map((job) => (
                  <IncomingJobCard
                    key={job.id}
                    job={job}
                    onViewDetail={() => openJobDetail(job)}
                    viewMode={isIndividual ? "individual" : "agency"}
                    isSaved={true}
                    onToggleSave={toggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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
          {jobSection === "committed" && committedFilter.has("all") && (() => {
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
          {(! (jobSection === "committed" && committedFilter.has("all"))) && filteredJobs.map((job) => {
            // PRD rule: Incoming jobs ALWAYS render as IncomingJobCard until the
            // trader Responds. No "pre-accepted" / committed-style cards in Incoming.

            // Use shared IncomingJobCard for regular incoming jobs
            if (job.status === "incoming") {
              return (
                <div key={job.id} className="flex flex-col gap-2">
                  {/* Agency collaborative quote — replaces the job card */}
                  {collabQuoteJobId === job.id && isAgencyProfile ? (
                    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
                      {/* Job header summary */}
                      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
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
                      job={{ ...job, viaOrg: job.source === "org" ? job.orgName : undefined }}
                      onViewDetail={() => openJobDetail(job)}
                      viewMode={isIndividual ? "individual" : "agency"}
                      onRequestPhotos={(id) => toast.success("Photo request sent to customer!")}
                      onShowSchedule={() => setScheduleJob(job)}
                      isSaved={likedJobIds.has(job.id)}
                      onToggleSave={toggleLike}
                      onRespond={(j) => {
                        setActiveResponseJob(j as any);
                        setShowResponseWorkflow(true);
                      }}
                    />
                  )}
                </div>
              );
            }

            return renderCommittedJobCard(job);
          })}

        </div>
          </>
        )}
      </div>

      {/* Accept & Assign Multi-Step Modal */}
      <Drawer.Root 
        open={!!dispatchJobId} 
        onOpenChange={(open) => !open && resetAssignFlow()}
        container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
            <div className="p-5 pb-8 flex-1 overflow-y-auto">
              {(() => {
                const job = jobs.find(j => j.id === dispatchJobId);
                if (!job) return null;
                return (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {assignStep !== "choose" && (
                          <button onClick={() => setAssignStep("choose")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                            <ChevronDown className="h-4 w-4 rotate-90" />
                          </button>
                        )}
                        <h2 className="text-lg font-bold text-foreground">
                          {assignStep === "choose" ? "Quick Assign" : "Confirm Assignment"}
                        </h2>
                      </div>
                      <button onClick={resetAssignFlow} className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-6 rounded-2xl bg-accent/30 p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                        <span className="text-primary font-bold text-xs">{job.price ? `£${job.price}` : "—"}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{job.customer} · {job.location}</p>
                    </div>

                    {assignStep === "choose" ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Assign to a Group</p>
                        {mockGroups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => { setSelectedGroupId(group.id); setAssignStep("confirm"); }}
                            className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all active:scale-[0.98] hover:border-primary/20"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground">{group.name}</p>
                              <p className="text-xs text-muted-foreground">{group.members.length} members available</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                          </button>
                        ))}

                        <div className="pt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-3">Or to Individual</p>
                          <div className="grid grid-cols-2 gap-3">
                            {mockGroups[0].members.slice(0, 4).map((member) => (
                              <button
                                key={member.id}
                                onClick={() => { setSelectedGroupId(member.id); setAssignStep("confirm"); }}
                                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-4 transition-all active:scale-[0.98] hover:border-primary/20 text-center"
                              >
                                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground overflow-hidden">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-foreground truncate max-w-full">{member.name.split(" ")[0]}</p>
                                  <p className="text-[10px] text-muted-foreground">{member.role}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-base font-bold text-foreground">Confirm Assignment</h3>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                            By confirming, this job will be dispatched to the selected team members instantly.
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setAssignStep("choose")}
                            className="flex-1 rounded-2xl border border-border py-4 text-sm font-bold text-muted-foreground active:bg-muted"
                          >
                            Go Back
                          </button>
                          <button
                            onClick={() => {
                              toast.success("Job accepted & assigned!");
                              resetAssignFlow();
                            }}
                            className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                          >
                            Confirm & Accept
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Schedule bottom sheet */}
      <Drawer.Root 
        open={!!scheduleJob} 
        onOpenChange={(open) => !open && setScheduleJob(null)}
        container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
            <div className="p-5 pb-8 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-bold text-foreground">My Schedule</h3>
                <button onClick={() => setScheduleJob(null)} className="rounded-full p-1 active:bg-muted">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {scheduleJob && (
                <div className="mb-4 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2">
                  <p className="text-[10px] font-bold text-primary mb-0.5">Viewing schedule for</p>
                  <p className="text-[11px] font-semibold text-foreground">{scheduleJob.title} · {scheduleJob.timeWindow}</p>
                  <p className="text-[10px] text-muted-foreground">{scheduleJob.location} · {scheduleJob.distance}</p>
                </div>
              )}
              <div className="mt-2">
                <CalendarDayView />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Filter Bottom Sheet */}
      <Drawer.Root 
        open={showFilterSheet} 
        onOpenChange={setShowFilterSheet}
        container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="!absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content className="!absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] w-full flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
            
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Filter Jobs</h3>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button onClick={() => setShowFilterSheet(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Filters Row */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {[
                  { 
                    id: "nearby", 
                    label: "Nearby", 
                    icon: "📍", 
                    isActive: filterDistanceKm <= 5,
                    onClick: () => {
                      if (filterDistanceKm <= 5) setFilterDistanceKm(50);
                      else setFilterDistanceKm(5);
                    }
                  },
                  { 
                    id: "today", 
                    label: "Today", 
                    icon: "📅", 
                    isActive: filterTimeWindows.has("Today"),
                    onClick: () => toggleFilterTimeWindow("Today")
                  },
                  { 
                    id: "high_pay", 
                    label: "High Pay", 
                    icon: "💰", 
                    isActive: filterPriceMin >= 200,
                    onClick: () => {
                      if (filterPriceMin >= 200) {
                        setFilterPriceMin(0);
                        setFilterPriceMinInput("");
                      } else {
                        setFilterPriceMin(200);
                        setFilterPriceMinInput("200");
                      }
                    }
                  },
                  { 
                    id: "fixed_price", 
                    label: "Fixed Price", 
                    icon: "⚡", 
                    isActive: filterJobType.has("fixed price"),
                    onClick: () => toggleJobTypeFilter("fixed price")
                  },
                  { 
                    id: "urgent", 
                    label: "Urgent", 
                    icon: "🔥", 
                    isActive: filterTimeWindows.has("Today") && filterPriceMin >= 150,
                    onClick: () => {
                      if (filterTimeWindows.has("Today") && filterPriceMin >= 150) {
                        // toggle off - might be complex, just reset or toggle Today
                        toggleFilterTimeWindow("Today");
                      } else {
                        if (!filterTimeWindows.has("Today")) toggleFilterTimeWindow("Today");
                        setFilterPriceMin(150);
                        setFilterPriceMinInput("150");
                      }
                    }
                  }
                ].map((qf) => (
                  <button
                    key={qf.id}
                    onClick={qf.onClick}
                    className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                      qf.isActive 
                        ? "bg-primary border-primary text-primary-foreground shadow-sm scale-[0.98]" 
                        : "bg-card border-border text-muted-foreground active:bg-muted"
                    }`}
                  >
                    <span>{qf.icon}</span>
                    <span>{qf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
              {(() => {
                const filterSections = [
                  {
                    id: "distance",
                    label: "Distance",
                    icon: "📍",
                    summary: filterDistanceKm < 50 ? `Within ${filterDistanceKm} km` : "Any",
                    hasValue: filterDistanceKm < 50,
                  },
                  {
                    id: "price",
                    label: "Price Range",
                    icon: "💷",
                    summary: filterPriceMin > 0 || filterPriceMax < 500 ? `£${filterPriceMin} – £${filterPriceMax === 500 ? "500+" : filterPriceMax}` : "Any",
                    hasValue: filterPriceMin > 0 || filterPriceMax < 500,
                  },
                  {
                    id: "category",
                    label: "Category",
                    icon: "🔧",
                    summary: filterCategories.size > 0 ? `${filterCategories.size} selected` : "Any",
                    hasValue: filterCategories.size > 0,
                  },
                  {
                    id: "timeWindow",
                    label: "Time Window",
                    icon: "🕐",
                    summary: filterTimeWindows.size > 0 ? `${filterTimeWindows.size} selected` : "Any",
                    hasValue: filterTimeWindows.size > 0,
                  },
                  {
                    id: "jobType",
                    label: "Job Type",
                    icon: "📋",
                    summary: !filterJobType.has("any") ? Array.from(filterJobType).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ") : "Any",
                    hasValue: !filterJobType.has("any"),
                  },
                  {
                    id: "assignmentSource",
                    label: "Assignment Source",
                    icon: "🏢",
                    summary: !filterAssignmentSource.has("any")
                      ? Array.from(filterAssignmentSource).map(s => s === "admin" ? "Assigned by admin" : s === "org" ? "From organisation" : "Direct").join(", ")
                      : "Any",
                    hasValue: !filterAssignmentSource.has("any"),
                  },
                  {
                    id: "status",
                    label: "Job Status",
                    icon: "📊",
                    summary: !committedFilter.has("all") ? Array.from(committedFilter).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") : "All",
                    hasValue: !committedFilter.has("all"),
                  },
                ];

                const allCategories = [
                  "Plumbing", "Electrical", "Painting", "Tiling", "Carpentry",
                  "Cleaning", "HVAC", "Roofing", "Bathroom", "Kitchen",
                  "Flooring", "Landscaping", "General",
                ];
                const allTimeWindows = ["Today", "Tomorrow", "This week", "Next week", "This month", "Flexible"];
                const allStatuses = ["all", "active", "completed", "cancelled"];
                const allJobTypes = ["Any", "Fixed Price", "Quote Required", "Inspection"];

                return (
                  <>
                    {filterSections.map((section) => (
                      <div key={section.id} className="border-b border-border/30">
                        <button
                          onClick={() => setExpandedFilter(expandedFilter === section.id ? null : section.id)}
                      className="flex items-center justify-between w-full px-5 py-3.5 text-left active:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{section.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{section.label}</p>
                            {section.hasValue && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                                {section.id === "category" ? filterCategories.size : section.id === "timeWindow" ? filterTimeWindows.size : "1"}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] ${section.hasValue ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                            {section.summary}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedFilter === section.id ? "rotate-180" : ""}`} />
                    </button>

                    {expandedFilter === section.id && (
                      <div className="px-5 pb-5 pt-2 animate-in fade-in duration-200 slide-in-from-top-1">
                        {section.id === "distance" && (
                          <div className="flex flex-col gap-4 py-2">
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min={1}
                                max={50}
                                value={filterDistanceKm}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  setFilterDistanceKm(v);
                                  setFilterDistanceInput(v >= 50 ? "" : String(v));
                                }}
                                className="flex-1 h-2 rounded-full appearance-none bg-secondary accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                              />
                              <div className="relative w-20 shrink-0">
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  placeholder="Any"
                                  value={filterDistanceInput}
                                  onChange={(e) => {
                                    setFilterDistanceInput(e.target.value);
                                    const v = Number(e.target.value);
                                    if (v > 0 && v <= 100) setFilterDistanceKm(Math.min(v, 50));
                                  }}
                                  className="w-full rounded-lg border border-border bg-card px-2 pr-7 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-center"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">km</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
                              <span>1 km</span>
                              <span>50+ km</span>
                            </div>
                          </div>
                        )}

                        {/* Price Range */}
                        {section.id === "price" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Price range</span>
                              <span className="text-sm font-bold text-foreground">£{filterPriceMin} – £{filterPriceMax >= 500 ? "500+" : filterPriceMax}</span>
                            </div>
                            {/* Min: slider + input inline */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-semibold text-muted-foreground">Minimum</span>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={0}
                                  max={filterPriceMax - 10}
                                  value={filterPriceMin}
                                  onChange={(e) => { setFilterPriceMin(Number(e.target.value)); setFilterPriceMinInput(e.target.value); }}
                                  className="flex-1 h-2 rounded-full appearance-none bg-secondary accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <div className="relative w-20 shrink-0">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">£</span>
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Min"
                                    value={filterPriceMinInput}
                                    onChange={(e) => {
                                      setFilterPriceMinInput(e.target.value);
                                      const v = Number(e.target.value);
                                      if (v >= 0 && v < filterPriceMax) setFilterPriceMin(v);
                                    }}
                                    className="w-full rounded-lg border border-border bg-card pl-5 pr-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Max: slider + input inline */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-semibold text-muted-foreground">Maximum</span>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={filterPriceMin + 10}
                                  max={500}
                                  value={filterPriceMax}
                                  onChange={(e) => { setFilterPriceMax(Number(e.target.value)); setFilterPriceMaxInput(e.target.value); }}
                                  className="flex-1 h-2 rounded-full appearance-none bg-secondary accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <div className="relative w-20 shrink-0">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">£</span>
                                  <input
                                    type="number"
                                    min={filterPriceMin}
                                    placeholder="Max"
                                    value={filterPriceMaxInput}
                                    onChange={(e) => {
                                      setFilterPriceMaxInput(e.target.value);
                                      const v = Number(e.target.value);
                                      if (v > filterPriceMin) setFilterPriceMax(Math.min(v, 500));
                                    }}
                                    className="w-full rounded-lg border border-border bg-card pl-5 pr-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Quick presets */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {[
                                { label: "Under £50", min: 0, max: 50 },
                                { label: "£50 – £100", min: 50, max: 100 },
                                { label: "£100 – £200", min: 100, max: 200 },
                                { label: "£200+", min: 200, max: 500 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  onClick={() => {
                                    setFilterPriceMin(preset.min); setFilterPriceMax(preset.max);
                                    setFilterPriceMinInput(String(preset.min)); setFilterPriceMaxInput(preset.max >= 500 ? "" : String(preset.max));
                                  }}
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                                    filterPriceMin === preset.min && filterPriceMax === preset.max
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Category — multi-select checkboxes */}
                        {section.id === "category" && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {allCategories.map((cat) => {
                              const selected = filterCategories.has(cat);
                              return (
                                <button
                                  key={cat}
                                  onClick={() => toggleFilterCategory(cat)}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all ${
                                    selected
                                      ? "bg-primary/10 border border-primary/30"
                                      : "bg-secondary/50 border border-transparent"
                                  }`}
                                >
                                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                    selected ? "bg-primary" : "border-2 border-border"
                                  }`}>
                                    {selected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <span className={`text-xs font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{cat}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Time Window — multi-select */}
                        {section.id === "timeWindow" && (
                          <div className="flex flex-col gap-1.5">
                            {allTimeWindows.map((tw) => {
                              const selected = filterTimeWindows.has(tw);
                              return (
                                <button
                                  key={tw}
                                  onClick={() => toggleFilterTimeWindow(tw)}
                                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                                    selected
                                      ? "bg-primary/10 border border-primary/30"
                                      : "bg-secondary/50 border border-transparent"
                                  }`}
                                >
                                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                    selected ? "bg-primary" : "border-2 border-border"
                                  }`}>
                                    {selected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <span className={`text-xs font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{tw}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Job Type */}
                        {section.id === "jobType" && (
                          <div className="grid grid-cols-2 gap-2">
                            {allJobTypes.map((type) => {
                              const selected = filterJobType.has(type.toLowerCase()) || (type === "Any" && filterJobType.has("any"));
                              return (
                                <button
                                  key={type}
                                  onClick={() => toggleJobTypeFilter(type.toLowerCase())}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border transition-all ${
                                    selected ? "bg-primary/10 border-primary" : "bg-card border-border/60"
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                                    {selected && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className={`text-[11px] font-semibold truncate ${selected ? "text-primary" : "text-foreground"}`}>
                                    {type}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Assignment Source */}
                        {section.id === "assignmentSource" && (
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: "any", label: "Any" },
                              { key: "direct", label: "Direct" },
                              { key: "org", label: "From organisation" },
                              { key: "admin", label: "Assigned by admin" },
                            ].map((opt) => {
                              const selected = filterAssignmentSource.has(opt.key);
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => toggleAssignmentSource(opt.key)}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border transition-all ${
                                    selected ? "bg-primary/10 border-primary" : "bg-card border-border/60"
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                                    {selected && <CheckCircle2 className="h-2.5 w-2.5 text-primary-foreground" />}
                                  </div>
                                  <span className={`text-[11px] font-semibold truncate ${selected ? "text-primary" : "text-foreground"}`}>
                                    {opt.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Job Status */}
                        {section.id === "status" && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {allStatuses.map((s) => {
                              const selected = committedFilter.has(s);
                              return (
                                <button
                                  key={s}
                                  onClick={() => toggleCommittedFilter(s)}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all ${
                                    selected ? "bg-primary/10 border-primary" : "bg-card border-border/60"
                                  } border`}
                                >
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                                    {selected && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className={`text-xs font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Apply/Reset Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-accent/5 backdrop-blur-sm flex items-center gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-bold active:bg-muted/70 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              >
                View {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <ResponseWorkflowSheet
        job={activeResponseJob}
        isOpen={showResponseWorkflow}
        onOpenChange={setShowResponseWorkflow}
        onSubmit={handleResponseSubmit}
      />
      {/* Post-inspection / post-estimate-approval quote builder with PDF preview */}
      <QuoteSheet
        isOpen={!!postInspectionJob}
        onOpenChange={(open) => { if (!open) setPostInspectionJob(null); }}
        category="estimate"
        jobTitle={postInspectionJob?.title ?? ""}
        onSubmit={handlePostInspectionQuote}
      />
      {/* Invoice builder w/ PDF preview — opened from work_in_progress CTA */}
      <InvoiceBuilderSheet
        isOpen={!!invoiceJob}
        onOpenChange={(open) => { if (!open) setInvoiceJob(null); }}
        jobTitle={invoiceJob?.title ?? ""}
        customerName={invoiceJob?.customer ?? ""}
        quoteTotal={invoiceJob ? (sentQuotes.find(q => q.jobTitle === invoiceJob.title)?.quoteTotal ?? invoiceJob.price ?? 0) : 0}
        advancePaid={invoiceJob ? (() => {
          try {
            const ws = JSON.parse(sessionStorage.getItem(`job_workflow_${invoiceJob.id}`) || "{}");
            return ws.advanceAmount || ws.invoiceData?.advancePaid || 0;
          } catch { return 0; }
        })() : 0}
        onSend={handleInvoiceSend}
      />
    </MobileLayout>
  );
};

export default TraderJobs;
