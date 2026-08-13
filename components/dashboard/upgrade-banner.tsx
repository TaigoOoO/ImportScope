"use client";

import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_PRECO_LABEL, TEXTOS } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics-client";

export function UpgradeBanner() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    trackEvent("upgrade_clicked", { origem: "upgrade_banner" });
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        trackEvent("checkout_initiated");
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-dashed border-primary bg-gradient-to-br from-primary/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Crown className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-foreground">{TEXTOS.upgradeTitulo}</p>
          <p className="text-sm text-foreground-secondary">{TEXTOS.upgradeTexto}</p>
        </div>
      </div>
      <Button onClick={handleUpgrade} disabled={loading} className="w-full shrink-0 sm:w-auto">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ativar Radar Pro — {PRO_PRECO_LABEL}
      </Button>
    </div>
  );
}
