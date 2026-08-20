import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { isStripeConfigured, isYearlyAvailable } from "@/lib/stripe";
import { FREE_CLIENT_LIMIT, getPlanInfo } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const [planInfo, clientCount] = await Promise.all([
    getPlanInfo(userId),
    prisma.client.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    ...planInfo,
    clientCount,
    clientLimit: planInfo.isPremium ? null : FREE_CLIENT_LIMIT,
    stripeEnabled: isStripeConfigured(),
    yearlyEnabled: isYearlyAvailable(),
  });
}
