import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SocialSignInButtons from "@/components/auth/SocialSignInButtons";
import logo from "@/assets/logo.svg";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 1) return digits;
    if (digits.length <= 3) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
    if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3)}`;
    if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const getRawPhone = () => phone.replace(/\s/g, "");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = getRawPhone();
    if (raw.length < 9) {
      toast.error("Please enter a valid Dutch phone number");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("otp");
    toast.success("Verification code sent to +31 " + phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-signin-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-signin-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    const raw = getRawPhone();
    const fakeEmail = `+31${raw}@phone.trufindo.app`;
    const { error } = await signIn(fakeEmail, `phone_${raw}_otp`);
    setLoading(false);
    if (error) {
      toast.error("Account not found. Please sign up first.");
    } else {
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
          <button
            onClick={() => (step === "otp" ? setStep("phone") : navigate("/welcome"))}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>

          {step === "phone" ? (
            <>
              <div className="mb-5 flex items-center gap-2">
                <img src={logo} alt="truFindo" className="h-8 w-auto" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">trade</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-foreground font-heading">Welcome back</h1>
              <p className="mb-8 text-sm text-muted-foreground">Enter your phone number to sign in</p>

              <form onSubmit={handleSendOtp} className="flex flex-1 flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">+31</span>
                  <input
                    type="tel"
                    placeholder="6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={14}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </button>

                  <SocialSignInButtons />
                </div>
              </form>

              <div className="mt-auto pb-12">
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => navigate("/auth/signup")} className="font-bold text-primary">
                    Create an account
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-2xl font-bold text-foreground font-heading">Verify Phone</h1>
              <p className="mb-8 text-sm text-muted-foreground">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-foreground">+31 {phone}</span>
              </p>

              <div className="flex items-center justify-center gap-3 mb-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">For demo, enter any 6 digits</span>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-signin-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`h-14 w-11 rounded-xl border-2 bg-card text-center text-xl font-bold text-foreground outline-none transition-all ${
                      digit ? "border-primary" : "border-border"
                    } focus:border-primary`}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => toast.success("Code resent!")}
                  className="self-center text-sm font-semibold text-primary"
                >
                  Resend code
                </button>

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
};

export default SignIn;
