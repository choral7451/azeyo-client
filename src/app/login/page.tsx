"use client";

import Image from "next/image";
import Link from "next/link";

function getGoogleOAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  const scope = "openid email profile";
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8">
      {/* Logo & Branding */}
      <Link href="/" className="text-center mb-12 animate-fade-up block active:scale-[0.97] transition-transform" style={{ animationDelay: "0.05s" }}>
        <Image
          src="/AZY.png"
          alt="아재요 로고"
          width={80}
          height={80}
          className="rounded-3xl mx-auto mb-5"
        />
        <h1 className="text-[24px] font-black text-foreground">아재요</h1>
        <p className="text-[14px] text-muted-foreground mt-1.5">
          유부남들의 사랑방
        </p>
      </Link>

      {/* Social Login Buttons */}
      <div className="w-full space-y-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {/* Kakao */}
        {/* <Link
          href="/signup"
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-semibold active:scale-[0.97] transition-all"
          style={{ backgroundColor: "#FEE500", color: "#191919" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.44 2 10.64c0 2.72 1.82 5.1 4.56 6.44-.2.72-.72 2.6-.82 3.01-.13.5.18.5.38.36.16-.1 2.5-1.7 3.52-2.39.76.1 1.56.16 2.36.16 5.52 0 10-3.44 10-7.58C22 6.44 17.52 3 12 3z" />
          </svg>
          카카오로 시작하기
        </Link> */}

        {/* Naver */}
        {/* <Link
          href="/signup"
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
          style={{ backgroundColor: "#03C75A" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M16.27 3H7.73L3 12l4.73 9h8.54L21 12l-4.73-9zM13.2 14.4L10.47 10v4.4H8.4V5.6h2.13L13.2 10V5.6h2.07v8.8H13.2z" />
          </svg>
          네이버로 시작하기
        </Link> */}

        {/* Google */}
        <button
          onClick={() => {
            window.location.href = getGoogleOAuthUrl();
          }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-semibold border active:scale-[0.97] transition-all"
          style={{ backgroundColor: "white", color: "#333", borderColor: "hsl(30 10% 85%)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google로 시작하기
        </button>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted-foreground mt-8 text-center leading-relaxed animate-fade-up" style={{ animationDelay: "0.25s" }}>
        시작하면{" "}
        <span className="underline">이용약관</span> 및{" "}
        <span className="underline">개인정보 처리방침</span>에 동의합니다
      </p>
    </main>
  );
}
