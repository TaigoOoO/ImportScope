"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  alertasSistema: number;
}

export function AdminHeader({ alertasSistema }: AdminHeaderProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!busca.trim()) return;
    router.push(`/admin/usuarios?busca=${encodeURIComponent(busca.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
        <Input
          placeholder="Buscar usuário por email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </form>

      <Button size="icon" variant="ghost" className="relative shrink-0" title="Falhas recentes de integrações">
        <Bell className="h-4 w-4" />
        {alertasSistema > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {alertasSistema > 9 ? "9+" : alertasSistema}
          </span>
        )}
      </Button>
    </header>
  );
}
