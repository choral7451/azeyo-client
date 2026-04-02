import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "아재요 — 유부남들의 사랑방",
    short_name: "아재요",
    description:
      "기혼 남성들을 위한 커뮤니티. 메시지 족보, 일정 관리, 선물 추천까지.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0eb",
    theme_color: "#8B5E3C",
    icons: [
      {
        src: "/AZY.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
