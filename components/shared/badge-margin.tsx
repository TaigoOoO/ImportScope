import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BadgeMarginProps {
  margem: number;
  className?: string;
  showFireBadge?: boolean;
}

function corPorMargem(margem: number): string {
  if (margem > 60) return "text-success";
  if (margem >= 40) return "text-warning";
  return "text-danger";
}

export function BadgeMargin({ margem, className, showFireBadge = true }: BadgeMarginProps) {
  const quente = margem > 60;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-sm font-semibold", corPorMargem(margem))}>
        Margem: {formatPercent(margem, 0)}
      </span>
      {quente && showFireBadge && <Badge variant="fire">🔥 Oportunidade</Badge>}
    </div>
  );
}
