import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/dashboard");
  }

  const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alertasSistema = await prisma.integrationLog.count({
    where: { status: "error", createdAt: { gte: vinteQuatroHorasAtras } },
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col md:ml-[260px]">
        <AdminHeader alertasSistema={alertasSistema} />
        <main className="flex-1 px-4 pb-8 pt-4 md:px-8">{children}</main>
      </div>
    </div>
  );
}
