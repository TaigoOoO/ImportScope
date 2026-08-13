"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AtividadePonto {
  data: string; // rótulo curto, ex: "12/07"
  oportunidades: number;
}

interface ActivityChartProps {
  pontos: AtividadePonto[];
}

function gerarMockPontos(): AtividadePonto[] {
  const hoje = new Date();
  const pontos: AtividadePonto[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    pontos.push({
      data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      oportunidades: Math.floor(Math.random() * 3),
    });
  }
  return pontos;
}

export function ActivityChart({ pontos }: ActivityChartProps) {
  const dados = pontos.length > 0 ? pontos : gerarMockPontos();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade de Importação</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="corAtividade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="data"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #1E293B",
                borderRadius: 8,
                fontSize: 12,
                color: "#F8FAFC",
              }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <Area
              type="monotone"
              dataKey="oportunidades"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#corAtividade)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
