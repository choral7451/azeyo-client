"use client";

import { useRouter } from "next/navigation";

export function MaleOnlyScreen() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8 overflow-hidden">
      <div className="text-center animate-fade-up w-full max-w-[320px]">
        {/* Door illustration */}
        <div className="relative mx-auto mb-8 w-[140px] h-[180px]">
          {/* Door frame */}
          <div
            className="absolute inset-0 rounded-t-[70px] border-[3px]"
            style={{ borderColor: "hsl(22 60% 42% / 0.3)", backgroundColor: "hsl(36 30% 93%)" }}
          />
          {/* Door surface */}
          <div
            className="absolute inset-[3px] rounded-t-[67px] overflow-hidden"
            style={{ backgroundColor: "hsl(22 60% 42% / 0.08)" }}
          >
            {/* Door knob */}
            <div
              className="absolute right-5 top-1/2 w-4 h-4 rounded-full"
              style={{ backgroundColor: "hsl(22 60% 42% / 0.35)" }}
            />
            {/* Sign on door */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[80px]">
              <div
                className="rounded-lg px-2 py-3 text-center"
                style={{ backgroundColor: "hsl(22 60% 42% / 0.12)" }}
              >
                <p className="text-[10px] font-bold leading-tight" style={{ color: "hsl(22 60% 42%)" }}>
                  MEMBERS
                  <br />
                  ONLY
                </p>
              </div>
              {/* Sign nail */}
              <div className="w-1 h-1 rounded-full mx-auto -mt-[2px]" style={{ backgroundColor: "hsl(22 60% 42% / 0.3)" }} />
            </div>
          </div>
          {/* Peek character - eyes peeking from side */}
          <div className="absolute -right-6 top-[55%] animate-peek">
            <div className="flex gap-[6px]">
              <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "hsl(22 60% 42% / 0.6)" }} />
              <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "hsl(22 60% 42% / 0.6)" }} />
            </div>
          </div>
        </div>

        <h1 className="text-[22px] font-bold text-foreground mb-3">
          이 문은 아재들만 열 수 있어요
        </h1>

        <div
          className="rounded-2xl px-5 py-4 mb-4 mx-auto"
          style={{ backgroundColor: "hsl(36 30% 93%)" }}
        >
          <p className="text-[14px] text-foreground font-medium mb-1.5">
            아재요는 기혼 남성 전용 커뮤니티예요
          </p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            남편분이 관심 있으시다면<br />
            남편분 계정으로 가입해주세요
          </p>
        </div>

        <p className="text-[11px] text-muted-foreground mb-8">
          관심 가져주셔서 감사합니다
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
        @keyframes peek {
          0%, 100% { transform: translateX(4px); opacity: 0; }
          30%, 70% { transform: translateX(0); opacity: 1; }
        }
        .animate-peek {
          animation: peek 3s ease-in-out infinite;
          animation-delay: 1s;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
