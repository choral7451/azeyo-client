"use client";

import { useState, useEffect } from "react";
import { useHeaderExtra } from "@/components/header-context";
import { templates, type TemplateCategory } from "@/data/mock";

const categories: TemplateCategory[] = [
  "아내 생일 편지",
  "장모님 생신 카톡",
  "사과 문자",
  "기념일 메시지",
  "응원 한마디",
];

function CategoryTabs<T extends string>({
  categories: cats,
  active,
  onSelect,
  small,
}: {
  categories: T[];
  active: T;
  onSelect: (cat: T) => void;
  small?: boolean;
}) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide ${small ? "mt-2" : "px-5 mb-5"}`}>
      {cats.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`
            flex-shrink-0 rounded-full font-medium transition-all duration-200 whitespace-nowrap
            ${small ? "text-[11px] px-3 py-1.5" : "text-[12px] px-3.5 py-2"}
            ${
              active === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground active:scale-95"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default function JokboPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(categories[0]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { setStickyExtra } = useHeaderExtra();

  useEffect(() => {
    setStickyExtra(
      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onSelect={(cat: TemplateCategory) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        small
      />
    );
    return () => setStickyExtra(null);
  }, [activeCategory, setStickyExtra]);

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
    <main className="pb-6">
      {/* Category Tabs */}
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <CategoryTabs categories={categories} active={activeCategory} onSelect={(cat) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </div>

      {/* Template List */}
      <div className="px-5 space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {filtered.map((template) => {
          const isLiked = likedIds.has(template.id);
          const isCopied = copiedId === template.id;
          const isExpanded = expandedIds.has(template.id);
          const displayLikes = template.likeCount + (isLiked ? 1 : 0);

          return (
            <article
              key={template.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "hsl(40 30% 96%)" }}
            >
              {/* Content — the hero */}
              <div className="px-5 pt-5">
                <div
                  className={`text-[13px] leading-[1.8] text-foreground whitespace-pre-line overflow-hidden transition-[max-height] duration-300 ease-out ${
                    isExpanded ? "max-h-[2000px]" : "max-h-[100px]"
                  } ${!isExpanded ? "relative" : ""}`}
                >
                  {template.content}
                  {!isExpanded && (
                    <div
                      className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                      style={{ background: "linear-gradient(to top, hsl(40 30% 96%), transparent)" }}
                    />
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (isExpanded) next.delete(template.id);
                      else next.add(template.id);
                      return next;
                    })
                  }
                  className="flex items-center gap-0.5 mt-1 mb-3 text-[11px] font-medium text-muted-foreground active:opacity-60 transition-opacity"
                >
                  {isExpanded ? "접기" : "전체 보기"}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Footer: meta + actions */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid hsl(35 20% 90%)" }}
              >
                {/* Meta — left */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[12px] font-semibold text-foreground truncate">
                    {template.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {template.author}
                  </span>
                </div>

                {/* Actions — right */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(template.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 active:scale-95 ${
                      isLiked
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    style={isLiked ? { backgroundColor: "hsl(22 60% 42% / 0.08)" } : undefined}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {displayLikes.toLocaleString()}
                  </button>

                  {/* Copy */}
                  <button
                    onClick={() => handleCopy(template)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95 ${
                      isCopied
                        ? "text-white"
                        : "text-white"
                    }`}
                    style={{
                      backgroundColor: isCopied
                        ? "hsl(150 20% 55%)"
                        : "hsl(22 60% 42%)",
                    }}
                  >
                    {isCopied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        완료
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
