import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "유부남들의 진솔한 이야기. 선물 추천, 부부싸움 해결법, 육아 꿀팁, 생활 노하우까지. 기혼 남성 전용 커뮤니티에서 공감하고 소통하세요.",
  openGraph: {
    title: "커뮤니티 | 아재요",
    description: "유부남들의 진솔한 이야기. 선물 추천, 부부싸움 해결법, 육아 꿀팁까지.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
