"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";

type Step = "terms" | "info" | "done";

interface TermItem {
  id: string;
  label: string;
  required: boolean;
}

const terms: TermItem[] = [
  { id: "service", label: "서비스 이용약관 동의", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "age", label: "만 14세 이상 확인", required: true },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithTokens } = useAuth();

  const snsToken = searchParams.get("snsToken") || "";
  const snsType = searchParams.get("snsType") || "";

  const [step, setStep] = useState<Step>("terms");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Terms state
  const [agreed, setAgreed] = useState<Set<string>>(new Set());

  // Info state
  const [nickname, setNickname] = useState("");
  const [marriageYear, setMarriageYear] = useState("");
  const [children, setChildren] = useState("0");

  const allRequired = terms.filter((t) => t.required).every((t) => agreed.has(t.id));
  const allChecked = terms.every((t) => agreed.has(t.id));
  const infoValid = nickname.trim().length >= 2 && marriageYear !== "";

  function toggleTerm(id: string) {
    setAgreed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allChecked) {
      setAgreed(new Set());
    } else {
      setAgreed(new Set(terms.map((t) => t.id)));
    }
  }

  async function handleSignup() {
    if (!snsToken || !snsType) {
      setSubmitError("인증 정보가 없습니다. 다시 로그인해주세요.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiBaseUrl}/azeyo/auths/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          marriageYear: Number(marriageYear),
          children,
          snsToken,
          snsType,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const errorCode = errorBody?.code;

        if (errorCode === "AZEYO-USER-002") {
          setSubmitError("이미 사용 중인 닉네임이에요.");
          setIsSubmitting(false);
          return;
        }

        throw new Error(errorBody?.message || "회원가입에 실패했습니다.");
      }

      const data = await res.json();
      loginWithTokens(data.accessToken, data.refreshToken);
      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-14 pb-8">
      {/* Progress */}
      <div className="flex gap-2 mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {(["terms", "info", "done"] as Step[]).map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                i <= ["terms", "info", "done"].indexOf(step)
                  ? "hsl(22 60% 42%)"
                  : "hsl(30 10% 85%)",
            }}
          />
        ))}
      </div>

      {/* Step: Terms */}
      {step === "terms" && (
        <div className="flex-1 flex flex-col animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-[22px] font-bold text-foreground mb-2">
            약관에 동의해주세요
          </h1>
          <p className="text-[13px] text-muted-foreground mb-8">
            아재요 서비스 이용을 위해 약관 동의가 필요해요
          </p>

          {/* All Agree */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-3 px-4 py-4 rounded-xl mb-3 active:scale-[0.98] transition-all"
            style={{ backgroundColor: "hsl(36 30% 93%)" }}
          >
            <CheckCircle checked={allChecked} />
            <span className="text-[15px] font-bold text-foreground">
              전체 동의하기
            </span>
          </button>

          <div
            className="h-px mb-3"
            style={{ backgroundColor: "hsl(30 15% 12% / 0.06)" }}
          />

          {/* Individual Terms */}
          <div className="space-y-1">
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => toggleTerm(term.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left active:scale-[0.98] transition-all"
              >
                <CheckCircle checked={agreed.has(term.id)} />
                <span className="text-[14px] text-foreground flex-1">
                  {term.required && (
                    <span className="text-primary font-medium">[필수] </span>
                  )}
                  {!term.required && (
                    <span className="text-muted-foreground">[선택] </span>
                  )}
                  {term.label}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-20 text-muted-foreground"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={() => setStep("info")}
              disabled={!allRequired}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
              style={{ backgroundColor: "hsl(22 60% 42%)" }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step: Info */}
      {step === "info" && (
        <div className="flex-1 flex flex-col animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-[22px] font-bold text-foreground mb-2">
            기본 정보를 알려주세요
          </h1>
          <p className="text-[13px] text-muted-foreground mb-8">
            다른 아재들에게 보여질 프로필 정보예요
          </p>

          <div className="space-y-5">
            {/* Nickname */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                닉네임 *
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setSubmitError(null);
                }}
                placeholder="2~12자 닉네임"
                maxLength={12}
                className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              />
              <div className="flex justify-between mt-1">
                {submitError ? (
                  <p className="text-[10px] text-red-500">{submitError}</p>
                ) : (
                  <span />
                )}
                <p className="text-[10px] text-muted-foreground">
                  {nickname.length}/12
                </p>
              </div>
            </div>

            {/* Marriage Year */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                결혼 연도 *
              </label>
              <select
                value={marriageYear}
                onChange={(e) => setMarriageYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              >
                <option value="">선택해주세요</option>
                {Array.from({ length: 30 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}년 (결혼 {2026 - y}년차)
                  </option>
                ))}
              </select>
            </div>

            {/* Children */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                자녀 수
              </label>
              <div className="flex gap-2">
                {["0", "1", "2", "3+"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setChildren(n)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-95 ${
                      children === n
                        ? "bg-primary text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {n === "0" ? "없음" : n === "3+" ? "3명 이상" : `${n}명`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 flex gap-3">
            <button
              onClick={() => setStep("terms")}
              className="flex-shrink-0 px-5 py-3.5 rounded-xl text-[14px] font-medium bg-secondary text-secondary-foreground active:scale-[0.97] transition-all"
            >
              이전
            </button>
            <button
              onClick={handleSignup}
              disabled={!infoValid || isSubmitting}
              className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
              style={{ backgroundColor: "hsl(22 60% 42%)" }}
            >
              {isSubmitting ? "가입 중..." : "가입하기"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "hsl(22 60% 42% / 0.1)" }}
          >
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-[22px] font-bold text-foreground mb-2">
            환영합니다!
          </h1>
          <p className="text-[14px] text-muted-foreground mb-2">
            <span className="font-semibold text-primary">{nickname}</span>님, 가입이 완료되었어요
          </p>
          <p className="text-[13px] text-muted-foreground">
            아재요에서 함께 유부남 라이프를 즐겨보세요
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-10 py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
            style={{ backgroundColor: "hsl(22 60% 42%)" }}
          >
            시작하기
          </button>
        </div>
      )}
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex flex-col items-center justify-center px-8">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
              style={{ backgroundColor: "hsl(22 60% 42% / 0.1)" }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: "hsl(22 60% 42% / 0.3)" }}
              />
            </div>
          </div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: checked ? "hsl(22 60% 42%)" : "hsl(30 10% 85%)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}
