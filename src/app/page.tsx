"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
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
  const [selectedUser, setSelectedUser] = useState<ApiTopUser | null>(null);
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [upcoming, setUpcoming] = useState<ApiSchedule[]>([]);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [matchedRec, setMatchedRec] = useState<ApiRecommendation | null>(null);
  const [topUsers, setTopUsers] = useState<ApiTopUser[]>([]);
  const [trending, setTrending] = useState<ApiPost[]>([]);
  const [postComments, setPostComments] = useState<ApiComment[]>([]);

  useEffect(() => {
    // Top monthly users (public)
    apiFetch<{ users: ApiTopUser[] }>("/azeyo/users/top-monthly?count=3")
      .then((data) => setTopUsers(data.users))
      .catch(() => {});

    // Trending posts (public)
    apiFetch<{ posts: ApiPost[]; totalCount: number }>("/azeyo/communities/top")
      .then((data) => setTrending(data.posts.slice(0, 4)))
      .catch(() => {});
  }, []);

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

      {/* No Schedules CTA (logged-in) */}
      {isLoggedIn && schedulesLoaded && upcoming.length === 0 && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
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

      {/* Upcoming Schedules */}
      {isLoggedIn && upcoming.length > 0 && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[15px] font-bold text-foreground">다가오는 일정</h2>
            <Link href="/schedule" className="text-[12px] text-primary font-medium">전체 보기</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
            {upcoming.map((schedule) => {
              const dday = getDday(schedule.date);
              const isUrgent = dday <= 7;
              return (
                <div
                  key={schedule.id}
                  className={`flex-shrink-0 w-[200px] rounded-2xl p-4 transition-transform duration-200 active:scale-[0.97] ${isUrgent ? "bg-primary text-primary-foreground shadow-md" : ""}`}
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
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommendation */}
      {isLoggedIn && matchedRec && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
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

      {/* Monthly Top Users */}
      {topUsers.length > 0 && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-[15px] font-bold text-foreground mb-4">이달의 활동왕 🔥</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
            {topUsers.map((user, index) => {
              const grade = getGradeFromPoints(user.activityPoints);
              const rankColors = ["hsl(35 80% 50%)", "hsl(220 10% 65%)", "hsl(25 50% 55%)"];
              return (
                <button key={user.id} onClick={() => setSelectedUser(user)} className="flex-shrink-0 w-[150px] rounded-2xl p-4 text-center active:scale-[0.97] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                  <div className="relative inline-block mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black">
                      {user.nickname.charAt(0)}
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: rankColors[index] }}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{user.nickname}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{grade.emoji} {grade.name}</p>
                  <p className="text-[11px] text-primary font-bold mt-1.5">{user.monthlyPoints}점</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[15px] font-bold text-foreground">인기 게시글</h2>
            <Link href="/community" className="text-[12px] text-primary font-medium">전체 보기</Link>
          </div>
          <div className="space-y-2.5">
            {trending.map((post) => (
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
                  <span className="flex items-center gap-1"><HeartIcon /> {post.likeCount}</span>
                  <span className="flex items-center gap-1"><CommentIcon /> {post.commentCount}</span>
                  <span className="ml-auto text-[10px]">{post.authorName}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* User Profile Bottom Sheet */}
      {selectedUser && (
        <BottomSheet onClose={() => setSelectedUser(null)}>
          <div className="px-5 pb-8">
            <div className="flex items-center gap-4 mb-5 mt-2">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-black">
                {selectedUser.nickname.charAt(0)}
              </div>
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
          </div>
        </BottomSheet>
      )}

      {/* Post Detail Bottom Sheet */}
      {selectedPost && (
        <PostDetailSheet post={selectedPost} comments={postComments} onClose={() => setSelectedPost(null)} />
      )}
    </main>
  );
}

function PostDetailSheet({ post, comments, onClose }: { post: ApiPost; comments: ApiComment[]; onClose: () => void }) {
  const { accessToken } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  function handleLike() {
    if (!accessToken) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));
    apiFetch(`/azeyo/communities/${post.id}/like`, {
      method: "POST",
      body: JSON.stringify({ isLike: newLiked }),
    }).catch(() => {
      setLiked(!newLiked);
      setLikeCount(prev => prev + (newLiked ? -1 : 1));
    });
  }

  const hasVote = post.type === "VOTE" && post.voteOptionA && post.voteOptionB;
  const voteTotal = post.voteCountA + post.voteCountB;
  const pctA = voteTotal > 0 ? Math.round((post.voteCountA / voteTotal) * 100) : 50;
  const pctB = 100 - pctA;
  const aWins = post.voteCountA >= post.voteCountB;

  return (
    <BottomSheet onClose={onClose} className="max-h-[85dvh] flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
            {post.authorName.charAt(0)}
          </div>
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
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{post.contents}</p>

        {hasVote && (
          <div className="space-y-2 mb-4">
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
            {post.commentCount}
          </span>
        </div>

        {comments.length > 0 && (
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-3">댓글</h4>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary">
                      {comment.userNickname.charAt(0)}
                    </div>
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
    </BottomSheet>
  );
}

function HeartIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
}

function CommentIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>;
}
