import { cookies } from "next/headers";

const COOKIE_NAME = "importscope_pending_consent";
const MAX_AGE_SECONDS = 10 * 60; // 10 minutos — tempo de sobra para clicar o magic link ou voltar do OAuth

export interface ConsentoPendente {
  email?: string;
  acceptedTerms: true;
  acceptedPrivacy: true;
  isAdultConfirmed: true;
  timestamp: string;
}

/**
 * Grava o consentimento capturado no formulário de login em um cookie
 * httpOnly de curta duração, para que a rota de callback (que é onde de
 * fato criamos/atualizamos o registro do usuário) possa validá-lo e
 * persistir os timestamps no banco — sem depender de user_metadata do
 * Supabase, que não é preenchível da mesma forma entre o fluxo de magic
 * link e o fluxo OAuth.
 */
export function gravarConsentoPendente(dados: Omit<ConsentoPendente, "timestamp">) {
  const payload: ConsentoPendente = { ...dados, timestamp: new Date().toISOString() };
  cookies().set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export function lerConsentoPendente(): ConsentoPendente | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentoPendente;
    if (parsed.acceptedTerms === true && parsed.acceptedPrivacy === true && parsed.isAdultConfirmed === true) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function limparConsentoPendente() {
  cookies().delete(COOKIE_NAME);
}
