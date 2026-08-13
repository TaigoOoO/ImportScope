import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { rodarSeedProdutos } from "@/lib/seed-produtos";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const resultado = await rodarSeedProdutos();
  return NextResponse.json({ ok: true, ...resultado });
}
