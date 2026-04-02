import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "설정",
  description: "이용약관, 개인정보처리방침, 문의, 로그아웃, 회원탈퇴 등 앱 설정을 관리하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
