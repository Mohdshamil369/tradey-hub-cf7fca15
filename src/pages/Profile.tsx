import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMenuSection from "@/components/profile/ProfileMenuSection";
import ProfileLogout from "@/components/profile/ProfileLogout";
import ShareEarnCard from "@/components/profile/ShareEarnCard";

const Profile = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/welcome");
  };

  const isTrader = profile?.role === "trader";
  const isAgency = profile?.trader_type === "agency";

  return (
    <MobileLayout role="trader">
      <div className="px-4 pt-6 pb-8">
        <h1 className="mb-1 text-2xl font-extrabold text-foreground font-heading">
          {isAgency ? "Company Settings" : "Account Settings"}
        </h1>
        {isAgency ? (
          <p className="mb-6 text-xs text-muted-foreground">Manage your agency, compliance, and finances</p>
        ) : (
          <p className="mb-6 text-xs text-muted-foreground">Manage your profile, services, and preferences</p>
        )}

        {!isAgency && <div className="mb-8" />}

        <ProfileHeader profile={profile} onEditPress={() => navigate("/profile/details")} />

        <ShareEarnCard />

        <ProfileMenuSection profile={profile} />

        <ProfileLogout onLogout={handleLogout} />

        {/* App version */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          truFindo v1.0.0 · Made in 🇳🇱
        </p>
      </div>
    </MobileLayout>
  );
};

export default Profile;
