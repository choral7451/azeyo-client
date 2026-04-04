"use client";

import { useRouter } from "next/navigation";

export function MaleOnlyScreen() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8 overflow-hidden">
      <div className="text-center animate-fade-up w-full max-w-[320px]">
        {/* Lock illustration */}
        <div className="relative mx-auto mb-8 w-[120px] h-[140px]">
          {/* Lock body */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90px] h-[75px] rounded-2xl"
            style={{ backgroundColor: "hsl(22 60% 42% / 0.15)" }}
          >
            {/* Keyhole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: "hsl(22 60% 42% / 0.4)" }} />
              <div className="w-2.5 h-4 mx-auto -mt-1 rounded-b-sm" style={{ backgroundColor: "hsl(22 60% 42% / 0.4)" }} />
            </div>
          </div>
          {/* Lock shackle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[56px] h-[70px] rounded-t-[28px] border-[6px] border-b-0"
            style={{ borderColor: "hsl(22 60% 42% / 0.3)" }}
          />
          {/* Sparkle */}
          <div className="absolute -right-2 top-4 animate-sparkle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(22 60% 42% / 0.4)">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </div>
        </div>

        <h1 className="text-[22px] font-bold text-foreground mb-3">
          여긴 아재들의 공간이에요
        </h1>

        <div
          className="rounded-2xl px-5 py-4 mb-4 mx-auto"
          style={{ backgroundColor: "hsl(36 30% 93%)" }}
        >
          <p className="text-[14px] text-foreground font-medium mb-1.5">
            남편분을 잡으러 오셨나요?
          </p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            남편분 계정으로 로그인해주세요
          </p>
        </div>

        <p className="text-[11px] text-muted-foreground mb-8">
          아재요는 기혼 남성 전용 커뮤니티입니다
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          돌아가기
        </button>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
