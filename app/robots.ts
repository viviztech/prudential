import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/login", "/forgot-password"] }, sitemap: "https://prudentialiso.com/sitemap.xml" };
}
