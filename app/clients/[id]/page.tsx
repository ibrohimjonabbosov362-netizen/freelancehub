"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../AppShell";
import Icon from "../../Icon";
import { formatAmount, formatDate } from "@/lib/format";
import {
  projectStatusBadges,
  projectStatusLabels,
  proposalStatusBadges,
  proposalStatusLabels,
  type ProjectStatus,
  type ProposalStatus,
} from "@/lib/statuses";

type Proposal = {
  id: string;
  title: string;
  amount: string;
  status: string;
  createdAt: string;
};

type Project = {
  id: string;
  title: string;
  status: string;
};

type ClientDetail = {
  id: string;
  name: string;
  email: string;
  company: string | null;
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

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Shu mijoz uchun taklif yaratish
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchClient(id);
      if (cancelled) return;

      if (result) {
        setClient(result);
      } else {
        setNotFound(true);
      }
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

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, title, description, amount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Taklifni saqlab bo'lmadi");
        return;
      }

      setTitle("");
      setDescription("");
      setAmount("");
      setShowForm(false);
      await reload();
    } catch {
      setFormError("Server bilan bog'lanishda xatolik");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Mijozni o'chirishga ishonchingiz komilmi?")) return;

    setDeleting(true);
    setActionError("");

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || "Mijozni o'chirib bo'lmadi");
        setDeleting(false);
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch {
      setActionError("Server bilan bog'lanishda xatolik");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="hint px-5 py-8 sm:px-8 sm:py-10">Yuklanmoqda...</p>
      </AppShell>
    );
  }

  if (notFound || !client) {
    return (
      <AppShell>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="empty card mx-auto max-w-md">
            <div className="empty-icon text-[var(--faint)]">
              <Icon name="search" />
            </div>
            <p className="mb-1 font-medium">Mijoz topilmadi</p>
            <Link href="/clients" className="link mt-2 text-sm">
              Mijozlar ro&apos;yxatiga qaytish
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const proposals = client.proposals ?? [];
  const projects = client.projects ?? [];

  return (
    <AppShell>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/clients" className="link-muted text-sm">
            ← Mijozlar ro&apos;yxatiga qaytish
          </Link>

          {actionError && (
            <div className="alert alert-danger mt-4">{actionError}</div>
          )}

          {/* Mijoz kartasi */}
          <div className="card mb-6 mt-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-lg font-semibold text-[var(--accent-2)]">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold">{client.name}</h1>
                  <a
                    href={`mailto:${client.email}`}
                    className="link-muted block text-sm"
                  >
                    {client.email}
                  </a>
                  {client.company && (
                    <p className="mt-0.5 text-sm text-[var(--faint)]">
                      {client.company}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger btn-sm"
              >
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>

          {/* Takliflar */}
          <div className="card mb-6 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title">Takliflar</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-ghost btn-sm"
              >
                {showForm ? "Bekor qilish" : "+ Taklif yaratish"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleCreateProposal}
                className="mb-5 space-y-4 rounded-xl bg-[var(--surface-2)] p-4"
              >
                {formError && <div className="alert alert-danger">{formError}</div>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="p-title" className="label">
                      Sarlavha
                    </label>
                    <input
                      id="p-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="input"
                      placeholder="Landing sayt"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-amount" className="label">
                      Summa (so&apos;m)
                    </label>
                    <input
                      id="p-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p-desc" className="label">
                    Tavsif <span className="text-[var(--faint)]">(ixtiyoriy)</span>
                  </label>
                  <textarea
                    id="p-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-accent btn-sm"
                >
                  {submitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </form>
            )}

            {proposals.length === 0 ? (
              <p className="hint">Hali taklif yo&apos;q.</p>
            ) : (
              <ul className="space-y-3">
                {proposals.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-[var(--faint)]">
                        {formatAmount(p.amount)} · {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <span className={`badge ${proposalStatusBadges[p.status as ProposalStatus]}`}>
                      {proposalStatusLabels[p.status as ProposalStatus] || p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Loyihalar */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Loyihalar</h2>

            {projects.length === 0 ? (
              <p className="hint">
                Hali loyiha yo&apos;q. Taklif qabul qilinganda avtomatik
                yaratiladi.
              </p>
            ) : (
              <ul className="space-y-3">
                {projects.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0"
                  >
                    <Link
                      href={`/projects/${p.id}`}
                      className="link truncate text-sm"
                    >
                      {p.title}
                    </Link>
                    <span className={`badge ${projectStatusBadges[p.status as ProjectStatus]}`}>
                      {projectStatusLabels[p.status as ProjectStatus] || p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
