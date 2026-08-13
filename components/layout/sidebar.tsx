"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, Calculator, Settings, Gift, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { iniciaisDoEmail } from "@/lib/utils";
import type { PlanoUsuario } from "@/types";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/oportunidades", label: "Oportunidades", icon: TrendingUp },
  { href: "/dashboard/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/dashboard/indicar", label: "Indicar", icon: Gift },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export interface RadarStats {
  produtosMonitorados: number;
  oportunidadesHoje: number;
  coberturaPct: number;
}

/**
 * Números vêm do banco (via app/dashboard/layout.tsx) — não são mock.
 * `coberturaPct` = % das categorias de produto que já têm ao menos uma
 * oportunidade registrada, uma métrica real ainda que simples, em vez de
 * um número decorativo inventado.
 */
function RadarAtivoWidget({ stats }: { stats: RadarStats }) {
  return (
    <div className="mb-4 mt-6 px-2">
      <div className="rounded-xl border border-border bg-background-card/80 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-foreground-tertiary">
            Radar Ativo
          </span>
          <motion.div
            className="h-2 w-2 rounded-full bg-success"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="text-xs text-foreground-secondary">
          <span className="font-mono font-bold text-primary">{stats.produtosMonitorados}</span> produtos
          monitorados
        </div>
        <div className="mt-1 text-xs text-foreground-secondary">
          <span className="font-mono font-bold text-success">{stats.oportunidadesHoje}</span> oportunidades
          hoje
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-background-elevated">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-amber-400"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, stats.coberturaPct)}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <div className="mt-1 text-right text-[10px] text-foreground-tertiary">
          {stats.coberturaPct.toFixed(0)}% das categorias com sinal
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  email: string;
  plano: PlanoUsuario;
  isAdmin?: boolean;
  radarStats: RadarStats;
}

export function Sidebar({ email, plano, isAdmin = false, radarStats }: SidebarProps) {
  const pathname = usePathname();

  const links = isAdmin
    ? [...LINKS, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : LINKS;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[260px] flex-col border-r border-border bg-background px-4 py-6 md:flex">
      <div className="px-2">
        <Logo size={40} />
      </div>

      <RadarAtivoWidget stats={radarStats} />

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] border-l-[3px] border-transparent px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-l-primary bg-gradient-nav-active text-primary"
                  : "text-foreground-secondary hover:bg-primary/[0.08] hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 rounded-input border border-border bg-background-card px-3 py-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{iniciaisDoEmail(email)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm text-foreground-secondary">{email}</span>
        </div>
        <Badge
          className={cn(
            "shrink-0 uppercase",
            plano === "pro"
              ? "border-transparent bg-gradient-to-r from-primary to-primary-hover text-white"
              : "border-transparent bg-background-elevated text-foreground-secondary"
          )}
        >
          {plano === "pro" ? "Pro" : "Free"}
        </Badge>
      </div>
    </aside>
  );
}
