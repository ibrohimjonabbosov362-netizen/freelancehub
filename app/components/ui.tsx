"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ Avatar */

const AVATAR_TONES = [
  { bg: "rgba(139, 92, 246, 0.16)", fg: "#c4b5fd", ring: "rgba(139, 92, 246, 0.3)" },
  { bg: "rgba(52, 211, 153, 0.14)", fg: "#6ee7b7", ring: "rgba(52, 211, 153, 0.28)" },
  { bg: "rgba(96, 165, 250, 0.14)", fg: "#93c5fd", ring: "rgba(96, 165, 250, 0.28)" },
  { bg: "rgba(251, 191, 36, 0.14)", fg: "#fcd34d", ring: "rgba(251, 191, 36, 0.28)" },
];

export function initials(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Ism bo'yicha barqaror rang — har safar bir xil chiqadi */
function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

const AVATAR_SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const tone = toneFor(name ?? "?");

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${AVATAR_SIZES[size]} ${className}`}
      style={{
        background: tone.bg,
        color: tone.fg,
        border: `1px solid ${tone.ring}`,
      }}
    >
      {initials(name)}
    </span>
  );
}

/* -------------------------------------------------------------- PageHeader */

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="hint mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- StatCard */

const STAT_TONES = {
  neutral: "var(--muted)",
  accent: "var(--accent-soft)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  href,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: keyof typeof STAT_TONES;
  href?: string;
  icon?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
        {icon && <span style={{ color: STAT_TONES[tone] }}>{icon}</span>}
      </div>
      <p
        className="mt-2 text-2xl font-semibold tracking-tight tabular-nums"
        style={tone === "neutral" ? undefined : { color: STAT_TONES[tone] }}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--faint)]">{hint}</p>}
    </>
  );

  const className = "card card-hover block p-4";

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon text-[var(--faint)]">{icon}</div>}
      <p className="mb-1 font-medium">{title}</p>
      {text && <p className="hint max-w-sm">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Skeleton */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}

/** Jadval yuklanayotganda: sarlavha bilan bir xil ustun soni */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-[var(--border)]" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={`h-4 ${c === 0 ? "w-40" : c === cols - 1 ? "w-16" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4" aria-hidden="true">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  tone = "default",
  closeLabel = "Yopish",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "accent";
  closeLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    // Modal ochiqligida fon aylanmasin
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-[var(--border-strong)] p-6 outline-none sm:rounded-2xl"
        style={{ background: "var(--surface)" }}
      >
        {tone === "accent" && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
            style={{
              background:
                "linear-gradient(160deg, rgba(139,92,246,0.22), transparent 70%)",
            }}
          />
        )}

        <div className="relative">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && <p className="hint mt-1.5">{description}</p>}
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex flex-wrap gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Toast */

type Tone = "success" | "danger" | "info";
type ToastItem = { id: number; message: string; tone: Tone };

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {items.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg"
            style={{
              background: "var(--surface-2)",
              borderColor:
                toast.tone === "danger"
                  ? "color-mix(in srgb, var(--danger) 35%, transparent)"
                  : toast.tone === "success"
                    ? "color-mix(in srgb, var(--success) 35%, transparent)"
                    : "var(--border-strong)",
            }}
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background:
                  toast.tone === "danger"
                    ? "var(--danger)"
                    : toast.tone === "success"
                      ? "var(--success)"
                      : "var(--accent-soft)",
              }}
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
