import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Marketing/yordam sahifalari uchun umumiy o'ram — sarlavha, matn, footer */
export default function ContentLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              {intro}
            </p>
          )}

          <div className="legal mt-10">{children}</div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
