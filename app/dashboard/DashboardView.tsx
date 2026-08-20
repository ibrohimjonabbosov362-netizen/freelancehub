"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Topbar from "../Topbar";
import Icon from "../Icon";
import Sparkbars from "../charts/Sparkbars";
import RevenueArea from "../charts/RevenueArea";
import { Avatar, StatCard } from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount, formatAmountShort, formatDate } from "@/lib/format";
import {
  paymentStatusBadges,
  projectStatusBadges,
  type PaymentStatus,
  type ProjectStatus,
  type ProposalStatus,
} from "@/lib/statuses";

export type DashboardData = {
  name: string;
  isPremium: boolean;
  clientsCount: number;
  activeProjectsCount: number;
  monthlyEarnings: number;
  pendingTotal: number;
  proposalTiles: {
    key: ProposalStatus;
    count: number;
    trend: number[];
    change: number | null;
    color: string;
    href: string;
  }[];
  revenue: { label: string; value: number }[];
  activity: {
    id: string;
    kind: "client" | "proposal" | "project" | "payment";
    text: string;
    href: string;
    at: string;
  }[];
  projects: {
    id: string;
    title: string;
    clientName: string;
    status: ProjectStatus;
    deadline: string | null;
    paidTotal: number;
    total: number;
  }[];
  clients: {
    id: string;
    name: string;
    email: string;
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

/** Salomlashuv soatga bog'liq, lekin obuna kerak emas — bir marta o'qiladi */
const subscribeNever = () => () => {};

function hourBucket(): "morning" | "day" | "evening" {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : hour < 18 ? "day" : "evening";
}

const ACTIVITY_ICONS: Record<DashboardData["activity"][number]["kind"], string> = {
  client: "users",
  proposal: "file",
  project: "folder",
  payment: "payment",
};

export default function DashboardView({ data }: { data: DashboardData }) {
  const { t } = useI18n();

  // Serverda neytral matn, brauzerda vaqtga qarab — hidratsiya buzilmasin
  const bucket = useSyncExternalStore(subscribeNever, hourBucket, () => null);

  const greeting =
    bucket === "morning"
      ? t.dashboard.greetingMorning
      : bucket === "day"
        ? t.dashboard.greetingDay
        : bucket === "evening"
          ? t.dashboard.greetingEvening
          : t.dashboard.welcome;

  const trendLabels = Array.from(
    { length: 6 },
    (_, i) => `${6 - i} ${t.dashboard.weeks}`
  );

  function activityLabel(item: DashboardData["activity"][number]) {
    switch (item.kind) {
      case "client":
        return fill(t.dashboard.activityClient, { name: item.text });
      case "proposal":
        return fill(t.dashboard.activityProposal, { title: item.text });
      case "project":
        return fill(t.dashboard.activityProject, { title: item.text });
      case "payment":
        return fill(t.dashboard.activityPayment, {
          amount: formatAmount(item.text),
        });
    }
  }

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Topbar />

        {/* Salomlashuv */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {greeting || t.dashboard.welcome}
              {data.name ? `, ${data.name}` : ""} <span aria-hidden="true">👋</span>
            </h1>
          </div>

          <span
            className={`badge ${data.isPremium ? "badge-accent" : "badge-neutral"}`}
          >
            {data.isPremium ? t.dashboard.premium : t.dashboard.freePlan}
          </span>
        </div>

        {/* Asosiy ko'rsatkichlar */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label={t.dashboard.totalClients}
            value={data.clientsCount}
            href="/clients"
            icon={<Icon name="users" className="h-4 w-4" />}
          />
          <StatCard
            label={t.dashboard.activeProjects}
            value={data.activeProjectsCount}
            href="/projects"
            tone="accent"
            icon={<Icon name="folder" className="h-4 w-4" />}
          />
          <StatCard
            label={t.dashboard.pending}
            value={formatAmountShort(data.pendingTotal)}
            href="/payments"
            tone={data.pendingTotal > 0 ? "warning" : "neutral"}
            icon={<Icon name="clock" className="h-4 w-4" />}
          />
          <StatCard
            label={t.dashboard.thisMonth}
            value={formatAmountShort(data.monthlyEarnings)}
            tone="success"
            icon={<Icon name="payment" className="h-4 w-4" />}
          />
        </div>

        {/* Daromad grafigi */}
        <section className="card mb-5 p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-title">{t.dashboard.paymentsTrend}</h2>
              <p className="hint mt-1">{t.dashboard.paymentsTrendSub}</p>
            </div>
            <p className="text-xl font-semibold tracking-tight">
              {formatAmountShort(data.revenue.reduce((s, r) => s + r.value, 0))}
            </p>
          </div>
          <RevenueArea data={data.revenue} />
        </section>

        {/* Takliflar holati */}
        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">{t.dashboard.proposalStatus}</h2>
            <Link href="/proposals" className="link-muted text-sm">
              {t.common.viewAll} →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {data.proposalTiles.map((tile) => (
              <div key={tile.key} className="card card-hover flex flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: tile.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[var(--muted)]">
                    {t.status[tile.key]}
                  </span>
                </div>

                <div className="mb-3 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {tile.count}
                  </p>
                  {tile.change !== null && (
                    <span
                      className={`text-xs font-medium ${
                        tile.change >= 0
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                      }`}
                      title={t.dashboard.trendHint}
                    >
                      {tile.change >= 0 ? "▲" : "▼"} {Math.abs(tile.change)}%
                    </span>
                  )}
                </div>

                <Sparkbars
                  values={tile.trend}
                  labels={trendLabels}
                  color={tile.color}
                  ariaLabel={t.status[tile.key]}
                />

                <Link href={tile.href} className="btn btn-ghost btn-sm mt-3 w-full">
                  {t.common.seeDetails}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* So'nggi loyihalar */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">{t.dashboard.recentProjects}</h2>
              <Link href="/projects" className="link-muted text-sm">
                {t.common.viewAll} →
              </Link>
            </div>

            {data.projects.length === 0 ? (
              <p className="hint">{t.dashboard.noProjects}</p>
            ) : (
              <ul className="space-y-3.5">
                {data.projects.map((project) => {
                  const percent =
                    project.total > 0
                      ? Math.min(
                          100,
                          Math.round((project.paidTotal / project.total) * 100)
                        )
                      : 0;

                  return (
                    <li
                      key={project.id}
                      className="border-t border-[var(--border)] pt-3.5 first:border-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="link min-w-0 truncate text-sm font-medium"
                        >
                          {project.title}
                        </Link>
                        <span className={`badge ${projectStatusBadges[project.status]}`}>
                          {t.status[project.status]}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-[var(--faint)]">
                        {project.clientName}
                        {project.deadline && ` · ${formatDate(project.deadline)}`}
                      </p>

                      {project.total > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="meter flex-1">
                            <span style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-[var(--muted)]">
                            {percent}%
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Yaqin to'lovlar */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">{t.dashboard.upcomingPayments}</h2>
              <Link href="/payments" className="link-muted text-sm">
                {t.common.viewAll} →
              </Link>
            </div>

            {data.payments.length === 0 ? (
              <p className="hint">{t.dashboard.noPayments}</p>
            ) : (
              <ul className="space-y-3.5">
                {data.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3.5 first:border-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${payment.projectId}`}
                        className="link block truncate text-sm font-medium"
                      >
                        {payment.projectTitle}
                      </Link>
                      <p className="truncate text-xs text-[var(--faint)]">
                        {payment.clientName} · {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums">
                        {formatAmount(payment.amount)}
                      </span>
                      <span className={`badge ${paymentStatusBadges[payment.status]}`}>
                        {t.status[payment.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* So'nggi mijozlar */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">{t.dashboard.recentClients}</h2>
              <Link href="/clients" className="link-muted text-sm">
                {t.common.viewAll} →
              </Link>
            </div>

            {data.clients.length === 0 ? (
              <p className="hint">{t.dashboard.noClients}</p>
            ) : (
              <ul className="space-y-3.5">
                {data.clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center gap-3 border-t border-[var(--border)] pt-3.5 first:border-0 first:pt-0"
                  >
                    <Avatar name={client.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/clients/${client.id}`}
                        className="link block truncate text-sm font-medium"
                      >
                        {client.name}
                      </Link>
                      <p className="truncate text-xs text-[var(--faint)]">
                        {client.projectTitle || client.company || client.email}
                      </p>
                    </div>
                    {client.status && (
                      <span className={`badge ${projectStatusBadges[client.status]}`}>
                        {t.status[client.status]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Harakatlar tasmasi */}
          <section className="card p-6">
            <h2 className="section-title mb-4">{t.dashboard.activity}</h2>

            {data.activity.length === 0 ? (
              <p className="hint">{t.dashboard.noActivity}</p>
            ) : (
              <ol className="relative space-y-4 pl-6">
                <span
                  className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-[var(--border)]"
                  aria-hidden="true"
                />
                {data.activity.map((item) => (
                  <li key={item.id} className="relative">
                    <span
                      className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
                      aria-hidden="true"
                    >
                      <Icon name={ACTIVITY_ICONS[item.kind]} className="h-3 w-3" />
                    </span>
                    <Link href={item.href} className="link block truncate text-sm">
                      {activityLabel(item)}
                    </Link>
                    <p className="text-xs text-[var(--faint)]">{formatDate(item.at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
