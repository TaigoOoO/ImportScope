import { cacheGet, cacheSet, CACHE_TTL_INTEGRACOES } from "@/lib/cache";
import { registrarIntegrationLog } from "@/lib/integration-log";
import { NCM_TABLE } from "@/lib/tax-data";

const BRASILAPI_BASE = "https://brasilapi.com.br/api/ncm/v1";

export interface NcmResultado {
  ncm: string;
  descricao: string;
  ii: number | null;
  ipi: number | null;
  pis: number;
  cofins: number;
  dataInicioVigencia: string | null;
  alertas: string[];
  fonte: "brasilapi+local" | "local";
}

/**
 * A BrasilAPI retorna classificação/descrição oficial e vigência do NCM
 * (dado real, ao vivo), mas NÃO retorna alíquotas de II/IPI — isso vem da
 * Tarifa Externa Comum (TEC), que não tem uma API pública simples. Por
 * isso o resultado final é uma junção: descrição oficial ao vivo +
 * alíquotas da nossa tabela de referência local (lib/tax-data.ts). Se o
 * NCM não estiver na nossa tabela local, `ii`/`ipi` vêm null — melhor
 * mostrar "não temos essa alíquota" do que inventar um número.
 */
export async function consultarNcm(codigo: string): Promise<NcmResultado> {
  const codigoNormalizado = codigo.replace(/\D/g, "");
  const cacheKey = `integracao:ncm:${codigoNormalizado}`;

  const emCache = await cacheGet<NcmResultado>(cacheKey);
  if (emCache) return emCache;

  const referenciaLocal = NCM_TABLE.find((n) => n.codigo.replace(/\D/g, "") === codigoNormalizado);

  const inicio = Date.now();
  try {
    const res = await fetch(`${BRASILAPI_BASE}/${codigoNormalizado}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`BrasilAPI respondeu ${res.status}`);

    const dados = (await res.json()) as {
      codigo: string;
      descricao: string;
      data_inicio: string;
      data_fim: string;
    };

    const resultado: NcmResultado = {
      ncm: dados.codigo,
      descricao: dados.descricao,
      ii: referenciaLocal?.ii ?? null,
      ipi: referenciaLocal?.ipi ?? null,
      pis: 1.65,
      cofins: 7.6,
      dataInicioVigencia: dados.data_inicio,
      alertas: referenciaLocal?.exigeCertificacao
        ? [`Pode exigir certificação ${referenciaLocal.exigeCertificacao}.`]
        : [],
      fonte: "brasilapi+local",
    };

    await cacheSet(cacheKey, resultado, CACHE_TTL_INTEGRACOES);
    await registrarIntegrationLog("receita_ncm", "success", Date.now() - inicio);
    return resultado;
  } catch (err) {
    await registrarIntegrationLog(
      "receita_ncm",
      referenciaLocal ? "fallback" : "error",
      Date.now() - inicio,
      err instanceof Error ? err.message : "erro desconhecido"
    );

    return {
      ncm: referenciaLocal?.codigo ?? codigo,
      descricao: referenciaLocal?.descricao ?? "NCM não encontrado",
      ii: referenciaLocal?.ii ?? null,
      ipi: referenciaLocal?.ipi ?? null,
      pis: 1.65,
      cofins: 7.6,
      dataInicioVigencia: null,
      alertas: referenciaLocal?.exigeCertificacao
        ? [`Pode exigir certificação ${referenciaLocal.exigeCertificacao}.`]
        : [],
      fonte: "local",
    };
  }
}
