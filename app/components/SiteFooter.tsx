"use client";

import Link from "next/link";
import LocaleSwitcher from "../LocaleSwitcher";
import { useI18n } from "@/lib/i18n/client";

export default function SiteFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t.footer.product,
      links: [
        { href: "/dashboard", label: t.nav.dashboard },
        { href: "/clients", label: t.nav.clients },
        { href: "/projects", label: t.nav.projects },
        { href: "/pricing", label: t.nav.pricing },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { href: "/#faq", label: t.footer.faq },
        { href: "/#how", label: t.nav.howItWorks },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/privacy", label: t.footer.privacy },
        { href: "/terms", label: t.footer.terms },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border)] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="brand text-lg font-semibold">
              Freelance<span className="gradient-text">Hub</span>
            </Link>
            <p className="hint mt-3 max-w-xs">{t.landing.audience}</p>
            <div className="mt-4">
              <LocaleSwitcher />
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-medium">{column.title}</h3>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="link-muted">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-sm"
             style={{ color: "var(--faint)" }}>
          <span>© 2026 FreelanceHub. {t.footer.rights}</span>
          <a href="mailto:ibrohimjonabbosov362@gmail.com" className="link-muted">
            {t.footer.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}
