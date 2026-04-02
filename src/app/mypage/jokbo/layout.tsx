import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내가 올린 족보",
  description: "내가 등록한 메시지 족보 목록. 좋아요와 복사 수를 확인하고 수정·삭제할 수 있어요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
