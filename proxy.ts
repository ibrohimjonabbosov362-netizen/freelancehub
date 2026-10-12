import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";

// Login talab qiladigan bo'limlar
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clients",
  "/proposals",
  "/projects",
  "/billing",
  "/contracts",
  "/payments",
  "/settings",
];

const isDev = process.env.NODE_ENV !== "production";

// Har bir so'rov uchun yangi nonce: 'unsafe-inline' o'rniga faqat shu nonce'li
// skriptlar ishlaydi. Next.js nonce'ni so'rovdagi CSP header'idan o'qib, o'zining
// bootstrap skriptlariga avtomatik qo'yadi. 'strict-dynamic' nonce'li skript
// yuklagan skriptlarga (masalan gtag.js) ham ishonadi.
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    // Development'da React xato stack'larini tiklash uchun eval ishlatadi;
    // production'da kerak emas.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
    // Framer Motion style="" atributlarini ishlatadi — ular nonce olmaydi.
    // Inline style'lar skript bajara olmaydi, shuning uchun bu XSS xavfi emas.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

function withCsp(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

const authProxy = withAuth((req) => withCsp(req), {
  pages: { signIn: "/login" },
});

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isProtected(request.nextUrl.pathname)) {
    return authProxy(request as NextRequestWithAuth, event);
  }
  return withCsp(request);
}

export const config = {
  matcher: [
    // API, statik fayllar va kengaytmali fayllar (sw.js, manifest, ikonkalar,
    // security.txt) uchun CSP nonce kerak emas.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
