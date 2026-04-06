"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useHeaderExtra } from "@/components/header-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { getCookie } from "@/lib/cookie";
import { BottomSheet } from "@/components/bottom-sheet";
import type { Category, PostType } from "@/data/mock";
import { grades } from "@/data/mock";

function getGradeFromPoints(points: number) {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Category mapping: frontend display → backend enum
const CATEGORY_MAP: Record<Category, string> = {
  "선물": "GIFT",
  "부부싸움": "COUPLE_FIGHT",
  "어른들 취미": "HOBBY",
  "육아": "PARENTING",
  "생활꿀팁": "LIFE_TIP",
  "자유게시판": "FREE",
  "직장생활": "WORK",
  "건강/운동": "HEALTH",
  "시댁/처가": "IN_LAWS",
};

const CATEGORY_REVERSE: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k as Category])
) as Record<string, Category>;

const categories: ("전체" | Category)[] = [
  "전체", "선물", "부부싸움", "어른들 취미", "육아", "생활꿀팁", "직장생활", "건강/운동", "시댁/처가", "자유게시판",
];
const writeCategories: Category[] = ["선물", "부부싸움", "어른들 취미", "육아", "생활꿀팁", "직장생활", "건강/운동", "시댁/처가", "자유게시판"];

// API response types
interface ApiPost {
  id: number;
  type: "TEXT" | "VOTE";
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
  viewCount: number;
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

interface ApiUserProfile {
  id: number;
  nickname: string;
  subtitle: string | null;
  iconImageUrl: string | null;
  activityPoints: number;
  monthlyPoints: number;
  postsCount: number;
  likesCount: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CommunityPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { show: showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<"전체" | Category>("전체");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentPost, setCommentPost] = useState<ApiPost | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [reportPost, setReportPost] = useState<ApiPost | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<ApiUserProfile | null>(null);
  const { setStickyExtra } = useHeaderExtra();
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, category: "전체" | Category, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (reset) setLoading(true);

    try {
      const params = new URLSearchParams({ page: String(pageNum), size: "20" });
      if (category !== "전체") params.set("category", CATEGORY_MAP[category]);

      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_BASE}/azeyo/communities?${params}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const json = await res.json();
      const data: { posts: ApiPost[]; totalCount: number } = json.item ?? json;

      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setHasMore(reset ? data.posts.length < data.totalCount : (posts.length + data.posts.length) < data.totalCount);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [accessToken, posts.length]);

  // Initial load & category change
  useEffect(() => {
    fetchPosts(1, activeCategory, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, accessToken]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingRef.current) {
        fetchPosts(page + 1, activeCategory);
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, page, activeCategory, fetchPosts]);

  function requireLogin(): boolean {
    // Read cookie directly — no stale closure issues
    if (!getCookie("accessToken")) {
      showToast("로그인이 필요한 기능이에요");
      setTimeout(() => router.push("/login"), 1200);
      return false;
    }
    return true;
  }

  useEffect(() => {
    const handler = async () => {
      if (!requireLogin()) return;
      // 글쓰기 제한 여부를 API로 직접 확인
      try {
        const token = accessToken;
        if (token) {
          const res = await fetch(`${API_BASE}/azeyo/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            const data = json.item ?? json;
            if (data.isWriteBanned) {
              showToast("글쓰기가 제한된 계정이에요");
              return;
            }
          }
        }
      } catch {
        // 확인 실패 시 일단 허용
      }
      setShowWrite(true);
    };
    window.addEventListener("header:create", handler);
    return () => window.removeEventListener("header:create", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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

  useEffect(() => {
    if (!selectedUserId) { setUserProfile(null); return; }
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    fetch(`${API_BASE}/azeyo/users/${selectedUserId}`, { headers })
      .then(r => r.json()).then(json => setUserProfile(json.item ?? json)).catch(() => {});
  }, [selectedUserId, accessToken]);

  function handleCategoryChange(cat: "전체" | Category) {
    setActiveCategory(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleVote(postId: number, option: "A" | "B") {
    if (!requireLogin()) return;
    fetch(`${API_BASE}/azeyo/communities/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ option }),
    }).then(async () => {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const wasSame = p.userVote === option;
        return {
          ...p,
          userVote: wasSame ? null : option,
          voteCountA: p.voteCountA + (option === "A" ? (wasSame ? -1 : 1) : (p.userVote === "A" ? -1 : 0)),
          voteCountB: p.voteCountB + (option === "B" ? (wasSame ? -1 : 1) : (p.userVote === "B" ? -1 : 0)),
        };
      }));
    });
  }

  function handleLike(postId: number, isLike: boolean) {
    if (!requireLogin()) return;
    fetch(`${API_BASE}/azeyo/communities/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ isLike }),
    }).then(() => {
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return { ...p, isLiked: isLike, likeCount: p.likeCount + (isLike ? 1 : -1) };
      }));
    });
  }

  function handleNewPost() {
    setShowWrite(false);
    fetchPosts(1, activeCategory, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <main className="pb-6">
        {/* Category Tabs */}
        <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <CategoryTabs categories={categories} active={activeCategory} onSelect={handleCategoryChange} />
        </div>

        {/* Feed */}
        <div className="px-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[40px] mb-2">📝</p>
              <p className="text-[14px] text-muted-foreground">아직 게시글이 없어요</p>
              <p className="text-[12px] text-muted-foreground mt-1">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={(option) => handleVote(post.id, option)}
                onLike={(isLike) => handleLike(post.id, isLike)}
                onComment={() => setCommentPost(post)}
                onReport={() => {
                  if (!accessToken) { showToast("로그인이 필요한 기능이에요"); return; }
                  setReportPost(post);
                }}
                onAuthorClick={() => setSelectedUserId(post.authorId)}
              />
            ))
          )}
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {!loading && hasMore && posts.length > 0 && (
            <div className="text-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          )}
        </div>
      </main>

      {commentPost && (
        <CommentSheet
          post={commentPost}
          accessToken={accessToken}
          onClose={() => setCommentPost(null)}
          onCommentCountChange={(count) => {
            setPosts(prev => prev.map(p => p.id === commentPost.id ? { ...p, commentCount: count } : p));
          }}
        />
      )}

      {showWrite && (
        <WriteSheet
          accessToken={accessToken}
          onClose={() => setShowWrite(false)}
          onSubmit={handleNewPost}
        />
      )}

      {selectedUserId && userProfile && (
        <UserProfileSheet
          user={userProfile}
          accessToken={accessToken}
          onClose={() => setSelectedUserId(null)}
          onReportSuccess={() => { setSelectedUserId(null); showToast("신고가 접수되었습니다"); }}
          onReportDuplicate={() => { setSelectedUserId(null); showToast("이미 신고한 유저입니다"); }}
        />
      )}

      {reportPost && (
        <ReportSheet
          post={reportPost}
          accessToken={accessToken}
          onClose={() => setReportPost(null)}
          onSuccess={() => {
            setReportPost(null);
            showToast("신고가 접수되었습니다");
          }}
          onDuplicate={() => {
            setReportPost(null);
            showToast("이미 신고한 게시글입니다");
          }}
        />
      )}
    </>
  );
}

function CategoryTabs<T extends string>({
  categories: cats, active, onSelect, small,
}: {
  categories: T[]; active: T; onSelect: (cat: T) => void; small?: boolean;
}) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide ${small ? "mt-2" : "px-5 mb-5"}`}>
      {cats.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex-shrink-0 rounded-full font-medium transition-all duration-200
            ${small ? "text-[12px] px-3.5 py-1.5" : "text-[13px] px-4 py-2"}
            ${active === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground active:scale-95"}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ImageCarousel({ images, ratio = "4:5" }: { images: string[]; ratio?: string }) {
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

  const aspectClass = ratio === "1:1" ? "aspect-square" : "aspect-[4/5]";

  if (images.length === 1) {
    return (
      <div className={`relative w-full ${aspectClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="게시글 이미지" className="absolute inset-0 w-full h-full object-cover" loading="lazy" draggable={false} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${activeIdx * 100}% + ${offsetX}px))`,
          transition: offsetX !== 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {images.map((src, i) => (
          <div key={i} className={`flex-shrink-0 w-full relative ${aspectClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`게시글 이미지 ${i + 1}`} className="absolute inset-0 w-full h-full object-cover select-none" loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-200 ${i === activeIdx ? "bg-white w-3" : "bg-white/50 w-1.5"}`} />
        ))}
      </div>
    </div>
  );
}

const CONTENT_MAX_LENGTH = 80;

function PostCard({
  post, onVote, onLike, onComment, onReport, onAuthorClick,
}: {
  post: ApiPost;
  onVote: (option: "A" | "B") => void;
  onLike: (isLike: boolean) => void;
  onComment: () => void;
  onReport: () => void;
  onAuthorClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.contents.length > CONTENT_MAX_LENGTH;
  const displayCategory = CATEGORY_REVERSE[post.category] || post.category;

  return (
    <article className="rounded-2xl overflow-hidden transition-transform duration-200" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
      {post.imageUrls && post.imageUrls.length > 0 && (
        <ImageCarousel images={post.imageUrls} ratio={post.imageRatio ?? "4:5"} />
      )}

      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2.5">
          <button onClick={onAuthorClick} className="flex items-center gap-2 flex-1 min-w-0 active:opacity-70 transition-opacity">
            {post.authorIconImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.authorIconImageUrl} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
                {post.authorName?.[0] || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[13px] font-semibold text-foreground">{post.authorName}</span>
              <div>
                <span className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </button>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            {displayCategory}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5">{post.title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {isLong && !expanded ? (
            <>
              {post.contents.slice(0, CONTENT_MAX_LENGTH)}...
              <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }} className="text-primary font-semibold ml-1">더보기</button>
            </>
          ) : (
            post.contents
          )}
        </p>

        {/* Vote */}
        {post.type === "VOTE" && post.voteOptionA && post.voteOptionB && (
          <VoteSection
            optionA={post.voteOptionA}
            optionB={post.voteOptionB}
            countA={post.voteCountA}
            countB={post.voteCountB}
            voted={post.userVote}
            onVote={onVote}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border -mx-1">
          <button
            onClick={() => onLike(!post.isLiked)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium transition-colors active:scale-95 ${post.isLiked ? "text-primary" : "text-muted-foreground"}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {post.likeCount}
          </button>
          <button onClick={onComment} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium text-muted-foreground active:scale-95 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            {post.commentCount}
          </button>
          <div className="flex-1" />
          <button onClick={onReport} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-medium text-muted-foreground active:scale-95 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            신고
          </button>
        </div>
      </div>
    </article>
  );
}

function VoteSection({
  optionA, optionB, countA, countB, voted, onVote,
}: {
  optionA: string; optionB: string; countA: number; countB: number;
  voted: "A" | "B" | null; onVote: (option: "A" | "B") => void;
}) {
  const total = countA + countB;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const hasVoted = !!voted;

  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden bg-secondary/50">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
        <span className="text-[11px] font-bold text-primary tracking-wide">
          {hasVoted ? "투표 완료" : "눌러서 투표하기"}
        </span>
        <span className="text-[10px] text-muted-foreground">{total.toLocaleString()}명 참여</span>
      </div>
      <div className="p-2 space-y-1.5">
        {(["A", "B"] as const).map((opt) => {
          const label = opt === "A" ? optionA : optionB;
          const pct = opt === "A" ? pctA : pctB;
          const isSelected = voted === opt;
          return (
            <button
              key={opt}
              onClick={() => onVote(opt)}
              className={`relative w-full text-left rounded-lg overflow-hidden h-10 transition-all duration-200 active:scale-[0.98] cursor-pointer ${isSelected ? "ring-[1.5px] ring-primary" : ""}`}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-lg ${isSelected ? "" : hasVoted ? "bg-muted/80" : "bg-secondary"}`}
                style={{
                  width: hasVoted ? `${pct}%` : "100%",
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
  );
}

function CommentSheet({
  post, accessToken, onClose, onCommentCountChange,
}: {
  post: ApiPost; accessToken: string | null; onClose: () => void;
  onCommentCountChange: (count: number) => void;
}) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, ApiComment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(post.commentCount);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch parent comments
  useEffect(() => {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    fetch(`${API_BASE}/azeyo/communities/${post.id}/comments?page=1&size=100`, { headers })
      .then(r => r.json())
      .then((json) => {
        const data: { comments: ApiComment[]; totalCount: number } = json.item ?? json;
        setComments(data.comments);
        setTotalCount(data.totalCount);
      })
      .finally(() => setLoading(false));
  }, [post.id, accessToken]);

  async function loadReplies(parentId: number) {
    if (expandedReplies[parentId]) {
      // Toggle off
      setExpandedReplies(prev => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
      return;
    }

    setLoadingReplies(prev => new Set(prev).add(parentId));
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_BASE}/azeyo/communities/${post.id}/comments?page=1&size=100&parentId=${parentId}`, { headers });
      const json = await res.json();
      const data: { comments: ApiComment[]; totalCount: number } = json.item ?? json;
      setExpandedReplies(prev => ({ ...prev, [parentId]: data.comments }));
    } finally {
      setLoadingReplies(prev => { const next = new Set(prev); next.delete(parentId); return next; });
    }
  }

  async function handleSubmit() {
    if (!newComment.trim() || submitting) return;
    if (!accessToken) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/azeyo/communities/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          postId: post.id,
          parentId: replyTarget?.commentId ?? null,
          contents: newComment.trim(),
        }),
      });

      if (!res.ok) throw new Error();

      // Refresh comments
      const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };
      const refreshRes = await fetch(`${API_BASE}/azeyo/communities/${post.id}/comments?page=1&size=100`, { headers });
      const refreshJson = await refreshRes.json();
      const data: { comments: ApiComment[]; totalCount: number } = refreshJson.item ?? refreshJson;
      setComments(data.comments);
      setTotalCount(data.totalCount);
      onCommentCountChange(data.totalCount);

      // Refresh replies if replying
      if (replyTarget) {
        const replyRes = await fetch(`${API_BASE}/azeyo/communities/${post.id}/comments?page=1&size=100&parentId=${replyTarget.commentId}`, { headers });
        const replyJson = await replyRes.json();
        const replyData: { comments: ApiComment[]; totalCount: number } = replyJson.item ?? replyJson;
        setExpandedReplies(prev => ({ ...prev, [replyTarget.commentId]: replyData.comments }));
      }

      setNewComment("");
      setReplyTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReply(commentId: number, author: string) {
    setReplyTarget({ commentId, author });
    setNewComment(`@${author} `);
    inputRef.current?.focus();
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[80dvh] flex flex-col" hideHeader>
      <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-foreground">댓글 {totalCount}</h3>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">댓글 불러오는 중...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[28px] mb-2">💬</p>
            <p className="text-[13px] text-muted-foreground">아직 댓글이 없어요</p>
            <p className="text-[11px] text-muted-foreground mt-1">첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const replies = expandedReplies[comment.id];
            const isLoadingReplies = loadingReplies.has(comment.id);

            return (
              <div key={comment.id}>
                <div className="flex gap-2.5">
                  {comment.userIconImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.userIconImageUrl} alt={comment.userNickname} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                      {comment.userNickname?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-foreground">{comment.userNickname}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed mt-0.5">{comment.contents}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => handleReply(comment.id, comment.userNickname)}
                        className="text-[10px] font-medium text-muted-foreground"
                      >
                        답글 달기
                      </button>
                    </div>

                    {/* Replies toggle */}
                    {comment.childrenCount > 0 && !replies && (
                      <button
                        onClick={() => loadReplies(comment.id)}
                        className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary"
                        disabled={isLoadingReplies}
                      >
                        <span className="w-5 border-t border-primary/30" />
                        {isLoadingReplies ? "불러오는 중..." : `답글 ${comment.childrenCount}개 더 보기`}
                      </button>
                    )}

                    {/* Expanded replies */}
                    {replies && (
                      <div className="mt-3 space-y-3">
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            {reply.userIconImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={reply.userIconImageUrl} alt={reply.userNickname} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0 mt-0.5">
                                {reply.userNickname?.[0] || "?"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-foreground">{reply.userNickname}</span>
                                <span className="text-[9px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-[12px] text-foreground leading-relaxed mt-0.5">
                                {reply.contents.split(/(@\S+)/).map((part, i) =>
                                  part.startsWith("@") ? (
                                    <span key={i} className="text-primary font-semibold">{part}</span>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                )}
                              </p>
                              <button
                                onClick={() => handleReply(comment.id, reply.userNickname)}
                                className="text-[10px] font-medium text-muted-foreground mt-1"
                              >
                                답글 달기
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => loadReplies(comment.id)}
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
            <button onClick={() => { setReplyTarget(null); setNewComment(""); }} className="text-[11px] text-muted-foreground font-medium">취소</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="comment-input" className="sr-only">댓글</label>
          <input
            id="comment-input"
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
            disabled={!newComment.trim() || submitting}
            aria-label="댓글 전송"
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              newComment.trim() ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function WriteSheet({ accessToken, onClose, onSubmit }: { accessToken: string | null; onClose: () => void; onSubmit: () => void }) {
  const [postType, setPostType] = useState<PostType>("TEXT");
  const [category, setCategory] = useState<Category>("자유게시판");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [voteOptionA, setVoteOptionA] = useState("");
  const [voteOptionB, setVoteOptionB] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [imageRatio, setImageRatio] = useState<"4:5" | "1:1">("4:5");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = postType === "TEXT"
    ? title.trim().length > 0 && content.trim().length > 0
    : title.trim().length > 0 && voteOptionA.trim().length > 0 && voteOptionB.trim().length > 0;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 5 - images.length).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    if (!isValid || submitting) return;
    if (!accessToken) return;
    setSubmitting(true);

    try {
      // Upload images first if any
      let imageUrls: string[] | null = null;
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("imageFiles", img.file));
        const uploadRes = await fetch(`${API_BASE}/azeyo/communities/upload/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("이미지 업로드에 실패했습니다.");
        const uploadJson = await uploadRes.json();
        const uploadData: { urls: string[] } = uploadJson.item ?? uploadJson;
        imageUrls = uploadData.urls;
      }

      // Create post
      const body: Record<string, unknown> = {
        type: postType,
        category: CATEGORY_MAP[category],
        title: title.trim(),
        contents: content.trim(),
        imageUrls,
        imageRatio: images.length > 0 ? imageRatio : null,
      };
      if (postType === "VOTE") {
        body.voteOptionA = voteOptionA.trim();
        body.voteOptionB = voteOptionB.trim();
      }

      const res = await fetch(`${API_BASE}/azeyo/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("게시글 등록에 실패했습니다.");
      onSubmit();
    } catch {
      // TODO: show error toast
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[90dvh] flex flex-col" hideHeader>
      <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-[14px] text-muted-foreground font-medium">취소</button>
          <h3 className="text-[16px] font-bold text-foreground">글쓰기</h3>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`text-[14px] font-semibold transition-colors ${isValid && !submitting ? "text-primary" : "text-muted-foreground/40"}`}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Post Type Toggle */}
        <div className="flex gap-2">
          {(["TEXT", "VOTE"] as PostType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPostType(type)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] ${
                postType === type ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
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
                  category === cat ? "bg-primary text-white" : "bg-secondary text-muted-foreground active:scale-95"
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
                <label className="text-[12px] font-semibold text-muted-foreground">사진 ({images.length}/5)</label>
                <div className="flex items-center gap-2">
                  {images.length > 0 && (
                    <div className="flex bg-secondary rounded-lg overflow-hidden">
                      {(["4:5", "1:1"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setImageRatio(ratio)}
                          className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${imageRatio === ratio ? "bg-primary text-white" : "text-muted-foreground"}`}
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
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    추가
                  </button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="rounded-xl overflow-hidden">
                  <ImageCarousel images={images.map(i => i.preview)} ratio={imageRatio} />
                  <div className="flex gap-1.5 mt-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt={`업로드 이미지 ${i + 1}`} className="w-full h-full object-cover" />
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

              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground block mb-2">선택지</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "hsl(22 60% 42% / 0.06)" }}>
                  <span className="text-[13px] font-bold text-primary">A</span>
                  <input
                    type="text" value={voteOptionA} onChange={(e) => setVoteOptionA(e.target.value)}
                    placeholder="첫 번째 선택지"
                    className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-bold text-muted-foreground/40">VS</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "hsl(22 60% 42% / 0.06)" }}>
                  <span className="text-[13px] font-bold text-primary">B</span>
                  <input
                    type="text" value={voteOptionB} onChange={(e) => setVoteOptionB(e.target.value)}
                    placeholder="두 번째 선택지"
                    className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-muted-foreground block mb-2">
                부연 설명 <span className="font-normal text-muted-foreground/50">(선택)</span>
              </label>
              <textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="투표 배경이나 고민을 적어주세요" rows={3}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed"
              />
            </div>
          </>
        )}
      </div>

      <div className="h-8 flex-shrink-0" />
    </BottomSheet>
  );
}

const REPORT_REASONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "INAPPROPRIATE", label: "부적절한 콘텐츠" },
  { value: "HARASSMENT", label: "괴롭힘/혐오 표현" },
  { value: "FALSE_INFO", label: "허위 정보" },
  { value: "OTHER", label: "기타" },
] as const;

function ReportSheet({
  post, accessToken, onClose, onSuccess, onDuplicate,
}: {
  post: ApiPost; accessToken: string | null; onClose: () => void;
  onSuccess: () => void; onDuplicate: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [contents, setContents] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/azeyo/communities/${post.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ reason, contents: contents.trim() || null }),
      });
      if (res.status === 409) {
        onDuplicate();
        return;
      }
      if (!res.ok) throw new Error("신고 실패");
      onSuccess();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[70dvh]" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <h3 className="text-[18px] font-bold text-foreground mb-1">게시글 신고</h3>
        <p className="text-[12px] text-muted-foreground mb-5">신고 사유를 선택해주세요</p>

        <div className="space-y-2 mb-5">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all active:scale-[0.98] ${
                reason === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              }`}
              style={reason !== r.value ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
            >
              {r.label}
            </button>
          ))}
        </div>

        {reason === "OTHER" && (
          <textarea
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            placeholder="신고 사유를 입력해주세요"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed mb-5"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "hsl(40 30% 93%)" }}>
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? "접수 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

const USER_REPORT_REASONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "INAPPROPRIATE", label: "부적절한 행동" },
  { value: "HARASSMENT", label: "괴롭힘/혐오 표현" },
  { value: "IMPERSONATION", label: "사칭" },
  { value: "OTHER", label: "기타" },
] as const;

function UserProfileSheet({
  user, accessToken, onClose, onReportSuccess, onReportDuplicate,
}: {
  user: ApiUserProfile; accessToken: string | null;
  onClose: () => void; onReportSuccess: () => void; onReportDuplicate: () => void;
}) {
  const [showReport, setShowReport] = useState(false);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const grade = getGradeFromPoints(user.activityPoints);

  const fetchPosts = useCallback(async (page: number, reset = false) => {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/azeyo/communities?page=${page}&size=10&authorId=${user.id}`, { headers });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.item ?? json;
      const items: ApiPost[] = data.posts ?? [];
      setPosts(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length >= 10);
    } catch {
      // silently fail
    } finally {
      setLoadingPosts(false);
    }
  }, [user.id, accessToken]);

  useEffect(() => { fetchPosts(1, true); }, [fetchPosts]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || !hasMore || loadingPosts) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setLoadingPosts(true);
      const next = postPage + 1;
      setPostPage(next);
      fetchPosts(next);
    }
  }

  if (showReport) {
    return (
      <UserReportSheet
        userId={user.id}
        accessToken={accessToken}
        onClose={() => setShowReport(false)}
        onSuccess={onReportSuccess}
        onDuplicate={onReportDuplicate}
      />
    );
  }

  return (
    <BottomSheet onClose={onClose} style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex items-center gap-4 mb-5 mt-2">
          {user.iconImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.iconImageUrl} alt={user.nickname} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-black">
              {user.nickname.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-foreground">{user.nickname}</h3>
            {user.subtitle && (
              <p className="text-[12px] text-muted-foreground mt-0.5">{user.subtitle}</p>
            )}
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "hsl(22 60% 42% / 0.12)", color: "hsl(22 60% 42%)" }}>
                {grade.emoji} {grade.name}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <p className="text-[14px] font-bold text-foreground">{user.activityPoints}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">총 활동점수</p>
          </div>
          <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <p className="text-[14px] font-bold text-foreground">{user.monthlyPoints}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">이달 점수</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <p className="text-[14px] font-bold text-foreground">{user.postsCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">게시글</p>
          </div>
          <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <p className="text-[14px] font-bold text-foreground">{user.likesCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">받은 좋아요</p>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-[13px] font-bold text-foreground mb-3">작성한 글</h4>
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="rounded-xl px-4 py-3" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {CATEGORY_REVERSE[post.category] ?? post.category}
                    </span>
                    {post.type === "VOTE" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "hsl(40 80% 60% / 0.15)", color: "hsl(40 80% 45%)" }}>투표</span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-1">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              ))}
              {loadingPosts && <p className="text-center text-[12px] text-muted-foreground py-2">불러오는 중...</p>}
            </div>
          ) : !loadingPosts ? (
            <p className="text-[12px] text-muted-foreground text-center py-4">작성한 글이 없어요</p>
          ) : (
            <p className="text-center text-[12px] text-muted-foreground py-2">불러오는 중...</p>
          )}
        </div>

        <button
          onClick={() => {
            if (!accessToken) return;
            setShowReport(true);
          }}
          className="mt-5 py-2 px-4 rounded-lg text-[12px] font-medium text-muted-foreground active:scale-[0.97] transition-transform"
        >
          이 유저 신고하기
        </button>
      </div>
    </BottomSheet>
  );
}

function UserReportSheet({
  userId, accessToken, onClose, onSuccess, onDuplicate,
}: {
  userId: number; accessToken: string | null; onClose: () => void;
  onSuccess: () => void; onDuplicate: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [contents, setContents] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/azeyo/users/${userId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ reason, contents: contents.trim() || null }),
      });
      if (res.status === 409) { onDuplicate(); return; }
      if (!res.ok) throw new Error("신고 실패");
      onSuccess();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[70dvh]" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <h3 className="text-[18px] font-bold text-foreground mb-1">유저 신고</h3>
        <p className="text-[12px] text-muted-foreground mb-5">신고 사유를 선택해주세요</p>

        <div className="space-y-2 mb-5">
          {USER_REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all active:scale-[0.98] ${
                reason === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              }`}
              style={reason !== r.value ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
            >
              {r.label}
            </button>
          ))}
        </div>

        {reason === "OTHER" && (
          <textarea
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            placeholder="신고 사유를 입력해주세요"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none leading-relaxed mb-5"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
          />
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "hsl(40 30% 93%)" }}>
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? "접수 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
