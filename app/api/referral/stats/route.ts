import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { garantirCodigoReferral, calcularProgresso } from "@/lib/referral";
import { prisma } from "@/lib/prisma";

function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, 2);
  return `${visivel}${"*".repeat(Math.max(1, usuario.length - 2))}@${dominio}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const referralCode = await garantirCodigoReferral(user.id);

  const indicados = await prisma.user.findMany({
    where: { referredBy: user.id },
    select: { email: true, plan: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    referralCode,
    referralCount: user.referralCount,
    referralCredits: user.referralCredits,
    progresso: calcularProgresso(user.referralCredits),
    indicados: indicados.map((i) => ({
      email: mascararEmail(i.email),
      plan: i.plan,
      createdAt: i.createdAt,
    })),
  });
}
