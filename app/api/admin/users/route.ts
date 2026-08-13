import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const POR_PAGINA = 50;

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("busca") ?? undefined;
  const plano = searchParams.get("plano") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const pagina = Math.max(1, Number(searchParams.get("pagina") ?? "1") || 1);

  const where = {
    ...(busca ? { email: { contains: busca, mode: "insensitive" as const } } : {}),
    ...(plano && plano !== "todos" ? { plan: plano } : {}),
    ...(status && status !== "todos" ? { subscriptionStatus: status } : {}),
  };

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
        createdAt: true,
        lastLoginAt: true,
        referralCode: true,
        role: true,
        bannedAt: true,
        _count: { select: { oportunidades: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    usuarios,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  });
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["promote", "demote", "ban", "unban"]),
});

export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { userId, action } = parsed.data;

  if (userId === admin.id && (action === "ban" || action === "demote")) {
    return NextResponse.json({ error: "Você não pode banir ou remover seu próprio acesso admin." }, { status: 400 });
  }

  const data =
    action === "promote"
      ? { plan: "pro" }
      : action === "demote"
        ? { plan: "free" }
        : action === "ban"
          ? { bannedAt: new Date() }
          : { bannedAt: null };

  const usuario = await prisma.user.update({ where: { id: userId }, data });

  return NextResponse.json({ ok: true, usuario });
}
