import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Analytics from "./Analytics";
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
  themeColor: "#0a0714",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} min-h-screen antialiased`}
      >
        <Providers locale={locale}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}