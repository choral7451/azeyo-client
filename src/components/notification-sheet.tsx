"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/bottom-sheet";
import { apiFetch } from "@/lib/api";

interface ApiNotification {
  id: number;
  type: "LIKE" | "COMMENT" | "SCHEDULE" | "JOKBO_COPY" | "SYSTEM";
  title: string;
  body: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<ApiNotification["type"], { emoji: string; bg: string }> = {
  LIKE: { emoji: "❤️", bg: "hsl(0 70% 95%)" },
  COMMENT: { emoji: "💬", bg: "hsl(210 60% 94%)" },
  SCHEDULE: { emoji: "📅", bg: "hsl(40 60% 93%)" },
  JOKBO_COPY: { emoji: "📋", bg: "hsl(150 40% 93%)" },
  SYSTEM: { emoji: "🎉", bg: "hsl(150 40% 93%)" },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function NotificationSheet({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ notifications: ApiNotification[]; totalCount: number; unreadCount: number }>(
      "/azeyo/notifications?page=1&size=30"
    )
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        // 읽지 않은 알림이 있으면 자동으로 모두 읽음 처리
        if (data.unreadCount > 0) {
          apiFetch("/azeyo/notifications/read-all", { method: "POST" }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function markAllRead() {
    apiFetch("/azeyo/notifications/read-all", { method: "POST" })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        window.dispatchEvent(new CustomEvent("notification:read"));
      })
      .catch(() => {});
  }

  function handleClose() {
    window.dispatchEvent(new CustomEvent("notification:read"));
    onClose();
  }

  return (
    <BottomSheet onClose={handleClose} className="max-h-[85dvh] flex flex-col" hideHeader>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
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
          {loading ? (
            <div className="text-center py-16">
              <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
            </div>
          ) : notifications.length === 0 ? (
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
                    !n.isRead ? "" : "opacity-60"
                  }`}
                  style={!n.isRead ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
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
                      <span className="text-[10px] text-muted-foreground">{formatTime(n.createdAt)}</span>
                      {!n.isRead && (
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
    </BottomSheet>
  );
}
