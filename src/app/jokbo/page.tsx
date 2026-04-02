"use client";

import { useState, useEffect, useCallback } from "react";
import { useHeaderExtra } from "@/components/header-context";
import { useAuth } from "@/components/auth-context";
import { apiFetch } from "@/lib/api";

const CATEGORY_MAP = {
  "아내 생일 편지": "WIFE_BIRTHDAY",
  "장모님 생신 카톡": "MOTHER_IN_LAW_BIRTHDAY",
  "사과 문자": "APOLOGY",
  "기념일 메시지": "ANNIVERSARY",
  "응원 한마디": "ENCOURAGEMENT",
} as const;

type TemplateCategory = keyof typeof CATEGORY_MAP;

const categories: TemplateCategory[] = [
  "아내 생일 편지",
  "장모님 생신 카톡",
  "사과 문자",
  "기념일 메시지",
  "응원 한마디",
];

interface ApiTemplate {
  id: number;
  category: string;
  authorId: number;
  authorName: string;
  title: string;
  content: string;
  likeCount: number;
  copyCount: number;
  isLiked: boolean;
  createdAt: string;
}

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
  const { accessToken } = useAuth();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(categories[0]);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const { setStickyExtra } = useHeaderExtra();

  const fetchTemplates = useCallback(async (category: TemplateCategory) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", size: "50", category: CATEGORY_MAP[category] });
      const data = await apiFetch<{ templates: ApiTemplate[]; totalCount: number }>(
        `/azeyo/jokbos?${params}`,
      );
      setTemplates(data.templates);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(activeCategory);
  }, [activeCategory, fetchTemplates]);

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

  function handleCopy(template: ApiTemplate) {
    navigator.clipboard.writeText(template.content).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
      apiFetch(`/azeyo/jokbos/${template.id}/copy`, { method: "POST" }).catch(() => {});
    });
  }

  function handleLike(template: ApiTemplate) {
    if (!accessToken) return;
    const wasLiked = template.isLiked;
    setTemplates(prev => prev.map(t =>
      t.id === template.id
        ? { ...t, isLiked: !wasLiked, likeCount: t.likeCount + (wasLiked ? -1 : 1) }
        : t
    ));
    apiFetch(`/azeyo/jokbos/${template.id}/like`, {
      method: "POST",
      body: JSON.stringify({ isLike: !wasLiked }),
    }).catch(() => {
      setTemplates(prev => prev.map(t =>
        t.id === template.id
          ? { ...t, isLiked: wasLiked, likeCount: t.likeCount + (wasLiked ? 1 : -1) }
          : t
      ));
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
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[40px] mb-2">📋</p>
            <p className="text-[13px] text-muted-foreground">아직 등록된 족보가 없어요</p>
          </div>
        ) : (
          templates.map((template) => {
            const isCopied = copiedId === template.id;
            const isExpanded = expandedIds.has(template.id);

            return (
              <article
                key={template.id}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              >
                {/* Content */}
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
                        style={{ background: "linear-gradient(to top, hsl(36 30% 93%), transparent)" }}
                      />
                    )}
                  </div>

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
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: "1px solid hsl(35 20% 90%)" }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12px] font-semibold text-foreground truncate">
                      {template.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {template.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleLike(template)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 active:scale-95 ${
                        template.isLiked ? "text-primary" : "text-muted-foreground"
                      }`}
                      style={template.isLiked ? { backgroundColor: "hsl(22 60% 42% / 0.08)" } : undefined}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={template.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      {template.likeCount.toLocaleString()}
                    </button>

                    <button
                      onClick={() => handleCopy(template)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all duration-150 active:scale-95"
                      style={{
                        backgroundColor: isCopied ? "hsl(150 20% 55%)" : "hsl(22 60% 42%)",
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
          })
        )}
      </div>
    </main>
  );
}
