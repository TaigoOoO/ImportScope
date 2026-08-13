import googleTrends from "google-trends-api";
import { cacheGet, cacheSet, CACHE_TTL_INTEGRACOES } from "@/lib/cache";
import { registrarIntegrationLog } from "@/lib/integration-log";

export interface PontoTendencia {
  date: string;
  value: number;
}

export interface TrendsResultado {
  keyword: string;
  interestOverTime: PontoTendencia[];
  relatedQueries: string[];
  trending: boolean;
  fonte: "google_trends" | "indisponivel";
}

interface TimelinePonto {
  formattedAxisTime?: string;
  value?: number[];
}

interface RankedKeywordItem {
  query?: string;
}

/**
 * `google-trends-api` não é uma API oficial do Google — é uma biblioteca
 * que replica as chamadas que o próprio site trends.google.com faz
 * internamente. Isso significa que pode quebrar sem aviso se o Google
 * mudar o formato de resposta. Por isso o parsing é bem defensivo e cai
 * para `trending: false` / listas vazias em vez de propagar o erro.
 */
export async function obterTendencia(keyword: string, geo = "BR"): Promise<TrendsResultado> {
  const cacheKey = `integracao:trends:${geo}:${keyword.toLowerCase()}`;
  const emCache = await cacheGet<TrendsResultado>(cacheKey);
  if (emCache) return emCache;

  const inicio = Date.now();
  try {
    const [interesseRaw, relacionadasRaw] = await Promise.all([
      googleTrends.interestOverTime({ keyword, geo, startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }),
      googleTrends.relatedQueries({ keyword, geo }).catch(() => null),
    ]);

    const interesseJson = JSON.parse(interesseRaw);
    const timeline: TimelinePonto[] = interesseJson?.default?.timelineData ?? [];

    const interestOverTime: PontoTendencia[] = timeline.map((ponto) => ({
      date: ponto.formattedAxisTime ?? "",
      value: ponto.value?.[0] ?? 0,
    }));

    let relatedQueries: string[] = [];
    if (relacionadasRaw) {
      try {
        const relacionadasJson = JSON.parse(relacionadasRaw);
        const rankedList = relacionadasJson?.default?.rankedList?.[0]?.rankedKeyword ?? [];
        relatedQueries = (rankedList as RankedKeywordItem[])
          .slice(0, 5)
          .map((r) => r.query)
          .filter((q): q is string => !!q);
      } catch {
        relatedQueries = [];
      }
    }

    const valores = interestOverTime.map((p) => p.value);
    const valorRecente = valores.at(-1) ?? 0;
    const valorMesPassado = valores.at(-5) ?? valorRecente; // ~1 ponto por semana, 5 semanas atrás
    const trending = valorMesPassado > 0 && (valorRecente - valorMesPassado) / valorMesPassado > 0.2;

    const resultado: TrendsResultado = { keyword, interestOverTime, relatedQueries, trending, fonte: "google_trends" };
    await cacheSet(cacheKey, resultado, CACHE_TTL_INTEGRACOES);
    await registrarIntegrationLog("google_trends", "success", Date.now() - inicio);
    return resultado;
  } catch (err) {
    await registrarIntegrationLog(
      "google_trends",
      "fallback",
      Date.now() - inicio,
      err instanceof Error ? err.message : "erro desconhecido"
    );
    return { keyword, interestOverTime: [], relatedQueries: [], trending: false, fonte: "indisponivel" };
  }
}
