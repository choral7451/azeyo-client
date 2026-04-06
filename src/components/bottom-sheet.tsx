"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hideHeader?: boolean;
}

export function BottomSheet({ onClose, children, className = "", style, hideHeader }: BottomSheetProps) {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-[480px] rounded-t-3xl bg-background animate-fade-up flex flex-col ${className}`}
        style={{ height: "80dvh", ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Handle + Close */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div className="w-8" />
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all text-muted-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
