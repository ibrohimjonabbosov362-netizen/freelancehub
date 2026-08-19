"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

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
