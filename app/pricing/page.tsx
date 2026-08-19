import Link from "next/link";
import PricingCta from "./PricingCta";

const plans = [
  {
    name: "Bepul",
    price: "0 so'm",
    description: "Boshlash uchun yetarli",
    features: [
      "3 tagacha mijoz",
      "Cheksiz taklif va loyiha",
      "Asosiy boshqaruv paneli",
    ],
    cta: "Bepul boshlash",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "99 000 so'm/oy",
    description: "O'sib borayotgan biznes uchun",
    features: [
      "Cheksiz mijoz",
      "Tayyor shartnoma shablonlari",
      "Shartnomani PDF'ga eksport qilish",
      "Ustuvor qo'llab-quvvatlash",
    ],
    cta: "Premium'ga o'tish",
    href: "/register",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="font-display text-xl font-semibold">
          Freelance<span className="gradient-text">Hub</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/login" className="link-muted">
            Kirish
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-16 sm:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="font-display mb-4 text-3xl font-semibold sm:text-4xl">
            Tariflar
          </h1>
          <p className="text-[var(--muted)]">Ehtiyojingizga mos tarifni tanlang</p>
        </div>

        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card relative p-8"
              style={
                plan.highlighted
                  ? {
                      borderColor: "var(--accent-1)",
                      boxShadow: "0 0 0 1px var(--accent-1), 0 20px 50px -30px var(--accent-glow)",
                    }
                  : undefined
              }
            >
              {plan.highlighted && (
                <span className="badge badge-accent absolute -top-3 right-6">
                  Ommabop
                </span>
              )}
              <h2 className="mb-1 text-xl font-semibold">{plan.name}</h2>
              <p className="mb-4 text-sm text-[var(--muted)]">
                {plan.description}
              </p>
              <p className="mb-6 text-3xl font-semibold tracking-tight">{plan.price}</p>

              <ul className="mb-8 space-y-2.5 text-sm text-[var(--muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-1)]"
                      aria-hidden="true"
                    >
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <PricingCta
                href={plan.href}
                label={plan.cta}
                premium={plan.highlighted}
                className={`block w-full text-center px-4 py-2 rounded-lg text-sm disabled:opacity-50 ${
                  plan.highlighted
                    ? "btn-accent"
                    : "border border-[var(--border)]"
                }`}
              />
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-[var(--faint)] sm:px-8">
        © 2026 FreelanceHub
      </footer>
    </div>
  );
}