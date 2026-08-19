import Stripe from "stripe";

let client: Stripe | null = null;

// Kalitlar yo'q bo'lsa ilova ishlayveradi, faqat Premium o'chiq bo'ladi.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY o'rnatilmagan");
  }

  if (!client) {
    client = new Stripe(secretKey, { typescript: true });
  }

  return client;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
