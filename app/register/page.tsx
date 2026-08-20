"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";


function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/providers-status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAvailable(Boolean(data.google));
      } catch {
        // sozlanmagan bo'lsa tugma ko'rinmaydi
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="btn btn-ghost w-full"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
          <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24Z" />
          <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3Z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8Z" />
        </svg>
        Google orqali kirish
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--faint)" }}>yoki</span>
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>
    </>
  );
}

export default function RegisterPage() {
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
        setError(data.error || "Xatolik yuz berdi");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Server bilan bog'lanishda xatolik");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-semibold brand">
        Freelance<span className="gradient-text">Hub</span>
      </Link>

      <div className="w-full max-w-md card p-8">
        <h1 className="text-xl font-semibold mb-1">Hisob yarating</h1>
        <p className="hint mb-6">Bepul, karta talab qilinmaydi</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <GoogleButton callbackUrl="/dashboard" />

          <div>
            <label htmlFor="name" className="label">
              Ism
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Ismingiz"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
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
              Parol
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
              placeholder="Kamida 6 belgi"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent w-full"
          >
            {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: "var(--muted)" }}>
          Hisobingiz bormi?{" "}
          <Link href="/login" className="link">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
