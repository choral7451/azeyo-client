"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { apiFetch } from "@/lib/api";

const CATEGORY_REVERSE: Record<string, string> = {
  WIFE_BIRTHDAY: "아내 생일 편지",
  MOTHER_IN_LAW_BIRTHDAY: "장모님 생신 카톡",
  APOLOGY: "사과 문자",
  ANNIVERSARY: "기념일 메시지",
  ENCOURAGEMENT: "응원 한마디",
};

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

export default function JokboDetailPage() {
  const { templateId } = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [template, setTemplate] = useState<ApiTemplate | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiTemplate>(`/azeyo/jokbos/${templateId}`)
      .then((data) => {
        setTemplate(data);
        setLiked(data.isLiked);
        setLikeCount(data.likeCount);
      })
      .catch(() => router.replace("/jokbo"))
      .finally(() => setLoading(false));
  }, [templateId, router]);

  function handleLike() {
    if (!accessToken || !template) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    apiFetch(`/azeyo/jokbos/${template.id}/like`, {
      method: "POST",
      body: JSON.stringify({ isLike: newLiked }),
    }).catch(() => {
      setLiked(!newLiked);
      setLikeCount((prev) => prev + (newLiked ? -1 : 1));
    });
  }

  function handleCopy() {
    if (!template) return;
    navigator.clipboard.writeText(template.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      apiFetch(`/azeyo/jokbos/${template.id}/copy`, { method: "POST" }).catch(() => {});
    });
  }

  if (loading || !template) {
    return (
      <main className="px-5 pb-6">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 pb-6">
      {/* Back */}
      <button onClick={() => router.back()} aria-label="뒤로 가기" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Template Card */}
      <div className="rounded-2xl overflow-hidden animate-fade-up" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        {/* Category */}
        <div className="px-5 pt-5 pb-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {CATEGORY_REVERSE[template.category] ?? template.category}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-5">
          <div className="text-[14px] leading-[1.8] text-foreground whitespace-pre-line">
            {template.content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(35 20% 90%)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-foreground">{template.title}</span>
            <span className="text-[11px] text-muted-foreground">{template.authorName}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] ${
            liked ? "text-primary" : "text-muted-foreground"
          }`}
          style={{ backgroundColor: liked ? "hsl(22 60% 42% / 0.08)" : "hsl(36 30% 93%)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {likeCount.toLocaleString()}
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
          style={{ backgroundColor: copied ? "hsl(150 20% 55%)" : "hsl(22 60% 42%)" }}
        >
          {copied ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> 복사 완료</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> 복사하기</>
          )}
        </button>
      </div>
    </main>
  );
}
