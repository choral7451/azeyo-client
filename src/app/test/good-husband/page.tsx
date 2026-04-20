import type { Metadata } from "next";
import GoodHusbandTestClient from "./GoodHusbandTestClient";

const PAGE_URL = "https://azeyo.co.kr/test/good-husband";
const PAGE_TITLE = "좋은 남편 진단 테스트";
const PAGE_DESCRIPTION =
  "나는 과연 좋은 남편일까? 15개 문항, 5점 척도로 진단하는 남편 자가진단 테스트. 공감·소통·표현·애정 항목별로 점수를 매기고 S부터 F까지 등급과 맞춤 조언을 확인해보세요.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "좋은 남편 테스트", "남편 자가진단", "남편 점수", "부부 심리 테스트",
    "남편 등급 테스트", "유부남 테스트", "부부 관계 진단", "아재요 테스트",
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
  about: { "@type": "Thing", name: "부부 관계·남편 역할 자가진단" },
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

export default function GoodHusbandTestPage() {
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
      <GoodHusbandTestClient />
    </>
  );
}
