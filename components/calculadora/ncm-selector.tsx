"use client";

import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NCM_TABLE } from "@/lib/tax-data";
import { cn } from "@/lib/utils";

interface NcmSelectorProps {
  value: string;
  onChange: (ncm: string) => void;
}

export function NcmSelector({ value, onChange }: NcmSelectorProps) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);

  const selecionado = NCM_TABLE.find((n) => n.codigo === value);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return NCM_TABLE;
    return NCM_TABLE.filter(
      (n) => n.codigo.toLowerCase().includes(termo) || n.descricao.toLowerCase().includes(termo)
    );
  }, [busca]);

  return (
    <div className="relative flex flex-col gap-1.5">
      <Label>NCM</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
        <Input
          className="pl-9"
          placeholder={selecionado ? `${selecionado.codigo} — ${selecionado.descricao}` : "Buscar NCM..."}
          value={busca}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 120)}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {aberto && (
        <div className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-input border border-border bg-background-elevated p-1 shadow-elevated scrollbar-thin">
          {filtrados.length === 0 ? (
            <p className="px-3 py-2 text-sm text-foreground-tertiary">Nenhum NCM encontrado.</p>
          ) : (
            filtrados.map((item) => (
              <button
                key={item.codigo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item.codigo);
                  setBusca("");
                  setAberto(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-primary/10 hover:text-primary",
                  value === item.codigo && "text-primary"
                )}
              >
                <span>
                  <span className="font-mono">{item.codigo}</span>
                  <span className="ml-2 text-foreground-tertiary">{item.descricao}</span>
                </span>
                {value === item.codigo && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
