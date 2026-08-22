import type { Metadata } from "next";

/**
 * app/layout.tsx allaqachon metadataBase o'rnatgan, shuning uchun bu yerdagi
 * nisbiy yo'llar (path) canonical/OG uchun avtomatik to'liq URL'ga aylanadi.
 * Buni ishlatmasa, har bir sahifa layout.tsx'dan meros qolgan "/" canonical'ni
 * ko'rsatib qolardi — qidiruv tizimlari barcha sahifani bosh sahifaning
 * nusxasi deb hisoblab, alohida indekslamay qo'yishi mumkin.
 */
export function pageMetadata(
  path: string,
  title: string,
  description: string,
  options: { index?: boolean } = {}
): Metadata {
  const { index = true } = options;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}
