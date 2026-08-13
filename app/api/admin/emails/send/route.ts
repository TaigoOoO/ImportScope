import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enviarEmail, templatePersonalizado } from "@/lib/email-templates";

const schema = z.object({
  assunto: z.string().min(1).max(200),
  corpo: z.string().min(1).max(5000),
  segmento: z.enum(["todos", "free", "pro"]),
});

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { assunto, corpo, segmento } = parsed.data;

  const destinatarios = await prisma.user.findMany({
    where: {
      deletionRequestedAt: null,
      bannedAt: null,
      ...(segmento !== "todos" ? { plan: segmento } : {}),
    },
    select: { id: true, email: true },
  });

  const template = templatePersonalizado({ assunto, corpo });

  for (const destinatario of destinatarios) {
    await enviarEmail(destinatario.email, template);
    await prisma.emailLog.create({ data: { userId: destinatario.id, type: "manual" } });
  }

  return NextResponse.json({ ok: true, enviados: destinatarios.length });
}
