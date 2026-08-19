import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://freelancehub-psi.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Shaxsiy bo'limlar qidiruvga tushmasin
      disallow: ["/api/", "/dashboard", "/clients", "/proposals", "/projects", "/payments", "/settings", "/billing"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
