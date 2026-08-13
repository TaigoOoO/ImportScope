import { NextResponse } from "next/server";
import { getCurrentUser, isPro } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obterConfig } from "@/lib/app-config";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const pro = isPro(user);
  if (pro) {
    return NextResponse.json({ isPro: true, usoRestante: null, limite: null });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [registro, config] = await Promise.all([
    prisma.usoDiario.findUnique({ where: { userId_data: { userId: user.id, data: hoje } } }),
    obterConfig(),
  ]);

  const usoRestante = Math.max(0, config.limiteDiarioFree - (registro?.contagem ?? 0));

  return NextResponse.json({ isPro: false, usoRestante, limite: config.limiteDiarioFree });
}
