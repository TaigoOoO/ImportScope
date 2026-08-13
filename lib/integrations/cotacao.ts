import { cacheGet, cacheSet, CACHE_TTL_INTEGRACOES } from "@/lib/cache";
import { registrarIntegrationLog } from "@/lib/integration-log";
import { USD_BRL as USD_BRL_FALLBACK } from "@/lib/constants";

const CACHE_KEY = "integracao:cotacao:usd-brl";
const BCB_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json";

export interface CotacaoResultado {
  valor: number;
  dataReferencia: string | null;
  atualizadoEm: string;
  fonte: "bcb" | "fallback";
}

interface BcbItem {
  data: string;
  valor: string;
}

/**
 * Série 10813 do SGS/BCB = dólar americano (compra), diário. É a mesma
 * cotação usada como referência comercial pelo mercado — não é a exata
 * PTAX de fechamento, mas é pública, gratuita, sem necessidade de chave de
 * API, e atualizada nos dias úteis.
 */
export async function obterCotacaoAoVivo(): Promise<CotacaoResultado> {
  const emCache = await cacheGet<CotacaoResultado>(CACHE_KEY);
  if (emCache) return emCache;

  const inicio = Date.now();
  try {
    const res = await fetch(BCB_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`BCB respondeu ${res.status}`);

    const dados = (await res.json()) as BcbItem[];
    const item = dados[0];
    if (!item) throw new Error("BCB retornou lista vazia");

    const resultado: CotacaoResultado = {
      valor: Number(item.valor),
      dataReferencia: item.data,
      atualizadoEm: new Date().toISOString(),
      fonte: "bcb",
    };

    await cacheSet(CACHE_KEY, resultado, CACHE_TTL_INTEGRACOES);
    await registrarIntegrationLog("cotacao", "success", Date.now() - inicio);
    return resultado;
  } catch (err) {
    await registrarIntegrationLog(
      "cotacao",
      "fallback",
      Date.now() - inicio,
      err instanceof Error ? err.message : "erro desconhecido"
    );
    return { valor: USD_BRL_FALLBACK, dataReferencia: null, atualizadoEm: new Date().toISOString(), fonte: "fallback" };
  }
}
