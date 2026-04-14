import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/admin/", "/api/"],
    },
    sitemap: "https://azeyo.co.kr/sitemap.xml",
  };
}
