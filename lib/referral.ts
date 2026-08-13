import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I — evita confusão ao digitar
const TAMANHO_CODIGO = 6;
const CREDITOS_POR_RECOMPENSA = 3;

function gerarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO_CODIGO; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

/**
 * Gera um referralCode único, tentando algumas vezes em caso de colisão
 * (extremamente raro com 6 caracteres em 33 símbolos, ~1.3 bilhão de
 * combinações, mas ainda assim verificamos).
 */
export async function gerarCodigoReferralUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const codigo = gerarCodigo();
    const existente = await prisma.user.findUnique({ where: { referralCode: codigo } });
    if (!existente) return codigo;
  }
  throw new Error("Não foi possível gerar um código de referral único após 10 tentativas.");
}

/**
 * Garante que o usuário tenha um referralCode, gerando um se necessário.
 * Chamado sob demanda (ex: ao abrir /dashboard/indicar ou GET /api/referral/stats)
 * em vez de no momento do cadastro, para não adicionar mais uma escrita ao
 * fluxo já sensível do /auth/callback.
 */
export async function garantirCodigoReferral(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.referralCode) return user.referralCode;

  const codigo = await gerarCodigoReferralUnico();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: codigo } });
  return codigo;
}

export interface ProgressoRecompensa {
  creditos: number;
  creditosParaProxima: number;
  recompensasDisponiveis: number;
}

export function calcularProgresso(referralCredits: number): ProgressoRecompensa {
  const recompensasDisponiveis = Math.floor(referralCredits / CREDITOS_POR_RECOMPENSA);
  const creditosParaProxima = CREDITOS_POR_RECOMPENSA - (referralCredits % CREDITOS_POR_RECOMPENSA);
  return {
    creditos: referralCredits,
    creditosParaProxima: creditosParaProxima === CREDITOS_POR_RECOMPENSA ? 0 : creditosParaProxima,
    recompensasDisponiveis,
  };
}

/**
 * Chamado quando um usuário indicado assina o plano Pro (ver webhook do
 * Stripe). Incrementa os créditos do indicador; NÃO resgata automaticamente
 * — o resgate é uma ação explícita do usuário em /dashboard/indicar,
 * validada em POST /api/referral/claim.
 */
export async function creditarIndicador(referredUserId: string): Promise<void> {
  const indicado = await prisma.user.findUnique({ where: { id: referredUserId } });
  if (!indicado?.referredBy) return;

  await prisma.user.update({
    where: { id: indicado.referredBy },
    data: { referralCredits: { increment: 1 } },
  });
}

/**
 * Resgata uma recompensa de 3 créditos = 1 mês Pro grátis. Em vez de usar
 * apenas `metadata` na Stripe (que por si só não muda cobrança nenhuma —
 * metadata é só armazenamento), a recompensa é aplicada de verdade
 * empurrando `trial_end` da assinatura ativa em 30 dias, o que faz a
 * Stripe pular a próxima cobrança. Isso só funciona se o indicador já
 * tiver uma assinatura Stripe ativa; ver comentário no route handler para
 * o que acontece se ele ainda for Free.
 */
export async function resgatarRecompensa(userId: string): Promise<{ ok: boolean; mensagem: string }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const progresso = calcularProgresso(user.referralCredits);

  if (progresso.recompensasDisponiveis < 1) {
    return { ok: false, mensagem: "Você ainda não tem créditos suficientes para resgatar." };
  }

  if (!user.stripeSubscriptionId) {
    return {
      ok: false,
      mensagem:
        "Você precisa de uma assinatura Pro ativa para resgatar o mês grátis. Assine o Pro e volte aqui.",
    };
  }

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  const baseTimestamp = Math.max(subscription.current_period_end, Math.floor(Date.now() / 1000));
  const novoTrialEnd = baseTimestamp + 30 * 24 * 60 * 60;

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    trial_end: novoTrialEnd,
    proration_behavior: "none",
  });

  await prisma.user.update({
    where: { id: userId },
    data: { referralCredits: { decrement: CREDITOS_POR_RECOMPENSA } },
  });

  return { ok: true, mensagem: "Mês grátis aplicado! Sua próxima cobrança foi adiada em 30 dias." };
}

export { CREDITOS_POR_RECOMPENSA };

/**
 * Resolve um código de referral para o ID do usuário que o possui, ou
 * null se o código não existir. Usado em /auth/callback ao criar uma
 * conta nova a partir de um link `?ref=CODIGO`.
 */
export async function resolverIndicador(codigo: string): Promise<string | null> {
  const referrer = await prisma.user.findUnique({ where: { referralCode: codigo.toUpperCase() } });
  return referrer?.id ?? null;
}
