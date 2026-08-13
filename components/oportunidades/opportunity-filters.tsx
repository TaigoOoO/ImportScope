"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS } from "@/lib/constants";
import type { Risco } from "@/types";

const RISCOS: { value: Risco | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os riscos" },
  { value: "BAIXO", label: "🟢 Baixo" },
  { value: "MEDIO", label: "🟡 Médio" },
  { value: "ALTO", label: "🔴 Alto" },
];

export interface OpportunityFiltersValue {
  categoria: string;
  risco: Risco | "todos";
  margemMinima: string;
}

interface OpportunityFiltersProps {
  value: OpportunityFiltersValue;
  onChange: (value: OpportunityFiltersValue) => void;
}

export function OpportunityFilters({ value, onChange }: OpportunityFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-background-card p-4 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label>Categoria</Label>
        <Select value={value.categoria} onValueChange={(categoria) => onChange({ ...value, categoria })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <Label>Risco</Label>
        <Select
          value={value.risco}
          onValueChange={(risco) => onChange({ ...value, risco: risco as Risco | "todos" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RISCOS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="margemMinima">Margem mínima (%)</Label>
        <Input
          id="margemMinima"
          type="number"
          min="0"
          placeholder="Ex: 40"
          value={value.margemMinima}
          onChange={(e) => onChange({ ...value, margemMinima: e.target.value })}
        />
      </div>
    </div>
  );
}
