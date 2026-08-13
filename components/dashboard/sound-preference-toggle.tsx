"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { somAtivado, definirSomAtivado, playSound } from "@/lib/sounds";

export function SoundPreferenceToggle() {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    setAtivo(somAtivado());
  }, []);

  function alternar() {
    const novoValor = !ativo;
    definirSomAtivado(novoValor);
    setAtivo(novoValor);
    if (novoValor) playSound("success"); // toca na hora, como confirmação de que está ligado
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sons</CardTitle>
        <CardDescription>Feedback sonoro sutil em ações como gerar oportunidade. Desligado por padrão.</CardDescription>
      </CardHeader>
      <CardContent>
        <button
          onClick={alternar}
          className="flex items-center gap-2 rounded-input border border-border bg-background-card px-4 py-2 text-sm text-foreground-secondary transition-colors hover:text-foreground"
        >
          {ativo ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
          {ativo ? "Sons ativados" : "Sons desativados"}
        </button>
      </CardContent>
    </Card>
  );
}
