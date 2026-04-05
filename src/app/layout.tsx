import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "sans-serif"],
});

const SITE_NAME = "아재요";
const SITE_URL = "https://azeyo.co.kr";
const SITE_DESCRIPTION = "편지 족보, 기념일 관리, 선물 추천까지. 유부남들을 위한 커뮤니티 아재요";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "아재요 — 유부남들의 사랑방",
    template: "%s | 아재요",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "유부남 커뮤니티", "기혼 남성", "결혼 생활", "아내 생일 편지",
    "장모님 생신 카톡", "기념일 메시지", "사과 문자", "선물 추천",
    "족보", "결혼기념일", "유부남 꿀팁", "남편 커뮤니티", "아재요",
  ],
  authors: [{ name: "아재요" }],
  creator: "아재요",
  publisher: "아재요",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "아재요 — 유부남들의 사랑방",
    description: SITE_DESCRIPTION,
    images: [{ url: "/AZY1200630.png", width: 1200, height: 630, alt: "아재요 — 유부남들의 사랑방" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "아재요 — 유부남들의 사랑방",
    description: SITE_DESCRIPTION,
    images: ["/AZY1200630.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8B5E3C",
};

// JSON-LD 구조화 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "아재요",
  alternateName: "Azeyo",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

// FAQ 구조화 데이터 (AEO)
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "아재요는 어떤 서비스인가요?",
      acceptedAnswer: { "@type": "Answer", text: "아재요는 기혼 남성(유부남)들을 위한 모바일 커뮤니티 앱입니다. 아내·장모님에게 보낼 메시지 족보, 기념일 일정 관리, 선물 추천, 유부남 커뮤니티 기능을 제공합니다." },
    },
    {
      "@type": "Question",
      name: "아내 생일 편지는 어떻게 쓰나요?",
      acceptedAnswer: { "@type": "Answer", text: "아재요의 '족보' 탭에서 '아내 생일 편지' 카테고리를 선택하면 다른 남편들이 올린 검증된 편지 문구를 볼 수 있습니다. 마음에 드는 문구를 복사해서 바로 사용하거나, 참고해서 직접 작성할 수 있어요." },
    },
    {
      "@type": "Question",
      name: "장모님 생신 선물 뭐가 좋을까요?",
      acceptedAnswer: { "@type": "Answer", text: "아재요에서 일정을 등록하면 태그에 맞는 선물 추천을 받을 수 있습니다. 장모님 생신 인기 선물로는 건강식품 세트, 안마기, 백화점 상품권, 외식 초대, 여행 상품권 등이 있습니다." },
    },
    {
      "@type": "Question",
      name: "결혼기념일을 까먹지 않으려면?",
      acceptedAnswer: { "@type": "Answer", text: "아재요의 일정 관리 기능에 결혼기념일을 등록하세요. D-day 알림으로 미리 알려드리고, 선물 추천까지 해드립니다." },
    },
    {
      "@type": "Question",
      name: "아재요는 무료인가요?",
      acceptedAnswer: { "@type": "Answer", text: "네, 아재요의 모든 기능은 무료입니다. 카카오, 네이버, Google 소셜 로그인으로 3초만에 가입하고 바로 사용할 수 있습니다." },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-7W3VLZ0NPY" strategy="lazyOnload" />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7W3VLZ0NPY');`}
        </Script>
      </body>
    </html>
  );
}
