import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/reset-password",
    t.auth.resetTitle,
    locale === "en"
      ? "Set a new password for your account."
      : "Hisobingiz uchun yangi parol o'rnating.",
    { index: false }
  );
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
