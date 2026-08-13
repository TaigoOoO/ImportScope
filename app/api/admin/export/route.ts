import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      name: true,
      plan: true,
      subscriptionStatus: true,
      role: true,
      referralCode: true,
      referralCount: true,
      createdAt: true,
      lastLoginAt: true,
      bannedAt: true,
      _count: { select: { oportunidades: true } },
    },
  });

  const colunas = [
    "email",
    "name",
    "plan",
    "subscriptionStatus",
    "role",
    "referralCode",
    "referralCount",
    "oportunidadesGeradas",
    "createdAt",
    "lastLoginAt",
    "bannedAt",
  ];

  const linhas = usuarios.map((u) =>
    [
      u.email,
      u.name,
      u.plan,
      u.subscriptionStatus,
      u.role,
      u.referralCode,
      u.referralCount,
      u._count.oportunidades,
      u.createdAt.toISOString(),
      u.lastLoginAt?.toISOString() ?? "",
      u.bannedAt?.toISOString() ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [colunas.join(","), ...linhas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="importscope-usuarios-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
