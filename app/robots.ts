import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/verify", disallow: ["/admin/", "/api/", "/login", "/forgot-password", "/certifications", "/enquire"] }, sitemap: "https://prudentialiso.com/sitemap.xml" };
}
