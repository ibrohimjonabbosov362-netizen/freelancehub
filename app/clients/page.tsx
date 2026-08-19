"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Icon from "../Icon";
import Topbar from "../Topbar";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string | null;
};

async function fetchClients(): Promise<{ clients: Client[]; error: string }> {
  try {
    const res = await fetch("/api/clients");
    const data = await res.json();

    return {
      clients: Array.isArray(data) ? data : [],
      error: res.ok ? "" : data?.error || "Mijozlarni yuklab bo'lmadi",
    };
  } catch {
    return { clients: [], error: "Server bilan bog'lanishda xatolik" };
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let res: Response;
    let data: { error?: string };

    try {
      res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
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

    setName("");
    setEmail("");
    setCompany("");
    setShowForm(false);
    setSubmitting(false);

    const result = await fetchClients();
    setClients(result.clients);
    setLoadError(result.error);
  }

  const term = query.trim().toLowerCase();
  const visible = term
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.company ?? "").toLowerCase().includes(term)
      )
    : clients;

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Mijoz nomi yoki email..."
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="page-title">Mijozlar</h1>
              <p className="hint mt-1">
                {loading ? "Yuklanmoqda..." : `${visible.length} ta mijoz`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-accent"
            >
              {showForm ? "Bekor qilish" : "+ Mijoz qo'shish"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-6">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="label">
                    Ism
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input"
                    placeholder="Alisher Karimov"
                  />
                </div>

                <div>
                  <label htmlFor="c-email" className="label">
                    Email
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                    placeholder="mijoz@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="c-company" className="label">
                  Kompaniya <span className="text-[var(--faint)]">(ixtiyoriy)</span>
                </label>
                <input
                  id="c-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="input"
                  placeholder="ACME Studio"
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

          <div className="card overflow-hidden">
            {loading ? (
              <p className="hint p-6">Yuklanmoqda...</p>
            ) : loadError ? (
              <p className="p-6 text-sm text-[var(--danger)]">{loadError}</p>
            ) : visible.length === 0 ? (
              <div className="empty">
                <div className="empty-icon text-[var(--faint)]">
                  <Icon name="users" />
                </div>
                <p className="mb-1 font-medium">
                  {term ? "Hech narsa topilmadi" : "Hali mijoz qo'shilmagan"}
                </p>
                <p className="hint">
                  {term
                    ? "Boshqa so'z bilan qidirib ko'ring."
                    : "Birinchi mijozingizni qo'shib, ish boshlang."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ism</th>
                      <th>Email</th>
                      <th>Kompaniya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <Link href={`/clients/${client.id}`} className="link">
                            {client.name}
                          </Link>
                        </td>
                        <td className="text-[var(--muted)]">{client.email}</td>
                        <td className="text-[var(--muted)]">
                          {client.company || "—"}
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
