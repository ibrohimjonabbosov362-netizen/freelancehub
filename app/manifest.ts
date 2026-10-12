import type { MetadataRoute } from "next";

// Telefonda "Bosh ekranga qo'shish" orqali alohida ilova sifatida o'rnatiladi
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FreelanceHub",
    short_name: "FreelanceHub",
    description:
      "Manage clients, proposals, projects, contracts and payments with FreelanceHub.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08090b",
    theme_color: "#08090b",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/dashboard" },
      { name: "Clients", url: "/clients" },
      { name: "Projects", url: "/projects" },
    ],
  };
}
