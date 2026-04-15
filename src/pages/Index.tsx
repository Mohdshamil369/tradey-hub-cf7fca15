import MobileLayout from "@/components/layout/MobileLayout";
import HeroBanner from "@/components/home/HeroBanner";
import ServiceBundles from "@/components/home/ServiceBundles";
import SavedTradersList from "@/components/home/SavedTradersList";
import PopularServiceCard from "@/components/home/PopularServiceCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, ArrowRight, Bell, Search, MapPin, ChevronDown } from "lucide-react";
import { Wrench, Lightning, PaintBrush, Hammer, Broom, Snowflake, Bathtub, House, Clock, type Icon } from "@phosphor-icons/react";
import { catAServices } from "@/data/services";
import { useAddressStore } from "@/stores/addressStore";
import { serviceIconMap, iconMap, getCategoryColors, getServiceColors } from "@/lib/icons";
import { categoryImages } from "@/data/categoryImages";
import LocationSheet from "@/components/home/LocationSheet";
import { useState } from "react";

const topCategories: { id: string; label: string; icon: Icon }[] = [
  { id: "plumbing", label: "Plumbing", icon: Wrench },
  { id: "electrical", label: "Electrical", icon: Lightning },
  { id: "painting", label: "Painting", icon: PaintBrush },
  { id: "carpentry", label: "Carpentry", icon: Hammer },
  { id: "cleaning", label: "Cleaning", icon: Broom },
  { id: "hvac", label: "HVAC", icon: Snowflake },
  { id: "bathroom", label: "Bathroom", icon: Bathtub },
  { id: "roofing", label: "Roofing", icon: House },
];

const popularServices = catAServices.filter((s) => s.popular);

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addresses } = useAddressStore();
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <MobileLayout overlay={<LocationSheet open={locationOpen} onOpenChange={setLocationOpen} />}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-6">
        <div>
          <h1 className="text-xl font-bold text-foreground font-heading">
            tru<span className="text-primary">Findo</span>
          </h1>
          <button
            onClick={() => setLocationOpen(true)}
            className="flex items-center gap-1 mt-0.5 transition-all active:opacity-70"
          >
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              {defaultAddress
                ? `${defaultAddress.street}, ${defaultAddress.city}`
                : "Set your location"}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              3
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-6 pb-4">
        
        <HeroBanner />

        {/* Categories grid */}
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground font-heading">Categories</h3>
            <button onClick={() => navigate("/categories")} className="text-sm font-semibold text-primary">
              View all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topCategories.map((cat) => {
              const IconComponent = cat.icon;
              const colors = getCategoryColors(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/categories/${cat.id}`)}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 card-shadow transition-all hover:card-shadow-hover active:scale-95"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} bg-opacity-40`}>
                    <IconComponent size={24} weight="duotone" className={colors.color} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bundles */}
        <ServiceBundles />

        {/* Popular services */}
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground font-heading">Popular Services</h3>
            <button onClick={() => navigate("/services")} className="text-sm font-semibold text-primary">
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {popularServices.map((service) => {
              const iconName = serviceIconMap[service.id] || "wrench";
              const IconComponent = iconMap[iconName] || Wrench;
              const colors = getServiceColors(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(`/services/${service.id}/book`)}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow transition-all hover:card-shadow-hover active:scale-[0.98]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} bg-opacity-40`}>
                    <IconComponent size={24} weight="duotone" className={colors.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-foreground font-sans">{service.name}</h4>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">£{service.price}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} /> {service.duration}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Post a job promo */}
        <div className="px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 card-shadow">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary-foreground/10" />
            <div className="absolute -bottom-4 -right-2 h-20 w-20 rounded-full bg-primary-foreground/5" />
            <div className="relative z-10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-primary-foreground font-heading">
                Got a bigger project?
              </h3>
              <p className="mb-4 text-sm text-primary-foreground/80">
                Post a job and receive quotes from verified tradesmen in your area. Compare prices and pick the best fit.
              </p>
              <button
                onClick={() => navigate("/jobs/post")}
                className="flex items-center gap-2 rounded-xl bg-primary-foreground px-5 py-2.5 text-sm font-bold text-primary transition-transform active:scale-95"
              >
                Post a Job <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Saved Traders */}
        <SavedTradersList />
      </div>
    </MobileLayout>
  );
};

export default Index;
