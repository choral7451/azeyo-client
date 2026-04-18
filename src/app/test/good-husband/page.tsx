"use client";

import { useState } from "react";

const QUESTIONS = [
  "아내를 잘 웃기고, 수다쟁이처럼 이야기가 많다",
  "아내와 문자보다 전화 통화를 자주한다",
  "아내와 의견 충돌이 생기면 '생각을 좀 해보자'고 말한다",
  "아이와 매우 잘 놀아준다",
  "처가집 애경사를 잘 챙긴다",
  "아내가 시장에서 돌아와 현관문을 여는 순간 즉시 달려가 물건을 받는다",
  "아내와 외출하기 전 30분 이상의 여백 시간을 준비하는 편이다",
  "평소 아내에게 '미안해', '사랑해', '고마워'라고 자주 한다",
  "아내에게 작은 선물(5,000원 이하)을 자주 한다",
  "부부가 각 방이 아니라 항상 함께 잔다",
  "아내가 '입을 옷이 없네'라고 말하면 '조만간 옷 사러 갑시다'라고 말한다",
  "아내가 대화를 시작하면 적극적으로 들어준다",
  "아내와의 대화 시 명령형보다 청유형 표현을 많이 사용한다",
  "아내가 남편의 하루 움직임을 대부분 알고 있다",
  "부부싸움 시 아내를 때리거나 물건을 부수거나 던지지 않는다",
];

const OPTIONS = [
  { label: "확실히 그렇다", score: 5 },
  { label: "그렇다", score: 4 },
  { label: "약간 그렇다", score: 3 },
  { label: "그렇지 않은 편이다", score: 2 },
  { label: "그렇지 않다", score: 1 },
];

interface ResultInfo {
  grade: string;
  emoji: string;
  title: string;
  description: string;
  advice: string;
  color: string;
}

function getResult(score: number): ResultInfo {
  if (score >= 70) {
    return {
      grade: "S",
      emoji: "👑",
      title: "신뢰 돈독한 남편",
      description:
        "당신은 아내가 자랑하고 싶은 남편입니다. 아내의 감정을 잘 읽고, 행동으로 사랑을 표현하는 능력이 뛰어나요. 주변 부부들이 부러워할 만한 관계를 유지하고 있습니다.",
      advice:
        "지금처럼만 하세요. 다만, '잘하고 있다'는 안도감에 소소한 표현을 줄이지 않도록 주의하세요. 꾸준함이 당신의 가장 큰 무기입니다. 가끔 아내에게 \"나 잘하고 있지?\"라고 물어보는 것도 좋아요. 완벽한 남편은 없지만, 노력하는 남편은 있으니까요.",
      color: "from-yellow-400 to-amber-500",
    };
  }
  if (score >= 60) {
    return {
      grade: "A",
      emoji: "💛",
      title: "아내 말에 공감을 잘하는 남편",
      description:
        "공감 능력이 좋은 편이에요. 아내의 이야기에 귀 기울이고, 감정을 이해하려는 노력이 보입니다. 다만, 공감을 '행동'으로 옮기는 부분에서 조금 더 노력하면 금상첨화!",
      advice:
        "듣는 것만으로도 훌륭하지만, 가끔은 아내가 말하기 전에 먼저 움직여보세요. 아내가 피곤해 보이면 \"오늘 내가 설거지할게\" 한마디가 천 마디 공감보다 강력합니다. 말과 행동의 밸런스를 맞추면 S등급도 금방이에요.",
      color: "from-green-400 to-emerald-500",
    };
  }
  if (score >= 50) {
    return {
      grade: "B",
      emoji: "💪",
      title: "자신이 먼저 변화하려는 남편",
      description:
        "변화의 의지가 있다는 것 자체가 대단합니다. 부족한 부분을 인지하고 있고, 더 나은 남편이 되고 싶은 마음이 느껴져요. 이 테스트를 하고 있다는 것 자체가 증거입니다.",
      advice:
        "한꺼번에 다 바꾸려 하지 마세요. 오늘부터 딱 하나만 실천해보세요. 퇴근 후 현관문 열면 \"나 왔어~\" 대신 \"오늘 하루 어땠어?\"로 바꿔보는 거예요. 작은 변화가 쌓이면 아내가 먼저 알아챕니다. 3개월만 꾸준히 해보세요.",
      color: "from-blue-400 to-cyan-500",
    };
  }
  if (score >= 40) {
    return {
      grade: "C",
      emoji: "😥",
      title: "아내와 소통이 부족한 남편",
      description:
        "나쁜 남편은 아니지만, 아내 입장에서는 답답할 수 있어요. '말 안 해도 알겠지'라는 생각이 가장 위험합니다. 아내는 텔레파시가 안 돼요.",
      advice:
        "오늘 당장 아내에게 카톡 하나 보내세요. \"오늘 뭐 먹고 싶어?\"도 좋고, \"좀 이따 전화할게\"도 좋아요. 대화의 물꼬를 트는 게 첫걸음입니다. 그리고 아내가 말할 때 핸드폰을 내려놓으세요. 그것만으로도 50%는 해결됩니다.",
      color: "from-orange-400 to-red-400",
    };
  }
  if (score >= 30) {
    return {
      grade: "D",
      emoji: "🚨",
      title: "아내에게 독박육아 시키는 남편",
      description:
        "솔직히 말하면 위험 신호입니다. 아내가 지금 많이 지쳐있을 가능성이 높아요. 육아와 살림을 혼자 감당하면서 외로움을 느끼고 있을 수 있습니다.",
      advice:
        "지금 바로 일어나서 아내가 뭘 하고 있는지 보세요. 설거지를 하고 있다면 옆에서 그릇을 닦으세요. 아이를 재우고 있다면 \"교대할게\" 한마디 하세요. 아내는 도움이 필요한 게 아니라, '함께하는 사람'이 필요한 겁니다. 오늘이 변화의 시작점이 될 수 있어요.",
      color: "from-red-400 to-rose-500",
    };
  }
  return {
    grade: "F",
    emoji: "💀",
    title: "무늬만 남편, 니 남편 맞아?",
    description:
      "냉정하게 말하면, 지금 상태로는 결혼 생활이 위태로울 수 있습니다. 아내가 아직 곁에 있다면 감사해야 할 상황이에요.",
    advice:
      "이 결과에 화가 났다면, 그 에너지를 아내에게 쓰세요. \"미안해, 내가 많이 부족했지?\" 이 한마디가 시작입니다. 부부 상담도 진지하게 고려해보세요. 부끄러운 게 아니라, 관계를 지키려는 용기입니다. 아내가 떠나기 전에 변하세요. 진심으로요.",
    color: "from-gray-500 to-gray-700",
  };
}

export default function TestPage() {
  const [currentStep, setCurrentStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalScore = answers.reduce((sum, a) => sum + a, 0);
  const result = getResult(totalScore);
  const progress = ((currentQuestion) / QUESTIONS.length) * 100;

  function handleStart() {
    setCurrentStep("quiz");
    setCurrentQuestion(0);
    setAnswers([]);
  }

  function handleSelect(score: number) {
    if (isAnimating) return;
    setSelectedOption(score);
    setIsAnimating(true);

    setTimeout(() => {
      const newAnswers = [...answers, score];
      setAnswers(newAnswers);
      setSelectedOption(null);
      setIsAnimating(false);

      if (currentQuestion + 1 >= QUESTIONS.length) {
        setCurrentStep("result");
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  }

  function handleRetry() {
    setCurrentStep("intro");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
  }

  function handleShare() {
    const text = `[아재요] 좋은 남편 진단 테스트\n\n내 점수: ${totalScore}점 / 75점\n등급: ${result.emoji} ${result.title}\n\n나도 테스트하기 👉 https://azeyo.co.kr/test/good-husband`;
    if (navigator.share) {
      navigator.share({ title: "좋은 남편 진단 테스트", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("결과가 복사되었습니다!");
    }
  }

  // --- Intro ---
  if (currentStep === "intro") {
    return (
      <div className="px-5 pt-8 pb-10 animate-fade-up">
        {/* 대표 이미지 */}
        <div className="rounded-2xl overflow-hidden mb-6 aspect-[4/3] bg-secondary flex items-center justify-center">
          <img
            src="/test/good-husband.png"
            alt="좋은 남편 진단 테스트"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.innerHTML = '<span class="text-6xl">💍</span>';
            }}
          />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: "hsl(35 25% 93%)", color: "hsl(22 60% 42%)" }}>
            아재요 콘텐츠
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
            좋은 남편 진단 테스트
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            15개 질문으로 알아보는<br />나의 남편 점수는?
          </p>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
          <div className="text-center mb-5">
            <span className="text-5xl">💍</span>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold mt-0.5">Q</span>
              <span>총 <strong className="text-foreground">15개</strong> 질문</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold mt-0.5">T</span>
              <span>소요시간 약 <strong className="text-foreground">2~3분</strong></span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold mt-0.5">S</span>
              <span>5점 척도 (확실히 그렇다 ~ 그렇지 않다)</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">등급 안내</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>👑 70점 이상</span><span className="text-foreground font-medium">신뢰 돈독한 남편</span></div>
            <div className="flex justify-between"><span>💛 60~69점</span><span className="text-foreground font-medium">공감을 잘하는 남편</span></div>
            <div className="flex justify-between"><span>💪 50~59점</span><span className="text-foreground font-medium">변화하려는 남편</span></div>
            <div className="flex justify-between"><span>😥 40~49점</span><span className="text-foreground font-medium">소통이 부족한 남편</span></div>
            <div className="flex justify-between"><span>🚨 30~39점</span><span className="text-foreground font-medium">독박육아 시키는 남편</span></div>
            <div className="flex justify-between"><span>💀 30점 미만</span><span className="text-foreground font-medium">무늬만 남편</span></div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl text-base font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          테스트 시작하기
        </button>
      </div>
    );
  }

  // --- Quiz ---
  if (currentStep === "quiz") {
    return (
      <div className="px-5 pt-6 pb-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(35 25% 93%)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: "hsl(22 60% 42%)",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          key={currentQuestion}
          className="animate-fade-up"
        >
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: "hsl(22 60% 42%)" }}
              >
                {currentQuestion + 1}
              </span>
              <p className="text-[15px] font-medium text-foreground leading-relaxed pt-0.5">
                {QUESTIONS[currentQuestion]}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {OPTIONS.map((opt) => (
              <button
                key={opt.score}
                onClick={() => handleSelect(opt.score)}
                disabled={isAnimating}
                className={`
                  w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 active:scale-[0.97]
                  ${
                    selectedOption === opt.score
                      ? "text-primary-foreground"
                      : "text-foreground hover:opacity-80"
                  }
                `}
                style={{
                  backgroundColor:
                    selectedOption === opt.score
                      ? "hsl(22 60% 42%)"
                      : "hsl(35 25% 93%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  <span className="text-xs opacity-60">{opt.score}점</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Result ---
  return (
    <div className="px-5 pt-8 pb-10 animate-fade-up">
      {/* Score Card */}
      <div className={`rounded-2xl p-6 text-center text-white bg-gradient-to-br ${result.color} mb-6`}>
        <div className="text-5xl mb-3">{result.emoji}</div>
        <div className="text-sm font-medium opacity-90 mb-1">내 점수</div>
        <div className="text-4xl font-extrabold mb-1">{totalScore}<span className="text-lg font-normal opacity-80"> / 75점</span></div>
        <div className="text-lg font-bold mt-3">{result.title}</div>
      </div>

      {/* Grade Badge */}
      <div className="flex justify-center mb-6">
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ backgroundColor: "hsl(35 25% 93%)", color: "hsl(22 60% 42%)" }}
        >
          등급: {result.grade}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-2">진단 결과</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.description}
        </p>
      </div>

      {/* Advice */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <span>📝</span> 아재요의 한마디
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.advice}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">문항별 점수</h3>
        <div className="space-y-2">
          {answers.map((score, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(35 25% 90%)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(score / 5) * 100}%`,
                    backgroundColor: score >= 4 ? "hsl(150 20% 55%)" : score >= 3 ? "hsl(40 80% 60%)" : "hsl(0 84% 60%)",
                  }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-5 flex-shrink-0">{score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl text-base font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          결과 공유하기
        </button>
        <button
          onClick={handleRetry}
          className="w-full py-4 rounded-2xl text-base font-semibold active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(35 25% 93%)", color: "hsl(30 10% 45%)" }}
        >
          다시 테스트하기
        </button>
      </div>
    </div>
  );
}
