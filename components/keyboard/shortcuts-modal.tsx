"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ATALHOS = [
  { keys: ["⌘", "K"], description: "Abrir busca de comandos" },
  { keys: ["/"], description: "Abrir busca de comandos" },
  { keys: ["G", "D"], description: "Ir para Dashboard" },
  { keys: ["G", "O"], description: "Ir para Oportunidades" },
  { keys: ["G", "C"], description: "Ir para Calculadora" },
  { keys: ["G", "S"], description: "Ir para Configurações" },
  { keys: ["N"], description: "Escanear Mercado" },
  { keys: ["?"], description: "Ver estes atalhos" },
  { keys: ["Esc"], description: "Fechar modal" },
];

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("show-shortcuts", handler);
    return () => window.removeEventListener("show-shortcuts", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Keyboard className="h-5 w-5 text-primary" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2.5 px-6 pb-6">
          {ATALHOS.map((atalho, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground-secondary">{atalho.description}</span>
              <div className="flex gap-1">
                {atalho.keys.map((tecla) => (
                  <kbd
                    key={tecla}
                    className="min-w-[24px] rounded border border-border bg-background-elevated px-1.5 py-0.5 text-center font-mono text-xs text-foreground"
                  >
                    {tecla}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
