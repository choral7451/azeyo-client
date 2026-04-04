"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { BottomSheet } from "@/components/bottom-sheet";

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

const ADJECTIVES = [
  "든든한", "다정한", "웃긴", "현명한", "부지런한", "살림잘하는", "요리하는", "로맨틱한",
  "센스있는", "참을성있는", "유쾌한", "따뜻한", "멋진", "성실한", "재치있는", "깔끔한",
  "다정다감한", "인내의", "가정적인", "귀여운", "듬직한", "알뜰한", "배려깊은", "유머있는",
];

const NOUNS = [
  "남편", "아빠", "사위", "아재", "가장", "유부남", "아저씨", "대디",
  "형님", "오빠", "남자", "파파", "달링", "허니", "여보", "킹",
];

function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

const TERMS_CONTENT: Record<string, { title: string; sections: { heading?: string; body: string }[] }> = {
  service: {
    title: "서비스 이용약관",
    sections: [
      {
        heading: "제1조 (목적)",
        body: "이 약관은 아재요(이하 \"회사\")가 제공하는 모바일 웹 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.",
      },
      {
        heading: "제2조 (정의)",
        body: "① \"서비스\"란 회사가 제공하는 커뮤니티, 족보(메시지 템플릿), 일정 관리 등 모든 관련 서비스를 의미합니다.\n② \"이용자\"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원을 말합니다.\n③ \"회원\"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다.\n④ \"게시물\"이란 회원이 서비스 이용 시 게시한 글, 사진, 댓글, 투표 등 일체의 정보를 말합니다.",
      },
      {
        heading: "제3조 (약관의 효력 및 변경)",
        body: "① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.\n② 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 내 공지합니다.\n③ 변경된 약관에 동의하지 않는 회원은 회원 탈퇴(해지)를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한 것으로 간주합니다.",
      },
      {
        heading: "제4조 (회원가입)",
        body: "① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.\n② 회사는 소셜 로그인(카카오, 네이버, 구글)을 통한 회원가입을 지원하며, 소셜 계정 연동 시 해당 플랫폼의 이용약관도 적용됩니다.\n③ 회사는 타인의 명의를 이용한 경우, 허위 정보를 기재한 경우, 기타 서비스 운영에 현저히 지장이 있다고 판단되는 경우 회원가입을 거절하거나 사후에 회원자격을 제한 및 상실시킬 수 있습니다.",
      },
      {
        heading: "제5조 (서비스의 제공 및 변경)",
        body: "① 회사는 다음과 같은 서비스를 제공합니다.\n• 커뮤니티 서비스 (게시글 작성, 댓글, 투표, 좋아요)\n• 족보 서비스 (메시지 템플릿 열람 및 복사)\n• 일정 관리 서비스 (기념일, 일정 등록 및 알림)\n• 선물/행동 추천 서비스\n• 기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스\n② 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 공지합니다.",
      },
      {
        heading: "제6조 (서비스 이용시간)",
        body: "① 서비스의 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.\n② 회사는 정기점검, 시스템 교체, 장애 등의 사유로 서비스의 전부 또는 일부를 일시적으로 중단할 수 있으며, 사전 공지합니다.",
      },
      {
        heading: "제7조 (회원의 의무)",
        body: "회원은 다음 행위를 하여서는 안 됩니다.\n• 타인의 정보 도용\n• 회사가 게시한 정보의 변경\n• 회사 및 제3자의 저작권 등 지적재산권에 대한 침해\n• 회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위\n• 외설 또는 폭력적인 정보를 서비스에 공개 또는 게시하는 행위\n• 영리를 목적으로 서비스를 이용하는 행위\n• 기타 불법적이거나 부당한 행위",
      },
      {
        heading: "제8조 (게시물의 관리)",
        body: "① 회원이 작성한 게시물에 대한 저작권은 해당 회원에게 귀속됩니다.\n② 회사는 다른 회원 또는 제3자를 비방하거나 명예를 훼손하는 내용, 공공질서 및 미풍양속에 위반되는 내용, 범죄적 행위에 결부된다고 인정되는 내용, 저작권 등 기타 권리를 침해하는 내용, 광고성 정보 또는 스팸에 해당하는 내용의 게시물을 사전 통지 없이 삭제하거나 이동 또는 등록을 거부할 수 있습니다.",
      },
      {
        heading: "제9조 (회원 탈퇴 및 자격 상실)",
        body: "① 회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.\n② 회원 탈퇴 시 회원이 작성한 게시글, 댓글, 족보 등의 콘텐츠는 삭제되지 않으며, 닉네임은 \"탈퇴한 회원\"으로 표시됩니다.\n③ 탈퇴 후 동일한 소셜 계정으로 재가입할 수 있으나, 기존 활동 내역 및 포인트는 복구되지 않습니다.",
      },
      {
        heading: "제10조 (면책조항)",
        body: "① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 면합니다.\n② 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.\n③ 회사는 회원이 게시 또는 전송한 자료의 신뢰도, 정확성 등에 대해서는 책임을 지지 않습니다.",
      },
      {
        heading: "제11조 (분쟁 해결)",
        body: "회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며, 서울중앙지방법원을 전속관할법원으로 합니다.",
      },
      { body: "본 약관은 2025년 1월 1일부터 시행합니다." },
    ],
  },
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    sections: [
      {
        body: "아재요(이하 \"회사\")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.",
      },
      {
        heading: "1. 수집하는 개인정보 항목",
        body: "[필수 수집 항목]\n• 소셜 로그인 식별자 (카카오/네이버/구글 고유 ID)\n• 이름\n• 이메일 주소\n• 닉네임\n• 성별\n• 연령대\n• 생일\n• 출생연도\n• 연락처 (휴대전화번호)\n• 결혼 연도\n• 자녀 수\n\n[자동 수집 항목]\n• 서비스 이용 기록 (접속 일시, 이용 기록)\n• 기기 정보 (브라우저 종류, OS 정보)\n• IP 주소",
      },
      {
        heading: "2. 수집 및 이용 목적",
        body: "• 회원 관리: 본인 확인, 개인 식별, 가입 의사 확인, 불량회원의 부정 이용 방지\n• 서비스 제공: 커뮤니티, 족보, 일정 관리 등 서비스 제공, 맞춤형 콘텐츠 추천\n• 서비스 개선: 신규 서비스 개발, 통계 분석, 서비스 품질 향상\n• 알림 서비스: 일정 알림, 커뮤니티 활동 알림 등 서비스 관련 정보 전달",
      },
      {
        heading: "3. 보유 및 이용 기간",
        body: "• 회원 정보: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)\n• 서비스 이용 기록: 3년 (전자상거래법)\n• 접속 로그: 3개월 (통신비밀보호법)",
      },
      {
        heading: "4. 제3자 제공",
        body: "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.",
      },
      {
        heading: "5. 파기 절차 및 방법",
        body: "회원 탈퇴 또는 보유 기간 만료 시 개인정보를 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제합니다.",
      },
      {
        heading: "6. 이용자의 권리",
        body: "이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다. 서비스 내 프로필 수정, 회원 탈퇴 기능을 통해 행사하거나, azeyokorea@gmail.com로 연락하시면 지체 없이 조치하겠습니다.",
      },
      {
        heading: "7. 안전성 확보 조치",
        body: "• 개인정보 암호화 (전송 시 SSL/TLS 적용)\n• 접근 제한 (개인정보 처리 시스템에 대한 접근 권한 관리)\n• 보안 프로그램 설치 및 주기적 갱신\n• 개인정보 취급 직원 최소화 및 교육 실시",
      },
      {
        heading: "8. 개인정보 보호 책임자",
        body: "담당자: 아트인포 운영팀\n이메일: azeyokorea@gmail.com",
      },
      { body: "본 개인정보 처리방침은 2025년 1월 1일부터 시행합니다." },
    ],
  },
  age: {
    title: "만 14세 이상 확인",
    sections: [
      {
        body: "「개인정보 보호법」 제22조에 따라 만 14세 미만 아동의 개인정보 수집 시에는 법정대리인의 동의가 필요합니다.",
      },
      {
        heading: "확인 사항",
        body: "• 아재요 서비스는 만 14세 이상의 이용자만 가입할 수 있습니다.\n• 회원가입 시 본 항목에 동의함으로써 만 14세 이상임을 확인합니다.\n• 만 14세 미만의 아동이 법정대리인의 동의 없이 가입한 사실이 확인될 경우, 회사는 해당 회원의 가입을 취소하고 관련 개인정보를 즉시 파기합니다.",
      },
      {
        heading: "관련 법령",
        body: "• 개인정보 보호법 제22조 (동의를 받는 방법)\n• 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제31조 (법정대리인의 권리)",
      },
    ],
  },
  marketing: {
    title: "마케팅 정보 수신 동의",
    sections: [
      {
        body: "아재요의 다양한 소식과 혜택을 받아보실 수 있습니다. 동의하지 않으셔도 서비스 이용에는 제한이 없습니다.",
      },
      {
        heading: "수신 정보 내용",
        body: "• 신규 기능 및 서비스 업데이트 안내\n• 이벤트, 프로모션 정보\n• 맞춤형 콘텐츠 추천 (족보, 선물 추천 등)\n• 커뮤니티 인기 게시글 알림",
      },
      {
        heading: "수신 방법",
        body: "• 앱 내 푸시 알림\n• 이메일",
      },
      {
        heading: "수신 동의 변경",
        body: "마케팅 정보 수신 동의는 언제든지 서비스 내 [마이페이지 > 알림 설정]에서 변경하실 수 있습니다.",
      },
      {
        heading: "유의사항",
        body: "• 마케팅 정보 수신에 동의하지 않으셔도 서비스 이용에 필요한 필수 알림(계정 관련, 서비스 변경 등)은 정상적으로 발송됩니다.\n• 수신 거부 시 이벤트, 프로모션 등 혜택 관련 정보를 받아보실 수 없습니다.",
      },
    ],
  },
};

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
  const [viewingTerm, setViewingTerm] = useState<string | null>(null);

  // Info state
  const [nickname, setNickname] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    Array.from({ length: 3 }, () => generateNickname())
  );
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
          marketingConsent: agreed.has("marketing"),
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
      const tokens = data.item ?? data;
      loginWithTokens(tokens.accessToken, tokens.refreshToken);
      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-6 pb-8">
      {/* Close Button */}
      <div className="flex justify-end mb-4 animate-fade-up">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all text-muted-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

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
              <div key={term.id} className="flex items-center gap-1">
                <button
                  onClick={() => toggleTerm(term.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left active:scale-[0.98] transition-all flex-1 min-w-0"
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
                </button>
                <button
                  onClick={() => setViewingTerm(term.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/50 active:scale-90 transition-all shrink-0"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-30 text-muted-foreground"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
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
                className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              />
              {nickname.length > 0 && nickname.trim().length < 2 && (
                <p className="text-[11px] text-red-400 mt-1 px-1">
                  2자 이상 입력해주세요
                </p>
              )}

              {/* AI Suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-muted-foreground">추천:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setNickname(s);
                      setSubmitError(null);
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium active:scale-95 transition-all"
                    style={{
                      backgroundColor: "hsl(22 60% 42% / 0.08)",
                      color: "hsl(22 60% 42%)",
                    }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setSuggestions(
                      Array.from({ length: 3 }, () => generateNickname())
                    )
                  }
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary active:scale-90 transition-all"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Marriage Year */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                결혼 여부 *
              </label>
              <select
                value={marriageYear}
                onChange={(e) => setMarriageYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                style={{ backgroundColor: "hsl(36 30% 93%)" }}
              >
                <option value="" disabled>
                  결혼 연도를 선택하세요
                </option>
                <option value="0">미혼 (예비 신랑)</option>
                {Array.from(
                  { length: 50 },
                  (_, i) => new Date().getFullYear() + 1 - i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}년
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
                {["0", "1", "2", "3+"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setChildren(c)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-95"
                    style={
                      children === c
                        ? {
                            backgroundColor: "hsl(22 60% 42%)",
                            color: "#fff",
                          }
                        : {
                            backgroundColor: "hsl(36 30% 93%)",
                            color: "hsl(30 10% 45%)",
                          }
                    }
                  >
                    {c === "0" ? "없음" : c === "3+" ? "3명 이상" : `${c}명`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-[12px] text-red-400 text-center mt-4">{submitError}</p>
          )}

          <div className="mt-auto pt-6 flex gap-3">
            <button
              onClick={() => setStep("terms")}
              className="flex-1 py-3.5 rounded-xl text-[14px] font-medium bg-secondary text-secondary-foreground active:scale-[0.97] transition-all"
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

      {/* Terms Detail Bottom Sheet */}
      {viewingTerm && TERMS_CONTENT[viewingTerm] && (
        <BottomSheet onClose={() => setViewingTerm(null)}>
          <div className="px-5 pb-8">
            <h3 className="text-[17px] font-bold text-foreground mb-5">
              {TERMS_CONTENT[viewingTerm].title}
            </h3>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 text-[13px] leading-relaxed text-foreground/80">
              {TERMS_CONTENT[viewingTerm].sections.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h4 className="text-[14px] font-bold text-foreground mb-1.5">{section.heading}</h4>
                  )}
                  <p className="whitespace-pre-line">{section.body}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (!agreed.has(viewingTerm)) toggleTerm(viewingTerm);
                setViewingTerm(null);
              }}
              className="w-full mt-6 py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.97] transition-all"
              style={{ backgroundColor: "hsl(22 60% 42%)" }}
            >
              {agreed.has(viewingTerm) ? "확인" : "동의하기"}
            </button>
          </div>
        </BottomSheet>
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
