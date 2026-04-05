"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [type, setType] = useState<string>("일반 문의");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const types = ["일반 문의", "버그 신고", "기능 제안", "신고/차단", "기타"];

  function handleSubmit() {
    if (!content.trim()) return;
    // TODO: API 연동
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="pb-6">
        <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <Link
            href="/mypage/settings"
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-[17px] font-bold text-foreground">문의하기</h1>
        </div>

        <div className="px-5 animate-fade-up flex flex-col items-center justify-center py-20" style={{ animationDelay: "0.1s" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "hsl(150 20% 55% / 0.15)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(150 20% 55%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-[17px] font-bold text-foreground mb-2">문의가 접수되었어요</h2>
          <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
            빠른 시일 내에 확인 후 답변드리겠습니다.
            <br />감사합니다!
          </p>
          <Link
            href="/mypage/settings"
            className="mt-8 px-8 py-3 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
            style={{ backgroundColor: "hsl(22 60% 42%)" }}
          >
            돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link
          href="/mypage/settings"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">문의하기</h1>
      </div>

      <div className="px-5 space-y-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {/* Type */}
        <div>
          <label className="text-[13px] font-semibold text-foreground block mb-2">문의 유형</label>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3.5 py-2 rounded-full text-[12px] font-medium transition-all active:scale-95"
                style={
                  type === t
                    ? { backgroundColor: "hsl(22 60% 42%)", color: "#fff" }
                    : { backgroundColor: "hsl(36 30% 93%)", color: "hsl(30 10% 45%)" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-[13px] font-semibold text-foreground block mb-2">문의 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="불편한 점이나 개선사항을 알려주세요. 자세히 작성해주시면 더 빠르게 도움드릴 수 있어요."
            className="w-full h-40 rounded-xl px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ backgroundColor: "hsl(36 30% 93%)" }}
          />
          <p className="text-[11px] text-muted-foreground mt-1 text-right">{content.length}/1000</p>
        </div>

        {/* Email */}
        <div>
          <label className="text-[13px] font-semibold text-foreground block mb-2">
            답변받을 이메일 <span className="text-muted-foreground font-normal">(선택)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full rounded-xl px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ backgroundColor: "hsl(36 30% 93%)" }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          문의 보내기
        </button>
      </div>
    </main>
  );
}
