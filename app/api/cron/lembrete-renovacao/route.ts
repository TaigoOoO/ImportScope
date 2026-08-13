import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { enviarEmail, templateLembreteRenovacao } from "@/lib/email-templates";

/**
 * Pensado para ser chamado uma vez por dia por um scheduler externo
 * (ex: Vercel Cron, um cron job do próprio servidor, ou um GitHub Action).
 * Não é chamado por nenhuma ação do usuário. Protegido por um header
 * simples com `CRON_SECRET` — configure essa variável de ambiente e
 * inclua o mesmo valor no header `Authorization: Bearer <CRON_SECRET>`
 * na configuração do scheduler.
 *
 * Exemplo de configuração no vercel.json:
 * { "crons": [{ "path": "/api/cron/lembrete-renovacao", "schedule": "0 12 * * *" }] }
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const usuariosPro = await prisma.user.findMany({
    where: { plan: "pro", stripeSubscriptionId: { not: null } },
  });

  let enviados = 0;

  for (const usuario of usuariosPro) {
    if (!usuario.stripeSubscriptionId) continue;

    try {
      const subscription = await stripe.subscriptions.retrieve(usuario.stripeSubscriptionId);
      const proximaCobrancaMs = subscription.current_period_end * 1000;
      const diasRestantes = Math.round((proximaCobrancaMs - Date.now()) / (1000 * 60 * 60 * 24));

      if (diasRestantes === 3) {
        const dataFormatada = new Intl.DateTimeFormat("pt-BR").format(new Date(proximaCobrancaMs));
        await enviarEmail(
          usuario.email,
          templateLembreteRenovacao({ nome: usuario.name ?? usuario.email.split("@")[0], data: dataFormatada })
        );
        enviados++;
      }
    } catch (err) {
      console.error(`[cron lembrete-renovacao] falhou para ${usuario.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, verificados: usuariosPro.length, enviados });
}
