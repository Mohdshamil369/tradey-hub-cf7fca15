import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Verification from "./pages/profile/Verification";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Services from "./pages/Services";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import BundleDetail from "./pages/BundleDetail";
import ServiceDetail from "./pages/ServiceDetail";
import BookService from "./pages/BookService";
import Address from "./pages/profile/Address";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import Bookings from "./pages/Bookings";
import Chat from "./pages/Chat";
import GroupConversationPage from "./pages/GroupConversation";
import Profile from "./pages/Profile";
import MyDetails from "./pages/profile/MyDetails";
import Security from "./pages/profile/Security";
import ChangePassword from "./pages/profile/ChangePassword";
import TwoFactorAuth from "./pages/profile/TwoFactorAuth";
import ActiveSessions from "./pages/profile/ActiveSessions";
import Payments from "./pages/profile/Payments";
import ProfilePlaceholder from "./pages/profile/ProfilePlaceholder";
import NotificationPreferences from "./pages/profile/NotificationPreferences";
import LanguageRegion from "./pages/profile/LanguageRegion";
import SavedTraders from "./pages/profile/SavedTraders";
import SavedItems from "./pages/profile/SavedItems";
import HelpCentre from "./pages/profile/HelpCentre";
import GiveFeedback from "./pages/profile/GiveFeedback";
import Legal from "./pages/profile/Legal";
import LegalDetail from "./pages/profile/LegalDetail";
import Notifications from "./pages/Notifications";
import Splash from "./pages/Splash";
import SearchPage from "./pages/Search";
import TraderProfile from "./pages/TraderProfile";
import TraderServicesPage from "./pages/TraderServices";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import RoleSelection from "./pages/onboarding/RoleSelection";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import TraderProfileSetup from "./pages/onboarding/TraderProfileSetup";
import TraderHome from "./pages/trader/TraderHome";
import TraderJobs from "./pages/trader/TraderJobs";
import JobDetail from "./pages/trader/JobDetail";
import TraderServicesManage from "./pages/trader/TraderServices";
import TraderEarnings from "./pages/trader/TraderEarnings";
import TraderTeams from "./pages/trader/TraderTeams";
import JobAssignment from "./pages/trader/JobAssignment";
import TeamPerformance from "./pages/trader/TeamPerformance";
import MemberTasks from "./pages/trader/MemberTasks";
import Paychecks from "./pages/trader/Paychecks";
import BasePayConfig from "./pages/trader/BasePayConfig";
import Groups from "./pages/trader/Groups";
import GroupDetail from "./pages/trader/GroupDetail";
import WorkerDetail from "./pages/trader/WorkerDetail";
import MemberPayouts from "./pages/trader/MemberPayouts";
import Payouts from "./pages/profile/Payouts";
import ReferFriends from "./pages/profile/ReferFriends";
import CompanyTax from "./pages/profile/CompanyTax";
import ServiceAreaSelection from "./pages/profile/ServiceAreaSelection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading, updateProfile, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/welcome" replace />;

  if (profile?.onboarding_status === "role_selection") {
    // Auto-assign trader role — platform is for service providers
    if (user) {
      updateProfile({ role: "trader", trader_type: "individual", onboarding_status: "profile_setup" }).then(() => {
        supabase.from("user_roles").upsert({ user_id: user.id, role: "trader" as const });
      });
    }
    return <Navigate to="/onboarding/trader-profile" replace />;
  }
  if (profile?.onboarding_status === "profile_setup") {
    return <Navigate to="/onboarding/trader-profile" replace />;
  }

  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/welcome" element={<Splash />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Onboarding */}
            <Route path="/onboarding/role" element={<Navigate to="/onboarding/trader-profile" replace />} />
            <Route path="/onboarding/profile" element={<Navigate to="/onboarding/trader-profile" replace />} />
            <Route path="/onboarding/trader-profile" element={<OnboardingRoute><TraderProfileSetup /></OnboardingRoute>} />

            {/* Protected app routes — role-based home */}
            <Route path="/" element={<ProtectedRoute><TraderHome /></ProtectedRoute>} />

            {/* Customer routes - Redirected to Trader counterparts */}
            <Route path="/search" element={<Navigate to="/" replace />} />
            <Route path="/services" element={<Navigate to="/trader/services" replace />} />
            <Route path="/services/:serviceId" element={<Navigate to="/trader/services" replace />} />
            <Route path="/services/:serviceId/book" element={<Navigate to="/trader/services" replace />} />
            <Route path="/categories" element={<Navigate to="/" replace />} />
            <Route path="/categories/:categoryId" element={<Navigate to="/" replace />} />
            <Route path="/bundles/:bundleId" element={<Navigate to="/" replace />} />
            <Route path="/traders/:traderId" element={<Navigate to="/" replace />} />
            <Route path="/traders/:traderId/services" element={<Navigate to="/" replace />} />
            <Route path="/jobs" element={<Navigate to="/trader/jobs" replace />} />
            <Route path="/jobs/post" element={<Navigate to="/" replace />} />
            <Route path="/bookings" element={<Navigate to="/trader/jobs" replace />} />


            {/* Trader routes */}
            <Route path="/trader/jobs" element={<ProtectedRoute><TraderJobs /></ProtectedRoute>} />
            <Route path="/trader/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/trader/services" element={<ProtectedRoute><TraderServicesManage /></ProtectedRoute>} />
            <Route path="/trader/earnings" element={<ProtectedRoute><TraderEarnings /></ProtectedRoute>} />
            <Route path="/trader/teams" element={<ProtectedRoute><TraderTeams /></ProtectedRoute>} />
            <Route path="/trader/assign-team" element={<ProtectedRoute><JobAssignment /></ProtectedRoute>} />
            <Route path="/trader/team-performance" element={<ProtectedRoute><TeamPerformance /></ProtectedRoute>} />
            <Route path="/trader/member-tasks" element={<ProtectedRoute><MemberTasks /></ProtectedRoute>} />
            <Route path="/trader/paychecks" element={<ProtectedRoute><Paychecks /></ProtectedRoute>} />
            <Route path="/trader/base-pay" element={<ProtectedRoute><BasePayConfig /></ProtectedRoute>} />
            <Route path="/trader/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/trader/groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
            <Route path="/trader/workers/:workerId" element={<ProtectedRoute><WorkerDetail /></ProtectedRoute>} />
            <Route path="/trader/member-payouts/:memberId" element={<ProtectedRoute><MemberPayouts /></ProtectedRoute>} />

            {/* Shared routes */}
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chat/group/:groupId" element={<ProtectedRoute><GroupConversationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/details" element={<ProtectedRoute><MyDetails /></ProtectedRoute>} />
            <Route path="/profile/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
            <Route path="/profile/service-area" element={<ProtectedRoute><ServiceAreaSelection /></ProtectedRoute>} />
            <Route path="/profile/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/profile/security/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/profile/security/2fa" element={<ProtectedRoute><TwoFactorAuth /></ProtectedRoute>} />
            <Route path="/profile/security/sessions" element={<ProtectedRoute><ActiveSessions /></ProtectedRoute>} />
            <Route path="/profile/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/profile/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
            <Route path="/profile/tax" element={<ProtectedRoute><CompanyTax /></ProtectedRoute>} />
            <Route path="/profile/notifications" element={<ProtectedRoute><NotificationPreferences /></ProtectedRoute>} />
            <Route path="/profile/language" element={<ProtectedRoute><LanguageRegion /></ProtectedRoute>} />
            <Route path="/profile/favourites" element={<ProtectedRoute><SavedTraders /></ProtectedRoute>} />
            <Route path="/profile/saved-items" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
            <Route path="/profile/refer" element={<ProtectedRoute><ReferFriends /></ProtectedRoute>} />
            <Route path="/profile/help" element={<ProtectedRoute><HelpCentre /></ProtectedRoute>} />
            <Route path="/profile/feedback" element={<ProtectedRoute><GiveFeedback /></ProtectedRoute>} />
            <Route path="/profile/legal" element={<ProtectedRoute><Legal /></ProtectedRoute>} />
            <Route path="/profile/legal/:section" element={<ProtectedRoute><LegalDetail /></ProtectedRoute>} />
            <Route path="/profile/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfilePlaceholder /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
