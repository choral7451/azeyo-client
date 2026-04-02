import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "족보",
  description: "아내 생일 편지, 장모님 생신 카톡, 사과 문자, 기념일 메시지, 응원 한마디. 검증된 메시지 문구를 복사해서 바로 사용하세요. 유부남 필수 메시지 족보.",
  openGraph: {
    title: "족보 — 메시지 문구 모음 | 아재요",
    description: "아내 생일 편지, 장모님 카톡, 사과 문자. 검증된 문구를 복사해서 바로 사용하세요.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
