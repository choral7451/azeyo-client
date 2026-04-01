"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useHeaderExtra } from "@/components/header-context";
import { posts as initialPosts, type Category, type Post, type PostType } from "@/data/mock";
import { BottomSheet } from "@/components/bottom-sheet";

const categories: ("전체" | Category)[] = [
  "전체",
  "선물",
  "부부싸움",
  "어른들 취미",
  "육아",
  "생활꿀팁",
  "자유게시판",
];

const writeCategories: Category[] = ["선물", "부부싸움", "어른들 취미", "육아", "생활꿀팁", "자유게시판"];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<"전체" | Category>("전체");
  const [votedPosts, setVotedPosts] = useState<Record<string, "A" | "B">>({});
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [postList, setPostList] = useState<Post[]>(initialPosts);
  const { setStickyExtra } = useHeaderExtra();

  useEffect(() => {
    const handler = () => setShowWrite(true);
    window.addEventListener("header:create", handler);
    return () => window.removeEventListener("header:create", handler);
  }, []);

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
      ? postList
      : postList.filter((p) => p.category === activeCategory);

  function handleNewPost(post: Post) {
    setPostList((prev) => [post, ...prev]);
    setShowWrite(false);
    if (activeCategory !== "전체" && activeCategory !== post.category) {
      setActiveCategory("전체");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
            <p className="text-[14px] text-muted-foreground">
              아직 게시글이 없어요
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
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

      {/* Write Bottom Sheet */}
      {showWrite && (
        <WriteSheet
          onClose={() => setShowWrite(false)}
          onSubmit={handleNewPost}
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
    <article
      className="rounded-2xl overflow-hidden transition-transform duration-200"
      style={{ backgroundColor: "hsl(36 30% 93%)" }}
    >
      {/* Images */}
      {post.images && post.images.length > 0 && (
        <ImageCarousel images={post.images} ratio={post.imageRatio ?? "4:5"} />
      )}

      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
            {post.author[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-foreground">
                {post.author}
              </span>
              {post.authorBadge && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-primary"
                  style={{ backgroundColor: "hsl(22 60% 42% / 0.1)" }}
                >
                  {post.authorBadge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {post.createdAt}
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5">
          {post.title}
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {isLong && !expanded ? (
            <>
              {post.content.slice(0, CONTENT_MAX_LENGTH)}...
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="text-primary font-semibold ml-1"
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
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
              liked ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {likeCount}
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground"
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
    <div className="mt-3 rounded-xl border border-border overflow-hidden bg-secondary/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
        <span className="text-[11px] font-bold text-primary tracking-wide">
          {hasVoted ? "투표 완료" : "눌러서 투표하기"}
        </span>
        <span className="text-[10px] text-muted-foreground">
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
            ${voted === "A" ? "ring-[1.5px] ring-primary" : ""}
          `}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-lg ${
              voted === "A"
                ? ""
                : hasVoted
                  ? "bg-muted/80"
                  : "bg-secondary"
            }`}
            style={{
              width: hasVoted ? `${pctA}%` : "100%",
              transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              ...(voted === "A" ? { backgroundColor: "hsl(22 60% 42% / 0.15)" } : {}),
            }}
          />
          <div className="relative z-10 flex items-center justify-between h-full px-3.5">
            <span className={`text-[13px] ${voted === "A" ? "font-bold text-primary" : "font-medium text-foreground"}`}>
              {optionA}
            </span>
            <span className={`text-[12px] font-bold tabular-nums ${voted === "A" ? "text-primary" : "text-muted-foreground"}`}>
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
            ${voted === "B" ? "ring-[1.5px] ring-primary" : ""}
          `}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-lg ${
              voted === "B"
                ? ""
                : hasVoted
                  ? "bg-muted/80"
                  : "bg-secondary"
            }`}
            style={{
              width: hasVoted ? `${pctB}%` : "100%",
              transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              ...(voted === "B" ? { backgroundColor: "hsl(22 60% 42% / 0.15)" } : {}),
            }}
          />
          <div className="relative z-10 flex items-center justify-between h-full px-3.5">
            <span className={`text-[13px] ${voted === "B" ? "font-bold text-primary" : "font-medium text-foreground"}`}>
              {optionB}
            </span>
            <span className={`text-[12px] font-bold tabular-nums ${voted === "B" ? "text-primary" : "text-muted-foreground"}`}>
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
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; author: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [localComments, setLocalComments] = useState(() =>
    [...(post.comments ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = localComments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0
  );

  function handleReply(commentId: string, author: string) {
    setReplyTarget({ commentId, author });
    setNewComment(`@${author} `);
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyTarget(null);
    setNewComment("");
  }

  function toggleReplies(commentId: string) {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  function handleSubmit() {
    if (!newComment.trim()) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newC = {
      id: `c-${Date.now()}`,
      author: "김아재",
      content: newComment.trim(),
      createdAt: dateStr,
      likeCount: 0,
    };

    if (replyTarget) {
      setLocalComments((prev) =>
        prev.map((c) =>
          c.id === replyTarget.commentId
            ? { ...c, replies: [...(c.replies ?? []), newC] }
            : c
        )
      );
      setExpandedReplies((prev) => new Set(prev).add(replyTarget.commentId));
    } else {
      setLocalComments((prev) => [newC, ...prev]);
    }
    setNewComment("");
    setReplyTarget(null);
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[80dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-foreground">
              댓글 {totalCount}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground p-1"
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
          {localComments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[28px] mb-2">💬</p>
              <p className="text-[13px] text-muted-foreground">
                아직 댓글이 없어요
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                첫 번째 댓글을 남겨보세요!
              </p>
            </div>
          ) : (
            localComments.map((comment) => {
              const replies = comment.replies ?? [];
              const isExpanded = expandedReplies.has(comment.id);

              return (
                <div key={comment.id}>
                  {/* Parent Comment */}
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                      {comment.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {comment.createdAt.split(" ")[1] ?? comment.createdAt}
                        </span>
                      </div>
                      <p className="text-[13px] text-foreground leading-relaxed mt-0.5">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <button className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                          {comment.likeCount}
                        </button>
                        <button
                          onClick={() => handleReply(comment.id, comment.author)}
                          className="text-[10px] font-medium text-muted-foreground"
                        >
                          답글 달기
                        </button>
                      </div>

                      {/* Replies Toggle */}
                      {replies.length > 0 && !isExpanded && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary"
                        >
                          <span className="w-5 border-t border-primary/30" />
                          답글 {replies.length}개 더 보기
                        </button>
                      )}

                      {/* Expanded Replies */}
                      {isExpanded && replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0 mt-0.5">
                                {reply.author[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-semibold text-foreground">
                                    {reply.author}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {reply.createdAt.split(" ")[1] ?? reply.createdAt}
                                  </span>
                                </div>
                                <p className="text-[12px] text-foreground leading-relaxed mt-0.5">
                                  {reply.content.split(/(@\S+)/).map((part, i) =>
                                    part.startsWith("@") ? (
                                      <span key={i} className="text-primary font-semibold">{part}</span>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <button className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                    {reply.likeCount}
                                  </button>
                                  <button
                                    onClick={() => handleReply(comment.id, reply.author)}
                                    className="text-[10px] font-medium text-muted-foreground"
                                  >
                                    답글 달기
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Collapse button */}
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"
                          >
                            <span className="w-5 border-t border-muted-foreground/30" />
                            답글 숨기기
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input */}
        <div className="flex-shrink-0 px-5 py-3 pb-8 border-t border-border bg-background">
          {replyTarget && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary">{replyTarget.author}</span>님에게 답글 작성 중
              </span>
              <button onClick={cancelReply} className="text-[11px] text-muted-foreground font-medium">
                취소
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder={replyTarget ? "답글을 입력하세요..." : "댓글을 입력하세요..."}
              className="flex-1 text-[13px] px-4 py-2.5 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSubmit}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                newComment.trim()
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
    </BottomSheet>
  );
}

function WriteSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (post: Post) => void }) {
  const [postType, setPostType] = useState<PostType>("TEXT");
  const [category, setCategory] = useState<Category>("자유게시판");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [voteOptionA, setVoteOptionA] = useState("");
  const [voteOptionB, setVoteOptionB] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageRatio, setImageRatio] = useState<"4:5" | "1:1">("4:5");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = postType === "TEXT"
    ? title.trim().length > 0 && content.trim().length > 0
    : title.trim().length > 0 && voteOptionA.trim().length > 0 && voteOptionB.trim().length > 0;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 5 - images.length).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function handleSubmit() {
    if (!isValid) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newPost: Post = {
      id: `user-${Date.now()}`,
      type: postType,
      category,
      author: "김아재",
      title: title.trim(),
      content: content.trim(),
      createdAt: dateStr,
      likeCount: 0,
      commentCount: 0,
      comments: [],
      ...(images.length > 0 ? { images, imageRatio } : {}),
      ...(postType === "VOTE" ? {
        voteOptionA: voteOptionA.trim(),
        voteOptionB: voteOptionB.trim(),
        voteCountA: 0,
        voteCountB: 0,
      } : {}),
    };
    onSubmit(newPost);
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-[14px] text-muted-foreground font-medium">
              취소
            </button>
            <h3 className="text-[16px] font-bold text-foreground">글쓰기</h3>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`text-[14px] font-semibold transition-colors ${
                isValid ? "text-primary" : "text-muted-foreground/40"
              }`}
            >
              등록
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Post Type Toggle */}
          <div className="flex gap-2">
            {(["TEXT", "VOTE"] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] ${
                  postType === type
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {type === "TEXT" ? "일반 글" : "투표"}
              </button>
            ))}
          </div>

          {/* Category */}
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {writeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground active:scale-95"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-2">
              {postType === "VOTE" ? "투표 질문" : "제목"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === "VOTE" ? "형님들에게 물어볼 질문" : "제목을 입력하세요"}
              className="w-full rounded-xl bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {postType === "TEXT" ? (
            <>
              {/* Content */}
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground block mb-2">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={5}
                  className="w-full rounded-xl bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed"
                />
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-semibold text-muted-foreground">
                    사진 ({images.length}/5)
                  </label>
                  <div className="flex items-center gap-2">
                    {images.length > 0 && (
                      <div className="flex bg-secondary rounded-lg overflow-hidden">
                        {(["4:5", "1:1"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setImageRatio(ratio)}
                            className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              imageRatio === ratio
                                ? "bg-primary text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground text-[11px] font-semibold active:scale-95 transition-transform"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      추가
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="rounded-xl overflow-hidden">
                    <ImageCarousel images={images} ratio={imageRatio} />
                    <div className="flex gap-1.5 mt-2">
                      {images.map((src, i) => (
                        <div key={i} className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center text-[8px] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <>
              {/* Vote Options */}
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground block mb-2">선택지</label>
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                    style={{ backgroundColor: "hsl(22 60% 42% / 0.06)" }}
                  >
                    <span className="text-[13px] font-bold text-primary">A</span>
                    <input
                      type="text"
                      value={voteOptionA}
                      onChange={(e) => setVoteOptionA(e.target.value)}
                      placeholder="첫 번째 선택지"
                      className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[11px] font-bold text-muted-foreground/40">VS</span>
                  </div>
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                    style={{ backgroundColor: "hsl(22 60% 42% / 0.06)" }}
                  >
                    <span className="text-[13px] font-bold text-primary">B</span>
                    <input
                      type="text"
                      value={voteOptionB}
                      onChange={(e) => setVoteOptionB(e.target.value)}
                      placeholder="두 번째 선택지"
                      className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Optional description */}
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground block mb-2">
                  부연 설명 <span className="font-normal text-muted-foreground/50">(선택)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="투표 배경이나 고민을 적어주세요"
                  rows={3}
                  className="w-full rounded-xl bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed"
                />
              </div>
            </>
          )}
        </div>

        {/* Bottom safe area */}
        <div className="h-8 flex-shrink-0" />
    </BottomSheet>
  );
}
