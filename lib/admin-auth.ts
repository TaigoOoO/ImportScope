import { getCurrentUser } from "@/lib/auth";
import type { User } from "@prisma/client";

/**
 * Retorna o usuário admin autenticado, ou null se não estiver logado ou
 * não for admin. Deliberadamente não redireciona nem lança erro aqui —
 * cada chamador decide o que fazer (layout redireciona para /dashboard,
 * route handlers retornam 401/403).
 */
export async function getAdminUser(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
