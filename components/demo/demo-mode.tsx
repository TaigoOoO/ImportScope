"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoModeAtivo, definirDemoModeAtivo, onDemoModeChange } from "@/lib/demo-mode";

/**
 * Fica só em /admin — um toggle que "pilota" o app sozinho não tem uso
 * pra um cliente normal, faz mais sentido restringir a quem está gravando
 * um vídeo de demonstração.
 *
 * Este componente só liga/desliga a flag (via lib/demo-mode.ts) e navega
 * para o dashboard ao ligar — quem de fato roda o timer de navegação é
 * `DemoModeRunner`, montado em app/dashboard/layout.tsx, que sobrevive à
 * troca de páginas (ao contrário deste componente aqui, que fica numa
 * página específica do admin e seria desmontado assim que a navegação
 * começasse, o que mataria um timer se ele vivesse aqui).
 */
export function DemoMode() {
  const router = useRouter();
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    setAtivo(demoModeAtivo());
    return onDemoModeChange(setAtivo);
  }, []);

  function alternar() {
    const novoValor = !ativo;
    definirDemoModeAtivo(novoValor);
    if (novoValor) router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-2 rounded-input border border-border bg-background-card px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <Button variant="outline" size="sm" onClick={alternar}>
        {ativo ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {ativo ? "Parar demo" : "Iniciar modo demo"}
      </Button>
      {ativo && (
        <Badge variant="fire" className="w-fit animate-pulse">
          Ativo — navegando no dashboard
        </Badge>
      )}
      <p className="text-xs text-foreground-tertiary">
        Passeia pelas telas principais automaticamente. Não gera oportunidades de verdade — isso
        chamaria a IA e gastaria cota diária. Um botão para parar fica visível no dashboard
        enquanto estiver ativo.
      </p>
    </div>
  );
}
