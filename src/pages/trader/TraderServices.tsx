import MobileLayout from "@/components/layout/MobileLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { Plus, X, Clock, PoundSterling, ToggleLeft, ToggleRight, ChevronRight, ChevronDown } from "lucide-react";
import { catAServices, catBServices } from "@/data/services";
import { categoryServiceTypes } from "@/data/serviceTypes";
import { EmojiIcon, getEmojiIconColors, categoryIconMap, categoryColorMap, iconMap } from "@/lib/icons";
import { useAuth } from "@/contexts/AuthContext";

interface TraderService {
  id: string;
  name: string;
  icon: string;
  category: string;
  price: number | null;
  priceLabel: string;
  duration: string;
  active: boolean;
}

const initialServices: TraderService[] = [
  { id: "ts1", name: "Tap Repair", icon: "🔧", category: "plumbing", price: 65, priceLabel: "£65", duration: "1-2 hours", active: true },
  { id: "ts2", name: "Drain Unblocking", icon: "🚿", category: "plumbing", price: 75, priceLabel: "£75", duration: "1-2 hours", active: true },
  { id: "ts3", name: "Toilet Repair", icon: "🔧", category: "plumbing", price: 55, priceLabel: "£55", duration: "1-2 hours", active: true },
  { id: "ts4", name: "Full Bathroom Renovation", icon: "🛁", category: "plumbing", price: null, priceLabel: "Custom Quote", duration: "1-3 weeks", active: true },
  { id: "ts5", name: "Boiler Service", icon: "🔥", category: "hvac", price: 85, priceLabel: "£85", duration: "1-2 hours", active: false },
];

const TraderServicesPage = () => {
  const { profile } = useAuth();
  const isAgency = profile?.trader_type === "agency";
  const navigate = useNavigate();
  const [services, setServices] = useState(initialServices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0); // 0: Categories, 1: Service Types, 2: Details
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedServiceType, setExpandedServiceType] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ id: string, label: string } | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [customDuration, setCustomDuration] = useState("");

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
    if (!selectedOption || !activeCategoryId) return;
    
    const cat = categoryServiceTypes.find(c => c.categoryId === activeCategoryId);
    const serviceType = cat?.serviceTypes.find(st => st.options.some(o => o.id === selectedOption.id));
    
    // Create professional name: "Tap Repair"
    const serviceName = serviceType ? `${serviceType.label} ${selectedOption.label}` : selectedOption.label;

    const newService: TraderService = {
      id: `ts-${Date.now()}`,
      name: serviceName,
      icon: cat?.emoji || "🔧",
      category: activeCategoryId,
      price: customPrice ? parseFloat(customPrice) : null,
      priceLabel: customPrice ? `£${customPrice}` : "Custom Quote",
      duration: customDuration || "1-2 hours",
      active: true,
    };
    
    setServices((prev) => [...prev, newService]);
    setShowAddModal(false);
    resetModal();
    toast.success("Service added!");
  };

  const resetModal = () => {
    setModalStep(0);
    setActiveCategoryId(null);
    setExpandedServiceType(null);
    setSelectedOption(null);
    setCustomPrice("");
    setCustomDuration("");
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

      {/* Add Service Modal */}
      <Drawer.Root 
        open={showAddModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            resetModal();
          }
        }}
        container={typeof document !== 'undefined' ? document.getElementById('mobile-device-content') : null}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content className="absolute bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[96%] max-w-[430px] flex-col rounded-t-[32px] bg-background outline-none overflow-hidden">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
            <div className="p-5 pb-8 overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-heading">
                    {modalStep === 0 ? "Select Category" : modalStep === 1 ? "Select Service" : "Service Details"}
                  </h2>
                  {modalStep > 0 && (
                    <button 
                      onClick={() => setModalStep((modalStep - 1) as any)}
                      className="text-[10px] font-bold text-primary uppercase tracking-wider"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => { setShowAddModal(false); resetModal(); }} 
                  className="rounded-full bg-muted p-2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Step 0: Category Selection */}
              {modalStep === 0 && (
                <div className="flex flex-col gap-2.5">
                  {categoryServiceTypes.map((cat) => {
                    const IconNode = (() => { 
                      const n = categoryIconMap[cat.categoryId] || "wrench"; 
                      const I = iconMap[n]; 
                      const c = categoryColorMap[cat.categoryId]; 
                      return I ? <I size={24} weight="regular" className={c?.color || "text-muted-foreground"} /> : null; 
                    })();

                    return (
                      <button
                        key={cat.categoryId}
                        onClick={() => {
                          setActiveCategoryId(cat.categoryId);
                          setModalStep(1);
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all active:scale-[0.98]"
                      >
                        {IconNode}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground">{cat.label}</h4>
                          <p className="text-[10px] text-muted-foreground">{cat.serviceTypes.length} service types</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Service Type Selection (Hierarchical) */}
              {modalStep === 1 && activeCategoryId && (() => {
                const cat = categoryServiceTypes.find((c) => c.categoryId === activeCategoryId);
                if (!cat) return null;
                return (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-2 p-1">
                      <span className="text-lg">{cat.emoji}</span>
                      <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
                    </div>
                    {cat.serviceTypes.map((st) => {
                      const isExpanded = expandedServiceType === st.id;
                      return (
                        <div key={st.id} className="rounded-2xl border-2 border-border bg-card overflow-hidden transition-all">
                          <button
                            onClick={() => setExpandedServiceType(isExpanded ? null : st.id)}
                            className="flex w-full items-center gap-3 p-3.5 text-left active:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground">{st.label}</h4>
                              <p className="text-[10px] text-muted-foreground">{st.options.length} options</p>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border">
                              {st.options.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    setSelectedOption(option);
                                    setModalStep(2);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border last:border-b-0 active:bg-muted/50 transition-colors"
                                >
                                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                                  <p className="text-xs font-semibold text-foreground">{option.label}</p>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Step 2: Details */}
              {modalStep === 2 && selectedOption && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{selectedOption.label}</h4>
                      <p className="text-[10px] text-muted-foreground capitalize">{activeCategoryId} Service</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Service Price (£)</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                      <PoundSterling className="h-5 w-5 text-muted-foreground" />
                      <input
                        type="number"
                        placeholder="e.g. 65"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Estimated Duration</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. 1-2 hours"
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
                    Confirm & Add Service
                  </button>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </MobileLayout>
  );
};

export default TraderServicesPage;
