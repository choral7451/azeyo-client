"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHeaderExtra } from "./header-context";
import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const WriteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const PAGE_CONFIG: Record<string, { title: string; subtitle?: string; hasCreate: boolean }> = {
  "/": { title: "아재요", subtitle: "유부남들의 사랑방", hasCreate: false },
  "/community": { title: "커뮤니티", subtitle: "형님들의 진솔한 이야기", hasCreate: true },
  "/schedule": { title: "일정 관리", subtitle: "중요한 날을 놓치지 마세요", hasCreate: true },
  "/jokbo": { title: "족보", subtitle: "검증된 문구를 바로 복사하세요", hasCreate: true },
  "/mypage": { title: "MY", hasCreate: false },
};

function emitCreate() {
  window.dispatchEvent(new CustomEvent("header:create"));
}

function HeaderContent({ compact, config, unreadCount, isAdmin, pathname }: { compact: boolean; config: typeof PAGE_CONFIG[string]; unreadCount: number; isAdmin: boolean; pathname: string }) {
  const { title, hasCreate } = config;
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      {hasCreate ? (
        <button
          onClick={emitCreate}
          aria-label="글쓰기"
          className="w-9 h-9 flex items-center justify-center rounded-full text-foreground active:scale-90 transition-transform"
        >
          <WriteIcon />
        </button>
      ) : isAdmin && pathname === "/" ? (
        <button
          onClick={() => router.push("/admin")}
          aria-label="관리자"
          className="w-9 h-9 flex items-center justify-center rounded-full text-foreground active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      ) : (
        <div className="w-9" />
      )}
      <h1 className={`font-black tracking-tight text-foreground leading-none ${
        compact ? "text-[17px]" : "text-[20px]"
      }`}>
        {title}
      </h1>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("header:notify"))}
        aria-label="알림"
        className="w-9 h-9 flex items-center justify-center rounded-full text-foreground active:scale-90 transition-transform relative"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        )}
      </button>
    </div>
  );
}

export function PageHeader() {
  const pathname = usePathname();
  const config = PAGE_CONFIG[pathname] ?? PAGE_CONFIG["/"];
  const { stickyExtra } = useHeaderExtra();
  const { isLoggedIn, isAdmin } = useAuth();

  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }
    apiFetch<{ notifications: unknown[]; totalCount: number; unreadCount: number }>("/azeyo/notifications?page=1&size=1")
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, [isLoggedIn, pathname]);

  // 알림 시트 닫힐 때 갱신
  useEffect(() => {
    const handler = () => {
      if (!isLoggedIn) return;
      apiFetch<{ notifications: unknown[]; totalCount: number; unreadCount: number }>("/azeyo/notifications?page=1&size=1")
        .then((data) => setUnreadCount(data.unreadCount))
        .catch(() => {});
    };
    window.addEventListener("notification:read", handler);
    return () => window.removeEventListener("notification:read", handler);
  }, [isLoggedIn]);

  // 소켓으로 실시간 알림 수신
  useEffect(() => {
    const handler = () => {
      setUnreadCount((prev) => prev + 1);
    };
    window.addEventListener("socket:notification", handler);
    return () => window.removeEventListener("socket:notification", handler);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      const goingUp = currentY < lastScrollY.current;

      if (currentY < 60) {
        setVisible(false);
      } else if (goingUp) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Sticky header (scroll up) */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border
          transition-all duration-300 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
        `}
      >
        <div className="mx-auto max-w-[480px] px-5 py-3">
          <HeaderContent compact config={config} unreadCount={unreadCount} isAdmin={isAdmin} pathname={pathname} />
          {stickyExtra}
        </div>
      </div>

      {/* Static header */}
      <header className="px-5 pt-4 pb-3 animate-fade-up">
        <HeaderContent compact={false} config={config} unreadCount={unreadCount} isAdmin={isAdmin} pathname={pathname} />
        {config.subtitle && (
          <p className="text-[12px] text-muted-foreground mt-1 text-center">
            {config.subtitle}
          </p>
        )}
      </header>
    </>
  );
}
