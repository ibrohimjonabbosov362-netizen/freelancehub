import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { getPlanInfo } from "@/lib/subscription";
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Foydalanuvchi topilmadi" },
      { status: 404 }
    );
  }

  const { isPremium } = await getPlanInfo(userId);

  if (isPremium) {
    return NextResponse.json(
      { error: "Sizda allaqachon Premium tarif mavjud" },
      { status: 409 }
    );
  }

  try {
    const stripe = getStripe();
    let customerId = user.subscription?.stripeCustomerId ?? null;

    // Stripe mijozi bir marta yaratiladi va keyingi to'lovlarda qayta ishlatiladi.
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, plan: "FREE", stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/billing?success=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      // Webhook kechikkan holatda ham to'lovni foydalanuvchiga bog'lay olishimiz uchun.
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "To'lov sahifasini ochib bo'lmadi" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "To'lovni boshlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
