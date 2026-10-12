import type { NextConfig } from "next";

// Content-Security-Policy har bir so'rov uchun nonce bilan proxy.ts'da
// qo'yiladi ('unsafe-inline' skriptlarsiz). Bu yerda faqat statik header'lar.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Boshqa saytga o'tilganda bizning kontekstimiz unga ochilib qolmasin
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Service worker har doim yangisi olinsin, aks holda eski versiya
        // brauzerda qotib qoladi
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // RFC 9116: security.txt standart manzili
      { source: "/.well-known/security.txt", destination: "/security.txt" },
      // Play Market ilovasi (TWA) uchun domen tasdig'i
      { source: "/.well-known/assetlinks.json", destination: "/assetlinks.json" },
    ];
  },
};

export default nextConfig;