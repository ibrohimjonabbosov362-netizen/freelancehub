"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";
import { useI18n } from "@/lib/i18n/client";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Faqat ilova ichidagi manzillarga ruxsat beramiz: aks holda
  // `/login?callbackUrl=https://begona-sayt` havolasi orqali odam muvaffaqiyatli
  // kirgandan keyin fishing sahifasiga olib ketilardi. Brauzer `//` va `\` bilan
  // boshlanadigan qiymatlarni ham tashqi manzil deb o'qiydi — ularni ham rad etamiz.
  const requestedCallbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const callbackUrl =
    requestedCallbackUrl.startsWith("/") &&
    !requestedCallbackUrl.startsWith("//") &&
    !requestedCallbackUrl.includes("\\")
      ? requestedCallbackUrl
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Google orqali kirishda NextAuth xatolikni ?error= bilan shu sahifaga qaytaradi —
  // bu render paytida darhol o'qiladi, useEffect ichida setState chaqirish shart emas.
  const [error, setError] = useState(() => {
    const code = searchParams.get("error");
    if (code === "OAuthAccountNotLinked") return t.auth.oauthAccountNotLinked;
    if (code) return t.auth.invalidCredentials;
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError(t.auth.invalidCredentials);
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
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="label mb-0">
            {t.auth.password}
          </label>
          <Link href="/forgot-password" className="link-muted text-xs">
            {t.auth.forgot}
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
          placeholder={t.auth.passwordPlaceholder}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-accent w-full">
        {loading ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}

function LoginContent() {
  const { t } = useI18n();

  return (
    <AuthLayout
      title={t.auth.welcome}
      subtitle={t.auth.loginSubtitle}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link href="/register" className="link">
            {t.nav.register}
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="hint">{t.common.loading}</p>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
