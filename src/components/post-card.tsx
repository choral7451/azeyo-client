"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CATEGORY_REVERSE: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
  WORK: "직장생활", HEALTH: "건강/운동", IN_LAWS: "시댁/처가",
};

export interface PostCardPost {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  authorId: number;
  authorName: string;
  authorIconImageUrl?: string | null;
  title: string;
  contents: string;
  imageUrls?: string[] | null;
  imageRatio?: string | null;
  voteOptionA?: string | null;
  voteOptionB?: string | null;
  voteCountA: number;
  voteCountB: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  userVote?: "A" | "B" | null;
  createdAt: string;
}

export function formatPostDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ImageCarousel({ images, ratio = "4:5" }: { images: string[]; ratio?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const isDragging = useRef(false);
  const directionLocked = useRef<"h" | "v" | null>(null);
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  const handleStart = useCallback((x: number, y: number) => {
    touchStartX.current = x;
    touchStartY.current = y;
    isDragging.current = true;
    directionLocked.current = null;
  }, []);

  const handleMove = useCallback((x: number, y: number, preventDefault?: () => void) => {
    if (!isDragging.current) return;
    const dx = x - touchStartX.current;
    const dy = y - touchStartY.current;
    if (!directionLocked.current) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        directionLocked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
      return;
    }
    if (directionLocked.current === "v") return;
    preventDefault?.();
    touchDeltaX.current = dx;
    setOffsetX(dx);
  }, []);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
    directionLocked.current = null;
    const threshold = 50;
    if (touchDeltaX.current < -threshold && activeIdxRef.current < images.length - 1) {
      setActiveIdx((i) => i + 1);
    } else if (touchDeltaX.current > threshold && activeIdxRef.current > 0) {
      setActiveIdx((i) => i - 1);
    }
    touchDeltaX.current = 0;
    setOffsetX(0);
  }, [images.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Touch events
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
    const onTouchEnd = () => handleEnd();

    // Mouse events
    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); handleStart(e.clientX, e.clientY); };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY, () => e.preventDefault());
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => { if (isDragging.current) handleEnd(); };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [handleStart, handleMove, handleEnd]);

  const aspectClass = ratio === "1:1" ? "aspect-square" : "aspect-[4/5]";

  if (images.length === 1) {
    return (
      <div className={`relative w-full ${aspectClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="게시글 이미지" className="absolute inset-0 w-full h-full object-cover" loading="lazy" draggable={false} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${activeIdx * 100}% + ${offsetX}px))`,
          transition: offsetX !== 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {images.map((src, i) => (
          <div key={i} className={`flex-shrink-0 w-full relative ${aspectClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`게시글 이미지 ${i + 1}`} className="absolute inset-0 w-full h-full object-cover select-none" loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-200 ${i === activeIdx ? "bg-white w-3" : "bg-white/50 w-1.5"}`} />
        ))}
      </div>
    </div>
  );
}

export function VoteSection({
  optionA, optionB, countA, countB, voted, onVote,
}: {
  optionA: string; optionB: string; countA: number; countB: number;
  voted: "A" | "B" | null; onVote?: (option: "A" | "B") => void;
}) {
  const total = countA + countB;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const hasVoted = !!voted;

  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden bg-secondary/50">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
        <span className="text-[11px] font-bold text-primary tracking-wide">
          {hasVoted ? "투표 완료" : "눌러서 투표하기"}
        </span>
        <span className="text-[10px] text-muted-foreground">{total.toLocaleString()}명 참여</span>
      </div>
      <div className="p-2 space-y-1.5">
        {(["A", "B"] as const).map((opt) => {
          const label = opt === "A" ? optionA : optionB;
          const pct = opt === "A" ? pctA : pctB;
          const isSelected = voted === opt;
          return (
            <button
              key={opt}
              onClick={() => onVote?.(opt)}
              className={`relative w-full text-left rounded-lg overflow-hidden h-10 transition-all duration-200 active:scale-[0.98] cursor-pointer ${isSelected ? "ring-[1.5px] ring-primary" : ""}`}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-lg ${isSelected ? "" : hasVoted ? "bg-muted/80" : "bg-secondary"}`}
                style={{
                  width: hasVoted ? `${pct}%` : "100%",
                  transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  ...(isSelected ? { backgroundColor: "hsl(22 60% 42% / 0.15)" } : {}),
                }}
              />
              <div className="relative z-10 flex items-center justify-between h-full px-3.5">
                <span className={`text-[13px] ${isSelected ? "font-bold text-primary" : "font-medium text-foreground"}`}>{label}</span>
                <span className={`text-[12px] font-bold tabular-nums ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PostCard({
  post, onVote, onLike, onComment, onReport, onAuthorClick, extraActions,
}: {
  post: PostCardPost;
  onVote?: (option: "A" | "B") => void;
  onLike?: (isLike: boolean) => void;
  onComment?: () => void;
  onReport?: () => void;
  onAuthorClick?: () => void;
  extraActions?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (el && !expanded) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [expanded, post.contents]);
  const displayCategory = CATEGORY_REVERSE[post.category] || post.category;

  return (
    <article className="rounded-2xl overflow-hidden transition-transform duration-200" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
      {post.imageUrls && post.imageUrls.length > 0 && (
        <ImageCarousel images={post.imageUrls} ratio={post.imageRatio ?? "4:5"} />
      )}

      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2.5">
          <button onClick={onAuthorClick} className="flex items-center gap-2 flex-1 min-w-0 active:opacity-70 transition-opacity">
            {post.authorIconImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.authorIconImageUrl} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
                {post.authorName?.[0] || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[13px] font-semibold text-foreground">{post.authorName}</span>
              <div>
                <span className="text-[10px] text-muted-foreground">{formatPostDate(post.createdAt)}</span>
              </div>
            </div>
          </button>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            {displayCategory}
          </span>
          {extraActions}
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5">{post.title}</h3>
        <p
          ref={contentRef}
          className={`text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line ${!expanded ? "line-clamp-3" : ""}`}
        >
          {post.contents}
        </p>
        {isClamped && !expanded && (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }} className="text-[13px] text-primary font-semibold mt-0.5">더보기</button>
        )}

        {/* Vote */}
        {post.type === "VOTE" && post.voteOptionA && post.voteOptionB && (
          <VoteSection
            optionA={post.voteOptionA}
            optionB={post.voteOptionB}
            countA={post.voteCountA}
            countB={post.voteCountB}
            voted={post.userVote ?? null}
            onVote={onVote}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border -mx-1">
          <button
            onClick={() => onLike?.(!post.isLiked)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium transition-colors active:scale-95 ${post.isLiked ? "text-primary" : "text-muted-foreground"}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {post.likeCount}
          </button>
          <button onClick={onComment} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium text-muted-foreground active:scale-95 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            {post.commentCount}
          </button>
          <div className="flex-1" />
          {onReport && (
            <button onClick={onReport} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-medium text-muted-foreground active:scale-95 transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              신고
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
