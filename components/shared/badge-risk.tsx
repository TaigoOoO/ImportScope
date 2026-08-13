import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Risco } from "@/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<Risco, { label: string; icon: LucideIcon; className: string }> = {
  BAIXO: {
    label: "Risco Baixo",
    icon: ShieldCheck,
    className: "bg-success/10 text-success border-success/30",
  },
  MEDIO: {
    label: "Atenção",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  ALTO: {
    label: "Risco Alto",
    icon: ShieldAlert,
    className: "bg-danger/10 text-danger border-danger/30",
  },
};

interface BadgeRiskProps {
  risco: Risco;
  className?: string;
}

/**
 * Ícone sempre visível (ShieldCheck/AlertTriangle/ShieldAlert) — o cérebro
 * processa ícone+cor mais rápido que só texto. Trocou os rótulos com
 * emoji (🟢/🟡/🔴) por texto+ícone, por pedido explícito do refinamento
 * de UI; era assim que o v1 original especificava, então documentando a
 * mudança aqui.
 */
export function BadgeRisk({ risco, className }: BadgeRiskProps) {
  const config = CONFIG[risco] ?? CONFIG.MEDIO;
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, "gap-1.5 border", className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
