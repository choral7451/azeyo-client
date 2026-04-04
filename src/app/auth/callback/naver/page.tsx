"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";

function NaverCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("네이버 로그인이 취소되었습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!code || !state) {
      setError("인증 코드를 받지 못했습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback/naver`;

    fetch("/api/auth/naver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state, redirectUri }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "로그인에 실패했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.notRegistered) {
          const params = new URLSearchParams({
            snsToken: data.snsToken,
            snsType: data.snsType,
          });
          router.replace(`/signup?${params.toString()}`);
        } else {
          loginWithTokens(data.accessToken, data.refreshToken);
          router.replace("/");
        }
      })
      .catch((err) => {
        setError(err.message || "로그인 중 오류가 발생했습니다.");
        setTimeout(() => router.push("/login"), 3000);
      });
  }, [searchParams, router, loginWithTokens]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8">
      {error ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "hsl(0 60% 95%)" }}>
            <span className="text-2xl">!</span>
          </div>
          <p className="text-[14px] text-muted-foreground">{error}</p>
          <p className="text-[12px] text-muted-foreground mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: "hsl(22 60% 42% / 0.1)" }}>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "hsl(22 60% 42% / 0.3)" }} />
          </div>
          <p className="text-[14px] text-foreground font-medium">로그인 중...</p>
          <p className="text-[12px] text-muted-foreground mt-1">잠시만 기다려주세요</p>
        </div>
      )}
    </main>
  );
}

export default function NaverCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex flex-col items-center justify-center px-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: "hsl(22 60% 42% / 0.1)" }}>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "hsl(22 60% 42% / 0.3)" }} />
            </div>
            <p className="text-[14px] text-foreground font-medium">로그인 중...</p>
          </div>
        </main>
      }
    >
      <NaverCallbackContent />
    </Suspense>
  );
}
