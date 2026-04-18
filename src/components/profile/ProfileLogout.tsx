import { LogOut, ShieldAlert, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileLogoutProps {
  onLogout: () => void;
}

const ProfileLogout = ({ onLogout }: ProfileLogoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="mt-5 flex flex-col gap-3">
      {/* Manage Account & Activity */}
      <button
        onClick={() => navigate("/profile/manage-account")}
        className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-left card-shadow transition-colors active:bg-muted/60"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Manage Account & Activity</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Deactivate, delete, erase data, log out everywhere
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive py-3.5 font-semibold text-destructive-foreground transition-colors active:bg-destructive/90"
      >
        <LogOut className="h-4.5 w-4.5" />
        Log Out
      </button>
    </div>
  );
};

export default ProfileLogout;
