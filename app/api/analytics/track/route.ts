import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const schema = z.object({
  eventType: z.string().min(1).max(64),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  // Resolve o usuário se houver sessão, mas eventos anônimos (ex: page_view
  // na landing antes do login) são válidos — userId fica null.
  let userId: string | undefined;
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser?.email) {
      const user = await prisma.user.findUnique({ where: { email: authUser.email } });
      userId = user?.id;
    }
  } catch {
    // Sem sessão — segue anônimo.
  }

  await prisma.analyticsEvent.create({
    data: {
      eventType: parsed.data.eventType,
      metadata: parsed.data.metadata as object | undefined,
      sessionId: parsed.data.sessionId,
      userId,
    },
  });

  return NextResponse.json({ ok: true });
}
