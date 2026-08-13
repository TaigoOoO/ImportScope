"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendsResultado } from "@/lib/integrations/google-trends";

function Sparkline({ valores }: { valores: number[] }) {
  if (valores.length < 2) return null;
  const max = Math.max(...valores, 1);
  const pontos = valores
    .map((v, i) => `${(i / (valores.length - 1)) * 100},${20 - (v / max) * 18}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 20" className="h-4 w-12" preserveAspectRatio="none">
      <polyline points={pontos} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function TrendsBadge({ keyword }: { keyword: string }) {
  const [dados, setDados] = useState<TrendsResultado | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/integrations/trends?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => ativo && setDados(data))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [keyword]);

  if (!dados || dados.fonte === "indisponivel" || dados.interestOverTime.length === 0) return null;

  return (
    <Badge
      variant={dados.trending ? "success" : "secondary"}
      className="gap-1.5"
      title="Interesse de busca no Google Trends (últimos 90 dias)"
    >
      {dados.trending && <TrendingUp className="h-3 w-3" />}
      <Sparkline valores={dados.interestOverTime.map((p) => p.value)} />
      {dados.trending && "Em alta"}
    </Badge>
  );
}
