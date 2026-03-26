"use client";

import { useState } from "react";
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

  const filtered =
    activeCategory === "전체"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  function handleVote(postId: string, option: "A" | "B") {
    setVotedPosts((prev) => ({ ...prev, [postId]: option }));
  }

  return (
    <main className="pt-14 pb-6">
      {/* Header */}
      <header className="px-5 mb-5 animate-fade-up">
        <h1 className="text-[22px] font-black tracking-tight text-[var(--warm-900)]">
          커뮤니티
        </h1>
        <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
          형님들의 진솔한 이야기
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-shrink-0 text-[13px] px-4 py-2 rounded-full font-medium transition-all duration-200
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

      {/* Feed */}
      <div className="px-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            voted={votedPosts[post.id]}
            onVote={(option) => handleVote(post.id, option)}
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
  );
}

function PostCard({
  post,
  voted,
  onVote,
}: {
  post: Post;
  voted?: "A" | "B";
  onVote: (option: "A" | "B") => void;
}) {
  const [liked, setLiked] = useState(false);
  const likeCount = post.likeCount + (liked ? 1 : 0);

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 transition-transform duration-200 active:scale-[0.98]">
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
        {post.content}
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
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted-foreground)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          {post.commentCount}
        </button>
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
    <div className="mt-3 space-y-2">
      <button
        onClick={() => onVote("A")}
        disabled={hasVoted}
        className={`
          relative w-full text-left rounded-xl overflow-hidden transition-all duration-200
          ${hasVoted ? "" : "active:scale-[0.98]"}
          ${voted === "A" ? "ring-2 ring-[var(--primary)]" : ""}
        `}
      >
        <div className={`relative z-10 px-4 py-3 ${hasVoted ? "" : "bg-[var(--secondary)]"}`}>
          {hasVoted && (
            <div
              className="absolute inset-0 bg-[var(--primary)]/12 vote-bar"
              style={{ "--bar-width": `${pctA}%` } as React.CSSProperties}
            />
          )}
          <div className="relative z-10 flex items-center justify-between">
            <span className={`text-[13px] font-medium ${voted === "A" ? "text-[var(--primary)] font-semibold" : "text-[var(--foreground)]"}`}>
              {optionA}
            </span>
            {hasVoted && (
              <span className={`text-[13px] font-bold ${voted === "A" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                {pctA}%
              </span>
            )}
          </div>
        </div>
      </button>
      <button
        onClick={() => onVote("B")}
        disabled={hasVoted}
        className={`
          relative w-full text-left rounded-xl overflow-hidden transition-all duration-200
          ${hasVoted ? "" : "active:scale-[0.98]"}
          ${voted === "B" ? "ring-2 ring-[var(--primary)]" : ""}
        `}
      >
        <div className={`relative z-10 px-4 py-3 ${hasVoted ? "" : "bg-[var(--secondary)]"}`}>
          {hasVoted && (
            <div
              className="absolute inset-0 bg-[var(--primary)]/12 vote-bar"
              style={{ "--bar-width": `${pctB}%` } as React.CSSProperties}
            />
          )}
          <div className="relative z-10 flex items-center justify-between">
            <span className={`text-[13px] font-medium ${voted === "B" ? "text-[var(--primary)] font-semibold" : "text-[var(--foreground)]"}`}>
              {optionB}
            </span>
            {hasVoted && (
              <span className={`text-[13px] font-bold ${voted === "B" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                {pctB}%
              </span>
            )}
          </div>
        </div>
      </button>
      {hasVoted && (
        <p className="text-[11px] text-[var(--muted-foreground)] text-center">
          총 {total.toLocaleString()}명 참여
        </p>
      )}
    </div>
  );
}
