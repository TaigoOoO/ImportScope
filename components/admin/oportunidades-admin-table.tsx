"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeRisk } from "@/components/shared/badge-risk";
import { formatPercent } from "@/lib/utils";
import type { Risco } from "@/types";

interface OportunidadeAdminLinha {
  id: string;
  nome: string;
  categoria: string;
  margemEstimada: number;
  risco: string;
  usuarioEmail: string;
  createdAt: string;
}

export function OportunidadesAdminTable({ oportunidades: iniciais }: { oportunidades: OportunidadeAdminLinha[] }) {
  const [oportunidades, setOportunidades] = useState(iniciais);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  async function excluir(id: string) {
    setExcluindoId(id);
    try {
      const res = await fetch(`/api/admin/oportunidades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setOportunidades((prev) => prev.filter((o) => o.id !== id));
      toast.success("Oportunidade removida.");
    } catch {
      toast.error("Não foi possível remover.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background-card text-left text-xs uppercase text-foreground-tertiary">
            <th className="px-4 py-3 font-medium">Produto</th>
            <th className="px-4 py-3 font-medium">Usuário</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Margem</th>
            <th className="px-4 py-3 font-medium">Risco</th>
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {oportunidades.map((o) => (
            <tr key={o.id} className="text-foreground-secondary">
              <td className="max-w-[220px] truncate px-4 py-3 text-foreground">{o.nome}</td>
              <td className="px-4 py-3">{o.usuarioEmail}</td>
              <td className="px-4 py-3">{o.categoria}</td>
              <td className="px-4 py-3 font-mono">{formatPercent(o.margemEstimada)}</td>
              <td className="px-4 py-3">
                <BadgeRisk risco={o.risco as Risco} />
              </td>
              <td className="px-4 py-3">{new Intl.DateTimeFormat("pt-BR").format(new Date(o.createdAt))}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => excluir(o.id)}
                  disabled={excluindoId === o.id}
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                >
                  {excluindoId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
