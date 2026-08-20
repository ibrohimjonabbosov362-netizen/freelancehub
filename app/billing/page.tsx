"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../AppShell";
import Icon from "../Icon";
import { PageHeader, Skeleton } from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
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

function PlanCard({
  name,
  price,
  features,
  active,
  highlight,
  action,
}: {
  name: string;
  price: string;
  features: string[];
  active: boolean;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`card relative flex flex-col overflow-hidden p-6 ${
        highlight ? "border-[var(--border-strong)]" : ""
      }`}
    >
      {highlight && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
          style={{
            background: "linear-gradient(160deg, rgba(139,92,246,0.2), transparent 70%)",
          }}
        />
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="section-title">{name}</h2>
          {active && <span className="badge badge-accent">✓</span>}
        </div>

        <p className="mb-5 text-3xl font-semibold tracking-tight">{price}</p>

        <ul className="mb-6 flex-1 space-y-2.5 text-sm text-[var(--muted)]">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
              />
              {feature}
            </li>
          ))}
        </ul>

        {action}
      </div>
    </div>
  );
}

function BillingContent() {
  const { t } = useI18n();
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
      setError(result ? "" : t.billing.loadFailed);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function redirectToStripe(endpoint: "checkout" | "portal") {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/stripe/${endpoint}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || t.common.genericError);
        setBusy(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t.common.serverError);
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const usedPercent =
    subscription?.clientLimit && subscription.clientLimit > 0
      ? Math.min(100, Math.round((subscription.clientCount / subscription.clientLimit) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.nav.billing} />

      {justPaid && <div className="alert alert-success mb-6">{t.billing.paidNotice}</div>}
      {error && <div className="alert alert-danger mb-6">{error}</div>}

      {subscription && (
        <>
          {/* Joriy holat */}
          <div className="card mb-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="hint mb-1">{t.billing.currentPlan}</p>
                <p className="gradient-text text-2xl font-semibold tracking-tight">
                  {subscription.isPremium ? t.billing.premium : t.billing.free}
                </p>
              </div>

              {subscription.isPremium && subscription.currentPeriodEnd && (
                <div className="text-right">
                  <p className="hint">{t.billing.renews}</p>
                  <p className="text-sm">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">{t.billing.usage}</span>
                <span className="tabular-nums">
                  {subscription.clientCount}
                  {subscription.clientLimit !== null
                    ? ` / ${subscription.clientLimit}`
                    : ` (${t.billing.unlimited})`}
                </span>
              </div>

              {subscription.clientLimit !== null && (
                <div className="meter">
                  <span style={{ width: `${usedPercent}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Tariflar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanCard
              name={t.billing.free}
              price="0"
              features={t.billing.freeFeatures}
              active={!subscription.isPremium}
            />

            <PlanCard
              name={t.billing.premium}
              price="$19"
              features={t.billing.premiumFeatures}
              active={subscription.isPremium}
              highlight
              action={
                !subscription.stripeEnabled ? (
                  <p className="text-xs leading-relaxed text-[var(--faint)]">
                    {t.billing.notConfigured}
                  </p>
                ) : subscription.isPremium ? (
                  <button
                    onClick={() => redirectToStripe("portal")}
                    disabled={busy}
                    className="btn btn-ghost w-full"
                  >
                    {busy ? t.billing.opening : t.billing.manage}
                  </button>
                ) : (
                  <button
                    onClick={() => redirectToStripe("checkout")}
                    disabled={busy}
                    className="btn btn-accent w-full"
                  >
                    {busy ? t.billing.redirecting : t.common.upgradeToPremium}
                  </button>
                )
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl">
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          }
        >
          <BillingContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
