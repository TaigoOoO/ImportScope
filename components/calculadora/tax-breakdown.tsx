"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Tooltip as InfoTooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formatBRL, formatPercent } from "@/lib/utils";
import type { CalculoTributarioOutput } from "@/types";

interface TaxBreakdownProps {
  resultado: CalculoTributarioOutput;
}

const EXPLICACOES: Partial<Record<keyof CalculoTributarioOutput["breakdown"], string>> = {
  cif: "Cost, Insurance and Freight: soma do valor FOB, frete internacional e seguro. É a base sobre a qual os demais tributos incidem.",
  ii: "Imposto de Importação: alíquota federal que varia por NCM, incide sobre o valor CIF.",
  ipi: "Imposto sobre Produtos Industrializados: incide sobre CIF + II, alíquota também varia por NCM.",
  pis: "PIS-Importação: contribuição federal de 1,65% sobre CIF + II + IPI.",
  cofins: "COFINS-Importação: contribuição federal de 7,6% sobre CIF + II + IPI.",
  icms: 'Imposto sobre Circulação de Mercadorias: varia por estado (SP 18%, RJ 20%, MG 18%...). Calculado "por dentro" — a base já inclui o próprio ICMS, por isso a fórmula divide em vez de só multiplicar.',
  afrmm: "Adicional ao Frete para Renovação da Marinha Mercante: 25% do frete internacional, só em transporte marítimo.",
};

const LINHAS: { chave: keyof CalculoTributarioOutput["breakdown"]; label: string; destaque?: boolean }[] = [
  { chave: "cif", label: "CIF (FOB + Frete + Seguro)" },
  { chave: "ii", label: "II — Imposto de Importação" },
  { chave: "ipi", label: "IPI" },
  { chave: "pis", label: "PIS (1,65%)" },
  { chave: "cofins", label: "COFINS (7,6%)" },
  { chave: "icms", label: "ICMS", destaque: true },
  { chave: "afrmm", label: "AFRMM" },
];

function valorDaLinha(resultado: CalculoTributarioOutput, chave: keyof CalculoTributarioOutput["breakdown"]) {
  const item = resultado.breakdown[chave];
  if (typeof item === "number") return item;
  return item.valor;
}

function LabelComTooltip({ label, explicacao }: { label: string; explicacao?: string }) {
  if (!explicacao) return <span className="text-foreground-secondary">{label}</span>;

  return (
    <TooltipProvider delayDuration={150}>
      <InfoTooltip>
        <TooltipTrigger className="cursor-help border-b border-dashed border-border-active text-left text-foreground-secondary">
          {label}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs text-foreground-secondary">{explicacao}</p>
        </TooltipContent>
      </InfoTooltip>
    </TooltipProvider>
  );
}

export function TaxBreakdown({ resultado }: TaxBreakdownProps) {
  const dadosPizza = [
    { name: "II", value: resultado.breakdown.ii.valor, color: "#F97316" },
    { name: "ICMS", value: resultado.breakdown.icms.valor, color: "#3B82F6" },
    {
      name: "Outros",
      value:
        resultado.breakdown.ipi.valor +
        resultado.breakdown.pis.valor +
        resultado.breakdown.cofins.valor +
        resultado.breakdown.afrmm.valor +
        resultado.breakdown.siscomex,
      color: "#64748B",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="flex flex-1 flex-col divide-y divide-border">
        {LINHAS.map(({ chave, label, destaque }) => (
          <div key={chave} className="flex items-center justify-between py-2.5 text-sm">
            <LabelComTooltip label={label} explicacao={EXPLICACOES[chave]} />
            <span className={destaque ? "font-mono font-semibold text-foreground" : "font-mono text-foreground-secondary"}>
              {formatBRL(valorDaLinha(resultado, chave))}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5 text-sm">
          <span className="text-foreground-secondary">Taxa Siscomex</span>
          <span className="font-mono text-foreground-secondary">{formatBRL(resultado.breakdown.siscomex)}</span>
        </div>
      </div>

      {dadosPizza.length > 0 && (
        <div className="h-40 w-full shrink-0 sm:w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dadosPizza} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={2}>
                {dadosPizza.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatBRL(value), name]}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-foreground-tertiary">
            {dadosPizza.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({formatPercent((d.value / resultado.custoTotalBRL) * 100, 0)})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
