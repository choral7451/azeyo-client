"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { BottomSheet } from "@/components/bottom-sheet";
import { apiFetch } from "@/lib/api";
import { grades } from "@/data/mock";
import type { Category, PostType } from "@/data/mock";

const CATEGORY_REVERSE: Record<string, Category> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
};

function getGradeFromPoints(points: number) {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

interface ApiSchedule {
  id: number;
  title: string;
  date: string;
  memo: string | null;
  tags: { id: number; name: string; color: string; isSystem: boolean }[];
}

interface ApiRecommendation {
  id: number;
  tagId: number;
  title: string;
  items: { rank: number; name: string; description: string; emoji: string }[];
}

interface ApiTopUser {
  id: number;
  nickname: string;
  iconImageUrl: string | null;
  activityPoints: number;
  monthlyPoints: number;
}

interface ApiPost {
  id: number;
  type: PostType;
  category: string;
  authorId: number;
  authorName: string;
  authorIconImageUrl: string | null;
  title: string;
  contents: string;
  imageUrls: string[] | null;
  imageRatio: string | null;
  voteOptionA: string | null;
  voteOptionB: string | null;
  voteCountA: number;
  voteCountB: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  userVote: "A" | "B" | null;
  createdAt: string;
}

interface ApiComment {
  id: number;
  contents: string;
  userId: number;
  userNickname: string;
  userIconImageUrl: string | null;
  childrenCount: number;
  createdAt: string;
}

function getDday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDday(dateStr: string): string {
  const diff = getDday(dateStr);
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function HomePage() {
  const { isLoggedIn, accessToken } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<ApiSchedule | null>(null);
  const [scheduleRec, setScheduleRec] = useState<ApiRecommendation | null>(null);
  const [selectedUser, setSelectedUser] = useState<ApiTopUser | null>(null);
  const [userTopPosts, setUserTopPosts] = useState<ApiPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [upcoming, setUpcoming] = useState<ApiSchedule[]>([]);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [matchedRec, setMatchedRec] = useState<ApiRecommendation | null>(null);
  const [topUsers, setTopUsers] = useState<ApiTopUser[]>([]);
  const [topUsersLoaded, setTopUsersLoaded] = useState(false);
  const [trending, setTrending] = useState<ApiPost[]>([]);
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [postComments, setPostComments] = useState<ApiComment[]>([]);

  useEffect(() => {
    // Top monthly users (public)
    apiFetch<{ users: ApiTopUser[] }>("/azeyo/users/top-monthly?count=3")
      .then((data) => setTopUsers(data.users))
      .catch(() => {})
      .finally(() => setTopUsersLoaded(true));
  }, []);

  // Trending posts (re-fetch with auth to get isLiked/userVote)
  useEffect(() => {
    apiFetch<{ posts: ApiPost[]; totalCount: number }>("/azeyo/communities/top", isLoggedIn ? undefined : { noAuth: true })
      .then((data) => setTrending(data.posts.slice(0, 4)))
      .catch(() => {})
      .finally(() => setTrendingLoaded(true));
  }, [accessToken]);

  useEffect(() => {
    if (!isLoggedIn || !accessToken) return;

    // Upcoming schedules
    apiFetch<{ schedules: ApiSchedule[] }>("/azeyo/schedules")
      .then((data) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const upcomingList = data.schedules
          .filter((s) => new Date(s.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4);
        setUpcoming(upcomingList);

        // Fetch recommendation for nearest schedule
        if (upcomingList.length > 0) {
          const tagIds = upcomingList[0].tags.map((t) => t.id).join(",");
          if (tagIds) {
            apiFetch<{ recommendations: ApiRecommendation[] }>(`/azeyo/schedules/recommendations?tagIds=${tagIds}`)
              .then((rec) => setMatchedRec(rec.recommendations[0] ?? null))
              .catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => setSchedulesLoaded(true));
  }, [isLoggedIn, accessToken]);

  // Load recommendation when schedule selected
  useEffect(() => {
    if (!selectedSchedule) { setScheduleRec(null); return; }
    const tagIds = selectedSchedule.tags.map(t => t.id).join(",");
    if (!tagIds) { setScheduleRec(null); return; }
    apiFetch<{ recommendations: ApiRecommendation[] }>(`/azeyo/schedules/recommendations?tagIds=${tagIds}`)
      .then(data => setScheduleRec(data.recommendations[0] ?? null))
      .catch(() => setScheduleRec(null));
  }, [selectedSchedule]);

  // Load user's top posts when user selected
  useEffect(() => {
    if (!selectedUser) { setUserTopPosts([]); return; }
    apiFetch<{ posts: ApiPost[]; totalCount: number }>(`/azeyo/communities/top/user/${selectedUser.id}?count=5`, { noAuth: true })
      .then((data) => setUserTopPosts(data.posts))
      .catch(() => setUserTopPosts([]));
  }, [selectedUser]);

  // Load comments when post selected
  useEffect(() => {
    if (!selectedPost) { setPostComments([]); return; }
    apiFetch<{ comments: ApiComment[]; totalCount: number }>(`/azeyo/communities/${selectedPost.id}/comments?page=1&size=20`, { noAuth: true })
      .then((data) => setPostComments(data.comments))
      .catch(() => {});
  }, [selectedPost]);

  return (
    <main className="px-5 pb-6">

      {/* Logged-out CTA Banner */}
      {!isLoggedIn && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="rounded-2xl px-5 pt-5 pb-5" style={{ backgroundColor: "hsl(38 35% 93%)" }}>
            <p className="text-[13px] font-medium mb-1" style={{ color: "hsl(22 60% 42%)" }}>형님, 혹시...</p>
            <h2 className="text-[17px] font-bold leading-snug mb-3" style={{ color: "hsl(25 25% 18%)" }}>
              기념일 까먹어서<br />혼난 적 있으시죠?
            </h2>
            <p className="text-[12px] leading-relaxed mb-5" style={{ color: "hsl(25 12% 48%)" }}>
              여기 등록해두면 미리 알려드립니다.<br />선물 추천은 덤이에요.
            </p>
            <div className="flex gap-2 mb-5 flex-wrap">
              {[{ emoji: "📅", text: "일정 알림" }, { emoji: "🎁", text: "선물 추천" }, { emoji: "💌", text: "메시지 족보" }].map((tag) => (
                <span key={tag.text} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: "hsl(30 30% 88%)", color: "hsl(25 25% 30%)" }}>
                  {tag.emoji} {tag.text}
                </span>
              ))}
            </div>
            <Link href="/login" className="flex items-center justify-center w-full py-3 rounded-xl text-[13px] font-semibold text-white active:scale-[0.97] transition-all" style={{ backgroundColor: "hsl(22 60% 42%)" }}>
              3초만에 시작하기
            </Link>
          </div>
        </section>
      )}

      {/* Schedule Section (logged-in) */}
      {isLoggedIn && (
        <>
          {!schedulesLoaded ? (
            /* Skeleton for schedule area */
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <div className="h-[20px] w-24 bg-secondary rounded" />
                <div className="h-[16px] w-14 bg-secondary rounded" />
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
                {[0, 1].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[200px] rounded-2xl p-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                    <div className="h-[22px] w-12 bg-secondary rounded-full mb-3" />
                    <div className="h-[20px] w-3/4 bg-secondary rounded" />
                    <div className="flex gap-1.5 mt-2.5">
                      <div className="h-[18px] w-10 bg-secondary rounded-md" />
                      <div className="h-[18px] w-10 bg-secondary rounded-md" />
                    </div>
                    <div className="h-[16px] w-full bg-secondary rounded mt-2" />
                  </div>
                ))}
              </div>
            </section>
          ) : upcoming.length > 0 ? (
            <>
              <section className="mb-10">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-foreground">다가오는 일정</h2>
                  <Link href="/schedule" className="text-[12px] text-primary font-medium">일정 전체 보기</Link>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
                  {upcoming.map((schedule) => {
                    const dday = getDday(schedule.date);
                    const isUrgent = dday <= 7;
                    return (
                      <button
                        key={schedule.id}
                        onClick={() => setSelectedSchedule(schedule)}
                        className={`flex-shrink-0 w-[200px] rounded-2xl p-4 text-left transition-transform duration-200 active:scale-[0.97] cursor-pointer ${isUrgent ? "bg-primary text-primary-foreground shadow-md" : ""}`}
                        style={!isUrgent ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
                      >
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 ${isUrgent ? "bg-white/20 text-white" : "bg-secondary text-primary"}`}>
                          {formatDday(schedule.date)}
                        </span>
                        <p className={`text-[14px] font-semibold leading-snug ${isUrgent ? "text-white" : "text-foreground"}`}>{schedule.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {schedule.tags.map((tag) => (
                            <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isUrgent ? "bg-white/15 text-white/80" : ""}`} style={!isUrgent ? { backgroundColor: tag.color + "18", color: tag.color } : undefined}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        {schedule.memo && (
                          <p className={`text-[11px] mt-2 leading-relaxed line-clamp-1 ${isUrgent ? "text-white/60" : "text-muted-foreground"}`}>{schedule.memo}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Recommendation */}
              {matchedRec && (
                <section className="mb-10">
                  <h2 className="text-[15px] font-bold text-foreground mb-4">{matchedRec.title}</h2>
                  <div className="space-y-2.5">
                    {matchedRec.items.slice(0, 3).map((item) => (
                      <div key={item.rank} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">{item.rank}</span>
                        <span className="text-base">{item.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-foreground">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="mb-10">
              <div className="rounded-2xl px-5 pt-5 pb-5" style={{ backgroundColor: "hsl(38 35% 93%)" }}>
                <p className="text-[13px] font-medium mb-1" style={{ color: "hsl(22 60% 42%)" }}>형님,</p>
                <h2 className="text-[17px] font-bold leading-snug mb-3" style={{ color: "hsl(25 25% 18%)" }}>
                  다가오는 기념일<br />등록해두셨나요?
                </h2>
                <p className="text-[12px] leading-relaxed mb-5" style={{ color: "hsl(25 12% 48%)" }}>
                  아내 생일, 결혼기념일, 장모님 생신...<br />
                  미리 등록하면 선물 추천까지 해드려요.
                </p>
                <Link href="/schedule" className="flex items-center justify-center w-full py-3 rounded-xl text-[13px] font-semibold text-white active:scale-[0.97] transition-all" style={{ backgroundColor: "hsl(22 60% 42%)" }}>
                  일정 등록하러 가기
                </Link>
              </div>
            </section>
          )}
        </>
      )}

      {/* Monthly Top Users */}
      <section className="mb-10">
        <h2 className="text-[15px] font-bold text-foreground mb-4">이달의 활동왕 🔥</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {!topUsersLoaded ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-[150px] rounded-2xl p-4 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2" />
                <div className="h-[18px] w-16 bg-secondary rounded mx-auto" />
                <div className="h-[16px] w-20 bg-secondary rounded mx-auto mt-0.5" />
                <div className="h-[16px] w-10 bg-secondary rounded mx-auto mt-1.5" />
              </div>
            ))
          ) : topUsers.length > 0 ? (
            topUsers.map((user, index) => {
              const grade = getGradeFromPoints(user.activityPoints);
              const rankColors = ["hsl(35 80% 50%)", "hsl(220 10% 65%)", "hsl(25 50% 55%)"];
              return (
                <button key={user.id} onClick={() => setSelectedUser(user)} className="flex-shrink-0 w-[150px] rounded-2xl p-4 text-center active:scale-[0.97] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                  <div className="relative inline-block mb-2">
                    {user.iconImageUrl ? (
                      <Image src={user.iconImageUrl} alt={user.nickname} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black">
                        {user.nickname.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: rankColors[index] }}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{user.nickname}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{grade.emoji} {grade.name}</p>
                  <p className="text-[11px] text-primary font-bold mt-1.5">{user.monthlyPoints}점</p>
                </button>
              );
            })
          ) : null}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-bold text-foreground">인기 게시글</h2>
          <Link href="/community" className="text-[12px] text-primary font-medium">게시글 전체 보기</Link>
        </div>
        <div className="space-y-2.5">
          {!trendingLoaded ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-[18px] w-14 bg-secondary rounded-full" />
                </div>
                <div className="h-[18px] w-3/4 bg-secondary rounded" />
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-[16px] w-8 bg-secondary rounded" />
                  <div className="h-[16px] w-8 bg-secondary rounded" />
                  <div className="h-[14px] w-14 bg-secondary rounded ml-auto" />
                </div>
              </div>
            ))
          ) : (
            trending.map((post) => (
              <article key={post.id} onClick={() => setSelectedPost(post)} className="rounded-xl px-4 py-3.5 transition-transform duration-200 active:scale-[0.98] cursor-pointer" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {CATEGORY_REVERSE[post.category] ?? post.category}
                  </span>
                  {post.type === "VOTE" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">투표</span>
                  )}
                </div>
                <h3 className="text-[13px] font-semibold text-foreground leading-snug">{post.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!accessToken) return;
                      const newLiked = !post.isLiked;
                      setTrending(prev => prev.map(p =>
                        p.id === post.id ? { ...p, isLiked: newLiked, likeCount: p.likeCount + (newLiked ? 1 : -1) } : p
                      ));
                      apiFetch(`/azeyo/communities/${post.id}/like`, {
                        method: "POST",
                        body: JSON.stringify({ isLike: newLiked }),
                      }).catch(() => {
                        setTrending(prev => prev.map(p =>
                          p.id === post.id ? { ...p, isLiked: !newLiked, likeCount: p.likeCount + (newLiked ? -1 : 1) } : p
                        ));
                      });
                    }}
                    className={`flex items-center gap-1 transition-colors active:scale-95 ${post.isLiked ? "text-primary" : ""}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                    {post.likeCount}
                  </button>
                  <span className="flex items-center gap-1"><CommentIcon /> {post.commentCount}</span>
                  <span className="ml-auto text-[10px]">{post.authorName}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Schedule Detail Bottom Sheet */}
      {selectedSchedule && (
        <BottomSheet onClose={() => setSelectedSchedule(null)} className="max-h-[85dvh]" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
          <div className="flex-1 overflow-y-auto px-6 pb-8">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[18px] font-bold text-foreground">{selectedSchedule.title}</h3>
              <span className="text-[13px] font-bold text-primary">{formatDday(selectedSchedule.date)}</span>
            </div>
            <p className="text-[12px] text-muted-foreground mb-1">{selectedSchedule.date}</p>
            {selectedSchedule.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSchedule.tags.map(tag => (
                  <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: tag.color + "18", color: tag.color }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {selectedSchedule.memo && (
              <p className="text-[12px] text-muted-foreground mb-4">{selectedSchedule.memo}</p>
            )}

            {scheduleRec ? (
              <div className="mt-4">
                <h4 className="text-[14px] font-bold text-foreground mb-3">{scheduleRec.title}</h4>
                <ol className="space-y-2.5">
                  {scheduleRec.items.map(item => (
                    <li key={item.rank} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold text-primary" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
                        {item.rank}
                      </span>
                      <span className="text-base">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-[13px] text-muted-foreground">아직 추천 정보가 없어요</p>
              </div>
            )}
          </div>
        </BottomSheet>
      )}

      {/* User Profile Bottom Sheet */}
      {selectedUser && (
        <BottomSheet onClose={() => setSelectedUser(null)}>
          <div className="px-5 pb-8">
            <div className="flex items-center gap-4 mb-5 mt-2">
              {selectedUser.iconImageUrl ? (
                <Image src={selectedUser.iconImageUrl} alt={selectedUser.nickname} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-black">
                  {selectedUser.nickname.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-bold text-foreground">{selectedUser.nickname}</h3>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "hsl(22 60% 42% / 0.12)", color: "hsl(22 60% 42%)" }}>
                    {getGradeFromPoints(selectedUser.activityPoints).emoji} {getGradeFromPoints(selectedUser.activityPoints).name}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <p className="text-[14px] font-bold text-foreground">{selectedUser.activityPoints}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">총 활동점수</p>
              </div>
              <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <p className="text-[14px] font-bold text-foreground">{selectedUser.monthlyPoints}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">이달 점수</p>
              </div>
            </div>

            {/* 인기글 */}
            {userTopPosts.length > 0 && (
              <div className="mt-5">
                <h4 className="text-[13px] font-bold text-foreground mb-3">인기글</h4>
                <div className="space-y-2">
                  {userTopPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => { setSelectedUser(null); setTimeout(() => setSelectedPost(post), 200); }}
                      className="w-full text-left rounded-xl px-4 py-3 transition-all active:scale-[0.97]"
                      style={{ backgroundColor: "hsl(36 30% 93%)" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {CATEGORY_REVERSE[post.category] ?? post.category}
                        </span>
                        {post.type === "VOTE" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "hsl(40 80% 60% / 0.15)", color: "hsl(40 80% 45%)" }}>투표</span>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                          {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <CommentIcon />
                          {post.commentCount}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BottomSheet>
      )}

      {/* Post Detail Bottom Sheet */}
      {selectedPost && (
        <PostDetailSheet
          post={selectedPost}
          comments={postComments}
          onClose={() => setSelectedPost(null)}
          onUpdate={(updated) => setTrending(prev => prev.map(p => p.id === updated.id ? { ...p, likeCount: updated.likeCount, isLiked: updated.isLiked, voteCountA: updated.voteCountA, voteCountB: updated.voteCountB, userVote: updated.userVote } : p))}
        />
      )}

      {/* 사업자 정보 */}
      <footer className="mt-16 mb-4 pt-6 border-t border-border/50">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground/70">아트인포</p>
          <div className="text-[10px] text-muted-foreground/50 leading-relaxed space-y-0.5">
            <p>대표: 임성준 | 사업자등록번호: 329-35-01197</p>
            <p>주소: 서울특별시 방배동 1430 401호</p>
            <p>이메일: azeyokorea@gmail.com</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PostDetailSheet({ post, comments: initialComments, onClose, onUpdate }: { post: ApiPost; comments: ApiComment[]; onClose: () => void; onUpdate?: (updated: { id: number; likeCount: number; isLiked: boolean; voteCountA: number; voteCountB: number; userVote: "A" | "B" | null }) => void }) {
  const { accessToken, isLoggedIn } = useAuth();
  const { show: showToast } = useToast();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState<ApiComment[]>(initialComments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setComments(initialComments); }, [initialComments]);

  function handleLike() {
    if (!accessToken) return;
    const newLiked = !liked;
    const newCount = likeCount + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setLikeCount(newCount);
    onUpdate?.({ id: post.id, likeCount: newCount, isLiked: newLiked, voteCountA, voteCountB, userVote: voted });
    apiFetch(`/azeyo/communities/${post.id}/like`, {
      method: "POST",
      body: JSON.stringify({ isLike: newLiked }),
    }).catch(() => {
      setLiked(!newLiked);
      setLikeCount(likeCount);
      onUpdate?.({ id: post.id, likeCount, isLiked: liked, voteCountA, voteCountB, userVote: voted });
    });
  }

  async function handleSubmitComment() {
    if (!commentText.trim() || submitting || !accessToken) return;
    setSubmitting(true);
    try {
      await apiFetch("/azeyo/communities/comments", {
        method: "POST",
        body: JSON.stringify({ postId: post.id, contents: commentText.trim() }),
      });
      // 댓글 목록 새로고침
      const data = await apiFetch<{ comments: ApiComment[]; totalCount: number }>(
        `/azeyo/communities/${post.id}/comments?page=1&size=20`,
        { noAuth: true },
      );
      setComments(data.comments);
      setCommentCount(prev => prev + 1);
      setCommentText("");
      showToast("댓글이 등록되었어요");
    } catch {
      showToast("댓글 등록에 실패했어요");
    } finally {
      setSubmitting(false);
    }
  }

  const [voted, setVoted] = useState<"A" | "B" | null>(post.userVote);
  const [voteCountA, setVoteCountA] = useState(post.voteCountA);
  const [voteCountB, setVoteCountB] = useState(post.voteCountB);

  const hasVote = post.type === "VOTE" && post.voteOptionA && post.voteOptionB;
  const voteTotal = voteCountA + voteCountB;
  const pctA = voteTotal > 0 ? Math.round((voteCountA / voteTotal) * 100) : 50;
  const pctB = 100 - pctA;

  function handleVote(option: "A" | "B") {
    if (!accessToken) return;
    const wasSame = voted === option;
    const newVote = wasSame ? null : option;
    const newCountA = voteCountA + (option === "A" ? (wasSame ? -1 : 1) : (voted === "A" ? -1 : 0));
    const newCountB = voteCountB + (option === "B" ? (wasSame ? -1 : 1) : (voted === "B" ? -1 : 0));
    // Optimistic update
    setVoted(newVote);
    setVoteCountA(newCountA);
    setVoteCountB(newCountB);
    onUpdate?.({ id: post.id, likeCount, isLiked: liked, voteCountA: newCountA, voteCountB: newCountB, userVote: newVote });
    apiFetch(`/azeyo/communities/${post.id}/vote`, {
      method: "POST",
      body: JSON.stringify({ option }),
    }).catch(() => {
      // Rollback
      setVoted(voted);
      setVoteCountA(voteCountA);
      setVoteCountB(voteCountB);
      onUpdate?.({ id: post.id, likeCount, isLiked: liked, voteCountA, voteCountB, userVote: voted });
    });
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[85dvh] flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-2.5 mb-4">
          {post.authorIconImageUrl ? (
            <Image src={post.authorIconImageUrl} alt={post.authorName} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-foreground">{post.authorName}</span>
            <br />
            <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {CATEGORY_REVERSE[post.category] ?? post.category}
          </span>
        </div>

        <h3 className="text-[16px] font-bold text-foreground leading-snug mb-2">{post.title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">{post.contents}</p>

        {hasVote && (
          <div className="rounded-xl border border-border overflow-hidden bg-secondary/50 mb-4">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
              <span className="text-[11px] font-bold text-primary tracking-wide">
                {voted ? "투표 완료" : "눌러서 투표하기"}
              </span>
              <span className="text-[10px] text-muted-foreground">{voteTotal.toLocaleString()}명 참여</span>
            </div>
            <div className="p-2 space-y-1.5">
              {(["A", "B"] as const).map((opt) => {
                const label = opt === "A" ? post.voteOptionA! : post.voteOptionB!;
                const pct = opt === "A" ? pctA : pctB;
                const isSelected = voted === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleVote(opt)}
                    className={`relative w-full text-left rounded-lg overflow-hidden h-10 transition-all duration-200 active:scale-[0.98] cursor-pointer ${isSelected ? "ring-[1.5px] ring-primary" : ""}`}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 rounded-lg ${isSelected ? "" : voted ? "bg-muted/80" : "bg-secondary"}`}
                      style={{
                        width: voted ? `${pct}%` : "100%",
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
        )}

        <div className="flex items-center gap-4 py-3 border-t border-b border-border mb-4">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {likeCount}
          </button>
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            {commentCount}
          </span>
        </div>

        {comments.length > 0 && (
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-3">댓글</h4>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-center gap-2 mb-1">
                    {comment.userIconImageUrl ? (
                      <Image src={comment.userIconImageUrl} alt={comment.userNickname} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary">
                        {comment.userNickname.charAt(0)}
                      </div>
                    )}
                    <span className="text-[12px] font-semibold text-foreground">{comment.userNickname}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed pl-8">{comment.contents}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment Input */}
      {isLoggedIn && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-border" style={{ backgroundColor: "hsl(30 20% 97%)" }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSubmitComment(); }}
              placeholder="댓글을 입력하세요"
              className="flex-1 rounded-xl px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none"
              style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 ${
                commentText.trim() && !submitting ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              등록
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function CommentIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>;
}
