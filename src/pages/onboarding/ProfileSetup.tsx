import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, User, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [street, setStreet] = useState(profile?.street || "");
  const [city, setCity] = useState(profile?.city || "");
  const [postcode, setPostcode] = useState(profile?.postcode || "");
  const [dob, setDob] = useState(profile?.date_of_birth || "");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !city.trim() || !postcode.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }
    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      date_of_birth: dob || null,
      onboarding_status: "completed",
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong");
    } else {
      await refreshProfile();
      toast.success("Profile created!");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="relative mx-auto w-full max-w-[390px] h-[844px] rounded-[3rem] border-[6px] border-foreground/90 bg-background shadow-2xl overflow-hidden">
        <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2">
          <div className="h-[34px] w-[126px] rounded-b-[1.2rem] bg-foreground/90" />
        </div>
        <div className="flex h-full flex-col px-6 pt-14">
          <button onClick={() => navigate("/onboarding/role")} className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="mb-1 text-2xl font-bold text-foreground font-heading">Your Details</h1>
          <p className="mb-2 text-sm text-muted-foreground">Fill in your personal details</p>
          <div className="mb-8 flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Full name *</label>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 px-4 py-3.5 ring-1 ring-primary/20">
                <User className="h-5 w-5 text-primary" />
                <input type="text" placeholder="Enter your legal full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground font-medium" />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-primary/80">
                <ShieldCheck className="h-3.5 w-3.5" />
                Required for legal verification — please ensure this matches your official ID
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date of birth</label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Street + house number</label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input type="text" placeholder="123 Main Street" value={street} onChange={(e) => setStreet(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Postcode *</label>
                <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3.5">
                  <input type="text" placeholder="SW1A 1AA" value={postcode} onChange={(e) => setPostcode(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">City *</label>
                <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3.5">
                  <input type="text" placeholder="London" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
              </div>
            </div>
          </form>
          <div className="pb-12">
            <button onClick={handleSubmit as any} disabled={loading}
              className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
};

export default ProfileSetup;
