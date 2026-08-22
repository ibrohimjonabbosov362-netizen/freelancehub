import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/projects",
    t.nav.projects,
    locale === "en"
      ? "Track your projects with status, deadlines and payments."
      : "Loyihalaringizni holati, muddati va to'lovlari bilan birga kuzating.",
    { index: false }
  );
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
