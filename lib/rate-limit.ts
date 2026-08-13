import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_CONFIGURADO = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = UPSTASH_CONFIGURADO
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const limitePorIp = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1 m"), prefix: "importscope:ratelimit:ip" })
  : null;

const limiteGlobal = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(1000, "1 m"), prefix: "importscope:ratelimit:global" })
  : null;

// Fallback em memória (mesma ressalva do lib/cache.ts: não é compartilhado
// entre instâncias serverless, só evita que o rate limit fique inerte
// localmente sem Redis configurado).
const janelasLocais = new Map<string, number[]>();

function checarJanelaLocal(chave: string, limite: number, janelaMs: number): boolean {
  const agora = Date.now();
  const timestamps = (janelasLocais.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  if (timestamps.length >= limite) {
    janelasLocais.set(chave, timestamps);
    return false;
  }
  timestamps.push(agora);
  janelasLocais.set(chave, timestamps);
  return true;
}

export interface ResultadoRateLimit {
  permitido: boolean;
  motivo?: "ip" | "global";
}

/**
 * 100 req/min por IP, 1000 req/min global — conforme especificado.
 * Checa o limite por IP primeiro (mais provável de disparar) e só então o
 * global, para dar o motivo mais específico possível na resposta 429.
 */
export async function checarRateLimit(ip: string): Promise<ResultadoRateLimit> {
  if (limitePorIp && limiteGlobal) {
    const [porIp, global] = await Promise.all([limitePorIp.limit(ip), limiteGlobal.limit("global")]);
    if (!porIp.success) return { permitido: false, motivo: "ip" };
    if (!global.success) return { permitido: false, motivo: "global" };
    return { permitido: true };
  }

  if (!checarJanelaLocal(`ip:${ip}`, 100, 60_000)) return { permitido: false, motivo: "ip" };
  if (!checarJanelaLocal("global", 1000, 60_000)) return { permitido: false, motivo: "global" };
  return { permitido: true };
}
