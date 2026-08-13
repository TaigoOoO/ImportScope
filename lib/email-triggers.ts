import { prisma } from "@/lib/prisma";
import {
  enviarEmail,
  resolverTemplate,
  templateTourRapido,
  templatePrimeiraAnalise,
  templateReengajamento,
  templateUpgradePush,
  templateOnboardingPro,
  templateWinback,
} from "@/lib/email-templates";

const UM_MINUTO = 60 * 1000;
const UMA_HORA = 60 * UM_MINUTO;
const UM_DIA = 24 * UMA_HORA;

function nomeDoUsuario(email: string, name: string | null): string {
  return name ?? email.split("@")[0];
}

async function jaEnviado(userId: string, type: string, desde?: Date): Promise<boolean> {
  const log = await prisma.emailLog.findFirst({
    where: { userId, type, ...(desde ? { sentAt: { gte: desde } } : {}) },
  });
  return !!log;
}

async function registrarEnvio(userId: string, type: string) {
  await prisma.emailLog.create({ data: { userId, type } });
}

export async function triggerFirstLoginTour(userId: string): Promise<boolean> {
  if (await jaEnviado(userId, "first_login_tour")) return false;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate(
    "first_login_tour",
    templateTourRapido({ nome: nomeDoUsuario(user.email, user.name) })
  );
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "first_login_tour");
  return true;
}

export async function triggerFirstOpportunityEmail(userId: string): Promise<boolean> {
  if (await jaEnviado(userId, "first_opportunity")) return false;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate(
    "first_opportunity",
    templatePrimeiraAnalise({ nome: nomeDoUsuario(user.email, user.name) })
  );
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "first_opportunity");
  return true;
}

export async function triggerReengagement(userId: string): Promise<boolean> {
  const catorzeDiasAtras = new Date(Date.now() - 14 * UM_DIA);
  if (await jaEnviado(userId, "reengagement", catorzeDiasAtras)) return false;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate(
    "reengagement",
    templateReengajamento({ nome: nomeDoUsuario(user.email, user.name) })
  );
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "reengagement");
  return true;
}

export async function triggerUpgradePush(userId: string): Promise<boolean> {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);
  if (await jaEnviado(userId, "upgrade_push", inicioDoDia)) return false;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate(
    "upgrade_push",
    templateUpgradePush({ nome: nomeDoUsuario(user.email, user.name) })
  );
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "upgrade_push");
  return true;
}

export async function triggerProOnboarding(userId: string): Promise<boolean> {
  if (await jaEnviado(userId, "pro_onboarding")) return false;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate(
    "pro_onboarding",
    templateOnboardingPro({ nome: nomeDoUsuario(user.email, user.name) })
  );
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "pro_onboarding");
  return true;
}

async function triggerWinback(userId: string): Promise<boolean> {
  if (await jaEnviado(userId, "winback")) return false;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await resolverTemplate("winback", templateWinback({ nome: nomeDoUsuario(user.email, user.name) }));
  await enviarEmail(user.email, payload);
  await registrarEnvio(userId, "winback");
  return true;
}

export interface ResultadoVarredura {
  tour: number;
  primeiraOportunidade: number;
  reengajamento: number;
  winback: number;
}

/**
 * Chamado por GET /api/cron/emails, uma vez por dia. Varre candidatos para
 * cada trigger baseado em janela de tempo, e cada trigger internamente
 * decide (via EmailLog) se já foi enviado. Isso substitui "delay" real
 * (que exigiria uma fila de jobs) por uma varredura periódica + checagem
 * de janela — é menos preciso no minuto exato, mas funciona sem
 * infraestrutura extra.
 */
export async function executarVarreduraDeTriggers(): Promise<ResultadoVarredura> {
  const agora = Date.now();
  const resultado: ResultadoVarredura = { tour: 0, primeiraOportunidade: 0, reengajamento: 0, winback: 0 };

  const candidatosTour = await prisma.user.findMany({
    where: {
      lastLoginAt: {
        lte: new Date(agora - 10 * UM_MINUTO),
        gte: new Date(agora - 48 * UMA_HORA),
      },
    },
  });
  for (const user of candidatosTour) {
    if (await triggerFirstLoginTour(user.id)) resultado.tour++;
  }

  const usuariosComOportunidade = await prisma.oportunidade.groupBy({
    by: ["userId"],
    _min: { createdAt: true },
  });
  for (const { userId, _min } of usuariosComOportunidade) {
    const primeiraData = _min.createdAt;
    if (!primeiraData) continue;
    const idadeMs = agora - primeiraData.getTime();
    if (idadeMs >= UMA_HORA && idadeMs <= 48 * UMA_HORA) {
      if (await triggerFirstOpportunityEmail(userId)) resultado.primeiraOportunidade++;
    }
  }

  const tresDiasAtras = new Date(agora - 3 * UM_DIA);
  const usuariosAtivos = await prisma.user.findMany({
    where: { deletionRequestedAt: null },
    select: { id: true, createdAt: true },
  });
  for (const user of usuariosAtivos) {
    const ultima = await prisma.oportunidade.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const referencia = ultima?.createdAt ?? user.createdAt;
    if (referencia <= tresDiasAtras) {
      if (await triggerReengagement(user.id)) resultado.reengajamento++;
    }
  }

  const seteDiasAtras = new Date(agora - 7 * UM_DIA);
  const cancelamentos = await prisma.emailLog.findMany({
    where: { type: "cancellation", sentAt: { lte: seteDiasAtras } },
  });
  for (const log of cancelamentos) {
    if (await triggerWinback(log.userId)) resultado.winback++;
  }

  return resultado;
}
