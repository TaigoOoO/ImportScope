import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { lerConsentoPendente, limparConsentoPendente } from "@/lib/consent-cookie";
import { resolverIndicador } from "@/lib/referral";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    // Sem "code" na URL geralmente significa que o próprio /auth/v1/verify
    // do Supabase rejeitou o token ANTES de emitir um code (expirado, já
    // usado, etc.) — nesse caso o Supabase normalmente já anexou o motivo
    // como hash fragment na própria URL (#error=...&error_code=...), que o
    // navegador preserva através deste redirect automaticamente.
    console.error("[auth/callback] sem 'code' na URL — provável falha no /auth/v1/verify do Supabase antes do redirect chegar aqui.");
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&reason=no_code`);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    // Aqui SIM o code chegou — a falha é no exchangeCodeForSession em si,
    // o que geralmente aponta para o cookie de code_verifier do PKCE não
    // estar presente (navegador/contexto diferente de quem pediu o link).
    console.error("[auth/callback] exchangeCodeForSession falhou:", error?.message ?? "sem error.message", "| status:", error?.status, "| user presente:", !!data?.user);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&reason=exchange_failed`);
  }

  const email = data.user.email;

  const usuarioExistente = await prisma.user.findUnique({ where: { email } });
  const consentoPendente = lerConsentoPendente();

  // Regra de ouro v3: sempre validar no backend. Se não há consentimento
  // válido nesta sessão (cookie ausente/expirado) E o usuário ainda não
  // tinha aceitado os termos anteriormente, não deixamos a sessão passar —
  // desfazemos o login e mandamos de volta para /login.
  const jaTinhaConsentimento = usuarioExistente?.acceptedTerms === true;

  if (!consentoPendente && !jaTinhaConsentimento) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=consent_required`);
  }

  if (consentoPendente) {
    const agora = new Date();

    // Atribuição de referral: só se aplica na PRIMEIRA criação da conta —
    // usuarioExistente sendo null é o sinal de que esta é uma conta nova.
    let referredBy: string | undefined;
    if (!usuarioExistente) {
      const refCookie = cookies().get("importscope_ref")?.value;
      if (refCookie) {
        const idIndicador = await resolverIndicador(refCookie);
        if (idIndicador) referredBy = idIndicador;
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        acceptedTerms: true,
        acceptedTermsAt: agora,
        acceptedPrivacy: true,
        acceptedPrivacyAt: agora,
        isAdultConfirmed: true,
        lastLoginAt: agora,
      },
      create: {
        email,
        acceptedTerms: true,
        acceptedTermsAt: agora,
        acceptedPrivacy: true,
        acceptedPrivacyAt: agora,
        isAdultConfirmed: true,
        lastLoginAt: agora,
        ...(referredBy ? { referredBy } : {}),
      },
    });

    if (referredBy && !usuarioExistente) {
      await prisma.user.update({
        where: { id: referredBy },
        data: { referralCount: { increment: 1 } },
      });
      cookies().delete("importscope_ref");
    }

    limparConsentoPendente();
    void user;
  } else {
    // Sessão de login recorrente de um usuário que já tinha consentido antes.
    await prisma.user.upsert({
      where: { email },
      update: { lastLoginAt: new Date() },
      create: { email },
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
