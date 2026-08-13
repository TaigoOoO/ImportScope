"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Trash2, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AccountSettingsLegalProps {
  isPro: boolean;
  temAssinatura: boolean;
}

export function AccountSettingsLegal({ isPro, temAssinatura }: AccountSettingsLegalProps) {
  const router = useRouter();
  const [baixando, setBaixando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [abrindoPortal, setAbrindoPortal] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  async function baixarDados() {
    setBaixando(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "importscope-meus-dados.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível baixar seus dados. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  }

  async function excluirConta() {
    setExcluindo(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Solicitação registrada. Seus dados serão anonimizados em até 180 dias.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Não foi possível processar a exclusão. Tente novamente.");
      setExcluindo(false);
    }
  }

  async function abrirPortalStripe() {
    setAbrindoPortal(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Não foi possível abrir o portal de cobrança.");
        setAbrindoPortal(false);
      }
    } catch {
      toast.error("Não foi possível abrir o portal de cobrança.");
      setAbrindoPortal(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Gerencie seu plano e forma de pagamento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-tertiary">Status</span>
            <Badge
              className={
                isPro
                  ? "border-transparent bg-gradient-to-r from-primary to-primary-hover text-white uppercase"
                  : "border-transparent bg-background-elevated text-foreground-secondary uppercase"
              }
            >
              {isPro ? "Pro — ativa" : "Free"}
            </Badge>
          </div>
          {temAssinatura ? (
            <Button variant="outline" onClick={abrirPortalStripe} disabled={abrindoPortal}>
              {abrindoPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Gerenciar assinatura
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <p className="text-sm text-foreground-tertiary">
              Você está no plano Free. Faça upgrade a partir do dashboard para desbloquear
              gerações ilimitadas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seus Dados</CardTitle>
          <CardDescription>
            Nos termos da LGPD, você pode acessar, portar ou excluir seus dados a qualquer
            momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" onClick={baixarDados} disabled={baixando} className="justify-start">
            {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar meus dados
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmarExclusao(true)}
            className="justify-start border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
            Excluir minha conta
          </Button>
          <p className="text-xs text-foreground-tertiary">
            A exclusão é um processo de anonimização: seus dados pessoais (email, nome) são
            removidos em até 180 dias, prazo necessário para cumprimento de obrigações legais e
            fiscais.
          </p>
        </CardContent>
      </Card>

      <Dialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir sua conta?</DialogTitle>
            <DialogDescription>
              Você será desconectado imediatamente. Seus dados pessoais serão anonimizados em até
              180 dias. Esta ação não pode ser desfeita depois de concluída.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-row justify-end gap-3 pt-0">
            <Button variant="outline" onClick={() => setConfirmarExclusao(false)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={excluirConta} disabled={excluindo}>
              {excluindo && <Loader2 className="h-4 w-4 animate-spin" />}
              Sim, excluir minha conta
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
