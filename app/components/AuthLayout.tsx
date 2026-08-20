"use client";

import Link from "next/link";
import LocaleSwitcher from "../LocaleSwitcher";
import { useI18n } from "@/lib/i18n/client";

const points = {
  uz: [
    "Mijozlar, takliflar va loyihalar bitta joyda",
    "Taklif qabul qilinsa loyiha avtomatik ochiladi",
    "Shartnoma va to'lov jadvali loyihaga bog'langan",
  ],
  en: [
    "Clients, proposals and projects in one place",
    "Accepted proposals become projects automatically",
    "Contracts and payment schedules stay linked to the work",
  ],
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { locale, t } = useI18n();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brend tomoni — mobilda yashiriladi */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--border)] p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(70% 50% at 20% 0%, var(--accent-glow), transparent 70%)" }}
        />

        <Link href="/" className="brand relative text-xl font-semibold">
          Freelance<span className="gradient-text">Hub</span>
        </Link>

        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight tracking-tight">
            {t.landing.heroTitle}
            <br />
            <span className="gradient-text">{t.landing.heroTitleAccent}</span>
          </p>

          <ul className="mt-8 space-y-3.5">
            {points[locale].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                     className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-soft)]">
                  <path d="m4 10 4 4 8-8" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm" style={{ color: "var(--faint)" }}>
          {t.landing.badgeNoCard} · {t.landing.badgeFree}
        </p>
      </aside>

      {/* Forma tomoni */}
      <main className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="brand text-xl font-semibold">
              Freelance<span className="gradient-text">Hub</span>
            </Link>
            <LocaleSwitcher compact />
          </div>

          <div className="mb-7 hidden justify-end lg:flex">
            <LocaleSwitcher compact />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="hint mt-1.5 mb-7">{subtitle}</p>

          {children}

          <div className="mt-7 text-center text-sm" style={{ color: "var(--muted)" }}>
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
