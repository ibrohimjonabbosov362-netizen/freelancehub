"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import Icon from "../Icon";
import { formatAmount, formatAmountShort, formatDate } from "@/lib/format";
import {
  PAYMENT_STATUSES,
  paymentStatusBadges,
  paymentStatusLabels,
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

type Totals = { all: number; paid: number; outstanding: number; overdue: number };

async function fetchPayments(): Promise<{
  payments: Payment[];
  totals: Totals;
  error: string;
}> {
  const empty = { all: 0, paid: 0, outstanding: 0, overdue: 0 };

  try {
    const res = await fetch("/api/payments");
    const data = await res.json();

    if (!res.ok) {
      return { payments: [], totals: empty, error: data?.error || "Yuklab bo'lmadi" };
    }

    return { payments: data.payments, totals: data.totals, error: "" };
  } catch {
    return { payments: [], totals: empty, error: "Server bilan bog'lanishda xatolik" };
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Totals>({ all: 0, paid: 0, outstanding: 0, overdue: 0 });
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
        setActionError(data.error || "Holatni yangilab bo'lmadi");
        return;
      }

      await reload();
    } catch {
      setActionError("Server bilan bog'lanishda xatolik");
    } finally {
      setUpdatingId(null);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = payments.filter((p) => {
    if (filter !== "ALL" && p.status !== filter) return false;
    if (!term) return true;
    return (
      p.projectTitle.toLowerCase().includes(term) ||
      p.clientName.toLowerCase().includes(term) ||
      String(p.invoiceNo).includes(term)
    );
  });

  const cards = [
    { label: "Jami", value: totals.all, tone: "" },
    { label: "Qabul qilingan", value: totals.paid, tone: "text-[var(--success)]" },
    { label: "Kutilayotgan", value: totals.outstanding, tone: "text-[var(--warning)]" },
    { label: "Muddati o'tgan", value: totals.overdue, tone: "text-[var(--danger)]" },
  ];

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar query={query} onQueryChange={setQuery} placeholder="Hisob raqami, loyiha yoki mijoz..." />

          <div className="mb-5">
            <h1 className="page-title">To&apos;lovlar</h1>
            <p className="hint mt-1">
              {loading ? "Yuklanmoqda..." : `${visible.length} ta yozuv`}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="card p-4">
                <p className="hint mb-1">{card.label}</p>
                <p className={`text-lg font-semibold tracking-tight ${card.tone}`}>
                  {formatAmountShort(card.value)}
                </p>
              </div>
            ))}
          </div>

          {actionError && <div className="alert alert-danger mb-4">{actionError}</div>}

          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", ...PAYMENT_STATUSES] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`btn btn-sm ${filter === value ? "btn-accent" : "btn-ghost"}`}
              >
                {value === "ALL" ? "Hammasi" : paymentStatusLabels[value]}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <p className="hint p-6">Yuklanmoqda...</p>
            ) : loadError ? (
              <p className="p-6 text-sm text-[var(--danger)]">{loadError}</p>
            ) : visible.length === 0 ? (
              <div className="empty">
                <div className="empty-icon text-[var(--faint)]">
                  <Icon name="file" />
                </div>
                <p className="mb-1 font-medium">
                  {payments.length === 0 ? "Hali to'lov yozuvi yo'q" : "Bu filtrga mos yozuv yo'q"}
                </p>
                <p className="hint">
                  {payments.length === 0
                    ? "To'lovlar loyiha sahifasi ichida qo'shiladi."
                    : "Boshqa filtrni tanlang."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hisob</th>
                      <th>Loyiha</th>
                      <th>Mijoz</th>
                      <th>Muddat</th>
                      <th>Summa</th>
                      <th>Holat</th>
                      <th>Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap font-medium tabular-nums">
                          #{payment.invoiceNo}
                        </td>
                        <td>
                          <Link href={`/projects/${payment.projectId}`} className="link">
                            {payment.projectTitle}
                          </Link>
                        </td>
                        <td className="text-[var(--muted)]">{payment.clientName}</td>
                        <td className="whitespace-nowrap text-[var(--muted)]">
                          {formatDate(payment.dueDate)}
                        </td>
                        <td className="whitespace-nowrap font-medium tabular-nums">
                          {formatAmount(payment.amount)}
                        </td>
                        <td>
                          <span className={`badge ${paymentStatusBadges[payment.status]}`}>
                            {paymentStatusLabels[payment.status]}
                          </span>
                        </td>
                        <td>
                          <select
                            value={payment.status}
                            onChange={(e) => handleStatus(payment.id, e.target.value)}
                            disabled={updatingId === payment.id}
                            aria-label={`#${payment.invoiceNo} holati`}
                            className="input w-auto py-1.5 text-sm"
                          >
                            {PAYMENT_STATUSES.map((v) => (
                              <option key={v} value={v}>
                                {paymentStatusLabels[v]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
