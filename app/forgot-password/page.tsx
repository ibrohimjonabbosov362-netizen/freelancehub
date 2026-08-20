"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Xatolik yuz berdi");
        return;
      }

      setSent(true);
    } catch {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="brand mb-8 text-xl font-semibold">
        Freelance<span className="gradient-text">Hub</span>
      </Link>

      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-semibold">Parolni tiklash</h1>
        <p className="hint mb-6">
          Email manzilingizni kiriting — tiklash havolasini yuboramiz.
        </p>

        {sent ? (
          <>
            <div className="alert alert-success">
              Agar bu email bilan hisob mavjud bo&apos;lsa, tiklash havolasi
              yuborildi. Pochtangizni tekshiring — havola 1 soat amal qiladi.
            </div>
            <Link href="/login" className="btn btn-ghost mt-5 w-full">
              Kirish sahifasiga qaytish
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <div>
              <label htmlFor="fp-email" className="label">Email</label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="email@example.com"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-accent w-full">
              {loading ? "Yuborilmoqda..." : "Havola yuborish"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          Esladingizmi?{" "}
          <Link href="/login" className="link">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
