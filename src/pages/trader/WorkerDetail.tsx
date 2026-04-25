import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Star, Clock, TrendingUp, PoundSterling,
  Briefcase, Calendar, CheckCircle2,
  Zap, CalendarClock,
} from "lucide-react";
import AssignmentCard from "@/components/trader/AssignmentCard";
import Avatar from "boring-avatars";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const avatarPalette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  hours: number;
  period: string;
  mode: "scheduled" | "manual";
  status: "paid" | "processing" | "failed";
}

interface RolePay {
  role: string;
  rate: number;
}

const mockWorkers: Record<string, {
  name: string; email: string; phone: string; joinedDate: string;
  totalJobs: number; totalHours: number; totalEarned: number; avgRating: number; completionRate: number;
  reviews: { id: string; customer: string; rating: number; text: string; date: string }[];
  assignments: { id: string; title: string; date: string; status: "completed" | "cancelled" | "in_progress"; amount: number; hours: number; address: string }[];
  payouts: PayoutRecord[];
  basePays: RolePay[];
}> = {
  m1: {
    name: "Alex Turner", email: "alex@example.com", phone: "+44 7700 900001", joinedDate: "Jan 2024",
    totalJobs: 28, totalHours: 84, totalEarned: 2520, avgRating: 4.9, completionRate: 96,
    reviews: [
      { id: "r1", customer: "Sarah M.", rating: 5, text: "Excellent work, very professional and tidy.", date: "2 days ago" },
      { id: "r2", customer: "John D.", rating: 5, text: "Fixed the issue quickly, would recommend.", date: "1 week ago" },
      { id: "r3", customer: "Emma W.", rating: 4, text: "Good job overall, slightly late but communicated well.", date: "2 weeks ago" },
    ],
    assignments: [
      { id: "a1", title: "Tap Repair - 12 Oak Lane", date: "5 Mar 2026", status: "completed", amount: 65, hours: 1.5, address: "12 Oak Lane, SW1" },
      { id: "a2", title: "Drain Unblocking - 8 Elm St", date: "3 Mar 2026", status: "completed", amount: 75, hours: 2, address: "8 Elm Street, E1" },
      { id: "a3", title: "Toilet Repair - 22 Pine Rd", date: "28 Feb 2026", status: "completed", amount: 55, hours: 1, address: "22 Pine Road, N1" },
      { id: "a4", title: "Boiler Service - 5 Maple Ave", date: "25 Feb 2026", status: "cancelled", amount: 0, hours: 0, address: "5 Maple Avenue, SE1" },
      { id: "a5", title: "Tap Repair - 3 Birch Close", date: "20 Feb 2026", status: "completed", amount: 65, hours: 1.5, address: "3 Birch Close, W1" },
    ],
    payouts: [
      { id: "p1", date: "7 Mar 2026", amount: 435, hours: 14.5, period: "3 Mar – 7 Mar", mode: "scheduled", status: "paid" },
      { id: "p2", date: "3 Mar 2026", amount: 540, hours: 18, period: "24 Feb – 2 Mar", mode: "scheduled", status: "paid" },
      { id: "p3", date: "24 Feb 2026", amount: 480, hours: 16, period: "17 Feb – 23 Feb", mode: "manual", status: "paid" },
      { id: "p4", date: "17 Feb 2026", amount: 390, hours: 13, period: "10 Feb – 16 Feb", mode: "scheduled", status: "paid" },
      { id: "p5", date: "10 Feb 2026", amount: 360, hours: 12, period: "3 Feb – 9 Feb", mode: "manual", status: "paid" },
    ],
    basePays: [
      { role: "Lead Plumber", rate: 35 },
      { role: "Maintenance", rate: 25 },
      { role: "Emergency", rate: 45 },
    ],
  },
  m2: {
    name: "James Cooper", email: "james@example.com", phone: "+44 7700 900002", joinedDate: "Mar 2024",
    totalJobs: 19, totalHours: 58, totalEarned: 1740, avgRating: 4.7, completionRate: 92,
    reviews: [
      { id: "r4", customer: "Mike B.", rating: 5, text: "Very thorough and clean work.", date: "3 days ago" },
      { id: "r5", customer: "Lisa K.", rating: 4, text: "Got the job done well.", date: "1 week ago" },
    ],
    assignments: [
      { id: "a6", title: "Drain Unblocking - 15 Ash Rd", date: "4 Mar 2026", status: "completed", amount: 75, hours: 2, address: "15 Ash Road, SW3" },
      { id: "a7", title: "Tap Repair - 9 Cedar Way", date: "1 Mar 2026", status: "completed", amount: 65, hours: 1.5, address: "9 Cedar Way, E2" },
      { id: "a8", title: "Toilet Repair - 7 Willow St", date: "26 Feb 2026", status: "in_progress", amount: 55, hours: 1, address: "7 Willow Street, N3" },
    ],
    payouts: [
      { id: "p6", date: "7 Mar 2026", amount: 210, hours: 7, period: "3 Mar – 7 Mar", mode: "scheduled", status: "paid" },
      { id: "p7", date: "3 Mar 2026", amount: 360, hours: 12, period: "24 Feb – 2 Mar", mode: "scheduled", status: "paid" },
      { id: "p8", date: "24 Feb 2026", amount: 300, hours: 10, period: "17 Feb – 23 Feb", mode: "scheduled", status: "paid" },
    ],
    basePays: [
      { role: "Plumber", rate: 30 },
      { role: "Assistant", rate: 20 },
    ],
  },
  m4: {
    name: "Sophie Baker", email: "sophie@example.com", phone: "+44 7700 900004", joinedDate: "Feb 2024",
    totalJobs: 18, totalHours: 54, totalEarned: 1890, avgRating: 4.8, completionRate: 98,
    reviews: [
      { id: "r6", customer: "Tom H.", rating: 5, text: "Fantastic electrician, very knowledgeable.", date: "1 day ago" },
    ],
    assignments: [
      { id: "a9", title: "Socket Installation - 11 High St", date: "6 Mar 2026", status: "completed", amount: 85, hours: 2, address: "11 High Street, W2" },
      { id: "a10", title: "Light Fitting - 4 Park Ln", date: "2 Mar 2026", status: "completed", amount: 45, hours: 1, address: "4 Park Lane, EC1" },
    ],
    payouts: [
      { id: "p9", date: "7 Mar 2026", amount: 210, hours: 7, period: "3 Mar – 7 Mar", mode: "manual", status: "paid" },
      { id: "p10", date: "3 Mar 2026", amount: 270, hours: 9, period: "24 Feb – 2 Mar", mode: "scheduled", status: "paid" },
    ],
    basePays: [
      { role: "Electrician", rate: 35 },
      { role: "Testing", rate: 40 },
    ],
  },
  m5: {
    name: "Liam Wright", email: "liam@example.com", phone: "+44 7700 900005", joinedDate: "Jun 2024",
    totalJobs: 13, totalHours: 42, totalEarned: 1230, avgRating: 4.5, completionRate: 88,
    reviews: [
      { id: "r7", customer: "Anna P.", rating: 4, text: "Decent work, took a bit longer than expected.", date: "5 days ago" },
    ],
    assignments: [
      { id: "a11", title: "Rewiring - 6 Queen's Rd", date: "5 Mar 2026", status: "in_progress", amount: 350, hours: 8, address: "6 Queen's Road, SE5" },
    ],
    payouts: [
      { id: "p11", date: "3 Mar 2026", amount: 240, hours: 8, period: "24 Feb – 2 Mar", mode: "scheduled", status: "paid" },
    ],
    basePays: [
      { role: "Junior Electrician", rate: 25 },
    ],
  },
};

const modeMeta: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  scheduled: { label: "Scheduled", icon: CalendarClock, color: "text-primary", bg: "bg-primary/10" },
  manual: { label: "Manual", icon: Zap, color: "text-[hsl(var(--chart-4))]", bg: "bg-[hsl(var(--chart-4))]/10" },
};

const WorkerDetail = () => {
  const navigate = useNavigate();
  const { workerId } = useParams<{ workerId: string }>();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("group");
  const worker = mockWorkers[workerId || ""] || mockWorkers.m1;
  const [activeTab, setActiveTab] = useState("performance");
  const [isWorkerActive, setIsWorkerActive] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>("");

  const handleEdit = (role: string, rate: number) => {
    setEditingRole(role);
    setTempRate(rate.toString());
  };

  const handleSave = (role: string) => {
    toast.success(`Updated ${role} rate to £${tempRate}/hr`);
    setEditingRole(null);
  };

  const totalPaid = worker.payouts.reduce((s, p) => s + p.amount, 0);

  const toggleWorkerStatus = (checked: boolean) => {
    setIsWorkerActive(checked);
    toast.success(checked ? `${worker.name} is now active` : `${worker.name} is now inactive`);
  };

  return (
    <MobileLayout role="trader">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button onClick={() => navigate(groupId ? `/trader/groups/${groupId}` : -1 as any)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground font-heading">Worker Profile</h1>
        </div>
      </div>

      {/* Worker card */}
      <div className="mx-4 mb-4 rounded-2xl bg-card card-shadow overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="relative">
            <Avatar size={52} name={worker.name} variant="beam" colors={avatarPalette} />
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${isWorkerActive ? "bg-primary" : "bg-muted-foreground/40"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground">{worker.name}</h2>
            <p className="text-[11px] text-muted-foreground">{worker.email}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-star text-star" />{worker.avgRating}</span>
              <span>·</span>
              <span>Since {worker.joinedDate}</span>
            </div>
          </div>
        </div>
        {/* Active/Inactive toggle */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-foreground">{isWorkerActive ? "Active" : "Inactive"}</p>
            <p className="text-[10px] text-muted-foreground">{isWorkerActive ? "Receiving job assignments" : "Not receiving jobs"}</p>
          </div>
          <Switch checked={isWorkerActive} onCheckedChange={toggleWorkerStatus} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full rounded-xl bg-muted p-1">
          <TabsTrigger value="performance" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Payouts
          </TabsTrigger>
          <TabsTrigger value="base-pays" className="flex-1 rounded-lg text-[10px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Base Pays
          </TabsTrigger>
        </TabsList>

        {/* Performance */}
        <TabsContent value="performance" className="pb-6">
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Jobs</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{worker.totalJobs}</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hours</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{worker.totalHours}h</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 fill-star text-star" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rating</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{worker.avgRating}</p>
            </div>
            <div className="rounded-2xl bg-card p-3.5 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Earned</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">£{worker.totalEarned}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-card p-4 card-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Completion Rate</span>
              <span className="text-xs font-extrabold text-primary">{worker.completionRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${worker.completionRate}%` }} />
            </div>
          </div>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="pb-6">
          <div className="mt-4 flex flex-col gap-2.5">
            {worker.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-card p-4 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">{review.customer}</span>
                  <span className="text-[10px] text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-star text-star" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
            {worker.reviews.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="pb-6">
          <div className="mt-4 flex flex-col gap-2.5">
            {worker.assignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
            {worker.assignments.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No assignments yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts" className="pb-6">
          {/* Summary */}
          <div className="mt-4 rounded-2xl bg-primary p-4 card-shadow mb-4">
            <p className="text-[10px] font-semibold text-primary-foreground/70 uppercase">Total Paid Out</p>
            <p className="mt-0.5 text-3xl font-extrabold text-primary-foreground">£{totalPaid}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-primary-foreground/70">
              <span>{worker.payouts.length} payouts</span>
              <span>·</span>
              <span>{worker.payouts.filter((p) => p.mode === "scheduled").length} scheduled, {worker.payouts.filter((p) => p.mode === "manual").length} manual</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {worker.payouts.map((payout) => {
              const meta = modeMeta[payout.mode];
              const ModeIcon = meta.icon;
              return (
                <div key={payout.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                      <ModeIcon className={`h-4.5 w-4.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">£{payout.amount}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          payout.status === "paid" ? "bg-primary/10 text-primary" :
                          payout.status === "processing" ? "bg-yellow-500/10 text-yellow-600" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {payout.status === "paid" ? "Paid" : payout.status === "processing" ? "Processing" : "Failed"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{payout.date}
                        </span>
                        <span className="text-border">·</span>
                        <span>{payout.hours}h</span>
                        <span className="text-border">·</span>
                        <span>{payout.period}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <div className={`rounded-md px-1.5 py-0.5 ${meta.bg}`}>
                          <span className={`text-[9px] font-bold ${meta.color}`}>{meta.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {worker.payouts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PoundSterling className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-foreground">No payouts yet</p>
                <p className="text-xs text-muted-foreground">Payments will appear here once processed.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Base Pays */}
        <TabsContent value="base-pays" className="pb-6">
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-2xl bg-card p-4 card-shadow border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <PoundSterling className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Role Base Rates</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                Configure the hourly base pay for this worker across different roles. These rates are used for quote generation and automated payroll calculations.
              </p>
              
              <div className="space-y-3">
                {worker.basePays.map((bp) => (
                  <div key={bp.role} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{bp.role}</span>
                      <span className="text-[10px] text-muted-foreground">Standard Rate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {editingRole === bp.role ? (
                        <div className="flex items-center gap-2">
                           <div className="relative">
                             <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">£</span>
                             <input 
                               value={tempRate}
                               onChange={(e) => setTempRate(e.target.value)}
                               className="w-16 rounded-lg border border-primary bg-background py-1 pl-5 pr-2 text-xs font-bold outline-none"
                               autoFocus
                             />
                           </div>
                           <button onClick={() => handleSave(bp.role)} className="rounded-lg bg-primary p-1.5 text-primary-foreground">
                             <CheckCircle2 className="h-3.5 w-3.5" />
                           </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-extrabold text-foreground">£{bp.rate}/hr</span>
                          <button 
                            onClick={() => handleEdit(bp.role, bp.rate)}
                            className="text-[10px] font-bold text-primary hover:underline mt-0.5"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl bg-primary/5 p-3 border border-primary/10 flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Any changes made here will be applied to future quotes and new job assignments. Existing assignments remain unaffected.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
};

export default WorkerDetail;
