"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { BottomSheet } from "@/components/bottom-sheet";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link
          href="/mypage"
          aria-label="뒤로 가기"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">설정</h1>
      </div>

      <div className="px-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {/* App Info */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-muted-foreground mb-2 px-1">앱 정보</h3>
          <div className="space-y-1">
            <Link href="/mypage/settings/terms" className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <span className="text-[14px] font-medium text-foreground">이용약관</span>
              <ChevronIcon />
            </Link>
            <Link href="/mypage/settings/privacy" className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <span className="text-[14px] font-medium text-foreground">개인정보 처리방침</span>
              <ChevronIcon />
            </Link>
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <span className="text-[14px] font-medium text-foreground">앱 버전</span>
              <span className="text-[13px] text-muted-foreground">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-muted-foreground mb-2 px-1">지원</h3>
          <div className="space-y-1">
            <Link href="/mypage/settings/contact" className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <span className="text-[14px] font-medium text-foreground">문의하기</span>
              <ChevronIcon />
            </Link>
          </div>
        </div>

        {/* Account */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-muted-foreground mb-2 px-1">계정</h3>
          <div className="space-y-1">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
            >
              <span className="text-[14px] font-medium text-foreground">로그아웃</span>
              <ChevronIcon />
            </button>
            <Link
              href="/mypage/settings/withdraw"
              className="w-full flex items-center px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all"
            >
              <span className="text-[14px] font-medium text-red-400">회원 탈퇴</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Logout Confirm Sheet */}
      {showLogoutConfirm && (
        <BottomSheet onClose={() => setShowLogoutConfirm(false)}>
          <div className="px-5 pb-8">
            <h3 className="text-[17px] font-bold text-foreground text-center mb-2">
              로그아웃
            </h3>
            <p className="text-[13px] text-muted-foreground text-center mb-6">
              정말 로그아웃 하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl text-[14px] font-medium bg-secondary text-secondary-foreground active:scale-[0.97] transition-all"
              >
                취소
              </button>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
                style={{ backgroundColor: "hsl(22 60% 42%)" }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </main>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-30 text-muted-foreground">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
