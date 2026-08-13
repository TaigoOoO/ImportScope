import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isPro } from "@/lib/auth";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentOpportunities } from "@/components/dashboard/recent-opportunities";
import { ActivityChart, type AtividadePonto } from "@/components/dashboard/activity-chart";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { CheckoutSuccessTracker } from "@/components/dashboard/checkout-success-tracker";
import { Button } from "@/components/ui/button";
import type { Oportunidade } from "@/types";
import { ArrowRight } from "lucide-react";

function agruparPorDia(datas: Date[]): AtividadePonto[] {
  const hoje = new Date();
  const buckets = new Map<string, number>();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const chave = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    buckets.set(chave, 0);
  }

  for (const data of datas) {
    const chave = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (buckets.has(chave)) {
      buckets.set(chave, (buckets.get(chave) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([data, oportunidades]) => ({ data, oportunidades }));
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const pro = isPro(user);

  const [oportunidades, total, riscoAlto, ultimasDatas] = await Promise.all([
    prisma.oportunidade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.oportunidade.count({ where: { userId: user.id } }),
    prisma.oportunidade.count({ where: { userId: user.id, risco: "ALTO" } }),
    prisma.oportunidade.findMany({
      where: { userId: user.id },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const margemMedia =
    oportunidades.length > 0
      ? oportunidades.reduce((acc, o) => acc + o.margemEstimada, 0) / oportunidades.length
      : 0;

  const economiaEstimadaBRL = oportunidades.reduce(
    (acc, o) => acc + Math.max(0, o.precoVendaSugerido - o.custoTotalBRL),
    0
  );

  const primeiroNome = user.name ?? user.email.split("@")[0];
  const pontosAtividade = agruparPorDia(ultimasDatas.map((o) => o.createdAt));

  return (
    <div className="flex flex-col gap-6 py-4">
      <CheckoutSuccessTracker />
      <div className="rounded-card bg-gradient-bg-radial p-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Radar ativado, {primeiroNome}
        </h1>
        <p className="mt-1 text-foreground-secondary">
          Você tem {total} oportunidade{total === 1 ? "" : "s"} analisada{total === 1 ? "" : "s"}
          {riscoAlto > 0 && <> e {riscoAlto} alerta{riscoAlto === 1 ? "" : "s"} de risco alto</>}.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/oportunidades">
            Explorar Oportunidades <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <StatsGrid
        oportunidadesAnalisadas={total}
        margemMedia={margemMedia}
        economiaEstimadaBRL={economiaEstimadaBRL}
        alertasRisco={riscoAlto}
      />

      {!pro && <UpgradeBanner />}

      <RecentOpportunities oportunidades={oportunidades as unknown as Oportunidade[]} />

      <ActivityChart pontos={pontosAtividade} />
    </div>
  );
}
