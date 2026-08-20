"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../AppShell";
import Icon from "../../Icon";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { contractTemplates, getTemplate } from "@/lib/contractTemplates";
import {
  PAYMENT_STATUSES,
  PROJECT_STATUSES,
  contractStatusBadges,
  paymentStatusBadges,
  type ContractStatus,
  type PaymentStatus,
  type ProjectStatus,
} from "@/lib/statuses";

type Payment = {
  id: string;
  amount: string;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
};

type Contract = {
  id: string;
  title: string | null;
  status: ContractStatus;
  content: string;
  signedAt: string | null;
} | null;

type ProjectDetail = {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  client: { id: string; name: string; email: string; company: string | null };
  proposal: { id: string; title: string; amount: string } | null;
  contract: Contract;
  payments: Payment[];
};

async function fetchProject(id: string): Promise<ProjectDetail | null> {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as ProjectDetail;
  } catch {
    return null;
  }
}

export default function ProjectDetailPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userName, setUserName] = useState("");

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");

  const [contractText, setContractText] = useState("");
  const [contractTitle, setContractTitle] = useState("");
  const [contractDirty, setContractDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [result, subRes, sessionRes] = await Promise.all([
        fetchProject(id),
        fetch("/api/subscription").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/auth/session").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (cancelled) return;

      if (result) {
        setProject(result);
        setContractText(result.contract?.content ?? "");
        setContractTitle(result.contract?.title ?? "");
      } else {
        setNotFound(true);
      }
      setIsPremium(Boolean(subRes?.isPremium));
      setUserName(sessionRes?.user?.name ?? "");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reload() {
    const result = await fetchProject(id);
    if (result) {
      setProject(result);
      if (!contractDirty) {
        setContractText(result.contract?.content ?? "");
        setContractTitle(result.contract?.title ?? "");
      }
    }
  }

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t.common.genericError);
        return false;
      }

      return true;
    } catch {
      setError(t.common.serverError);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleProjectStatus(status: string) {
    if (await send(`/api/projects/${id}`, "PATCH", { status })) await reload();
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();

    const ok = await send(`/api/projects/${id}/payments`, "POST", {
      amount: paymentAmount,
      dueDate: paymentDueDate,
    });

    if (ok) {
      setPaymentAmount("");
      setPaymentDueDate("");
      setShowPaymentForm(false);
      await reload();
    }
  }

  async function handlePaymentStatus(paymentId: string, status: string) {
    if (await send(`/api/payments/${paymentId}`, "PATCH", { status })) await reload();
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm(t.projectDetail.deletePaymentConfirm)) return;
    if (await send(`/api/payments/${paymentId}`, "DELETE")) await reload();
  }

  async function handleSaveContract(status?: ContractStatus) {
    const ok = await send(`/api/projects/${id}/contract`, "PUT", {
      content: contractText,
      title: contractTitle,
      ...(status ? { status } : {}),
    });

    if (ok) {
      setContractDirty(false);
      await reload();
    }
  }

  async function handleSignContract(signed: boolean) {
    if (await send(`/api/projects/${id}/contract`, "PATCH", { signed })) {
      setContractDirty(false);
      await reload();
    }
  }

  async function handleDeleteProject() {
    if (!confirm(t.projectDetail.deleteConfirm)) return;
    if (await send(`/api/projects/${id}`, "DELETE")) {
      router.push("/projects");
      router.refresh();
    }
  }

  function applyTemplate(templateId: string) {
    if (!templateId || !project) return;

    const template = getTemplate(templateId);
    if (!template) return;

    if (contractText.trim() && !confirm(t.projectDetail.replaceConfirm)) {
      return;
    }

    const total = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);

    setContractText(
      template.build({
        freelancerName: userName || t.projectDetail.contractor,
        clientName: project.client.name,
        clientCompany: project.client.company,
        projectTitle: project.title,
        amount: formatAmount(total > 0 ? total : project.proposal?.amount ?? 0),
        date: formatDate(new Date()),
      })
    );
    setContractDirty(true);
  }

  if (loading) {
    return (
      <AppShell>
        <p className="hint px-5 py-8 sm:px-8 sm:py-10">{t.common.loading}</p>
      </AppShell>
    );
  }

  if (notFound || !project) {
    return (
      <AppShell>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="empty card mx-auto max-w-md">
            <div className="empty-icon text-[var(--faint)]">
              <Icon name="search" />
            </div>
            <p className="mb-1 font-medium">{t.projectDetail.notFound}</p>
            <Link href="/projects" className="link mt-2 text-sm">
              {t.projectDetail.back}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalDue = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = project.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const progress = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const signed = Boolean(project.contract?.signedAt);

  // Mijoz → Taklif → Loyiha → Shartnoma → To'lov
  const workflowSteps = [
    { label: t.projectDetail.stepClient, done: true },
    { label: t.projectDetail.stepProposal, done: Boolean(project.proposal) },
    { label: t.projectDetail.stepProject, done: true },
    { label: t.projectDetail.stepContract, done: signed },
    { label: t.projectDetail.stepPayment, done: totalPaid > 0 },
  ];

  return (
    <AppShell>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/projects" className="link-muted text-sm">
            ← {t.projectDetail.back}
          </Link>

          {error && <div className="alert alert-danger mt-4">{error}</div>}

          {/* Umumiy ma'lumot */}
          <div className="card mb-6 mt-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold">{project.title}</h1>
                <p className="hint mt-1">
                  {t.common.client}:{" "}
                  <Link href={`/clients/${project.client.id}`} className="link">
                    {project.client.name}
                  </Link>{" "}
                  · {t.projectDetail.created}: {formatDate(project.createdAt)}
                </p>
              </div>

              <button
                onClick={handleDeleteProject}
                disabled={busy}
                className="btn btn-danger btn-sm"
              >
                {t.common.delete}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label htmlFor="pr-status" className="hint">
                {t.projectDetail.statusLabel}
              </label>
              <select
                id="pr-status"
                value={project.status}
                onChange={(e) => handleProjectStatus(e.target.value)}
                disabled={busy}
                className="input w-auto py-1.5 text-sm"
              >
                {PROJECT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t.status[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ish oqimi: mijozdan to'lovgacha */}
          <div className="card mb-6 p-6">
            <h2 className="section-title mb-4">{t.projectDetail.workflow}</h2>

            <ol className="flex items-start gap-1 overflow-x-auto pb-1">
              {workflowSteps.map((step, index) => (
                <li
                  key={step.label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
                >
                  <div className="flex w-full items-center">
                    <span
                      className={`h-px flex-1 ${
                        index === 0 ? "opacity-0" : ""
                      }`}
                      style={{
                        background: workflowSteps[index - 1]?.done
                          ? "var(--accent-2)"
                          : "var(--border)",
                      }}
                      aria-hidden="true"
                    />
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                      style={
                        step.done
                          ? {
                              background:
                                "linear-gradient(135deg, var(--accent-1), var(--accent-2))",
                              borderColor: "transparent",
                              color: "#fff",
                            }
                          : {
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--faint)",
                            }
                      }
                    >
                      {step.done ? (
                        <Icon name="check" className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`h-px flex-1 ${
                        index === workflowSteps.length - 1 ? "opacity-0" : ""
                      }`}
                      style={{
                        background: step.done ? "var(--accent-2)" : "var(--border)",
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className={`text-[0.6875rem] leading-tight sm:text-xs ${
                      step.done ? "text-[var(--ink)]" : "text-[var(--faint)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* To'lovlar */}
          <div className="card mb-6 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title">{t.nav.payments}</h2>
                <p className="hint mt-1">
                  {formatAmount(totalPaid)} / {formatAmount(totalDue)}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="btn btn-ghost btn-sm"
              >
                {showPaymentForm ? t.common.cancel : t.projectDetail.addPayment}
              </button>
            </div>

            {totalDue > 0 && (
              <div
                className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t.projectDetail.paymentProgress}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, var(--accent-1), var(--accent-2))",
                  }}
                />
              </div>
            )}

            {showPaymentForm && (
              <form
                onSubmit={handleAddPayment}
                className="mb-5 space-y-4 rounded-xl bg-[var(--surface-2)] p-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pay-amount" className="label">
                      {t.common.amount}
                    </label>
                    <input
                      id="pay-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-due" className="label">
                      {t.common.dueDate}
                    </label>
                    <input
                      id="pay-due"
                      type="date"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      required
                      className="input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-accent btn-sm"
                >
                  {busy ? t.common.saving : t.common.add}
                </button>
              </form>
            )}

            {project.payments.length === 0 ? (
              <p className="hint">{t.projectDetail.noPayments}</p>
            ) : (
              <ul className="space-y-3">
                {project.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{formatAmount(payment.amount)}</p>
                      <p className="text-xs text-[var(--faint)]">
                        {t.common.dueDate}: {formatDate(payment.dueDate)}
                        {payment.paidAt &&
                          ` · ${t.status.PAID}: ${formatDate(payment.paidAt)}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${paymentStatusBadges[payment.status]}`}>
                        {t.status[payment.status]}
                      </span>

                      <select
                        value={payment.status}
                        onChange={(e) =>
                          handlePaymentStatus(payment.id, e.target.value)
                        }
                        disabled={busy}
                        aria-label={t.projectDetail.paymentStatus}
                        className="input w-auto py-1.5 text-sm"
                      >
                        {PAYMENT_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {t.status[value]}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={busy}
                        className="btn btn-danger btn-sm"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shartnoma */}
          <div className="card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title">{t.projectDetail.contract}</h2>

              <div className="flex flex-wrap items-center gap-2">
                {project.contract && (
                  <span
                    className={`badge ${contractStatusBadges[project.contract.status]}`}
                  >
                    {t.status[project.contract.status]}
                    {signed && ` · ${formatDate(project.contract.signedAt)}`}
                  </span>
                )}

                {project.contract && (
                  isPremium ? (
                    <Link
                      href={`/projects/${id}/print?download=1`}
                      className="btn btn-ghost btn-sm"
                    >
                      {t.projectDetail.downloadPdf}
                    </Link>
                  ) : (
                    <Link
                      href="/billing"
                      className="btn btn-ghost btn-sm opacity-70"
                      title={t.projectDetail.pdfPremium}
                    >
                      <Icon name="lock" className="h-3.5 w-3.5" />
                      {t.projectDetail.pdfExport}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Shablonlar — Premium */}
            {!signed && (
              <div className="mb-4">
                {isPremium ? (
                  <>
                    <label htmlFor="tpl" className="label">
                      Shablondan boshlash
                    </label>
                    <select
                      id="tpl"
                      defaultValue=""
                      onChange={(e) => {
                        applyTemplate(e.target.value);
                        e.target.value = "";
                      }}
                      className="input"
                    >
                      <option value="">{t.projectDetail.selectTemplate}</option>
                      {contractTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — {t.description}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                    <p className="mb-1 flex items-center gap-2 font-medium">
                      <Icon name="lock" className="h-4 w-4 text-[var(--faint)]" />
                      Shartnoma shablonlari
                    </p>
                    <p className="hint">
                      Tayyor shablonlar va PDF eksport Premium tarifda.{" "}
                      <Link href="/billing" className="link">
                        Premium&apos;ga o&apos;tish
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}

            {!signed && (
              <div className="mb-3">
                <label htmlFor="contract-title" className="label">
                  {t.projectDetail.contractName}{" "}
                  <span className="text-[var(--faint)]">({t.common.optional})</span>
                </label>
                <input
                  id="contract-title"
                  type="text"
                  value={contractTitle}
                  onChange={(e) => {
                    setContractTitle(e.target.value);
                    setContractDirty(true);
                  }}
                  className="input"
                  placeholder={t.projectDetail.contractNamePlaceholder}
                />
              </div>
            )}

            {signed ? (
              <pre className="whitespace-pre-wrap rounded-xl bg-[var(--surface-2)] p-4 font-sans text-sm text-[var(--muted)]">
                {project.contract?.content}
              </pre>
            ) : (
              <textarea
                value={contractText}
                onChange={(e) => {
                  setContractText(e.target.value);
                  setContractDirty(true);
                }}
                rows={12}
                placeholder={t.projectDetail.contractBodyPlaceholder}
                className="input font-mono text-[13px]"
              />
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!signed && (
                <button
                  onClick={() => handleSaveContract()}
                  disabled={busy || !contractText.trim()}
                  className="btn btn-accent btn-sm"
                >
                  {t.common.save}
                </button>
              )}

              {/* Qoralamani mijoz tasdig'iga yuborish */}
              {!signed && project.contract?.status === "DRAFT" && (
                <button
                  onClick={() => handleSaveContract("PENDING_APPROVAL")}
                  disabled={busy || !contractText.trim()}
                  className="btn btn-ghost btn-sm"
                >
                  {t.projectDetail.sendForApproval}
                </button>
              )}

              {!signed && project.contract?.status === "PENDING_APPROVAL" && (
                <button
                  onClick={() => handleSaveContract("DRAFT")}
                  disabled={busy}
                  className="btn btn-ghost btn-sm"
                >
                  {t.projectDetail.backToDraft}
                </button>
              )}

              {project.contract && !signed && (
                <button
                  onClick={() => handleSignContract(true)}
                  disabled={busy || contractDirty}
                  className="btn btn-ghost btn-sm"
                  title={
                    contractDirty ? t.projectDetail.saveFirst : t.projectDetail.signHint
                  }
                >
                  {t.projectDetail.sign}
                </button>
              )}

              {signed && (
                <button
                  onClick={() => handleSignContract(false)}
                  disabled={busy}
                  className="btn btn-ghost btn-sm"
                >
                  {t.projectDetail.unsign}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
