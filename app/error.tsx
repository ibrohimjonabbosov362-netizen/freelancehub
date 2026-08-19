"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sahifa xatosi:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display gradient-text text-7xl font-semibold">500</p>
      <h1 className="mt-4 text-xl font-semibold">Nimadir noto&apos;g&apos;ri ketdi</h1>
      <p className="hint mt-2 max-w-sm">
        Kutilmagan xatolik yuz berdi. Qayta urinib ko&apos;ring — muammo
        takrorlansa, biroz kutib turing.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs" style={{ color: "var(--faint)" }}>
          Xato kodi: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn btn-accent">
          Qayta urinish
        </button>
        <Link href="/dashboard" className="btn btn-ghost">
          Boshqaruv paneliga
        </Link>
      </div>
    </div>
  );
}
