"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import Icon from "../Icon";
import { EmptyState, PageHeader, TableSkeleton } from "../components/ui";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import {
  CONTRACT_STATUSES,
  contractStatusBadges,
  type ContractStatus,
} from "@/lib/statuses";

type Contract = {
  id: string;
  title: string | null;
  status: ContractStatus;
  signedAt: string | null;
  createdAt: string;
  excerpt: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
};

async function fetchContracts(): Promise<{ contracts: Contract[]; error: string }> {
  try {
    const res = await fetch("/api/contracts");
    const data = await res.json();

    return {
      contracts: Array.isArray(data) ? data : [],
      error: res.ok ? "" : data?.error || "error",
    };
  } catch {
    return { contracts: [], error: "network" };
  }
}

export default function ContractsPage() {
  const { t } = useI18n();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<"ALL" | ContractStatus>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchContracts();
      if (cancelled) return;

      setContracts(result.contracts);
      setFailed(Boolean(result.error));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return contracts.filter((contract) => {
      if (filter !== "ALL" && contract.status !== filter) return false;
      if (!term) return true;

      return (
        contract.projectTitle.toLowerCase().includes(term) ||
        contract.clientName.toLowerCase().includes(term) ||
        (contract.title ?? "").toLowerCase().includes(term)
      );
    });
  }, [contracts, filter, query]);

  const counts = {
    ALL: contracts.length,
    ...Object.fromEntries(
      CONTRACT_STATUSES.map((status) => [
        status,
        contracts.filter((contract) => contract.status === status).length,
      ])
    ),
  } as Record<string, number>;

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={t.contracts.searchPlaceholder}
          />

          <PageHeader
            title={t.nav.contracts}
            subtitle={
              loading
                ? t.common.loading
                : fill(t.contracts.count, { n: visible.length })
            }
          />

          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", ...CONTRACT_STATUSES] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`btn btn-sm ${filter === value ? "btn-accent" : "btn-ghost"}`}
              >
                {value === "ALL" ? t.common.all : t.status[value]}
                <span className={filter === value ? "opacity-80" : "text-[var(--faint)]"}>
                  {counts[value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : failed ? (
              <EmptyState
                icon={<Icon name="alert" />}
                title={t.common.loadFailed}
                text={t.common.serverError}
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
                icon={<Icon name="contract" />}
                title={
                  contracts.length === 0
                    ? t.contracts.emptyTitle
                    : t.contracts.filterEmpty
                }
                text={
                  contracts.length === 0
                    ? t.contracts.emptyText
                    : t.contracts.filterEmptyText
                }
                action={
                  contracts.length === 0 ? (
                    <Link href="/projects" className="btn btn-ghost btn-sm">
                      {t.nav.projects}
                    </Link>
                  ) : null
                }
              />
            ) : (
              <>
                {/* Desktop: jadval */}
                <div className="table-wrap hidden md:block">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.contracts.colContract}</th>
                        <th>{t.contracts.colProject}</th>
                        <th>{t.contracts.colClient}</th>
                        <th>{t.contracts.colCreated}</th>
                        <th>{t.common.status}</th>
                        <th className="text-right">{t.common.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((contract) => (
                        <tr key={contract.id}>
                          <td>
                            <p className="font-medium">
                              {contract.title || t.contracts.untitled}
                            </p>
                            <p
                              className="mt-0.5 max-w-xs truncate text-xs"
                              style={{ color: "var(--faint)" }}
                            >
                              {contract.excerpt}
                            </p>
                          </td>
                          <td>
                            <Link
                              href={`/projects/${contract.projectId}`}
                              className="link"
                            >
                              {contract.projectTitle}
                            </Link>
                          </td>
                          <td>
                            <Link
                              href={`/clients/${contract.clientId}`}
                              className="link-muted"
                            >
                              {contract.clientName}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap text-[var(--muted)]">
                            {formatDate(contract.createdAt)}
                          </td>
                          <td>
                            <span
                              className={`badge ${contractStatusBadges[contract.status]}`}
                            >
                              {t.status[contract.status]}
                            </span>
                          </td>
                          <td className="text-right">
                            <Link
                              href={`/projects/${contract.projectId}`}
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
                  {visible.map((contract) => (
                    <li key={contract.id}>
                      <Link
                        href={`/projects/${contract.projectId}`}
                        className="block p-4 transition-colors hover:bg-[var(--surface-2)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {contract.title || t.contracts.untitled}
                            </p>
                            <p className="truncate text-xs text-[var(--faint)]">
                              {contract.projectTitle} · {contract.clientName}
                            </p>
                          </div>
                          <span
                            className={`badge shrink-0 ${contractStatusBadges[contract.status]}`}
                          >
                            {t.status[contract.status]}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {formatDate(contract.createdAt)}
                        </p>
                      </Link>
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
