"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface TestItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  questionCount: number;
  duration: string;
  badge: string | null;
}

export default function TestListPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ tests: TestItem[] }>("/azeyo/contents/tests", { noAuth: true })
      .then((data) => setTests(data.tests))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="px-5 pb-10">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 pb-10">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-bold text-foreground mb-1">테스트</h1>
        <p className="text-sm text-muted-foreground">재미로 해보는 아재 자가진단</p>
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {tests.map((test, i) => (
          <Link
            key={test.id}
            href={`/test/${test.slug}`}
            className="block rounded-2xl overflow-hidden active:scale-[0.98] transition-transform animate-fade-up"
            style={{
              backgroundColor: "hsl(36 30% 93%)",
              animationDelay: `${0.05 + i * 0.05}s`,
            }}
          >
            {/* Image */}
            <div className="aspect-[2/1] bg-secondary flex items-center justify-center overflow-hidden relative">
              {test.imageUrl ? (
                <img
                  src={test.imageUrl}
                  alt={test.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">🧪</span>
              )}
              {test.badge && (
                <span
                  className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-primary-foreground"
                  style={{ backgroundColor: "hsl(22 60% 42%)" }}
                >
                  {test.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h2 className="text-[15px] font-bold text-foreground mb-1">{test.title}</h2>
              <p className="text-[13px] text-muted-foreground mb-3">{test.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{test.questionCount}문항</span>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                <span>{test.duration}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tests.length === 0 && !loading && (
        <div className="text-center py-16 animate-fade-up">
          <span className="text-4xl mb-3 block">🧪</span>
          <p className="text-sm text-muted-foreground">아직 등록된 테스트가 없어요</p>
        </div>
      )}
    </main>
  );
}
