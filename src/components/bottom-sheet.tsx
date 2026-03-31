"use client";

import { useRef, useCallback, useState } from "react";

interface BottomSheetProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BottomSheet({ onClose, children, className = "", style }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [closing, setClosing] = useState(false);
  const dragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    // Only allow drag from top of scroll or drag handle area
    const scrollTop = sheet.scrollTop;
    if (scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    dragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;

    currentY.current = e.touches[0].clientY;
    const dy = currentY.current - startY.current;

    if (dy > 0) {
      setDragOffset(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;

    if (dragOffset > 100) {
      setClosing(true);
      setTimeout(onClose, 200);
    } else {
      setDragOffset(0);
    }
  }, [dragOffset, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: closing ? 0 : 1 }}
      />
      <div
        ref={sheetRef}
        className={`relative w-full max-w-[480px] rounded-t-3xl bg-background animate-fade-up ${className}`}
        style={{
          ...style,
          transform: `translateY(${closing ? "100%" : `${dragOffset}px`})`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>
        {children}
      </div>
    </div>
  );
}
