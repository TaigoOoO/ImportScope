import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const DIAS_RETENCAO = 90;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_RETENCAO);

  const resultado = await prisma.integrationLog.deleteMany({ where: { createdAt: { lt: limite } } });

  return NextResponse.json({ ok: true, removidos: resultado.count });
}
