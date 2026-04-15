import MobileLayout from "@/components/layout/MobileLayout";
import HorizontalScroll from "@/components/ui/HorizontalScroll";
import { Calendar, Clock, MapPin, Star, MessageSquare, X, ChevronRight, ChevronDown, AlertTriangle, RefreshCw, Ban, Info, Shield, FileText, CheckCircle2, XCircle, Package, PoundSterling, Hourglass, Image as ImageIcon, Mic } from "lucide-react";
import { Wrench, Lightbulb, Broom, Shower, PaintBrush, type Icon } from "@phosphor-icons/react";
import { iconColorMap } from "@/lib/icons";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

const CANCELLATION_POLICY = {
  FREE_CANCEL_HOURS: 48,
  LATE_CANCEL_HOURS: 24,
  NO_CANCEL_HOURS: 4,
  LATE_CANCEL_FEE_PCT: 50,
};

const tabs = ["Upcoming", "Quotes", "Completed"];

const upcomingBookings = [
  {
    id: 1,
    service: "Tap Repair",
    icon: Wrench,
    iconColor: "wrench",
    provider: "John Smith",
    providerId: "t1",
    date: "12 Mar 2026",
    dateISO: "2026-03-12T10:00:00",
    time: "10:00 - 12:00",
    location: "London",
    status: "Confirmed",
    price: 65,
  },
  {
    id: 2,
    service: "Light Installation",
    icon: Lightbulb,
    iconColor: "lightbulb",
    provider: "Sophie Baker",
    providerId: "t2",
    date: "15 Mar 2026",
    dateISO: "2026-03-15T14:00:00",
    time: "14:00 - 16:00",
    location: "Manchester",
    status: "Pending",
    price: 55,
  },
];

const getHoursUntil = (dateISO: string) => {
  const now = new Date();
  const target = new Date(dateISO);
  return Math.max(0, (target.getTime() - now.getTime()) / (1000 * 60 * 60));
};

const getCancelStatus = (dateISO: string) => {
  const hours = getHoursUntil(dateISO);
  if (hours <= CANCELLATION_POLICY.NO_CANCEL_HOURS) return "blocked";
  if (hours <= CANCELLATION_POLICY.LATE_CANCEL_HOURS) return "late-fee";
  if (hours <= CANCELLATION_POLICY.FREE_CANCEL_HOURS) return "partial-fee";
  return "free";
};

const completedBookings = [
  {
    id: 3,
    service: "Deep Cleaning",
    icon: Broom,
    iconColor: "broom",
    provider: "Lisa Martinez",
    providerId: "t8",
    date: "28 Feb 2026",
    time: "09:00 - 13:00",
    location: "Cardiff",
    price: 95,
    breakdown: [
      { label: "Deep Cleaning Service", amount: 80 },
      { label: "Materials & Supplies", amount: 10 },
      { label: "Platform Fee", amount: 5 },
    ],
    reviewed: false,
  },
  {
    id: 4,
    service: "Drain Unblocking",
    icon: Shower,
    iconColor: "shower",
    provider: "John Smith",
    providerId: "t1",
    date: "20 Feb 2026",
    time: "11:00 - 13:00",
    location: "London",
    price: 75,
    breakdown: [
      { label: "Drain Unblocking", amount: 60 },
      { label: "Call-out Fee", amount: 10 },
      { label: "Platform Fee", amount: 5 },
    ],
    reviewed: false,
  },
  {
    id: 5,
    service: "Wall Painting (1 room)",
    icon: PaintBrush,
    iconColor: "paintBrush",
    provider: "Sarah Chen",
    providerId: "t6",
    date: "10 Feb 2026",
    time: "10:00 - 14:00",
    location: "London",
    price: 120,
    breakdown: [
      { label: "Painting Labour", amount: 90 },
      { label: "Paint & Materials", amount: 22 },
      { label: "Platform Fee", amount: 8 },
    ],
    reviewed: true,
    reviewData: { rating: 5, comment: "Excellent work, very tidy and professional." },
  },
];

interface OriginalRequest {
  description: string;
  photos?: string[];
  expectedDuration?: string;
  expectedBudget?: number;
  hasVoiceNote?: boolean;
  voiceDuration?: string;
  location: string;
}

interface QuoteItem {
  id: number;
  service: string;
  icon: Icon;
  iconColor: string;
  provider: string;
  providerType: "individual" | "agency";
  receivedDate: string;
  expiresIn: string;
  materials: { description: string; quantity: number; unitPrice: number }[];
  labourDescription: string;
  labourTotal: number;
  materialsTotal: number;
  total: number;
  vatRate: number;
  message?: string;
  originalRequest: OriginalRequest;
}

const pendingQuotes: QuoteItem[] = [
  {
    id: 101,
    service: "Full Bathroom Renovation",
    icon: Shower,
    iconColor: "shower",
    provider: "ProBuild Agency",
    providerType: "agency",
    receivedDate: "7 Mar 2026",
    expiresIn: "5 days",
    materials: [
      { description: "Copper pipes (2m)", quantity: 4, unitPrice: 12.5 },
      { description: "Fittings & connectors", quantity: 10, unitPrice: 3.25 },
      { description: "Tiles (30x30cm)", quantity: 48, unitPrice: 4.5 },
      { description: "Sealant & adhesive", quantity: 3, unitPrice: 8 },
    ],
    labourDescription: "2 workers × 8h",
    labourTotal: 720,
    materialsTotal: 330.5,
    total: 1050.5,
    vatRate: 21,
    message: "We've reviewed the space and recommend a full re-tile with new plumbing fixtures. Estimated 2-day job with 2 workers.",
    originalRequest: {
      description: "Complete bathroom renovation including tiling, plumbing, and fixtures. Approx 6m² bathroom.",
      photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      expectedDuration: "2–3 days",
      expectedBudget: 1200,
      hasVoiceNote: true,
      voiceDuration: "1:12",
      location: "Jordaan, Amsterdam",
    },
  },
  {
    id: 102,
    service: "Kitchen Remodel",
    icon: Wrench,
    iconColor: "wrench",
    provider: "James Cooper",
    providerType: "individual",
    receivedDate: "6 Mar 2026",
    expiresIn: "3 days",
    materials: [
      { description: "Cabinet handles (set)", quantity: 12, unitPrice: 5 },
      { description: "Countertop sealant", quantity: 2, unitPrice: 12 },
      { description: "Backsplash tiles", quantity: 30, unitPrice: 6 },
    ],
    labourDescription: "6h estimated",
    labourTotal: 270,
    materialsTotal: 264,
    total: 534,
    vatRate: 21,
    originalRequest: {
      description: "Kitchen cabinets need new handles, countertop re-sealing and backsplash tiling.",
      expectedDuration: "1 day",
      expectedBudget: 600,
      location: "De Pijp, Amsterdam",
    },
  },
];

const reviewCriteria = [
  { id: "quality", label: "Quality of Work" },
  { id: "professionalism", label: "Professionalism" },
  { id: "punctuality", label: "Punctuality" },
  { id: "communication", label: "Communication" },
  { id: "value", label: "Value for Money" },
];

const platformCriteria = [
  { id: "ease", label: "Ease of Booking" },
  { id: "experience", label: "Overall Experience" },
];

interface ReviewModalProps {
  booking: (typeof completedBookings)[0];
  onClose: () => void;
  onSubmit: (data: ReviewData) => void;
}

interface ReviewData {
  ratings: Record<string, number>;
  platformRatings: Record<string, number>;
  comment: string;
  overallRating: number;
}

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform active:scale-110"
      >
        <Star
          className={`h-6 w-6 ${
            star <= value ? "fill-star text-star" : "text-muted-foreground/30"
          }`}
        />
      </button>
    ))}
  </div>
);

const ReviewModal = ({ booking, onClose, onSubmit }: ReviewModalProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [platformRatings, setPlatformRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [showPlatformRating, setShowPlatformRating] = useState(false);

  const allTraderRated = reviewCriteria.every((c) => ratings[c.id] > 0);

  const avgRating = allTraderRated
    ? Math.round(
        (reviewCriteria.reduce((sum, c) => sum + (ratings[c.id] || 0), 0) /
          reviewCriteria.length) *
          10
      ) / 10
    : 0;

  const handleSubmit = () => {
    onSubmit({
      ratings,
      platformRatings,
      comment,
      overallRating: avgRating,
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-h-[85%] overflow-y-auto rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground font-heading">Leave a Review</h2>
          <button onClick={onClose} className="rounded-full bg-muted p-2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconColorMap[booking.iconColor]?.bg || "bg-accent"} bg-opacity-40`}>
            <booking.icon size={22} weight="duotone" className={iconColorMap[booking.iconColor]?.color || "text-muted-foreground"} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{booking.service}</h4>
            <p className="text-xs text-muted-foreground">by {booking.provider}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {reviewCriteria.map((criteria) => (
            <div key={criteria.id}>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {criteria.label}
              </label>
              <StarRating
                value={ratings[criteria.id] || 0}
                onChange={(v) => setRatings((prev) => ({ ...prev, [criteria.id]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            Your Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience... (quality, tidiness, would you recommend?)"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>

        {allTraderRated && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/5 p-3">
            <Star className="h-5 w-5 fill-star text-star" />
            <span className="text-lg font-extrabold text-foreground">{avgRating}</span>
            <span className="text-sm text-muted-foreground">overall rating</span>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => setShowPlatformRating(!showPlatformRating)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Rate truFindo</p>
              <p className="text-[10px] text-muted-foreground/70">Optional — help us improve</p>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                showPlatformRating ? "rotate-90" : ""
              }`}
            />
          </button>
          {showPlatformRating && (
            <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
              {platformCriteria.map((criteria) => (
                <div key={criteria.id}>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    {criteria.label}
                  </label>
                  <StarRating
                    value={platformRatings[criteria.id] || 0}
                    onChange={(v) =>
                      setPlatformRatings((prev) => ({ ...prev, [criteria.id]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allTraderRated}
          className={`mt-5 w-full rounded-xl py-3.5 text-sm font-bold transition-transform active:scale-95 ${
            allTraderRated
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

const dateFilters = [
  { id: "all", label: "All" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 3 months" },
  { id: "year", label: "This year" },
];

const QuotesTab = () => {
  const [quotes, setQuotes] = useState(pendingQuotes);
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);
  const [declineQuoteId, setDeclineQuoteId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const handleAccept = (id: number) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    toast.success("Quote accepted! The trader will be notified to schedule the job.");
  };

  const handleDecline = (id: number) => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setDeclineQuoteId(null);
    setDeclineReason("");
    toast("Quote declined. The trader has been notified.");
  };

  return (
    <div className="flex flex-col gap-3">
      {quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No pending quotes</p>
          <p className="text-sm text-muted-foreground">Quotes from traders will appear here</p>
        </div>
      )}

      {quotes.map((q) => {
        const isExpanded = expandedQuoteId === q.id;
        const vatAmount = q.total * (q.vatRate / 100);
        const totalWithVat = q.total + vatAmount;

        return (
          <div key={q.id} className="rounded-2xl bg-card card-shadow overflow-hidden border border-border">
            {/* Header */}
            <button onClick={() => setExpandedQuoteId(isExpanded ? null : q.id)} className="w-full p-4 text-left">
              <div className="flex gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconColorMap[q.iconColor]?.bg || "bg-accent"} bg-opacity-40`}>
                  <q.icon size={22} weight="duotone" className={iconColorMap[q.iconColor]?.color || "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{q.service}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {q.provider} · <span className={`font-semibold ${q.providerType === "agency" ? "text-primary" : "text-foreground"}`}>{q.providerType === "agency" ? "Agency" : "Individual"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[15px] font-extrabold text-primary">£{q.total.toFixed(0)}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {q.receivedDate}</span>
                    <span className="rounded-full bg-[hsl(25,90%,55%)]/10 px-2 py-0.5 text-[10px] font-bold text-[hsl(25,90%,55%)]">Expires in {q.expiresIn}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-border">
                {/* Your original request */}
                <div className="px-4 py-3 border-b border-border bg-accent/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Original Request</p>
                  <p className="text-xs text-foreground leading-relaxed mb-2">{q.originalRequest.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {q.originalRequest.expectedDuration && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Hourglass className="h-3 w-3 text-primary" />{q.originalRequest.expectedDuration}
                      </span>
                    )}
                    {q.originalRequest.expectedBudget && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <PoundSterling className="h-3 w-3 text-primary" />Budget: £{q.originalRequest.expectedBudget}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" />{q.originalRequest.location}
                    </span>
                    {q.originalRequest.hasVoiceNote && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Mic className="h-3 w-3 text-primary" />Voice note ({q.originalRequest.voiceDuration})
                      </span>
                    )}
                  </div>
                  {q.originalRequest.photos && q.originalRequest.photos.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {q.originalRequest.photos.map((photo, i) => (
                        <img key={i} src={photo} alt={`Request photo ${i + 1}`} className="h-14 w-14 rounded-lg object-cover border border-border shrink-0" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Message from trader */}
                {q.message && (
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Message from Trader</p>
                    <p className="text-xs text-foreground leading-relaxed">{q.message}</p>
                  </div>
                )}

                {/* Materials breakdown */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Materials & Items</p>
                  </div>
                  <div className="space-y-1.5">
                    {q.materials.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground truncate flex-1">
                          {m.description} <span className="text-foreground/50">×{m.quantity}</span>
                        </span>
                        <span className="font-semibold text-foreground ml-2">£{(m.quantity * m.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-1.5 flex justify-between text-[11px]">
                      <span className="font-semibold text-foreground">Materials Subtotal</span>
                      <span className="font-bold text-foreground">£{q.materialsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Labour */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Labour ({q.labourDescription})</span>
                    <span className="font-bold text-foreground">£{q.labourTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total with VAT */}
                <div className="px-4 py-3 bg-accent/30">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">£{q.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>BTW ({q.vatRate}%)</span>
                      <span className="font-semibold text-foreground">£{vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between">
                      <span className="text-xs font-bold text-foreground">Total</span>
                      <span className="text-sm font-extrabold text-primary flex items-center gap-0.5">
                        <PoundSterling className="h-3.5 w-3.5" />
                        {totalWithVat.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex border-t border-border">
              <button
                onClick={() => setDeclineQuoteId(q.id)}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-bold text-destructive transition-colors hover:bg-destructive/5"
              >
                <XCircle className="h-3.5 w-3.5" />Decline
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={() => handleAccept(q.id)}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />Accept Quote
              </button>
            </div>
          </div>
        );
      })}

      {/* Decline reason modal */}
      {declineQuoteId && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground font-heading">Decline Quote</h2>
              <button onClick={() => { setDeclineQuoteId(null); setDeclineReason(""); }} className="rounded-full bg-muted p-2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let the trader know why you're declining..."
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDeclineQuoteId(null); setDeclineReason(""); }} className="flex-1 rounded-xl bg-card py-3 text-sm font-bold text-foreground card-shadow active:scale-95">Keep</button>
              <button
                onClick={() => handleDecline(declineQuoteId)}
                disabled={!declineReason.trim()}
                className={`flex-1 rounded-xl py-3 text-sm font-bold active:scale-95 ${declineReason.trim() ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              >
                Decline Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Bookings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showData, setShowData] = useState(true);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [expandedCostId, setExpandedCostId] = useState<number | null>(null);
  const [bookings, setBookings] = useState(completedBookings);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelNotes, setCancelNotes] = useState("");
  const [upcomingList, setUpcomingList] = useState(upcomingBookings);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const cancelBooking = upcomingList.find((b) => b.id === cancelBookingId);
  const rescheduleBooking = upcomingList.find((b) => b.id === rescheduleBookingId);
  const reviewBooking = bookings.find((b) => b.id === reviewBookingId);

  const handleReviewSubmit = (data: ReviewData) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === reviewBookingId
          ? { ...b, reviewed: true, reviewData: { rating: data.overallRating, comment: data.comment } }
          : b
      )
    );
    setReviewBookingId(null);
  };

  return (
    <MobileLayout>
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-6 pb-1">
          <h1 className="mb-5 text-2xl font-extrabold text-foreground font-heading">Bookings</h1>
          <div className="mb-3 flex gap-2 rounded-xl bg-muted p-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === i
                    ? "bg-card text-foreground card-shadow"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        {/* Upcoming */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-2xl bg-accent/50 p-3">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Cancellation Policy: </span>
                Free up to 48h before · 50% fee within 24–48h · No cancellation within 4h
              </div>
            </div>

            {upcomingList.map((b) => {
              const cancelStatus = getCancelStatus(b.dateISO);
              return (
                <div key={b.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[b.iconColor]?.bg || "bg-accent"} bg-opacity-40`}>
                          <b.icon size={20} weight="duotone" className={iconColorMap[b.iconColor]?.color || "text-muted-foreground"} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{b.service}</h3>
                          <p className="text-xs text-muted-foreground">{b.provider}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          b.status === "Confirmed"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {b.time}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {b.location}
                      </span>
                      <span className="ml-auto text-sm font-bold text-primary">£{b.price}</span>
                    </div>
                  </div>

                  <div className="flex border-t border-border">
                    <button
                      onClick={() => setRescheduleBookingId(b.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-accent/50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reschedule
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => {
                        if (cancelStatus === "blocked") return;
                        setCancelBookingId(b.id);
                      }}
                      className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                        cancelStatus === "blocked"
                          ? "text-muted-foreground/40 cursor-not-allowed"
                          : "text-destructive hover:bg-destructive/5"
                      }`}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {cancelStatus === "blocked" ? "Can't Cancel" : "Cancel"}
                    </button>
                  </div>
                </div>
              );
            })}

            {upcomingList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground">Book a service to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Quotes */}
        {activeTab === 1 && <QuotesTab />}

        {/* Completed */}
        {activeTab === 2 && (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {dateFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    dateFilter === f.id
                      ? "bg-primary text-primary-foreground chip-active-shadow"
                      : "bg-card text-foreground card-shadow"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {showData ? `${bookings.filter((b) => {
                  if (dateFilter === "all") return true;
                  const bookingDate = new Date(b.date.split(" ").reverse().join("-"));
                  const now = new Date();
                  const diffDays = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
                  if (dateFilter === "7d") return diffDays <= 7;
                  if (dateFilter === "30d") return diffDays <= 30;
                  if (dateFilter === "90d") return diffDays <= 90;
                  if (dateFilter === "year") return bookingDate.getFullYear() === now.getFullYear();
                  return true;
                }).length} completed` : "Demo mode"}
              </span>
              <button
                onClick={() => setShowData(!showData)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  showData ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${
                    showData ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {showData ? (
              <div className="flex flex-col gap-3">
                {bookings.filter((b) => {
                  if (dateFilter === "all") return true;
                  const parts = b.date.split(" ");
                  const monthMap: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
                  const bookingDate = new Date(`${parts[2]}-${monthMap[parts[1]]}-${parts[0].padStart(2, "0")}`);
                  const now = new Date();
                  const diffDays = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
                  if (dateFilter === "7d") return diffDays <= 7;
                  if (dateFilter === "30d") return diffDays <= 30;
                  if (dateFilter === "90d") return diffDays <= 90;
                  if (dateFilter === "year") return bookingDate.getFullYear() === now.getFullYear();
                  return true;
                }).map((b) => (
                  <div key={b.id} className="rounded-2xl bg-card card-shadow overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[b.iconColor]?.bg || "bg-accent"}`}>
                          <b.icon size={20} weight="duotone" className={iconColorMap[b.iconColor]?.color || "text-muted-foreground"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground truncate">{b.service}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-sm font-bold text-primary">£{b.price}</span>
                              <button
                                onClick={() => setExpandedCostId(expandedCostId === b.id ? null : b.id)}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                                    expandedCostId === b.id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{b.provider} · {b.date}</p>
                        </div>
                      </div>

                      {expandedCostId === b.id && b.breakdown && (
                        <div className="mt-3 flex flex-col gap-1.5 rounded-xl bg-muted p-3">
                          {b.breakdown.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-semibold text-foreground">£{item.amount}</span>
                            </div>
                          ))}
                          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm">
                            <span className="font-bold text-foreground">Total</span>
                            <span className="font-bold text-primary">£{b.price}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {b.reviewed && b.reviewData ? (
                      <div className="border-t border-border bg-accent/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.round(b.reviewData!.rating)
                                    ? "fill-star text-star"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {b.reviewData.rating}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          "{b.reviewData.comment}"
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewBookingId(b.id)}
                        className="flex w-full items-center justify-center gap-2 border-t border-border py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent/50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Leave a Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No completed bookings yet</p>
                <p className="text-sm text-muted-foreground">Your history will appear here</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBookingId(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Cancel Modal */}
      {cancelBooking && (() => {
        const status = getCancelStatus(cancelBooking.dateISO);
        const hoursLeft = Math.round(getHoursUntil(cancelBooking.dateISO));
        const fee = status === "late-fee" || status === "partial-fee"
          ? Math.round(cancelBooking.price * CANCELLATION_POLICY.LATE_CANCEL_FEE_PCT / 100)
          : 0;

        return (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
            <div className="w-full max-h-[85%] overflow-y-auto rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-foreground font-heading">Cancel Booking</h2>
                <button onClick={() => setCancelBookingId(null)} className="rounded-full bg-muted p-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorMap[cancelBooking.iconColor]?.bg || "bg-accent"}`}>
                  <cancelBooking.icon size={20} weight="duotone" className={iconColorMap[cancelBooking.iconColor]?.color || "text-muted-foreground"} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{cancelBooking.service}</h4>
                  <p className="text-xs text-muted-foreground">{cancelBooking.provider} · {cancelBooking.date}</p>
                </div>
              </div>

              <div className={`mb-4 rounded-2xl p-4 ${
                fee > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-accent/50"
              }`}>
                <div className="flex items-start gap-2.5">
                  {fee > 0 ? (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                  ) : (
                    <Shield className="h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div>
                    {status === "free" && (
                      <>
                        <p className="text-sm font-bold text-foreground">Free Cancellation</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Your booking is more than 48 hours away ({hoursLeft}h). You can cancel at no cost.
                        </p>
                      </>
                    )}
                    {status === "partial-fee" && (
                      <>
                        <p className="text-sm font-bold text-foreground">Cancellation Fee Applies</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Your booking is within 24–48 hours ({hoursLeft}h away). A {CANCELLATION_POLICY.LATE_CANCEL_FEE_PCT}% cancellation fee of <span className="font-bold text-destructive">£{fee}</span> will apply.
                        </p>
                      </>
                    )}
                    {status === "late-fee" && (
                      <>
                        <p className="text-sm font-bold text-foreground">Late Cancellation Fee</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Your booking is less than 24 hours away ({hoursLeft}h). A {CANCELLATION_POLICY.LATE_CANCEL_FEE_PCT}% fee of <span className="font-bold text-destructive">£{fee}</span> will be charged.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-1.5 rounded-xl bg-muted p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking total</span>
                  <span className="font-semibold text-foreground">£{cancelBooking.price}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancellation fee</span>
                    <span className="font-semibold text-destructive">-£{fee}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="font-bold text-foreground">Refund amount</span>
                  <span className="font-bold text-primary">£{cancelBooking.price - fee}</span>
                </div>
              </div>

              {/* Cancellation Notes */}
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setCancelBookingId(null); setCancelNotes(""); }}
                  className="flex-1 rounded-xl bg-card py-3 text-sm font-bold text-foreground card-shadow transition-transform active:scale-95"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => {
                    if (!cancelNotes.trim()) {
                      toast.error("Please provide a reason for cancellation");
                      return;
                    }
                    setUpcomingList((prev) => prev.filter((b) => b.id !== cancelBooking.id));
                    setCancelBookingId(null);
                    setCancelNotes("");
                    toast.success("Booking cancelled");
                  }}
                  disabled={!cancelNotes.trim()}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold transition-transform active:scale-95 ${
                    cancelNotes.trim()
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {fee > 0 ? `Cancel (£${fee} fee)` : "Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-h-[85%] overflow-y-auto rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground font-heading">Reschedule</h2>
              <button onClick={() => { setRescheduleBookingId(null); setRescheduleDate(null); setRescheduleTime(null); }} className="rounded-full bg-muted p-2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorMap[rescheduleBooking.iconColor]?.bg || "bg-accent"}`}>
                <rescheduleBooking.icon size={20} weight="duotone" className={iconColorMap[rescheduleBooking.iconColor]?.color || "text-muted-foreground"} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{rescheduleBooking.service}</h4>
                <p className="text-xs text-muted-foreground">{rescheduleBooking.provider}</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-accent/50 p-3">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Free rescheduling up to <span className="font-semibold text-foreground">4 hours</span> before. Subject to trader availability.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</label>
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {rescheduleBooking.date} · {rescheduleBooking.time}
              </div>
            </div>

            <div className="mb-4">
              <HorizontalScroll
                className="gap-2 pb-1"
                title={
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    New Date
                  </h3>
                }
              >
                {availableDates.map((date) => {
                  const isSelected = rescheduleDate && format(date, "yyyy-MM-dd") === format(rescheduleDate, "yyyy-MM-dd");
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setRescheduleDate(date)}
                      className={`flex shrink-0 flex-col items-center rounded-2xl px-3.5 py-2.5 transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground chip-active-shadow"
                          : "bg-card text-foreground card-shadow"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase">{format(date, "EEE")}</span>
                      <span className="text-lg font-bold">{format(date, "d")}</span>
                      <span className="text-[10px]">{format(date, "MMM")}</span>
                    </button>
                  );
                })}
              </HorizontalScroll>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Select Time
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setRescheduleTime(time)}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      rescheduleTime === time
                        ? "bg-primary text-primary-foreground chip-active-shadow"
                        : "bg-card text-foreground card-shadow"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!rescheduleDate || !rescheduleTime) return;
                toast.success("Booking rescheduled! ✅", {
                  description: `Moved to ${format(rescheduleDate, "PPP")} at ${rescheduleTime}`,
                });
                setRescheduleBookingId(null);
                setRescheduleDate(null);
                setRescheduleTime(null);
              }}
              disabled={!rescheduleDate || !rescheduleTime}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
            >
              Confirm New Time
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Bookings;
