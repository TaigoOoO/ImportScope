"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HorarioPico } from "@/lib/admin-analytics";

export function PeakHoursChart({ horarios }: { horarios: HorarioPico[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de pico de uso</CardTitle>
      </CardHeader>
      <CardContent className="h-56 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={horarios} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="hora" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} interval={2} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="quantidade" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
