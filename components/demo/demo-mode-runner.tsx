"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Square, Radar } from "lucide-react";
import { demoModeAtivo, definirDemoModeAtivo, onDemoModeChange } from "@/lib/demo-mode";

const ROTEIRO = ["/dashboard", "/dashboard/oportunidades", "/dashboard/calculadora", "/dashboard/indicar"];
const INTERVALO_MS = 6000;

export function DemoModeRunner() {
  const router = useRouter();
  const pathname = usePathname();
  const [ativo, setAtivo] = useState(false);
  const passoRef = useRef(0);

  useEffect(() => {
    setAtivo(demoModeAtivo());
    return onDemoModeChange(setAtivo);
  }, []);

  // Mantém o passo atual sincronizado com a página em que já estamos, para
  // o roteiro continuar de onde parou em vez de sempre reiniciar do zero.
  useEffect(() => {
    const indice = ROTEIRO.indexOf(pathname);
    if (indice !== -1) passoRef.current = indice;
  }, [pathname]);

  useEffect(() => {
    if (!ativo) return;
    const intervalo = setInterval(() => {
      passoRef.current = (passoRef.current + 1) % ROTEIRO.length;
      router.push(ROTEIRO[passoRef.current]);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [ativo, router]);

  if (!ativo) return null;

  return (
    <button
      onClick={() => definirDemoModeAtivo(false)}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-pill border border-primary/40 bg-background-card px-4 py-2 text-sm text-foreground shadow-elevated md:bottom-4"
    >
      <Radar className="h-4 w-4 animate-pulse text-primary" />
      Demo ativo
      <Square className="h-3.5 w-3.5 text-foreground-tertiary" />
    </button>
  );
}
