import type { Metadata } from "next";
import MarriageSatisfactionTestClient from "./MarriageSatisfactionTestClient";

const PAGE_URL = "https://azeyo.co.kr/test/marriage-satisfaction";
const PAGE_TITLE = "결혼 생활 만족도 테스트";
const PAGE_DESCRIPTION =
  "우리 결혼 생활, 정말 괜찮을까? 20개 문항, 5점 척도로 확인하는 결혼 생활 만족도 자가진단. 신뢰·소통·친밀감·역할 분담까지 점수화하고, 단계별 맞춤 조언을 받아보세요.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "결혼 생활 만족도", "부부 만족도 테스트", "결혼 만족도 진단",
    "부부 관계 진단", "부부 심리 테스트", "결혼 위기 자가진단",
    "부부 상담 테스트", "아재요 테스트",
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
  numberOfQuestions: 20,
  about: { "@type": "Thing", name: "부부 관계·결혼 생활 만족도 자가진단" },
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

export default function MarriageSatisfactionTestPage() {
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
      <MarriageSatisfactionTestClient />
    </>
  );
}
