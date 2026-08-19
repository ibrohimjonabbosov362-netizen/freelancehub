"use client";

import { useState, useEffect } from "react";
import AppShell from "../AppShell";
import Icon from "../Icon";
import Topbar from "../Topbar";
import { formatAmount } from "@/lib/format";
import {
  PROPOSAL_STATUSES,
  proposalStatusBadges as statusBadges,
  proposalStatusLabels as statusLabels,
  type ProposalStatus,
} from "@/lib/statuses";

type Client = {
  id: string;
  name: string;
};

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
      error: proposalsRes.ok
        ? ""
        : proposalsData?.error || "Takliflarni yuklab bo'lmadi",
    };
  } catch {
    return {
      proposals: [],
      clients: [],
      error: "Server bilan bog'lanishda xatolik",
    };
  }
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
        body: JSON.stringify({ clientId, title, description, amount }),
      });
      data = await res.json();
    } catch {
      setError("Server bilan bog'lanishda xatolik");
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      setError(data.error || "Xatolik yuz berdi");
      setSubmitting(false);
      return;
    }

    setClientId("");
    setTitle("");
    setDescription("");
    setAmount("");
    setShowForm(false);
    setSubmitting(false);

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
        setStatusError(data.error || "Holatni yangilab bo'lmadi");
        return;
      }

      await reload();
    } catch {
      setStatusError("Server bilan bog'lanishda xatolik");
    } finally {
      setUpdatingId(null);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = term
    ? proposals.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.client.name.toLowerCase().includes(term)
      )
    : proposals;

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Taklif yoki mijoz..."
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="page-title">Takliflar</h1>
              <p className="hint mt-1">
                {loading ? "Yuklanmoqda..." : `${visible.length} ta taklif`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-accent"
            >
              {showForm ? "Bekor qilish" : "+ Taklif yaratish"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-6">
              {error && <div className="alert alert-danger">{error}</div>}

              <div>
                <label className="label">
                  Mijoz
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Mijozni tanlang</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Sarlavha
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Summa (so&apos;m)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent"
              >
                {submitting ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </form>
          )}

          {statusError && (
            <div className="alert alert-danger mb-4">{statusError}</div>
          )}

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
                  {term ? "Hech narsa topilmadi" : "Hali taklif yaratilmagan"}
                </p>
                <p className="hint">
                  {term
                    ? "Boshqa so'z bilan qidirib ko'ring."
                    : "Mijozga taklif yuboring — qabul qilinsa loyiha avtomatik ochiladi."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sarlavha</th>
                      <th>Mijoz</th>
                      <th>Summa</th>
                      <th>Holat</th>
                      <th>Holatni o&apos;zgartirish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id}>
                        <td className="font-medium">{p.title}</td>
                        <td className="text-[var(--muted)]">{p.client.name}</td>
                        <td className="whitespace-nowrap text-[var(--muted)]">
                          {formatAmount(p.amount)}
                        </td>
                        <td>
                          <span className={`badge ${statusBadges[p.status]}`}>
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleStatusChange(p.id, e.target.value)
                            }
                            disabled={updatingId === p.id}
                            aria-label="Taklif holati"
                            className="input py-1.5 text-sm"
                          >
                            {PROPOSAL_STATUSES.map((v) => (
                              <option key={v} value={v}>
                                {statusLabels[v]}
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
