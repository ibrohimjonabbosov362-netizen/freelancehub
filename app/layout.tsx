import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Analytics from "./Analytics";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import { getLocale } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://freelancehub-psi.vercel.app";

const SEO_TITLE = "FreelanceHub — Manage Your Freelance Business in One Place";
const SEO_DESCRIPTION =
  "Manage clients, proposals, projects, contracts and payments with FreelanceHub.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: SEO_TITLE,
    template: "%s | FreelanceHub",
  },
  description: SEO_DESCRIPTION,
  applicationName: "FreelanceHub",
  appleWebApp: {
    capable: true,
    title: "FreelanceHub",
    statusBarStyle: "black",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  keywords: [
    "freelance",
    "freelancer",
    "freelance CRM",
    "client management",
    "proposals",
    "contracts",
    "invoices",
    "payment tracking",
    "FreelanceHub",
  ],
  authors: [{ name: "FreelanceHub" }],
  creator: "FreelanceHub",
  publisher: "FreelanceHub",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "FreelanceHub",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  // proxy.ts har so'rovga yangi CSP nonce beradi
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} min-h-screen antialiased`}
      >
        {/* JS o'chirilgan bo'lsa, Framer Motion'ning boshlang'ich opacity:0 holati
            butunlay ko'rinmas bo'lib qolmasin (hero, scroll-reveal bloklari). */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;box-shadow:none!important}`}</style>
        </noscript>
        <Providers locale={locale}>{children}</Providers>
        <Analytics nonce={nonce} />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}