import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/clients",
    t.nav.clients,
    locale === "en"
      ? "Manage all your clients, contacts and project history in one place."
      : "Barcha mijozlaringizni, kontaktlaringizni va loyihalar tarixini bitta joyda boshqaring.",
    { index: false }
  );
}

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
