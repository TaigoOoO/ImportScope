import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const DIAS_RETENCAO = 180;

/**
 * Pensado para ser chamado uma vez por dia por um scheduler externo (ver
 * vercel.json). Anonimiza contas cujo pedido de exclusão (`deletionRequestedAt`)
 * já passou do prazo de retenção de 180 dias exigido para obrigações legais/fiscais
 * (art. 16 da LGPD). Removemos email/nome, mas preservamos as linhas de
 * Oportunidade/Analise ligadas ao userId (não são dados pessoais em si, e
 * mantê-las preserva a integridade de registros de uso/cobrança).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_RETENCAO);

  const candidatos = await prisma.user.findMany({
    where: { deletionRequestedAt: { lte: limite } },
  });

  let anonimizados = 0;

  for (const usuario of candidatos) {
    try {
      if (usuario.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(usuario.stripeSubscriptionId).catch(() => {
          // Já pode ter sido cancelada antes; seguimos com a anonimização mesmo assim.
        });
      }

      await prisma.user.update({
        where: { id: usuario.id },
        data: {
          email: `deletado-${usuario.id}@anonimizado.importscope.com`,
          name: null,
          avatarUrl: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          plan: "free",
          subscriptionStatus: "inactive",
          deletionRequestedAt: null, // marca como concluído
        },
      });
      anonimizados++;
    } catch (err) {
      console.error(`[cron anonimizar-contas] falhou para usuário ${usuario.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, verificados: candidatos.length, anonimizados });
}
