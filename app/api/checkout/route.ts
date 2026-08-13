import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getURL } from "@/lib/site-url";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const siteUrl = getURL();

    let customerId = user.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?upgrade=success`,
      cancel_url: `${siteUrl}/?upgrade=cancelled`,
      // `description` and `statement_descriptor` are NOT valid fields on
      // subscription-mode Checkout Sessions (Stripe's own SDK types reject
      // `subscription_data.description`, and there's no per-session
      // statement_descriptor override for subscriptions — only for one-time
      // "payment" mode via payment_intent_data.statement_descriptor). For
      // subscriptions, the text on the customer's bank statement comes from
      // your Stripe account's default statement descriptor
      // (Dashboard → Settings → Business → Public details, max 22 chars —
      // e.g. "IMPORTSCOPE"). `metadata` below is the supported way to attach
      // a human-readable description for your own reconciliation/webhooks.
      metadata: {
        produto: "ImportScope Pro - Assinatura mensal de software",
      },
      subscription_data: {
        metadata: {
          produto: "ImportScope Pro - Assinatura mensal de software",
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Erro ao iniciar checkout." }, { status: 500 });
  }
}
