import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "일정 관리",
  description: "아내 생일, 결혼기념일, 장모님 생신 등 중요한 기념일을 등록하고 미리 알림을 받으세요. 일정에 맞는 선물 추천까지 한번에.",
  openGraph: {
    title: "일정 관리 | 아재요",
    description: "중요한 기념일 등록 + 선물 추천. 기념일 까먹지 마세요!",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
