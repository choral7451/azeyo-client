"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { BottomSheet } from "@/components/bottom-sheet";
import { apiFetch } from "@/lib/api";

const CATEGORY_REVERSE: Record<string, string> = {
  GIFT: "선물", COUPLE_FIGHT: "부부싸움", HOBBY: "어른들 취미",
  PARENTING: "육아", LIFE_TIP: "생활꿀팁", FREE: "자유게시판",
  WORK: "직장생활", HEALTH: "건강/운동", IN_LAWS: "시댁/처가",
};

export interface PostDetailData {
  id: number;
  type: "TEXT" | "VOTE";
  category: string;
  authorName: string;
  authorIconImageUrl: string | null;
  title: string;
  contents: string;
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

interface Comment {
  id: number;
  contents: string;
  userId: number;
  userNickname: string;
  userIconImageUrl: string | null;
  childrenCount: number;
  createdAt: string;
}

export function PostDetailSheet({
  post, onClose, onUpdate,
}: {
  post: PostDetailData;
  onClose: () => void;
  onUpdate?: (updated: { id: number; likeCount: number; isLiked: boolean; voteCountA: number; voteCountB: number; userVote: "A" | "B" | null }) => void;
}) {
  const { accessToken, isLoggedIn } = useAuth();
  const { show: showToast } = useToast();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState<"A" | "B" | null>(post.userVote);
  const [voteCountA, setVoteCountA] = useState(post.voteCountA);
  const [voteCountB, setVoteCountB] = useState(post.voteCountB);

  useEffect(() => {
    apiFetch<{ comments: Comment[]; totalCount: number }>(`/azeyo/communities/${post.id}/comments?page=1&size=20`, { noAuth: true })
      .then((data) => setComments(data.comments))
      .catch(() => {});
  }, [post.id]);

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
      const data = await apiFetch<{ comments: Comment[]; totalCount: number }>(
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
    setVoted(newVote);
    setVoteCountA(newCountA);
    setVoteCountB(newCountB);
    onUpdate?.({ id: post.id, likeCount, isLiked: liked, voteCountA: newCountA, voteCountB: newCountB, userVote: newVote });
    apiFetch(`/azeyo/communities/${post.id}/vote`, {
      method: "POST",
      body: JSON.stringify({ option }),
    }).catch(() => {
      setVoted(voted);
      setVoteCountA(voteCountA);
      setVoteCountB(voteCountB);
      onUpdate?.({ id: post.id, likeCount, isLiked: liked, voteCountA, voteCountB, userVote: voted });
    });
  }

  return (
    <BottomSheet onClose={onClose} className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-2.5 mb-4">
          {post.authorIconImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.authorIconImageUrl} alt={post.authorName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-primary">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-foreground">{post.authorName}</span>
            <div>
              <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comment.userIconImageUrl} alt={comment.userNickname} className="w-6 h-6 rounded-full object-cover" />
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
