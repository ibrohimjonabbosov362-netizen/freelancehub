"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== repeat) {
      setError("Parollar mos kelmadi");
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
        setError(data.error || "Xatolik yuz berdi");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <div className="alert alert-danger">
          Havola to&apos;liq emas. Tiklash xatidagi havolani to&apos;liq oching.
        </div>
        <Link href="/forgot-password" className="btn btn-ghost mt-5 w-full">
          Qaytadan so&apos;rash
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <div className="alert alert-success">
        Parol o&apos;zgartirildi. Kirish sahifasiga yo&apos;naltirilyapsiz...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div>
        <label htmlFor="rp-new" className="label">Yangi parol</label>
        <input
          id="rp-new"
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

      <div>
        <label htmlFor="rp-rep" className="label">Takrorlang</label>
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
        {loading ? "Saqlanmoqda..." : "Parolni o'rnatish"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="font-display mb-8 text-xl font-semibold">
        Freelance<span className="gradient-text">Hub</span>
      </Link>

      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-semibold">Yangi parol</h1>
        <p className="hint mb-6">Hisobingiz uchun yangi parol o&apos;rnating.</p>

        <Suspense fallback={<p className="hint">Yuklanmoqda...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
