"use client";

import { useState } from "react";
import { ScrollHeader } from "@/components/scroll-header";
import { templates, type TemplateCategory } from "@/data/mock";

const categories: TemplateCategory[] = [
  "아내 생일 편지",
  "장모님 생신 카톡",
  "사과 문자",
  "기념일 메시지",
  "응원 한마디",
];

export default function JokboPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(categories[0]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = templates
    .filter((t) => t.category === activeCategory)
    .sort((a, b) => b.likeCount - a.likeCount);

  function handleCopy(template: (typeof templates)[0]) {
    navigator.clipboard.writeText(template.content).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <ScrollHeader>
        <h1 className="text-[17px] font-black tracking-tight text-foreground leading-none mb-2.5">
          족보
        </h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap
                ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground active:scale-95"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </ScrollHeader>
      <main className="pt-4 pb-6">
        {/* Header */}
        <header className="px-5 mb-5 animate-fade-up">
          <h1 className="text-[22px] font-black tracking-tight text-[var(--warm-900)]">
            족보
          </h1>
          <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
            검증된 문구를 바로 복사하세요
          </p>
        </header>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-shrink-0 text-[12px] px-3.5 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap
              ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground active:scale-95"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Cards */}
      <div className="px-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {filtered.map((template) => {
          const isLiked = likedIds.has(template.id);
          const isCopied = copiedId === template.id;
          const displayLikes = template.likeCount + (isLiked ? 1 : 0);
          const displayCopies = template.copyCount + (isCopied ? 1 : 0);

          return (
            <div
              key={template.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--foreground)]">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    by {template.author}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {displayLikes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {displayCopies.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="px-4 pb-3">
                <div className="bg-[var(--secondary)] rounded-xl p-4 text-[12px] text-[var(--foreground)] leading-relaxed whitespace-pre-line max-h-[160px] overflow-hidden relative">
                  {template.content}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--secondary)] to-transparent" />
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => handleLike(template.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.97]
                    ${
                      isLiked
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                    }
                  `}
                  style={isLiked ? { backgroundColor: "var(--primary)", color: "white", opacity: 0.9 } : undefined}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  좋아요
                </button>
                <button
                  onClick={() => handleCopy(template)}
                  className={`
                    flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.97]
                    ${
                      isCopied
                        ? "bg-[var(--sage)] text-white"
                        : "bg-[var(--primary)] text-white"
                    }
                  `}
                >
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      복사하기
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </main>
    </>
  );
}
