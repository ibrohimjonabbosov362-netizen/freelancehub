"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";
import { useI18n } from "@/lib/i18n/client";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.common.genericError);
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError(t.common.serverError);
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="link">
            {t.auth.signIn}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="alert alert-danger">{error}</div>}

        <GoogleButton callbackUrl="/dashboard" />

        <div>
          <label htmlFor="name" className="label">
            {t.common.name}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            placeholder={t.auth.namePlaceholder}
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            {t.common.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            {t.auth.password}
          </label>
          <input
            id="password"
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

        <button type="submit" disabled={loading} className="btn btn-accent w-full">
          {loading ? t.auth.signingUp : t.auth.signUp}
        </button>
      </form>
    </AuthLayout>
  );
}
