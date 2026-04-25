import { Home, User, Briefcase, Users } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

// Customer navigation removed


const individualTraderNav = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Jobs", path: "/trader/jobs" },
  { icon: Users, label: "Groups", path: "/trader/groups" },
  { icon: User, label: "Settings", path: "/profile" },
];

const agencyTraderNav = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Jobs", path: "/trader/jobs" },
  { icon: Users, label: "Groups", path: "/trader/groups" },
  { icon: User, label: "Settings", path: "/profile" },
];

const BottomNav = ({ role, traderType }: { role?: "customer" | "trader"; traderType?: "individual" | "agency" | null }) => {
  const { pathname } = useLocation();
  const navItems = traderType === "agency" ? agencyTraderNav : individualTraderNav;


  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/80 backdrop-blur-xl px-2 pb-7 pt-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = pathname === path || (path !== "/" && pathname.startsWith(path + "/"));
          const isHome = path === "/" && pathname === "/";
          const isActive = active || isHome;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                isActive ? "bg-primary/10" : ""
              }`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={isActive ? "font-semibold" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
