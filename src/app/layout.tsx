import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { HeaderExtraProvider } from "@/components/header-context";

export const metadata: Metadata = {
  title: "아재요 — 유부남들의 사랑방",
  description: "기혼 남성들을 위한 커뮤니티. 일정 관리, 선물 추천, 족보까지.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh pb-20">
        <HeaderExtraProvider>
          <div className="mx-auto max-w-[480px] min-h-dvh relative">
            <PageHeader />
            {children}
          </div>
          <BottomNav />
        </HeaderExtraProvider>
      </body>
    </html>
  );
}
