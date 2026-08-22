"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Topbar({
  query,
  onQueryChange,
  placeholder,
}: {
  query?: string;
  onQueryChange?: (value: string) => void;
  placeholder?: string;
}) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [time, setTime] = useState("");
  const [alerts, setAlerts] = useState({ overdue: 0, dueSoon: 0, total: 0 });

  // Soat serverda renderlanmaydi — aks holda hidratsiya mos kelmaydi
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAlerts(data);
      } catch {
        // bildirishnoma yuklanmasa sahifa baribir ishlayveradi
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query ?? ""}
          onChange={(e) => onQueryChange?.(e.target.value)}
          disabled={!onQueryChange}
          placeholder={placeholder ?? t.common.search}
          aria-label={t.topbar.searchLabel}
          className="input py-2 pl-9 text-sm disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/payments"
          aria-label={
            alerts.total > 0
              ? fill(t.topbar.paymentsAlert, { count: alerts.total })
              : t.nav.payments
          }
          title={
            alerts.overdue > 0
              ? fill(t.topbar.overdueAlert, { count: alerts.overdue })
              : alerts.dueSoon > 0
                ? fill(t.topbar.dueSoonAlert, { count: alerts.dueSoon })
                : t.topbar.noNewAlerts
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>

          {alerts.total > 0 && (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{
                background: alerts.overdue > 0 ? "var(--danger)" : "var(--warning)",
              }}
            />
          )}
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)] text-xs font-semibold text-white">
            {initials(session?.user?.name)}
          </span>
          <span className="hidden text-sm font-medium sm:inline">
            {session?.user?.name}
          </span>
        </div>

        <span className="hidden text-sm text-[var(--muted)] tabular-nums sm:inline">
          {time}
        </span>
      </div>
    </div>
  );
}
