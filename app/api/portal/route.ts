import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { getURL } from "@/lib/site-url";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "Nenhuma assinatura encontrada para esta conta." }, { status: 400 });
  }

  const siteUrl = getURL();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${siteUrl}/dashboard/configuracoes`,
  });

  return NextResponse.json({ url: portalSession.url });
}
