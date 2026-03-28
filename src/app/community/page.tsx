"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useHeaderExtra } from "@/components/header-context";
import { posts, type Category, type Post } from "@/data/mock";

const categories: ("전체" | Category)[] = [
  "전체",
  "선물",
  "부부싸움",
  "어른들 취미",
  "육아",
  "생활꿀팁",
  "자유게시판",
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<"전체" | Category>("전체");
  const [votedPosts, setVotedPosts] = useState<Record<string, "A" | "B">>({});
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const { setStickyExtra } = useHeaderExtra();

  useEffect(() => {
    setStickyExtra(
      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onSelect={(cat: "전체" | Category) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        small
      />
    );
    return () => setStickyExtra(null);
  }, [activeCategory, setStickyExtra]);

  const filtered =
    activeCategory === "전체"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  function handleVote(postId: string, option: "A" | "B") {
    setVotedPosts((prev) => {
      if (prev[postId] === option) {
        const next = { ...prev };
        delete next[postId];
        return next;
      }
      return { ...prev, [postId]: option };
    });
  }

  return (
    <>
      <main className="pb-6">
      {/* Category Tabs */}
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <CategoryTabs categories={categories} active={activeCategory} onSelect={(cat) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </div>

      {/* Feed */}
      <div className="px-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            voted={votedPosts[post.id]}
            onVote={(option) => handleVote(post.id, option)}
            onComment={() => setCommentPost(post)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[40px] mb-2">📝</p>
            <p className="text-[14px] text-[var(--muted-foreground)]">
              아직 게시글이 없어요
            </p>
            <p className="text-[12px] text-[var(--muted-foreground)] mt-1">
              첫 번째 글을 작성해보세요!
            </p>
          </div>
        )}
      </div>
      </main>

      {/* Comment Bottom Sheet */}
      {commentPost && (
        <CommentSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}
    </>
  );
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
            flex-shrink-0 rounded-full font-medium transition-all duration-200
            ${small ? "text-[12px] px-3.5 py-1.5" : "text-[13px] px-4 py-2"}
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

function ImageCarousel({ images, ratio = "4:5" }: { images: string[]; ratio?: "4:5" | "1:1" }) {
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

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    directionLocked.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!directionLocked.current) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        directionLocked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
      return;
    }

    if (directionLocked.current === "v") return;

    e.preventDefault();
    touchDeltaX.current = dx;
    setOffsetX(dx);
  }, []);

  const handleTouchEnd = useCallback(() => {
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
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (images.length === 1) {
    return (
      <div className={`relative w-full ${ratio === "1:1" ? "aspect-square" : "aspect-[4/5]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${activeIdx * 100}% + ${offsetX}px))`,
          transition: offsetX !== 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {images.map((src, i) => (
          <div key={i} className={`flex-shrink-0 w-full relative ${ratio === "1:1" ? "aspect-square" : "aspect-[4/5]"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover select-none"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === activeIdx
                ? "bg-white w-3"
                : "bg-white/50 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const CONTENT_MAX_LENGTH = 80;

function PostCard({
  post,
  voted,
  onVote,
  onComment,
}: {
  post: Post;
  voted?: "A" | "B";
  onVote: (option: "A" | "B") => void;
  onComment: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const isLong = post.content.length > CONTENT_MAX_LENGTH;

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-transform duration-200">
      {/* Images */}
      {post.images && post.images.length > 0 && (
        <ImageCarousel images={post.images} ratio={post.imageRatio ?? "4:5"} />
      )}

      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[12px] font-bold text-[var(--primary)]">
            {post.author[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[var(--foreground)]">
                {post.author}
              </span>
              {post.authorBadge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]" style={{ backgroundColor: "var(--primary)", color: "white", opacity: 0.9 }}>
                  {post.authorBadge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {post.createdAt}
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-bold text-[var(--foreground)] leading-snug mb-1.5">
          {post.title}
        </h3>
        <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">
          {isLong && !expanded ? (
            <>
              {post.content.slice(0, CONTENT_MAX_LENGTH)}...
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="text-[var(--primary)] font-semibold ml-1"
              >
                더보기
              </button>
            </>
          ) : (
            post.content
          )}
        </p>

        {/* Vote */}
        {post.type === "VOTE" && post.voteOptionA && post.voteOptionB && (
          <VoteSection
            optionA={post.voteOptionA}
            optionB={post.voteOptionB}
            countA={post.voteCountA ?? 0}
            countB={post.voteCountB ?? 0}
            voted={voted}
            onVote={onVote}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
              liked ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {likeCount}
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted-foreground)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            {post.commentCount}
          </button>
        </div>
      </div>
    </article>
  );
}

function VoteSection({
  optionA,
  optionB,
  countA,
  countB,
  voted,
  onVote,
}: {
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
  voted?: "A" | "B";
  onVote: (option: "A" | "B") => void;
}) {
  const totalA = countA + (voted === "A" ? 1 : 0);
  const totalB = countB + (voted === "B" ? 1 : 0);
  const total = totalA + totalB;
  const pctA = total > 0 ? Math.round((totalA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const hasVoted = !!voted;

  return (
    <div className="mt-3 rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--secondary)]/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--border)]">
        <span className="text-[11px] font-bold text-[var(--primary)] tracking-wide">
          {hasVoted ? "투표 완료" : "눌러서 투표하기"}
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)]">
          {total.toLocaleString()}명 참여
        </span>
      </div>

      {/* Options */}
      <div className="p-2 space-y-1.5">
        {/* Option A */}
        <button
          onClick={() => onVote("A")}
          className={`
            relative w-full text-left rounded-lg overflow-hidden h-10 transition-all duration-200
            active:scale-[0.98] cursor-pointer
            ${voted === "A" ? "ring-1.5 ring-[var(--primary)]" : ""}
          `}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-lg ${
              voted === "A"
                ? "bg-[var(--primary)]/15"
                : hasVoted
                  ? "bg-[var(--muted)]/80"
                  : "bg-[var(--secondary)]"
            }`}
            style={{ width: hasVoted ? `${pctA}%` : "100%", transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div className="relative z-10 flex items-center justify-between h-full px-3.5">
            <span className={`text-[13px] ${voted === "A" ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"}`}>
              {optionA}
            </span>
            <span className={`text-[12px] font-bold tabular-nums ${voted === "A" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
              {pctA}%
            </span>
          </div>
        </button>

        {/* Option B */}
        <button
          onClick={() => onVote("B")}
          className={`
            relative w-full text-left rounded-lg overflow-hidden h-10 transition-all duration-200
            active:scale-[0.98] cursor-pointer
            ${voted === "B" ? "ring-1.5 ring-[var(--primary)]" : ""}
          `}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-lg ${
              voted === "B"
                ? "bg-[var(--primary)]/15"
                : hasVoted
                  ? "bg-[var(--muted)]/80"
                  : "bg-[var(--secondary)]"
            }`}
            style={{ width: hasVoted ? `${pctB}%` : "100%", transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div className="relative z-10 flex items-center justify-between h-full px-3.5">
            <span className={`text-[13px] ${voted === "B" ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"}`}>
              {optionB}
            </span>
            <span className={`text-[12px] font-bold tabular-nums ${voted === "B" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
              {pctB}%
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

function CommentSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const [newComment, setNewComment] = useState("");
  const comments = [...(post.comments ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-background rounded-t-3xl animate-fade-up shadow-2xl max-h-[80dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-foreground">
              댓글 {comments.length}
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--muted-foreground)] p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[28px] mb-2">💬</p>
              <p className="text-[13px] text-[var(--muted-foreground)]">
                아직 댓글이 없어요
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                첫 번째 댓글을 남겨보세요!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--primary)] flex-shrink-0 mt-0.5">
                  {comment.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-[var(--foreground)]">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {comment.createdAt.split(" ")[1] ?? comment.createdAt}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--foreground)] leading-relaxed mt-0.5">
                    {comment.content}
                  </p>
                  <button className="flex items-center gap-1 mt-1 text-[10px] text-[var(--muted-foreground)]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {comment.likeCount}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="flex-shrink-0 px-5 py-3 pb-8 border-t border-[var(--border)] bg-background">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 text-[13px] px-4 py-2.5 rounded-full bg-[var(--secondary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
            <button
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                newComment.trim()
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
