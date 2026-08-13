import { CREDITOS_POR_RECOMPENSA } from "@/lib/referral";
import type { ProgressoRecompensa } from "@/lib/referral";
import { Gift } from "lucide-react";

interface ReferralProgressProps {
  progresso: ProgressoRecompensa;
}

const RAIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export function ReferralProgress({ progresso }: ReferralProgressProps) {
  const creditosNoCicloAtual = progresso.creditos % CREDITOS_POR_RECOMPENSA;
  const fracao = creditosNoCicloAtual / CREDITOS_POR_RECOMPENSA;
  const offset = CIRCUNFERENCIA * (1 - fracao);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={RAIO} fill="none" stroke="#1E293B" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={RAIO}
            fill="none"
            stroke="#F97316"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {progresso.recompensasDisponiveis > 0 ? (
            <Gift className="h-6 w-6 text-primary" />
          ) : (
            <span className="font-mono text-xl font-bold text-foreground">
              {creditosNoCicloAtual}/{CREDITOS_POR_RECOMPENSA}
            </span>
          )}
        </div>
      </div>
      <p className="text-center text-sm text-foreground-secondary">
        {progresso.recompensasDisponiveis > 0
          ? `Você tem ${progresso.recompensasDisponiveis} mês${progresso.recompensasDisponiveis > 1 ? "es" : ""} grátis para resgatar!`
          : `Indique mais ${progresso.creditosParaProxima || CREDITOS_POR_RECOMPENSA} amigo(s) Pro e ganhe 1 mês grátis`}
      </p>
    </div>
  );
}
