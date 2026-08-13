import { NextResponse, type NextRequest } from "next/server";
import { executarVarreduraDeTriggers } from "@/lib/email-triggers";

/**
 * Roda 1x/dia (ver vercel.json). Distinta de /api/cron/lembrete-renovacao
 * (que já existia desde o v3 e cuida só do lembrete de cobrança) — esta
 * cuida dos gatilhos de growth do v4: tour, primeira oportunidade,
 * reengajamento e winback.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const resultado = await executarVarreduraDeTriggers();
  return NextResponse.json({ ok: true, ...resultado });
}
