"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AppShell from "../AppShell";
import { formatDate } from "@/lib/format";

type Subscription = {
  plan: "FREE" | "PREMIUM";
  isPremium: boolean;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  clientCount: number;
  clientLimit: number | null;
  stripeEnabled: boolean;
};

async function fetchSubscription(): Promise<Subscription | null> {
  try {
    const res = await fetch("/api/subscription");
    if (!res.ok) return null;
    return (await res.json()) as Subscription;
  } catch {
    return null;
  }
}

function BillingContent() {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("success") === "1";

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchSubscription();
      if (cancelled) return;

      setSubscription(result);
      setError(result ? "" : "Tarif ma'lumotini yuklab bo'lmadi");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function redirectToStripe(endpoint: "checkout" | "portal") {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/stripe/${endpoint}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Stripe'ga o'tib bo'lmadi");
        setBusy(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Server bilan bog'lanishda xatolik");
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="hint">Yuklanmoqda...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title mb-6">Tarif</h1>

      {justPaid && (
        <div className="alert alert-success mb-6">
          To&apos;lov qabul qilindi. Agar tarif hali yangilanmagan bo&apos;lsa,
          bir necha soniyadan so&apos;ng sahifani yangilang — tasdiq Stripe&apos;dan
          keladi.
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-6">{error}</div>
      )}

      {subscription && (
        <>
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="hint mb-1">Joriy tarif</p>
                <p className="text-2xl font-semibold gradient-text">
                  {subscription.isPremium ? "Premium" : "Bepul"}
                </p>
              </div>

              {subscription.isPremium && subscription.currentPeriodEnd && (
                <div className="text-right">
                  <p className="hint">Amal qilish muddati</p>
                  <p className="text-sm">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="hint">
                Mijozlar: {subscription.clientCount}
                {subscription.clientLimit !== null
                  ? ` / ${subscription.clientLimit}`
                  : " (cheksiz)"}
              </p>
            </div>
          </div>

          {!subscription.stripeEnabled ? (
            <div className="card p-6 text-sm text-[var(--muted)]">
              To&apos;lov tizimi hozircha sozlanmagan. Premium&apos;ni yoqish
              uchun <code>STRIPE_SECRET_KEY</code> va{" "}
              <code>STRIPE_PRICE_ID</code> muhit o&apos;zgaruvchilarini
              to&apos;ldiring.
            </div>
          ) : subscription.isPremium ? (
            <button
              onClick={() => redirectToStripe("portal")}
              disabled={busy}
              className="btn btn-ghost"
            >
              {busy ? "Ochilmoqda..." : "Obunani boshqarish"}
            </button>
          ) : (
            <div className="card p-6">
              <h2 className="section-title mb-2">Premium&apos;ga o&apos;ting</h2>
              <ul className="mb-5 space-y-1 text-sm text-[var(--muted)]">
                <li>Cheksiz mijoz</li>
                <li>Tayyor shartnoma shablonlari</li>
                <li>PDF eksport</li>
                <li>Ustuvor qo&apos;llab-quvvatlash</li>
              </ul>
              <button
                onClick={() => redirectToStripe("checkout")}
                disabled={busy}
                className="btn btn-accent"
              >
                {busy ? "Yo'naltirilmoqda..." : "Premium'ga o'tish"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <AppShell>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <Suspense fallback={<p className="hint">Yuklanmoqda...</p>}>
          <BillingContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
