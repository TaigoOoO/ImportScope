import { Redis } from "@upstash/redis";

const UPSTASH_CONFIGURADO = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = UPSTASH_CONFIGURADO
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Fallback em memória para desenvolvimento/preview sem uma conta Upstash
 * configurada. Não é compartilhado entre instâncias serverless (cada
 * invocação fria começa vazio) nem sobrevive a um redeploy — é só o
 * suficiente para não quebrar o fluxo localmente. Em produção de verdade,
 * configure UPSTASH_REDIS_REST_URL/TOKEN.
 */
const memoriaLocal = new Map<string, { valor: unknown; expiraEm: number }>();

export async function cacheGet<T>(chave: string): Promise<T | null> {
  if (redis) {
    return (await redis.get<T>(chave)) ?? null;
  }
  const entrada = memoriaLocal.get(chave);
  if (!entrada) return null;
  if (Date.now() > entrada.expiraEm) {
    memoriaLocal.delete(chave);
    return null;
  }
  return entrada.valor as T;
}

export async function cacheSet<T>(chave: string, valor: T, ttlSegundos: number): Promise<void> {
  if (redis) {
    await redis.set(chave, valor, { ex: ttlSegundos });
    return;
  }
  memoriaLocal.set(chave, { valor, expiraEm: Date.now() + ttlSegundos * 1000 });
}

export const CACHE_TTL_INTEGRACOES = 60 * 60; // 1 hora, conforme especificado
