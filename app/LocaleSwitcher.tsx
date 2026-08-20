"use client";

import { LOCALES, localeNames } from "@/lib/i18n/dictionaries";
import { setLocale, useI18n } from "@/lib/i18n/client";

export default function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale } = useI18n();

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg p-0.5"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      role="group"
      aria-label="Til"
    >
      {LOCALES.map((value) => (
        <button
          key={value}
          onClick={() => value !== locale && setLocale(value)}
          aria-pressed={value === locale}
          title={localeNames[value]}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            value === locale
              ? "bg-[var(--surface-3)] text-[var(--ink)]"
              : "text-[var(--faint)] hover:text-[var(--muted)]"
          }`}
        >
          {compact ? value.toUpperCase() : localeNames[value]}
        </button>
      ))}
    </div>
  );
}
