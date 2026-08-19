import { prisma } from "@/lib/prisma";

export const FREE_CLIENT_LIMIT = 3;

export type PlanInfo = {
  plan: "FREE" | "PREMIUM";
  isPremium: boolean;
  currentPeriodEnd: Date | null;
  hasStripeCustomer: boolean;
};

// PREMIUM yozuvi bo'lsa ham muddati o'tgan bo'lsa bepul deb hisoblanadi:
// webhook kechiksa pullik funksiyalar ochiq qolib ketmasin.
export async function getPlanInfo(userId: string): Promise<PlanInfo> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const notExpired =
    !subscription?.currentPeriodEnd ||
    subscription.currentPeriodEnd.getTime() > Date.now();

  const isPremium = subscription?.plan === "PREMIUM" && notExpired;

  return {
    plan: isPremium ? "PREMIUM" : "FREE",
    isPremium,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    hasStripeCustomer: Boolean(subscription?.stripeCustomerId),
  };
}
