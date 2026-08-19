import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "To'lov tizimi hozircha sozlanmagan" },
      { status: 503 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Sizda hali to'lov tarixi yo'q" },
      { status: 404 }
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${getAppUrl()}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Boshqaruv panelini ochib bo'lmadi" },
      { status: 500 }
    );
  }
}
