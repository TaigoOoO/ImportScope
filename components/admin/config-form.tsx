"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Database, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigFormProps {
  configInicial: {
    precoProCentavos: number;
    limiteDiarioFree: number;
    textoBannerLegal: string | null;
    modoManutencao: boolean;
  };
}

export function ConfigForm({ configInicial }: ConfigFormProps) {
  const [precoReais, setPrecoReais] = useState((configInicial.precoProCentavos / 100).toFixed(2));
  const [limite, setLimite] = useState(String(configInicial.limiteDiarioFree));
  const [banner, setBanner] = useState(configInicial.textoBannerLegal ?? "");
  const [manutencao, setManutencao] = useState(configInicial.modoManutencao);
  const [salvando, setSalvando] = useState(false);

  const [rodandoSeed, setRodandoSeed] = useState(false);
  const [limpandoLogs, setLimpandoLogs] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          precoProCentavos: Math.round(Number(precoReais) * 100),
          limiteDiarioFree: Number(limite),
          textoBannerLegal: banner || null,
          modoManutencao: manutencao,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Configurações salvas.");
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function rodarSeed() {
    setRodandoSeed(true);
    try {
      const res = await fetch("/api/admin/system/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      toast.success(`${data.criadas} oportunidades de exemplo criadas.`);
    } catch {
      toast.error("Não foi possível rodar o seed.");
    } finally {
      setRodandoSeed(false);
    }
  }

  async function limparLogs() {
    setLimpandoLogs(true);
    try {
      const res = await fetch("/api/admin/system/clean-logs", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      const total = Object.values(data.removidos).reduce((a: number, b) => a + (b as number), 0);
      toast.success(`${total} registros antigos removidos.`);
    } catch {
      toast.error("Não foi possível limpar os logs.");
    } finally {
      setLimpandoLogs(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações globais</CardTitle>
          <CardDescription>
            Preço do Pro é só exibido no app — não muda o valor cobrado pela Stripe (isso exige
            trocar o Price no Dashboard da Stripe). O limite diário Free e o texto do banner legal
            afetam o app de verdade, em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Preço do plano Pro (R$)</Label>
              <Input type="number" step="0.01" value={precoReais} onChange={(e) => setPrecoReais(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Limite diário — plano Free</Label>
              <Input type="number" min="0" value={limite} onChange={(e) => setLimite(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Texto do banner legal (deixe em branco para usar o padrão)</Label>
            <textarea
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              rows={3}
              className="rounded-input border border-border bg-background-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground-secondary">
            <input
              type="checkbox"
              checked={manutencao}
              onChange={(e) => setManutencao(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Ativar modo manutenção (bloqueia o dashboard para não-admins)
          </label>

          <Button onClick={salvar} disabled={salvando} className="w-fit">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações de sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={rodarSeed} disabled={rodandoSeed}>
            {rodandoSeed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Rodar seed de produtos
          </Button>
          <Button variant="outline" onClick={limparLogs} disabled={limpandoLogs}>
            {limpandoLogs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Limpar logs antigos (90+ dias)
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/system/backup">
              <Download className="h-4 w-4" />
              Exportar backup (JSON)
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
