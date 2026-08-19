"use client";

import Link from "next/link";

export default function PrintButton({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <Link href={backHref} className="btn btn-ghost btn-sm">
        ← Loyihaga qaytish
      </Link>
      <button onClick={() => window.print()} className="btn btn-accent btn-sm">
        Chop etish / PDF saqlash
      </button>
      <span className="hint">
        Chop etish oynasida &quot;PDF sifatida saqlash&quot;ni tanlang.
      </span>
    </div>
  );
}
