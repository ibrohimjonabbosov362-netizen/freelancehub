import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PricingCta from "./PricingCta";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { formatAmount } from "@/lib/format";
import { premiumPrice, yearlySavingPercent } from "@/lib/pricing";
import { isStripeConfigured, isYearlyAvailable } from "@/lib/stripe";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.nav.pricing };
}

export default async function PricingPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";
  const stripeReady = isStripeConfigured();
  const yearlyReady = isYearlyAvailable();

  const plans = [
    {
      name: "Free",
      price: formatAmount(0),
      period: en ? "/ month" : "/ oy",
      description: en ? "Everything you need to start" : "Boshlash uchun yetarli",
      features: t.billing.freeFeatures,
      cta: t.landing.ctaPrimary,
      highlighted: false,
    },
    {
      name: "Pro",
      price: formatAmount(premiumPrice.monthly),
      period: en ? "/ month" : "/ oy",
      description: en
        ? "For a growing freelance business"
        : "O'sib borayotgan biznes uchun",
      features: t.billing.premiumFeatures,
      cta: t.landing.ctaPrimary,
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

              <p className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--faint)" }}>
                  {plan.period}
                </span>
              </p>

              {/* Yillik narx faqat Stripe'da sozlangan bo'lsa ko'rsatiladi */}
              {plan.highlighted && yearlyReady && (
                <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
                  {formatAmount(premiumPrice.yearly)} {en ? "/ year" : "/ yil"}
                  {yearlySavingPercent > 0 && (
                    <span className="badge badge-success ml-2">
                      −{yearlySavingPercent}%
                    </span>
                  )}
                </p>
              )}

              <ul className="mt-7 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
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
                  className={`btn w-full ${plan.highlighted ? "btn-accent" : "btn-ghost"}`}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="hint mx-auto mt-10 max-w-md text-center">
          {stripeReady
            ? en
              ? "Pro is billed through Stripe and renews automatically. Cancel any time — access continues until the period ends."
              : "Pro Stripe orqali to'lanadi va avtomatik uzayadi. Istalgan vaqtda bekor qilsangiz, davr oxirigacha amal qiladi."
            : en
              ? "Online payment is not switched on yet, so Pro cannot be purchased at the moment. Everything on the free plan works normally."
              : "Onlayn to'lov hali yoqilmagan, shuning uchun Pro'ni hozircha sotib bo'lmaydi. Bepul tarifdagi hamma narsa odatdagidek ishlaydi."}
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
