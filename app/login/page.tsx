"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";


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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email yoki parol noto'g'ri");
      setLoading(false);
      return;
    }

    // Foydalanuvchi qaysi sahifaga kirmoqchi bo'lgan bo'lsa, o'sha yerga qaytaramiz.
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <GoogleButton callbackUrl={callbackUrl} />

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
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="label mb-0">
            Parol
          </label>
          <Link href="/forgot-password" className="link-muted text-xs">
            Unutdingizmi?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
          placeholder="Parolingiz"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-accent w-full">
        {loading ? "Kirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-semibold font-display">
        Freelance<span className="gradient-text">Hub</span>
      </Link>

      <div className="w-full max-w-md card p-8">
        <h1 className="text-xl font-semibold mb-1">Xush kelibsiz</h1>
        <p className="hint mb-6">Hisobingizga kiring</p>

        <Suspense fallback={<p className="hint">Yuklanmoqda...</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-sm text-center" style={{ color: "var(--muted)" }}>
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="link">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}
