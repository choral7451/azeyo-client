"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";

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
            <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(40 30% 96%)" }}>
              <span className="text-[14px] font-medium text-foreground">이용약관</span>
              <ChevronIcon />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(40 30% 96%)" }}>
              <span className="text-[14px] font-medium text-foreground">개인정보 처리방침</span>
              <ChevronIcon />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-muted-foreground mb-2 px-1">지원</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all" style={{ backgroundColor: "hsl(40 30% 96%)" }}>
              <span className="text-[14px] font-medium text-foreground">문의하기</span>
              <ChevronIcon />
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-muted-foreground mb-2 px-1">계정</h3>
          <div className="space-y-1">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "hsl(40 30% 96%)" }}
            >
              <span className="text-[14px] font-medium text-foreground">로그아웃</span>
              <ChevronIcon />
            </button>
            <button className="w-full flex items-center px-4 py-3.5 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all">
              <span className="text-[14px] font-medium text-red-400">회원 탈퇴</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirm Sheet */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[480px] rounded-t-3xl bg-background px-5 pt-3 pb-8 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>
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
        </div>
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
