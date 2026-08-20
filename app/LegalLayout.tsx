import Link from "next/link";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="brand text-xl font-semibold">
          Freelance<span className="gradient-text">Hub</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="link-muted">Tariflar</Link>
          <Link href="/login" className="link-muted">Kirish</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-8">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="hint mt-2">Oxirgi yangilanish: {updated}</p>

          <div className="legal mt-8">{children}</div>
        </article>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 text-sm">
          <span style={{ color: "var(--faint)" }}>© 2026 FreelanceHub</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="link-muted">Maxfiylik</Link>
            <Link href="/terms" className="link-muted">Shartlar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
