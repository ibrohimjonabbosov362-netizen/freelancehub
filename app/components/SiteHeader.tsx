"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LocaleSwitcher from "../LocaleSwitcher";
import CtaLink from "./motion/CtaLink";
import { useI18n } from "@/lib/i18n/client";

export default function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 20px'dan ko'proq scroll qilinganda fon shaffofdan qorong'i sirtga o'tadi
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#features", label: t.nav.features },
    { href: "/#how", label: t.nav.howItWorks },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/#faq", label: t.footer.faq },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] backdrop-blur-md transition-[background-color,box-shadow] duration-[250ms] ease-out"
      style={{
        // --surface orqali animatsiyalanadi, shunda rang shu tokendan chetga chiqmaydi.
        backgroundColor: scrolled
          ? "color-mix(in srgb, var(--surface) 90%, transparent)"
          : "transparent",
        boxShadow: scrolled
          ? "0 4px 24px -8px rgba(0,0,0,0.35)"
          : "0 0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="brand text-lg font-semibold tracking-tight">
          Freelance<span className="gradient-text">Hub</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="link-muted">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block">
            <LocaleSwitcher compact />
          </div>
          <Link href="/login" className="hidden text-sm link-muted sm:block">
            {t.nav.login}
          </Link>
          <CtaLink href="/register" className="btn btn-accent btn-sm">
            {t.landing.ctaPrimary}
          </CtaLink>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            className="btn btn-ghost btn-sm px-2 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="link-muted">
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="link-muted">
              {t.nav.login}
            </Link>
            <div className="pt-1"><LocaleSwitcher /></div>
          </nav>
        </div>
      )}
    </header>
  );
}
