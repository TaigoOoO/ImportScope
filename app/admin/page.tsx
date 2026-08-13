import { Users, Crown, DollarSign, Package, TrendingUp, UserMinus } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { RevenueChart } from "@/components/admin/charts/revenue-chart";
import { NewUsersLineChart, CategoriaBarChart, PlanosPieChart } from "@/components/admin/charts/overview-charts";
import { formatBRL, formatPercent } from "@/lib/utils";
import {
  calcularKpisGerais,
  calcularNovosUsuariosPorDia,
  calcularReceitaAcumulada,
  calcularOportunidadesPorCategoria,
  calcularDistribuicaoPlanos,
} from "@/lib/admin-stats";

export default async function AdminOverviewPage() {
  const [kpis, novosUsuarios, receita, categorias, planos] = await Promise.all([
    calcularKpisGerais(),
    calcularNovosUsuariosPorDia(30),
    calcularReceitaAcumulada(30),
    calcularOportunidadesPorCategoria(),
    calcularDistribuicaoPlanos(),
  ]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Overview</h1>
        <p className="text-sm text-foreground-tertiary">Métricas gerais do ImportScope.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Total de usuários"
          value={kpis.totalUsuarios.toLocaleString("pt-BR")}
          icon={Users}
          color="#3B82F6"
          variacaoPct={kpis.totalUsuariosVariacaoPct}
        />
        <KpiCard label="Usuários Pro ativos" value={kpis.usuariosProAtivos.toLocaleString("pt-BR")} icon={Crown} color="#F97316" />
        <KpiCard label="MRR" value={formatBRL(kpis.mrrBRL)} icon={DollarSign} color="#10B981" />
        <KpiCard
          label="Oportunidades (hoje / semana / mês)"
          value={`${kpis.oportunidadesHoje} / ${kpis.oportunidadesSemana} / ${kpis.oportunidadesMes}`}
          icon={Package}
          color="#06B6D4"
        />
        <KpiCard label="Conversão Free → Pro" value={formatPercent(kpis.taxaConversaoPct)} icon={TrendingUp} color="#F97316" />
        <KpiCard
          label="Churn (30 dias)"
          value={kpis.churnRatePct !== null ? formatPercent(kpis.churnRatePct) : "—"}
          icon={UserMinus}
          color="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NewUsersLineChart pontos={novosUsuarios} />
        <RevenueChart pontos={receita} />
        <CategoriaBarChart fatias={categorias} />
        <PlanosPieChart distribuicao={planos} />
      </div>
    </div>
  );
}
