"use client";

import { useState } from "react";
import { OpportunityCard } from "@/components/oportunidades/opportunity-card";
import { OpportunityModal } from "@/components/oportunidades/opportunity-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { OpportunityGridSkeleton } from "@/components/shared/loading-skeleton";
import type { Oportunidade } from "@/types";

interface OpportunityGridProps {
  oportunidades: Oportunidade[];
  loading?: boolean;
  compact?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function OpportunityGrid({
  oportunidades,
  loading = false,
  compact = false,
  emptyTitle = "Nenhuma oportunidade ainda",
  emptyDescription = 'Clique em "Escanear Mercado" para começar',
  emptyActionLabel,
  onEmptyAction,
}: OpportunityGridProps) {
  const [selecionada, setSelecionada] = useState<Oportunidade | null>(null);

  if (loading) {
    return <OpportunityGridSkeleton />;
  }

  if (oportunidades.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {oportunidades.map((oportunidade) => (
          <OpportunityCard
            key={oportunidade.id}
            oportunidade={oportunidade}
            onVerDetalhes={setSelecionada}
            compact={compact}
          />
        ))}
      </div>
      <OpportunityModal
        oportunidade={selecionada}
        onOpenChange={(open) => !open && setSelecionada(null)}
      />
    </>
  );
}
