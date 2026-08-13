import { prisma } from "@/lib/prisma";

export interface TaxaPorTipo {
  type: string;
  enviados: number;
  abertos: number;
  clicados: number;
  taxaAberturaPct: number | null;
  taxaCliquePct: number | null;
}

/**
 * `openedAt`/`clickedAt` existem no schema, mas nada neste projeto os
 * preenche de verdade — isso exigiria um provedor de email de verdade com
 * pixel de abertura e redirecionamento de clique rastreado (ex: Resend
 * Webhooks), que não está configurado (ver lib/email-templates.ts). As
 * taxas aqui vão aparecer como 0%/— até que isso seja plugado; melhor
 * mostrar isso claramente do que inventar um número.
 */
export async function calcularTaxasPorTipo(): Promise<TaxaPorTipo[]> {
  const resultado = await prisma.emailLog.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  const comAberturaClique = await Promise.all(
    resultado.map(async (r) => {
      const abertos = await prisma.emailLog.count({ where: { type: r.type, openedAt: { not: null } } });
      const clicados = await prisma.emailLog.count({ where: { type: r.type, clickedAt: { not: null } } });
      return {
        type: r.type,
        enviados: r._count.type,
        abertos,
        clicados,
        taxaAberturaPct: r._count.type > 0 ? (abertos / r._count.type) * 100 : null,
        taxaCliquePct: r._count.type > 0 ? (clicados / r._count.type) * 100 : null,
      };
    })
  );

  return comAberturaClique.sort((a, b) => b.enviados - a.enviados);
}

export async function listarEmailLogsRecentes(limite = 100) {
  return prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: limite,
    include: { user: { select: { email: true } } },
  });
}
