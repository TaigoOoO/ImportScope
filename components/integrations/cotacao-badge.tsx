"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CotacaoResultado } from "@/lib/integrations/cotacao";

function formatarTempoRelativo(iso: string): string {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return "agora";
  if (minutos === 1) return "há 1 min";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  return `há ${horas}h`;
}

export function CotacaoBadge({ className }: { className?: string }) {
  const [cotacao, setCotacao] = useState<CotacaoResultado | null>(null);

  useEffect(() => {
    fetch("/api/integrations/cotacao")
      .then((res) => (res.ok ? res.json() : null))
      .then(setCotacao)
      .catch(() => {});
  }, []);

  if (!cotacao) return null;

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 font-mono text-[11px]", className)}
      title={cotacao.fonte === "fallback" ? "Cotação de referência (API do BCB indisponível)" : "Fonte: Banco Central"}
    >
      <RefreshCw className="h-3 w-3" />
      USD/BRL: R$ {cotacao.valor.toFixed(2)} ({formatarTempoRelativo(cotacao.atualizadoEm)})
    </Badge>
  );
}
