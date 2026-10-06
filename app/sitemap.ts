import type { MetadataRoute } from "next";

const origin = "https://prudentialiso.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-09-28");
  return [
    { url: `${origin}/verify`, lastModified: updated, changeFrequency: "monthly", priority: 1 },
  ];
}
