"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

export default function PrintButton({ backHref }: { backHref: string }) {
  const { t } = useI18n();
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
        ← {t.document.backToProject}
      </Link>
      <button onClick={() => window.print()} className="btn btn-accent btn-sm">
        {t.document.printSave}
      </button>
      <span className="hint">{t.document.printHint}</span>
    </div>
  );
}
