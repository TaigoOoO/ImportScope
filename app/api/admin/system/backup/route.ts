import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Isto é um export JSON das tabelas principais, não um backup binário de
 * verdade do Postgres (pg_dump). Um backup real precisa rodar no nível de
 * infraestrutura — o próprio Supabase já faz backups automáticos diários
 * do banco (Dashboard → Database → Backups) que incluem tudo (índices,
 * schema, WAL). Isto aqui serve para inspeção rápida/migração pontual,
 * não como estratégia de disaster recovery.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const [
    usuarios,
    oportunidades,
    analises,
    usoDiario,
    emailLogs,
    analyticsEvents,
    integrationLogs,
    waitlist,
    config,
    templateOverrides,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.oportunidade.findMany(),
    prisma.analise.findMany(),
    prisma.usoDiario.findMany(),
    prisma.emailLog.findMany(),
    prisma.analyticsEvent.findMany(),
    prisma.integrationLog.findMany(),
    prisma.waitlistEntry.findMany(),
    prisma.appConfig.findMany(),
    prisma.emailTemplateOverride.findMany(),
  ]);

  const backup = {
    geradoEm: new Date().toISOString(),
    aviso: "Export a nível de aplicação, não um backup binário do Postgres. Ver comentário na rota.",
    tabelas: {
      usuarios,
      oportunidades,
      analises,
      usoDiario,
      emailLogs,
      analyticsEvents,
      integrationLogs,
      waitlist,
      config,
      templateOverrides,
    },
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="importscope-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
