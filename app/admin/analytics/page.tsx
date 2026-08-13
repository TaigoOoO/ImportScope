import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/admin/charts/funnel-chart";
import { PeakHoursChart } from "@/components/admin/charts/peak-hours-chart";
import { KpiCard } from "@/components/admin/kpi-card";
import { formatBRL, formatPercent } from "@/lib/utils";
import { calcularKpisGerais } from "@/lib/admin-stats";
import {
  calcularFunil,
  calcularCohortAtivacao,
  calcularLtvEstimado,
  calcularTopProdutos,
  calcularHorariosPico,
} from "@/lib/admin-analytics";
import { DollarSign, Target } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const kpisGerais = await calcularKpisGerais();

  const [funil, cohorts, ltv, topProdutos, horarios] = await Promise.all([
    calcularFunil(),
    calcularCohortAtivacao(8),
    calcularLtvEstimado(kpisGerais.churnRatePct),
    calcularTopProdutos(10),
    calcularHorariosPico(),
  ]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Analytics</h1>
        <p className="text-sm text-foreground-tertiary">Funil, retenção, LTV e comportamento de uso.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="LTV estimado" value={ltv.ltvBRL !== null ? formatBRL(ltv.ltvBRL) : "—"} icon={DollarSign} color="#10B981" />
        <KpiCard label="ARPU (Pro)" value={formatBRL(ltv.arpuBRL)} icon={DollarSign} color="#3B82F6" />
        <KpiCard label="CAC" value="—" icon={Target} color="#64748B" />
      </div>
      <p className="-mt-4 text-xs text-foreground-tertiary">
        CAC não é calculado — nenhuma integração de custo de mídia/ads está configurada neste
        projeto. LTV é estimado por ARPU ÷ churn (fórmula padrão de SaaS), não um valor observado
        diretamente.
      </p>

      <FunnelChart etapas={funil} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ativação por cohort semanal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              {cohorts.map((c) => (
                <div key={c.semana} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground-tertiary">Semana de {c.semana}</span>
                  <span className="text-foreground-secondary">
                    {c.ativados}/{c.cadastrados} cadastrados
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {formatPercent(c.taxaAtivacaoPct, 0)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground-tertiary">
              "Ativado" = gerou ao menos 1 oportunidade após o cadastro.
            </p>
          </CardContent>
        </Card>

        <PeakHoursChart horarios={horarios} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 produtos mais gerados</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col divide-y divide-border">
            {topProdutos.map((p, i) => (
              <div key={p.nome} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground-secondary">
                  <span className="mr-2 font-mono text-foreground-tertiary">{i + 1}.</span>
                  {p.nome}
                </span>
                <span className="font-mono font-medium text-foreground">{p.quantidade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
