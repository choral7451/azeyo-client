"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { apiFetch } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";

const CATEGORY_REVERSE: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
  WORK: "직장생활", HEALTH: "건강/운동", IN_LAWS: "시댁/처가",
};

interface ApiPost {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  authorId: number;
  authorName: string;
  authorIconImageUrl: string | null;
  title: string;
  contents: string;
  imageUrls: string[] | null;
  voteOptionA: string | null;
  voteOptionB: string | null;
  voteCountA: number;
  voteCountB: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface ApiComment {
  id: number;
  contents: string;
  userNickname: string;
  createdAt: string;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { show: showToast } = useToast();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    apiFetch<ApiPost>(`/azeyo/communities/${postId}`)
      .then((data) => {
        setPost(data);
        setLiked(data.isLiked);
        setLikeCount(data.likeCount);
      })
      .catch(() => router.replace("/community"))
      .finally(() => setLoading(false));

    apiFetch<{ comments: ApiComment[] }>(`/azeyo/communities/${postId}/comments?page=1&size=50`, { noAuth: true })
      .then((data) => setComments(data.comments))
      .catch(() => {});
  }, [postId, router]);

  function handleLike() {
    if (!accessToken || !post) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    apiFetch(`/azeyo/communities/${post.id}/like`, {
      method: "POST",
      body: JSON.stringify({ isLike: newLiked }),
    }).catch(() => {
      setLiked(!newLiked);
      setLikeCount((prev) => prev + (newLiked ? -1 : 1));
    });
  }

  if (loading || !post) {
    return (
      <main className="px-5 pb-6">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  const hasVote = post.type === "VOTE" && post.voteOptionA && post.voteOptionB;
  const voteTotal = post.voteCountA + post.voteCountB;
  const pctA = voteTotal > 0 ? Math.round((post.voteCountA / voteTotal) * 100) : 50;
  const pctB = 100 - pctA;
  const aWins = post.voteCountA >= post.voteCountB;

  return (
    <main className="px-5 pb-6">
      {/* Back */}
      <button onClick={() => router.back()} aria-label="뒤로 가기" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Author */}
      <div className="flex items-center gap-2.5 mb-4 animate-fade-up">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[13px] font-bold text-primary">
          {post.authorName.charAt(0)}
        </div>
        <div className="flex-1">
          <span className="text-[14px] font-semibold text-foreground">{post.authorName}</span>
          <br />
          <span className="text-[11px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {CATEGORY_REVERSE[post.category] ?? post.category}
        </span>
      </div>

      {/* Content */}
      <h1 className="text-[18px] font-bold text-foreground leading-snug mb-3 animate-fade-up">{post.title}</h1>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5 whitespace-pre-line animate-fade-up">{post.contents}</p>

      {/* Vote */}
      {hasVote && (
        <div className="space-y-2 mb-5 animate-fade-up">
          {[{ label: post.voteOptionA!, pct: pctA, wins: aWins }, { label: post.voteOptionB!, pct: pctB, wins: !aWins }].map((opt, i) => (
            <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className={`text-[12px] font-medium ${opt.wins ? "text-primary font-bold" : "text-muted-foreground"}`}>{opt.label}</span>
                <span className={`text-[12px] font-bold ${opt.wins ? "text-primary" : "text-muted-foreground"}`}>{opt.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full mx-3 mb-2.5 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                <div className="h-full rounded-full bg-primary" style={{ width: `${opt.pct}%` }} />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-right">총 {voteTotal.toLocaleString()}명 참여</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 py-3 border-t border-b border-border mb-5 animate-fade-up">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {likeCount}
        </button>
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          {post.commentCount}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            if (!accessToken) { showToast("로그인이 필요한 기능이에요"); return; }
            setShowReport(true);
          }}
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground/60 active:scale-95 transition-transform"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          신고
        </button>
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div className="animate-fade-up">
          <h4 className="text-[14px] font-bold text-foreground mb-3">댓글</h4>
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">
                    {c.userNickname.charAt(0)}
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">{c.userNickname}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed pl-9">{c.contents}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReport && post && (
        <ReportSheet
          postId={post.id}
          onClose={() => setShowReport(false)}
          onSuccess={() => { setShowReport(false); showToast("신고가 접수되었습니다"); }}
          onDuplicate={() => { setShowReport(false); showToast("이미 신고한 게시글입니다"); }}
        />
      )}
    </main>
  );
}

const REPORT_REASONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "INAPPROPRIATE", label: "부적절한 콘텐츠" },
  { value: "HARASSMENT", label: "괴롭힘/혐오 표현" },
  { value: "FALSE_INFO", label: "허위 정보" },
  { value: "OTHER", label: "기타" },
] as const;

function ReportSheet({
  postId, onClose, onSuccess, onDuplicate,
}: {
  postId: number; onClose: () => void;
  onSuccess: () => void; onDuplicate: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [contents, setContents] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/azeyo/communities/${postId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason, contents: contents.trim() || null }),
      });
      onSuccess();
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("409")) { onDuplicate(); return; }
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[70dvh]" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <h3 className="text-[18px] font-bold text-foreground mb-1">게시글 신고</h3>
        <p className="text-[12px] text-muted-foreground mb-5">신고 사유를 선택해주세요</p>

        <div className="space-y-2 mb-5">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all active:scale-[0.98] ${
                reason === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              }`}
              style={reason !== r.value ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
            >
              {r.label}
            </button>
          ))}
        </div>

        {reason === "OTHER" && (
          <textarea
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            placeholder="신고 사유를 입력해주세요"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed mb-5"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "hsl(40 30% 93%)" }}>
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? "접수 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
