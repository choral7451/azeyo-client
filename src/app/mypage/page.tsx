"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/bottom-sheet";
import { currentUser, getGrade, grades, gradeRules } from "@/data/mock";

export default function MyPage() {
  const [showGradeSheet, setShowGradeSheet] = useState(false);
  const grade = getGrade(currentUser.activityPoints);
  const nextGrade = grades.find((g) => g.level === grade.level + 1);
  const progressToNext = nextGrade
    ? Math.min(
        100,
        Math.round(
          ((currentUser.activityPoints - grade.minPoints) /
            (nextGrade.minPoints - grade.minPoints)) *
            100
        )
      )
    : 100;

  const menuItems = [
    { icon: "📝", label: "내 게시글", href: "/mypage/posts" },
    { icon: "📋", label: "내가 올린 족보", href: "/mypage/jokbo" },
    { icon: "🏅", label: "등급 안내", action: () => setShowGradeSheet(true) },
    { icon: "🔔", label: "알림 설정", href: "/mypage/notification" },
    { icon: "👤", label: "프로필 수정", href: "/mypage/profile" },
    { icon: "⚙️", label: "설정", href: "/mypage/settings" },
  ];

  return (
    <main className="pb-6 px-5">

      {/* Profile Card */}
      <div
        className="rounded-2xl p-5 mb-6 animate-fade-up"
        style={{ backgroundColor: "hsl(36 30% 93%)", animationDelay: "0.05s" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black">
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-foreground">
              {currentUser.name}
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {currentUser.subtitle}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {/* Grade Badge */}
              <button
                onClick={() => setShowGradeSheet(true)}
                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: "hsl(22 60% 42% / 0.12)",
                  color: "hsl(22 60% 42%)",
                }}
              >
                {grade.emoji} {grade.name}
              </button>
              {currentUser.badges.map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Progress */}
        {nextGrade && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: "hsl(30 15% 12% / 0.06)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">
                다음 등급: {nextGrade.emoji} {nextGrade.name}
              </span>
              <span className="text-[11px] font-semibold text-primary">
                {currentUser.activityPoints} / {nextGrade.minPoints}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "게시글", value: String(currentUser.stats.posts) },
          { label: "좋아요", value: String(currentUser.stats.likes) },
          { label: "족보 기여", value: String(currentUser.stats.jokbo) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: "hsl(36 30% 93%)" }}
          >
            <p className="text-[15px] font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-1 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {menuItems.map((item) => {
          const content = (
            <>
              <span className="text-base">{item.icon}</span>
              <span className="text-[14px] font-medium text-foreground">
                {item.label}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="ml-auto opacity-30 text-muted-foreground"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </>
          );
          const className = "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all";

          return "href" in item && item.href ? (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          ) : (
            <button key={item.label} onClick={item.action} className={className}>
              {content}
            </button>
          );
        })}
      </div>

      {/* Grade Info Bottom Sheet */}
      {showGradeSheet && (
        <BottomSheet onClose={() => setShowGradeSheet(false)}>
          <div className="px-5 pb-8">
            <h3 className="text-[17px] font-bold text-foreground mb-1">
              등급 안내
            </h3>
            <p className="text-[12px] text-muted-foreground mb-5">
              활동하면 점수가 쌓이고, 등급이 올라갑니다
            </p>

            {/* Grade List */}
            <div className="space-y-2.5 mb-6">
              {grades.map((g) => {
                const isCurrent = g.level === grade.level;
                return (
                  <div
                    key={g.level}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                      isCurrent ? "ring-1 ring-primary/30" : ""
                    }`}
                    style={{
                      backgroundColor: isCurrent
                        ? "hsl(22 60% 42% / 0.08)"
                        : "hsl(36 30% 93%)",
                    }}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                        {g.name}
                        {isCurrent && (
                          <span className="ml-1.5 text-[10px] font-bold text-primary">현재</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {g.minPoints === 0 ? "시작" : `${g.minPoints}점 이상`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Point Rules */}
            <h4 className="text-[14px] font-bold text-foreground mb-3">
              점수 획득 방법
            </h4>
            <div
              className="rounded-xl px-4 py-3 space-y-2.5"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
            >
              {gradeRules.map((rule) => (
                <div key={rule.action} className="flex items-center justify-between">
                  <span className="text-[12px] text-foreground">{rule.action}</span>
                  <span className="text-[12px] font-bold text-primary">+{rule.points}</span>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </main>
  );
}
