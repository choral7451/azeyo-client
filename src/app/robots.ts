import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/api/"],
    },
    sitemap: "https://azeyo.kr/sitemap.xml",
  };
}
