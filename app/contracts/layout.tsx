import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/contracts",
    t.nav.contracts,
    locale === "en"
      ? "Keep your contracts connected to every project."
      : "Shartnomalaringizni har bir loyihaga bog'langan holda saqlang.",
    { index: false }
  );
}

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
