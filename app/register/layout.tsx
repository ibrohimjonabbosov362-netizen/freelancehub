import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/register",
    t.auth.registerTitle,
    locale === "en"
      ? "Create a free account in minutes and get your freelance business organized."
      : "Bir necha daqiqada bepul hisob yarating va frilanser biznesingizni tartibga soling."
  );
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
