"use client";

import { useState } from "react";

interface Notification {
  id: string;
  type: "like" | "comment" | "schedule" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "comment",
    title: "새 댓글",
    body: "결혼10년차가 '장모님 선물 추천 좀' 글에 댓글을 남겼어요",
    time: "방금 전",
    read: false,
  },
  {
    id: "n2",
    type: "like",
    title: "좋아요",
    body: "3명이 '부부싸움 후 사과 꿀팁' 글을 좋아합니다",
    time: "10분 전",
    read: false,
  },
  {
    id: "n3",
    type: "schedule",
    title: "일정 알림",
    body: "아내 생일이 3일 남았어요! 선물 준비하셨나요?",
    time: "1시간 전",
    read: false,
  },
  {
    id: "n4",
    type: "system",
    title: "족보 인기",
    body: "내가 올린 '진심 담은 생일 편지'가 좋아요 50개를 달성했어요",
    time: "3시간 전",
    read: true,
  },
  {
    id: "n5",
    type: "comment",
    title: "새 댓글",
    body: "아재킹이 '육아 꿀팁 공유' 글에 댓글을 남겼어요",
    time: "어제",
    read: true,
  },
  {
    id: "n6",
    type: "like",
    title: "좋아요",
    body: "7명이 '결혼기념일 레스토랑 추천' 글을 좋아합니다",
    time: "어제",
    read: true,
  },
];

const typeIcon: Record<Notification["type"], { emoji: string; bg: string }> = {
  like: { emoji: "❤️", bg: "hsl(0 70% 95%)" },
  comment: { emoji: "💬", bg: "hsl(210 60% 94%)" },
  schedule: { emoji: "📅", bg: "hsl(40 60% 93%)" },
  system: { emoji: "🎉", bg: "hsl(150 40% 93%)" },
};

export function NotificationSheet({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-background rounded-t-3xl animate-fade-up shadow-2xl max-h-[85dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-foreground">
              알림
              {unreadCount > 0 && (
                <span className="ml-1.5 text-[12px] font-bold text-primary">{unreadCount}</span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[12px] text-primary font-medium"
                >
                  모두 읽음
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[32px] mb-2">🔔</p>
              <p className="text-[13px] text-muted-foreground">알림이 없어요</p>
            </div>
          ) : (
            notifications.map((n) => {
              const icon = typeIcon[n.type];
              return (
                <div
                  key={n.id}
                  className={`px-5 py-3.5 flex items-start gap-3 transition-colors ${
                    !n.read ? "" : "opacity-60"
                  }`}
                  style={!n.read ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[14px]"
                    style={{ backgroundColor: icon.bg }}
                  >
                    {icon.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-snug mt-0.5">
                      {n.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom safe area */}
        <div className="h-8 flex-shrink-0" />
      </div>
    </div>
  );
}
