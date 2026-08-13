import { prisma } from "@/lib/prisma";
import { OportunidadesAdminTable } from "@/components/admin/oportunidades-admin-table";

export default async function AdminOportunidadesPage() {
  const oportunidades = await prisma.oportunidade.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Oportunidades</h1>
        <p className="text-sm text-foreground-tertiary">
          Últimas 100 oportunidades geradas por todos os usuários.
        </p>
      </div>

      <OportunidadesAdminTable
        oportunidades={oportunidades.map((o) => ({
          id: o.id,
          nome: o.nome,
          categoria: o.categoria,
          margemEstimada: o.margemEstimada,
          risco: o.risco,
          usuarioEmail: o.user.email,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
