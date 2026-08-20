"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import { useI18n } from "@/lib/i18n/client";

export default function ForgotPasswordPage() {
  const { t } = useI18n();

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
        setError(data.error || t.common.genericError);
        return;
      }

      setSent(true);
    } catch {
      setError(t.common.serverError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t.auth.forgotTitle}
      subtitle={t.auth.forgotSubtitle}
      footer={
        <>
          {t.auth.remembered}{" "}
          <Link href="/login" className="link">
            {t.auth.signIn}
          </Link>
        </>
      }
    >
      {sent ? (
        <>
          <div className="alert alert-success">{t.auth.forgotSent}</div>
          <Link href="/login" className="btn btn-ghost mt-5 w-full">
            {t.auth.backToLogin}
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <div>
            <label htmlFor="fp-email" className="label">
              {t.common.email}
            </label>
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
            {loading ? t.auth.sending : t.auth.sendLink}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
