"use client";

import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PricingCta from "./PricingCta";
import { useI18n } from "@/lib/i18n/client";

export default function PricingPage() {
  const { locale, t } = useI18n();
  const en = locale === "en";

  const plans = [
    {
      name: "Free",
      price: en ? "$0" : "0 so'm",
      period: en ? "/ month" : "/ oy",
      description: en ? "Everything you need to start" : "Boshlash uchun yetarli",
      features: en
        ? ["Up to 3 clients", "Client management", "Proposals", "Basic project management", "Contracts"]
        : ["3 tagacha mijoz", "Mijozlar bazasi", "Takliflar", "Asosiy loyiha boshqaruvi", "Shartnomalar"],
      cta: en ? "Start for free" : "Bepul boshlash",
      highlighted: false,
    },
    {
      name: "Pro",
      price: en ? "$19" : "99 000 so'm",
      period: en ? "/ month" : "/ oy",
      description: en ? "For a growing freelance business" : "O'sib borayotgan biznes uchun",
      features: en
        ? ["Unlimited clients", "Unlimited projects", "Contract templates", "Payment tracking", "PDF export", "Priority support"]
        : ["Cheksiz mijoz", "Cheksiz loyiha", "Shartnoma shablonlari", "To'lovlarni kuzatish", "PDF eksport", "Ustuvor qo'llab-quvvatlash"],
      cta: en ? "Start free" : "Bepul boshlash",
      highlighted: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {en ? "Simple, honest pricing" : "Oddiy va halol narxlar"}
          </h1>
          <p className="hint mt-4">
            {en
              ? "Start free. Upgrade when your client list outgrows it."
              : "Bepul boshlang. Mijozlaringiz ko'payganda Pro'ga o'tasiz."}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
          {plans.map((plan) => (
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
                  {en ? "Most Popular" : "Ommabop"}
                </span>
              )}

              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="hint mt-1">{plan.description}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm" style={{ color: "var(--faint)" }}>{plan.period}</span>
              </p>

              <ul className="mt-7 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                         className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-soft)]">
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
                  className={`btn w-full ${plan.highlighted ? "btn-accent" : "btn-ghost"}`}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="hint mx-auto mt-10 max-w-md text-center">
          {en
            ? "Pro is billed monthly and renews automatically. Cancel any time — access continues until the period ends."
            : "Pro oylik to'lanadi va avtomatik uzayadi. Istalgan vaqtda bekor qilsangiz, davr oxirigacha amal qiladi."}
        </p>

        <div className="mx-auto mt-4 text-center">
          <Link href="/#faq" className="link-muted text-sm">
            {t.landing.faqTitle} →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
