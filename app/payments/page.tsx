"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import Icon from "../Icon";
import {
  EmptyState,
  PageHeader,
  StatCard,
  TableSkeleton,
  useToast,
} from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount, formatAmountShort, formatDate } from "@/lib/format";
import {
  PAYMENT_STATUSES,
  paymentStatusBadges,
  type PaymentStatus,
} from "@/lib/statuses";

type Payment = {
  id: string;
  invoiceNo: number;
  amount: string;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  projectId: string;
  projectTitle: string;
  clientName: string;
};

type Totals = {
  all: number;
  paid: number;
  outstanding: number;
  overdue: number;
  upcoming: number;
};

const EMPTY_TOTALS: Totals = {
  all: 0,
  paid: 0,
  outstanding: 0,
  overdue: 0,
  upcoming: 0,
};

async function fetchPayments(): Promise<{
  payments: Payment[];
  totals: Totals;
  error: string;
}> {
  try {
    const res = await fetch("/api/payments");
    const data = await res.json();

    if (!res.ok) {
      return { payments: [], totals: EMPTY_TOTALS, error: data?.error || "load" };
    }

    return { payments: data.payments, totals: data.totals, error: "" };
  } catch {
    return { payments: [], totals: EMPTY_TOTALS, error: "network" };
  }
}

export default function PaymentsPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Totals>(EMPTY_TOTALS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchPayments();
      if (cancelled) return;

      setPayments(result.payments);
      setTotals(result.totals);
      setLoadError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const result = await fetchPayments();
    setPayments(result.payments);
    setTotals(result.totals);
    setLoadError(result.error);
  }

  async function handleStatus(id: string, status: string) {
    setUpdatingId(id);
    setActionError("");

    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || t.common.genericError);
        return;
      }

      toast(t.payments.statusUpdated);
      await reload();
    } catch {
      setActionError(t.common.serverError);
    } finally {
      setUpdatingId(null);
    }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return payments.filter((payment) => {
      if (filter !== "ALL" && payment.status !== filter) return false;
      if (!term) return true;

      return (
        payment.projectTitle.toLowerCase().includes(term) ||
        payment.clientName.toLowerCase().includes(term) ||
        String(payment.invoiceNo).includes(term)
      );
    });
  }, [payments, filter, query]);

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={t.payments.searchPlaceholder}
          />

          <PageHeader
            title={t.nav.payments}
            subtitle={
              loading
                ? t.common.loading
                : fill(t.payments.count, { n: visible.length })
            }
          />

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t.payments.totalPending}
              value={formatAmountShort(totals.outstanding)}
              tone={totals.outstanding > 0 ? "warning" : "neutral"}
              icon={<Icon name="clock" className="h-4 w-4" />}
            />
            <StatCard
              label={t.payments.totalPaid}
              value={formatAmountShort(totals.paid)}
              tone="success"
              icon={<Icon name="check" className="h-4 w-4" />}
            />
            <StatCard
              label={t.payments.overdue}
              value={formatAmountShort(totals.overdue)}
              tone={totals.overdue > 0 ? "danger" : "neutral"}
              icon={<Icon name="alert" className="h-4 w-4" />}
            />
            <StatCard
              label={t.payments.upcoming}
              value={formatAmountShort(totals.upcoming)}
              icon={<Icon name="calendar" className="h-4 w-4" />}
            />
          </div>

          {actionError && <div className="alert alert-danger mb-4">{actionError}</div>}

          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", ...PAYMENT_STATUSES] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`btn btn-sm ${filter === value ? "btn-accent" : "btn-ghost"}`}
              >
                {value === "ALL" ? t.common.all : t.status[value]}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <TableSkeleton rows={6} cols={5} />
            ) : loadError ? (
              <EmptyState
                icon={<Icon name="alert" />}
                title={t.common.loadFailed}
                text={loadError === "network" ? t.common.serverError : loadError}
                action={
                  <button onClick={reload} className="btn btn-ghost btn-sm">
                    {t.common.retry}
                  </button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<Icon name="payment" />}
                title={
                  payments.length === 0
                    ? t.payments.emptyTitle
                    : t.payments.filterEmpty
                }
                text={
                  payments.length === 0
                    ? t.payments.emptyText
                    : t.payments.filterEmptyText
                }
              />
            ) : (
              <>
                {/* Desktop: jadval */}
                <div className="table-wrap hidden md:block">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.payments.colInvoice}</th>
                        <th>{t.payments.colProject}</th>
                        <th>{t.payments.colClient}</th>
                        <th>{t.payments.colDue}</th>
                        <th className="text-right">{t.payments.colAmount}</th>
                        <th>{t.payments.colStatus}</th>
                        <th className="text-right">{t.payments.colAction}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((payment) => (
                        <tr key={payment.id}>
                          <td className="whitespace-nowrap font-medium tabular-nums">
                            #{payment.invoiceNo}
                          </td>
                          <td>
                            <Link
                              href={`/projects/${payment.projectId}`}
                              className="link"
                            >
                              {payment.projectTitle}
                            </Link>
                          </td>
                          <td className="text-[var(--muted)]">{payment.clientName}</td>
                          <td className="whitespace-nowrap text-[var(--muted)]">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="whitespace-nowrap text-right font-medium tabular-nums">
                            {formatAmount(payment.amount)}
                          </td>
                          <td>
                            <span
                              className={`badge ${paymentStatusBadges[payment.status]}`}
                            >
                              {t.status[payment.status]}
                            </span>
                          </td>
                          <td className="text-right">
                            <select
                              value={payment.status}
                              onChange={(e) => handleStatus(payment.id, e.target.value)}
                              disabled={updatingId === payment.id}
                              aria-label={`#${payment.invoiceNo} ${t.common.status}`}
                              className="input w-auto py-1.5 text-sm"
                            >
                              {PAYMENT_STATUSES.map((value) => (
                                <option key={value} value={value}>
                                  {t.status[value]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kartalar */}
                <ul className="divide-y divide-[var(--border)] md:hidden">
                  {visible.map((payment) => (
                    <li key={payment.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${payment.projectId}`}
                            className="link block truncate text-sm font-medium"
                          >
                            {payment.projectTitle}
                          </Link>
                          <p className="truncate text-xs text-[var(--faint)]">
                            #{payment.invoiceNo} · {payment.clientName}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-sm font-medium tabular-nums">
                          {formatAmount(payment.amount)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-[var(--muted)]">
                          {formatDate(payment.dueDate)}
                        </span>
                        <select
                          value={payment.status}
                          onChange={(e) => handleStatus(payment.id, e.target.value)}
                          disabled={updatingId === payment.id}
                          aria-label={`#${payment.invoiceNo} ${t.common.status}`}
                          className="input w-auto py-1.5 text-sm"
                        >
                          {PAYMENT_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {t.status[value]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
