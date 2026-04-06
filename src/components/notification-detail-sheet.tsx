"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { apiFetch } from "@/lib/api";

const POST_CATEGORY: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
  WORK: "직장생활", HEALTH: "건강/운동", IN_LAWS: "시댁/처가",
};

const JOKBO_CATEGORY: Record<string, string> = {
  WIFE_BIRTHDAY: "아내 생일 편지", MOTHER_IN_LAW_BIRTHDAY: "장모님 생신 카톡",
  APOLOGY: "사과 문자", ANNIVERSARY: "기념일 메시지", ENCOURAGEMENT: "응원 한마디",
};

interface ApiPost {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  authorName: string;
  title: string;
  contents: string;
  voteOptionA: string | null;
  voteOptionB: string | null;
  voteCountA: number;
  voteCountB: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface ApiTemplate {
  id: number;
  category: string;
  authorName: string;
  title: string;
  content: string;
  likeCount: number;
  copyCount: number;
  isLiked: boolean;
}

interface ApiComment {
  id: number;
  contents: string;
  userNickname: string;
  createdAt: string;
}

interface Props {
  type: "LIKE" | "COMMENT" | "JOKBO_COPY";
  referenceId: string;
  onClose: () => void;
}

export function NotificationDetailSheet({ type, referenceId, onClose }: Props) {
  const { accessToken } = useAuth();
  const isPost = type === "LIKE" || type === "COMMENT";

  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [template, setTemplate] = useState<ApiTemplate | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isPost) {
      Promise.all([
        apiFetch<ApiPost>(`/azeyo/communities/${referenceId}`),
        apiFetch<{ comments: ApiComment[] }>(`/azeyo/communities/${referenceId}/comments?page=1&size=50`, { noAuth: true }),
      ])
        .then(([postData, commentData]) => {
          setPost(postData);
          setLiked(postData.isLiked);
          setLikeCount(postData.likeCount);
          setComments(commentData.comments);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      apiFetch<ApiTemplate>(`/azeyo/jokbos/${referenceId}`)
        .then((data) => {
          setTemplate(data);
          setLiked(data.isLiked);
          setLikeCount(data.likeCount);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [isPost, referenceId]);

  function handlePostLike() {
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

  function handleTemplateLike() {
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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-full max-w-[480px] rounded-t-3xl bg-background animate-fade-up flex flex-col"
        style={{ height: "80dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
          <button onClick={onClose} aria-label="뒤로" className="p-1 text-muted-foreground active:scale-90 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-[14px] font-bold text-foreground">
            {isPost ? "게시글" : "족보"}
          </span>
          <button onClick={onClose} aria-label="닫기" className="p-1 text-muted-foreground active:scale-90 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-muted-foreground">내용을 불러올 수 없어요</p>
            </div>
          ) : isPost && post ? (
            <PostContent
              post={post}
              comments={comments}
              liked={liked}
              likeCount={likeCount}
              onLike={handlePostLike}
            />
          ) : !isPost && template ? (
            <TemplateContent
              template={template}
              liked={liked}
              likeCount={likeCount}
              copied={copied}
              onLike={handleTemplateLike}
              onCopy={handleCopy}
            />
          ) : null}
        </div>

        <div className="h-6 flex-shrink-0" />
      </div>
    </div>
  );
}

function PostContent({
  post, comments, liked, likeCount, onLike,
}: {
  post: ApiPost;
  comments: ApiComment[];
  liked: boolean;
  likeCount: number;
  onLike: () => void;
}) {
  const hasVote = post.type === "VOTE" && post.voteOptionA && post.voteOptionB;
  const voteTotal = post.voteCountA + post.voteCountB;
  const pctA = voteTotal > 0 ? Math.round((post.voteCountA / voteTotal) * 100) : 50;
  const pctB = 100 - pctA;
  const aWins = post.voteCountA >= post.voteCountB;

  return (
    <>
      {/* Author */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
          {post.authorName.charAt(0)}
        </div>
        <div className="flex-1">
          <span className="text-[13px] font-semibold text-foreground">{post.authorName}</span>
          <br />
          <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {POST_CATEGORY[post.category] ?? post.category}
        </span>
      </div>

      {/* Content */}
      <h2 className="text-[16px] font-bold text-foreground leading-snug mb-2">{post.title}</h2>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">{post.contents}</p>

      {/* Vote */}
      {hasVote && (
        <div className="space-y-2 mb-4">
          {[{ label: post.voteOptionA!, pct: pctA, wins: aWins }, { label: post.voteOptionB!, pct: pctB, wins: !aWins }].map((opt, i) => (
            <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
              <div className="flex items-center justify-between px-3 py-2">
                <span className={`text-[11px] font-medium ${opt.wins ? "text-primary font-bold" : "text-muted-foreground"}`}>{opt.label}</span>
                <span className={`text-[11px] font-bold ${opt.wins ? "text-primary" : "text-muted-foreground"}`}>{opt.pct}%</span>
              </div>
              <div className="h-1 rounded-full mx-3 mb-2 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                <div className="h-full rounded-full bg-primary" style={{ width: `${opt.pct}%` }} />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-right">{voteTotal.toLocaleString()}명 참여</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 py-2.5 border-t border-b border-border mb-4">
        <button onClick={onLike} className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {likeCount}
        </button>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          {post.commentCount}
        </span>
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div>
          <h4 className="text-[13px] font-bold text-foreground mb-2.5">댓글</h4>
          <div className="space-y-2.5">
            {comments.map((c) => (
              <div key={c.id}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary">
                    {c.userNickname.charAt(0)}
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{c.userNickname}</span>
                  <span className="text-[9px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed pl-[30px]">{c.contents}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function TemplateContent({
  template, liked, likeCount, copied, onLike, onCopy,
}: {
  template: ApiTemplate;
  liked: boolean;
  likeCount: number;
  copied: boolean;
  onLike: () => void;
  onCopy: () => void;
}) {
  return (
    <>
      {/* Template Card */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <div className="px-4 pt-4 pb-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {JOKBO_CATEGORY[template.category] ?? template.category}
          </span>
        </div>
        <div className="px-4 pt-3 pb-4">
          <div className="text-[13px] leading-[1.8] text-foreground whitespace-pre-line">
            {template.content}
          </div>
        </div>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderTop: "1px solid hsl(35 20% 90%)" }}>
          <span className="text-[12px] font-semibold text-foreground">{template.title}</span>
          <span className="text-[10px] text-muted-foreground">{template.authorName}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] ${
            liked ? "text-primary" : "text-muted-foreground"
          }`}
          style={{ backgroundColor: liked ? "hsl(22 60% 42% / 0.08)" : "hsl(36 30% 93%)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {likeCount.toLocaleString()}
        </button>
        <button
          onClick={onCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all active:scale-[0.97]"
          style={{ backgroundColor: copied ? "hsl(150 20% 55%)" : "hsl(22 60% 42%)" }}
        >
          {copied ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> 복사 완료</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> 복사하기</>
          )}
        </button>
      </div>
    </>
  );
}
