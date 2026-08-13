import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const TIPOS_CONHECIDOS = [
  "welcome",
  "first_login_tour",
  "first_opportunity",
  "reengagement",
  "upgrade_push",
  "pro_onboarding",
  "renewal_reminder",
  "cancellation",
  "winback",
];

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const overrides = await prisma.emailTemplateOverride.findMany();
  const overrideMap = new Map(overrides.map((o) => [o.type, o]));

  const tipos = TIPOS_CONHECIDOS.map((type) => ({
    type,
    override: overrideMap.get(type) ?? null,
  }));

  return NextResponse.json({ tipos });
}

const putSchema = z.object({
  type: z.string().min(1),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(5000),
});

export async function PUT(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const override = await prisma.emailTemplateOverride.upsert({
    where: { type: parsed.data.type },
    update: { subject: parsed.data.subject, bodyText: parsed.data.bodyText, updatedBy: admin.email },
    create: { ...parsed.data, updatedBy: admin.email },
  });

  return NextResponse.json({ ok: true, override });
}
