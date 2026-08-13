import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { LegalBanner } from "@/components/shared/legal-banner";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { ShortcutsModal } from "@/components/keyboard/shortcuts-modal";
import { DemoModeRunner } from "@/components/demo/demo-mode-runner";
import { getCurrentUser, isPro } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { obterConfig } from "@/lib/app-config";
import { CATEGORIAS } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.bannedAt) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login?error=account_banned");
  }

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const [alertasCount, config, produtosMonitorados, oportunidadesHoje, categoriasComSinal] = await Promise.all([
    prisma.oportunidade.count({ where: { userId: user.id, risco: "ALTO" } }),
    obterConfig(),
    prisma.oportunidade.count(), // sistema todo, não só este usuário — reforça a sensação de "radar coletivo"
    prisma.oportunidade.count({ where: { createdAt: { gte: inicioHoje } } }),
    prisma.oportunidade.groupBy({ by: ["categoria"] }),
  ]);

  // Modo manutenção (editável em /admin/config) bloqueia só o dashboard —
  // admins continuam entrando normalmente para poder desligar o modo de novo.
  if (config.modoManutencao && user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Wrench className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Voltamos já</h1>
        <p className="max-w-sm text-sm text-foreground-tertiary">
          O ImportScope está em manutenção rápida. Tente novamente em alguns minutos.
        </p>
      </div>
    );
  }

  const radarStats = {
    produtosMonitorados,
    oportunidadesHoje,
    coberturaPct: (categoriasComSinal.length / CATEGORIAS.length) * 100,
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <CommandPalette />
      <ShortcutsModal />
      <DemoModeRunner />
      <Sidebar
        email={user.email}
        plano={isPro(user) ? "pro" : "free"}
        isAdmin={user.role === "admin"}
        radarStats={radarStats}
      />
      <div className="flex min-h-screen flex-col md:ml-[260px]">
        <LegalBanner texto={config.textoBannerLegal} />
        <Header email={user.email} temAlertas={alertasCount > 0} />
        <main className="flex-1 px-4 pb-24 pt-2 md:px-8 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
