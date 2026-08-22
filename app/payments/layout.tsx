import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/payments",
    t.nav.payments,
    locale === "en"
      ? "Track invoices, payment status and due dates."
      : "Hisoblar, to'lov holati va muddatlarni nazorat qiling.",
    { index: false }
  );
}

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
