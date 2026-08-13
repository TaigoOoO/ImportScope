"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Settings, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { CotacaoBadge } from "@/components/integrations/cotacao-badge";
import { cn, iniciaisDoEmail } from "@/lib/utils";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/oportunidades": "Oportunidades",
  "/dashboard/calculadora": "Calculadora",
  "/dashboard/configuracoes": "Configurações",
};

interface HeaderProps {
  email: string;
  temAlertas?: boolean;
}

export function Header({ email, temAlertas = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    setLoadingLogout(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const breadcrumb = BREADCRUMBS[pathname] ?? "ImportScope";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between px-4 transition-colors md:px-6",
        scrolled && "border-b border-border bg-background/90 backdrop-blur"
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm text-foreground-tertiary">{breadcrumb}</p>
        <CotacaoBadge className="hidden sm:inline-flex" />
      </div>

      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          {temAlertas && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{iniciaisDoEmail(email)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracoes")}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={loadingLogout}>
              {loadingLogout ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
