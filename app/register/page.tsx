"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <Link href="/" className="mb-8 text-xl font-semibold font-display">
        Freelance<span className="gradient-text">Hub</span>
      </Link>

      <div className="w-full max-w-md card p-8">
        <h1 className="text-xl font-semibold mb-1">Hisob yarating</h1>
        <p className="hint mb-6">Bepul, karta talab qilinmaydi</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger">{error}</div>}

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
