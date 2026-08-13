"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

function estaDigitando(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const bufferRef = useRef("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (estaDigitando(e.target)) return;

      // Cmd/Ctrl+K — abre a command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-command-palette"));
        return;
      }

      // "/" também abre a command palette (padrão comum, ex: GitHub)
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-command-palette"));
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("show-shortcuts"));
        return;
      }

      // Sequência "g" + letra — vai para uma rota
      if (bufferRef.current === "g") {
        bufferRef.current = "";
        clearTimeout(timeoutRef.current);
        const destinos: Record<string, string> = {
          d: "/dashboard",
          o: "/dashboard/oportunidades",
          c: "/dashboard/calculadora",
          s: "/dashboard/configuracoes",
        };
        const destino = destinos[e.key];
        if (destino) {
          e.preventDefault();
          router.push(destino);
        }
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        bufferRef.current = "g";
        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
        }, 1000);
        return;
      }

      // "n" — gera uma oportunidade. Se já estiver na página, dispara na
      // hora (GenerateButton escuta esse evento); se não, só navega —
      // decidido de propósito para não disparar uma chamada de IA real
      // (que conta no limite diário) de um lugar onde o usuário não
      // consegue ver o botão sendo acionado.
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (pathname === "/dashboard/oportunidades") {
          window.dispatchEvent(new CustomEvent("generate-opportunity"));
        } else {
          router.push("/dashboard/oportunidades");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [router, pathname]);
}
