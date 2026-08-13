"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Cpu, Home, Shirt, Wrench, Dumbbell, Package, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { BadgeRisk } from "@/components/shared/badge-risk";
import { BadgeMargin } from "@/components/shared/badge-margin";
import { PriceDisplay } from "@/components/shared/price-display";
import type { Oportunidade } from "@/types";

const ICONE_POR_CATEGORIA: Record<string, LucideIcon> = {
  Eletrônicos: Cpu,
  Casa: Home,
  Moda: Shirt,
  Ferramentas: Wrench,
  Esporte: Dumbbell,
};

interface OpportunityCardProps {
  oportunidade: Oportunidade;
  onVerDetalhes: (oportunidade: Oportunidade) => void;
  compact?: boolean;
}

export function OpportunityCard({ oportunidade, onVerDetalhes, compact = false }: OpportunityCardProps) {
  const Icone = ICONE_POR_CATEGORIA[oportunidade.categoria] ?? Package;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group h-full"
    >
      <Card className="relative flex h-full flex-col overflow-hidden p-0 transition-shadow duration-300 group-hover:shadow-elevated group-hover:border-primary/30">
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-card-highlight opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* "Radar passando": linha de scan varrendo o card no hover */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* "Sinal forte detectado": glow no canto para oportunidades quentes */}
        {oportunidade.margemEstimada > 60 && (
          <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/25 blur-2xl" />
        )}

        <div className="relative h-[180px] w-full bg-gradient-to-br from-background-elevated to-background-card">
          <div className="flex h-full w-full items-center justify-center">
            <Icone className="h-12 w-12 text-border-active" strokeWidth={1.5} />
          </div>
          <span className="absolute right-3 top-3 rounded-pill bg-black/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
            {oportunidade.categoria}
          </span>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-center">
                Esta análise é gerada por inteligência artificial e não substitui consultoria
                profissional.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="line-clamp-2 text-card-title text-foreground">{oportunidade.nome}</h3>
            <p className="mt-0.5 text-[13px] text-foreground-tertiary">{oportunidade.fornecedor}</p>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] uppercase text-foreground-tertiary">Custo FOB</p>
              <PriceDisplay value={oportunidade.precoFOB} currency="USD" size="sm" className="text-lg" />
            </div>
            <div>
              <p className="text-[11px] uppercase text-foreground-tertiary">Preço ML BR</p>
              <PriceDisplay value={oportunidade.precoMLBR} size="sm" accent className="text-lg" />
            </div>
          </div>

          {!compact && (
            <div className="flex items-center justify-between pt-1">
              <BadgeMargin margem={oportunidade.margemEstimada} />
              <div className="flex items-center gap-1.5">
                {oportunidade.alertas.length > 0 && (
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                )}
                <BadgeRisk risco={oportunidade.risco} />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            variant="secondary"
            className="w-full hover:border-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => onVerDetalhes(oportunidade)}
          >
            Abrir Análise
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
