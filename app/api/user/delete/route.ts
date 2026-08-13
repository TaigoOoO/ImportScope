import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * LGPD permite reter dados por obrigação legal (ex: registros fiscais de
 * cobrança) mesmo após pedido de exclusão — por isso isto é um soft delete:
 * marcamos `deletionRequestedAt` agora, e a anonimização de fato (remoção
 * de email/nome) acontece 180 dias depois, via
 * `app/api/cron/anonimizar-contas/route.ts`.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { deletionRequestedAt: new Date() },
  });

  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
