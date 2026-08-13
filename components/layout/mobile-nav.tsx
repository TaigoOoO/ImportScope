"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Calculator, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/oportunidades", label: "Oportunidades", icon: TrendingUp },
  { href: "/dashboard/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/dashboard/indicar", label: "Indicar", icon: Gift },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-foreground-tertiary"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
