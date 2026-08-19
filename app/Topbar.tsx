"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Topbar({
  query,
  onQueryChange,
  placeholder = "Qidirish...",
}: {
  query?: string;
  onQueryChange?: (value: string) => void;
  placeholder?: string;
}) {
  const { data: session } = useSession();
  const [time, setTime] = useState("");

  // Soat serverda renderlanmaydi — aks holda hidratsiya mos kelmaydi
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query ?? ""}
          onChange={(e) => onQueryChange?.(e.target.value)}
          disabled={!onQueryChange}
          placeholder={placeholder}
          aria-label="Qidirish"
          className="input py-2 pl-9 text-sm disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)] text-xs font-semibold text-white">
            {initials(session?.user?.name)}
          </span>
          <span className="hidden text-sm font-medium sm:inline">
            {session?.user?.name}
          </span>
        </div>

        <span className="hidden text-sm text-[var(--muted)] tabular-nums sm:inline">
          {time}
        </span>
      </div>
    </div>
  );
}
