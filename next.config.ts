import type { NextConfig } from "next";

// Next.js ishlab chiqish rejimida HMR uchun eval kerak bo'ladi; production
// build'da esa u hech qayerda ishlatilmaydi. `unsafe-eval` qolib ketsa, CSP
// XSS'ga qarshi deyarli hech qanday to'siq qo'ymaydi.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // Next.js o'zining bootstrap skriptlarini inline joylashtiradi, shuning uchun
  // 'unsafe-inline' kerak (nonce'ga o'tish alohida ish).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  // Sahifani begona sayt ichida ramkaga solib bo'lmaydi (X-Frame-Options ham bor)
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

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
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;