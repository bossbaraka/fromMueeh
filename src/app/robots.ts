import type { MetadataRoute } from "next";

/** robots — النموذج ولوحة الفريق غير مفتوحين للفهرسة */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mureeh.example";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/apply", "/team", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
