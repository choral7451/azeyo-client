import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 수정",
  description: "닉네임과 한줄 소개를 수정하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
