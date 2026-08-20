"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import { useI18n } from "@/lib/i18n/client";

export default function ForgotPasswordPage() {
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  // Pochta sozlanmagan bo'lsa forma o'rniga halol xabar ko'rsatamiz
  const [mailReady, setMailReady] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/providers-status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMailReady(Boolean(data.passwordReset));
      } catch {
        // aniqlab bo'lmasa formani qoldiramiz
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      {!mailReady ? (
        <>
          <div className="alert alert-danger">
            <strong>{t.auth.mailOff}</strong>
            <p className="mt-1.5">{t.auth.mailOffText}</p>
            <a
              href="mailto:ibrohimjonabbosov362@gmail.com"
              className="link mt-1.5 inline-block"
            >
              ibrohimjonabbosov362@gmail.com
            </a>
          </div>
          <Link href="/login" className="btn btn-ghost mt-5 w-full">
            {t.auth.backToLogin}
          </Link>
        </>
      ) : sent ? (
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
