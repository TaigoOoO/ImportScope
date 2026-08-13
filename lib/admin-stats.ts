import { prisma } from "@/lib/prisma";
import { PRO_PRECO_MENSAL } from "@/lib/constants";

const UM_DIA = 24 * 60 * 60 * 1000;

export interface KpisGerais {
  totalUsuarios: number;
  totalUsuariosVariacaoPct: number | null;
  usuariosProAtivos: number;
  mrrBRL: number;
  oportunidadesHoje: number;
  oportunidadesSemana: number;
  oportunidadesMes: number;
  taxaConversaoPct: number;
  churnRatePct: number | null;
}

/**
 * MRR é calculado como (usuários Pro ativos × preço fixo do plano), já que
 * hoje só existe um único price da Stripe (`PRO_PRECO_MENSAL`). Se no
 * futuro houver múltiplos planos/descontos, isso precisaria somar o valor
 * real de cada assinatura via Stripe em vez de multiplicar por uma
 * constante.
 *
 * Churn é aproximado como (cancelamentos nos últimos 30 dias) / (Pro
 * ativos + cancelamentos), usando os registros de EmailLog tipo
 * 'cancellation' como proxy de "quando alguém cancelou" — não guardamos
 * um histórico de mudanças de plano no schema, então essa é a melhor
 * aproximação disponível sem adicionar uma tabela de auditoria nova.
 */
export async function calcularKpisGerais(): Promise<KpisGerais> {
  const agora = new Date();
  const inicioHoje = new Date(agora);
  inicioHoje.setHours(0, 0, 0, 0);
  const seteDiasAtras = new Date(agora.getTime() - 7 * UM_DIA);
  const trintaDiasAtras = new Date(agora.getTime() - 30 * UM_DIA);
  const sessentaDiasAtras = new Date(agora.getTime() - 60 * UM_DIA);

  const [
    totalUsuarios,
    usuariosAte30Dias,
    usuariosAte60Dias,
    usuariosProAtivos,
    oportunidadesHoje,
    oportunidadesSemana,
    oportunidadesMes,
    cancelamentosUltimos30Dias,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: trintaDiasAtras } } }),
    prisma.user.count({ where: { createdAt: { gte: sessentaDiasAtras, lt: trintaDiasAtras } } }),
    prisma.user.count({ where: { plan: "pro" } }),
    prisma.oportunidade.count({ where: { createdAt: { gte: inicioHoje } } }),
    prisma.oportunidade.count({ where: { createdAt: { gte: seteDiasAtras } } }),
    prisma.oportunidade.count({ where: { createdAt: { gte: trintaDiasAtras } } }),
    prisma.emailLog.count({ where: { type: "cancellation", sentAt: { gte: trintaDiasAtras } } }),
  ]);

  const totalUsuariosVariacaoPct =
    usuariosAte60Dias > 0 ? ((usuariosAte30Dias - usuariosAte60Dias) / usuariosAte60Dias) * 100 : null;

  const taxaConversaoPct = totalUsuarios > 0 ? (usuariosProAtivos / totalUsuarios) * 100 : 0;

  const baseChurn = usuariosProAtivos + cancelamentosUltimos30Dias;
  const churnRatePct = baseChurn > 0 ? (cancelamentosUltimos30Dias / baseChurn) * 100 : null;

  return {
    totalUsuarios,
    totalUsuariosVariacaoPct,
    usuariosProAtivos,
    mrrBRL: usuariosProAtivos * PRO_PRECO_MENSAL,
    oportunidadesHoje,
    oportunidadesSemana,
    oportunidadesMes,
    taxaConversaoPct,
    churnRatePct,
  };
}

export interface PontoSerieDiaria {
  data: string;
  valor: number;
}

export async function calcularNovosUsuariosPorDia(dias = 30): Promise<PontoSerieDiaria[]> {
  const usuarios = await prisma.user.findMany({
    where: { createdAt: { gte: new Date(Date.now() - dias * UM_DIA) } },
    select: { createdAt: true },
  });
  return agruparPorDia(usuarios.map((u) => u.createdAt), dias);
}

export async function calcularReceitaAcumulada(dias = 30): Promise<PontoSerieDiaria[]> {
  // Aproximação: cada checkout_completed vale PRO_PRECO_MENSAL. Não é o
  // valor exato cobrado (não considera cupons/prorroga), mas dá uma curva
  // de crescimento de receita razoável para o gráfico.
  const eventos = await prisma.analyticsEvent.findMany({
    where: { eventType: "checkout_completed", createdAt: { gte: new Date(Date.now() - dias * UM_DIA) } },
    select: { createdAt: true },
  });
  const porDia = agruparPorDia(eventos.map((e) => e.createdAt), dias);

  let acumulado = 0;
  return porDia.map((ponto) => {
    acumulado += ponto.valor * PRO_PRECO_MENSAL;
    return { data: ponto.data, valor: acumulado };
  });
}

function agruparPorDia(datas: Date[], dias: number): PontoSerieDiaria[] {
  const buckets = new Map<string, number>();
  const hoje = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    buckets.set(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const data of datas) {
    const chave = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (buckets.has(chave)) buckets.set(chave, (buckets.get(chave) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([data, valor]) => ({ data, valor }));
}

export interface FatiaCategoria {
  categoria: string;
  quantidade: number;
}

export async function calcularOportunidadesPorCategoria(): Promise<FatiaCategoria[]> {
  const resultado = await prisma.oportunidade.groupBy({
    by: ["categoria"],
    _count: { categoria: true },
    orderBy: { _count: { categoria: "desc" } },
  });
  return resultado.map((r) => ({ categoria: r.categoria, quantidade: r._count.categoria }));
}

export interface DistribuicaoPlanos {
  plano: string;
  quantidade: number;
}

export async function calcularDistribuicaoPlanos(): Promise<DistribuicaoPlanos[]> {
  const resultado = await prisma.user.groupBy({ by: ["plan"], _count: { plan: true } });
  return resultado.map((r) => ({ plano: r.plan, quantidade: r._count.plan }));
}
