"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

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
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
      `}
    >
      <div className="mx-auto max-w-[480px] px-5 py-3">
        {children}
      </div>
    </div>
  );
}
