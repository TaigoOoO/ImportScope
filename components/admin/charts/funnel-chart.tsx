"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EtapaFunil {
  etapa: string;
  quantidade: number;
}

interface FunnelChartProps {
  etapas: EtapaFunil[];
}

const CORES = ["#F97316", "#EA580C", "#DC2626", "#991B1B"];

export function FunnelChart({ etapas }: FunnelChartProps) {
  const dados = etapas.map((e, i) => {
    const anterior = i > 0 ? etapas[i - 1].quantidade : e.quantidade;
    const dropOffPct = anterior > 0 ? ((anterior - e.quantidade) / anterior) * 100 : 0;
    return { ...e, dropOffPct: i === 0 ? 0 : dropOffPct };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ left: 24, right: 24 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="etapa"
              stroke="#94A3B8"
              fontSize={12}
              width={110}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, _name, entry) => [
                `${value} (${entry.payload.dropOffPct > 0 ? `-${entry.payload.dropOffPct.toFixed(0)}%` : "—"})`,
                "Usuários",
              ]}
              contentStyle={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="quantidade" radius={[0, 6, 6, 0]}>
              {dados.map((_, i) => (
                <Cell key={i} fill={CORES[i % CORES.length]} />
              ))}
              <LabelList dataKey="quantidade" position="right" fill="#F8FAFC" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
