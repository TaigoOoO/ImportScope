"use client";

import { useCallback, useEffect, useState } from "react";
import { OpportunityFilters, type OpportunityFiltersValue } from "@/components/oportunidades/opportunity-filters";
import { OpportunityGrid } from "@/components/oportunidades/opportunity-grid";
import { GenerateButton } from "@/components/oportunidades/generate-button";
import { ScanningLoader } from "@/components/shared/scanning-loader";
import type { Oportunidade } from "@/types";

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [escaneando, setEscaneando] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [restanteInicial, setRestanteInicial] = useState<number | undefined>(undefined);
  const [limiteInicial, setLimiteInicial] = useState<number | undefined>(undefined);

  const [filtros, setFiltros] = useState<OpportunityFiltersValue>({
    categoria: "todas",
    risco: "todos",
    margemMinima: "",
  });

  const buscarOportunidades = useCallback(async () => {
    setCarregando(true);
    const params = new URLSearchParams();
    if (filtros.categoria !== "todas") params.set("categoria", filtros.categoria);
    if (filtros.risco !== "todos") params.set("risco", filtros.risco);
    if (filtros.margemMinima) params.set("margemMinima", filtros.margemMinima);

    try {
      const res = await fetch(`/api/oportunidades?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOportunidades(data.oportunidades ?? []);
      }
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    buscarOportunidades();
  }, [buscarOportunidades]);

  useEffect(() => {
    fetch("/api/oportunidades/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsPro(data.isPro);
          setRestanteInicial(data.usoRestante);
          setLimiteInicial(data.limite);
        }
      })
      .catch(() => {});
  }, []);

  function handleGenerated(nova: Oportunidade) {
    setOportunidades((prev) => [nova, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section text-foreground">Oportunidades</h1>
          <p className="text-sm text-foreground-tertiary">
            Explore produtos analisados por IA com custo, margem e risco.
          </p>
        </div>
        <GenerateButton
          isPro={isPro}
          restanteInicial={restanteInicial}
          limiteInicial={limiteInicial}
          categoria={filtros.categoria}
          onGenerated={handleGenerated}
          onGeneratingChange={setEscaneando}
        />
      </div>

      <OpportunityFilters value={filtros} onChange={setFiltros} />

      {escaneando ? (
        <ScanningLoader />
      ) : (
        <OpportunityGrid
          oportunidades={oportunidades}
          loading={carregando}
          emptyDescription="Nenhuma oportunidade encontrada com esses filtros."
        />
      )}
    </div>
  );
}
