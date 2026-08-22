import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import DashboardPreview from "./components/DashboardPreview";
import Faq from "./components/Faq";
import { HeroRevealGroup, HeroRevealItem } from "./components/motion/HeroReveal";
import { ScrollRevealGroup, ScrollRevealItem } from "./components/motion/ScrollReveal";
import CtaLink from "./components/motion/CtaLink";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { isStripeConfigured } from "@/lib/stripe";
import { CURRENCY_CODE, formatAmountShort } from "@/lib/format";

// Ko'rgazma summalari valyutaga mos bo'lsin (tilga emas)
const MOCK_ROWS =
  CURRENCY_CODE === "UZS"
    ? [15_200_000, 10_800_000, 5_100_000]
    : [1_200, 850, 400];

const featureIcons = [
  "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4",
  "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  "M9 12h6M9 16h4M8 3h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  "M3 3v18h18M7 15l3.5-4 3 3L21 7",
];

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** "Qanday ishlaydi" bo'limidagi kichik, haqiqiy UI'ni takrorlaydigan ko'rinishlar */
function StepPreviewClients({ labels }: { labels: string[] }) {
  return (
    <ul className="space-y-1.5" aria-hidden="true">
      {labels.map((name, i) => (
        <li
          key={name}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5"
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold"
            style={{
              background: ["rgba(139,92,246,.16)", "rgba(52,211,153,.14)", "rgba(96,165,250,.14)"][i],
              color: ["#c4b5fd", "#6ee7b7", "#93c5fd"][i],
            }}
          >
            {name.slice(0, 1)}
          </span>
          <span className="truncate text-[11px]">{name}</span>
        </li>
      ))}
    </ul>
  );
}

function StepPreviewBoard({ columns }: { columns: { label: string; count: number }[] }) {
  return (
    <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
      {columns.map((column, i) => (
        <div
          key={column.label}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2"
        >
          <p className="mb-1.5 truncate text-[9px]" style={{ color: "var(--faint)" }}>
            {column.label}
          </p>
          <div className="space-y-1">
            {Array.from({ length: column.count }).map((_, row) => (
              <div
                key={row}
                className="h-3 rounded"
                style={{
                  background: i === 1 ? "rgba(139,92,246,.25)" : "var(--surface-3)",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepPreviewPayments({ rows }: { rows: { amount: string; cls: string }[] }) {
  return (
    <ul className="space-y-1.5" aria-hidden="true">
      {rows.map((row) => (
        <li
          key={row.amount}
          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5"
        >
          <span className="text-[11px] tabular-nums">{row.amount}</span>
          <span className={`badge ${row.cls} !px-1.5 !py-0.5 !text-[9px]`}>●</span>
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";

  const features = en
    ? [
        { title: "Client Management", text: "Keep every client, contact and project organized in one place." },
        { title: "Proposals", text: "Create professional proposals and track every stage." },
        { title: "Projects", text: "Turn accepted proposals into organized projects." },
        { title: "Contracts", text: "Keep agreements connected to every project." },
        { title: "Payments", text: "Track invoices, payment status and due dates." },
        { title: "Business Overview", text: "See your freelance business performance at a glance." },
      ]
    : [
        { title: "Mijozlar bazasi", text: "Har bir mijoz, kontakt va loyiha bitta joyda tartibda turadi." },
        { title: "Takliflar", text: "Professional taklif tayyorlang va har bosqichini kuzating." },
        { title: "Loyihalar", text: "Qabul qilingan taklif tartibli loyihaga aylanadi." },
        { title: "Shartnomalar", text: "Kelishuvlar har bir loyihaga bog'langan holda saqlanadi." },
        { title: "To'lovlar", text: "Hisoblar, to'lov holati va muddatlarni nazorat qiling." },
        { title: "Umumiy manzara", text: "Biznesingiz holatini bir qarashda ko'ring." },
      ];

  const workflow = [
    t.projectDetail.stepClient,
    t.projectDetail.stepProposal,
    t.projectDetail.stepProject,
    t.projectDetail.stepContract,
    t.projectDetail.stepPayment,
  ];

  const messy = en
    ? ["WhatsApp", "Excel", "Google Docs", "Scattered files", "Payment notes"]
    : ["WhatsApp", "Excel", "Google Docs", "Tarqoq fayllar", "To'lov qaydlari"];

  const steps = [
    {
      n: "01",
      title: t.landing.step1,
      text: t.landing.step1Text,
      preview: <StepPreviewClients labels={["Acme Corp", "StartupX", "Shopify"]} />,
    },
    {
      n: "02",
      title: t.landing.step2,
      text: t.landing.step2Text,
      preview: (
        <StepPreviewBoard
          columns={[
            { label: t.status.TODO, count: 2 },
            { label: t.status.IN_PROGRESS, count: 3 },
            { label: t.status.COMPLETED, count: 1 },
          ]}
        />
      ),
    },
    {
      n: "03",
      title: t.landing.step3,
      text: t.landing.step3Text,
      preview: (
        <StepPreviewPayments
          rows={[
            { amount: formatAmountShort(MOCK_ROWS[0]), cls: "badge-success" },
            { amount: formatAmountShort(MOCK_ROWS[1]), cls: "badge-warning" },
            { amount: formatAmountShort(MOCK_ROWS[2]), cls: "badge-danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <HeroRevealGroup>
              <HeroRevealItem>
                <span className="badge badge-neutral mb-6">{t.landing.builtFor}</span>
              </HeroRevealItem>

              <HeroRevealItem>
                <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  {t.landing.heroTitle}
                  <br />
                  <span className="gradient-text">{t.landing.heroTitleAccent}</span>
                </h1>
              </HeroRevealItem>

              <HeroRevealItem>
                <p
                  className="mx-auto mt-6 max-w-xl text-lg leading-relaxed"
                  style={{ color: "var(--muted)" }}
                >
                  {t.landing.heroSubtitle}
                </p>
              </HeroRevealItem>

              <HeroRevealItem>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <CtaLink href="/register" className="btn btn-accent px-6 py-3">
                    {t.landing.ctaPrimary} <span aria-hidden="true">→</span>
                  </CtaLink>
                  <CtaLink href="#how" className="btn btn-ghost px-6 py-3">
                    {t.landing.ctaSecondary}
                  </CtaLink>
                </div>
              </HeroRevealItem>
            </HeroRevealGroup>

            <ul
              className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
              style={{ color: "var(--faint)" }}
            >
              {[t.landing.badgeNoCard, t.landing.badgeFree, t.landing.badgeSetup].map((b) => (
                <li key={b} className="flex items-center gap-1.5">
                  <Icon d="m4 12 5 5L20 6" className="h-3.5 w-3.5 text-[var(--success)]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-14">
            {/* Bezak yorug'ligi: manfiy inset gorizontal skroll hosil qilardi */}
            <div
              className="pointer-events-none absolute inset-x-0 -top-10 h-40 opacity-60"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 0%, var(--accent-glow), transparent 70%)",
              }}
            />
            <div className="relative">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {t.landing.featuresTitle}
            </h2>
            <p className="hint mt-3">{t.landing.featuresSubtitle}</p>
          </div>

          <ScrollRevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollRevealItem key={feature.title} className="card card-hover p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent-soft)]">
                  <Icon d={featureIcons[i]} />
                </div>
                <h3 className="mb-1.5 font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {feature.text}
                </p>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </section>

        {/* Workflow */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)]/40 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {t.landing.workflowTitle}
            </h2>
            <p className="hint mx-auto mt-3 max-w-lg">{t.landing.workflowSubtitle}</p>

            <ol className="mt-12 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
              {workflow.map((step, i) => (
                <li key={step} className="flex flex-1 items-center gap-3 lg:flex-col">
                  <div className="card flex flex-1 items-center gap-3 p-4 lg:w-full lg:flex-col lg:gap-2 lg:py-6">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent-soft)]">
                      <Icon d={featureIcons[i]} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                  {i < workflow.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 rotate-90 text-lg lg:rotate-0"
                      style={{ color: "var(--faint)" }}
                    >
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Problem -> Solution */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <h2 className="font-display mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight">
            {t.landing.problemTitle}
          </h2>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="card p-6">
              <p className="mb-4 text-sm font-medium" style={{ color: "var(--faint)" }}>
                {t.landing.problemBefore}
              </p>
              <ul className="space-y-2.5">
                {messy.map((tool) => (
                  <li
                    key={tool}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    <Icon d="M6 6l12 12M18 6 6 18" className="h-3.5 w-3.5 text-[var(--danger)]" />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            <span
              aria-hidden="true"
              className="mx-auto rotate-90 text-2xl lg:rotate-0"
              style={{ color: "var(--faint)" }}
            >
              →
            </span>

            <div className="card p-6" style={{ borderColor: "var(--accent-1)" }}>
              <p className="mb-4 text-sm font-medium">{t.landing.problemAfter}</p>
              <ul className="space-y-2.5">
                {workflow.map((step) => (
                  <li
                    key={step}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
                  >
                    <Icon d="m4 12 5 5L20 6" className="h-3.5 w-3.5 text-[var(--success)]" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="border-y border-[var(--border)] bg-[var(--surface)]/40 px-5 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display mb-12 text-center text-3xl font-semibold tracking-tight">
              {t.landing.howTitle}
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="card flex flex-col p-6">
                  <span className="font-display gradient-text text-2xl font-semibold">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-medium">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {step.text}
                  </p>
                  <div className="mt-5">{step.preview}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Faq stripeReady={isStripeConfigured()} />

        {/* Final CTA */}
        <section className="px-5 pb-24 sm:px-8">
          <div className="card relative mx-auto max-w-4xl overflow-hidden p-10 text-center sm:p-14">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 0%, var(--accent-glow), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.landing.finalTitle}
              </h2>
              <p className="hint mx-auto mt-4 max-w-md">{t.landing.finalSubtitle}</p>
              <CtaLink href="/register" className="btn btn-accent mt-8 px-6 py-3">
                {t.landing.ctaPrimary} <span aria-hidden="true">→</span>
              </CtaLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
