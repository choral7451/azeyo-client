"use client";

import Link from "next/link";
import {
  posts,
  getUpcomingSchedules,
  formatDday,
  getDday,
  recommendations,
} from "@/data/mock";

export default function HomePage() {
  const upcoming = getUpcomingSchedules().slice(0, 4);
  const trending = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 4);
  const nearestSchedule = upcoming[0];
  const matchedRec = nearestSchedule
    ? recommendations.find((r) =>
        nearestSchedule.tags.some((t) => t.id === r.tagId)
      )
    : null;

  return (
    <>
      <main className="px-5 pb-6">

      {/* Upcoming Schedules */}
      {upcoming.length > 0 && (
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
                        : "bg-card border border-border shadow-sm"
                    }
                  `}
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

      {/* Recommendation */}
      {matchedRec && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-[15px] font-bold text-foreground mb-4">
            {matchedRec.title}
          </h2>
          <div className="space-y-2.5">
            {matchedRec.items.slice(0, 3).map((item) => (
              <div
                key={item.rank}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm"
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

      {/* Trending */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
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
              className="bg-card border border-border rounded-xl px-4 py-3.5 shadow-sm transition-transform duration-200 active:scale-[0.98]"
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
      </main>
    </>
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
