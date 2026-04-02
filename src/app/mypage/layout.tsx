import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 프로필, 등급, 활동 통계를 확인하고 관리하세요. 내 게시글, 내가 올린 족보, 알림 설정까지.",
  openGraph: {
    title: "마이페이지 | 아재요",
    description: "내 프로필과 활동 내역을 한눈에.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
