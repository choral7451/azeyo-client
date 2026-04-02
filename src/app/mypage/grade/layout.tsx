import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "등급 안내",
  description: "아재요 등급 시스템 안내. 새내기 남편부터 아재 마스터까지 5단계 등급과 활동점수 획득 방법을 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
