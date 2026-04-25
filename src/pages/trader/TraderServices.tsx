import MobileLayout from "@/components/layout/MobileLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X, Clock, PoundSterling, ToggleLeft, ToggleRight, ChevronRight, Pencil } from "lucide-react";
import { catAServices, catBServices } from "@/data/services";
import { EmojiIcon, getEmojiIconColors } from "@/lib/icons";
import { useAuth } from "@/contexts/AuthContext";

const UNIVERSAL_BASE_PAY = 30; // £/hr default universal rate

interface TraderService {
  id: string;
  name: string;
  icon: string;
  category: string;
  price: number | null;
  priceLabel: string;
  duration: string;
  active: boolean;
  useUniversalPay: boolean;
  customBasePay: number | null;
}

const initialServices: TraderService[] = [
  { id: "ts1", name: "Tap Repair", icon: "🔧", category: "plumbing", price: 65, priceLabel: "£65", duration: "1-2 hours", active: true, useUniversalPay: true, customBasePay: null },
  { id: "ts2", name: "Drain Unblocking", icon: "🚿", category: "plumbing", price: 75, priceLabel: "£75", duration: "1-2 hours", active: true, useUniversalPay: true, customBasePay: null },
  { id: "ts3", name: "Toilet Repair", icon: "🔧", category: "plumbing", price: 55, priceLabel: "£55", duration: "1-2 hours", active: true, useUniversalPay: true, customBasePay: null },
  { id: "ts4", name: "Full Bathroom Renovation", icon: "🛁", category: "plumbing", price: null, priceLabel: "Custom Quote", duration: "1-3 weeks", active: true, useUniversalPay: false, customBasePay: 40 },
  { id: "ts5", name: "Boiler Service", icon: "🔥", category: "hvac", price: 85, priceLabel: "£85", duration: "1-2 hours", active: false, useUniversalPay: true, customBasePay: null },
];

const TraderServicesPage = () => {
  const { profile } = useAuth();
  const isAgency = profile?.trader_type === "agency";
  const navigate = useNavigate();
  const [services, setServices] = useState(initialServices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [customDuration, setCustomDuration] = useState("");

  // Edit state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editUseUniversal, setEditUseUniversal] = useState(true);
  const [editCustomPay, setEditCustomPay] = useState("");

  const editingService = services.find((s) => s.id === editingServiceId) || null;

  const openEdit = (s: TraderService) => {
    setEditingServiceId(s.id);
    setEditPrice(s.price !== null ? String(s.price) : "");
    setEditDuration(s.duration);
    setEditUseUniversal(s.useUniversalPay);
    setEditCustomPay(s.customBasePay !== null ? String(s.customBasePay) : "");
  };

  const closeEdit = () => {
    setEditingServiceId(null);
    setEditPrice("");
    setEditDuration("");
    setEditUseUniversal(true);
    setEditCustomPay("");
  };

  const saveEdit = () => {
    if (!editingService) return;
    const priceNum = editPrice ? parseFloat(editPrice) : null;
    const customPayNum = editCustomPay ? parseFloat(editCustomPay) : null;

    if (!editUseUniversal && (!customPayNum || customPayNum <= 0)) {
      toast.error("Enter a valid custom base pay");
      return;
    }

    setServices((prev) =>
      prev.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              price: priceNum,
              priceLabel: priceNum ? `£${priceNum}` : "Custom Quote",
              duration: editDuration || s.duration,
              useUniversalPay: editUseUniversal,
              customBasePay: editUseUniversal ? null : customPayNum,
            }
          : s
      )
    );
    toast.success("Service updated");
    closeEdit();
  };

  const activeCount = services.filter((s) => s.active).length;

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const allAvailable = [...catAServices, ...catBServices].filter(
    (s) => !services.some((ts) => ts.name === s.name)
  );

  const addService = () => {
    const source = allAvailable.find((s) => s.id === selectedServiceToAdd);
    if (!source) return;
    const newService: TraderService = {
      id: `ts-${Date.now()}`,
      name: source.name,
      icon: source.icon,
      category: source.categoryId,
      price: customPrice ? parseFloat(customPrice) : source.price || null,
      priceLabel: customPrice ? `£${customPrice}` : source.price ? `£${source.price}` : "Custom Quote",
      duration: customDuration || source.duration || "TBD",
      active: true,
      useUniversalPay: true,
      customBasePay: null,
    };
    setServices((prev) => [...prev, newService]);
    setShowAddModal(false);
    setSelectedServiceToAdd(null);
    setCustomPrice("");
    setCustomDuration("");
    toast.success("Service added!");
  };

  return (
    <MobileLayout role="trader">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground font-heading">My Services</h1>
              <p className="text-sm text-muted-foreground">{activeCount} active · {services.length} total</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary transition-transform active:scale-90"
            >
              <Plus className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          {/* Base Pay Rates Link — Agency only */}
          {isAgency && (
            <button
              onClick={() => navigate("/trader/base-pay")}
              className="group relative mt-4 flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-card p-4 overflow-hidden transition-all active:scale-[0.98] hover:border-primary/60"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <PoundSterling className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-foreground">Base Pay Rates</p>
                <p className="text-[11px] text-muted-foreground">Set hourly rates per service for your workers</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-6">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Toggle Services
        </h2>
        <p className="mb-3 text-[11px] text-muted-foreground">Disabling a service will hide it from customers searching for that category.</p>
        <div className="flex flex-col gap-2.5">
          {services.map((service) => (
            <div key={service.id} className={`rounded-2xl bg-card card-shadow overflow-hidden transition-opacity ${!service.active ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3 p-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getEmojiIconColors(service.icon).bg} bg-opacity-40`}>
                  <EmojiIcon emoji={service.icon} size={22} weight="regular" colorize />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{service.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PoundSterling className="h-3 w-3" />
                      {service.priceLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleService(service.id)}
                  className="shrink-0"
                >
                  {service.active ? (
                    <ToggleRight className="h-7 w-7 text-primary" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Plus className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No services listed</p>
            <p className="text-sm text-muted-foreground">Add services to start receiving jobs</p>
          </div>
        )}
      </div>

      {/* Add Service Modal — absolute to stay inside device mockup */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-h-[85%] overflow-y-auto rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground font-heading">Add Service</h2>
              <button onClick={() => { setShowAddModal(false); setSelectedServiceToAdd(null); }} className="rounded-full bg-muted p-2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {!selectedServiceToAdd ? (
              <div className="flex flex-col gap-2">
                {allAvailable.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">All available services have been added.</p>
                ) : (
                  allAvailable.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceToAdd(service.id)}
                      className="flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow transition-all active:scale-[0.98] text-left"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getEmojiIconColors(service.icon).bg} bg-opacity-40`}>
                        <EmojiIcon emoji={service.icon} size={18} weight="regular" colorize />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">{service.name}</h4>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div>
                {(() => {
                  const source = allAvailable.find((s) => s.id === selectedServiceToAdd);
                  if (!source) return null;
                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-card p-3 card-shadow">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getEmojiIconColors(source.icon).bg} bg-opacity-40`}>
                          <EmojiIcon emoji={source.icon} size={22} weight="regular" colorize />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{source.name}</h4>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Your Price (£)</label>
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                          <PoundSterling className="h-5 w-5 text-muted-foreground" />
                          <input
                            type="number"
                            placeholder={source.price ? `${source.price} (suggested)` : "Enter price"}
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Duration</label>
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder={source.duration || "e.g. 1-2 hours"}
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>

                      <button
                        onClick={addService}
                        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
                      >
                        Add Service
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default TraderServicesPage;
