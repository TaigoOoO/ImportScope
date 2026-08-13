"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PontoSerieDiaria, FatiaCategoria, DistribuicaoPlanos } from "@/lib/admin-stats";

const TOOLTIP_STYLE = {
  background: "#111827",
  border: "1px solid #1E293B",
  borderRadius: 8,
  fontSize: 12,
};

export function NewUsersLineChart({ pontos }: { pontos: PontoSerieDiaria[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novos usuários (30 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pontos} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="data" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} interval={4} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#94A3B8" }} />
            <Line type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoriaBarChart({ fatias }: { fatias: FatiaCategoria[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidades por categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fatias} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="categoria" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="quantidade" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const CORES_PLANO: Record<string, string> = { pro: "#F97316", free: "#334155" };

export function PlanosPieChart({ distribuicao }: { distribuicao: DistribuicaoPlanos[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Free vs Pro</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={distribuicao} dataKey="quantidade" nameKey="plano" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {distribuicao.map((d) => (
                <Cell key={d.plano} fill={CORES_PLANO[d.plano] ?? "#64748B"} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend
              formatter={(value) => <span className="text-xs text-foreground-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
