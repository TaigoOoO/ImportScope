import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [oportunidades, analises, usoDiario] = await Promise.all([
    prisma.oportunidade.findMany({ where: { userId: user.id } }),
    prisma.analise.findMany({ where: { userId: user.id } }),
    prisma.usoDiario.findMany({ where: { userId: user.id } }),
  ]);

  const exportacao = {
    geradoEm: new Date().toISOString(),
    usuario: {
      email: user.email,
      name: user.name,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      acceptedTermsAt: user.acceptedTermsAt,
      acceptedPrivacyAt: user.acceptedPrivacyAt,
      criadoEm: user.createdAt,
    },
    oportunidades,
    analises,
    usoDiario,
  };

  return new NextResponse(JSON.stringify(exportacao, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="importscope-meus-dados.json"',
    },
  });
}
