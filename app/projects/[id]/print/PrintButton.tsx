"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PrintButton({ backHref }: { backHref: string }) {
  const auto = useSearchParams().get("download") === "1";

  // "PDF yuklab olish" bosilganda saqlash oynasi o'zi ochiladi
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, [auto]);

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <Link href={backHref} className="btn btn-ghost btn-sm">
        ← Loyihaga qaytish
      </Link>
      <button onClick={() => window.print()} className="btn btn-accent btn-sm">
        Chop etish / PDF saqlash
      </button>
      <span className="hint">
        Ochilgan oynada &quot;Saqlash manzili&quot; sifatida <strong>PDF</strong> ni
        tanlang.
      </span>
    </div>
  );
}
