import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "게시글",
  description: "아재요 커뮤니티 게시글 상세",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
