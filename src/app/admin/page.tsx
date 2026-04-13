"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { apiFetch } from "@/lib/api";

const CATEGORY_MAP: Record<string, string> = {
  "선물": "GIFT", "부부싸움": "COUPLE_FIGHT", "어른들 취미": "HOBBY",
  "육아": "PARENTING", "생활꿀팁": "LIFE_TIP", "자유게시판": "FREE",
  "직장생활": "WORK", "건강/운동": "HEALTH", "시댁/처가": "IN_LAWS",
};
const CATEGORY_REVERSE: Record<string, string> = Object.fromEntries(Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k]));
const CATEGORIES = Object.keys(CATEGORY_MAP);

interface AdminUser {
  id: number;
  nickname: string;
  iconImageUrl: string | null;
  activityPoints: number;
  createdAt: string;
  isWriteBanned: boolean;
}

interface AdminPost {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  userId: number;
  authorName: string;
  authorIconImageUrl: string | null;
  title: string;
  contents: string;
  imageUrls: string[] | null;
  imageRatio: string | null;
  voteOptionA: string | null;
  voteOptionB: string | null;
  viewCount: number;
  createdAt: string;
}

type Tab = "posts" | "write" | "comment";

export default function AdminPage() {
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, isAdmin, router]);

  if (isLoading || !isLoggedIn || !isAdmin) return null;

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "hsl(30 20% 97%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border px-5 py-3">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-foreground">
            <span className="text-primary">아재요</span> 관리자
          </h1>
          <button onClick={() => router.push("/")} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            홈으로
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[53px] z-40 bg-white border-b border-border">
        <div className="max-w-[800px] mx-auto flex">
          {([
            { key: "posts" as Tab, label: "게시글 관리" },
            { key: "write" as Tab, label: "글쓰기 (대리)" },
            { key: "comment" as Tab, label: "댓글쓰기 (대리)" },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-[13px] font-semibold transition-colors border-b-2 ${
                tab === t.key ? "text-primary border-primary" : "text-muted-foreground border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto p-5">
        {tab === "posts" && <PostsManager />}
        {tab === "write" && <WriteAsUser />}
        {tab === "comment" && <CommentAsUser />}
      </div>
    </div>
  );
}

/* ==================== 게시글 관리 ==================== */
function PostsManager() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContents, setEditContents] = useState("");

  const fetchPosts = useCallback(async (p: number, kw: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), size: "20" });
      if (kw) params.set("keyword", kw);
      const data = await apiFetch<{ posts: AdminPost[]; totalCount: number }>(`/azeyo/admin/posts?${params}`);
      setPosts(data.posts);
      setTotalCount(data.totalCount);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(page, keyword); }, [page, keyword, fetchPosts]);

  async function handleDelete(postId: number) {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/azeyo/admin/posts/${postId}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setTotalCount(prev => prev - 1);
    } catch { /* */ }
  }

  function startEdit(post: AdminPost) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContents(post.contents);
  }

  async function handleEdit() {
    if (!editingPost) return;
    try {
      await apiFetch(`/azeyo/admin/posts/${editingPost.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle, contents: editContents }),
      });
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, title: editTitle, contents: editContents } : p));
      setEditingPost(null);
    } catch { /* */ }
  }

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setKeyword(searchInput); }} className="flex gap-2">
        <input
          type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="제목/내용 검색" className="flex-1 rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border"
        />
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold">검색</button>
      </form>

      <p className="text-[12px] text-muted-foreground">총 {totalCount}개</p>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                    {CATEGORY_REVERSE[post.category] ?? post.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">#{post.id}</span>
                  <span className="text-[11px] text-muted-foreground">{post.authorName} (ID:{post.userId})</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(post)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors">수정</button>
                  <button onClick={() => handleDelete(post.id)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">삭제</button>
                </div>
              </div>
              <h3 className="text-[14px] font-semibold text-foreground">{post.title}</h3>
              <p className="text-[12px] text-muted-foreground line-clamp-2">{post.contents}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleString("ko-KR")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-secondary disabled:opacity-40">이전</button>
          <span className="text-[12px] text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-secondary disabled:opacity-40">다음</button>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setEditingPost(null)}>
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[500px] space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold">게시글 수정 (#{editingPost.id})</h3>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground block mb-1">제목</label>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground block mb-1">내용</label>
              <textarea value={editContents} onChange={e => setEditContents(e.target.value)} rows={6}
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border resize-none leading-relaxed" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground bg-secondary">취소</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-primary">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== 글쓰기 (대리) ==================== */
function WriteAsUser() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [type, setType] = useState<"TEXT" | "VOTE">("TEXT");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [voteA, setVoteA] = useState("");
  const [voteB, setVoteB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchUsers = useCallback(async (p: number) => {
    try {
      const data = await apiFetch<{ users: AdminUser[]; totalCount: number }>(`/azeyo/admin/users?page=${p}&size=50`);
      setUsers(data.users);
      setUserTotal(data.totalCount);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchUsers(userPage); }, [userPage, fetchUsers]);

  async function handleSubmit() {
    if (!selectedUser || !title.trim() || !contents.trim()) return;
    if (type === "VOTE" && (!voteA.trim() || !voteB.trim())) return;
    setSubmitting(true);
    try {
      await apiFetch("/azeyo/admin/posts", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedUser.id,
          type,
          category: CATEGORY_MAP[category],
          title: title.trim(),
          contents: contents.trim(),
          ...(type === "VOTE" ? { voteOptionA: voteA.trim(), voteOptionB: voteB.trim() } : {}),
        }),
      });
      setMessage(`${selectedUser.nickname}(으)로 게시글 작성 완료!`);
      setTitle(""); setContents(""); setVoteA(""); setVoteB("");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("작성 실패");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      {message && (
        <div className="rounded-xl px-4 py-3 text-[13px] font-medium bg-green-50 text-green-700">{message}</div>
      )}

      {/* User Selection */}
      <div>
        <label className="text-[13px] font-semibold text-foreground block mb-2">작성할 유저 선택</label>
        {selectedUser ? (
          <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
              {selectedUser.nickname[0]}
            </div>
            <div className="flex-1">
              <span className="text-[13px] font-semibold">{selectedUser.nickname}</span>
              <span className="text-[11px] text-muted-foreground ml-2">ID:{selectedUser.id}</span>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-[12px] text-muted-foreground">변경</button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden max-h-[250px] overflow-y-auto">
            {users.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-primary">
                  {u.nickname[0]}
                </div>
                <span className="text-[13px] font-medium">{u.nickname}</span>
                <span className="text-[11px] text-muted-foreground">ID:{u.id}</span>
              </button>
            ))}
            {userTotal > 50 && (
              <div className="flex justify-center gap-2 py-2">
                <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage === 1} className="px-3 py-1 rounded text-[11px] bg-secondary disabled:opacity-40">이전</button>
                <button onClick={() => setUserPage(userPage + 1)} disabled={users.length < 50} className="px-3 py-1 rounded text-[11px] bg-secondary disabled:opacity-40">다음</button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          {/* Type */}
          <div className="flex gap-2">
            {(["TEXT", "VOTE"] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${type === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
              >
                {t === "TEXT" ? "일반 글" : "투표 글"}
              </button>
            ))}
          </div>

          {/* Category */}
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${category === c ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">제목</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border" />
          </div>

          {/* Contents */}
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">내용</label>
            <textarea value={contents} onChange={e => setContents(e.target.value)} rows={6}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border resize-none leading-relaxed" />
          </div>

          {/* Vote Options */}
          {type === "VOTE" && (
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">선택지 A</label>
                <input type="text" value={voteA} onChange={e => setVoteA(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">선택지 B</label>
                <input type="text" value={voteB} onChange={e => setVoteB(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border" />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !contents.trim() || (type === "VOTE" && (!voteA.trim() || !voteB.trim()))}
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-white bg-primary disabled:opacity-40 transition-opacity"
          >
            {submitting ? "작성 중..." : `${selectedUser.nickname}(으)로 게시글 작성`}
          </button>
        </>
      )}
    </div>
  );
}

/* ==================== 댓글쓰기 (대리) ==================== */
function CommentAsUser() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [postId, setPostId] = useState("");
  const [contents, setContents] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Reuse posts for selecting which post to comment on
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch<{ users: AdminUser[]; totalCount: number }>("/azeyo/admin/users?page=1&size=50");
      setUsers(data.users);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function searchPosts() {
    if (!postId.trim()) return;
    setPostsLoading(true);
    try {
      const data = await apiFetch<{ posts: AdminPost[]; totalCount: number }>(`/azeyo/admin/posts?page=1&size=10&keyword=${encodeURIComponent(postId)}`);
      setPosts(data.posts);
    } catch { /* */ }
    setPostsLoading(false);
  }

  async function handleSubmit() {
    if (!selectedUser || !selectedPost || !contents.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch("/azeyo/admin/comments", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedUser.id,
          postId: selectedPost.id,
          contents: contents.trim(),
        }),
      });
      setMessage(`${selectedUser.nickname}(으)로 댓글 작성 완료!`);
      setContents("");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("작성 실패");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      {message && (
        <div className="rounded-xl px-4 py-3 text-[13px] font-medium bg-green-50 text-green-700">{message}</div>
      )}

      {/* User Selection */}
      <div>
        <label className="text-[13px] font-semibold text-foreground block mb-2">댓글 작성할 유저 선택</label>
        {selectedUser ? (
          <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
              {selectedUser.nickname[0]}
            </div>
            <div className="flex-1">
              <span className="text-[13px] font-semibold">{selectedUser.nickname}</span>
              <span className="text-[11px] text-muted-foreground ml-2">ID:{selectedUser.id}</span>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-[12px] text-muted-foreground">변경</button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden max-h-[250px] overflow-y-auto">
            {users.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-primary">
                  {u.nickname[0]}
                </div>
                <span className="text-[13px] font-medium">{u.nickname}</span>
                <span className="text-[11px] text-muted-foreground">ID:{u.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Selection */}
      {selectedUser && (
        <div>
          <label className="text-[13px] font-semibold text-foreground block mb-2">댓글 달 게시글</label>
          {selectedPost ? (
            <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">#{selectedPost.id} - {selectedPost.authorName}</span>
                <button onClick={() => setSelectedPost(null)} className="text-[12px] text-muted-foreground">변경</button>
              </div>
              <h4 className="text-[13px] font-semibold">{selectedPost.title}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{selectedPost.contents}</p>
            </div>
          ) : (
            <>
              <form onSubmit={e => { e.preventDefault(); searchPosts(); }} className="flex gap-2 mb-2">
                <input type="text" value={postId} onChange={e => setPostId(e.target.value)}
                  placeholder="게시글 제목/내용 검색" className="flex-1 rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border" />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold">검색</button>
              </form>
              {postsLoading ? (
                <p className="text-[12px] text-muted-foreground py-2">검색 중...</p>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden max-h-[200px] overflow-y-auto">
                  {posts.map(p => (
                    <button key={p.id} onClick={() => setSelectedPost(p)}
                      className="w-full px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                    >
                      <span className="text-[11px] text-muted-foreground">#{p.id} {p.authorName}</span>
                      <h4 className="text-[13px] font-medium">{p.title}</h4>
                    </button>
                  ))}
                  {posts.length === 0 && postId && (
                    <p className="px-4 py-3 text-[12px] text-muted-foreground">결과 없음</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Comment Input */}
      {selectedUser && selectedPost && (
        <>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground block mb-1.5">댓글 내용</label>
            <textarea value={contents} onChange={e => setContents(e.target.value)} rows={4}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border border-border resize-none leading-relaxed" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !contents.trim()}
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-white bg-primary disabled:opacity-40 transition-opacity"
          >
            {submitting ? "작성 중..." : `${selectedUser.nickname}(으)로 댓글 작성`}
          </button>
        </>
      )}
    </div>
  );
}
