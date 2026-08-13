"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics-client";

export function EventTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { page: pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
