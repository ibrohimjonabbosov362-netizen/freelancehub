"use client";

import Script from "next/script";

// GA o'lchov ID'si berilmagan bo'lsa hech narsa yuklanmaydi
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;

  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
