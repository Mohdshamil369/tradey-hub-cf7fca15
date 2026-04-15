import { createPortal } from "react-dom";
import { ReactNode, useEffect, useState } from "react";

/**
 * Renders children into #mobile-device-content via a React portal,
 * so absolutely-positioned overlays stay confined to the device mockup.
 */
const DevicePortal = ({ children }: { children: ReactNode }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("mobile-device-content");
    setContainer(el);
  }, []);

  if (!container) return null;
  return createPortal(children, container);
};

export default DevicePortal;
