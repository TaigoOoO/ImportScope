import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const filtrosSchema = z.object({
  categoria: z.string().optional(),
  risco: z.enum(["BAIXO", "MEDIO", "ALTO"]).optional(),
  margemMinima: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = filtrosSchema.safeParse({
      categoria: searchParams.get("categoria") ?? undefined,
      risco: searchParams.get("risco") ?? undefined,
      margemMinima: searchParams.get("margemMinima") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
    }

    const { categoria, risco, margemMinima } = parsed.data;

    const oportunidades = await prisma.oportunidade.findMany({
      where: {
        userId: user.id,
        ...(categoria && categoria !== "todas" ? { categoria } : {}),
        ...(risco ? { risco } : {}),
        ...(margemMinima !== undefined ? { margemEstimada: { gte: margemMinima } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ oportunidades });
  } catch (error) {
    console.error("[GET /api/oportunidades]", error);
    return NextResponse.json({ error: "Erro ao buscar oportunidades." }, { status: 500 });
  }
}
