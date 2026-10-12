// Digital Asset Links: Play Market'dagi Android ilova (TWA) shu saytga
// egalik qilishini tasdiqlaydi. Busiz ilova tepasida brauzer manzil paneli
// ko'rinib qoladi. /.well-known/assetlinks.json shu yerga rewrite qilinadi.
//
// ANDROID_PACKAGE_NAME          — masalan "app.vercel.freelancehub_psi.twa"
// ANDROID_SHA256_FINGERPRINTS   — vergul bilan ajratilgan imzo barmoq izlari
//   (PWABuilder kalitidan VA Play Console > App integrity > App signing'dan)
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);

  const body =
    packageName && fingerprints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return Response.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
