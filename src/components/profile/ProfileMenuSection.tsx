import {
  CreditCard, Bell, Wrench,
  HelpCircle, FileText, Lock, ChevronRight, Bookmark,
  Globe, MessageSquare, Landmark, ShieldCheck, PoundSterling,
  Building2, Receipt, Users, Banknote, AlertTriangle, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: any;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  route?: string;
  onClick?: () => void;
}

/* Customer menu removed - strictly trader flow only */


const individualTraderMenuGroups: MenuGroup[] = [
  {
    title: "Account",
    items: [
      { icon: Lock, label: "Password & Security", subtitle: "Change password, 2FA", route: "/profile/security" },
    ],
  },
  {
    title: "Personal",
    items: [
      { icon: Building2, label: "Personal Details", subtitle: "Name, phone, date of birth", route: "/profile/details" },
      { icon: Wrench, label: "My Services", subtitle: "Services you offer and prices", route: "/trader/services" },
      { icon: Bookmark, label: "Saved Items", subtitle: "Jobs and traders you've saved", route: "/profile/saved-items" },
      { icon: ShieldCheck, label: "Verification & Documents", subtitle: "ID, right to work, certificates", route: "/profile/verification", badge: "1 Pending", badgeColor: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
    ],
  },
  {
    title: "Addresses",
    items: [
      { icon: Globe, label: "My Addresses", subtitle: "Home, work, and service area", route: "/profile/address" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: Landmark, label: "Bank Account", subtitle: "Where your earnings are paid", route: "/profile/payouts" },
      { icon: PoundSterling, label: "Earnings", subtitle: "View your income history", route: "/trader/earnings" },
      { icon: Banknote, label: "Payslips", subtitle: "Payslips from agencies you work with", route: "/trader/paychecks" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", subtitle: "Push, email, and SMS preferences", route: "/profile/notifications" },
      { icon: Globe, label: "Language & Region", subtitle: "English · Netherlands", route: "/profile/language" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Centre", subtitle: "FAQs and contact support", route: "/profile/help" },
      { icon: MessageSquare, label: "Give Feedback", subtitle: "Help us improve truFindo", route: "/profile/feedback" },
      { icon: FileText, label: "Legal", subtitle: "Terms, privacy policy, licences", route: "/profile/legal" },
    ],
  },
];

const agencyTraderMenuGroups: MenuGroup[] = [
  {
    title: "Company",
    items: [
      { icon: Building2, label: "Company Details", subtitle: "Business name, address, registration", route: "/profile/details" },
      { icon: Wrench, label: "Company Services", subtitle: "Services your agency offers and prices", route: "/trader/services" },
      { icon: ShieldCheck, label: "Company Documents", subtitle: "Licences, insurance, certificates", route: "/profile/verification", badge: "1 Expiring", badgeColor: "bg-destructive/10 text-destructive" },
    ],
  },
  {
    title: "Tax & Compliance",
    items: [
      { icon: Receipt, label: "Tax Information", subtitle: "VAT/GST number, tax registration", route: "/profile/tax" },
      { icon: FileText, label: "Legal & Policies", subtitle: "Terms, privacy policy, licences", route: "/profile/legal" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: Landmark, label: "Company Bank Account", subtitle: "Where your income is received", route: "/profile/payouts" },
      { icon: PoundSterling, label: "Revenue & Earnings", subtitle: "View income history and reports", route: "/trader/earnings" },
      { icon: Banknote, label: "Worker Payouts", subtitle: "Track payments made to workers", route: "/trader/paychecks" },
    ],
  },
  {
    title: "Account & Security",
    items: [
      { icon: Lock, label: "Password & Security", subtitle: "Change password, 2FA", route: "/profile/security" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", subtitle: "Push, email, and SMS preferences", route: "/profile/notifications" },
      { icon: Globe, label: "Language & Region", subtitle: "English · Netherlands", route: "/profile/language" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Centre", subtitle: "FAQs and contact support", route: "/profile/help" },
      { icon: MessageSquare, label: "Give Feedback", subtitle: "Help us improve truFindo", route: "/profile/feedback" },
    ],
  },
];

interface ProfileMenuSectionProps {
  profile: any;
}

const ProfileMenuSection = ({ profile }: ProfileMenuSectionProps) => {
  const navigate = useNavigate();
  const isAgency = profile?.trader_type === "agency";
  const menuGroups = isAgency ? agencyTraderMenuGroups : individualTraderMenuGroups;


  return (
    <div className="flex flex-col gap-4">
      {menuGroups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </h3>
          <div className="rounded-2xl bg-card card-shadow overflow-hidden">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => item.route && navigate(item.route)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/60 ${
                    i < group.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileMenuSection;
