import type { MetadataRoute } from "next";
import { PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

const origin = "https://prudentialiso.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-09-28");
  return [
    { url: origin, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/certifications`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    ...PUBLIC_CERTIFICATIONS.map((item) => ({ url: `${origin}/certifications/${item.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${origin}/verify`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/enquire`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
  ];
}
