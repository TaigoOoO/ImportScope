import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  calcularKpisGerais,
  calcularNovosUsuariosPorDia,
  calcularReceitaAcumulada,
  calcularOportunidadesPorCategoria,
  calcularDistribuicaoPlanos,
} from "@/lib/admin-stats";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const [kpis, novosUsuarios, receita, categorias, planos] = await Promise.all([
    calcularKpisGerais(),
    calcularNovosUsuariosPorDia(30),
    calcularReceitaAcumulada(30),
    calcularOportunidadesPorCategoria(),
    calcularDistribuicaoPlanos(),
  ]);

  return NextResponse.json({ kpis, novosUsuarios, receita, categorias, planos });
}
