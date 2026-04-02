import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "족보 상세",
  description: "아재요 메시지 족보 상세",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
