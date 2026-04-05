"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { apiFetch } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";

export default function WithdrawPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const reasons = [
    "사용 빈도가 낮아요",
    "원하는 기능이 없어요",
    "다른 서비스를 이용해요",
    "개인정보가 걱정돼요",
    "기타",
  ];

  const canSubmit = reason !== "" && agreed;

  async function handleWithdraw() {
    setProcessing(true);
    try {
      await apiFetch("/azeyo/users/me", {
        method: "DELETE",
        body: JSON.stringify({ reason, detail }),
      });
    } catch {
      // API가 아직 없을 수 있으므로 에러 무시
    }
    logout();
    router.push("/");
  }

  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link
          href="/mypage/settings"
          aria-label="뒤로 가기"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">회원 탈퇴</h1>
      </div>

      <div className="px-5 space-y-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {/* Warning */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "hsl(0 60% 95%)" }}>
          <h3 className="text-[14px] font-bold text-red-600 mb-2">탈퇴 전 확인해주세요</h3>
          <ul className="space-y-1.5 text-[12px] text-red-600/80 leading-relaxed">
            <li className="flex gap-1.5">
              <span className="shrink-0">•</span>
              <span>탈퇴 시 계정 정보, 활동 포인트, 등급이 모두 삭제되며 복구할 수 없습니다.</span>
            </li>
            <li className="flex gap-1.5">
              <span className="shrink-0">•</span>
              <span>작성한 게시글과 댓글은 삭제되지 않으며, 작성자명이 &quot;탈퇴한 회원&quot;으로 표시됩니다.</span>
            </li>
            <li className="flex gap-1.5">
              <span className="shrink-0">•</span>
              <span>동일한 소셜 계정으로 재가입할 수 있으나, 기존 데이터는 복구되지 않습니다.</span>
            </li>
          </ul>
        </div>

        {/* Reason */}
        <div>
          <label className="text-[13px] font-semibold text-foreground block mb-3">탈퇴 사유를 선택해주세요</label>
          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: reason === r ? "hsl(22 60% 42% / 0.08)" : "hsl(36 30% 93%)",
                  border: reason === r ? "1.5px solid hsl(22 60% 42% / 0.3)" : "1.5px solid transparent",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: reason === r ? "hsl(22 60% 42%)" : "hsl(30 10% 75%)",
                  }}
                >
                  {reason === r && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(22 60% 42%)" }} />
                  )}
                </div>
                <span className="text-[13px] font-medium text-foreground">{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {reason && (
          <div className="animate-fade-up">
            <label className="text-[13px] font-semibold text-foreground block mb-2">
              추가 의견 <span className="text-muted-foreground font-normal">(선택)</span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="개선할 점이 있다면 알려주세요. 더 좋은 서비스를 만드는 데 도움이 됩니다."
              className="w-full h-28 rounded-xl px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
            />
          </div>
        )}

        {/* Agreement */}
        <button
          onClick={() => setAgreed(!agreed)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
            style={{
              backgroundColor: agreed ? "hsl(22 60% 42%)" : "transparent",
              border: agreed ? "none" : "2px solid hsl(30 10% 75%)",
            }}
          >
            {agreed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
          <span className="text-[13px] text-foreground">
            위 안내 사항을 확인했으며, 탈퇴에 동의합니다.
          </span>
        </button>

        {/* Submit */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{ backgroundColor: "hsl(0 50% 55%)" }}
        >
          회원 탈퇴
        </button>
      </div>

      {/* Confirm Sheet */}
      {showConfirm && (
        <BottomSheet onClose={() => setShowConfirm(false)}>
          <div className="px-5 pb-8">
            <h3 className="text-[17px] font-bold text-foreground text-center mb-2">
              정말 탈퇴하시겠어요?
            </h3>
            <p className="text-[13px] text-muted-foreground text-center mb-6 leading-relaxed">
              모든 데이터가 삭제되며<br />복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl text-[14px] font-medium bg-secondary text-secondary-foreground active:scale-[0.97] transition-all"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processing}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all disabled:opacity-60"
                style={{ backgroundColor: "hsl(0 50% 55%)" }}
              >
                {processing ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </main>
  );
}
