import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { obterConfig } from "@/lib/app-config";
import type { User } from "@prisma/client";

/**
 * Resolves the currently authenticated user from the Supabase session cookie
 * and returns the matching row from our own `User` table (creating it on
 * first sight, in case the auth callback hasn't run for this session yet).
 * Returns null when there is no authenticated session.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const user = await prisma.user.upsert({
    where: { email: authUser.email },
    update: {},
    create: { email: authUser.email },
  });

  return user;
}

export function isPro(user: Pick<User, "subscriptionStatus" | "plan">): boolean {
  return user.plan === "pro" || user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
}

/**
 * Checks and, if allowed, increments today's usage counter for a free-tier
 * user. Returns whether the action is allowed and how many generations
 * remain today. O limite vem de AppConfig (editável em /admin/config) em
 * vez da constante fixa — LIMITE_GERACOES_FREE em lib/constants.ts
 * continua existindo só como o valor padrão de fallback/seed.
 */
export async function checarEIncrementarUsoDiario(
  userId: string
): Promise<{ permitido: boolean; restante: number; limite: number }> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [registro, config] = await Promise.all([
    prisma.usoDiario.upsert({
      where: { userId_data: { userId, data: hoje } },
      update: {},
      create: { userId, data: hoje, contagem: 0 },
    }),
    obterConfig(),
  ]);

  const limite = config.limiteDiarioFree;

  if (registro.contagem >= limite) {
    return { permitido: false, restante: 0, limite };
  }

  const atualizado = await prisma.usoDiario.update({
    where: { id: registro.id },
    data: { contagem: { increment: 1 } },
  });

  return {
    permitido: true,
    restante: Math.max(0, limite - atualizado.contagem),
    limite,
  };
}
