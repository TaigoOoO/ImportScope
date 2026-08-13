import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { obterConfig, atualizarConfig } from "@/lib/app-config";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const config = await obterConfig();
  return NextResponse.json({ config });
}

const putSchema = z.object({
  precoProCentavos: z.coerce.number().int().positive().optional(),
  limiteDiarioFree: z.coerce.number().int().min(0).max(100).optional(),
  textoBannerLegal: z.string().max(500).nullable().optional(),
  modoManutencao: z.boolean().optional(),
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

  const config = await atualizarConfig(parsed.data);
  return NextResponse.json({ ok: true, config });
}
