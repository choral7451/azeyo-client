import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "아재요 — 유부남들의 사랑방",
  description: "기혼 남성들을 위한 커뮤니티. 일정 관리, 선물 추천, 족보까지.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh pb-20">
        <div className="mx-auto max-w-[480px] min-h-dvh relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
