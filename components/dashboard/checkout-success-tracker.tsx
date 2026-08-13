"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics-client";

export function CheckoutSuccessTracker() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "success") {
      trackEvent("checkout_completed");
      toast.success("Assinatura Pro ativada! 🎉");
      // Limpa a query string para não disparar de novo num refresh.
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
