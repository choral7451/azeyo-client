"use client";

export default function MyPage() {
  return (
    <main className="pt-14 pb-6 px-5">
      <header className="mb-8 animate-fade-up">
        <h1 className="text-[22px] font-black tracking-tight text-[var(--warm-900)]">
          MY
        </h1>
      </header>

      {/* Profile Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-black">
            김
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-[var(--foreground)]">
              김아재
            </h2>
            <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
              결혼 7년차 · 아이 2명
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)] text-white font-medium">
                선물왕
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-medium">
                족보 기여자
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "게시글", value: "12" },
          { label: "좋아요", value: "89" },
          { label: "족보 기여", value: "5" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
          >
            <p className="text-[20px] font-black text-[var(--primary)]">
              {stat.value}
            </p>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-1 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {[
          { icon: "📝", label: "내 게시글" },
          { icon: "❤️", label: "좋아요 한 글" },
          { icon: "📋", label: "내가 올린 족보" },
          { icon: "🔔", label: "알림 설정" },
          { icon: "👤", label: "프로필 수정" },
          { icon: "💍", label: "기념일 정보 수정" },
          { icon: "⚙️", label: "설정" },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-[var(--secondary)] active:scale-[0.98] transition-all"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[14px] font-medium text-[var(--foreground)]">
              {item.label}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="2"
              strokeLinecap="round"
              className="ml-auto opacity-30"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </main>
  );
}
