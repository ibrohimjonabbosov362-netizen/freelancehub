import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PricingPlans from "./PricingPlans";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { formatAmount } from "@/lib/format";
import { premiumPrice, yearlySavingPercent } from "@/lib/pricing";
import { isStripeConfigured, isYearlyAvailable } from "@/lib/stripe";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/pricing",
    t.nav.pricing,
    locale === "en"
      ? "Simple, honest pricing. Start free and upgrade when your client list outgrows it."
      : "Oddiy va halol narxlar. Bepul boshlang, mijozlaringiz ko'payganda Pro'ga o'ting."
  );
}

export default async function PricingPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";
  const stripeReady = isStripeConfigured();
  const yearlyReady = isYearlyAvailable();

  const mostPopularLabel = en ? "Most Popular" : "Ommabop";

  const plans = [
    {
      name: "Free",
      price: formatAmount(0),
      description: en ? "Everything you need to start" : "Boshlash uchun yetarli",
      features: t.billing.freeFeatures,
      cta: t.landing.ctaPrimary,
      highlighted: false,
      mostPopularLabel,
    },
    {
      name: "Pro",
      price: formatAmount(premiumPrice.monthly),
      // Yillik tanlanganda: oylik ekvivalenti va yillik jami — faqat Stripe'da sozlangan bo'lsa
      yearlyPerMonth: yearlyReady ? formatAmount(premiumPrice.yearly / 12) : undefined,
      yearlyTotal: yearlyReady ? formatAmount(premiumPrice.yearly) : undefined,
      description: en
        ? "For a growing freelance business"
        : "O'sib borayotgan biznes uchun",
      features: t.billing.premiumFeatures,
      cta: t.landing.ctaPrimary,
      highlighted: true,
      mostPopularLabel,
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

        <PricingPlans
          plans={plans}
          yearlyReady={yearlyReady}
          yearlySavingPercent={yearlySavingPercent}
        />

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
