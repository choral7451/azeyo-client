import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 수정",
  description: "닉네임, 이메일, 연락처를 수정하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
