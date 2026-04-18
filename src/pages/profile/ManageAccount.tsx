import { ArrowLeft, LogOut, Trash2, ShieldOff, Database, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileLayout from "@/components/layout/MobileLayout";

interface DangerAction {
  icon: any;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

const ManageAccount = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogoutAll = async () => {
    await signOut();
    toast.success("Logged out from all devices");
    navigate("/welcome");
  };

  const handleDeactivate = () => {
    toast("Account deactivation requested", { description: "We'll email you to confirm." });
  };

  const handleEraseData = () => {
    toast("Data erasure requested", { description: "Our team will process this within 30 days." });
  };

  const handleDelete = () => {
    toast.error("Account deletion requested", { description: "Check your email to confirm." });
  };

  const actions: DangerAction[] = [
    {
      icon: LogOut,
      title: "Log out from all devices",
      description: "Sign out of every active session across all devices.",
      buttonLabel: "Log out everywhere",
      onClick: handleLogoutAll,
    },
    {
      icon: Pause,
      title: "Deactivate account",
      description: "Temporarily disable your account. You can reactivate anytime by signing back in.",
      buttonLabel: "Deactivate account",
      onClick: handleDeactivate,
    },
    {
      icon: Database,
      title: "Erase my data",
      description: "Request permanent erasure of your personal data while keeping the account.",
      buttonLabel: "Erase data",
      onClick: handleEraseData,
    },
    {
      icon: Trash2,
      title: "Delete this account",
      description: "Once you delete your account, there is no going back. Please be certain.",
      buttonLabel: "Delete account",
      onClick: handleDelete,
    },
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Manage Account & Activity</h1>
      </div>

      <div className="px-4 pt-5 pb-8">
        <p className="mb-5 text-xs text-muted-foreground">
          Review activity and make critical decisions about your account. These actions can have permanent effects.
        </p>

        {/* Activity summary */}
        <div className="mb-6 rounded-2xl bg-card p-4 card-shadow">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Activity overview
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Active sessions", value: "2" },
              { label: "Devices", value: "3" },
              { label: "Last login", value: "Today" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-base font-bold text-foreground">{s.value}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/profile/security/sessions")}
            className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-semibold text-foreground transition-colors active:bg-muted"
          >
            View active sessions
          </button>
        </div>

        {/* Danger Zone */}
        <h2 className="mb-3 text-lg font-extrabold text-foreground">Danger Zone</h2>
        <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-card">
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <div
                key={a.title}
                className={`p-4 ${i < actions.length - 1 ? "border-b border-destructive/15" : ""}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{a.description}</p>
                <button
                  onClick={a.onClick}
                  className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive transition-colors active:bg-destructive/10"
                >
                  {a.buttonLabel}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Need help? Contact support before taking irreversible actions.
        </p>
      </div>
    </div>
  );
};

export default ManageAccount;
