import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Analytics from "./Analytics";

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

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FreelanceHub",
    template: "%s | FreelanceHub",
  },
  description:
    "FreelanceHub — freelancers and clients connecting in one platform.",
  keywords: [
    "freelance",
    "freelancer",
    "freelance jobs",
    "FreelanceHub",
    "remote work",
    "online jobs",
  ],
  authors: [{ name: "FreelanceHub" }],
  creator: "FreelanceHub",
  publisher: "FreelanceHub",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: appUrl,
    siteName: "FreelanceHub",
    title: "FreelanceHub — mijozlaringizni bitta joyda boshqaring",
    description:
      "Mijozlar, takliflar, loyihalar, shartnomalar va to'lovlar — bitta panelda.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceHub",
    description:
      "Frilanserlar uchun mijoz, taklif, loyiha va to'lovlarni boshqarish platformasi.",
  },
};

export const viewport = {
  themeColor: "#0a0714",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}