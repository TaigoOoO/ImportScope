import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const DIAS_RETENCAO_LOGS = 90;

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_RETENCAO_LOGS);

  const [analytics, integracoes, emails] = await Promise.all([
    prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: limite } } }),
    prisma.integrationLog.deleteMany({ where: { createdAt: { lt: limite } } }),
    prisma.emailLog.deleteMany({ where: { sentAt: { lt: limite } } }),
  ]);

  return NextResponse.json({
    ok: true,
    removidos: {
      analyticsEvent: analytics.count,
      integrationLog: integracoes.count,
      emailLog: emails.count,
    },
  });
}
