import { NextResponse, type NextRequest } from "next/server";
import { consultarNcm } from "@/lib/integrations/receita-ncm";
import { checarRateLimit } from "@/lib/rate-limit";
import { obterIpCliente } from "@/lib/request-ip";

export async function GET(request: NextRequest) {
  const { permitido } = await checarRateLimit(obterIpCliente(request));
  if (!permitido) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  const codigo = request.nextUrl.searchParams.get("code");
  if (!codigo) {
    return NextResponse.json({ error: "Parâmetro 'code' é obrigatório." }, { status: 400 });
  }

  const resultado = await consultarNcm(codigo);
  return NextResponse.json(resultado);
}
