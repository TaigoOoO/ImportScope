import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resgatarRecompensa } from "@/lib/referral";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const resultado = await resgatarRecompensa(user.id);
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.mensagem }, { status: 400 });
  }

  return NextResponse.json({ ok: true, mensagem: resultado.mensagem });
}
