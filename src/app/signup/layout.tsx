import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "아재요 회원가입. 닉네임과 결혼 정보만 입력하면 바로 시작할 수 있어요. 기혼 남성들의 커뮤니티에 합류하세요.",
  openGraph: {
    title: "회원가입 | 아재요",
    description: "닉네임만 정하면 끝. 유부남 커뮤니티 아재요에 합류하세요.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
