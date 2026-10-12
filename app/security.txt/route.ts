import { SUPPORT_EMAIL } from "@/lib/site";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://freelancehub-psi.vercel.app";

// RFC 9116 — xavfsizlik tadqiqotchilari zaiflik haqida qayerga yozishini bilsin.
// /.well-known/security.txt shu yerga rewrite qilinadi (next.config.ts).
export function GET() {
  // Expires majburiy maydon; har so'rovda bir yil oldinga suriladi
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const lines = [
    ...(SUPPORT_EMAIL ? [`Contact: mailto:${SUPPORT_EMAIL}`] : []),
    `Contact: ${appUrl}/help`,
    `Expires: ${expires}`,
    "Preferred-Languages: uz, en, ru",
    `Canonical: ${appUrl}/.well-known/security.txt`,
    `Policy: ${appUrl}/terms`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
