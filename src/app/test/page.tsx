import type { Metadata } from "next";
import TestListClient from "./TestListClient";

const PAGE_URL = "https://azeyo.co.kr/test";
const PAGE_TITLE = "아재 자가진단 테스트 모음";
const PAGE_DESCRIPTION =
  "좋은 남편 진단, 좋은 아빠 진단 등 유부남을 위한 심리 테스트 모음. 재미로 해보는 아재 자가진단, 솔직하게 체크하고 결과를 친구들과 공유하세요.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "아재 테스트", "유부남 테스트", "좋은 남편 테스트", "좋은 아빠 테스트",
    "남편 자가진단", "아빠 자가진단", "부부 심리 테스트", "육아 테스트", "아재요 테스트",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: "ko-KR",
  isPartOf: { "@type": "WebSite", name: "아재요", url: "https://azeyo.co.kr" },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: "https://azeyo.co.kr/test/good-husband",
        name: "좋은 남편 진단 테스트",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: "https://azeyo.co.kr/test/good-dad",
        name: "좋은 아빠 진단 테스트",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: "https://azeyo.co.kr/test/marriage-satisfaction",
        name: "결혼 생활 만족도 테스트",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://azeyo.co.kr" },
    { "@type": "ListItem", position: 2, name: "테스트", item: PAGE_URL },
  ],
};

export default function TestListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TestListClient />
    </>
  );
}
