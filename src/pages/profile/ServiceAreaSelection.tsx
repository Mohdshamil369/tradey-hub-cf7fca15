import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Check, X, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";

// Districts grouped by state/province
const stateDistricts: Record<string, string[]> = {
  "North Holland": [
    "Amsterdam Centrum", "De Pijp", "Jordaan", "Oud-West", "Westerpark",
    "Oost", "Noord", "Slotervaart", "Osdorp", "Watergraafsmeer",
    "Haarlem", "Zaandam", "Hilversum", "Alkmaar"
  ],
  "South Holland": [
    "Rotterdam Centrum", "Delfshaven", "Feijenoord", "Kralingen",
    "The Hague Centrum", "Scheveningen", "Delft", "Leiden", "Dordrecht"
  ],
  "Utrecht": [
    "Utrecht Centrum", "Leidsche Rijn", "Overvecht", "Vleuten",
    "Nieuwegein", "Amersfoort", "Zeist"
  ],
  "Flevoland": [
    "Almere Centrum", "Almere Buiten", "Lelystad"
  ],
};

const ServiceAreaSelection = () => {
  const navigate = useNavigate();
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["Amsterdam Centrum", "De Pijp"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStates, setExpandedStates] = useState<string[]>(["North Holland"]);

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const toggleState = (state: string) => {
    setExpandedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const toggleAllInState = (state: string) => {
    const districts = stateDistricts[state];
    const allSelected = districts.every((d) => selectedDistricts.includes(d));
    if (allSelected) {
      setSelectedDistricts((prev) => prev.filter((d) => !districts.includes(d)));
    } else {
      setSelectedDistricts((prev) => [...new Set([...prev, ...districts])]);
    }
  };

  const getStateSelectionCount = (state: string) => {
    const districts = stateDistricts[state];
    return districts.filter((d) => selectedDistricts.includes(d)).length;
  };

  const handleSave = () => {
    toast.success("Service area updated successfully! ✅");
    navigate(-1);
  };

  // Filter by search
  const filteredStates = Object.entries(stateDistricts)
    .map(([state, districts]) => ({
      state,
      districts: searchQuery
        ? districts.filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
        : districts,
    }))
    .filter((s) => s.districts.length > 0);

  return (
    <MobileLayout role="trader">
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 pt-6 pb-4 bg-background/95 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground font-heading">Service Area</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted border-none text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Selected chips */}
        {selectedDistricts.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs font-bold text-muted-foreground mb-2">
              {selectedDistricts.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDistricts.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold animate-in zoom-in-95 duration-200"
                >
                  {d}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleDistrict(d)} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* States + Districts */}
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="space-y-3">
            {filteredStates.map(({ state, districts }) => {
              const isExpanded = expandedStates.includes(state) || searchQuery.length > 0;
              const selectedCount = getStateSelectionCount(state);
              const allSelected = districts.every((d) => selectedDistricts.includes(d));

              return (
                <div key={state} className="rounded-2xl border border-border bg-card overflow-hidden">
                  {/* State header */}
                  <button
                    onClick={() => toggleState(state)}
                    className="flex items-center justify-between w-full p-4 active:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{state}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedCount}/{stateDistricts[state].length} selected
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Select all */}
                      <button
                        onClick={() => toggleAllInState(state)}
                        className="flex items-center gap-3 w-full px-4 py-3 bg-accent/30 active:bg-accent/50 transition-colors"
                      >
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                            allSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {allSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          Select all {state} districts
                        </span>
                      </button>

                      {/* District list */}
                      <div className="divide-y divide-border">
                        {districts.map((district) => {
                          const isSelected = selectedDistricts.includes(district);
                          return (
                            <button
                              key={district}
                              onClick={() => toggleDistrict(district)}
                              className="flex items-center gap-3 w-full px-4 py-3.5 active:bg-accent/30 transition-colors"
                            >
                              <div
                                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground/40 bg-background"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className={`text-sm ${isSelected ? "font-semibold text-foreground" : "text-foreground"}`}>
                                {district}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
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
