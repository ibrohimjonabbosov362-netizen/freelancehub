"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Icon from "../Icon";
import Topbar from "../Topbar";
import {
  Avatar,
  EmptyState,
  Modal,
  PageHeader,
  TableSkeleton,
  useToast,
} from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount } from "@/lib/format";
import { CLIENT_STATUSES, clientStatusBadges, type ClientStatus } from "@/lib/statuses";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  status: ClientStatus;
  projectsCount: number;
  revenue: number;
};

type LoadResult = { clients: Client[]; error: string };

async function fetchClients(): Promise<LoadResult> {
  try {
    const res = await fetch("/api/clients");
    const data = await res.json();

    return {
      clients: Array.isArray(data) ? data : [],
      error: res.ok ? "" : data?.error || "load",
    };
  } catch {
    return { clients: [], error: "network" };
  }
}

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  phone: "",
  status: "ACTIVE" as ClientStatus,
  notes: "",
};

export default function ClientsPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "ALL">("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchClients();
      if (cancelled) return;

      setClients(result.clients);
      setLoadError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let res: Response;
    let data: { error?: string; code?: string; limit?: number };

    try {
      res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      data = await res.json();
    } catch {
      setError(t.common.serverError);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    if (!res.ok) {
      // Bepul tarif chegarasi — alohida, taklif ko'rinishida ko'rsatiladi
      if (data.code === "FREE_LIMIT") {
        setFormOpen(false);
        setLimit(data.limit ?? 3);
        return;
      }

      setError(data.error || t.common.genericError);
      return;
    }

    setForm(EMPTY_FORM);
    setFormOpen(false);
    toast(t.clients.created);

    const result = await fetchClients();
    setClients(result.clients);
    setLoadError(result.error);
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return clients.filter((client) => {
      if (statusFilter !== "ALL" && client.status !== statusFilter) return false;
      if (!term) return true;

      return (
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.company ?? "").toLowerCase().includes(term)
      );
    });
  }, [clients, query, statusFilter]);

  const filters: (ClientStatus | "ALL")[] = ["ALL", ...CLIENT_STATUSES];

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={t.clients.searchPlaceholder}
          />

          <PageHeader
            title={t.nav.clients}
            subtitle={
              loading
                ? t.common.loading
                : fill(t.clients.count, { n: visible.length })
            }
          >
            <button onClick={() => setFormOpen(true)} className="btn btn-accent">
              <Icon name="plus" className="h-4 w-4" />
              {t.clients.add}
            </button>
          </PageHeader>

          {/* Holat bo'yicha filtr */}
          <div className="mb-5 flex flex-wrap gap-2">
            {filters.map((value) => {
              const active = statusFilter === value;
              const count =
                value === "ALL"
                  ? clients.length
                  : clients.filter((c) => c.status === value).length;

              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`btn btn-sm ${active ? "btn-accent" : "btn-ghost"}`}
                >
                  {value === "ALL" ? t.common.all : t.status[value]}
                  <span className={active ? "opacity-80" : "text-[var(--faint)]"}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : loadError ? (
              <EmptyState
                icon={<Icon name="alert" />}
                title={t.common.loadFailed}
                text={loadError === "network" ? t.common.serverError : loadError}
                action={
                  <button
                    onClick={() => location.reload()}
                    className="btn btn-ghost btn-sm"
                  >
                    {t.common.retry}
                  </button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<Icon name="users" />}
                title={
                  query || statusFilter !== "ALL"
                    ? t.common.noResults
                    : t.clients.emptyTitle
                }
                text={
                  query || statusFilter !== "ALL"
                    ? t.common.noResultsHint
                    : t.clients.emptyText
                }
                action={
                  query || statusFilter !== "ALL" ? null : (
                    <button
                      onClick={() => setFormOpen(true)}
                      className="btn btn-accent btn-sm"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      {t.clients.addFirst}
                    </button>
                  )
                }
              />
            ) : (
              <>
                {/* Desktop: jadval */}
                <div className="table-wrap hidden md:block">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.clients.colClient}</th>
                        <th>{t.clients.colCompany}</th>
                        <th className="text-right">{t.clients.colProjects}</th>
                        <th className="text-right">{t.clients.colRevenue}</th>
                        <th>{t.clients.colStatus}</th>
                        <th className="text-right">{t.clients.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((client) => (
                        <tr key={client.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <Avatar name={client.name} size="sm" />
                              <div className="min-w-0">
                                <Link
                                  href={`/clients/${client.id}`}
                                  className="link block truncate font-medium"
                                >
                                  {client.name}
                                </Link>
                                <p className="truncate text-xs text-[var(--faint)]">
                                  {client.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-[var(--muted)]">
                            {client.company || "—"}
                          </td>
                          <td className="text-right tabular-nums text-[var(--muted)]">
                            {client.projectsCount}
                          </td>
                          <td className="text-right tabular-nums">
                            {client.revenue > 0 ? formatAmount(client.revenue) : "—"}
                          </td>
                          <td>
                            <span className={`badge ${clientStatusBadges[client.status]}`}>
                              {t.status[client.status]}
                            </span>
                          </td>
                          <td className="text-right">
                            <Link
                              href={`/clients/${client.id}`}
                              className="btn btn-ghost btn-sm"
                            >
                              {t.common.seeDetails}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kartalar */}
                <ul className="divide-y divide-[var(--border)] md:hidden">
                  {visible.map((client) => (
                    <li key={client.id}>
                      <Link
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--surface-2)]"
                      >
                        <Avatar name={client.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{client.name}</p>
                          <p className="truncate text-xs text-[var(--faint)]">
                            {client.company || client.email}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={`badge ${clientStatusBadges[client.status]}`}
                            >
                              {t.status[client.status]}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              {fill(t.clients.projectsCount, {
                                n: client.projectsCount,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm tabular-nums">
                          {client.revenue > 0 ? formatAmount(client.revenue) : "—"}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mijoz qo'shish */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t.clients.add}
        closeLabel={t.common.close}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="label">
                {t.common.name}
              </label>
              <input
                id="c-name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                autoFocus
                className="input"
                placeholder={t.clients.namePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="c-email" className="label">
                {t.common.email}
              </label>
              <input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="input"
                placeholder={t.clients.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="c-company" className="label">
                {t.common.company}{" "}
                <span className="text-[var(--faint)]">({t.common.optional})</span>
              </label>
              <input
                id="c-company"
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="input"
                placeholder={t.clients.companyPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="c-phone" className="label">
                {t.common.phone}{" "}
                <span className="text-[var(--faint)]">({t.common.optional})</span>
              </label>
              <input
                id="c-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input"
                placeholder={t.clients.phonePlaceholder}
              />
            </div>
          </div>

          <div>
            <label htmlFor="c-status" className="label">
              {t.common.status}
            </label>
            <select
              id="c-status"
              value={form.status}
              onChange={(e) => update("status", e.target.value as ClientStatus)}
              className="input"
            >
              {CLIENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t.status[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-notes" className="label">
              {t.common.notes}{" "}
              <span className="text-[var(--faint)]">({t.common.optional})</span>
            </label>
            <textarea
              id="c-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="input"
              placeholder={t.clients.notesPlaceholder}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? t.common.saving : t.common.save}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn btn-ghost"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bepul tarif chegarasi */}
      <Modal
        open={limit !== null}
        onClose={() => setLimit(null)}
        title={t.clients.limitTitle}
        description={fill(t.clients.limitText, { n: limit ?? 3 })}
        tone="accent"
        closeLabel={t.common.close}
        footer={
          <>
            <Link href="/billing" className="btn btn-accent">
              {t.common.upgradeToPremium}
            </Link>
            <button onClick={() => setLimit(null)} className="btn btn-ghost">
              {t.common.later}
            </button>
          </>
        }
      />
    </AppShell>
  );
}
