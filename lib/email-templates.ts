import { prisma } from "@/lib/prisma";
import { getURL } from "@/lib/site-url";

// Calculado uma vez ao carregar o módulo — getURL() em contexto de
// servidor só depende de env vars, que não mudam entre requisições dentro
// do mesmo deploy, então não há necessidade de recalcular a cada email.
const SITE_URL = getURL();

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

/**
 * Antes de enviar um dos templates de gatilho (não os transacionais do
 * Stripe — ver nota abaixo), checa se existe um EmailTemplateOverride
 * salvo pelo admin em /admin/emails e usa ele no lugar do texto
 * hardcoded. Sem override, cai no `payloadPadrao` normalmente.
 *
 * Escopo: cobre os templates disparados por lib/email-triggers.ts. Os
 * emails transacionais da Stripe (confirmação de assinatura, cancelamento,
 * lembrete de renovação) continuam usando o texto hardcoded direto — são
 * textos com implicação financeira/legal (valores, datas de cobrança)
 * que não fazem sentido editar por um textarea sem validação adicional.
 */
export async function resolverTemplate(type: string, payloadPadrao: EmailPayload): Promise<EmailPayload> {
  const override = await prisma.emailTemplateOverride.findUnique({ where: { type } });
  if (!override) return payloadPadrao;

  return {
    subject: override.subject,
    text: override.bodyText,
    html: `<div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px"><div style="white-space:pre-wrap">${override.bodyText}</div></div>`,
  };
}

const RODAPE_TEXT = `
---
ImportScope
[Endereço físico a preencher]
CNPJ: 00.000.000/0001-00
privacidade@importscope.com

Não quer mais receber estes emails? Cancele o recebimento: {unsubscribeUrl}
`.trim();

function rodapeHtml(unsubscribeUrl: string) {
  return `
    <hr style="border:none;border-top:1px solid #1E293B;margin:24px 0" />
    <p style="font-size:12px;color:#64748B;line-height:1.6">
      ImportScope<br/>
      [Endereço físico a preencher]<br/>
      CNPJ: 00.000.000/0001-00<br/>
      <a href="mailto:privacidade@importscope.com" style="color:#64748B">privacidade@importscope.com</a>
    </p>
    <p style="font-size:12px;color:#64748B">
      Não quer mais receber estes emails?
      <a href="${unsubscribeUrl}" style="color:#F97316">Cancelar recebimento</a>
    </p>
  `;
}

interface BoasVindasListaEsperaParams {
  unsubscribeUrl?: string;
}

export function templateBoasVindasListaEspera({
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: BoasVindasListaEsperaParams = {}): EmailPayload {
  const subject = "Você está na lista — ImportScope";
  const text = `Olá,

Você entrou na lista de espera do ImportScope.

O que esperar:
- Relatório semanal com oportunidades de importação
- Acesso antecipado ao dashboard
- Lançamento oficial em breve

Se não foi você quem se cadastrou, ignore este email.

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;

  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá,</p>
      <p>Você entrou na lista de espera do <strong>ImportScope</strong>.</p>
      <p><strong>O que esperar:</strong></p>
      <ul>
        <li>Relatório semanal com oportunidades de importação</li>
        <li>Acesso antecipado ao dashboard</li>
        <li>Lançamento oficial em breve</li>
      </ul>
      <p>Se não foi você quem se cadastrou, ignore este email.</p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;

  return { subject, html, text };
}

interface ConfirmacaoAssinaturaParams {
  nome: string;
  proximaCobranca: string;
  unsubscribeUrl?: string;
}

export function templateConfirmacaoAssinatura({
  nome,
  proximaCobranca,
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: ConfirmacaoAssinaturaParams): EmailPayload {
  const subject = "Assinatura confirmada — ImportScope Pro";
  const text = `Olá ${nome},

Sua assinatura do ImportScope Pro foi confirmada.

Plano: Pro
Valor: R$ 29,00/mês
Próxima cobrança: ${proximaCobranca}

O que você desbloqueou:
- Oportunidades ilimitadas
- Calculadora tributária completa
- Alertas de retenção aduaneira

Gerenciar assinatura: ${SITE_URL}/dashboard/configuracoes
Termos: ${SITE_URL}/termos
Privacidade: ${SITE_URL}/privacidade

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;

  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Sua assinatura do <strong>ImportScope Pro</strong> foi confirmada.</p>
      <p>Plano: Pro<br/>Valor: R$ 29,00/mês<br/>Próxima cobrança: ${proximaCobranca}</p>
      <p><strong>O que você desbloqueou:</strong></p>
      <ul>
        <li>Oportunidades ilimitadas</li>
        <li>Calculadora tributária completa</li>
        <li>Alertas de retenção aduaneira</li>
      </ul>
      <p>
        <a href="${SITE_URL}/dashboard/configuracoes" style="color:#F97316">Gerenciar assinatura</a> ·
        <a href="${SITE_URL}/termos" style="color:#F97316">Termos</a> ·
        <a href="${SITE_URL}/privacidade" style="color:#F97316">Privacidade</a>
      </p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;

  return { subject, html, text };
}

interface LembreteRenovacaoParams {
  nome: string;
  data: string;
  unsubscribeUrl?: string;
}

export function templateLembreteRenovacao({
  nome,
  data,
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: LembreteRenovacaoParams): EmailPayload {
  const subject = "Sua assinatura renova em 3 dias";
  const text = `Olá ${nome},

Sua assinatura ImportScope Pro renova automaticamente em 3 dias.

Valor: R$ 29,00
Data: ${data}

Nada a fazer — cobrança automática no cartão cadastrado.
Se quiser cancelar: ${SITE_URL}/dashboard/configuracoes

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;

  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Sua assinatura ImportScope Pro renova automaticamente em <strong>3 dias</strong>.</p>
      <p>Valor: R$ 29,00<br/>Data: ${data}</p>
      <p>Nada a fazer — cobrança automática no cartão cadastrado.</p>
      <p>Se quiser cancelar: <a href="${SITE_URL}/dashboard/configuracoes" style="color:#F97316">clique aqui</a></p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;

  return { subject, html, text };
}

interface CancelamentoParams {
  nome: string;
  unsubscribeUrl?: string;
}

export function templateCancelamento({
  nome,
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: CancelamentoParams): EmailPayload {
  const subject = "Assinatura cancelada — ImportScope";
  const text = `Olá ${nome},

Confirmamos o cancelamento da sua assinatura ImportScope Pro. Você continua com acesso ao plano Pro até o fim do ciclo já pago, e depois volta automaticamente para o plano Free.

Mudou de ideia? Você pode assinar novamente a qualquer momento em ${SITE_URL}/dashboard.

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;

  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Confirmamos o cancelamento da sua assinatura <strong>ImportScope Pro</strong>. Você continua com
      acesso ao plano Pro até o fim do ciclo já pago, e depois volta automaticamente para o plano Free.</p>
      <p>Mudou de ideia? Você pode assinar novamente a qualquer momento em
      <a href="${SITE_URL}/dashboard" style="color:#F97316">Reativar assinatura</a>.</p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;

  return { subject, html, text };
}

interface SimplesParams {
  nome: string;
  unsubscribeUrl?: string;
}

export function templateTourRapido({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "3 dicas rápidas para aproveitar o ImportScope";
  const dicas = [
    "Comece pela Calculadora com um produto que você já conhece — assim você calibra o quanto confiar nas estimativas.",
    'Use os filtros de "Oportunidades" por categoria e margem mínima antes de gerar mais — foca a IA no que interessa pra você.',
    "Todo card tem um ícone de info explicando que a análise é por IA — vale sempre cruzar com um despachante antes de fechar pedido.",
  ];
  const text = `Olá ${nome},

Três dicas rápidas para tirar mais proveito do ImportScope:

1. ${dicas[0]}
2. ${dicas[1]}
3. ${dicas[2]}

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Três dicas rápidas para tirar mais proveito do ImportScope:</p>
      <ol>${dicas.map((d) => `<li style="margin-bottom:8px">${d}</li>`).join("")}</ol>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templatePrimeiraAnalise({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "Como interpretar sua primeira análise de oportunidade";
  const text = `Olá ${nome},

Você gerou sua primeira oportunidade! Um resumo rápido de como ler o card:

- Margem: quanto sobra depois do custo total estimado, sobre o preço de venda no Mercado Livre.
- Risco: BAIXO/MÉDIO/ALTO considera valor FOB e exigência de certificação (INMETRO, ANATEL etc.).
- 🔥 Oportunidade: aparece quando a margem estimada passa de 60%.

Clique em "Ver Detalhes" para o breakdown completo de impostos e o MOQ do fornecedor.

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Você gerou sua primeira oportunidade! Um resumo rápido de como ler o card:</p>
      <ul>
        <li><strong>Margem</strong>: quanto sobra depois do custo total estimado, sobre o preço de venda no Mercado Livre.</li>
        <li><strong>Risco</strong>: BAIXO/MÉDIO/ALTO considera valor FOB e exigência de certificação.</li>
        <li><strong>🔥 Oportunidade</strong>: aparece quando a margem estimada passa de 60%.</li>
      </ul>
      <p>Clique em "Ver Detalhes" para o breakdown completo de impostos e o MOQ do fornecedor.</p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templateReengajamento({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "Sua próxima oportunidade está esperando";
  const text = `Olá ${nome},

Faz uns dias que você não gera uma oportunidade nova no ImportScope. Ainda tem gerações disponíveis hoje — que tal ver o que a IA encontra numa categoria que você ainda não explorou?

Voltar ao dashboard: ${SITE_URL}/dashboard/oportunidades

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Faz uns dias que você não gera uma oportunidade nova. Ainda tem gerações disponíveis hoje —
      que tal ver o que a IA encontra numa categoria que você ainda não explorou?</p>
      <p><a href="${SITE_URL}/dashboard/oportunidades" style="color:#F97316">Voltar ao dashboard</a></p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templateUpgradePush({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "Você atingiu o limite diário — veja o que está perdendo";
  const text = `Olá ${nome},

Você usou as 2 gerações gratuitas de hoje. No plano Pro (R$ 29/mês) você tem:

- Oportunidades ilimitadas
- Histórico completo salvo
- Alertas de retenção aduaneira

Fazer upgrade: ${SITE_URL}/dashboard

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Você usou as 2 gerações gratuitas de hoje. No plano <strong>Pro (R$ 29/mês)</strong> você tem:</p>
      <ul>
        <li>Oportunidades ilimitadas</li>
        <li>Histórico completo salvo</li>
        <li>Alertas de retenção aduaneira</li>
      </ul>
      <p><a href="${SITE_URL}/dashboard" style="color:#F97316;font-weight:bold">Fazer upgrade</a></p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templateOnboardingPro({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "Bem-vindo ao Pro — aqui está tudo que você desbloqueou";
  const text = `Olá ${nome},

Bem-vindo ao ImportScope Pro! Recursos exclusivos que valem a pena explorar:

- Gerações ilimitadas — sem esperar o dia seguinte
- Histórico completo de tudo que você já calculou
- Indique 3 amigos Pro e ganhe mais 1 mês grátis (Configurações → Indicar)

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Bem-vindo ao <strong>ImportScope Pro</strong>! Recursos exclusivos que valem a pena explorar:</p>
      <ul>
        <li>Gerações ilimitadas — sem esperar o dia seguinte</li>
        <li>Histórico completo de tudo que você já calculou</li>
        <li>Indique 3 amigos Pro e ganhe mais 1 mês grátis</li>
      </ul>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templateWinback({ nome, unsubscribeUrl = `${SITE_URL}/unsubscribe` }: SimplesParams): EmailPayload {
  const subject = "Voltamos com 50% off por 3 meses";
  const text = `Olá ${nome},

Notamos que você cancelou o ImportScope Pro. Se quiser dar outra chance, preparamos 50% de desconto nos próximos 3 meses.

Reativar com desconto: ${SITE_URL}/dashboard

${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <p>Olá ${nome},</p>
      <p>Notamos que você cancelou o ImportScope Pro. Se quiser dar outra chance, preparamos
      <strong>50% de desconto nos próximos 3 meses</strong>.</p>
      <p><a href="${SITE_URL}/dashboard" style="color:#F97316;font-weight:bold">Reativar com desconto</a></p>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject, html, text };
}

export function templatePersonalizado({
  assunto,
  corpo,
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: {
  assunto: string;
  corpo: string;
  unsubscribeUrl?: string;
}): EmailPayload {
  const text = `${corpo}\n\n${RODAPE_TEXT.replace("{unsubscribeUrl}", unsubscribeUrl)}`;
  const html = `
    <div style="font-family:sans-serif;color:#F8FAFC;background:#0A0F1C;padding:32px">
      <div style="white-space:pre-wrap">${corpo}</div>
      ${rodapeHtml(unsubscribeUrl)}
    </div>`;
  return { subject: assunto, html, text };
}

/**
 * Stub de envio de email. Nenhum provedor de email (Resend, Postmark, SES,
 * etc.) está configurado neste projeto — nenhuma chave de API foi fornecida
 * em nenhum dos prompts, então não há como enviar de verdade. Em
 * desenvolvimento, isso apenas loga o conteúdo do email no console.
 *
 * Para produção, troque o corpo desta função por uma chamada real, ex:
 *
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from: "ImportScope <ola@importscope.com>", to, ...payload });
 */
export async function enviarEmail(to: string, payload: EmailPayload): Promise<void> {
  console.log(`[email-stub] Para: ${to} | Assunto: ${payload.subject}`);
  if (process.env.NODE_ENV === "development") {
    console.log(payload.text);
  }
}
