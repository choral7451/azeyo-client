"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface ApiProfile {
  id: number;
  nickname: string;
  subtitle: string | null;
  iconImageUrl: string | null;
}

export default function ProfileEditPage() {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiProfile>("/azeyo/users/me")
      .then((data) => {
        setName(data.nickname);
        setSubtitle(data.subtitle ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    try {
      await apiFetch("/azeyo/users/me", {
        method: "PUT",
        body: JSON.stringify({ nickname: name, subtitle: subtitle || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <main className="pb-6">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link href="/mypage" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">프로필 수정</h1>
      </div>

      <div className="px-5 space-y-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-black">
            {name.charAt(0)}
          </div>
          <button className="text-[12px] text-primary font-medium active:opacity-60 transition-opacity">
            프로필 사진 변경
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">닉네임</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
              maxLength={12}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{name.length}/12</p>
          </div>

          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">한줄 소개</label>
            <input
              type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
              placeholder="결혼 N년차 · 아이 N명"
              maxLength={20}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{subtitle.length}/20</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97]"
          style={{ backgroundColor: saved ? "hsl(150 20% 55%)" : "hsl(22 60% 42%)" }}
        >
          {saved ? "저장 완료!" : "저장하기"}
        </button>
      </div>
    </main>
  );
}
