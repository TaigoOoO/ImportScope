/**
 * Substitui as ~4 versões ligeiramente diferentes de "monta a URL do site"
 * que existiam espalhadas (login/page.tsx, api/checkout, api/portal,
 * lib/email-templates.ts com domínio hardcoded errado). Uma função só,
 * usada em todo lugar.
 *
 * No client, `window.location.origin` vem primeiro — de propósito. É
 * impossível estar errado (é literalmente o domínio que o navegador está
 * usando agora), ao contrário de uma env var que pode ter sido copiada
 * errada. Isso elimina de vez o cenário "NEXT_PUBLIC_SITE_URL ficou como
 * localhost em produção" para os fluxos que rodam no navegador (magic
 * link, Google OAuth) — não importa mais o que a env var diz, o redirect
 * vai para o domínio certo de qualquer forma.
 *
 * No server (rotas de API, templates de email, crons) não existe
 * `window`, então a ordem é: NEXT_PUBLIC_SITE_URL (se configurada
 * corretamente) → VERCEL_URL (a Vercel preenche isso sozinha em todo
 * deploy, sem precisar configurar nada — é o fallback mais confiável
 * quando NEXT_PUBLIC_SITE_URL está ausente ou errada) → localhost para
 * desenvolvimento local.
 */
export function getURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const configurada = process.env.NEXT_PUBLIC_SITE_URL;

  let url = configurada || vercelUrl || "http://localhost:3000";
  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url.slice(0, -1) : url; // sem barra final — cada chamador já usa `${getURL()}/caminho`

  return url;
}
