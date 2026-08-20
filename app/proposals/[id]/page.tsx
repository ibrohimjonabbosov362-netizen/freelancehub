"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "../../AppShell";
import Icon from "../../Icon";
import {
  Avatar,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
  useToast,
} from "../../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { formatAmount, formatDate } from "@/lib/format";
import {
  PROPOSAL_STATUSES,
  projectStatusBadges,
  proposalStatusBadges,
  type ProjectStatus,
  type ProposalStatus,
} from "@/lib/statuses";

type ProposalDetail = {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string; company: string | null };
  project: { id: string; title: string; status: ProjectStatus } | null;
};

async function fetchProposal(id: string): Promise<ProposalDetail | null> {
  try {
    const res = await fetch(`/api/proposals/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as ProposalDetail;
  } catch {
    return null;
  }
}

export default function ProposalDetailPage() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchProposal(id);
      if (cancelled) return;

      if (result) setProposal(result);
      else setNotFound(true);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleStatus(status: string) {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t.common.genericError);
        return;
      }

      toast(t.proposals.statusUpdated);
      const fresh = await fetchProposal(id);
      if (fresh) setProposal(fresh);
    } catch {
      setError(t.common.serverError);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t.proposals.deleteConfirm)) return;

    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t.common.genericError);
        setBusy(false);
        return;
      }

      toast(t.proposals.deleted);
      router.push("/proposals");
      router.refresh();
    } catch {
      setError(t.common.serverError);
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-4xl space-y-5">
            <Skeleton className="h-28 rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !proposal) {
    return (
      <AppShell>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="card mx-auto max-w-md">
            <EmptyState
              icon={<Icon name="search" />}
              title={t.proposals.notFound}
              action={
                <Link href="/proposals" className="btn btn-ghost btn-sm">
                  {t.proposals.back}
                </Link>
              }
            />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/proposals" className="link-muted text-sm">
            ← {t.proposals.back}
          </Link>

          {error && <div className="alert alert-danger mt-4">{error}</div>}

          <div className="mt-4">
            <PageHeader
              title={proposal.title}
              subtitle={
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`badge ${proposalStatusBadges[proposal.status]}`}>
                    {t.status[proposal.status]}
                  </span>
                  <span>
                    {t.proposals.createdAt}: {formatDate(proposal.createdAt)}
                  </span>
                </span>
              }
            >
              <select
                value={proposal.status}
                onChange={(e) => handleStatus(e.target.value)}
                disabled={busy}
                aria-label={t.common.status}
                className="input w-auto py-2 text-sm"
              >
                {PROPOSAL_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t.status[value]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="btn btn-danger btn-sm"
              >
                {t.common.delete}
              </button>
            </PageHeader>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t.proposals.colAmount}
              value={formatAmount(proposal.amount)}
              tone="accent"
              icon={<Icon name="payment" className="h-4 w-4" />}
            />
            <StatCard
              label={t.common.status}
              value={t.status[proposal.status]}
              icon={<Icon name="file" className="h-4 w-4" />}
            />
            <StatCard
              label={t.proposals.lastUpdated}
              value={formatDate(proposal.updatedAt)}
              icon={<Icon name="clock" className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {/* Tavsif */}
              <section className="card p-6">
                <h2 className="section-title mb-3">{t.proposals.description}</h2>
                {proposal.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                    {proposal.description}
                  </p>
                ) : (
                  <p className="hint">{t.proposals.noDescription}</p>
                )}
              </section>

              {/* Bog'langan loyiha */}
              <section className="card p-6">
                <h2 className="section-title mb-4">{t.proposals.linkedProject}</h2>

                {proposal.project ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/projects/${proposal.project.id}`}
                      className="link min-w-0 truncate text-sm font-medium"
                    >
                      {proposal.project.title}
                    </Link>
                    <span
                      className={`badge ${projectStatusBadges[proposal.project.status]}`}
                    >
                      {t.status[proposal.project.status]}
                    </span>
                  </div>
                ) : (
                  <p className="hint">{t.proposals.noProject}</p>
                )}
              </section>
            </div>

            {/* Mijoz */}
            <section className="card h-fit p-6">
              <h2 className="section-title mb-4">{t.common.client}</h2>

              <div className="flex items-center gap-3">
                <Avatar name={proposal.client.name} />
                <div className="min-w-0">
                  <Link
                    href={`/clients/${proposal.client.id}`}
                    className="link block truncate text-sm font-medium"
                  >
                    {proposal.client.name}
                  </Link>
                  <p className="truncate text-xs text-[var(--faint)]">
                    {proposal.client.company || proposal.client.email}
                  </p>
                </div>
              </div>

              <a
                href={`mailto:${proposal.client.email}`}
                className="link-muted mt-4 flex items-center gap-1.5 text-sm"
              >
                <Icon name="mail" className="h-4 w-4" />
                {proposal.client.email}
              </a>

              <Link
                href={`/clients/${proposal.client.id}`}
                className="btn btn-ghost btn-sm mt-4 w-full"
              >
                {t.proposals.viewClient}
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
