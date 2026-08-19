import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Yuqori papkalardagi begona package-lock.json tufayli loyiha ildizi
  // noto'g'ri aniqlanmasligi uchun aniq ko'rsatamiz.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
