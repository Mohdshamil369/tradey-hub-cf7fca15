import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import LocationSheet from "@/components/home/LocationSheet";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import {
  Bell, TrendingUp, Clock, MapPin, Star, CheckCircle2,
  Zap, Briefcase, PoundSterling, Users, Calendar,
  MessageCircle, ChevronDown, X, LayoutGrid, CalendarDays,
  Search, ChevronRight,
} from "lucide-react";
import IncomingJobCard from "@/components/trader/IncomingJobCard";
import SwipeableJobStack from "@/components/trader/SwipeableJobStack";
import ActiveJobCard from "@/components/trader/ActiveJobCard";
import WorkerQuoteRequest from "@/components/trader/WorkerQuoteRequest";
import QuoteBreakdown from "@/components/trader/QuoteBreakdown";
import CalendarDayView from "@/components/home/CalendarDayView";

const earningsData = {
  thisWeek: 845,
  lastWeek: 720,
  thisMonth: 3280,
  completedJobs: 12,
  pendingJobs: 3,
  rating: 4.9,
  reviews: 47,
};

interface IncomingJob {
  id: string;
  type: "catA" | "catB";
  title: string;
  icon: string;
  customer: string;
  location: string;
  distance: string;
  price: number | null;
  timeWindow: string;
  estimatedDuration?: string;
  postedAgo: string;
  description: string;
  hasVoiceNote: boolean;
  voiceDuration?: string;
}

const initialIncomingJobs: IncomingJob[] = [
  {
    id: "j1",
    type: "catA",
    title: "Tap Repair",
    icon: "🔧",
    customer: "Emily R.",
    location: "Amsterdam Centrum",
    distance: "2.3 km",
    price: 65,
    timeWindow: "Today, 14:00 – 16:00",
    estimatedDuration: "~1 hour",
    postedAgo: "5 min ago",
    description: "Kitchen tap is dripping constantly, it's a single-lever mixer tap. Tried tightening it but no luck. Need it fixed ASAP please!",
    hasVoiceNote: true,
    voiceDuration: "0:23",
  },
  {
    id: "j2",
    type: "catA",
    title: "Light Switch Replacement",
    icon: "💡",
    customer: "Mark T.",
    location: "De Pijp",
    distance: "4.1 km",
    price: 55,
    timeWindow: "Tomorrow, 09:00 – 11:00",
    estimatedDuration: "~30 min",
    postedAgo: "12 min ago",
    description: "Two light switches in the hallway need replacing. Standard dimmer switches preferred. The current ones are loose and sparking a little.",
    hasVoiceNote: false,
  },
  {
    id: "j3",
    type: "catB",
    title: "Full Bathroom Renovation",
    icon: "🛁",
    customer: "Sarah L.",
    location: "Jordaan",
    distance: "1.8 km",
    price: null,
    timeWindow: "Flexible",
    estimatedDuration: "2–3 weeks",
    postedAgo: "1 hour ago",
    description: "Complete bathroom renovation including re-tiling floors and walls, new shower unit, vanity, and toilet. Room is approx 6m². Happy to discuss details.",
    hasVoiceNote: true,
    voiceDuration: "1:12",
  },
];

// Dynamic times relative to now so Up Next crew progress is always visible
const _now = new Date();
const _h = _now.getHours();
const _fmt = (h: number) => `${(h % 24).toString().padStart(2, "0")}:00`;

const activeJobs = [
  {
    id: "a1",
    title: "Drain Unblocking",
    icon: "🚿",
    customer: "David K.",
    date: `Today, ${_fmt(_h + 1)} – ${_fmt(_h + 3)}`,
    startHour: _h + 1,
    location: "Oud-West, 1.2 km",
    status: "In Progress" as const,
    priority: 1,
    crewTotal: 3,
    crewArrived: 2,
  },
  {
    id: "a2",
    title: "Wall Painting (1 room)",
    icon: "🎨",
    customer: "Hannah P.",
    date: `Today, ${_fmt(_h + 4)} – ${_fmt(_h + 7)}`,
    startHour: _h + 4,
    location: "Amstelveen, 5.4 km",
    status: "Scheduled" as const,
    priority: 2,
    crewTotal: 2,
    crewArrived: 0,
  },
  {
    id: "a3",
    title: "Light Switch Replacement",
    icon: "💡",
    customer: "Tom B.",
    date: "Tomorrow, 09:00 – 10:30",
    startHour: 33,
    location: "De Pijp, 3.1 km",
    status: "Scheduled" as const,
    priority: 3,
    crewTotal: 1,
    crewArrived: 0,
  },
];

/** Show crew arrival only if the job starts within ~2 hours */
const isWithinWindow = (startHour: number) => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return startHour - currentHour <= 2 && startHour - currentHour >= -2;
};

const TraderHome = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Trader";
  const traderType = profile?.trader_type ?? "individual";
  const isIndividual = traderType === "individual";
  const isAgencyProfile = traderType === "agency";
  const isNewUser = false; // Toggle controls empty/filled state instead

  const [showEmpty, setShowEmpty] = useState(false);
  const effectiveNewUser = showEmpty;

  const [jobs, setJobs] = useState(initialIncomingJobs);
  const [scheduleJobs, setScheduleJobs] = useState(activeJobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scheduleView, setScheduleView] = useState<"cards" | "calendar" | "empty">("cards");
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  const displayEarnings = effectiveNewUser ? {
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    completedJobs: 0,
    pendingJobs: 0,
    rating: 0,
    reviews: 0,
  } : earningsData;

  const pctChange = effectiveNewUser || displayEarnings.lastWeek === 0 ? 0 : Math.round(((displayEarnings.thisWeek - displayEarnings.lastWeek) / displayEarnings.lastWeek) * 100);

  const displayJobs = effectiveNewUser ? [] : jobs;
  const displayScheduleJobs = effectiveNewUser ? [] : scheduleJobs;

  // Dispatch flow state (agency only)
  const [dispatchJobId, setDispatchJobId] = useState<string | null>(null);
  const [assignStep, setAssignStep] = useState<"choose" | "select-members" | "confirm">("choose");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectedIndividuals, setSelectedIndividuals] = useState<{ id: string; name: string; role: string }[]>([]);
  const [individualSearch, setIndividualSearch] = useState("");
  const [quoteJobId, setQuoteJobId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [scheduleJob, setScheduleJob] = useState<IncomingJob | null>(null);

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

  const acceptJob = (id: string, assignTo?: { type: "group" | "individual"; name: string; memberNames?: string[] }) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (assignTo?.memberNames) {
      toast.success(`Assigned to ${assignTo.name} (${assignTo.memberNames.join(", ")})! ✅`);
    } else {
      toast.success("Job accepted! ✅");
    }
    resetAssignFlow();
  };

  const handleDispatch = (jobId: string, isCatB: boolean) => {
    if (isIndividual) {
      if (isCatB) {
        setQuoteJobId(jobId);
      } else {
        acceptJob(jobId);
      }
      return;
    }
    if (isCatB) {
      setQuoteJobId(jobId);
    } else {
      setDispatchJobId(jobId);
    }
  };

  const declineJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast("Job declined");
  };

  const submitQuote = (id: string) => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      toast.error("Enter a valid quote amount");
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setQuoteJobId(null);
    setQuoteAmount("");
    toast.success("Quote submitted! The customer will be notified.");
  };

  const playVoiceNote = (customer: string) => {
    toast(`🎧 Playing voice note from ${customer} (demo)`);
  };

  const selectedGroup = mockGroups.find((g) => g.id === selectedGroupId);

  return (
    <MobileLayout role="trader" overlay={<LocationSheet open={locationSheetOpen} onOpenChange={setLocationSheetOpen} />}>
      {/* Header */}
      <div className="px-4 pb-2 pt-6">
        {/* Empty/Filled toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Empty</span>
            <button
              onClick={() => setShowEmpty(!showEmpty)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showEmpty ? "bg-muted" : "bg-primary"
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                showEmpty ? "translate-x-1" : "translate-x-6"
              }`} />
            </button>
            <span className="text-[11px] font-semibold text-muted-foreground">Filled</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground font-heading">{firstName} 👋</h1>
            <div>
              <button
                onClick={() => setLocationSheetOpen(true)}
                className="flex items-center gap-1.5 mt-0.5"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-[12px] font-semibold text-muted-foreground truncate">Amsterdam Centrum</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAgencyProfile && (
              <button
                onClick={() => navigate("/chat")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              >
                <MessageCircle className="h-5 w-5 text-foreground" />
              </button>
            )}
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {displayJobs.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {displayJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-8 px-4 pb-6 mt-2">
        {/* Earnings Card */}
        <div className="rounded-2xl bg-primary p-5 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-primary-foreground/70">This Week</p>
              <h2 className="mt-1 text-3xl font-extrabold text-primary-foreground">£{displayEarnings.thisWeek}</h2>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary-foreground/80" />
                <span className="text-xs font-semibold text-primary-foreground/80">
                  {effectiveNewUser ? "Start your first job" : `+${pctChange}% vs last week`}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <Star className={`h-4 w-4 ${displayEarnings.rating > 0 ? "fill-star text-star" : "text-primary-foreground/40"}`} />
                <span className="text-lg font-extrabold text-primary-foreground">
                  {displayEarnings.rating > 0 ? displayEarnings.rating : "—"}
                </span>
              </div>
              <span className="text-[10px] text-primary-foreground/60">{displayEarnings.reviews} reviews</span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-xl bg-white/15 p-3 text-center">
              <p className="text-lg font-extrabold text-primary-foreground">{displayEarnings.completedJobs}</p>
              <p className="text-[10px] text-primary-foreground/70">Completed</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 p-3 text-center">
              <p className="text-lg font-extrabold text-primary-foreground">{displayEarnings.pendingJobs}</p>
              <p className="text-[10px] text-primary-foreground/70">Pending</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 p-3 text-center">
              <p className="text-lg font-extrabold text-primary-foreground">£{displayEarnings.thisMonth}</p>
              <p className="text-[10px] text-primary-foreground/70">This Month</p>
            </div>
          </div>
        </div>



        {/* Incoming Jobs — vertical list */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-foreground">Incoming Jobs</h3>
              {displayJobs.length > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                  {displayJobs.length} new
                </span>
              )}
            </div>
            <button onClick={() => navigate("/trader/jobs")} className="text-xs font-semibold text-primary">
              View all
            </button>
          </div>

          {displayJobs.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl bg-card p-6 card-shadow text-center">
              <CheckCircle2 className="mb-2 h-8 w-8 text-primary/40" />
              <p className="text-sm font-semibold text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No new jobs right now</p>
            </div>
          )}

          {displayJobs.length > 0 && (
            <div className="flex flex-col gap-3">
              {displayJobs.map((job) => (
                <IncomingJobCard
                  key={job.id}
                  job={job}
                  onViewDetail={() => toast.info("Navigate to Jobs tab for full details")}
                  viewMode={isIndividual ? "individual" : "agency"}
                  onShowSchedule={() => setScheduleJob(job)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming — Toggle between cards and calendar */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-foreground">Upcoming</h3>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
              <button
                onClick={() => setScheduleView("cards")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  scheduleView === "cards"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                onClick={() => setScheduleView("calendar")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  scheduleView === "calendar"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Calendar
              </button>
            </div>
          </div>

          {scheduleView === "cards" ? (
            displayScheduleJobs.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl bg-card p-6 card-shadow text-center">
                <CalendarDays className="mb-2 h-8 w-8 text-primary/40" />
                <p className="text-sm font-semibold text-foreground">No upcoming jobs</p>
                <p className="text-xs text-muted-foreground">Accept jobs to fill your schedule</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[...displayScheduleJobs]
                  .sort((a, b) => a.priority - b.priority)
                  .map((job) => (
                    <button
                      key={job.id}
                      onClick={() => navigate(`/trader/jobs/${job.id}`)}
                      className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow transition-all hover:card-shadow-hover active:scale-[0.98] text-left w-full"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-xl">
                        {job.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground truncate">{job.title}</h4>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            job.status === "In Progress"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.customer}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> {job.date}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
              </div>
            )
          ) : (
            <CalendarDayView />
          )}
        </div>

        {/* Earnings + Chart CTA removed, now in bottom nav */}

        {/* Quote Modal — agency only */}
        {isAgencyProfile && quoteJobId && (() => {
          const job = jobs.find((j) => j.id === quoteJobId);
          if (!job) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
              <div className="w-full max-w-[390px] rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-foreground font-heading">Submit Quote</h2>
                  <button onClick={() => { setQuoteJobId(null); setQuoteAmount(""); }} className="rounded-full bg-muted p-2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">{job.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">{job.customer} · {job.location}</p>
                  </div>
                </div>
                <QuoteBreakdown
                  onSubmitQuote={(data) => {
                    setJobs((prev) => prev.filter((j) => j.id !== job.id));
                    setQuoteJobId(null);
                    setQuoteAmount("");
                    toast.success(`Quote sent: £${data.total.toFixed(2)}`, {
                      description: `${data.materials.length} item(s) + ${data.labourHours}h labour`,
                    });
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* Assign Modal — agency only */}
        {isAgencyProfile && dispatchJobId && (() => {
          const job = jobs.find((j) => j.id === dispatchJobId);
          if (!job) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
              <div className="w-full max-w-[390px] rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  {assignStep !== "choose" ? (
                    <button onClick={() => { if (assignStep === "confirm") setAssignStep(selectedGroupId ? "select-members" : "choose"); else { setAssignStep("choose"); setSelectedGroupId(null); setSelectedMemberIds(new Set()); } }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <ChevronDown className="h-4 w-4 text-foreground rotate-90" />
                    </button>
                  ) : <div />}
                  <h2 className="text-lg font-extrabold text-foreground font-heading">
                    {assignStep === "choose" ? "Pickup" : assignStep === "select-members" ? "Select Members" : "Confirm Assignment"}
                  </h2>
                  <button onClick={resetAssignFlow} className="rounded-full bg-muted p-2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">{job.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">{job.customer} · {job.location}</p>
                  </div>
                </div>

                {assignStep === "choose" && (
                  <>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assign to a Group</p>
                    <div className="flex flex-col gap-2 mb-4">
                      {mockGroups.map((group) => (
                        <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setSelectedMemberIds(new Set(group.members.map((m) => m.id))); setAssignStep("select-members"); }} className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow transition-all active:scale-[0.98]">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-foreground">{group.name}</p>
                            <p className="text-[11px] text-muted-foreground">{group.members.length} members</p>
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                        </button>
                      ))}
                    </div>

                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Or Assign to Individuals</p>
                    {selectedIndividuals.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {selectedIndividuals.map((person) => (
                          <span key={person.id} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary">
                            {person.name}
                            <button onClick={() => setSelectedIndividuals((prev) => prev.filter((p) => p.id !== person.id))} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative mb-2">
                      <input type="text" placeholder="Search workers..." value={individualSearch} onChange={(e) => setIndividualSearch(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                    </div>
                    {(() => {
                      const query = individualSearch.toLowerCase();
                      const filtered = mockIndividuals.filter((p) => !selectedIndividuals.some((s) => s.id === p.id) && (p.name.toLowerCase().includes(query) || p.role.toLowerCase().includes(query)));
                      if (filtered.length === 0 && individualSearch) return <p className="py-4 text-center text-xs text-muted-foreground">No workers found</p>;
                      return (
                        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto rounded-xl border border-border bg-card">
                          {filtered.map((person) => (
                            <button key={person.id} onClick={() => { setSelectedIndividuals((prev) => [...prev, person]); setIndividualSearch(""); }} className="flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-accent active:bg-accent">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground">{person.name.split(" ").map((n) => n[0]).join("")}</div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-foreground truncate">{person.name}</p><p className="text-[10px] text-muted-foreground">{person.role}</p></div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                    <div className="mt-4 flex gap-2">
                      <button onClick={resetAssignFlow} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors active:bg-muted">Cancel</button>
                      <button onClick={() => { if (selectedIndividuals.length > 0) setAssignStep("confirm"); }} disabled={selectedIndividuals.length === 0} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40">Continue ({selectedIndividuals.length})</button>
                    </div>
                  </>
                )}

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
                          <button key={member.id} onClick={() => toggleMember(member.id)} className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all active:scale-[0.98] ${isSelected ? "bg-primary/5 border-2 border-primary" : "bg-card border-2 border-transparent card-shadow"}`}>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"}`}>{member.name.split(" ").map((n) => n[0]).join("")}</div>
                            <div className="flex-1 text-left"><p className="text-sm font-bold text-foreground">{member.name}</p><p className="text-[11px] text-muted-foreground">{member.role}</p></div>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected ? "bg-primary" : "border-2 border-border"}`}>{isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}</div>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => selectedMemberIds.size > 0 && setAssignStep("confirm")} disabled={selectedMemberIds.size === 0} className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40">Continue ({selectedMemberIds.size} selected)</button>
                  </>
                )}

                {assignStep === "confirm" && (
                  <>
                    <div className="mb-3 rounded-2xl bg-accent/50 border border-border p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Assignment Summary</p>
                      {selectedGroup ? (
                        <>
                          <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-primary" /><span className="text-sm font-bold text-foreground">{selectedGroup.name}</span></div>
                          <div className="flex flex-col gap-1.5 pl-6">
                            {selectedGroup.members.filter((m) => selectedMemberIds.has(m.id)).map((m) => (
                              <div key={m.id} className="flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">{m.name.split(" ").map((n) => n[0]).join("")}</div>
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
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">{p.name.split(" ").map((n) => n[0]).join("")}</div>
                              <span className="text-xs font-semibold text-foreground">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground">{p.role}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={resetAssignFlow} className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-muted-foreground transition-colors active:bg-muted">Cancel</button>
                      <button onClick={() => {
                        if (selectedGroup) {
                          const memberNames = selectedGroup.members.filter((m) => selectedMemberIds.has(m.id)).map((m) => m.name);
                          acceptJob(dispatchJobId, { type: "group", name: selectedGroup.name, memberNames });
                        } else if (selectedIndividuals.length > 0) {
                          acceptJob(dispatchJobId, { type: "individual", name: selectedIndividuals.map((p) => p.name).join(", "), memberNames: selectedIndividuals.map((p) => p.name) });
                        }
                      }} className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95">
                        <CheckCircle2 className="mr-1.5 inline h-4 w-4" />Confirm
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </MobileLayout>
  );
};

export default TraderHome;
