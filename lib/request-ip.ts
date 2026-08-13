import type { NextRequest } from "next/server";

/**
 * Next.js não expõe request.ip de forma confiável em todo ambiente de
 * deploy — em produção atrás de um proxy (Vercel, etc.) o IP real vem no
 * header x-forwarded-for. "unknown" como fallback só afeta o rate limit
 * (todas as chamadas sem IP identificável caem no mesmo bucket).
 */
export function obterIpCliente(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
