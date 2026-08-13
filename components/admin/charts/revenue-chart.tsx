"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import type { PontoSerieDiaria } from "@/lib/admin-stats";

interface RevenueChartProps {
  pontos: PontoSerieDiaria[];
}

export function RevenueChart({ pontos }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Acumulada (30 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="corReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="data" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} interval={4} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip
              formatter={(value: number) => [formatBRL(value), "Receita acumulada"]}
              contentStyle={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <Area type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} fill="url(#corReceita)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
