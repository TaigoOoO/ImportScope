import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  variacaoPct?: number | null;
}

export function KpiCard({ label, value, icon: Icon, color = "#F97316", variacaoPct }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          {variacaoPct !== undefined && variacaoPct !== null && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                variacaoPct >= 0 ? "text-success" : "text-danger"
              )}
            >
              {variacaoPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(variacaoPct).toFixed(1)}%
            </span>
          )}
        </div>
        <p className="text-caption uppercase text-foreground-tertiary">{label}</p>
        <p className="font-mono text-number-card text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
