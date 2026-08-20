"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import Icon from "../Icon";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
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
  const { t, locale } = useI18n();
  const en = locale === "en";

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

  const term = query.trim().toLowerCase();
  const visible = contracts.filter((c) => {
    if (filter !== "ALL" && c.status !== filter) return false;
    if (!term) return true;
    return (
      c.projectTitle.toLowerCase().includes(term) ||
      c.clientName.toLowerCase().includes(term)
    );
  });

  const counts = {
    ALL: contracts.length,
    ...Object.fromEntries(
      CONTRACT_STATUSES.map((s) => [s, contracts.filter((c) => c.status === s).length])
    ),
  } as Record<string, number>;

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={en ? "Project or client..." : "Loyiha yoki mijoz..."}
          />

          <div className="mb-5">
            <h1 className="page-title">{t.nav.contracts}</h1>
            <p className="hint mt-1">
              {loading
                ? t.common.loading
                : en
                  ? `${visible.length} contracts`
                  : `${visible.length} ta shartnoma`}
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", ...CONTRACT_STATUSES] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`btn btn-sm ${filter === value ? "btn-accent" : "btn-ghost"}`}
              >
                {value === "ALL" ? t.common.all : t.status[value]}
                <span className="opacity-60">{counts[value] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : failed ? (
              <p className="p-6 text-sm text-[var(--danger)]">{t.common.serverError}</p>
            ) : visible.length === 0 ? (
              <div className="empty">
                <div className="empty-icon text-[var(--faint)]">
                  <Icon name="file" />
                </div>
                <p className="mb-1 font-medium">
                  {contracts.length === 0
                    ? en ? "No contracts yet" : "Hali shartnoma yo'q"
                    : en ? "Nothing matches" : "Mos keladigani yo'q"}
                </p>
                <p className="hint max-w-sm">
                  {contracts.length === 0
                    ? en
                      ? "Contracts are written inside a project and stay linked to it."
                      : "Shartnoma loyiha ichida yoziladi va o'sha loyihaga bog'langan holda saqlanadi."
                    : en ? "Try another filter." : "Boshqa filtrni tanlang."}
                </p>
                {contracts.length === 0 && (
                  <Link href="/projects" className="btn btn-ghost btn-sm mt-4">
                    {t.nav.projects}
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{en ? "Project" : "Loyiha"}</th>
                      <th>{en ? "Client" : "Mijoz"}</th>
                      <th>{en ? "Created" : "Yaratilgan"}</th>
                      <th>{t.common.status}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((contract) => (
                      <tr key={contract.id}>
                        <td>
                          <Link href={`/projects/${contract.projectId}`} className="link font-medium">
                            {contract.projectTitle}
                          </Link>
                          <p className="mt-0.5 max-w-xs truncate text-xs" style={{ color: "var(--faint)" }}>
                            {contract.excerpt}
                          </p>
                        </td>
                        <td>
                          <Link href={`/clients/${contract.clientId}`} className="link-muted">
                            {contract.clientName}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap text-[var(--muted)]">
                          {formatDate(contract.createdAt)}
                        </td>
                        <td>
                          <span className={`badge ${contractStatusBadges[contract.status]}`}>
                            {t.status[contract.status]}
                          </span>
                        </td>
                        <td>
                          <Link href={`/projects/${contract.projectId}`} className="btn btn-ghost btn-sm">
                            {t.common.seeDetails}
                          </Link>
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
