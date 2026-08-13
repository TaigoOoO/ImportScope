import { prisma } from "@/lib/prisma";
import { PRO_PRECO_MENSAL } from "@/lib/constants";
import type { EtapaFunil } from "@/components/admin/charts/funnel-chart";

const UMA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export async function calcularFunil(): Promise<EtapaFunil[]> {
  const [visitantes, cadastros, ativos, pro] = await Promise.all([
    prisma.analyticsEvent
      .findMany({ where: { eventType: "page_view" }, distinct: ["sessionId"], select: { sessionId: true } })
      .then((r) => r.filter((x) => x.sessionId).length),
    prisma.user.count(),
    prisma.user.count({ where: { oportunidades: { some: {} } } }),
    prisma.user.count({ where: { plan: "pro" } }),
  ]);

  return [
    { etapa: "Visitantes", quantidade: Math.max(visitantes, cadastros) }, // nunca menor que cadastros (sessões antigas sem tracking)
    { etapa: "Cadastros", quantidade: cadastros },
    { etapa: "Free Ativos", quantidade: ativos },
    { etapa: "Pro", quantidade: pro },
  ];
}

export interface CohortSemana {
  semana: string;
  cadastrados: number;
  ativados: number;
  taxaAtivacaoPct: number;
}

/**
 * "Retenção" aqui é simplificada para "ativação": dos usuários cadastrados
 * numa semana, quantos chegaram a gerar ao menos 1 oportunidade depois do
 * cadastro. Uma cohort de retenção completa (ex: retorno na semana 2, 3...)
 * exigiria uma tabela de eventos por semana-relativa-ao-cadastro que não
 * temos hoje — isso é a aproximação razoável com o schema atual.
 */
export async function calcularCohortAtivacao(semanas = 8): Promise<CohortSemana[]> {
  const resultado: CohortSemana[] = [];
  const agora = Date.now();

  for (let i = semanas - 1; i >= 0; i--) {
    const inicio = new Date(agora - (i + 1) * UMA_SEMANA_MS);
    const fim = new Date(agora - i * UMA_SEMANA_MS);

    const usuarios = await prisma.user.findMany({
      where: { createdAt: { gte: inicio, lt: fim } },
      select: { id: true },
    });

    let ativados = 0;
    if (usuarios.length > 0) {
      ativados = await prisma.oportunidade
        .groupBy({ by: ["userId"], where: { userId: { in: usuarios.map((u) => u.id) } } })
        .then((r) => r.length);
    }

    resultado.push({
      semana: `${inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`,
      cadastrados: usuarios.length,
      ativados,
      taxaAtivacaoPct: usuarios.length > 0 ? (ativados / usuarios.length) * 100 : 0,
    });
  }

  return resultado;
}

export interface EstimativaLtv {
  ltvBRL: number | null;
  arpuBRL: number;
  churnRatePct: number | null;
}

/** LTV ≈ ARPU / churn — fórmula padrão de SaaS. Ver comentário em admin-stats.ts sobre como churn é aproximado. */
export async function calcularLtvEstimado(churnRatePct: number | null): Promise<EstimativaLtv> {
  const arpuBRL = PRO_PRECO_MENSAL; // todo usuário Pro paga o mesmo valor hoje
  const churnFracao = churnRatePct !== null ? churnRatePct / 100 : null;
  const ltvBRL = churnFracao && churnFracao > 0 ? arpuBRL / churnFracao : null;
  return { ltvBRL, arpuBRL, churnRatePct };
}

export interface ProdutoTop {
  nome: string;
  quantidade: number;
}

export async function calcularTopProdutos(limite = 10): Promise<ProdutoTop[]> {
  const resultado = await prisma.oportunidade.groupBy({
    by: ["nome"],
    _count: { nome: true },
    orderBy: { _count: { nome: "desc" } },
    take: limite,
  });
  return resultado.map((r) => ({ nome: r.nome, quantidade: r._count.nome }));
}

export interface HorarioPico {
  hora: string;
  quantidade: number;
}

export async function calcularHorariosPico(): Promise<HorarioPico[]> {
  const eventos = await prisma.analyticsEvent.findMany({
    select: { createdAt: true },
    take: 5000,
    orderBy: { createdAt: "desc" },
  });

  const porHora = new Array(24).fill(0);
  for (const e of eventos) {
    porHora[e.createdAt.getHours()]++;
  }

  return porHora.map((quantidade, hora) => ({ hora: `${hora}h`, quantidade }));
}
