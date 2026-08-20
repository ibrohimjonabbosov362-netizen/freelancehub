"use client";

import Link from "next/link";
import LocaleSwitcher from "../LocaleSwitcher";
import { useI18n } from "@/lib/i18n/client";

const CONTACT_EMAIL = "ibrohimjonabbosov362@gmail.com";

/**
 * Ijtimoiy tarmoqlar manzili muhit o'zgaruvchisidan olinadi. Berilmagan
 * havola umuman chizilmaydi — mavjud bo'lmagan sahifaga tugma qo'ymaymiz.
 */
const socials = [
  {
    name: "Instagram",
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    path: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10.5 3.5h.01",
  },
  {
    name: "LinkedIn",
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
    path: "M4.5 9H8v11H4.5V9Zm1.75-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10.5 9H14v1.6a3.6 3.6 0 0 1 3.2-1.7c2.4 0 3.8 1.6 3.8 4.4V20h-3.5v-6.1c0-1.5-.6-2.4-1.9-2.4-1.1 0-1.8.8-1.8 2.3V20h-3.3V9Z",
  },
  {
    name: "X",
    href: process.env.NEXT_PUBLIC_SOCIAL_X,
    path: "M4 4l16 16M20 4 4 20",
  },
].filter((social): social is { name: string; href: string; path: string } =>
  Boolean(social.href)
);

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
        { href: "/help", label: t.footer.help },
        { href: "/#faq", label: t.footer.faq },
        { href: "/docs", label: t.footer.docs },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: "/about", label: t.footer.about },
        { href: `mailto:${CONTACT_EMAIL}`, label: t.footer.contact },
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
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="brand text-lg font-semibold">
              Freelance<span className="gradient-text">Hub</span>
            </Link>
            <p className="hint mt-3 max-w-xs">{t.landing.audience}</p>

            {socials.length > 0 && (
              <ul className="mt-4 flex items-center gap-2">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.name}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}

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
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className="link-muted">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="link-muted">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-sm"
          style={{ color: "var(--faint)" }}
        >
          <span>© 2026 FreelanceHub. {t.footer.rights}</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-muted">
            {t.footer.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}
