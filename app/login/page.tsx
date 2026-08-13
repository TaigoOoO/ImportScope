"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getURL } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { TermsCheckbox } from "@/components/shared/terms-checkbox";
import { AgeCheckbox } from "@/components/shared/age-checkbox";
import { LegalFooter } from "@/components/shared/legal-footer";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [confirmouIdade, setConfirmouIdade] = useState(false);
  const [erroTermos, setErroTermos] = useState<string | undefined>();
  const [erroIdade, setErroIdade] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "consent_required") {
      setErrorMsg(
        "Não encontramos seu consentimento aos termos nesta sessão. Marque as duas caixas abaixo e tente novamente, no mesmo navegador em que você vai clicar o link do email."
      );
      setStatus("error");
    }
    if (params.get("error") === "account_banned") {
      setErrorMsg("Esta conta foi suspensa. Entre em contato com contato@importscope.com se acredita que isso é um engano.");
      setStatus("error");
    }
    if (params.get("error") === "auth_callback_failed") {
      const motivo = params.get("reason");
      if (motivo === "exchange_failed") {
        setErrorMsg(
          "O link chegou, mas não foi possível confirmar o login neste navegador. Isso costuma acontecer quando o link é aberto num navegador ou dispositivo diferente de onde você o pediu — peça um novo link e clique nele no mesmo navegador."
        );
      } else {
        setErrorMsg(
          "O link do email não é mais válido (expirado ou já usado). Peça um novo link e clique nele assim que chegar."
        );
      }
      setStatus("error");
    }
  }, []);

  /**
   * Valida os checkboxes no backend (POST /api/auth/register) ANTES de
   * disparar o fluxo de autenticação do Supabase. Se aprovado, o servidor
   * grava um cookie de curta duração que a rota /auth/callback lê para
   * persistir acceptedTermsAt/acceptedPrivacyAt/isAdultConfirmed no banco
   * — não existe um passo de "registro" tradicional nesse fluxo sem senha,
   * então este é o checkpoint real de validação.
   */
  async function validarConsentimento(emailParaCookie?: string): Promise<boolean> {
    setErroTermos(undefined);
    setErroIdade(undefined);

    if (!aceitouTermos) setErroTermos("Você deve aceitar os Termos de Uso e a Política de Privacidade.");
    if (!confirmouIdade) setErroIdade("Você deve confirmar ser maior de 18 anos.");
    if (!aceitouTermos || !confirmouIdade) return false;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailParaCookie,
        acceptedTerms: true,
        acceptedPrivacy: true,
        isAdultConfirmed: true,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Não foi possível validar seu aceite. Tente novamente.");
      setStatus("error");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const consentimentoOk = await validarConsentimento(email);
    if (!consentimentoOk) return;

    setStatus("loading");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getURL()}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
  }

  async function handleGoogle() {
    setErrorMsg("");
    const consentimentoOk = await validarConsentimento();
    if (!consentimentoOk) return;

    setLoadingGoogle(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getURL()}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      setLoadingGoogle(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <div className="relative hidden w-[60%] flex-col justify-center overflow-hidden bg-gradient-to-br from-primary-hover via-primary to-[#DC2626] px-16 lg:flex">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative z-10 max-w-md">
            <Logo size={48} className="mb-8 [&_span]:text-white [&_span:last-child]:text-white/70" />
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Bem-vindo ao ImportScope
            </h1>
            <p className="mt-4 text-lg text-white/85">
              O dashboard que calcula seu custo real de importação antes do prejuízo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-[40%]">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo size={40} />
            </div>

            {status === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h2 className="text-xl font-semibold text-foreground">Link enviado!</h2>
                <p className="text-sm text-foreground-tertiary">
                  Verifique seu email e clique no link para acessar.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground">Entrar na plataforma</h2>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="voce@empresa.com"
                        required
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-input border border-border bg-background-card p-4">
                    <AgeCheckbox checked={confirmouIdade} onChange={setConfirmouIdade} error={erroIdade} />
                    <TermsCheckbox checked={aceitouTermos} onChange={setAceitouTermos} error={erroTermos} />
                  </div>

                  {status === "error" && <p className="text-sm text-danger">{errorMsg}</p>}

                  <Button type="submit" size="lg" disabled={status === "loading"} className="w-full">
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link mágico"
                    )}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-foreground-tertiary">ou</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleGoogle}
                  disabled={loadingGoogle}
                  className="w-full border-border bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                >
                  {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Continuar com Google
                </Button>

                <p className="mt-6 text-center text-xs text-foreground-tertiary">
                  Não tem conta? Cadastro automático ao entrar.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <LegalFooter />
    </main>
  );
}
