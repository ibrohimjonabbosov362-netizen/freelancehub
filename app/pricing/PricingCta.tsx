"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/client";

type Props = {
  href: string;
  label: string;
  premium: boolean;
  className: string;
  interval?: "monthly" | "yearly";
};

// Premium: kirgan bo'lsa Checkout'ga, aks holda ro'yxatdan o'tishga.
export default function PricingCta({
  href,
  label,
  premium,
  className,
  interval = "monthly",
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!premium || status !== "authenticated") {
      router.push(premium && status === "loading" ? "/billing" : href);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        // Sozlanmagan yoki allaqachon Premium bo'lsa — tarif sahifasiga.
        setError(data.error || t.billing.checkoutFailed);
        setBusy(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t.common.serverError);
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={handleClick} disabled={busy} className={className}>
        {busy ? t.billing.redirecting : label}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
      )}
    </>
  );
}
