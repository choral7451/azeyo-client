"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { grades, gradeRules } from "@/data/mock";
import { apiFetch } from "@/lib/api";

function getGradeFromPoints(points: number) {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

export default function GradePage() {
  const [activityPoints, setActivityPoints] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ activityPoints: number }>("/azeyo/users/me")
      .then((data) => setActivityPoints(data.activityPoints))
      .catch(() => setActivityPoints(0));
  }, []);

  const grade = getGradeFromPoints(activityPoints ?? 0);

  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link
          href="/mypage"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">등급 안내</h1>
      </div>

      <div className="px-5">
        <p className="text-[12px] text-muted-foreground mb-5 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          활동하면 점수가 쌓이고, 등급이 올라갑니다
        </p>

        {/* Grade List */}
        <div className="space-y-2.5 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {grades.map((g) => {
            const isCurrent = activityPoints !== null && g.level === grade.level;
            return (
              <div
                key={g.level}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isCurrent ? "ring-1 ring-primary/30" : ""
                }`}
                style={{
                  backgroundColor: isCurrent
                    ? "hsl(22 60% 42% / 0.08)"
                    : "hsl(36 30% 93%)",
                }}
              >
                <span className="text-xl">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                    {g.name}
                    {isCurrent && (
                      <span className="ml-1.5 text-[10px] font-bold text-primary">현재</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {g.minPoints === 0 ? "시작" : `${g.minPoints}점 이상`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Point Rules */}
        <h4 className="text-[14px] font-bold text-foreground mb-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          점수 획득 방법
        </h4>
        <div
          className="rounded-xl px-4 py-3 space-y-2.5 animate-fade-up"
          style={{ backgroundColor: "hsl(36 30% 93%)", animationDelay: "0.18s" }}
        >
          {gradeRules.map((rule) => (
            <div key={rule.action} className="flex items-center justify-between">
              <span className="text-[12px] text-foreground">{rule.action}</span>
              <span className="text-[12px] font-bold text-primary">+{rule.points}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
