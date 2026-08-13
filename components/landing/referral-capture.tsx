"use client";

import { useEffect } from "react";

const COOKIE_NAME = "importscope_ref";
const MAX_AGE_DIAS = 30;

/**
 * Sem UI — só efeito colateral. Lido de volta em /api/auth/register e
 * persistido em /auth/callback quando a conta é de fato criada.
 * Não usamos httpOnly aqui porque não é dado sensível (é só um código
 * de 6 caracteres já pensado para ser público/compartilhável).
 */
export function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const expira = new Date();
    expira.setDate(expira.getDate() + MAX_AGE_DIAS);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; expires=${expira.toUTCString()}; path=/; SameSite=Lax`;
  }, []);

  return null;
}
