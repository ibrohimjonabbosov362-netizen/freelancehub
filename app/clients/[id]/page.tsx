"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../AppShell";
import Icon from "../../Icon";
import {
  Avatar,
  EmptyState,
  Modal,
  Skeleton,
  StatCard,
  useToast,
} from "../../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount, formatDate } from "@/lib/format";
import {
  CLIENT_STATUSES,
  clientStatusBadges,
  paymentStatusBadges,
  projectStatusBadges,
  proposalStatusBadges,
  type ClientStatus,
  type PaymentStatus,
  type ProjectStatus,
  type ProposalStatus,
} from "@/lib/statuses";

type Proposal = {
  id: string;
  title: string;
  amount: string;
  status: ProposalStatus;
  createdAt: string;
};

type Payment = {
  id: string;
  amount: string;
  status: PaymentStatus;
  dueDate: string;
};

type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  deadline: string | null;
  createdAt: string;
  payments: Payment[];
};

type ClientDetail = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  proposals: Proposal[];
  projects: Project[];
};

async function fetchClient(id: string): Promise<ClientDetail | null> {
  try {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as ClientDetail;
  } catch {
    return null;
  }
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { t } = useI18n();
  const toast = useToast();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
    status: "ACTIVE" as ClientStatus,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposal, setProposal] = useState({ title: "", description: "", amount: "" });
  const [projectOpen, setProjectOpen] = useState(false);
  const [project, setProject] = useState({ title: "", description: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchClient(id);
      if (cancelled) return;

      if (result) setClient(result);
      else setNotFound(true);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reload() {
    const result = await fetchClient(id);
    if (result) setClient(result);
  }

  const proposals = useMemo(() => client?.proposals ?? [], [client]);
  const projects = useMemo(() => client?.projects ?? [], [client]);

  // Daromad va kutilayotgan summa mijozning barcha loyihalari bo'yicha yig'iladi
  const totals = useMemo(() => {
    let paid = 0;
    let pending = 0;

    for (const item of projects) {
      for (const payment of item.payments ?? []) {
        const amount = Number(payment.amount);
        if (payment.status === "PAID") paid += amount;
        else pending += amount;
      }
    }

    return { paid, pending };
  }, [projects]);

  // Harakatlar tarixi mavjud sanalardan yig'iladi
  const activity = useMemo(() => {
    if (!client) return [];

    return [
      {
        key: "client",
        icon: "users",
        text: t.clients.activityAdded,
        at: client.createdAt,
      },
      ...proposals.map((item) => ({
        key: `proposal-${item.id}`,
        icon: "file",
        text: fill(t.dashboard.activityProposal, { title: item.title }),
        at: item.createdAt,
      })),
      ...projects.map((item) => ({
        key: `project-${item.id}`,
        icon: "folder",
        text: fill(t.dashboard.activityProject, { title: item.title }),
        at: item.createdAt,
      })),
      ...projects.flatMap((item) =>
        (item.payments ?? [])
          .filter((payment) => payment.status === "PAID")
          .map((payment) => ({
            key: `payment-${payment.id}`,
            icon: "payment",
            text: fill(t.dashboard.activityPayment, {
              amount: formatAmount(payment.amount),
            }),
            at: payment.dueDate,
          }))
      ),
    ]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 8);
  }, [client, proposals, projects, t]);

  function startEdit() {
    if (!client) return;

    setEdit({
      name: client.name,
      email: client.email,
      company: client.company ?? "",
      phone: client.phone ?? "",
      notes: client.notes ?? "",
      status: client.status,
    });
    setActionError("");
    setEditing(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setActionError("");

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || t.common.genericError);
        return;
      }

      setEditing(false);
      toast(t.common.updated);
      await reload();
    } catch {
      setActionError(t.common.serverError);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, ...proposal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || t.common.genericError);
        return;
      }

      setProposal({ title: "", description: "", amount: "" });
      setProposalOpen(false);
      toast(t.clients.proposalCreated);
      await reload();
    } catch {
      setFormError(t.common.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, ...project }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || t.common.genericError);
        return;
      }

      setProject({ title: "", description: "", deadline: "" });
      setProjectOpen(false);
      toast(t.clients.projectCreated);
      await reload();
    } catch {
      setFormError(t.common.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const warning =
      proposals.length > 0 || projects.length > 0
        ? fill(t.clients.deleteWarning, {
            p: proposals.length,
            j: projects.length,
          })
        : t.clients.deleteConfirm;

    if (!confirm(warning)) return;

    setDeleting(true);
    setActionError("");

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || t.common.genericError);
        setDeleting(false);
        return;
      }

      toast(t.clients.clientDeleted);
      router.push("/clients");
      router.refresh();
    } catch {
      setActionError(t.common.serverError);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="card flex items-center gap-4 p-6">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !client) {
    return (
      <AppShell>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="card mx-auto max-w-md">
            <EmptyState
              icon={<Icon name="search" />}
              title={t.clients.notFound}
              action={
                <Link href="/clients" className="btn btn-ghost btn-sm">
                  {t.clients.back}
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
        <div className="mx-auto max-w-5xl">
          <Link href="/clients" className="link-muted text-sm">
            ← {t.clients.back}
          </Link>

          {actionError && (
            <div className="alert alert-danger mt-4">{actionError}</div>
          )}

          {/* Profil sarlavhasi */}
          <div className="card relative mb-5 mt-4 overflow-hidden p-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
              style={{
                background:
                  "linear-gradient(140deg, rgba(139,92,246,0.18), transparent 65%)",
              }}
            />

            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar name={client.name} size="lg" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="truncate text-xl font-semibold tracking-tight">
                      {client.name}
                    </h1>
                    <span className={`badge ${clientStatusBadges[client.status]}`}>
                      {t.status[client.status]}
                    </span>
                  </div>

                  {client.company && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                      <Icon name="building" className="h-4 w-4" />
                      {client.company}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <a
                      href={`mailto:${client.email}`}
                      className="link-muted flex items-center gap-1.5"
                    >
                      <Icon name="mail" className="h-4 w-4" />
                      {client.email}
                    </a>
                    {client.phone && (
                      <a
                        href={`tel:${client.phone.replace(/\s/g, "")}`}
                        className="link-muted flex items-center gap-1.5"
                      >
                        <Icon name="phone" className="h-4 w-4" />
                        {client.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 text-[var(--faint)]">
                      <Icon name="calendar" className="h-4 w-4" />
                      {t.clients.since}: {formatDate(client.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setFormError("");
                    setProposalOpen(true);
                  }}
                  className="btn btn-accent btn-sm"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  {t.clients.newProposal}
                </button>
                <button
                  onClick={() => {
                    setFormError("");
                    setProjectOpen(true);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  {t.clients.newProject}
                </button>
                <button onClick={startEdit} className="btn btn-ghost btn-sm">
                  {t.common.edit}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger btn-sm"
                >
                  {deleting ? t.common.deleting : t.common.delete}
                </button>
              </div>
            </div>
          </div>

          {/* Ko'rsatkichlar */}
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t.clients.totalRevenue}
              value={formatAmount(totals.paid)}
              tone="success"
              icon={<Icon name="payment" className="h-4 w-4" />}
            />
            <StatCard
              label={t.clients.pendingAmount}
              value={formatAmount(totals.pending)}
              tone={totals.pending > 0 ? "warning" : "neutral"}
              icon={<Icon name="clock" className="h-4 w-4" />}
            />
            <StatCard
              label={t.nav.projects}
              value={projects.length}
              hint={fill(t.clients.proposalsCount, { n: proposals.length })}
              icon={<Icon name="folder" className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {/* Loyihalar */}
              <section className="card p-6">
                <h2 className="section-title mb-4">{t.nav.projects}</h2>

                {projects.length === 0 ? (
                  <p className="hint">{t.clients.noProjects}</p>
                ) : (
                  <ul className="space-y-3">
                    {projects.map((item) => {
                      const paid = (item.payments ?? [])
                        .filter((p) => p.status === "PAID")
                        .reduce((sum, p) => sum + Number(p.amount), 0);

                      return (
                        <li
                          key={item.id}
                          className="border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/projects/${item.id}`}
                                className="link block truncate text-sm font-medium"
                              >
                                {item.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-[var(--faint)]">
                                {paid > 0 ? formatAmount(paid) : "—"}
                                {item.deadline && ` · ${formatDate(item.deadline)}`}
                              </p>
                            </div>
                            <span className={`badge ${projectStatusBadges[item.status]}`}>
                              {t.status[item.status]}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Takliflar */}
              <section className="card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="section-title">{t.nav.proposals}</h2>
                  <button
                    onClick={() => {
                      setFormError("");
                      setProposalOpen(true);
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    {t.clients.newProposal}
                  </button>
                </div>

                {proposals.length === 0 ? (
                  <p className="hint">{t.clients.noProposals}</p>
                ) : (
                  <ul className="space-y-3">
                    {proposals.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-[var(--faint)]">
                            {formatAmount(item.amount)} · {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <span className={`badge ${proposalStatusBadges[item.status]}`}>
                          {t.status[item.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {/* Harakatlar tarixi */}
              <section className="card p-6">
                <h2 className="section-title mb-4">{t.dashboard.activity}</h2>

                {activity.length === 0 ? (
                  <p className="hint">{t.dashboard.noActivity}</p>
                ) : (
                  <ol className="relative space-y-4 pl-6">
                    <span
                      className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-[var(--border)]"
                      aria-hidden="true"
                    />
                    {activity.map((item) => (
                      <li key={item.key} className="relative">
                        <span
                          className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
                          aria-hidden="true"
                        >
                          <Icon name={item.icon} className="h-3 w-3" />
                        </span>
                        <p className="truncate text-sm">{item.text}</p>
                        <p className="text-xs text-[var(--faint)]">
                          {formatDate(item.at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>

            {/* Yon ustun: aloqa va izohlar */}
            <div className="space-y-5">
              <section className="card p-6">
                <h2 className="section-title mb-4">{t.clients.contactInfo}</h2>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-[var(--faint)]">{t.common.email}</dt>
                    <dd className="mt-0.5 break-all">{client.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--faint)]">{t.common.phone}</dt>
                    <dd className="mt-0.5">
                      {client.phone || (
                        <span className="text-[var(--faint)]">{t.clients.noPhone}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--faint)]">{t.common.company}</dt>
                    <dd className="mt-0.5">
                      {client.company || (
                        <span className="text-[var(--faint)]">{t.common.none}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="card p-6">
                <h2 className="section-title mb-3">{t.common.notes}</h2>
                {client.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                    {client.notes}
                  </p>
                ) : (
                  <p className="hint">{t.clients.noNotes}</p>
                )}
              </section>

              {/* Yaqin to'lovlar */}
              <section className="card p-6">
                <h2 className="section-title mb-4">{t.nav.payments}</h2>

                {projects.flatMap((p) => p.payments ?? []).length === 0 ? (
                  <p className="hint">{t.dashboard.noPayments}</p>
                ) : (
                  <ul className="space-y-3">
                    {projects
                      .flatMap((item) =>
                        (item.payments ?? []).map((payment) => ({ ...payment, item }))
                      )
                      .slice(0, 6)
                      .map((payment) => (
                        <li
                          key={payment.id}
                          className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm tabular-nums">
                              {formatAmount(payment.amount)}
                            </p>
                            <p className="text-xs text-[var(--faint)]">
                              {formatDate(payment.dueDate)}
                            </p>
                          </div>
                          <span className={`badge ${paymentStatusBadges[payment.status]}`}>
                            {t.status[payment.status]}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Tahrirlash */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={t.common.edit}
        closeLabel={t.common.close}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="e-name" className="label">
                {t.common.name}
              </label>
              <input
                id="e-name"
                type="text"
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="e-email" className="label">
                {t.common.email}
              </label>
              <input
                id="e-email"
                type="email"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="e-company" className="label">
                {t.common.company}
              </label>
              <input
                id="e-company"
                type="text"
                value={edit.company}
                onChange={(e) => setEdit({ ...edit, company: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="e-phone" className="label">
                {t.common.phone}
              </label>
              <input
                id="e-phone"
                type="tel"
                value={edit.phone}
                onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="e-status" className="label">
              {t.common.status}
            </label>
            <select
              id="e-status"
              value={edit.status}
              onChange={(e) =>
                setEdit({ ...edit, status: e.target.value as ClientStatus })
              }
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
            <label htmlFor="e-notes" className="label">
              {t.common.notes}
            </label>
            <textarea
              id="e-notes"
              rows={3}
              value={edit.notes}
              onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              className="input"
              placeholder={t.clients.notesPlaceholder}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={savingEdit} className="btn btn-accent">
              {savingEdit ? t.common.saving : t.common.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn btn-ghost"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Yangi taklif */}
      <Modal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        title={t.clients.newProposal}
        closeLabel={t.common.close}
      >
        <form onSubmit={handleCreateProposal} className="space-y-4">
          {formError && <div className="alert alert-danger">{formError}</div>}

          <div>
            <label htmlFor="p-title" className="label">
              {t.clients.proposalTitle}
            </label>
            <input
              id="p-title"
              type="text"
              value={proposal.title}
              onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
              required
              autoFocus
              className="input"
              placeholder={t.clients.proposalTitlePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="p-amount" className="label">
              {t.clients.proposalAmount}
            </label>
            <input
              id="p-amount"
              type="number"
              value={proposal.amount}
              onChange={(e) => setProposal({ ...proposal, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="p-desc" className="label">
              {t.clients.proposalDescription}{" "}
              <span className="text-[var(--faint)]">({t.common.optional})</span>
            </label>
            <textarea
              id="p-desc"
              rows={3}
              value={proposal.description}
              onChange={(e) =>
                setProposal({ ...proposal, description: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? t.common.saving : t.common.save}
            </button>
            <button
              type="button"
              onClick={() => setProposalOpen(false)}
              className="btn btn-ghost"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Yangi loyiha */}
      <Modal
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        title={t.clients.newProject}
        closeLabel={t.common.close}
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {formError && <div className="alert alert-danger">{formError}</div>}

          <div>
            <label htmlFor="pr-title" className="label">
              {t.clients.proposalTitle}
            </label>
            <input
              id="pr-title"
              type="text"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              required
              autoFocus
              className="input"
              placeholder={t.clients.projectTitlePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="pr-deadline" className="label">
              {t.common.deadline}{" "}
              <span className="text-[var(--faint)]">({t.common.optional})</span>
            </label>
            <input
              id="pr-deadline"
              type="date"
              value={project.deadline}
              onChange={(e) => setProject({ ...project, deadline: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="pr-desc" className="label">
              {t.clients.proposalDescription}{" "}
              <span className="text-[var(--faint)]">({t.common.optional})</span>
            </label>
            <textarea
              id="pr-desc"
              rows={3}
              value={project.description}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? t.common.saving : t.common.save}
            </button>
            <button
              type="button"
              onClick={() => setProjectOpen(false)}
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
