"use client";

import Link from "next/link";
import Topbar from "../Topbar";
import Sparkbars from "../charts/Sparkbars";
import RevenueArea from "../charts/RevenueArea";
import { formatAmount, formatAmountShort, formatDate } from "@/lib/format";
import {
  paymentStatusBadges,
  paymentStatusLabels,
  projectStatusBadges,
  projectStatusLabels,
  type PaymentStatus,
  type ProjectStatus,
} from "@/lib/statuses";

export type DashboardData = {
  name: string;
  isPremium: boolean;
  clientsCount: number;
  activeProjectsCount: number;
  monthlyEarnings: number;
  proposalTiles: {
    key: string;
    label: string;
    count: number;
    trend: number[];
    color: string;
  }[];
  revenue: { label: string; value: number }[];
  clients: {
    id: string;
    name: string;
    company: string | null;
    projectTitle: string | null;
    status: ProjectStatus | null;
  }[];
  payments: {
    id: string;
    projectId: string;
    projectTitle: string;
    clientName: string;
    amount: string;
    status: PaymentStatus;
    dueDate: string;
  }[];
};

const trendLabels = ["6 hafta", "5 hafta", "4 hafta", "3 hafta", "2 hafta", "1 hafta"];

export default function DashboardView({ data }: { data: DashboardData }) {
  const heroStats = [
    { label: "Faol loyihalar", value: String(data.activeProjectsCount) },
    { label: "Jami mijozlar", value: String(data.clientsCount) },
    {
      label: "Bu oy, so'm",
      value: formatAmountShort(data.monthlyEarnings, { currency: false }),
    },
  ];

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Topbar />

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Salomlashuv */}
          <section className="card relative overflow-hidden p-6 lg:col-span-1">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.28), rgba(99,102,241,0.12) 55%, transparent)",
              }}
            />
            <div className="relative">
              <p className="hint">Yana xush kelibsiz</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {data.name}
              </h1>
              <span
                className={`badge mt-3 ${data.isPremium ? "badge-accent" : "badge-neutral"}`}
              >
                {data.isPremium ? "Premium" : "Bepul tarif"}
              </span>

              <dl className="mt-6 grid grid-cols-3 gap-3">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs text-[var(--muted)]">{stat.label}</dt>
                    <dd className="mt-1 text-lg font-semibold tracking-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Takliflar holati */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-title">Takliflar holati</h2>
              <Link href="/proposals" className="link-muted text-sm">
                Hammasi →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {data.proposalTiles.map((tile) => (
                <div key={tile.key} className="card card-hover p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: tile.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-[var(--muted)]">
                      {tile.label}
                    </span>
                  </div>
                  <p className="mb-3 text-2xl font-semibold tracking-tight">
                    {tile.count}
                  </p>
                  <Sparkbars
                    values={tile.trend}
                    labels={trendLabels}
                    color={tile.color}
                    ariaLabel={`${tile.label}: so'nggi olti haftadagi dinamika`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Daromad grafigi */}
        <section className="card mt-5 p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-title">To&apos;lovlar dinamikasi</h2>
              <p className="hint mt-1">So&apos;nggi 6 oy, qabul qilingan to&apos;lovlar</p>
            </div>
            <p className="text-xl font-semibold tracking-tight">
              {formatAmountShort(data.revenue.reduce((s, r) => s + r.value, 0))}
            </p>
          </div>
          <RevenueArea data={data.revenue} />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Mijozlar */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Mijozlar</h2>
              <Link href="/clients" className="link-muted text-sm">
                Hammasi →
              </Link>
            </div>

            {data.clients.length === 0 ? (
              <p className="hint">Hali mijoz qo&apos;shilmagan.</p>
            ) : (
              <ul className="space-y-3">
                {data.clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-xs font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/clients/${client.id}`}
                          className="link block truncate text-sm"
                        >
                          {client.name}
                        </Link>
                        <span className="block truncate text-xs text-[var(--faint)]">
                          {client.projectTitle ?? client.company ?? "—"}
                        </span>
                      </div>
                    </div>

                    {client.status && (
                      <span
                        className={`badge shrink-0 ${projectStatusBadges[client.status]}`}
                      >
                        {projectStatusLabels[client.status]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* To'lovlar */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">So&apos;nggi to&apos;lovlar</h2>
              <Link href="/projects" className="link-muted text-sm">
                Loyihalar →
              </Link>
            </div>

            {data.payments.length === 0 ? (
              <p className="hint">
                Hali to&apos;lov yozuvi yo&apos;q. Loyiha ichida qo&apos;shishingiz
                mumkin.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${payment.projectId}`}
                        className="link block truncate text-sm"
                      >
                        {payment.projectTitle}
                      </Link>
                      <span className="block truncate text-xs text-[var(--faint)]">
                        {payment.clientName} · {formatDate(payment.dueDate)}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {formatAmount(payment.amount)}
                      </span>
                      <span className={`badge ${paymentStatusBadges[payment.status]}`}>
                        {paymentStatusLabels[payment.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
