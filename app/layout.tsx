import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}