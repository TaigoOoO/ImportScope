"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Calculator,
  Gift,
  Settings,
  Sparkles,
  Crown,
  LogOut,
  Keyboard,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";

interface Comando {
  id: string;
  label: string;
  grupo: "Navegação" | "Ações" | "Conta";
  icon: LucideIcon;
  atalho?: string;
  keywords?: string;
  onSelect: (ctx: { router: ReturnType<typeof useRouter> }) => void | Promise<void>;
}

const COMANDOS: Comando[] = [
  { id: "dashboard", label: "Ir para Dashboard", grupo: "Navegação", icon: LayoutDashboard, atalho: "G D", onSelect: ({ router }) => router.push("/dashboard") },
  { id: "oportunidades", label: "Ir para Oportunidades", grupo: "Navegação", icon: TrendingUp, atalho: "G O", onSelect: ({ router }) => router.push("/dashboard/oportunidades") },
  { id: "calculadora", label: "Ir para Calculadora", grupo: "Navegação", icon: Calculator, atalho: "G C", onSelect: ({ router }) => router.push("/dashboard/calculadora") },
  { id: "indicar", label: "Ir para Indicar", grupo: "Navegação", icon: Gift, onSelect: ({ router }) => router.push("/dashboard/indicar") },
  { id: "config", label: "Ir para Configurações", grupo: "Navegação", icon: Settings, atalho: "G S", onSelect: ({ router }) => router.push("/dashboard/configuracoes") },
  {
    id: "escanear",
    label: "Escanear Mercado",
    grupo: "Ações",
    icon: Sparkles,
    atalho: "N",
    keywords: "gerar oportunidade nova",
    onSelect: ({ router }) => router.push("/dashboard/oportunidades"),
  },
  {
    id: "upgrade",
    label: "Ativar Radar Pro",
    grupo: "Ações",
    icon: Crown,
    keywords: "upgrade assinar pagar",
    onSelect: async () => {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    },
  },
  {
    id: "atalhos",
    label: "Ver atalhos de teclado",
    grupo: "Ações",
    icon: Keyboard,
    atalho: "?",
    onSelect: () => { window.dispatchEvent(new CustomEvent("show-shortcuts")); },
  },
  {
    id: "logout",
    label: "Sair",
    grupo: "Conta",
    icon: LogOut,
    keywords: "logout desconectar",
    onSelect: async ({ router }) => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    },
  },
];

export function CommandPalette() {
  const router = useRouter();
  useKeyboardShortcuts();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selecionado, setSelecionado] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    window.addEventListener("toggle-command-palette", handler);
    return () => window.removeEventListener("toggle-command-palette", handler);
  }, []);

  const filtrados = useMemo(() => {
    const termo = query.trim().toLowerCase();
    if (!termo) return COMANDOS;
    return COMANDOS.filter(
      (c) => c.label.toLowerCase().includes(termo) || c.keywords?.toLowerCase().includes(termo)
    );
  }, [query]);

  useEffect(() => {
    setSelecionado(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  async function executar(comando: Comando) {
    setOpen(false);
    await comando.onSelect({ router });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelecionado((i) => (i + 1) % Math.max(1, filtrados.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelecionado((i) => (i - 1 + filtrados.length) % Math.max(1, filtrados.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const comando = filtrados[selecionado];
      if (comando) executar(comando);
    }
  }

  let indiceGlobal = -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[15%] max-w-lg translate-y-0 gap-0 p-0">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-foreground-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar comandos..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {filtrados.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-foreground-tertiary">Nenhum comando encontrado.</p>
          ) : (
            ["Navegação", "Ações", "Conta"].map((grupo) => {
              const itens = filtrados.filter((c) => c.grupo === grupo);
              if (itens.length === 0) return null;
              return (
                <div key={grupo} className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground-tertiary">
                    {grupo}
                  </p>
                  {itens.map((comando) => {
                    indiceGlobal++;
                    const ativo = indiceGlobal === selecionado;
                    return (
                      <button
                        key={comando.id}
                        onClick={() => executar(comando)}
                        onMouseEnter={() => setSelecionado(indiceGlobal)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          ativo ? "bg-primary/10 text-primary" : "text-foreground-secondary"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <comando.icon className="h-4 w-4" />
                          {comando.label}
                        </span>
                        {comando.atalho && (
                          <span className="font-mono text-[10px] text-foreground-tertiary">{comando.atalho}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-foreground-tertiary">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>esc fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
