import { NextResponse, type NextRequest } from "next/server";
import { obterCotacaoAoVivo } from "@/lib/integrations/cotacao";
import { checarRateLimit } from "@/lib/rate-limit";
import { obterIpCliente } from "@/lib/request-ip";

export async function GET(request: NextRequest) {
  const { permitido } = await checarRateLimit(obterIpCliente(request));
  if (!permitido) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  const cotacao = await obterCotacaoAoVivo();
  return NextResponse.json(cotacao);
}
