"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function MaleOnlyScreen() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8 overflow-hidden">
      <div className="text-center animate-fade-up w-full max-w-[320px]">
        <Image
          src="/signup-restriction.png"
          alt="가입 제한"
          width={200}
          height={200}
          className="mx-auto mb-6"
        />

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

    </main>
  );
}
