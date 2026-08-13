import { NextResponse, type NextRequest } from "next/server";
import { obterTendencia } from "@/lib/integrations/google-trends";
import { checarRateLimit } from "@/lib/rate-limit";
import { obterIpCliente } from "@/lib/request-ip";

export async function GET(request: NextRequest) {
  const { permitido } = await checarRateLimit(obterIpCliente(request));
  if (!permitido) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  const keyword = request.nextUrl.searchParams.get("keyword");
  const geo = request.nextUrl.searchParams.get("geo") ?? "BR";
  if (!keyword) {
    return NextResponse.json({ error: "Parâmetro 'keyword' é obrigatório." }, { status: 400 });
  }

  const resultado = await obterTendencia(keyword, geo);
  return NextResponse.json(resultado);
}
