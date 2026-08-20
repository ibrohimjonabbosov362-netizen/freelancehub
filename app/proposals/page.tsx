"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Icon from "../Icon";
import Topbar from "../Topbar";
import {
  EmptyState,
  Modal,
  PageHeader,
  StatCard,
  TableSkeleton,
  useToast,
} from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount, formatAmountShort } from "@/lib/format";
import {
  PROPOSAL_STATUSES,
  proposalStatusBadges,
  type ProposalStatus,
} from "@/lib/statuses";

type Client = { id: string; name: string };

type Proposal = {
  id: string;
  title: string;
  amount: string;
  status: ProposalStatus;
  client: { name: string };
};

async function fetchData(): Promise<{
  proposals: Proposal[];
  clients: Client[];
  error: string;
}> {
  try {
    const [proposalsRes, clientsRes] = await Promise.all([
      fetch("/api/proposals"),
      fetch("/api/clients"),
    ]);
    const proposalsData = await proposalsRes.json();
    const clientsData = await clientsRes.json();

    return {
      proposals: Array.isArray(proposalsData) ? proposalsData : [],
      clients: Array.isArray(clientsData) ? clientsData : [],
      error: proposalsRes.ok ? "" : proposalsData?.error || "load",
    };
  } catch {
    return { proposals: [], clients: [], error: "network" };
  }
}

const EMPTY_FORM = { clientId: "", title: "", description: "", amount: "" };

export default function ProposalsPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | ProposalStatus>("ALL");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchData();
      if (cancelled) return;

      setProposals(result.proposals);
      setClients(result.clients);
      setLoadError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const result = await fetchData();
    setProposals(result.proposals);
    setClients(result.clients);
    setLoadError(result.error);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let res: Response;
    let data: { error?: string };

    try {
      res = await fetch("/api/proposals", {
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
      setError(data.error || t.common.genericError);
      return;
    }

    setForm(EMPTY_FORM);
    setFormOpen(false);
    toast(t.proposals.created);
    await reload();
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setStatusError("");

    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusError(data.error || t.common.genericError);
        return;
      }

      toast(t.proposals.statusUpdated);
      await reload();
    } catch {
      setStatusError(t.common.serverError);
    } finally {
      setUpdatingId(null);
    }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return proposals.filter((proposal) => {
      if (filter !== "ALL" && proposal.status !== filter) return false;
      if (!term) return true;

      return (
        proposal.title.toLowerCase().includes(term) ||
        proposal.client.name.toLowerCase().includes(term)
      );
    });
  }, [proposals, query, filter]);

  const stats = useMemo(() => {
    const count = (status: ProposalStatus) =>
      proposals.filter((p) => p.status === status).length;

    return {
      total: proposals.length,
      sent: count("SENT"),
      accepted: count("ACCEPTED"),
      rejected: count("REJECTED"),
      value: proposals.reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }, [proposals]);

  const statusSelect = (proposal: Proposal) => (
    <select
      value={proposal.status}
      onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
      disabled={updatingId === proposal.id}
      aria-label={`${proposal.title} — ${t.common.status}`}
      className="input w-auto py-1.5 text-sm"
    >
      {PROPOSAL_STATUSES.map((value) => (
        <option key={value} value={value}>
          {t.status[value]}
        </option>
      ))}
    </select>
  );

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={t.proposals.searchPlaceholder}
          />

          <PageHeader
            title={t.nav.proposals}
            subtitle={
              loading
                ? t.common.loading
                : fill(t.proposals.count, { n: visible.length })
            }
          >
            <button
              onClick={() => {
                setError("");
                setFormOpen(true);
              }}
              className="btn btn-accent"
            >
              <Icon name="plus" className="h-4 w-4" />
              {t.proposals.add}
            </button>
          </PageHeader>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label={t.proposals.total} value={stats.total} />
            <StatCard
              label={t.status.SENT}
              value={stats.sent}
              tone={stats.sent > 0 ? "warning" : "neutral"}
            />
            <StatCard
              label={t.status.ACCEPTED}
              value={stats.accepted}
              tone="success"
            />
            <StatCard
              label={t.status.REJECTED}
              value={stats.rejected}
              tone={stats.rejected > 0 ? "danger" : "neutral"}
            />
            <StatCard
              label={t.proposals.totalValue}
              value={formatAmountShort(stats.value)}
              tone="accent"
            />
          </div>

          {statusError && <div className="alert alert-danger mb-4">{statusError}</div>}

          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", ...PROPOSAL_STATUSES] as const).map((value) => (
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
              <TableSkeleton rows={5} cols={4} />
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
                icon={<Icon name="file" />}
                title={
                  query || filter !== "ALL"
                    ? t.common.noResults
                    : t.proposals.emptyTitle
                }
                text={
                  query || filter !== "ALL"
                    ? t.common.noResultsHint
                    : t.proposals.emptyText
                }
                action={
                  query || filter !== "ALL" ? null : clients.length === 0 ? (
                    <Link href="/clients" className="btn btn-ghost btn-sm">
                      {t.clients.add}
                    </Link>
                  ) : (
                    <button
                      onClick={() => setFormOpen(true)}
                      className="btn btn-accent btn-sm"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      {t.proposals.add}
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
                        <th>{t.proposals.colTitle}</th>
                        <th>{t.proposals.colClient}</th>
                        <th className="text-right">{t.proposals.colAmount}</th>
                        <th>{t.proposals.colStatus}</th>
                        <th className="text-right">{t.proposals.colChange}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((proposal) => (
                        <tr key={proposal.id}>
                          <td>
                            <Link
                              href={`/proposals/${proposal.id}`}
                              className="link font-medium"
                            >
                              {proposal.title}
                            </Link>
                          </td>
                          <td className="text-[var(--muted)]">
                            {proposal.client.name}
                          </td>
                          <td className="whitespace-nowrap text-right tabular-nums">
                            {formatAmount(proposal.amount)}
                          </td>
                          <td>
                            <span
                              className={`badge ${proposalStatusBadges[proposal.status]}`}
                            >
                              {t.status[proposal.status]}
                            </span>
                          </td>
                          <td className="text-right">{statusSelect(proposal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kartalar */}
                <ul className="divide-y divide-[var(--border)] md:hidden">
                  {visible.map((proposal) => (
                    <li key={proposal.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className="link block truncate text-sm font-medium"
                          >
                            {proposal.title}
                          </Link>
                          <p className="truncate text-xs text-[var(--faint)]">
                            {proposal.client.name}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-sm tabular-nums">
                          {formatAmount(proposal.amount)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className={`badge ${proposalStatusBadges[proposal.status]}`}
                        >
                          {t.status[proposal.status]}
                        </span>
                        {statusSelect(proposal)}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t.proposals.add}
        closeLabel={t.common.close}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger">{error}</div>}

          {clients.length === 0 && (
            <div className="alert alert-danger">{t.proposals.needClient}</div>
          )}

          <div>
            <label htmlFor="pr-client" className="label">
              {t.common.client}
            </label>
            <select
              id="pr-client"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
              className="input"
            >
              <option value="">{t.proposals.selectClient}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pr-title" className="label">
              {t.proposals.colTitle}
            </label>
            <input
              id="pr-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input"
              placeholder={t.clients.proposalTitlePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="pr-amount" className="label">
              {t.proposals.colAmount}
            </label>
            <input
              id="pr-amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="pr-description" className="label">
              {t.clients.proposalDescription}{" "}
              <span className="text-[var(--faint)]">({t.common.optional})</span>
            </label>
            <textarea
              id="pr-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || clients.length === 0}
              className="btn btn-accent"
            >
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
    </AppShell>
  );
}
