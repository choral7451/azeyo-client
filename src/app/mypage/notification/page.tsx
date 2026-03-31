"use client";

import { useState } from "react";
import Link from "next/link";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const initialSettings: NotificationSetting[] = [
  { id: "schedule", label: "일정 알림", description: "다가오는 일정을 미리 알려드려요", enabled: true },
  { id: "comment", label: "댓글 알림", description: "내 글에 댓글이 달리면 알려드려요", enabled: true },
  { id: "like", label: "좋아요 알림", description: "내 글에 좋아요가 달리면 알려드려요", enabled: true },
  { id: "jokbo", label: "족보 복사 알림", description: "내 족보가 복사되면 알려드려요", enabled: false },
  { id: "community", label: "인기글 알림", description: "커뮤니티 인기글을 알려드려요", enabled: false },
  { id: "marketing", label: "이벤트 / 공지", description: "아재요 소식과 이벤트를 알려드려요", enabled: true },
];

export default function NotificationSettingPage() {
  const [settings, setSettings] = useState(initialSettings);

  function toggle(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

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
        <h1 className="text-[17px] font-bold text-foreground">알림 설정</h1>
      </div>

      {/* Settings List */}
      <div className="px-5 space-y-1 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {settings.map((setting) => (
          <button
            key={setting.id}
            onClick={() => toggle(setting.id)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">
                {setting.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {setting.description}
              </p>
            </div>
            <div
              className="w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 relative"
              style={{
                backgroundColor: setting.enabled
                  ? "hsl(22 60% 42%)"
                  : "hsl(30 10% 82%)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{
                  transform: setting.enabled ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
