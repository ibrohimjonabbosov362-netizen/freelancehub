import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/forgot-password",
    t.auth.forgotTitle,
    locale === "en"
      ? "Request a password reset link for your account."
      : "Hisobingiz uchun parolni tiklash havolasini so'rang.",
    { index: false }
  );
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
