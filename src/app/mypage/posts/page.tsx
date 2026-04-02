"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const CATEGORY_REVERSE: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
};

interface ApiPost {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  authorId: number;
  authorName: string;
  title: string;
  contents: string;
  voteOptionA: string | null;
  voteOptionB: string | null;
  voteCountA: number;
  voteCountB: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ posts: ApiPost[]; totalCount: number }>("/azeyo/users/me/posts?page=1&size=50")
      .then((data) => setPosts(data.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pb-6">
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link href="/mypage" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">내 게시글</h1>
        <span className="text-[13px] text-muted-foreground">{posts.length}개</span>
      </div>

      <div className="px-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl p-4 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {CATEGORY_REVERSE[post.category] ?? post.category}
                  </span>
                  {post.type === "VOTE" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">투표</span>
                  )}
                </div>

                <h3 className="text-[14px] font-semibold text-foreground leading-snug mb-1.5">{post.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">{post.contents}</p>

                {post.type === "VOTE" && post.voteOptionA && post.voteOptionB && (() => {
                  const total = post.voteCountA + post.voteCountB;
                  const pctA = total > 0 ? Math.round((post.voteCountA / total) * 100) : 50;
                  const pctB = 100 - pctA;
                  const aWins = post.voteCountA >= post.voteCountB;
                  return (
                    <div className="space-y-2 mb-3">
                      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className={`text-[11px] font-medium ${aWins ? "text-primary font-bold" : "text-muted-foreground"}`}>{post.voteOptionA}</span>
                          <span className={`text-[11px] font-bold ${aWins ? "text-primary" : "text-muted-foreground"}`}>{pctA}%</span>
                        </div>
                        <div className="h-1 rounded-full mx-2 mb-2 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pctA}%` }} />
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className={`text-[11px] font-medium ${!aWins ? "text-primary font-bold" : "text-muted-foreground"}`}>{post.voteOptionB}</span>
                          <span className={`text-[11px] font-bold ${!aWins ? "text-primary" : "text-muted-foreground"}`}>{pctB}%</span>
                        </div>
                        <div className="h-1 rounded-full mx-2 mb-2 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pctB}%` }} />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">총 {total.toLocaleString()}명 참여</p>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><HeartIcon /> {post.likeCount}</span>
                  <span className="flex items-center gap-1"><CommentIcon /> {post.commentCount}</span>
                  <span className="ml-auto text-[10px]">{formatDate(post.createdAt)}</span>
                </div>
              </article>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[40px] mb-2">📝</p>
                <p className="text-[14px] text-muted-foreground">아직 작성한 글이 없어요</p>
                <p className="text-[12px] text-muted-foreground mt-1">커뮤니티에서 첫 번째 글을 작성해보세요!</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function HeartIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
}

function CommentIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>;
}
