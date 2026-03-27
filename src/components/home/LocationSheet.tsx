import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, LocateFixed, Plus, Home, Building2, MoreVertical, Check } from "lucide-react";
import { useAddressStore, SavedAddress } from "@/stores/addressStore";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface LocationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconForLabel = (label: string) => {
  switch (label) {
    case "Home": return Home;
    case "Office": return Building2;
    default: return MapPin;
  }
};

const LocationSheet = ({ open, onOpenChange }: LocationSheetProps) => {
  const navigate = useNavigate();
  const { addresses, setDefault } = useAddressStore();
  const [searchQuery, setSearchQuery] = useState("");
  const defaultAddress = addresses.find((a) => a.isDefault);

  const filteredAddresses = addresses.filter(
    (a) =>
      a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAddress = (addr: SavedAddress) => {
    setDefault(addr.id);
    toast.success(`Location set to ${addr.label}`);
    onOpenChange(false);
  };

  const handleUseCurrentLocation = () => {
    toast.success("Using current location");
    onOpenChange(false);
  };

  const handleAddNew = () => {
    onOpenChange(false);
    navigate("/profile/address");
  };

  const handleEditServiceArea = () => {
    onOpenChange(false);
    navigate("/profile/service-area");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8 max-h-[85vh]">
        <SheetHeader className="px-5 pb-4">
          <SheetTitle className="text-left text-lg font-bold font-heading">
            Choose your location
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Search */}
          <div className="px-5">
            <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search for area, landmark"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-5 flex flex-col gap-1">
            <button
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-3 py-3 transition-colors active:opacity-70"
            >
              <LocateFixed className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Use current location</span>
            </button>

            <div className="h-px bg-border" />

            <button
              onClick={handleAddNew}
              className="flex items-center gap-3 py-3 transition-colors active:opacity-70"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Add new address</span>
            </button>

            <div className="h-px bg-border" />

            <button
              onClick={handleEditServiceArea}
              className="flex items-center gap-3 py-3 transition-colors active:opacity-70"
            >
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Edit service area</span>
            </button>
          </div>

          {/* Saved addresses */}
          {filteredAddresses.length > 0 && (
            <div className="px-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Saved addresses</h3>
              <div className="rounded-2xl bg-card card-shadow overflow-hidden divide-y divide-border">
                {filteredAddresses.map((addr) => {
                  const Icon = iconForLabel(addr.label);
                  const isSelected = addr.isDefault;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className="flex items-center gap-3 w-full p-4 text-left transition-colors active:bg-accent/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{addr.label}</h4>
                          {isSelected && (
                            <span className="text-xs font-bold text-primary">Current Location</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {addr.street}, {addr.postcode} {addr.city}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationSheet;
