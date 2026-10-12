"use client";

import Script from "next/script";

// GA o'lchov ID'si berilmagan bo'lsa hech narsa yuklanmaydi.
// nonce — CSP 'unsafe-inline'siz ishlashi uchun (proxy.ts'da yaratiladi).
export default function Analytics({ nonce }: { nonce?: string }) {
  const id = process.env.NEXT_PUBLIC_GA_ID;

  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
