import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/proposals",
    t.nav.proposals,
    locale === "en"
      ? "Create, send and track every stage of your proposals."
      : "Takliflaringizni yarating, yuboring va har bosqichini kuzating.",
    { index: false }
  );
}

export default function ProposalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
