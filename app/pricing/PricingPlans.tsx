"use client";

import { useState } from "react";
import PricingCta from "./PricingCta";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";

type Plan = {
  name: string;
  description: string;
  price: string;
  /** Faqat Pro tarifda: yillik tanlanganda ko'rsatiladigan oylik ekvivalent va yillik jami */
  yearlyPerMonth?: string;
  yearlyTotal?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  mostPopularLabel: string;
};

export default function PricingPlans({
  plans,
  yearlyReady,
  yearlySavingPercent,
}: {
  plans: Plan[];
  yearlyReady: boolean;
  yearlySavingPercent: number;
}) {
  const { t } = useI18n();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const yearly = yearlyReady && billingInterval === "yearly";

  return (
    <>
      {yearlyReady && (
        <div className="mx-auto mt-10 flex w-fit items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1 text-sm">
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setBillingInterval(value)}
              aria-pressed={billingInterval === value}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors ${
                billingInterval === value
                  ? "bg-[var(--accent-1)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {value === "monthly" ? t.billing.monthly : t.billing.yearly}
              {value === "yearly" && yearlySavingPercent > 0 && (
                <span
                  className={`badge !px-1.5 !py-0.5 !text-[10px] ${
                    billingInterval === "yearly" ? "badge-neutral" : "badge-success"
                  }`}
                >
                  −{yearlySavingPercent}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
        {plans.map((plan) => {
          const showYearly = yearly && plan.highlighted && plan.yearlyPerMonth;

          return (
            <div
              key={plan.name}
              className="card relative p-7"
              style={
                plan.highlighted
                  ? { borderColor: "var(--accent-1)", background: "var(--surface-2)" }
                  : undefined
              }
            >
              {plan.highlighted && (
                <span className="badge badge-accent absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {plan.mostPopularLabel}
                </span>
              )}

              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="hint mt-1">{plan.description}</p>

              <p className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {showYearly ? plan.yearlyPerMonth : plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--faint)" }}>
                  {t.billing.perMonth}
                </span>
              </p>

              <p
                className="mt-1.5 text-sm"
                style={{ color: "var(--muted)", visibility: showYearly ? "visible" : "hidden" }}
              >
                {showYearly && plan.yearlyTotal
                  ? fill(t.billing.billedYearly, { amount: plan.yearlyTotal })
                  : " "}
              </p>

              <ul className="mt-5 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-soft)]"
                    >
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PricingCta
                  href="/register"
                  label={plan.cta}
                  premium={plan.highlighted}
                  interval={yearly ? "yearly" : "monthly"}
                  className={`btn w-full ${plan.highlighted ? "btn-accent" : "btn-ghost"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
