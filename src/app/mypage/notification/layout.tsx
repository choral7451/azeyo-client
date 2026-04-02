import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림 설정",
  description: "일정, 댓글, 좋아요, 족보 복사 등 알림 수신 설정을 관리하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
