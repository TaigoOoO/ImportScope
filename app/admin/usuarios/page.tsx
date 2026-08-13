import { UsersTable } from "@/components/admin/users-table";

export default function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: { busca?: string };
}) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Usuários</h1>
        <p className="text-sm text-foreground-tertiary">Gerencie contas, planos e acesso.</p>
      </div>

      <UsersTable buscaInicial={searchParams.busca ?? ""} />
    </div>
  );
}
