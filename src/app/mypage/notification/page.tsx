"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface NotificationSettings {
  scheduleEnabled: boolean;
  commentEnabled: boolean;
  likeEnabled: boolean;
  jokboCopyEnabled: boolean;
  communityEnabled: boolean;
  marketingEnabled: boolean;
}

const settingItems: { id: keyof NotificationSettings; label: string; description: string }[] = [
  { id: "scheduleEnabled", label: "일정 알림", description: "다가오는 일정을 미리 알려드려요" },
  { id: "commentEnabled", label: "댓글 알림", description: "내 글에 댓글이 달리거나 누군가 나를 언급하면 알려드려요" },
  { id: "likeEnabled", label: "좋아요 알림", description: "내 글에 좋아요가 달리면 알려드려요" },
  { id: "jokboCopyEnabled", label: "족보 복사 알림", description: "내 족보가 복사되면 알려드려요" },
  // { id: "communityEnabled", label: "인기글 알림", description: "커뮤니티 인기글을 알려드려요" },
  // { id: "marketingEnabled", label: "이벤트 / 공지", description: "아재요 소식과 이벤트를 알려드려요" },
];

export default function NotificationSettingPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    apiFetch<NotificationSettings>("/azeyo/notifications/settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  function toggle(id: keyof NotificationSettings) {
    if (!settings) return;
    const newValue = !settings[id];
    setSettings({ ...settings, [id]: newValue });
    apiFetch("/azeyo/notifications/settings", {
      method: "PUT",
      body: JSON.stringify({ [id]: newValue }),
    }).catch(() => {
      setSettings((prev) => prev ? { ...prev, [id]: !newValue } : prev);
    });
  }

  if (!settings) {
    return (
      <main className="pb-6">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
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
        <h1 className="text-[17px] font-bold text-foreground">알림 설정</h1>
      </div>

      <div className="px-5 space-y-1 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {settingItems.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left hover:bg-secondary/50 active:scale-[0.98] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
            </div>
            <div
              className="w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 relative"
              style={{
                backgroundColor: settings[item.id] ? "hsl(22 60% 42%)" : "hsl(30 10% 82%)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{
                  transform: settings[item.id] ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
