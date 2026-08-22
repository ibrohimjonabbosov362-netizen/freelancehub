import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/settings",
    t.nav.settings,
    locale === "en"
      ? "Manage your account and business settings."
      : "Hisob va biznes sozlamalaringizni boshqaring.",
    { index: false }
  );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
