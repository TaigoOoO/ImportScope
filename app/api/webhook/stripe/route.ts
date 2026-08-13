import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { enviarEmail, templateConfirmacaoAssinatura, templateCancelamento } from "@/lib/email-templates";
import { creditarIndicador } from "@/lib/referral";
import { triggerProOnboarding } from "@/lib/email-triggers";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura Stripe ausente." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida";
    console.error("[stripe webhook] verificação falhou:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.customer_email;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (email) {
          const user = await prisma.user.upsert({
            where: { email },
            update: {
              subscriptionStatus: "active",
              plan: "pro",
              stripeCustomerId: customerId ?? undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
              stripePriceId: STRIPE_PRICE_ID,
            },
            create: {
              email,
              subscriptionStatus: "active",
              plan: "pro",
              stripeCustomerId: customerId ?? undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
              stripePriceId: STRIPE_PRICE_ID,
            },
          });

          const emailPayload = templateConfirmacaoAssinatura({
            nome: user.name ?? user.email.split("@")[0],
            proximaCobranca: "em 30 dias", // sem acesso ao invoice aqui; ajuste se expandir a subscription
          });
          await enviarEmail(user.email, emailPayload);

          // Growth: se este usuário foi indicado por alguém, credita o indicador.
          await creditarIndicador(user.id);

          // Segundo email, mais focado em "primeiros passos" no Pro.
          await triggerProOnboarding(user.id).catch((err) =>
            console.error("[webhook] falha ao disparar pro_onboarding:", err)
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const ativo = subscription.status === "active" || subscription.status === "trialing";

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: ativo ? subscription.status : "inactive",
            plan: ativo ? "pro" : "free",
            stripeSubscriptionId: subscription.id,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const usuario = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: "inactive",
            plan: "free",
            stripeSubscriptionId: null,
          },
        });

        if (usuario) {
          await enviarEmail(usuario.email, templateCancelamento({ nome: usuario.name ?? usuario.email.split("@")[0] }));
        }
        break;
      }

      default:
        // Eventos não tratados são ignorados intencionalmente.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe webhook] erro ao processar evento:", error);
    return NextResponse.json({ error: "Erro ao processar webhook." }, { status: 500 });
  }
}
