import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.svg";
import splashBg from "@/assets/splash-bg.svg";

const Splash = () => {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session && profile) {
      if (profile.onboarding_status === "completed") {
        navigate("/", { replace: true });
      } else if (profile.onboarding_status === "profile_setup") {
        navigate("/onboarding/profile", { replace: true });
      } else {
        navigate("/onboarding/role", { replace: true });
      }
    }
  }, [session, profile, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="relative mx-auto w-full max-w-[390px] h-[844px] rounded-[3rem] border-[6px] border-foreground/90 bg-background shadow-2xl overflow-hidden flex flex-col items-center justify-center">
          <img src={splashBg} alt="" className="absolute inset-0 h-full w-full object-cover pointer-events-none" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2">
          <div className="h-[34px] w-[126px] rounded-b-[1.2rem] bg-foreground/90" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-8 animate-fade-in">
          <div className="relative">
            <img src={logo} alt="truFindo" className="h-28 w-auto drop-shadow-lg" />
            <Sparkles
              className="absolute -top-2 -right-3 h-7 w-7 text-primary drop-shadow-md animate-pulse"
              fill="currentColor"
              strokeWidth={1.5}
            />
            <Sparkles
              className="absolute top-6 -left-4 h-4 w-4 text-primary/70 animate-pulse"
              style={{ animationDelay: "300ms" }}
              fill="currentColor"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">TRADER</span>

          <p className="text-center text-base text-muted-foreground leading-relaxed">
            The trusted way to find your tradesman.
          </p>
        </div>

        <div className="absolute bottom-16 left-0 right-0 flex flex-col gap-3 px-8">
          <button
            onClick={() => navigate("/auth/signin")}
            className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98]">
            Get Started 
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>);

};

export default Splash;