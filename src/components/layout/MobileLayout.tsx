import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";

export interface MobileLayoutProps {
  children: ReactNode;
  role?: "customer" | "trader";
  hideNav?: boolean;
  overlay?: ReactNode;
}

const MobileLayout = ({ children, role, hideNav = false, overlay }: MobileLayoutProps) => {
  const { profile } = useAuth();
  const effectiveRole = "trader";
  const traderType = profile?.trader_type ?? "individual";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="relative mx-auto w-full max-w-[390px] h-[844px] rounded-[3rem] border-[6px] border-foreground/90 bg-background shadow-2xl overflow-hidden">
        <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2">
          <div className="h-[34px] w-[126px] rounded-b-[1.2rem] bg-foreground/90" />
        </div>
        <div id="mobile-device-content" className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem]" style={{ transform: "translateZ(0)", isolation: "isolate" }}>
          <main className={`flex-1 overflow-y-auto ${hideNav ? 'pb-2' : 'pb-28'} pt-2`}>
            {children}
          </main>
          {!hideNav && <BottomNav role={effectiveRole} traderType={traderType} />}
          {/* Overlay slot — renders above everything, inside the device frame */}
          {overlay}
        </div>
        <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
};

export default MobileLayout;
