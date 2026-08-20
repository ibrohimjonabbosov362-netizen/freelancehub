import Stripe from "stripe";

let client: Stripe | null = null;

export type BillingInterval = "monthly" | "yearly";

// Kalitlar yo'q bo'lsa ilova ishlayveradi, faqat Premium o'chiq bo'ladi.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

/**
 * Yillik narx ixtiyoriy. STRIPE_PRICE_ID_YEARLY berilmasa oylik/yillik
 * almashtirgichi umuman ko'rsatilmaydi — ishlamaydigan tugma bo'lmasin.
 */
export function isYearlyAvailable(): boolean {
  return isStripeConfigured() && Boolean(process.env.STRIPE_PRICE_ID_YEARLY);
}

export function getPriceId(interval: BillingInterval): string | null {
  if (interval === "yearly") {
    return process.env.STRIPE_PRICE_ID_YEARLY || null;
  }
  return process.env.STRIPE_PRICE_ID || null;
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
