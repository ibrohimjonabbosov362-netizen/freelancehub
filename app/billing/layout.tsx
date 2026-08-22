import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/billing",
    t.nav.billing,
    locale === "en"
      ? "Manage your current plan and subscription."
      : "Joriy tarifingiz va obunangizni boshqaring.",
    { index: false }
  );
}

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
