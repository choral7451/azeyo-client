import type { Metadata } from "next";
import GoodDadTestClient from "./GoodDadTestClient";

const PAGE_URL = "https://azeyo.co.kr/test/good-dad";
const PAGE_TITLE = "좋은 아빠 진단 테스트";
const PAGE_DESCRIPTION =
  "나는 과연 좋은 아빠일까? 15개 O/X 문항으로 확인하는 아빠 자가진단 테스트. 스킨십·목욕·이유식·응급처치 등 육아 참여도를 체크하고 결과와 개선 조언을 받아보세요.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "좋은 아빠 테스트", "아빠 자가진단", "육아 테스트", "아빠 점수",
    "슈퍼대디 테스트", "아빠 진단", "육아 참여도", "아재요 테스트",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    siteName: "아재요",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "ko_KR",
    images: [{ url: "/AZY1200630.png", width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/AZY1200630.png"],
  },
};

const quizJsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: "ko-KR",
  educationalLevel: "Adult",
  numberOfQuestions: 15,
  about: { "@type": "Thing", name: "육아·아빠 역할 자가진단" },
  provider: { "@type": "Organization", name: "아재요", url: "https://azeyo.co.kr" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://azeyo.co.kr" },
    { "@type": "ListItem", position: 2, name: "테스트", item: "https://azeyo.co.kr/test" },
    { "@type": "ListItem", position: 3, name: PAGE_TITLE, item: PAGE_URL },
  ],
};

export default function GoodDadTestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GoodDadTestClient />
    </>
  );
}
