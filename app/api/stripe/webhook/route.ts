import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Imzoni tekshirish uchun tanani xom holida o'qishimiz kerak.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = ["active", "trialing"];

// Yangi Stripe API'larida current_period_end obunada emas, elementlarida turadi.
function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const timestamps = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps) * 1000);
}

async function resolveUserId(
  customerId: string | null,
  metadataUserId?: string | null
): Promise<string | null> {
  if (metadataUserId) {
    const byMetadata = await prisma.user.findUnique({
      where: { id: metadataUserId },
      select: { id: true },
    });
    if (byMetadata) return byMetadata.id;
  }

  if (customerId) {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
    if (subscription) return subscription.userId;
  }

  return null;
}

function asId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = asId(subscription.customer);
  const userId = await resolveUserId(
    customerId,
    subscription.metadata?.userId ?? null
  );

  if (!userId) {
    console.warn("Webhook: obuna uchun foydalanuvchi topilmadi", subscription.id);
    return;
  }

  const isActive = ACTIVE_STATUSES.includes(subscription.status);

  const data = {
    plan: isActive ? ("PREMIUM" as const) : ("FREE" as const),
    stripeCustomerId: customerId,
    stripeSubId: subscription.id,
    currentPeriodEnd: getPeriodEnd(subscription),
  };

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET o'rnatilmagan");
    return NextResponse.json(
      { error: "Webhook sozlanmagan" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Imzo yo'q" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = await getStripe().webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    // Imzo mos kelmasa — so'rov Stripe'dan emas.
    console.error("Webhook imzosi noto'g'ri:", error);
    return NextResponse.json({ error: "Imzo noto'g'ri" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const subscriptionId = asId(session.subscription);

        if (subscriptionId) {
          const subscription =
            await getStripe().subscriptions.retrieve(subscriptionId);

          // Checkout paytidagi userId obunaga ko'chiriladi, keyingi
          // hodisalarda foydalanuvchini topish uchun ishonchli bo'ladi.
          if (!subscription.metadata?.userId) {
            const userId =
              session.client_reference_id ?? session.metadata?.userId;

            if (userId) {
              subscription.metadata = { ...subscription.metadata, userId };
              await getStripe().subscriptions.update(subscriptionId, {
                metadata: { ...subscription.metadata, userId },
              });
            }
          }

          await syncSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object);
        break;
      }

      default:
        // Qolgan hodisalar bizni qiziqtirmaydi — 200 qaytaramiz.
        break;
    }
  } catch (error) {
    // 500 qaytarsak Stripe qayta yuboradi, shuning uchun xatoni yozib qo'yamiz.
    console.error(`Webhook ishlov berishda xatolik (${event.type}):`, error);
    return NextResponse.json(
      { error: "Hodisani qayta ishlashda xatolik" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
