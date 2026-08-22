import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/login",
    t.nav.login,
    locale === "en"
      ? "Sign in to manage your clients, projects and payments in one place."
      : "Hisobingizga kiring va mijozlar, loyihalar hamda to'lovlaringizni bir joydan boshqaring."
  );
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
