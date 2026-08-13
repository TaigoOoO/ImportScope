"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, BarChart3, Mail, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/oportunidades", label: "Oportunidades", icon: Package },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/config", label: "Config", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[260px] flex-col border-r border-border bg-background px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <Logo size={36} showText={false} />
        <div className="flex flex-col leading-none">
          <span className="font-semibold text-foreground">ImportScope</span>
          <Badge variant="secondary" className="mt-1 w-fit text-[10px] uppercase">
            Admin
          </Badge>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
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

      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium text-foreground-tertiary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Dashboard
      </Link>
    </aside>
  );
}
