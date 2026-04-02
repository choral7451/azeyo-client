"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/toast";
import { BottomSheet } from "@/components/bottom-sheet";

const CATEGORY_REVERSE: Record<string, string> = {
  WIFE_BIRTHDAY: "아내 생일 편지",
  MOTHER_IN_LAW_BIRTHDAY: "장모님 생신 카톡",
  APOLOGY: "사과 문자",
  ANNIVERSARY: "기념일 메시지",
  ENCOURAGEMENT: "응원 한마디",
};

const CATEGORY_MAP = {
  "아내 생일 편지": "WIFE_BIRTHDAY",
  "장모님 생신 카톡": "MOTHER_IN_LAW_BIRTHDAY",
  "사과 문자": "APOLOGY",
  "기념일 메시지": "ANNIVERSARY",
  "응원 한마디": "ENCOURAGEMENT",
} as const;

type TemplateCategory = keyof typeof CATEGORY_MAP;
const categories: TemplateCategory[] = ["아내 생일 편지", "장모님 생신 카톡", "사과 문자", "기념일 메시지", "응원 한마디"];

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

export default function MyJokboPage() {
  const { show: showToast } = useToast();
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [menuTemplate, setMenuTemplate] = useState<ApiTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<ApiTemplate | null>(null);

  function fetchTemplates() {
    apiFetch<{ templates: ApiTemplate[]; totalCount: number }>("/azeyo/jokbos/my")
      .then((data) => setTemplates(data.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchTemplates(); }, []);

  function handleCopy(template: ApiTemplate) {
    navigator.clipboard.writeText(template.content).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(template: ApiTemplate) {
    setMenuTemplate(null);
    try {
      await apiFetch(`/azeyo/jokbos/${template.id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      showToast("족보가 삭제되었어요");
    } catch {
      showToast("삭제에 실패했어요");
    }
  }

  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link href="/mypage" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">내가 올린 족보</h1>
        <span className="text-[13px] text-muted-foreground">{templates.length}개</span>
      </div>

      {/* Template List */}
      <div className="px-5 space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
          </div>
        ) : (
          <>
            {templates.map((template) => {
              const isCopied = copiedId === template.id;
              const isExpanded = expandedIds.has(template.id);

              return (
                <article key={template.id} className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                  {/* Menu Button */}
                  <button
                    onClick={() => setMenuTemplate(template)}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all z-10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>

                  {/* Category Badge */}
                  <div className="px-5 pt-4 pb-0 pr-12">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {CATEGORY_REVERSE[template.category] ?? template.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="px-5 pt-3">
                    <div
                      className={`text-[13px] leading-[1.8] text-foreground whitespace-pre-line overflow-hidden transition-[max-height] duration-300 ease-out ${
                        isExpanded ? "max-h-[2000px]" : "max-h-[100px]"
                      } ${!isExpanded ? "relative" : ""}`}
                    >
                      {template.content}
                      {!isExpanded && (
                        <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none" style={{ background: "linear-gradient(to top, hsl(36 30% 93%), transparent)" }} />
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(template.id)}
                      className="flex items-center gap-0.5 mt-1 mb-3 text-[11px] font-medium text-muted-foreground active:opacity-60 transition-opacity"
                    >
                      {isExpanded ? "접기" : "전체 보기"}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(35 20% 90%)" }}>
                    <div className="flex items-center gap-2 min-w-0 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground text-[12px] truncate">{template.title}</span>
                      <span className="flex items-center gap-0.5 flex-shrink-0"><HeartIcon /> {template.likeCount.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5 flex-shrink-0"><CopyIcon /> {template.copyCount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(template)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all duration-150 active:scale-95 flex-shrink-0"
                      style={{ backgroundColor: isCopied ? "hsl(150 20% 55%)" : "hsl(22 60% 42%)" }}
                    >
                      {isCopied ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> 완료</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> 복사</>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {templates.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[40px] mb-2">📋</p>
                <p className="text-[14px] text-muted-foreground">아직 올린 족보가 없어요</p>
                <p className="text-[12px] text-muted-foreground mt-1">족보 탭에서 첫 번째 문구를 등록해보세요!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Menu */}
      {menuTemplate && (
        <BottomSheet onClose={() => setMenuTemplate(null)}>
          <div className="px-5 pb-8 space-y-1">
            <button
              onClick={() => { setEditTemplate(menuTemplate); setMenuTemplate(null); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
            >
              <span className="text-base">✏️</span>
              <span className="text-[14px] font-medium text-foreground">수정하기</span>
            </button>
            <button
              onClick={() => handleDelete(menuTemplate)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
            >
              <span className="text-base">🗑️</span>
              <span className="text-[14px] font-medium text-red-500">삭제하기</span>
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Edit Sheet */}
      {editTemplate && (
        <EditJokboSheet
          template={editTemplate}
          onClose={() => setEditTemplate(null)}
          onSubmit={() => { setEditTemplate(null); fetchTemplates(); showToast("족보가 수정되었어요"); }}
        />
      )}
    </main>
  );
}

function EditJokboSheet({ template, onClose, onSubmit }: { template: ApiTemplate; onClose: () => void; onSubmit: () => void }) {
  const displayCategory = CATEGORY_REVERSE[template.category] ?? template.category;
  const [category, setCategory] = useState<TemplateCategory>(displayCategory as TemplateCategory);
  const [title, setTitle] = useState(template.title);
  const [content, setContent] = useState(template.content);
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/azeyo/jokbos/${template.id}`, {
        method: "PUT",
        body: JSON.stringify({
          category: CATEGORY_MAP[category],
          title: title.trim(),
          content: content.trim(),
        }),
      });
      onSubmit();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[90dvh] flex flex-col" hideHeader>
      <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-[14px] text-muted-foreground font-medium">취소</button>
          <h3 className="text-[16px] font-bold text-foreground">족보 수정</h3>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`text-[14px] font-semibold transition-colors ${isValid && !submitting ? "text-primary" : "text-muted-foreground/40"}`}
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground block mb-2">카테고리</span>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[12px] px-3.5 py-2 rounded-full font-medium transition-all ${
                  category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground active:scale-95"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">제목</span>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        </div>
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">내용</span>
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)} rows={10}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition resize-none leading-[1.8]"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        </div>
      </div>
    </BottomSheet>
  );
}

function HeartIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
}

function CopyIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
}
