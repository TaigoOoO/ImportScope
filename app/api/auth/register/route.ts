import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { gravarConsentoPendente } from "@/lib/consent-cookie";

const schema = z.object({
  email: z.string().email().optional(), // opcional: no fluxo Google OAuth ainda não sabemos o email
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os Termos de Uso e a Política de Privacidade." }),
  }),
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar a Política de Privacidade." }),
  }),
  isAdultConfirmed: z.literal(true, {
    errorMap: () => ({ message: "Você deve confirmar ser maior de 18 anos." }),
  }),
});

/**
 * Não cria a conta em si — a conta é criada pelo Supabase Auth quando o
 * usuário confirma o magic link ou completa o OAuth. Esta rota é o
 * checkpoint de backend exigido pela regra "sempre valide no backend":
 * se os checkboxes não vierem marcados, rejeitamos aqui, antes mesmo de
 * iniciar o fluxo de autenticação.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const primeiraMensagem = parsed.error.issues[0]?.message ?? "Dados de cadastro inválidos.";
    return NextResponse.json({ error: primeiraMensagem }, { status: 400 });
  }

  gravarConsentoPendente({
    email: parsed.data.email,
    acceptedTerms: parsed.data.acceptedTerms,
    acceptedPrivacy: parsed.data.acceptedPrivacy,
    isAdultConfirmed: parsed.data.isAdultConfirmed,
  });

  return NextResponse.json({ ok: true });
}
