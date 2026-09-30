"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import { useI18n } from "@/lib/i18n/client";

function ResetForm() {
  const { t } = useI18n();
  const router = useRouter();
  // Token manzilning `#` qismida keladi — brauzer uni serverga yubormaydi,
  // shuning uchun faqat klient tomonda o'qiladi.
  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setToken(hash.get("token") ?? "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== repeat) {
      setError(t.auth.passwordsDiffer);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.common.genericError);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError(t.common.serverError);
    } finally {
      setLoading(false);
    }
  }

  // Token faqat brauzerda o'qiladi — birinchi render'da hali ma'lum emas
  if (token === null) {
    return <p className="hint">{t.common.loading}</p>;
  }

  if (!token) {
    return (
      <>
        <div className="alert alert-danger">{t.auth.invalidLink}</div>
        <Link href="/forgot-password" className="btn btn-ghost mt-5 w-full">
          {t.auth.forgotTitle}
        </Link>
      </>
    );
  }

  if (done) {
    return <div className="alert alert-success">{t.auth.resetDone}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div>
        <label htmlFor="rp-new" className="label">
          {t.auth.newPassword}
        </label>
        <input
          id="rp-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="input"
          placeholder={t.auth.passwordHint}
        />
      </div>

      <div>
        <label htmlFor="rp-rep" className="label">
          {t.auth.repeatPassword}
        </label>
        <input
          id="rp-rep"
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
          minLength={6}
          className="input"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-accent w-full">
        {loading ? t.auth.saving : t.auth.savePassword}
      </button>
    </form>
  );
}

function ResetPasswordContent() {
  const { t } = useI18n();

  return (
    <AuthLayout
      title={t.auth.resetTitle}
      subtitle={t.auth.resetSubtitle}
      footer={
        <>
          {t.auth.remembered}{" "}
          <Link href="/login" className="link">
            {t.auth.signIn}
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="hint">{t.common.loading}</p>}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
