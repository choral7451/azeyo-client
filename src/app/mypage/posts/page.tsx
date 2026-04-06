"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/toast";
import { BottomSheet } from "@/components/bottom-sheet";

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
  imageUrls: string[] | null;
  imageRatio: string | null;
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
  const { show: showToast } = useToast();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuPost, setMenuPost] = useState<ApiPost | null>(null);
  const [editPost, setEditPost] = useState<ApiPost | null>(null);

  function fetchPosts() {
    apiFetch<{ posts: ApiPost[]; totalCount: number }>("/azeyo/users/me/posts?page=1&size=50")
      .then((data) => setPosts(data.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPosts(); }, []);

  async function handleDelete(post: ApiPost) {
    setMenuPost(null);
    try {
      await apiFetch(`/azeyo/communities/${post.id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      showToast("게시글이 삭제되었어요");
    } catch {
      showToast("삭제에 실패했어요");
    }
  }

  return (
    <main className="pb-6">
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link href="/mypage" aria-label="뒤로 가기" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all">
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
              <article key={post.id} className="rounded-2xl p-4 transition-all relative" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                {/* Menu Button */}
                <button
                  onClick={() => setMenuPost(post)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>

                <div className="flex items-center gap-2 mb-2 pr-8">
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
                      {[{ label: post.voteOptionA, pct: pctA, wins: aWins }, { label: post.voteOptionB, pct: pctB, wins: !aWins }].map((opt, i) => (
                        <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: "hsl(35 20% 90%)" }}>
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className={`text-[11px] font-medium ${opt.wins ? "text-primary font-bold" : "text-muted-foreground"}`}>{opt.label}</span>
                            <span className={`text-[11px] font-bold ${opt.wins ? "text-primary" : "text-muted-foreground"}`}>{opt.pct}%</span>
                          </div>
                          <div className="h-1 rounded-full mx-2 mb-2 overflow-hidden" style={{ backgroundColor: "hsl(35 20% 86%)" }}>
                            <div className="h-full rounded-full bg-primary" style={{ width: `${opt.pct}%` }} />
                          </div>
                        </div>
                      ))}
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

      {/* Action Menu */}
      {menuPost && (
        <BottomSheet onClose={() => setMenuPost(null)}>
          <div className="px-5 pb-8 space-y-1">
            {menuPost.type === "TEXT" && (
              <button
                onClick={() => { setEditPost(menuPost); setMenuPost(null); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
              >
                <span className="text-base">✏️</span>
                <span className="text-[14px] font-medium text-foreground">수정하기</span>
              </button>
            )}
            <button
              onClick={() => handleDelete(menuPost)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
            >
              <span className="text-base">🗑️</span>
              <span className="text-[14px] font-medium text-red-500">삭제하기</span>
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Edit Sheet */}
      {editPost && (
        <EditPostSheet
          post={editPost}
          onClose={() => setEditPost(null)}
          onSubmit={() => { setEditPost(null); fetchPosts(); showToast("게시글이 수정되었어요"); }}
        />
      )}
    </main>
  );
}

function EditPostSheet({ post, onClose, onSubmit }: { post: ApiPost; onClose: () => void; onSubmit: () => void }) {
  const [title, setTitle] = useState(post.title);
  const [contents, setContents] = useState(post.contents);
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim().length > 0 && contents.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/azeyo/communities/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          category: post.category,
          title: title.trim(),
          contents: contents.trim(),
        }),
      });
      onSubmit();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="flex flex-col" hideHeader>
      <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-[14px] text-muted-foreground font-medium">취소</button>
          <h3 className="text-[16px] font-bold text-foreground">글 수정</h3>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`text-[14px] font-semibold transition-colors ${isValid && !submitting ? "text-primary" : "text-muted-foreground/40"}`}
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">제목</span>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        </div>
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">내용</span>
          <textarea
            value={contents} onChange={(e) => setContents(e.target.value)}
            rows={8}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition resize-none leading-relaxed"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        </div>
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
