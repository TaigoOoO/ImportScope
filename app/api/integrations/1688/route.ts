import { NextResponse, type NextRequest } from "next/server";
import { buscarProdutos1688 } from "@/lib/integrations/1688-scraper";
import { checarRateLimit } from "@/lib/rate-limit";
import { obterIpCliente } from "@/lib/request-ip";

export async function GET(request: NextRequest) {
  const { permitido } = await checarRateLimit(obterIpCliente(request));
  if (!permitido) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Parâmetro 'query' é obrigatório." }, { status: 400 });
  }

  const resultado = await buscarProdutos1688(query);
  return NextResponse.json(resultado);
}
