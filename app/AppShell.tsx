"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

type NavLink = { href: string; label: string; icon: React.ReactNode };

const icon = (path: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px] shrink-0"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

const links: NavLink[] = [
  {
    href: "/dashboard",
    label: "Boshqaruv paneli",
    icon: icon("M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"),
  },
  {
    href: "/clients",
    label: "Mijozlar",
    icon: icon(
      "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1a4 4 0 0 0-3-3.87M16.5 4.13a4 4 0 0 1 0 7.75"
    ),
  },
  {
    href: "/proposals",
    label: "Takliflar",
    icon: icon(
      "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4"
    ),
  },
  {
    href: "/projects",
    label: "Loyihalar",
    icon: icon(
      "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
    ),
  },
  {
    href: "/payments",
    label: "To'lovlar",
    icon: icon(
      "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
    ),
  },
  {
    href: "/billing",
    label: "Tarif",
    icon: icon(
      "M3 10h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm4 8h3"
    ),
  },
  {
    href: "/settings",
    label: "Sozlamalar",
    icon: icon(
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.1l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.9-1.1L14.7 3H9.3l-.4 2.4c-.7.3-1.3.6-1.9 1.1l-2.3-1-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2.2l-2 1.5 2 3.4 2.3-1c.6.5 1.2.8 1.9 1.1l.4 2.4h5.4l.4-2.4c.7-.3 1.3-.6 1.9-1.1l2.3 1 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z"
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 px-3">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] font-medium text-white shadow-[0_6px_18px_-8px_var(--accent-glow)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobil sarlavha */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Menyuni ochish"
          className="btn btn-ghost btn-sm px-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="font-display text-lg font-semibold">
          Freelance<span className="gradient-text">Hub</span>
        </span>
      </header>

      {/* Mobilda panel ortidagi qorong'i fon */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="font-display text-xl font-semibold"
          >
            Freelance<span className="gradient-text">Hub</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Menyuni yopish"
            className="text-[var(--muted)] hover:text-[var(--ink)] md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {nav}

        <div className="border-t border-[var(--border)] p-3">
          {session?.user && (
            <div className="mb-2 px-3 py-2">
              <p className="truncate text-sm font-medium">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-[var(--faint)]">
                {session.user.email}
              </p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            {icon("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9")}
            Chiqish
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
