"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Crown, Ban, ShieldCheck, Download, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsuarioLinha {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  subscriptionStatus: string;
  createdAt: string;
  lastLoginAt: string | null;
  referralCode: string | null;
  role: string;
  bannedAt: string | null;
  _count: { oportunidades: number };
}

interface UsersTableProps {
  buscaInicial?: string;
}

export function UsersTable({ buscaInicial = "" }: UsersTableProps) {
  const [usuarios, setUsuarios] = useState<UsuarioLinha[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState(buscaInicial);
  const [plano, setPlano] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);

  const buscarUsuarios = useCallback(async () => {
    setCarregando(true);
    const params = new URLSearchParams({ pagina: String(pagina) });
    if (busca) params.set("busca", busca);
    if (plano !== "todos") params.set("plano", plano);
    if (status !== "todos") params.set("status", status);

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios);
        setTotal(data.total);
        setTotalPaginas(data.totalPaginas);
      }
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca, plano, status]);

  useEffect(() => {
    buscarUsuarios();
  }, [buscarUsuarios]);

  async function executarAcao(userId: string, action: "promote" | "demote" | "ban" | "unban") {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Não foi possível executar a ação.");
      return;
    }
    toast.success("Atualizado com sucesso.");
    buscarUsuarios();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Buscar por email..."
            value={busca}
            onChange={(e) => {
              setPagina(1);
              setBusca(e.target.value);
            }}
          />
        </div>
        <Select
          value={plano}
          onValueChange={(v) => {
            setPagina(1);
            setPlano(v);
          }}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setPagina(1);
            setStatus(v);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="trialing">Trial</SelectItem>
            <SelectItem value="inactive">Inativa</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" asChild>
          <a href="/api/admin/export">
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-card text-left text-xs uppercase text-foreground-tertiary">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3 font-medium">Oportunidades</th>
              <th className="px-4 py-3 font-medium">Referral</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {carregando ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-foreground-tertiary" />
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-foreground-tertiary">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="text-foreground-secondary">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{u.email}</span>
                      {u.role === "admin" && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                      {u.bannedAt && (
                        <Badge variant="danger" className="text-[10px]">
                          Banido
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.plan === "pro" ? "fire" : "secondary"} className="uppercase">
                      {u.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.subscriptionStatus}</td>
                  <td className="px-4 py-3">{new Intl.DateTimeFormat("pt-BR").format(new Date(u.createdAt))}</td>
                  <td className="px-4 py-3 font-mono">{u._count.oportunidades}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.referralCode ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.plan === "pro" ? (
                          <DropdownMenuItem onClick={() => executarAcao(u.id, "demote")}>
                            Remover Pro
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => executarAcao(u.id, "promote")}>
                            <Crown className="mr-2 h-3.5 w-3.5" />
                            Promover a Pro
                          </DropdownMenuItem>
                        )}
                        {u.bannedAt ? (
                          <DropdownMenuItem onClick={() => executarAcao(u.id, "unban")}>
                            Reativar acesso
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => executarAcao(u.id, "ban")}
                            className="text-danger focus:text-danger"
                          >
                            <Ban className="mr-2 h-3.5 w-3.5" />
                            Banir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground-tertiary">
        <span>{total} usuário{total === 1 ? "" : "s"} no total</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            size="icon"
            variant="outline"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
