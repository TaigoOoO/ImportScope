"use client";

const SESSION_KEY = "importscope_session_id";

function obterSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Dispara um evento de analytics. Usa `keepalive: true` para que a
 * requisição sobreviva mesmo se o usuário navegar para outra página logo
 * em seguida (o problema clássico do fetch() comum sendo cancelado no
 * unload). Não aguardamos a resposta de propósito — tracking nunca deve
 * atrasar a interação do usuário.
 */
export function trackEvent(eventType: string, metadata?: Record<string, unknown>): void {
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, metadata, sessionId: obterSessionId() }),
      keepalive: true,
    }).catch(() => {
      // Tracking nunca deve quebrar a experiência do usuário.
    });
  } catch {
    // Ambientes sem fetch/crypto (muito raro) — ignora silenciosamente.
  }
}
