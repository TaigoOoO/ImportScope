"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OpportunityCard } from "@/components/oportunidades/opportunity-card";
import { OpportunityModal } from "@/components/oportunidades/opportunity-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Oportunidade } from "@/types";

interface RecentOpportunitiesProps {
  oportunidades: Oportunidade[];
}

export function RecentOpportunities({ oportunidades }: RecentOpportunitiesProps) {
  const [selecionada, setSelecionada] = useState<Oportunidade | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title text-foreground">Oportunidades Recentes</h2>
        <Link
          href="/dashboard/oportunidades"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {oportunidades.length === 0 ? (
        <EmptyState
          title="Nenhuma oportunidade ainda"
          description='Clique em "Escanear Mercado" para começar'
        />
      ) : (
        <>
          <ScrollArea className="-mx-4 px-4 sm:hidden">
            <div className="flex gap-4 pb-2">
              {oportunidades.map((o) => (
                <div key={o.id} className="w-[260px] shrink-0">
                  <OpportunityCard oportunidade={o} onVerDetalhes={setSelecionada} compact />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-3">
            {oportunidades.map((o) => (
              <OpportunityCard key={o.id} oportunidade={o} onVerDetalhes={setSelecionada} />
            ))}
          </div>
        </>
      )}

      <OpportunityModal oportunidade={selecionada} onOpenChange={(open) => !open && setSelecionada(null)} />
    </section>
  );
}
