import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Search, Check, X,
  Map as MapIcon, Navigation, CircleDot,
  LocateFixed, ChevronRight, Save
} from "lucide-react";
import { toast } from "sonner";

const districts = [
  "Amsterdam Centrum", "De Pijp", "Jordaan", "Oud-West", "Westerpark", 
  "Oost", "Rivierenbuurt", "Buitenveldert", "Amstelveen", "Noord",
  "Slotervaart", "Osdorp", "Geuzenveld-Slotermeer", "Watergraafsmeer"
];

const ServiceAreaSelection = () => {
  const navigate = useNavigate();
  const [selectionMode, setSelectionMode] = useState<"radius" | "districts">("radius");
  const [radius, setRadius] = useState(15);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["Amsterdam Centrum", "De Pijp"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district) 
        : [...prev, district]
    );
  };

  const handleSave = () => {
    toast.success("Service area updated successfully! ✅");
    navigate(-1);
  };

  const filteredDistricts = districts.filter(d => 
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout role="trader">
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 pt-6 pb-4 bg-background/95 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground font-heading">Service Area</h1>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 gap-1 rounded-2xl bg-muted">
            <button
              onClick={() => setSelectionMode("radius")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectionMode === "radius" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CircleDot className="h-3.5 w-3.5" />
              Radius
            </button>
            <button
              onClick={() => setSelectionMode("districts")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectionMode === "districts" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Districts
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 overflow-y-auto">
          {selectionMode === "radius" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="rounded-3xl bg-accent/30 p-6 border border-border/50 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Navigation className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Current Center</p>
                      <p className="text-xs text-muted-foreground">Amsterdam Centrum</p>
                    </div>
                  </div>
                  <button className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <LocateFixed className="h-3.5 w-3.5" />
                    Relocate
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Radius</p>
                    <p className="text-2xl font-black text-primary font-heading">{radius}<span className="text-sm font-bold ml-1">km</span></p>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>1km</span>
                    <span>25km</span>
                    <span>50km</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-card border border-border border-dashed text-center">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">Coverage View</h4>
                <p className="text-xs text-muted-foreground">You will receive job notifications within a {radius}km radius of Amsterdam Centrum.</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search districts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted border-none text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedDistricts.map(d => (
                  <span 
                    key={d}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold animate-in zoom-in-95 duration-200"
                  >
                    {d}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleDistrict(d)} />
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">Available Districts</p>
                <div className="grid grid-cols-1 gap-2">
                  {filteredDistricts.map(district => {
                    const isSelected = selectedDistricts.includes(district);
                    return (
                      <button
                        key={district}
                        onClick={() => toggleDistrict(district)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                          isSelected 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {district}
                        </span>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-background border-t border-border">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            <Save className="h-4 w-4" />
            Apply Service Area
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ServiceAreaSelection;
