"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BottomSheet } from "@/components/bottom-sheet";
import { grades } from "@/data/mock";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function getGradeFromPoints(points: number) {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

const CATEGORY_REVERSE: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
  WORK: "직장생활", HEALTH: "건강/운동", IN_LAWS: "시댁/처가",
};

const USER_REPORT_REASONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "INAPPROPRIATE", label: "부적절한 행동" },
  { value: "HARASSMENT", label: "괴롭힘/혐오 표현" },
  { value: "IMPERSONATION", label: "사칭" },
  { value: "OTHER", label: "기타" },
] as const;

export interface UserProfile {
  id: number;
  nickname: string;
  subtitle: string | null;
  iconImageUrl: string | null;
  activityPoints: number;
  monthlyPoints: number;
  postsCount: number;
  likesCount: number;
}

interface PostItem {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  title: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export function UserProfileSheet({
  user, accessToken, onClose, onReportSuccess, onReportDuplicate, onPostClick,
}: {
  user: UserProfile;
  accessToken: string | null;
  onClose: () => void;
  onReportSuccess: () => void;
  onReportDuplicate: () => void;
  onPostClick?: (postId: number) => void;
}) {
  const [showReport, setShowReport] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
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
      const items: PostItem[] = data.posts ?? [];
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
          <button
            onClick={() => { if (!accessToken) return; setShowReport(true); }}
            className="self-start mt-1 p-2 rounded-lg text-muted-foreground active:scale-95 transition-transform"
            aria-label="유저 신고"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
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
                <div
                  key={post.id}
                  className={`rounded-xl px-4 py-3 ${onPostClick ? "cursor-pointer active:scale-[0.97] transition-all" : ""}`}
                  style={{ backgroundColor: "hsl(36 30% 93%)" }}
                  onClick={onPostClick ? () => onPostClick(post.id) : undefined}
                >
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
    <BottomSheet onClose={onClose} className="" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <h3 className="text-[18px] font-bold text-foreground mb-1">유저 신고</h3>
        <p className="text-[12px] text-muted-foreground mb-5">신고 사유를 선택해주세요</p>

        <div className="space-y-2 mb-5">
          {USER_REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all active:scale-[0.98] ${
                reason === r.value ? "bg-primary text-primary-foreground" : "text-foreground"
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
