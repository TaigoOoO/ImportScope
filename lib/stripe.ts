import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Thrown only when the module is actually used server-side without config.
  console.warn("STRIPE_SECRET_KEY não está definida no ambiente.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";
