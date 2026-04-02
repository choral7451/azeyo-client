import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "아재요에 로그인하세요. 카카오, 네이버, Google 소셜 로그인으로 3초만에 시작할 수 있습니다.",
  openGraph: {
    title: "로그인 | 아재요",
    description: "카카오, 네이버, Google 로그인으로 아재요를 시작하세요.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
