import { PRODUTOS_MOCK, imagemMock, fornecedorUrlMock } from "./mock-products";
import { USD_BRL, MARGEM_PADRAO } from "./constants";
import { prisma } from "./prisma";

/**
 * Popula (ou repopula) as 15 oportunidades mock para uma conta demo.
 * Usada tanto por `prisma/seed.ts` (linha de comando) quanto por
 * `POST /api/admin/system/seed` (botão "Rodar seed de produtos" em
 * /admin/config) — mesma lógica, sem duplicar.
 */
export async function rodarSeedProdutos(emailDemo = "demo@importscope.app"): Promise<{ criadas: number }> {
  const demoUser = await prisma.user.upsert({
    where: { email: emailDemo },
    update: {},
    create: { email: emailDemo, subscriptionStatus: "inactive", plan: "free" },
  });

  for (const produto of PRODUTOS_MOCK) {
    const custoUnitarioBRL = produto.precoFOB * USD_BRL;
    const margemEstimada = ((produto.precoMLBR - custoUnitarioBRL) / produto.precoMLBR) * 100;
    const risco: "BAIXO" | "MEDIO" | "ALTO" = produto.precoFOB > 10 ? "MEDIO" : "BAIXO";

    await prisma.oportunidade.create({
      data: {
        userId: demoUser.id,
        nome: produto.nome,
        categoria: produto.categoria,
        precoFOB: produto.precoFOB,
        ncm: produto.ncm,
        precoMLBR: produto.precoMLBR,
        margemEstimada: Number(margemEstimada.toFixed(1)),
        risco,
        riscoMotivo:
          risco === "BAIXO"
            ? "Produto de baixo valor agregado, sem exigência de certificação específica."
            : "Valor FOB acima de referência, atenção à documentação alfandegária.",
        copyVenda: `${produto.nome}: qualidade importada com entrega rápida para todo o Brasil.`,
        imagem: imagemMock(produto.nome),
        certificacoes: [],
        alertas: [],
        custoTotalBRL: Number(custoUnitarioBRL.toFixed(2)),
        precoVendaSugerido: Number((custoUnitarioBRL * (1 + MARGEM_PADRAO / 100)).toFixed(2)),
        fornecedor: produto.fornecedor,
        fornecedorUrl: fornecedorUrlMock(produto.fornecedor),
        moq: produto.moq,
      },
    });
  }

  return { criadas: PRODUTOS_MOCK.length };
}
