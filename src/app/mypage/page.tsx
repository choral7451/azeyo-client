"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { grades } from "@/data/mock";

function getGradeFromPoints(points: number) {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

interface ApiProfile {
  id: number;
  nickname: string;
  subtitle: string | null;
  iconImageUrl: string | null;
  marriageYear: number;
  children: string;
  activityPoints: number;
  monthlyPoints: number;
  postsCount: number;
  likesCount: number;
  jokboCount: number;
  createdAt: string;
}

export default function MyPage() {
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  useEffect(() => {
    apiFetch<ApiProfile>("/azeyo/users/me")
      .then(setProfile)
      .catch(() => {});
  }, []);

  if (!profile) {
    return (
      <main className="pb-6 px-5">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  const grade = getGradeFromPoints(profile.activityPoints);
  const nextGrade = grades.find((g) => g.level === grade.level + 1);
  const progressToNext = nextGrade
    ? Math.min(100, Math.round(((profile.activityPoints - grade.minPoints) / (nextGrade.minPoints - grade.minPoints)) * 100))
    : 100;

  const menuItems = [
    { icon: "📝", label: "내 게시글", href: "/mypage/posts" },
    { icon: "📋", label: "내가 올린 족보", href: "/mypage/jokbo" },
    { icon: "🏅", label: "등급 안내", href: "/mypage/grade" },
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
          {profile.iconImageUrl ? (
            <img src={profile.iconImageUrl} alt={profile.nickname} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black">
              {profile.nickname.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-foreground">{profile.nickname}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{profile.subtitle ?? ""}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Link
                href="/mypage/grade"
                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all active:scale-95"
                style={{ backgroundColor: "hsl(22 60% 42% / 0.12)", color: "hsl(22 60% 42%)" }}
              >
                {grade.emoji} {grade.name}
              </Link>
            </div>
          </div>
        </div>

        {nextGrade && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: "hsl(30 15% 12% / 0.06)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">
                다음 등급: {nextGrade.emoji} {nextGrade.name}
              </span>
              <span className="text-[11px] font-semibold text-primary">
                {profile.activityPoints} / {nextGrade.minPoints}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "게시글", value: String(profile.postsCount) },
          { label: "좋아요", value: String(profile.likesCount) },
          { label: "족보 기여", value: String(profile.jokboCount) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <p className="text-[15px] font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-1 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-secondary active:scale-[0.98] transition-all"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[14px] font-medium text-foreground">{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-auto opacity-30 text-muted-foreground">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </main>
  );
}
