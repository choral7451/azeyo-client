"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getCookie } from "@/lib/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiProfile {
  id: number;
  nickname: string;
  subtitle: string | null;
  iconImageUrl: string | null;
  email: string | null;
  phone: string | null;
}

export default function ProfileEditPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<ApiProfile>("/azeyo/users/me")
      .then((data) => {
        setName(data.nickname);
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setImageUrl(data.iconImageUrl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = getCookie("accessToken");
      const res = await fetch(`${API_BASE}/azeyo/users/upload/profile-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data.item?.url ?? data.url;
      setImageUrl(url);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    try {
      await apiFetch("/azeyo/users/me", {
        method: "PUT",
        body: JSON.stringify({ nickname: name, email: email || null, phone: phone || null }),
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
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt="프로필" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-black">
                {name.charAt(0)}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[12px] text-primary font-medium active:opacity-60 transition-opacity"
          >
            {uploading ? "업로드 중..." : "프로필 사진 변경"}
          </button>
        </div>

        {/* Form */}
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
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">연락처</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={{ backgroundColor: "hsl(36 30% 93%)" }}
              placeholder="010-0000-0000"
            />
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
