"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics-client";
import { haptic } from "@/lib/haptics";
import { toastConfig } from "@/lib/toast-config";
import type { Oportunidade } from "@/types";

interface GenerateButtonProps {
  isPro: boolean;
  restanteInicial?: number;
  limiteInicial?: number;
  categoria?: string;
  onGenerated: (oportunidade: Oportunidade) => void;
  onGeneratingChange?: (gerando: boolean) => void;
}

const LIMITE_PADRAO_FALLBACK = 2; // só usado antes do primeiro round-trip, se limiteInicial não vier

export function GenerateButton({
  isPro,
  restanteInicial,
  limiteInicial,
  onGenerated,
  onGeneratingChange,
  categoria,
}: GenerateButtonProps) {
  const [carregando, setCarregando] = useState(false);
  const [restante, setRestante] = useState<number | undefined>(
    isPro ? undefined : restanteInicial ?? limiteInicial ?? LIMITE_PADRAO_FALLBACK
  );
  const [limite, setLimite] = useState<number>(limiteInicial ?? LIMITE_PADRAO_FALLBACK);

  const esgotado = !isPro && restante !== undefined && restante <= 0;

  async function handleClick() {
    if (carregando || esgotado) return;
    setCarregando(true);
    onGeneratingChange?.(true);
    try {
      const res = await fetch("/api/gerar-oportunidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria: categoria && categoria !== "todas" ? categoria : undefined }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRestante(0);
        haptic("error");
        toastConfig.error(data.message ?? "Limite diário atingido.");
        return;
      }

      if (!res.ok) {
        haptic("error");
        toastConfig.error(data.error ?? "Erro ao gerar oportunidade.");
        return;
      }

      if (typeof data.usoRestante === "number") setRestante(data.usoRestante);
      if (typeof data.limiteDiario === "number") setLimite(data.limiteDiario);

      haptic("success");
      toastConfig.opportunity(data.oportunidade.nome, data.oportunidade.margemEstimada);
      trackEvent("opportunity_generated", {
        oportunidadeId: data.oportunidade?.id,
        categoria: data.oportunidade?.categoria,
        margem: data.oportunidade?.margemEstimada,
      });
      onGenerated(data.oportunidade);
    } catch {
      haptic("error");
      toastConfig.error("Erro de conexão ao gerar oportunidade.");
    } finally {
      setCarregando(false);
      onGeneratingChange?.(false);
    }
  }

  // Permite disparar a geração a partir de fora (atalho "N" e o comando
  // "Escanear Mercado" da palette, quando já estamos nesta página) sem
  // precisar de prop-drilling ou contexto — ver lib/keyboard-shortcuts.ts.
  useEffect(() => {
    window.addEventListener("generate-opportunity", handleClick);
    return () => window.removeEventListener("generate-opportunity", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando, esgotado, categoria]);

  return (
    <Button onClick={handleClick} disabled={carregando || esgotado} className="relative cursor-radar">
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : esgotado ? (
        <Lock className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {esgotado ? "Limite diário atingido" : "Escanear Mercado"}
      {!isPro && restante !== undefined && !esgotado && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[11px] font-semibold">
          {limite - restante}/{limite}
        </span>
      )}
    </Button>
  );
}
