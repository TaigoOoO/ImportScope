import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { calcularImportacao, NcmNaoEncontradoError } from "@/lib/tax-engine";
import { obterCotacaoAoVivo } from "@/lib/integrations/cotacao";

const calculoSchema = z.object({
  fob: z.coerce.number().positive(),
  frete: z.coerce.number().nonnegative(),
  seguro: z.coerce.number().nonnegative(),
  ncm: z.string().min(1),
  estado: z.string().min(1),
  transporte: z.enum(["aereo", "maritimo"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = calculoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", detalhes: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Cotação ao vivo do Banco Central (com fallback para a constante fixa
    // se a API do BCB estiver fora do ar) — ver lib/integrations/cotacao.ts.
    const cotacao = await obterCotacaoAoVivo();

    const resultado = calcularImportacao(parsed.data, cotacao.valor);
    return NextResponse.json({ ...resultado, cotacaoFonte: cotacao.fonte });
  } catch (error) {
    if (error instanceof NcmNaoEncontradoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /api/calcular]", error);
    return NextResponse.json({ error: "Erro ao calcular impostos." }, { status: 500 });
  }
}
