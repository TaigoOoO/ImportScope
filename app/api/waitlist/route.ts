import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enviarEmail, templateBoasVindasListaEspera } from "@/lib/email-templates";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  try {
    await prisma.waitlistEntry.create({ data: { email: parsed.data.email } });
    await enviarEmail(parsed.data.email, templateBoasVindasListaEspera());
  } catch (err) {
    // P2002 = violação de unique constraint — já estava na lista, não é um erro de verdade.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ ok: true, jaEstavaNaLista: true });
    }
    console.error("[POST /api/waitlist]", err);
    return NextResponse.json({ error: "Não foi possível registrar seu email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
