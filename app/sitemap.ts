import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://freelancehub-psi.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    "",
    "/pricing",
    "/about",
    "/help",
    "/docs",
    "/login",
    "/register",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
