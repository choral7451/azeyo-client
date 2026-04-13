"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/toast";
import { BottomSheet } from "@/components/bottom-sheet";
import { PostCard } from "@/components/post-card";
import type { PostCardPost } from "@/components/post-card";

interface ApiPost extends PostCardPost {
  imageUrls: string[] | null;
  imageRatio: string | null;
  voteOptionA: string | null;
  voteOptionB: string | null;
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
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[40px] mb-2">📝</p>
            <p className="text-[14px] text-muted-foreground">아직 작성한 글이 없어요</p>
            <p className="text-[12px] text-muted-foreground mt-1">커뮤니티에서 첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              extraActions={
                <button
                  onClick={() => setMenuPost(post)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              }
            />
          ))
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-[14px] font-medium text-foreground">수정하기</span>
              </button>
            )}
            <button
              onClick={() => handleDelete(menuPost)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 flex-shrink-0">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
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
