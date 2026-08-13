import { prisma } from "@/lib/prisma";
import type { AppConfig } from "@prisma/client";

const SINGLETON_ID = "singleton";

export async function obterConfig(): Promise<AppConfig> {
  return prisma.appConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function atualizarConfig(
  data: Partial<Pick<AppConfig, "precoProCentavos" | "limiteDiarioFree" | "textoBannerLegal" | "modoManutencao">>
): Promise<AppConfig> {
  return prisma.appConfig.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
}
