import { prisma } from "@/lib/prisma";

export type ProvedorIntegracao = "google_trends" | "1688" | "receita_ncm" | "cotacao";
export type StatusIntegracao = "success" | "error" | "fallback";

/**
 * `message` nunca deve conter email ou outro dado pessoal do usuário —
 * IntegrationLog não tem (nem deveria ter) um campo userId, então os
 * únicos dados aqui são sobre a chamada externa em si (termo de busca,
 * código NCM, mensagem de erro da API), nunca sobre quem fez a chamada.
 */
export async function registrarIntegrationLog(
  provider: ProvedorIntegracao,
  status: StatusIntegracao,
  latencyMs: number,
  message?: string
): Promise<void> {
  try {
    await prisma.integrationLog.create({
      data: { provider, status, latency: latencyMs, message: message?.slice(0, 500) },
    });
  } catch (err) {
    // Log de log falhando não deve derrubar a integração em si.
    console.error("[integration-log] falha ao registrar:", err);
  }
}
