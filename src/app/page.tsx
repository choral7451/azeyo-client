"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import {
  posts,
  getUpcomingSchedules,
  formatDday,
  getDday,
  recommendations,
  getTopMonthlyUsers,
  getGrade,
  type User,
  type Post,
} from "@/data/mock";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const upcoming = getUpcomingSchedules().slice(0, 4);
  const trending = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 4);
  const nearestSchedule = upcoming[0];
  const matchedRec = nearestSchedule
    ? recommendations.find((r) =>
        nearestSchedule.tags.some((t) => t.id === r.tagId)
      )
    : null;

  return (
    <main className="px-5 pb-6">

      {/* Logged-out CTA Banner */}
      {!isLoggedIn && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div
            className="rounded-2xl px-5 pt-5 pb-5"
            style={{ backgroundColor: "hsl(38 35% 93%)" }}
          >
            {/* Conversational heading */}
            <p className="text-[13px] font-medium mb-1" style={{ color: "hsl(22 60% 42%)" }}>
              형님, 혹시...
            </p>
            <h2 className="text-[17px] font-bold leading-snug mb-3" style={{ color: "hsl(25 25% 18%)" }}>
              기념일 까먹어서<br />혼난 적 있으시죠?
            </h2>
            <p className="text-[12px] leading-relaxed mb-5" style={{ color: "hsl(25 12% 48%)" }}>
              여기 등록해두면 미리 알려드립니다.<br />
              선물 추천은 덤이에요.
            </p>

            {/* Feature tags */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {[
                { emoji: "📅", text: "일정 알림" },
                { emoji: "🎁", text: "선물 추천" },
                { emoji: "💌", text: "메시지 족보" },
              ].map((tag) => (
                <span
                  key={tag.text}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "hsl(30 30% 88%)",
                    color: "hsl(25 25% 30%)",
                  }}
                >
                  {tag.emoji} {tag.text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="flex items-center justify-center w-full py-3 rounded-xl text-[13px] font-semibold text-white active:scale-[0.97] transition-all"
              style={{ backgroundColor: "hsl(22 60% 42%)" }}
            >
              3초만에 시작하기
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Schedules (logged-in only) */}
      {isLoggedIn && upcoming.length > 0 && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[15px] font-bold text-foreground">
              다가오는 일정
            </h2>
            <Link href="/schedule" className="text-[12px] text-primary font-medium">
              전체 보기
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
            {upcoming.map((schedule) => {
              const dday = getDday(schedule.date);
              const isUrgent = dday <= 7;
              return (
                <div
                  key={schedule.id}
                  className={`
                    flex-shrink-0 w-[200px] rounded-2xl p-4 transition-transform duration-200 active:scale-[0.97]
                    ${
                      isUrgent
                        ? "bg-primary text-primary-foreground shadow-md"
                        : ""
                    }
                  `}
                  style={!isUrgent ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
                >
                  <span
                    className={`
                      inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3
                      ${
                        isUrgent
                          ? "bg-white/20 text-white"
                          : "bg-secondary text-primary"
                      }
                    `}
                  >
                    {formatDday(schedule.date)}
                  </span>
                  <p
                    className={`text-[14px] font-semibold leading-snug ${
                      isUrgent ? "text-white" : "text-foreground"
                    }`}
                  >
                    {schedule.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {schedule.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          isUrgent ? "bg-white/15 text-white/80" : ""
                        }`}
                        style={
                          !isUrgent
                            ? { backgroundColor: tag.color + "18", color: tag.color }
                            : undefined
                        }
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  {schedule.memo && (
                    <p
                      className={`text-[11px] mt-2 leading-relaxed line-clamp-1 ${
                        isUrgent ? "text-white/60" : "text-muted-foreground"
                      }`}
                    >
                      {schedule.memo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommendation (logged-in only) */}
      {isLoggedIn && matchedRec && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-[15px] font-bold text-foreground mb-4">
            {matchedRec.title}
          </h2>
          <div className="space-y-2.5">
            {matchedRec.items.slice(0, 3).map((item) => (
              <div
                key={item.rank}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
                  {item.rank}
                </span>
                <span className="text-base">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Top Users */}
      <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="text-[15px] font-bold text-foreground mb-4">
          이달의 활동왕 🔥
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {getTopMonthlyUsers(3).map((user, index) => {
            const grade = getGrade(user.activityPoints);
            const rankColors = [
              "hsl(35 80% 50%)",   // 1st: gold
              "hsl(220 10% 65%)",  // 2nd: silver
              "hsl(25 50% 55%)",   // 3rd: bronze
            ];
            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="flex-shrink-0 w-[150px] rounded-2xl p-4 text-center active:scale-[0.97] transition-all"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              >
                <div className="relative inline-block mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black">
                    {user.initials}
                  </div>
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{ backgroundColor: rankColors[index] }}
                  >
                    {index + 1}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {grade.emoji} {grade.name}
                </p>
                <p className="text-[11px] text-primary font-bold mt-1.5">
                  {user.monthlyPoints}점
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-bold text-foreground">
            인기 게시글
          </h2>
          <Link href="/community" className="text-[12px] text-primary font-medium">
            전체 보기
          </Link>
        </div>
        <div className="space-y-2.5">
          {trending.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="rounded-xl px-4 py-3.5 transition-transform duration-200 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {post.category}
                </span>
                {post.type === "VOTE" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">
                    투표
                  </span>
                )}
              </div>
              <h3 className="text-[13px] font-semibold text-foreground leading-snug">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HeartIcon /> {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <CommentIcon /> {post.commentCount}
                </span>
                <span className="ml-auto text-[10px]">{post.author}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* User Profile Bottom Sheet */}
      {selectedUser && (
        <UserProfileSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedPost && (
        <PostDetailSheet
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </main>
  );
}

function UserProfileSheet({ user, onClose }: { user: User; onClose: () => void }) {
  const grade = getGrade(user.activityPoints);
  const userPosts = posts
    .filter((p) => p.author === user.name)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] rounded-t-3xl bg-background px-5 pt-3 pb-8 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-black">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-foreground">
              {user.name}
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {user.subtitle}
            </p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: "hsl(22 60% 42% / 0.12)",
                  color: "hsl(22 60% 42%)",
                }}
              >
                {grade.emoji} {grade.name}
              </span>
              {user.badges.map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: "게시글", value: user.stats.posts },
            { label: "좋아요", value: user.stats.likes },
            { label: "족보 기여", value: user.stats.jokbo },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl py-3 text-center"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
            >
              <p className="text-[14px] font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Top Posts */}
        {userPosts.length > 0 && (
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-2.5">
              대표 게시글
            </h4>
            <div className="space-y-2">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{ backgroundColor: "hsl(36 30% 93%)" }}
                >
                  <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {post.category}
                  </span>
                  <span className="flex-1 min-w-0 text-[12px] font-medium text-foreground truncate">
                    {post.title}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <HeartIcon /> {post.likeCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {userPosts.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-4">
            아직 작성한 글이 없어요
          </p>
        )}
      </div>
    </div>
  );
}

function PostDetailSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const [liked, setLiked] = useState(false);
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const comments = [...(post.comments ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Vote
  const hasVote = post.type === "VOTE" && post.voteOptionA && post.voteOptionB;
  const countA = post.voteCountA ?? 0;
  const countB = post.voteCountB ?? 0;
  const voteTotal = countA + countB;
  const pctA = voteTotal > 0 ? Math.round((countA / voteTotal) * 100) : 50;
  const pctB = 100 - pctA;
  const aWins = countA >= countB;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] rounded-t-3xl bg-background animate-fade-up max-h-[85dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="px-5 pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Author */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
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
              <span className="text-[10px] text-muted-foreground">{post.createdAt}</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {post.category}
            </span>
          </div>

          {/* Title & Content */}
          <h3 className="text-[16px] font-bold text-foreground leading-snug mb-2">
            {post.title}
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
            {post.content}
          </p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.images[0]}
                alt=""
                className={`w-full object-cover ${post.imageRatio === "1:1" ? "aspect-square" : "aspect-[4/5]"}`}
                loading="lazy"
              />
              {post.images.length > 1 && (
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  +{post.images.length - 1}장 더
                </p>
              )}
            </div>
          )}

          {/* Vote Result */}
          {hasVote && (
            <div className="space-y-2 mb-4">
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className={`text-[12px] font-medium ${aWins ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {post.voteOptionA}
                  </span>
                  <span className={`text-[12px] font-bold ${aWins ? "text-primary" : "text-muted-foreground"}`}>
                    {pctA}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full mx-3 mb-2.5 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pctA}%` }} />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className={`text-[12px] font-medium ${!aWins ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {post.voteOptionB}
                  </span>
                  <span className={`text-[12px] font-bold ${!aWins ? "text-primary" : "text-muted-foreground"}`}>
                    {pctB}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full mx-3 mb-2.5 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pctB}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                총 {voteTotal.toLocaleString()}명 참여
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-border mb-4">
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
              <h4 className="text-[13px] font-bold text-foreground mb-3">
                댓글
              </h4>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary">
                        {comment.author[0]}
                      </div>
                      <span className="text-[12px] font-semibold text-foreground">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {comment.createdAt.split(" ")[1] ?? comment.createdAt}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed pl-8">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </svg>
  );
}
