import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isPro, checarEIncrementarUsoDiario } from "@/lib/auth";
import { produtoAleatorio, imagemMock, fornecedorUrlMock } from "@/lib/mock-products";
import { analisarOportunidade } from "@/lib/anthropic";
import { MARGEM_MINIMA_PADRAO, USD_BRL } from "@/lib/constants";
import { triggerUpgradePush } from "@/lib/email-triggers";

const bodySchema = z.object({
  categoria: z.string().optional(),
  margemMinima: z.coerce.number().optional().default(MARGEM_MINIMA_PADRAO),
});

const QUANTIDADE_RECENTES_A_EVITAR = 5;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }
    const { categoria } = parsed.data;

    let usoRestante: number | undefined;
    let limiteDiario: number | undefined;
    if (!isPro(user)) {
      const { permitido, restante, limite } = await checarEIncrementarUsoDiario(user.id);
      limiteDiario = limite;
      if (!permitido) {
        // Aguardamos de propósito: em ambiente serverless, uma promise não
        // aguardada pode ser encerrada assim que a resposta é enviada, e o
        // email nunca sairia. O custo é uns milissegundos a mais aqui.
        await triggerUpgradePush(user.id).catch((err) =>
          console.error("[gerar-oportunidade] falha ao disparar upgrade_push:", err)
        );

        return NextResponse.json(
          {
            error: "Limite diário atingido",
            message: `Você atingiu o limite de ${limite} oportunidades por dia no plano Free. Faça upgrade para Pro.`,
            upgradeUrl: "/api/checkout",
          },
          { status: 429 }
        );
      }
      usoRestante = restante;
    }

    const recentes = await prisma.oportunidade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: QUANTIDADE_RECENTES_A_EVITAR,
      select: { nome: true },
    });

    const produto = produtoAleatorio(
      categoria,
      recentes.map((r) => r.nome)
    );

    let analise;
    try {
      analise = await analisarOportunidade({
        nome: produto.nome,
        precoFOB: produto.precoFOB,
        categoria: produto.categoria,
        ncm: produto.ncm,
      });
    } catch (aiError) {
      console.error("[gerar-oportunidade] Falha na IA, usando fallback determinístico:", aiError);
      // Fallback local caso a API da Anthropic falhe ou a chave não esteja
      // configurada, para que o fluxo do produto nunca quebre em dev.
      const custoEstimado = produto.precoFOB * USD_BRL * 2.2;
      const margem = ((produto.precoMLBR - custoEstimado) / produto.precoMLBR) * 100;
      analise = {
        viavel: margem > 60,
        margemEstimada: Number(margem.toFixed(1)),
        custoTotalEstimadoBRL: Number(custoEstimado.toFixed(2)),
        precoVendaSugeridoBRL: Number((custoEstimado * 1.3).toFixed(2)),
        risco: produto.precoFOB > 10 ? "MEDIO" : "BAIXO",
        riscoMotivo: "Estimativa automática (IA indisponível no momento).",
        certificacoesNecessarias: produto.categoria === "Eletrônicos" ? ["INMETRO"] : [],
        alertas: [],
        copyVenda: `${produto.nome}: qualidade importada com entrega rápida.`,
        justificativa: "Análise gerada por fallback determinístico local.",
      };
    }

    const oportunidade = await prisma.oportunidade.create({
      data: {
        userId: user.id,
        nome: produto.nome,
        categoria: produto.categoria,
        precoFOB: produto.precoFOB,
        ncm: produto.ncm,
        precoMLBR: produto.precoMLBR,
        margemEstimada: analise.margemEstimada,
        risco: analise.risco,
        riscoMotivo: analise.riscoMotivo,
        copyVenda: analise.copyVenda,
        imagem: imagemMock(produto.nome),
        certificacoes: analise.certificacoesNecessarias ?? [],
        alertas: analise.alertas ?? [],
        custoTotalBRL: analise.custoTotalEstimadoBRL,
        precoVendaSugerido: analise.precoVendaSugeridoBRL,
        fornecedor: produto.fornecedor,
        fornecedorUrl: fornecedorUrlMock(produto.fornecedor),
        moq: produto.moq,
      },
    });

    return NextResponse.json({
      success: true,
      oportunidade,
      ...(usoRestante !== undefined ? { usoRestante } : {}),
      ...(limiteDiario !== undefined ? { limiteDiario } : {}),
    });
  } catch (error) {
    console.error("[POST /api/gerar-oportunidade]", error);
    return NextResponse.json({ error: "Erro ao gerar oportunidade." }, { status: 500 });
  }
}
