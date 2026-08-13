"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Users, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReferralProgress } from "@/components/referral/referral-progress";
import { trackEvent } from "@/lib/analytics-client";
import { getURL } from "@/lib/site-url";
import type { ProgressoRecompensa } from "@/lib/referral";

interface IndicadoResumo {
  email: string;
  plan: string;
  createdAt: string;
}

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referralCredits: number;
  progresso: ProgressoRecompensa;
  indicados: IndicadoResumo[];
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [resgatando, setResgatando] = useState(false);

  useEffect(() => {
    fetch("/api/referral/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .finally(() => setCarregando(false));
  }, []);

  const link = stats
    ? `${getURL()}/?ref=${stats.referralCode}`
    : "";

  function copiarLink() {
    navigator.clipboard.writeText(link);
    trackEvent("referral_shared", { metodo: "copiar_link" });
    toast.success("Link copiado!");
  }

  async function resgatar() {
    setResgatando(true);
    try {
      const res = await fetch("/api/referral/claim", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Não foi possível resgatar.");
        return;
      }
      toast.success(data.mensagem);
      const atualizado = await fetch("/api/referral/stats").then((r) => r.json());
      setStats(atualizado);
    } finally {
      setResgatando(false);
    }
  }

  if (carregando) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-tertiary" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Seu link de indicação</CardTitle>
          <CardDescription>
            Compartilhe e ganhe 1 mês Pro grátis a cada 3 amigos que assinarem.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input readOnly value={link} className="font-mono text-sm" />
            <Button onClick={copiarLink} className="shrink-0">
              <Copy className="h-4 w-4" />
              Compartilhar Sinal
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
            <Users className="h-4 w-4 text-primary" />
            Você indicou <span className="font-semibold text-foreground">{stats.referralCount}</span>{" "}
            amigo{stats.referralCount === 1 ? "" : "s"}
          </div>

          {stats.progresso.recompensasDisponiveis > 0 && (
            <Button onClick={resgatar} disabled={resgatando} className="w-full sm:w-auto">
              {resgatando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Resgatar mês grátis
            </Button>
          )}

          {stats.indicados.length > 0 && (
            <div className="mt-2 flex flex-col divide-y divide-border rounded-input border border-border">
              {stats.indicados.map((i) => (
                <div key={i.email + i.createdAt} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-foreground-secondary">{i.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={i.plan === "pro" ? "fire" : "secondary"} className="uppercase">
                      {i.plan}
                    </Badge>
                    <span className="text-xs text-foreground-tertiary">
                      {new Intl.DateTimeFormat("pt-BR").format(new Date(i.createdAt))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralProgress progresso={stats.progresso} />
        </CardContent>
      </Card>
    </div>
  );
}
