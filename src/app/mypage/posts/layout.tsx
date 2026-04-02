import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 게시글",
  description: "내가 작성한 커뮤니티 게시글 목록. 수정하거나 삭제할 수 있어요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
