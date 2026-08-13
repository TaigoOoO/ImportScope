import Anthropic from "@anthropic-ai/sdk";
import { USD_BRL } from "@/lib/constants";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnaliseOportunidadeInput {
  nome: string;
  precoFOB: number;
  categoria: string;
  ncm: string;
}

export interface AnaliseOportunidadeOutput {
  viavel: boolean;
  margemEstimada: number;
  custoTotalEstimadoBRL: number;
  precoVendaSugeridoBRL: number;
  risco: "BAIXO" | "MEDIO" | "ALTO";
  riscoMotivo: string;
  certificacoesNecessarias: string[];
  alertas: string[];
  copyVenda: string;
  justificativa: string;
}

function buildSystemPrompt(input: AnaliseOportunidadeInput): string {
  return `Você é um analista sênior de importação China-Brasil. Analise o produto e retorne JSON estrito.

PRODUTO: ${input.nome}
PREÇO FOB: $${input.precoFOB}
CATEGORIA: ${input.categoria}
NCM SUGERIDO: ${input.ncm}

RETORNE APENAS JSON VÁLIDO, sem markdown, sem texto antes ou depois:
{
  "viavel": boolean,
  "margemEstimada": number,
  "custoTotalEstimadoBRL": number,
  "precoVendaSugeridoBRL": number,
  "risco": "BAIXO|MEDIO|ALTO",
  "riscoMotivo": "string",
  "certificacoesNecessarias": ["string"],
  "alertas": ["string"],
  "copyVenda": "string curta, 2 linhas",
  "justificativa": "string técnica"
}

REGRAS:
- Margem >60% = viável
- Eletrônicos sem INMETRO/Anvisa = risco ALTO
- Produtos >$100 FOB = risco MEDIO
- USD/BRL = ${USD_BRL}`;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text.trim();
}

/**
 * Analisa uma oportunidade de produto via Claude API.
 * Temperature 0.2 para manter as respostas consistentes entre gerações
 * do mesmo produto, e max_tokens 2000 para dar espaço confortável ao
 * JSON de saída sem truncar.
 */
export async function analisarOportunidade(
  input: AnaliseOportunidadeInput
): Promise<AnaliseOportunidadeOutput> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    temperature: 0.2,
    system: buildSystemPrompt(input),
    messages: [
      {
        role: "user",
        content: "Gere a análise em JSON conforme instruído.",
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA não contém texto.");
  }

  const jsonString = extractJson(textBlock.text);

  let parsed: AnaliseOportunidadeOutput;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Falha ao interpretar JSON retornado pela IA.");
  }

  return parsed;
}
